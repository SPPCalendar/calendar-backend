import { Request, Response } from 'express'
import * as UserService from '../services/userService.js'
import { UserRole } from '@prisma/client'

export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  // Validate that the user is authenticated
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  // Validate that the user is an admin
  if (req.user?.userRole !== UserRole.ADMIN) {
    res.status(403).json({ error: 'Forbidden' })
    return
  }
  
  const users = await UserService.getAllUsers()
  res.json(users)
}

export const getUserById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params

  // Validate that the user is authenticated
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  // Validate that the user is an admin or the user themselves
  if (req.user?.userRole !== UserRole.ADMIN && req.user?.userId !== Number(id)) {
    res.status(403).json({ error: 'Forbidden' })
    return
  }

  const user = await UserService.getUserById(Number(id))

  if (!user) {
    res.status(404).json({ error: 'User not found' })
    return
  }

  res.json(user)
}

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params
  const data = req.body

  // Validate that the user is authenticated
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  // Validate that the user is an admin or the user themselves
  if (req.user?.userRole !== UserRole.ADMIN && req.user?.userId !== Number(id)) {
    res.status(403).json({ error: 'Forbidden' })
    return
  }

  try {
    const updated = await UserService.updateUser(Number(id), data)
    res.json(updated)
  } catch (err) {
    res.status(400).json({ error: 'Failed to update user', details: err })
  }
}

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params

  // Validate that the user is authenticated
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  // Validate that the user is an admin or the user themselves
  if (req.user?.userRole !== UserRole.ADMIN && req.user?.userId !== Number(id)) {
    res.status(403).json({ error: 'Forbidden' })
    return
  }

  try {
    await UserService.deleteUser(Number(id))
    res.status(204).send()
  } catch (err) {
    res.status(404).json({ error: 'User not found', details: err })
  }
}
