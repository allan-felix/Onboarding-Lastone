const CONFIG = {
  DRIVE_PARENT_FOLDER_ID: "1HUSwYNFGcCItXVrjLGjitKhn28fBUR-V",
  SPREADSHEET_NAME: "Controle de Onboarding Last One",
  ACCESS_FILE_PREFIX: "Acessos - "
};

function doPost(e) {
  try {
    const payload = parsePayload_(e);
    validatePayload_(payload);

    const parentFolder = DriveApp.getFolderById(CONFIG.DRIVE_PARENT_FOLDER_ID);
    const clientFolder = getOrCreateFolder_(parentFolder, sanitizeName_(payload.clientName));
    const accessFolder = getOrCreateFolder_(clientFolder, "Acessos");
    const accessFile = createAccessFile_(accessFolder, payload);
    const spreadsheet = getOrCreateSpreadsheet_(parentFolder);

    appendLog_(spreadsheet, payload, clientFolder, accessFolder, accessFile);

    return jsonResponse_({
      ok: true,
      clientFolderUrl: clientFolder.getUrl(),
      accessFolderUrl: accessFolder.getUrl(),
      accessFileUrl: accessFile.getUrl()
    });
  } catch (error) {
    return jsonResponse_({
      ok: false,
      error: error.message
    });
  }
}

function doGet() {
  return jsonResponse_({
    ok: true,
    app: "Last One Onboarding Drive",
    driveParentFolderId: CONFIG.DRIVE_PARENT_FOLDER_ID,
    message: "Web App ativo. Use o formulario da apresentacao para enviar a coleta de acessos."
  });
}

function parsePayload_(e) {
  if (!e || !e.postData || !e.postData.contents) {
    throw new Error("Nenhum dado recebido.");
  }

  return JSON.parse(e.postData.contents);
}

function validatePayload_(payload) {
  if (!payload.clientName) {
    throw new Error("Nome da farmacia nao recebido.");
  }

  if (!CONFIG.DRIVE_PARENT_FOLDER_ID || CONFIG.DRIVE_PARENT_FOLDER_ID.includes("COLE_AQUI")) {
    throw new Error("Configure o DRIVE_PARENT_FOLDER_ID no Apps Script.");
  }
}

function getOrCreateFolder_(parentFolder, folderName) {
  const folders = parentFolder.getFoldersByName(folderName);
  if (folders.hasNext()) return folders.next();
  return parentFolder.createFolder(folderName);
}

function createAccessFile_(folder, payload) {
  const fileName = CONFIG.ACCESS_FILE_PREFIX + sanitizeName_(payload.clientName);
  const existingFiles = folder.getFilesByName(fileName);
  const content = buildAccessContent_(payload);

  if (existingFiles.hasNext()) {
    const file = existingFiles.next();
    file.setContent(content);
    return file;
  }

  return folder.createFile(fileName, content, MimeType.PLAIN_TEXT);
}

function buildAccessContent_(payload) {
  const accesses = Array.isArray(payload.accesses) ? payload.accesses : [];
  const lines = [
    "LAST ONE | COLETA DE ACESSOS",
    "",
    "CLIENTE",
    "Farmacia: " + safe_(payload.clientName),
    "Cidade / UF: " + safe_(payload.city),
    "Localizacao que atua: " + safe_(payload.serviceArea),
    "Data da reuniao: " + safe_(payload.meetingDate),
    "Data do primeiro raio X: " + safe_(payload.xrayDate),
    "Responsavel da farmacia: " + safe_(payload.ownerName),
    "WhatsApp do responsavel: " + safe_(payload.ownerWhatsapp),
    "Numero que recebe os leads: " + safe_(payload.leadPhone),
    "Responsavel Last One: " + safe_(payload.lastOneOwner),
    "Criado em: " + safe_(payload.createdAt),
    "",
    "OBSERVACOES DA REUNIAO",
    safe_(payload.generalNotes),
    "",
    "ACESSOS",
    ""
  ];

  accesses.forEach((access, index) => {
    lines.push(
      String(index + 1) + ". " + safe_(access.name),
      "Status: " + safe_(access.status),
      "E-mail / ID: " + safe_(access.account),
      "Observacao: " + safe_(access.notes),
      ""
    );
  });

  lines.push(
    "IMPORTANTE",
    "Evite registrar senhas neste arquivo. Priorize convites por e-mail, permissoes de usuario e validacao manual quando necessario."
  );

  return lines.join("\n");
}

function getOrCreateSpreadsheet_(parentFolder) {
  const files = parentFolder.getFilesByName(CONFIG.SPREADSHEET_NAME);
  if (files.hasNext()) return SpreadsheetApp.open(files.next());

  const spreadsheet = SpreadsheetApp.create(CONFIG.SPREADSHEET_NAME);
  const file = DriveApp.getFileById(spreadsheet.getId());
  parentFolder.addFile(file);
  DriveApp.getRootFolder().removeFile(file);

  const sheet = spreadsheet.getActiveSheet();
  sheet.setName("Onboardings");
  sheet.appendRow([
    "Criado em",
    "Cliente",
    "Cidade / UF",
    "Localizacao que atua",
    "Data reuniao",
    "Primeiro raio X",
    "Responsavel farmacia",
    "WhatsApp",
    "Numero leads",
    "Responsavel Last One",
    "Pasta cliente",
    "Pasta acessos",
    "Arquivo acessos",
    "Resumo status"
  ]);
  sheet.setFrozenRows(1);

  return spreadsheet;
}

function appendLog_(spreadsheet, payload, clientFolder, accessFolder, accessFile) {
  const sheet = spreadsheet.getSheetByName("Onboardings") || spreadsheet.getActiveSheet();
  const accesses = Array.isArray(payload.accesses) ? payload.accesses : [];
  const statusSummary = accesses
    .map((access) => safe_(access.name) + ": " + safe_(access.status))
    .join(" | ");

  sheet.appendRow([
    new Date(),
    safe_(payload.clientName),
    safe_(payload.city),
    safe_(payload.serviceArea),
    safe_(payload.meetingDate),
    safe_(payload.xrayDate),
    safe_(payload.ownerName),
    safe_(payload.ownerWhatsapp),
    safe_(payload.leadPhone),
    safe_(payload.lastOneOwner),
    clientFolder.getUrl(),
    accessFolder.getUrl(),
    accessFile.getUrl(),
    statusSummary
  ]);
}

function sanitizeName_(value) {
  return safe_(value)
    .replace(/[\\/:*?"<>|#%{}~&]/g, "-")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120);
}

function safe_(value) {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

function jsonResponse_(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
