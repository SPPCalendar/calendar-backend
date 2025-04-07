import { PrismaClient } from '../../../generated/prisma'

const prisma = new PrismaClient()

export const createTestCalendar = async (name = 'Test Calendar') => {
  return await prisma.calendar.create({
    data: { 
      calendar_name: name, 
      color: '#abcdef' 
    },
  })
}

export const createTestEvent = async ({
  calendarId,
  event_name = 'Test Event',
}: {
  calendarId: number
  event_name?: string
}) => {
  return await prisma.event.create({
    data: {
      event_name,
      start_time: new Date(),
      end_time: new Date(Date.now() + 60 * 60 * 1000),
      calendar_id: calendarId,
    },
  })
}