import request from 'supertest'
import { describe, it, expect, afterAll, afterEach } from 'vitest'
import express from 'express'
import calendarRoutes from '../../../routes/calendarRoutes.js'
import { prisma } from '../setup.js'
import { AccessLevel } from '@prisma/client'
import { createTestUser } from '../utils/testData.js'

const app = express()
app.use(express.json())
app.use('/api/calendars', calendarRoutes)


describe('Calendar Controller', () => {
  afterEach(async () => {
    await prisma.userCalendar.deleteMany()
    await prisma.calendar.deleteMany()
    await prisma.user.deleteMany()
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  it('should return 200 and empty list of calendars initially', async () => {
    const res = await request(app).get('/api/calendars')
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
  })

  it('should return 400 if calendar_name is missing', async () => {
    const user = await createTestUser()

    const res = await request(app).post('/api/calendars').send({
      users: [{ user_id: user.id, access_level: AccessLevel.owner }]
    })

    expect(res.status).toBe(400)
    expect(res.body.error).toBe('calendar_name is required')
  })

  it('should return 400 if no users are provided', async () => {
    const res = await request(app).post('/api/calendars').send({
      calendar_name: 'Test Calendar',
      users: []
    })

    expect(res.status).toBe(400)
    expect(res.body.error).toBe('At least one user is required')
  })

  it('should return 400 if no owner user is provided', async () => {
    const user = await createTestUser()

    const res = await request(app).post('/api/calendars').send({
      calendar_name: 'Test Calendar',
      users: [{ user_id: user.id, access_level: AccessLevel.member }]
    })

    expect(res.status).toBe(400)
    expect(res.body.error).toBe('At least one user must have the role "owner"')
  })

  it('should return 400 for invalid access_level', async () => {
    const user = await createTestUser()

    const res = await request(app).post('/api/calendars').send({
      calendar_name: 'Test Calendar',
      users: [{ user_id: user.id, access_level: 'not_a_real_role' }]
    })

    expect(res.status).toBe(400)
    expect(res.body.error).toBe('One or more users have an invalid access_level')
  })

  it('should create a calendar with a valid owner user', async () => {
    const user = await createTestUser()

    const res = await request(app).post('/api/calendars').send({
      calendar_name: 'Valid Calendar',
      users: [{ user_id: user.id, access_level: AccessLevel.owner }]
    })

    expect(res.status).toBe(201)
    expect(res.body).toHaveProperty('id')
    expect(res.body.calendar_name).toBe('Valid Calendar')
    expect(Array.isArray(res.body.users)).toBe(true)
  })

  it('should get a calendar by id', async () => {
    const user = await createTestUser()

    const createRes = await request(app).post('/api/calendars').send({
      calendar_name: 'Calendar A',
      users: [{ user_id: user.id, access_level: AccessLevel.owner }]
    })

    const id = createRes.body.id

    const getRes = await request(app).get(`/api/calendars/${id}`)
    expect(getRes.status).toBe(200)
    expect(getRes.body.id).toBe(id)
    expect(getRes.body.calendar_name).toBe('Calendar A')
  })

  it('should return 404 for non-existent calendar', async () => {
    const res = await request(app).get('/api/calendars/99999')
    expect(res.status).toBe(404)
  })

  it('should update a calendar', async () => {
    const user = await createTestUser()

    const createRes = await request(app).post('/api/calendars').send({
      calendar_name: 'Old Name',
      users: [{ user_id: user.id, access_level: AccessLevel.owner }]
    })

    const id = createRes.body.id

    const updateRes = await request(app).put(`/api/calendars/${id}`).send({
      calendar_name: 'Updated Name',
      color: '#000000'
    })

    expect(updateRes.status).toBe(200)
    expect(updateRes.body.calendar_name).toBe('Updated Name')
    expect(updateRes.body.color).toBe('#000000')
  })

  it('should delete a calendar', async () => {
    const user = await createTestUser()

    const createRes = await request(app).post('/api/calendars').send({
      calendar_name: 'To Be Deleted',
      users: [{ user_id: user.id, access_level: AccessLevel.owner }]
    })

    const id = createRes.body.id

    const delRes = await request(app).delete(`/api/calendars/${id}`)
    expect(delRes.status).toBe(204)

    const getRes = await request(app).get(`/api/calendars/${id}`)
    expect(getRes.status).toBe(404)
  })
})