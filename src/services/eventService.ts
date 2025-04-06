import { PrismaClient } from '../generated/prisma'

const prisma = new PrismaClient()

export const getAllEvents = () => {
  return prisma.event.findMany({
    include: { calendar: true, category: true },
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