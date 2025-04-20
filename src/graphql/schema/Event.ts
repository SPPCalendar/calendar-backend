import { objectType, queryType, mutationType, intArg, stringArg, nonNull, arg, extendType, list } from 'nexus'
import * as EventService from '../../services/eventService.js'

import { subscriptionField } from 'nexus'
import { validateEventInput } from '../../utils/validation.js'

const EVENT_CREATED = 'EVENT_CREATED'
const EVENT_UPDATED = 'EVENT_UPDATED'
const EVENT_DELETED = 'EVENT_DELETED'

export const Event = objectType({
  name: 'Event',
  definition(t) {
    t.nonNull.int('id')
    t.nonNull.string('event_name')
    t.string('description')
    t.nonNull.string('start_time')
    t.nonNull.string('end_time')
    t.string('color')
    t.nonNull.int('calendar_id')
    t.int('category_id')
  },
})

export const EventQueries = extendType({
  type: 'Query',
  definition(t) {
    t.field('getEventById', {
      type: 'Event',
      args: {
        id: nonNull(intArg()),
      },
      resolve: async (parent, args, context, info) => {    // 4
        const event = await EventService.getEventById(args.id)

        if (!event) throw new Error('Event not found')
        return {
          ...event,
          start_time: event.start_time.toISOString(),
          end_time: event.end_time.toISOString(),
        }
      },
    })
    t.field('getAllEvents', {
      type: nonNull(list(nonNull('Event'))),
      args: {
        start_time: stringArg(),
        end_time: stringArg(),
        calendar_id: intArg(),
        event_name: stringArg(),
      },
      resolve: async (_, args) => {
        const filters: {
          start_time?: Date
          end_time?: Date
          calendar_id?: number
          event_name?: string
        } = {}
    
        if (args.start_time) filters.start_time = new Date(args.start_time)
        if (args.end_time) filters.end_time = new Date(args.end_time)
        if (args.calendar_id) filters.calendar_id = args.calendar_id
        if (args.event_name) filters.event_name = args.event_name
    
        const events = await EventService.getAllEvents(filters)
    
        return events.map((event) => ({
          ...event,
          start_time: event.start_time.toISOString(),
          end_time: event.end_time.toISOString(),
        }))
      },
    })
  },
})

export const EventMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('createEvent', {
      type: 'Event',
      args: {
        event_name: nonNull(stringArg()),
        description: stringArg(),
        start_time: nonNull(stringArg()),
        end_time: nonNull(stringArg()),
        color: stringArg(),
        calendar_id: nonNull(intArg()),
        category_id: intArg(),
      },
      resolve: async (_, args, ctx) => {
        if (!ctx.user) {
          throw new Error('Unauthorized')
        }

        const event = {
          ...args,
          start_time: new Date(args.start_time),
          end_time: new Date(args.end_time),
        }

        const error = validateEventInput(event)
        if (error) {
          throw new Error('Bad Request')
        }

        const newEvent = await EventService.createEvent(event)
      
        ctx.pubsub.publish(EVENT_CREATED, newEvent)
      
        return {
          ...newEvent,
          start_time: newEvent.start_time.toISOString(),
          end_time: newEvent.end_time.toISOString(),
        }
      },
    })
    t.field('updateEvent', {
      type: 'Event',
      args: {
        id: nonNull(intArg()),
        event_name: nonNull(stringArg()),
        description: stringArg(),
        start_time: nonNull(stringArg()),
        end_time: nonNull(stringArg()),
        color: stringArg(),
        calendar_id: nonNull(intArg()),
        category_id: intArg(),
      },
      resolve: async (_, args, ctx) => {
        if (!ctx.user) throw new Error('Unauthorized')
    
        const validationError = validateEventInput({
          event_name: args.event_name,
          start_time: args.start_time,
          end_time: args.end_time,
          calendar_id: args.calendar_id,
        })
    
        if (validationError) {
          throw new Error(validationError)
        }
    
        const newEvent = await EventService.updateEvent(args.id, {
          event_name: args.event_name,
          description: args.description,
          start_time: new Date(args.start_time),
          end_time: new Date(args.end_time),
          color: args.color,
          calendar_id: args.calendar_id,
          category_id: args.category_id,
        })

        ctx.pubsub.publish(EVENT_UPDATED, newEvent)

        return {
          ...newEvent,
          start_time: newEvent.start_time.toISOString(),
          end_time: newEvent.end_time.toISOString(),
        }
      },
    })
    t.field('deleteEvent', {
      type: 'Boolean',
      args: {
        id: nonNull(intArg()),
      },
      resolve: async (_, { id }, ctx) => {
        if (!ctx.user) throw new Error('Unauthorized')
    
        try {
          await EventService.deleteEvent(id)
          ctx.pubsub.publish(EVENT_DELETED, id)
          return true
        } catch {
          return false
        }
      },
    })
  },
})



export const EventSubscription = subscriptionField('eventCreated', {
  type: 'Event',
  subscribe: (_, __, ctx) => {
    return ctx.pubsub.asyncIterableIterator(EVENT_CREATED)
  },
  resolve: (payload) => {
    return payload
  },
})

export const EventUpdateSubscription = subscriptionField('eventUpdated', {
  type: 'Event',
  subscribe: (_, __, ctx) => {
    return ctx.pubsub.asyncIterableIterator(EVENT_UPDATED)
  },
  resolve: (payload) => {
    return payload
  },
})

export const EventDeleteSubscription = subscriptionField('eventDeleted', {
  type: 'Int',
  subscribe: (_, __, ctx) => {
    return ctx.pubsub.asyncIterableIterator(EVENT_DELETED)
  },
  resolve: (payload) => {
    return payload
  },
})