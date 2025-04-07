import { Request, Response } from 'express'
import * as CalendarService from '../services/calendarService'

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
  const { calendar_name, color } = req.body

  if (!calendar_name) {
    res.status(400).json({ error: 'calendar_name is required' })
    return
  }

  try {
    const newCalendar = await CalendarService.createCalendar({ calendar_name, color })
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
    res.status(404).json({ error: 'Calendar not found or already deleted', details: err })
  }
}