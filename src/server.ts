import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

import eventRoutes from './routes/eventRoutes'
import calendarRoutes from './routes/calendarRoutes'
import userRoutes from './routes/userRoutes'

dotenv.config()
const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/events', eventRoutes)
app.use('/api/calendars', calendarRoutes)
app.use('/api/users', userRoutes)

const PORT = process.env.PORT || 4000
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`)
})