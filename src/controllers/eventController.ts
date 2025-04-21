import { Request, Response } from 'express'
import * as EventService from '../services/eventService.js'
import * as CalendarService from '../services/calendarService.js'
import { validateEventInput } from '../utils/validation.js'
import { UserRole } from '@prisma/client'

export const getEventsPerDay = async (req: Request, res: Response): Promise<void> => {
  // Validate that the user is authenticated
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  // Validate that the user is an admin
  if (req.user?.userRole !== UserRole.ADMIN) {
    res.status(403).json({ error: 'Forbidden' })
    return
  }

  try {
    const stats = await EventService.getEventStatsPerDay()
    res.json(stats)
  } catch (err) {
    console.error('Failed to get event stats:', err)
    res.status(500).json({ error: 'Failed to fetch statistics' })
  }
}

export const getAllEvents = async (req: Request, res: Response): Promise<void> => {
  const { start_time, end_time, calendar_id, event_name, limit, offset } = req.query

  // Validate that the user is authenticated
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  // Validate that the user is an admin
  if (req.user?.userRole !== UserRole.ADMIN) {
    res.status(403).json({ error: 'Forbidden' })
    return
  }

  
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

  const pagination = {
    limit: limit ? Number(limit) : 10,
    offset: offset ? Number(offset) : 0,
  }
  
  try {
    const [events, totalCount] = await Promise.all([
      EventService.getAllEvents(filters, pagination),
      EventService.countEvents(filters),
    ])

    res.json({
      data: events,
      pagination: {
        ...pagination,
        totalCount,
      },
    })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch events', details: err })
  }
}

export const getEventById = async (req: Request, res: Response) => {
  // Validate that the user is authenticated
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }


  const event = await EventService.getEventById(Number(req.params.id))
  if (!event) {
    res.status(404).json({ error: 'Event not found' })
    return
  }
  
  // Validate that the user is an admin or user has access to the calendar that the event belongs to
  const calendar = await CalendarService.getCalendarById(Number(event.calendar_id))
  if (!calendar) {
    res.status(404).json({ error: 'Calendar not found' })
    return
  }

  const isUserIncluded = calendar.users.some(user => user.user_id === Number(req.user?.userId))
  const isUserAdmin = req.user?.userRole === UserRole.ADMIN
  if (!isUserIncluded && !isUserAdmin) {
    res.status(403).json({ error: 'Forbidden' })
    return
  }
  
  res.json(event)
}

export const createEvent = async (req: Request, res: Response): Promise<void> => {
  const { event_name, description, start_time, end_time, color, calendar_id, category_id } = req.body
  
  // Validate that the user is authenticated
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  const error = validateEventInput({ event_name, start_time, end_time, calendar_id })
  if (error) {
    res.status(400).json({ error })
    return
  }

  // Validate that user can access the calendar 
  // either user is an admin or user is included in the calendar
  const calendar = await CalendarService.getCalendarById(Number(calendar_id))
  if (!calendar) {
    res.status(404).json({ error: 'Calendar not found' })
    return
  }

  const isUserIncluded = calendar.users.some(user => user.user_id === Number(req.user?.userId))
  const isUserAdmin = req.user?.userRole === UserRole.ADMIN

  if (!isUserIncluded && !isUserAdmin) {
    res.status(403).json({ error: 'Forbidden' })
    return
  }

  // Convert start_time and end_time to UTC
  const startDateUTC = new Date(start_time.toString())
  const endDateUTC = new Date(end_time.toString())

  try {
    // Create the event
    const event = await EventService.createEvent({
      event_name,
      description,
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
    description,
    start_time,
    end_time,
    color,
    calendar_id,
    category_id,
  } = req.body

  // Validate that the user is authenticated
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  const error = validateEventInput({ event_name, start_time, end_time, calendar_id })
  if (error) {
    res.status(400).json({ error })
    return
  }

  // Validate that the user is an admin or user has access to the calendar that the event belongs to
  const event = await EventService.getEventById(Number(id))
  if (!event) {
    res.status(404).json({ error: 'Event not found' })
    return
  }

  const calendar = await CalendarService.getCalendarById(Number(event.calendar_id))
  if (!calendar) {
    res.status(404).json({ error: 'Calendar not found' })
    return
  }

  const isUserIncluded = calendar.users.some(user => user.user_id === Number(req.user?.userId))
  const isUserAdmin = req.user?.userRole === UserRole.ADMIN
  if (!isUserIncluded && !isUserAdmin) {
    res.status(403).json({ error: 'Forbidden' })
    return
  }

  const startDateUTC = new Date(start_time.toString())
  const endDateUTC = new Date(end_time.toString())

  try {
    const updated = await EventService.updateEvent(Number(id), {
      event_name,
      description,
      start_time: startDateUTC,
      end_time: endDateUTC,
      color,
      calendar_id,
      category_id,
    })

    res.json(updated)
  } catch (err) {
    res.status(500).json({ error: 'Failed to update event', details: err })
  }
}

export const deleteEvent = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params

  // Validate that the user is authenticated
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  // Validate that the user is an admin or user has access to the calendar that the event belongs to
  const event = await EventService.getEventById(Number(id))
  if (!event) {
    res.status(404).json({ error: 'Event not found' })
    return
  }

  const calendar = await CalendarService.getCalendarById(Number(event.calendar_id))
  if (!calendar) {
    res.status(404).json({ error: 'Calendar not found' })
    return
  }

  const isUserIncluded = calendar.users.some(user => user.user_id === Number(req.user?.userId))
  const isUserAdmin = req.user?.userRole === UserRole.ADMIN

  if (!isUserIncluded && !isUserAdmin) {
    res.status(403).json({ error: 'Forbidden' })
    return
  }


  try {
    await EventService.deleteEvent(Number(id))
    res.status(204).send()
  } catch (err) {
    res.status(500).json({ error: 'Event not found or already deleted', details: err })
  }
}

