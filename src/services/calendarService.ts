import { PrismaClient, AccessLevel } from '@prisma/client'

const prisma = new PrismaClient()

export const getAllCalendars = () => {
  return prisma.calendar.findMany({
    include: {
      events: true,
      categories: true,
      users: true,
    },
  })
}

export const getCalendarById = (id: number) => {
  return prisma.calendar.findUnique({
    where: { id },
    include: {
      events: true,
      categories: true,
      users: true,
    },
  })
}

export const createCalendar = (data: {
  calendar_name: string
  color?: string
}) => {
  return prisma.calendar.create({ data })
}

export const updateCalendar = (
  id: number,
  data: Partial<Parameters<typeof createCalendar>[0]>
) => {
  return prisma.calendar.update({
    where: { id },
    data,
  })
}

export const deleteCalendar = (id: number) => {
  return prisma.calendar.delete({ where: { id } })
}

export const addUserToCalendar = (
  user_id: number, 
  calendar_id: number, 
  access_level: AccessLevel
) => {
  return prisma.userCalendar.create({
    data: {
      user_id,
      calendar_id,
      access_level,
    },
  })
}

export const removeUserFromCalendar = (user_id: number, calendar_id: number) => {
  return prisma.userCalendar.delete({
    where: {
      user_id_calendar_id: {
        user_id,
        calendar_id,
      },
    },
  })
}

export const createCalendarWithUsers = async (
  calendarData: {
    calendar_name: string
    color?: string
  },
  users: { user_id: number; access_level: AccessLevel }[]
) => {
  const calendar = await createCalendar(calendarData)

  const userPromises = users.map(user =>
    addUserToCalendar(user.user_id, calendar.id, user.access_level)
  )

  await Promise.all(userPromises)

  return getCalendarById(calendar.id)
}