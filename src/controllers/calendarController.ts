import { Request, Response } from 'express'
import * as CalendarService from '../services/calendarService.js'
import { AccessLevel, UserRole } from '@prisma/client'
import { getUserByUsername } from '../services/userService.js'

export const getAllCalendars = async (req: Request, res: Response): Promise<void> => {
  // this operation should be allowed only for an admin

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
  
  // Validate that the user is authenticated
  const calendars = await CalendarService.getAllCalendars()
  res.json(calendars)
}

export const getMyCalendars = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  const userId = req.user.userId
  const calendars = await CalendarService.getCalendarsForUser(userId)

  res.json(calendars)
}

export const getCalendarById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params
  const calendar = await CalendarService.getCalendarById(Number(id))
  
  // Validate that the user is authenticated
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  // Validate that the calendar exists
  if (!calendar) {
    res.status(404).json({ error: 'Calendar not found' })
    return
  }

  // Validate that the authenticated user is included in the calendar's users or user is an admin
  const isUserIncluded = calendar.users.some(user => user.user_id === Number(req.user?.userId))
  const isUserAdmin = req.user?.userRole === UserRole.ADMIN
  if (!isUserIncluded && !isUserAdmin) {
    res.status(403).json({ error: 'Forbidden' })
    return
  }

  res.json(calendar)
}

export const createCalendar = async (req: Request, res: Response): Promise<void> => {
  const { calendar_name, color, users } = req.body

  // Validate that the user is authenticated
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

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
    
    const resolvedUsers = await Promise.all(
      users.map(async (u) => {
        const user = await getUserByUsername(u.username)
        if (!user) {
          throw new Error(`User "${u.username}" not found`)
        }

        return {
          user_id: user.id,
          access_level: u.access_level,
        }
      })
    )
    // Create the calendar and add users to it
    const newCalendar = await CalendarService.createCalendarWithUsers(calendar_data, resolvedUsers)
    res.status(201).json(newCalendar)
  } catch (err) {
    console.error('Error creating calendar:', err) // for logs

    const message = err instanceof Error ? err.message : String(err)

    res.status(500).json({
      error: 'Failed to create calendar',
      details: message,
    })
  }
}

export const updateCalendar = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params
  const { calendar_name, color } = req.body

  // Validate that the user is authenticated
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  // Validate that the calendar exists
  const calendar = await CalendarService.getCalendarById(Number(id))
  if (!calendar) {
    res.status(404).json({ error: 'Calendar not found' })
    return
  }

  // Validate that the authenticated user is included in the calendar's users or user is an admin
  const isUserIncluded = calendar.users.some(user => user.user_id === Number(req.user?.userId))
  const isUserAdmin = req.user?.userRole === UserRole.ADMIN
  if (!isUserIncluded && !isUserAdmin) {
    res.status(403).json({ error: 'Forbidden' })
    return
  }

  try {
    const updated = await CalendarService.updateCalendar(Number(id), { calendar_name, color })
    res.json(updated)
  } catch (err) {
    res.status(400).json({ error: 'Failed to update calendar', details: err })
  }
}

export const deleteCalendar = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params

  // Validate that the user is authenticated
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  // Validate that the calendar exists
  const calendar = await CalendarService.getCalendarById(Number(id))
  if (!calendar) {
    res.status(404).json({ error: 'Calendar not found' })
    return
  }

  // Validate that the authenticated user is included in the calendar's users or user is an admin
  const isUserIncluded = calendar.users.some(user => user.user_id === Number(req.user?.userId))
  const isUserAdmin = req.user?.userRole === UserRole.ADMIN
  if (!isUserIncluded && !isUserAdmin) {
    res.status(403).json({ error: 'Forbidden' })
    return
  }


  try {
    await CalendarService.deleteCalendar(Number(id))
    res.status(204).send()
  } catch (err) {
    console.error('Error deleting calendar:', err) // for logs
    res.status(404).json({ error: 'Calendar not found', details: err })
  }
}