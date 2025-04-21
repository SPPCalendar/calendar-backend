import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const getAllEvents = (
  filters: {
    start_time?: Date
    end_time?: Date
    calendar_id?: number
    event_name?: string
  }, 
  pagination : {
    offset?: number
    limit?: number
  } = { offset: 0, limit: 10 }
) => {
  return prisma.event.findMany({
    where: {
      AND: [
        filters.start_time ? { start_time: { gte: filters.start_time } } : {},
        filters.end_time ? { end_time: { lte: filters.end_time } } : {},
        filters.calendar_id ? { calendar_id: filters.calendar_id } : {},
        filters.event_name ? { event_name: { contains: filters.event_name, mode: 'insensitive' } } : {},
      ],
    },
    skip: pagination.offset ?? 0,
    take: pagination.limit ?? 10,
    include: { calendar: true, category: true },
    orderBy: { start_time: 'asc' },
  })
}

export const getEventById = (id: number) => {
  return prisma.event.findUnique({
    where: { id },
    include: { calendar: true, category: true },
  })
}

export const createEvent = (data: {
  event_name: string
  description: string
  start_time: Date
  end_time: Date
  color?: string
  calendar_id: number
  category_id?: number
}) => {
  return prisma.event.create({ data })
}

export const updateEvent = (id: number, data: Partial<Parameters<typeof createEvent>[0]>) => {
  return prisma.event.update({
    where: { id },
    data,
  })
}

export const deleteEvent = (id: number) => {
  return prisma.event.delete({ where: { id } })
}