import 'dotenv/config'
import express from 'express'
import cron from 'node-cron'
import axios from 'axios'

const app = express()

const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, TELEGRAM_TEXT, PORT } = process.env

async function sendTelegram(text) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`
  await axios.post(url, {
    chat_id: TELEGRAM_CHAT_ID,
    text,
  })
}

cron.schedule('*/30 * * * *', async () => {
  try {
    await sendTelegram(TELEGRAM_TEXT)
    console.log('ENVIADO', new Date().toISOString())
  } catch (e) {
    console.error('Error', e?.response?.data || e.message)
  }
})

app.get('/health', (_, res) => res.send('ok'))
app.listen(PORT || 3001, () => console.log('running'))
