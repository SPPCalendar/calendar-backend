import { PrismaClient, AccessLevel } from '@prisma/client'
import { getUserById, getUserByUsername } from './userService.js'

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

export const updateCalendarUsers = async (
  calendar_id: number,
  updatedUsers: { username: string; access_level: AccessLevel }[]
) => {
  // 1. Fetch current user associations
  const existingUserCalendars = await prisma.userCalendar.findMany({
    where: { calendar_id },
    include: { user: true },
  });

  const existingUserMap = new Map(
    existingUserCalendars.map(uc => [uc.user.username, uc])
  );

  // 2. Fetch all users to get their IDs
  const resolvedUsers = await Promise.all(
    updatedUsers.map(async (u) => {
      const user = await getUserByUsername(u.username);
      if (!user) {
        throw new Error(`User "${u.username}" not found`);
      }
      return {
        user_id: user.id,
        access_level: u.access_level,
        username: u.username,
      };
    })
  );

  const updatedUsernames = new Set(resolvedUsers.map(u => u.username));

  // 3. Add or update users
  for (const user of resolvedUsers) {
    const existing = existingUserMap.get(user.username);
    if (!existing) {
      await addUserToCalendar(user.user_id, calendar_id, user.access_level);
    } else if (existing.access_level !== user.access_level) {
      await prisma.userCalendar.update({
        where: {
          user_id_calendar_id: {
            user_id: existing.user_id,
            calendar_id,
          },
        },
        data: { access_level: user.access_level },
      });
    }
  }

  // 4. Remove users no longer in the list
  for (const existing of existingUserCalendars) {
    if (!updatedUsernames.has(existing.user.username)) {
      await removeUserFromCalendar(existing.user_id, calendar_id);
    }
  }
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
   // Check if all users exist
   const userChecks = await Promise.all(
    users.map(user => getUserById(user.user_id))
  )
  const nonExistentUsers = userChecks
    .map((user, idx) => ({ exists: !!user, id: users[idx].user_id }))
    .filter(u => !u.exists)

  if (nonExistentUsers.length > 0) {
    throw new Error(`The following user id(s) do not exist: ${nonExistentUsers.map(u => u.id).join(', ')}`)
  }

  // Create the calendar
  const calendar = await createCalendar(calendarData)

  const userPromises = users.map(user =>
    addUserToCalendar(user.user_id, calendar.id, user.access_level)
  )

  await Promise.all(userPromises)

  return getCalendarById(calendar.id)
}

export const getCalendarsForUser = (userId: number) => {
  return prisma.calendar.findMany({
    where: {
      users: {
        some: {
          user_id: userId,
        },
      },
    },
    include: {
      users: {
        include: {
          user: {
            select: {
              username: true,
            }
          },
        }
      },
      categories: true,
    },
  })
}