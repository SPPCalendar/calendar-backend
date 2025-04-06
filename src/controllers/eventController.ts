import { Request, Response } from 'express'
import * as EventService from '../services/eventService'

export const getAllEvents = async (_req: Request, res: Response) => {
  const events = await EventService.getAllEvents()
  res.json(events)
}

export const getEventById = async (req: Request, res: Response) => {
  const event = await EventService.getEventById(Number(req.params.id))
  if (!event) {
    res.status(404).json({ error: 'Event not found' })
    return
  }
  res.json(event)
}

export const createEvent = async (req: Request, res: Response) => {
  const { event_name, start_time, end_time, color, calendar_id, category_id } = req.body
  if (!event_name || !start_time || !end_time || !calendar_id) {
    res.status(400).json({ error: 'Missing required fields' })
    return
  }

  try {
    const event = await EventService.createEvent({
      event_name,
      start_time: new Date(start_time),
      end_time: new Date(end_time),
      color,
      calendar_id,
      category_id,
    })
    res.status(201).json(event)
  } catch (err) {
    res.status(500).json({ error: 'Error creating event', details: err })
  }
}

export const updateEvent = async (req: Request, res: Response) => {
  const { id } = req.params
  const {
    event_name,
    start_time,
    end_time,
    color,
    calendar_id,
    category_id,
  } = req.body

  try {
    const updated = await EventService.updateEvent(Number(id), {
      event_name,
      start_time: start_time ? new Date(start_time) : undefined,
      end_time: end_time ? new Date(end_time) : undefined,
      color,
      calendar_id,
      category_id,
    })

    res.json(updated)
  } catch (err) {
    res.status(400).json({ error: 'Failed to update event', details: err })
  }
}

export const deleteEvent = async (req: Request, res: Response) => {
  const { id } = req.params

  try {
    await EventService.deleteEvent(Number(id))
    res.status(204).send()
  } catch (err) {
    res.status(404).json({ error: 'Event not found or already deleted', details: err })
  }
}