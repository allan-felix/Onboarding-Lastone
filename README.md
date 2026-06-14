# Last One - Onboarding de Cliente

Apresentacao HTML para reuniao de onboarding da Last One.

## Como usar

Abra `index.html` em um navegador ou publique como site estatico.

## Hospedagem na Vercel

Este projeto nao precisa de build.

Configuracao recomendada:

- Framework Preset: `Other`
- Build Command: vazio
- Output Directory: vazio ou `.`

## Formulario de onboarding

O formulario envia os dados para um Google Apps Script configurado no arquivo `index.html`.

Fluxo:

1. Cliente preenche dados durante a call.
2. HTML envia para o webhook do Apps Script.
3. Apps Script cria a pasta do cliente no Google Drive.
4. Apps Script cria a subpasta `Acessos`.
5. Apps Script salva o arquivo de acessos e registra a linha na planilha.

## Arquivos principais

- `index.html`: apresentacao e formulario.
- `assets/`: logos e simbolo da Last One.
- `google-apps-script-onboarding-drive.gs`: codigo do Google Apps Script.
- `COMO-CONFIGURAR-ONBOARDING-DRIVE.md`: guia de configuracao do Drive.
