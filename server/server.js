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
  process.env.MONGO_URI ||
  'mongodb+srv://angelrp:abc123.@cluster0.76po7.mongodb.net/?appName=Cluster0'

const mongoClient = new MongoClient(MONGO_URI)
let usuariosCollection

const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, TELEGRAM_TEXT, PORT } = process.env
const SERVER_PORT = Number(PORT) || 3002

// ---- CORS manual (suficiente para Vite) ----
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

// ---- Mongo ----
async function connectMongo() {
  try {
    await mongoClient.connect()
    await mongoClient.db('evol').command({ ping: 1 })

    // ✅ DB: evol / Collection: usuarios
    usuariosCollection = mongoClient.db('evol').collection('usuarios')

    // ✅ índice único para impedir duplicados de nombreUsuario
    await usuariosCollection.createIndex({ nombreUsuario: 1 }, { unique: true })

    console.log('Conectado a mongo OK (db: evol, collection: usuarios)')
  } catch (e) {
    console.error('ERROR conectando a Mongo:', e?.message || e)
  }
}

// ---- Telegram (no crítico) ----
async function sendTelegram(text) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`
  await axios.post(url, {
    chat_id: TELEGRAM_CHAT_ID,
    text: text ?? '',
  })
}

cron.schedule('*/30 * * * *', async () => {
  try {
    if (TELEGRAM_TEXT) await sendTelegram(TELEGRAM_TEXT)
  } catch (e) {
    console.error('Telegram error:', e?.response?.data || e.message)
  }
})

// ---- Registro ----
app.post('/registro', async (req, res) => {
  try {
    const { nombreUsuario, nombre, apellidos, contrasena } = req.body || {}

    if (!nombreUsuario) {
      return res.status(400).json({ ok: false, error: 'El nombreUsuario es obligatorio' })
    }
    if (!contrasena) {
      return res.status(400).json({ ok: false, error: 'La contrasena es obligatoria' })
    }
    if (!usuariosCollection) {
      return res.status(503).json({ ok: false, error: 'Mongo no conectado' })
    }

    // comprobar si ya existe
    const existente = await usuariosCollection.findOne(
      { nombreUsuario },
      { projection: { _id: 1 } }
    )
    if (existente) {
      return res.status(409).json({ ok: false, error: 'Ese usuario ya existe' })
    }

    const result = await usuariosCollection.insertOne({
      nombreUsuario,
      nombre: nombre ?? '',
      apellidos: apellidos ?? '',
      contrasena, // (para clase está OK, pero en real se hashea)
      rol: 'user',
      createdAt: new Date(),
    })

    return res.status(201).json({ ok: true, id: result.insertedId })
  } catch (e) {
    // si chocó con el índice único
    if (e?.code === 11000) {
      return res.status(409).json({ ok: false, error: 'Ese usuario ya existe' })
    }
    return res.status(500).json({ ok: false, error: e.message })
  }
})

// ---- Login ----
app.post('/login', async (req, res) => {
  try {
    const { nombreUsuario, contrasena } = req.body || {}

    if (!nombreUsuario || !contrasena) {
      return res.status(400).json({ ok: false, error: 'Faltan credenciales' })
    }
    if (!usuariosCollection) {
      return res.status(503).json({ ok: false, error: 'Mongo no conectado' })
    }

    const user = await usuariosCollection.findOne({ nombreUsuario })
    if (!user) {
      return res.status(401).json({ ok: false, error: 'Usuario o contraseña incorrectos' })
    }

    if (user.contrasena !== contrasena) {
      return res.status(401).json({ ok: false, error: 'Usuario o contraseña incorrectos' })
    }

    // ✅ devolvemos datos básicos (sin contraseña)
    return res.json({
      ok: true,
      user: {
        id: String(user._id),
        nombreUsuario: user.nombreUsuario,
        rol: user.rol || 'user',
        nombre: user.nombre || '',
        apellidos: user.apellidos || '',
      },
    })
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message })
  }
})

// ---- Debug opcional ----
app.get('/debug/usuarios', async (req, res) => {
  try {
    if (!usuariosCollection) {
      return res.status(503).json({ ok: false, error: 'Mongo no conectado' })
    }

    const count = await usuariosCollection.countDocuments()
    const docs = await usuariosCollection
      .find({}, { projection: { contrasena: 0 } })
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray()

    return res.json({ ok: true, count, docs })
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message })
  }
})

app.get('/health', (_, res) => res.send('ok'))

connectMongo()
app.listen(SERVER_PORT, () => console.log('running on', SERVER_PORT))
