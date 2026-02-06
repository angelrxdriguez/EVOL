# Cron con Node (Telegram)

![Código del cron](code-snapshot.png)

Este proyecto incluye un **cron** en `server/server.js` (ver `code-snapshot.png`) que envía un mensaje de Telegram **cada 30 minutos**. El flujo es:

- Se cargan variables de entorno con `dotenv`.
- Se define `sendTelegram(text)` para llamar a la API de Telegram con `axios` que lo vi por ahí.
- Se programa el cron con `node-cron` usando la expresión `*/30 * * * *`.
- En cada ejecución se envía `TELEGRAM_TEXT` y se registra en consola.

## Comandos ejecutados

En la carpeta `server` se ejecutaron estos comandos exactamente:

```powershell
\EVOL\server> npm init -y
\EVOL\server> npm i dotenv express node-cron axios
\EVOL\server> npm i cors
\EVOL\server> node .\server.js
```

## Variables de entorno necesarias

En `server/.env` deben existir:

- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`
- `TELEGRAM_TEXT`
- `PORT` (opcional, por defecto `3001`)

## Endpoint de prueba

El servidor expone `GET /health` y responde `ok`.
