import request from 'supertest'
import { describe, it, expect, afterAll, afterEach } from 'vitest'
import express from 'express'
import eventRoutes from '../../../routes/eventRoutes'
import { PrismaClient } from '../../../generated/prisma'
import { createTestCalendar, createTestEvent } from '../utils/testData'

const app = express()
app.use(express.json())
app.use('/api/events', eventRoutes)

const prisma = new PrismaClient()


afterEach(async () => {
  await prisma.event.deleteMany()
  await prisma.calendar.deleteMany()
})

afterAll(async () => {
  await prisma.$disconnect()
})

describe('Event Controller', () => {
  it('should return 200 and empty list of events initially', async () => {
    const res = await request(app).get('/api/events')
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
  })

  it('should return 400 if body is missing on create', async () => {
    const res = await request(app).post('/api/events').send({})
    expect(res.status).toBe(400)
  })

  it('should create a new event', async () => {
    const calendar = await createTestCalendar()
    
    const res = await request(app).post('/api/events').send({
      event_name: 'Test Event',
      start_time: '2025-04-10T10:00:00.000Z',
      end_time: '2025-04-10T11:00:00.000Z',
      calendar_id: calendar.id
    })

    expect(res.status).toBe(201)
    expect(res.body).toHaveProperty('id')
  })

  it('should get created event by id', async () => {
    const calendar = await createTestCalendar()
    const event = await createTestEvent({ calendarId: calendar.id })

    const res = await request(app).get(`/api/events/${event.id}`)
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('event_name', 'Test Event')
  })

  it('should update the event', async () => {
    const calendar = await createTestCalendar()
    const event = await createTestEvent({ calendarId: calendar.id })

    const res = await request(app).put(`/api/events/${event.id}`).send({
      event_name: 'Updated Event'
    })
    expect(res.status).toBe(200)
    expect(res.body.event_name).toBe('Updated Event')
  })

  it('should delete the event', async () => {
    const calendar = await createTestCalendar()
    const event = await createTestEvent({ calendarId: calendar.id })

    const res = await request(app).delete(`/api/events/${event.id}`)
    expect(res.status).toBe(204)
  })

  it('should return 404 for deleted event', async () => {
    const calendar = await createTestCalendar()
    const event = await createTestEvent({ calendarId: calendar.id })
    await request(app).delete(`/api/events/${event.id}`)

    const res = await request(app).get(`/api/events/${event.id}`)
    expect(res.status).toBe(404)
  })
})