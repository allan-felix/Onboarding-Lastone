# Como configurar a coleta de acessos no Drive

## 1. Criar a pasta principal no Drive

Pasta configurada para este projeto:

```txt
https://drive.google.com/drive/folders/1HUSwYNFGcCItXVrjLGjitKhn28fBUR-V
```

ID configurado:

```txt
1HUSwYNFGcCItXVrjLGjitKhn28fBUR-V
```

Conta recomendada para publicar o Apps Script:

```txt
contato@lastonecompany.com.br
```

1. Acesse o Google Drive.
2. Crie uma pasta principal, por exemplo: `Onboardings Last One`.
3. Abra a pasta e copie o ID da URL.

Exemplo:

```txt
https://drive.google.com/drive/folders/1ABCDEF123456XYZ
```

O ID da pasta e:

```txt
1ABCDEF123456XYZ
```

## 2. Criar o Google Apps Script

1. Acesse `https://script.google.com`.
2. Clique em `Novo projeto`.
3. Apague o codigo padrao.
4. Cole o conteudo do arquivo `google-apps-script-onboarding-drive.gs`.
5. Neste projeto o ID da pasta ja esta preenchido no arquivo. Se quiser usar outra pasta no futuro, troque:

```js
DRIVE_PARENT_FOLDER_ID: "COLE_AQUI_O_ID_DA_PASTA_PRINCIPAL_DO_DRIVE"
```

pelo ID real da pasta principal do Drive.

## 3. Publicar como Web App

1. Clique em `Implantar`.
2. Clique em `Nova implantacao`.
3. Selecione o tipo `App da Web`.
4. Configure:
   - Executar como: `Eu`
   - Quem pode acessar: `Qualquer pessoa`
5. Clique em `Implantar`.
6. Autorize as permissoes.
7. Copie a URL do Web App.

## 4. Conectar a apresentacao

URL do Web App configurada neste projeto:

```txt
https://script.google.com/macros/s/AKfycbzHfvrSP-QxkORB_ABH4R578abFLTLq4AUrR8NKcvexQ364FzNZaY0H1Hf44cVHB8K9/exec
```

1. Abra `index.html`.
2. Procure:

```js
const CONFIG = {
  ONBOARDING_WEBHOOK_URL: ""
};
```

3. Cole a URL do Web App:

```js
const CONFIG = {
  ONBOARDING_WEBHOOK_URL: "https://script.google.com/macros/s/SEU_ID/exec"
};
```

Neste projeto essa etapa ja foi feita.

## 5. Como usar na reuniao

1. Abra a apresentacao.
2. Clique em `Coletar acessos`.
3. Preencha os dados do cliente.
4. Marque o status de cada acesso.
5. Clique em `Enviar para o Drive`.

O sistema cria automaticamente:

```txt
Pasta principal escolhida
└── Nome da farmacia
    └── Acessos
        └── Acessos - Nome da farmacia
```

Tambem cria/atualiza a planilha:

```txt
Controle de Onboarding Last One
```

## Erros comuns

1. `Configure a URL do Apps Script`: a URL ainda nao foi colada no `index.html`.
2. Pasta nao criada: o ID da pasta principal esta errado ou o Apps Script nao foi autorizado.
3. Envio nao aparece na hora: atualize o Drive e confira se o Web App foi publicado como `Qualquer pessoa`.
4. Apps Script alterado depois da publicacao: crie uma nova implantacao ou edite a implantacao atual.
5. Evite salvar senhas: use convite por e-mail e registre apenas status, ID da conta e observacoes.
6. `ReferenceError: google is not defined`: o codigo publicado no Apps Script nao e o arquivo `google-apps-script-onboarding-drive.gs`. Apague tudo do arquivo `Codigo.gs`, cole o conteudo completo de `google-apps-script-onboarding-drive.gs`, salve e publique uma nova versao da implantacao.
