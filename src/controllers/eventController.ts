import { Request, Response } from 'express'
import * as EventService from '../services/eventService.js'

export const getAllEvents = async (req: Request, res: Response): Promise<void> => {
  const { start_time, end_time, calendar_id, event_name } = req.query

  const filters: {
    start_time?: Date
    end_time?: Date
    calendar_id?: number
    event_name?: string
  } = {}
  
  // Convert query params to Date objects if they exist
  if (start_time) filters.start_time = new Date(start_time as string)
  if (end_time) filters.end_time = new Date(end_time as string)
  if (calendar_id) filters.calendar_id = Number(calendar_id)
  if (event_name) filters.event_name = event_name.toString()
  
  const events = await EventService.getAllEvents(filters)
  
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

export const createEvent = async (req: Request, res: Response): Promise<void> => {
  const { event_name, start_time, end_time, color, calendar_id, category_id } = req.body
  
  const error = validateEventInput({ event_name, start_time, end_time, calendar_id })
  if (error) {
    res.status(400).json({ error })
    return
  }

  const startDateUTC = new Date(start_time.toString())
  const endDateUTC = new Date(end_time.toString())

  try {
    // Create the event
    const event = await EventService.createEvent({
      event_name,
      start_time: startDateUTC,
      end_time: endDateUTC,
      color,
      calendar_id,
      category_id,
    })
    res.status(201).json(event)
  } catch (err) {
    res.status(500).json({ error: 'Error creating event', details: err })
  }
}

export const updateEvent = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params
  const {
    event_name,
    start_time,
    end_time,
    color,
    calendar_id,
    category_id,
  } = req.body
  
  const error = validateEventInput({ event_name, start_time, end_time, calendar_id })
  if (error) {
    res.status(400).json({ error })
    return
  }

  const startDateUTC = new Date(start_time.toString())
  const endDateUTC = new Date(end_time.toString())

  try {
    const updated = await EventService.updateEvent(Number(id), {
      event_name,
      start_time: startDateUTC,
      end_time: endDateUTC,
      color,
      calendar_id,
      category_id,
    })

    res.json(updated)
  } catch (err) {
    res.status(400).json({ error: 'Failed to update event', details: err })
  }
}

export const deleteEvent = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params

  try {
    await EventService.deleteEvent(Number(id))
    res.status(204).send()
  } catch (err) {
    res.status(404).json({ error: 'Event not found or already deleted', details: err })
  }
}


const validateEventInput = ({
  event_name,
  start_time,
  end_time,
  calendar_id,
}: {
  event_name?: string
  start_time?: string
  end_time?: string
  calendar_id?: number
}) => {
  if (!event_name || !start_time || !end_time || !calendar_id) {
    return 'Missing required fields'
  }

  const startDate = new Date(start_time)
  const endDate = new Date(end_time)

  if (endDate <= startDate) {
    return 'end_time must be later than start_time'
  }

  return null
}