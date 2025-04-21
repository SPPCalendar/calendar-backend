import {
  objectType,
  extendType,
  nonNull,
  intArg,
  stringArg,
  arg,
  list,
  inputObjectType,
  enumType,
  subscriptionField,
} from 'nexus'
import * as CalendarService from '../../services/calendarService.js'
import * as UserService from '../../services/userService.js'
import { getUserByUsername } from '../../services/userService.js'
import { AccessLevel, UserRole } from '@prisma/client'

import { User } from './User.js'

const CALENDAR_CREATED = 'CALENDAR_CREATED'
const CALENDAR_UPDATED = 'CALENDAR_UPDATED'
const CALENDAR_DELETED = 'CALENDAR_DELETED'

export const Calendar = objectType({
  name: 'Calendar',
  definition(t) {
    t.nonNull.int('id')
    t.nonNull.string('calendar_name')
    t.string('color')
    t.list.field('users', {
      type: 'UserCalendar',
    })
    t.list.field('events', {
      type: 'Event',
    })
  },
})

export const UserCalendar = objectType({
  name: 'UserCalendar',
  definition(t) {
    t.nonNull.int('user_id')
    t.nonNull.int('calendar_id')
    t.nonNull.field('access_level', { type: 'AccessLevel' })
    t.field('user', {
      type: 'User',
      resolve: async (parent, _, ctx) => {
        return await UserService.getUserById(parent.user_id)
      },
    })
  },
})

export const AccessLevelEnum = enumType({
  name: 'AccessLevel',
  members: Object.values(AccessLevel),
})


export const CalendarQueries = extendType({
  type: 'Query',
  definition(t) {
    t.field('getMyCalendars', {
      type: nonNull(list(nonNull('Calendar'))),
      resolve: async (_, __, ctx) => {
        if (!ctx.user) throw new Error('Unauthorized')
        return CalendarService.getCalendarsForUser(ctx.user.userId)
      },
    })

    t.field('getCalendarById', {
      type: 'Calendar',
      args: {
        id: nonNull(intArg()),
      },
      resolve: async (_, { id }, ctx) => {
        if (!ctx.user) throw new Error('Unauthorized')

        const calendar = await CalendarService.getCalendarById(id)
        if (!calendar) throw new Error('Calendar not found')

        const isIncluded = calendar.users.some(
          (user) => user.user_id === ctx.user?.userId
        )
        const isAdmin = ctx.user?.userRole === UserRole.ADMIN

        if (!isIncluded && !isAdmin) throw new Error('Forbidden')

        return calendar
      },
    })

    t.field('getAllCalendars', {
      type: nonNull(list(nonNull('Calendar'))),
      resolve: async (_, __, ctx) => {
        if (!ctx.user) throw new Error('Unauthorized')
        if (ctx.user.userRole !== UserRole.ADMIN) throw new Error('Forbidden')
        return CalendarService.getAllCalendars()
      },
    })
  },
})


const CalendarUserInput = inputObjectType({
  name: 'CalendarUserInput',
  definition(t) {
    t.nonNull.string('username')
    t.nonNull.field('access_level', { type: 'String' }) // enum string
  },
})


export const CalendarMutations = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('createCalendar', {
      type: 'Calendar',
      args: {
        calendar_name: nonNull(stringArg()),
        color: stringArg(),
        users: nonNull(arg({ type: list(nonNull(CalendarUserInput)) })),
      },
      resolve: async (_, { calendar_name, color, users }, ctx) => {
        if (!ctx.user) throw new Error('Unauthorized')

        if (!users.length) throw new Error('At least one user is required')

        const isValidAccessLevel = (value: unknown): value is AccessLevel => {
          return typeof value === 'string' && Object.values(AccessLevel).includes(value as AccessLevel)
        }

        if (!users.every((u) => isValidAccessLevel(u.access_level))) {
          throw new Error('One or more users have an invalid access_level')
        }

        if (!users.some((u) => u.access_level === 'owner')) {
          throw new Error('At least one user must have the role "owner"')
        }

        const resolvedUsers = await Promise.all(
          users.map(async (u) => {
            const user = await getUserByUsername(u.username)
            if (!user) throw new Error(`User "${u.username}" not found`)
            return { user_id: user.id, access_level: u.access_level as AccessLevel }
          })
        )

        const calendar = await CalendarService.createCalendarWithUsers(
          { calendar_name, color },
          resolvedUsers
        )
        if (!calendar) throw new Error('Failed to create calendar');
                
        ctx.pubsub.publish(CALENDAR_CREATED, calendar)

        return calendar
      },
    })

    t.field('updateCalendar', {
      type: 'Calendar',
      args: {
        id: nonNull(intArg()),
        calendar_name: stringArg(),
        color: stringArg(),
      },
      resolve: async (_, { id, calendar_name, color }, ctx) => {
        if (!ctx.user) throw new Error('Unauthorized')

        const calendar = await CalendarService.getCalendarById(id)
        if (!calendar) throw new Error('Calendar not found')

        const isIncluded = calendar.users.some(
          (u) => u.user_id === ctx.user?.userId
        )
        const isAdmin = ctx.user?.userRole === UserRole.ADMIN

        if (!isIncluded && !isAdmin) throw new Error('Forbidden')

        const res = CalendarService.updateCalendar(id, { calendar_name, color })

        ctx.pubsub.publish(CALENDAR_UPDATED, calendar)

        return res
      },
    })

    t.field('deleteCalendar', {
      type: 'Boolean',
      args: {
        id: nonNull(intArg()),
      },
      resolve: async (_, { id }, ctx) => {
        if (!ctx.user) throw new Error('Unauthorized')

        const calendar = await CalendarService.getCalendarById(id)
        if (!calendar) throw new Error('Calendar not found')

        const isIncluded = calendar.users.some(
          (u) => u.user_id === ctx.user?.userId
        )
        const isAdmin = ctx.user?.userRole === UserRole.ADMIN

        if (!isIncluded && !isAdmin) throw new Error('Forbidden')

        await CalendarService.deleteCalendar(id)
        ctx.pubsub.publish(CALENDAR_DELETED, calendar)
        return true
      },
    })
  },
})


export const CalendarCreateSubscription = subscriptionField('calendarCreated', { 
  type: 'Calendar',
  subscribe: (_, __, { pubsub }) => {
    return pubsub.asyncIterableIterator('CALENDAR_CREATED')
  },
  resolve: (payload) => {
    return payload
  },
})

export const CalendarUpdateSubscription = subscriptionField('calendarUpdated', {
  type: 'Calendar',
  subscribe: (_, __, { pubsub }) => {
    return pubsub.asyncIterableIterator('CALENDAR_UPDATED')
  },
  resolve: (payload) => {
    return payload
  },
})

export const CalendarDeleteSubscription = subscriptionField('calendarDeleted', {
  type: 'Calendar',
  subscribe: (_, __, { pubsub }) => {
    return pubsub.asyncIterableIterator('CALENDAR_DELETED')
  },
  resolve: (payload) => {
    return payload
  },
})