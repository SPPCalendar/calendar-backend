// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Request } from 'express'
import { UserRole } from '@prisma/client'

declare global {
  namespace Express {
    interface Request {
      user?: { 
        userId: number 
        userRole: UserRole
      }
    }
  }
}