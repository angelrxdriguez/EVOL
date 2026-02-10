import dotenv from 'dotenv'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import express from 'express'
import cron from 'node-cron'
import axios from 'axios'
import { MongoClient } from 'mongodb'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config({ path: path.join(__dirname, '.env') })

const app = express()

const MONGO_URI =
  'mongodb+srv://angelrp:abc123.@cluster0.76po7.mongodb.net/?appName=Cluster0'

const mongoClient = new MongoClient(MONGO_URI)
let usuariosCollection

const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, TELEGRAM_TEXT, PORT } = process.env
const SERVER_PORT = Number(PORT) || 3002

const allowedOrigin = 'http://localhost:5173'
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', allowedOrigin)
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization')
  res.header('Vary', 'Origin')

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204)
  }

  next()
})
app.use(express.json())

async function connectMongo() {
  await mongoClient.connect()
  await mongoClient.db('usuarios').command({ ping: 1 })
  usuariosCollection = mongoClient.db('evol').collection('usuarios')
}

async function sendTelegram(text) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`
  await axios.post(url, {
    chat_id: TELEGRAM_CHAT_ID,
    text: text ?? '',
  })
}

cron.schedule('*/30 * * * *', async () => {
  if (TELEGRAM_TEXT) {
    await sendTelegram(TELEGRAM_TEXT)
  }
})

app.post('/registro', async (req, res) => {
  const { nombreUsuario, nombre, apellidos, contrasena } = req.body || {}

  if (!contrasena) {
    return res.status(400).json({ ok: false, error: 'La contrasena es obligatoria' })
  }

  if (!usuariosCollection) {
    return res.status(503).json({ ok: false, error: 'Mongo no conectado' })
  }

  await usuariosCollection.insertOne({
    nombreUsuario,
    nombre,
    apellidos,
    contrasena,
    createdAt: new Date(),
  })

  return res.status(201).json({ ok: true })
})

app.get('/debug/usuarios', async (req, res) => {
  if (!usuariosCollection) {
    return res.status(503).json({ ok: false, error: 'Mongo no conectado' })
  }

  const count = await usuariosCollection.countDocuments()
  const docs = await usuariosCollection.find({}).sort({ createdAt: -1 }).limit(5).toArray()
  return res.json({ ok: true, count, docs })
})

app.get('/health', (_, res) => res.send('ok'))

connectMongo()

app.listen(SERVER_PORT)
