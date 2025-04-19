import { Request } from 'express'
import jwt from 'jsonwebtoken'
import { PubSub } from 'graphql-subscriptions'

export const pubsub = new PubSub() // Shared instance

export interface Context {
  user: { userId: number; userRole: string } | null
  pubsub: PubSub
}

export function buildContext({ req }: { req: Request }): Context {
  const token = req.headers.authorization?.replace('Bearer ', '')
  let user = null

  if (token) {
    try {
      user = jwt.verify(token, process.env.JWT_SECRET!) as Context['user']
    } catch {
      console.warn('Invalid token')
    }
  }

  return { user, pubsub }
}
