import { objectType, queryType, mutationType, intArg, stringArg, nonNull, arg, extendType } from 'nexus'
import * as EventService from '../../services/eventService.js'

import { subscriptionField } from 'nexus'
import { PubSub } from 'graphql-subscriptions'

const EVENT_CREATED = 'EVENT_CREATED'

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
        if (!ctx.user) throw new Error('Unauthorized')

          const newEvent = await EventService.createEvent({
            ...args,
            start_time: new Date(args.start_time),
            end_time: new Date(args.end_time),
          })
        
          ctx.pubsub.publish(EVENT_CREATED, newEvent)
        
          return newEvent
      },
    })
  },
})

export const EventSubscription = subscriptionField('eventCreated', {
  type: 'Event',
  subscribe: (_, __, ctx) => {
    console.log('subscribed')
    return ctx.pubsub.asyncIterableIterator(EVENT_CREATED)
  },
  resolve: (payload) => {
    return payload
  },
})