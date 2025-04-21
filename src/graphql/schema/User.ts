import {
  objectType,
  extendType,
  nonNull,
  intArg,
  stringArg,
  arg,
  enumType,
  list,
} from 'nexus'
import { UserRole } from '@prisma/client'
import * as UserService from '../../services/userService.js'


export const User = objectType({
  name: 'User',
  definition(t) {
    t.nonNull.int('id')
    t.nonNull.string('display_name')
    t.nonNull.string('username')
    t.nonNull.string('email')
    t.nonNull.boolean('email_confirmed')
    t.nonNull.field('role', { type: 'UserRole' })
  },
})

export const UserRoleEnum = enumType({
  name: 'UserRole',
  members: Object.values(UserRole),
})


export const UserQueries = extendType({
  type: 'Query',
  definition(t) {
    t.field('getAllUsers', {
      type: nonNull(list(nonNull('User'))),
      resolve: async (_, __, ctx) => {
        if (!ctx.user) throw new Error('Unauthorized')
        if (ctx.user.userRole !== 'ADMIN') throw new Error('Forbidden')
        return UserService.getAllUsers()
      },
    })

    t.field('getUserById', {
      type: 'User',
      args: {
        id: nonNull(intArg()),
      },
      resolve: async (_, { id }, ctx) => {
        if (!ctx.user) throw new Error('Unauthorized')
        const isSelf = ctx.user.userId === id
        const isAdmin = ctx.user.userRole === 'ADMIN'
        if (!isSelf && !isAdmin) throw new Error('Forbidden')

        const user = await UserService.getUserById(id)
        if (!user) throw new Error('User not found')
        return user
      },
    })
  },
})


export const UserMutations = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('updateUser', {
      type: 'User',
      args: {
        id: nonNull(intArg()),
        display_name: stringArg(),
        email: stringArg(),
        username: stringArg(),
        email_confirmed: arg({ type: 'Boolean' }),
      },
      resolve: async (_, { id, ...data }, ctx) => {
        if (!ctx.user) throw new Error('Unauthorized')
        const isSelf = ctx.user.userId === id
        const isAdmin = ctx.user.userRole === 'ADMIN'
        if (!isSelf && !isAdmin) throw new Error('Forbidden')

        return UserService.updateUser(id, data)
      },
    })

    t.field('deleteUser', {
      type: 'Boolean',
      args: {
        id: nonNull(intArg()),
      },
      resolve: async (_, { id }, ctx) => {
        if (!ctx.user) throw new Error('Unauthorized')
        const isSelf = ctx.user.userId === id
        const isAdmin = ctx.user.userRole === 'ADMIN'
        if (!isSelf && !isAdmin) throw new Error('Forbidden')

        try {
          await UserService.deleteUser(id)
          return true
        } catch {
          return false
        }
      },
    })
  },
})
