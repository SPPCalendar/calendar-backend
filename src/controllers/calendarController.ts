import { Request, Response } from 'express'
import * as CalendarService from '../services/calendarService'
import { AccessLevel } from '../generated/prisma'

export const getAllCalendars = async (_req: Request, res: Response): Promise<void> => {
  const calendars = await CalendarService.getAllCalendars()
  res.json(calendars)
}

export const getCalendarById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params
  const calendar = await CalendarService.getCalendarById(Number(id))

  if (!calendar) {
    res.status(404).json({ error: 'Calendar not found' })
    return
  }

  res.json(calendar)
}

export const createCalendar = async (req: Request, res: Response): Promise<void> => {
  const { calendar_name, color, users } = req.body

  // Validate that the calendar has a name
  if (!calendar_name) {
    res.status(400).json({ error: 'calendar_name is required' })
    return
  }

  // Validate that the calendar has at least one user
  if (!Array.isArray(users) || users.length === 0) {
    res.status(400).json({ error: 'At least one user is required' })
    return
  }

  // Validate that all access levels are valid
  const isValidAccessLevel = (value: unknown): value is AccessLevel => {
    return typeof value === 'string' && Object.values(AccessLevel).includes(value as AccessLevel)
  }
  
  const allAccessLevelsValid = users.every(u => isValidAccessLevel(u.access_level))

  if (!allAccessLevelsValid) {
    res.status(400).json({ error: 'One or more users have an invalid access_level' })
    return
  }

  // Validate that the calendar has at least one owner
  const hasOwner = users.some(u => u.access_level === AccessLevel.owner)

  if (!hasOwner) {
    res.status(400).json({ error: 'At least one user must have the role "owner"' })
    return
  }

  try {
    const calendar_data = { calendar_name, color }
    // Create the calendar and add users to it
    const newCalendar = await CalendarService.createCalendarWithUsers(calendar_data, users)
    res.status(201).json(newCalendar)
  } catch (err) {
    res.status(500).json({ error: 'Failed to create calendar', details: err })
  }
}

export const updateCalendar = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params
  const { calendar_name, color } = req.body

  try {
    const updated = await CalendarService.updateCalendar(Number(id), { calendar_name, color })
    res.json(updated)
  } catch (err) {
    res.status(400).json({ error: 'Failed to update calendar', details: err })
  }
}

export const deleteCalendar = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params

  try {
    await CalendarService.deleteCalendar(Number(id))
    res.status(204).send()
  } catch (err) {
    res.status(404).json({ error: 'Calendar not found', details: err })
  }
}