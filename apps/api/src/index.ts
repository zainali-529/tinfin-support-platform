import express from 'express'
import cors from 'cors'
import helmet from 'helmet'

const app = express()
const PORT = process.env.PORT || 3001

app.use(helmet())
app.use(cors({
  origin: process.env.WEB_URL || 'http://localhost:3000',
  credentials: true,
}))
app.use(express.json())

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'tinfin-api', timestamp: new Date().toISOString() })
})

app.listen(PORT, () => {
  console.log(`🚀 API running on http://localhost:${PORT}`)
})