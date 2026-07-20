const CONFIG = {
  DRIVE_PARENT_FOLDER_ID: "1HUSwYNFGcCItXVrjLGjitKhn28fBUR-V",
  SPREADSHEET_NAME: "Controle de Onboarding Last One",
  INFO_FILE_PREFIX: "Informacoes - "
};

function doPost(e) {
  try {
    const payload = parsePayload_(e);
    validatePayload_(payload);

    const parentFolder = DriveApp.getFolderById(CONFIG.DRIVE_PARENT_FOLDER_ID);
    const clientFolder = getOrCreateFolder_(parentFolder, sanitizeName_(payload.clientName));
    const infoFolder = getOrCreateFolder_(clientFolder, "Informacoes");
    const infoFile = createInfoDocument_(infoFolder, payload);
    const spreadsheet = getOrCreateSpreadsheet_(parentFolder);

    appendLog_(spreadsheet, payload, clientFolder, infoFolder, infoFile);

    return jsonResponse_({
      ok: true,
      clientFolderUrl: clientFolder.getUrl(),
      infoFolderUrl: infoFolder.getUrl(),
      infoFileUrl: infoFile.getUrl()
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
    message: "Web App ativo. Use o formulario da apresentacao para enviar a coleta de informacoes."
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

function createInfoDocument_(folder, payload) {
  const fileName = CONFIG.INFO_FILE_PREFIX + sanitizeName_(payload.clientName);
  const existingFiles = folder.getFilesByName(fileName);
  let doc;

  if (existingFiles.hasNext()) {
    const file = existingFiles.next();
    doc = DocumentApp.openById(file.getId());
    doc.getBody().clear();
  } else {
    doc = DocumentApp.create(fileName);
    const file = DriveApp.getFileById(doc.getId());
    folder.addFile(file);
    DriveApp.getRootFolder().removeFile(file);
  }

  buildInfoDocument_(doc, payload);
  doc.saveAndClose();

  return DriveApp.getFileById(doc.getId());
}

function buildInfoDocument_(doc, payload) {
  const lpAnswers = payload.lpAnswers || {};
  const body = doc.getBody();
  body.setMarginTop(36).setMarginBottom(36).setMarginLeft(42).setMarginRight(42);

  addTitle_(body, "LAST ONE");
  addSubtitle_(body, "Coleta de informacoes para onboarding e Landing Page");
  addDivider_(body);

  addSection_(body, "Cliente", [
    ["Farmacia", payload.clientName],
    ["Cidade / UF", payload.city],
    ["Localizacao que atua", payload.serviceArea],
    ["Data da reuniao", payload.meetingDate],
    ["Data do primeiro raio X", payload.xrayDate],
    ["Responsavel da farmacia", payload.ownerName],
    ["WhatsApp do responsavel", payload.ownerWhatsapp],
    ["Numero que recebe os leads", payload.leadPhone],
    ["Responsavel Last One", payload.lastOneOwner]
  ]);

  addSection_(body, "Landing Page", [
    ["Manipulacao veterinaria", lpAnswers.veterinaryManipulation],
    ["Homeopatia", lpAnswers.homeopathy],
    ["Injetaveis e colirios", lpAnswers.injectablesEyeDrops],
    ["Desconto autorizado na LP", lpAnswers.lpDiscount],
    ["Horario de atendimento", lpAnswers.businessHours],
    ["Habitantes na cidade", lpAnswers.cityPopulation],
    ["Entrega no mesmo dia para cidades ao redor", lpAnswers.sameDayDeliveryNearby],
    ["Cidades ao redor atendidas", lpAnswers.nearbyCities]
  ]);

  addNotes_(body, "Observacoes da reuniao", payload.generalNotesRaw || payload.generalNotes);

  const footer = body.appendParagraph("Documento gerado automaticamente pela apresentacao de onboarding da Last One.");
  footer.editAsText()
    .setForegroundColor("#777777")
    .setFontSize(9);
  footer.setSpacingBefore(18);
}

function addTitle_(body, text) {
  const paragraph = body.appendParagraph(text);
  paragraph.editAsText()
    .setBold(true)
    .setForegroundColor("#72FF00")
    .setFontSize(22);
  paragraph.setSpacingAfter(2);
}

function addSubtitle_(body, text) {
  const paragraph = body.appendParagraph(text);
  paragraph.editAsText()
    .setBold(true)
    .setForegroundColor("#111111")
    .setFontSize(16);
  paragraph.setSpacingAfter(12);
}

function addDivider_(body) {
  body.appendHorizontalRule();
  body.appendParagraph("");
}

function addSection_(body, title, rows) {
  const heading = body.appendParagraph(title);
  heading.editAsText()
    .setBold(true)
    .setForegroundColor("#72FF00")
    .setFontSize(14);
  heading.setSpacingBefore(12).setSpacingAfter(6);

  const table = body.appendTable(rows.map((row) => [safe_(row[0]), safeDisplay_(row[1])]));
  table.setBorderColor("#D9D9D9");

  for (let rowIndex = 0; rowIndex < table.getNumRows(); rowIndex++) {
    const row = table.getRow(rowIndex);
    row.getCell(0).setBackgroundColor("#111111");
    row.getCell(1).setBackgroundColor("#F7F7F7");
    styleCell_(row.getCell(0), "#FFFFFF", true);
    styleCell_(row.getCell(1), "#111111", false);
  }
}

function addNotes_(body, title, notes) {
  const heading = body.appendParagraph(title);
  heading.editAsText()
    .setBold(true)
    .setForegroundColor("#72FF00")
    .setFontSize(14);
  heading.setSpacingBefore(12).setSpacingAfter(6);

  const paragraph = body.appendParagraph(safeDisplay_(notes));
  paragraph.editAsText()
    .setBackgroundColor("#F7F7F7")
    .setForegroundColor("#111111")
    .setFontSize(11);
  paragraph.setSpacingAfter(10);
}

function styleCell_(cell, color, bold) {
  const text = cell.editAsText();
  text.setForegroundColor(color);
  text.setFontSize(10);
  text.setBold(bold);
}

function getOrCreateSpreadsheet_(parentFolder) {
  const files = parentFolder.getFilesByName(CONFIG.SPREADSHEET_NAME);
  if (files.hasNext()) {
    const spreadsheet = SpreadsheetApp.open(files.next());
    ensureSpreadsheetHeaders_(spreadsheet);
    return spreadsheet;
  }

  const spreadsheet = SpreadsheetApp.create(CONFIG.SPREADSHEET_NAME);
  const file = DriveApp.getFileById(spreadsheet.getId());
  parentFolder.addFile(file);
  DriveApp.getRootFolder().removeFile(file);

  const sheet = spreadsheet.getActiveSheet();
  sheet.setName("Onboardings");
  ensureSpreadsheetHeaders_(spreadsheet);

  return spreadsheet;
}

function ensureSpreadsheetHeaders_(spreadsheet) {
  const sheet = spreadsheet.getSheetByName("Onboardings") || spreadsheet.getActiveSheet();
  const headers = [
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
    "Manipulacao veterinaria",
    "Homeopatia",
    "Injetaveis e colirios",
    "Desconto LP",
    "Horario atendimento",
    "Habitantes",
    "Entrega mesmo dia cidades ao redor",
    "Cidades ao redor",
    "Pasta cliente",
    "Pasta informacoes",
    "Documento informacoes"
  ];

  if (sheet.getName() !== "Onboardings") sheet.setName("Onboardings");
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.setFrozenRows(1);
}

function appendLog_(spreadsheet, payload, clientFolder, infoFolder, infoFile) {
  const sheet = spreadsheet.getSheetByName("Onboardings") || spreadsheet.getActiveSheet();
  const lpAnswers = payload.lpAnswers || {};

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
    safe_(lpAnswers.veterinaryManipulation),
    safe_(lpAnswers.homeopathy),
    safe_(lpAnswers.injectablesEyeDrops),
    safe_(lpAnswers.lpDiscount),
    safe_(lpAnswers.businessHours),
    safe_(lpAnswers.cityPopulation),
    safe_(lpAnswers.sameDayDeliveryNearby),
    safe_(lpAnswers.nearbyCities),
    clientFolder.getUrl(),
    infoFolder.getUrl(),
    infoFile.getUrl()
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

function safeDisplay_(value) {
  const clean = safe_(value);
  return clean || "-";
}

function jsonResponse_(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
