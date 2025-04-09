/* eslint-disable @typescript-eslint/no-explicit-any */

import { Request, Response } from 'express'
import * as UserService from '../services/userService.js'

export const getAllUsers = async (_req: Request, res: Response): Promise<void> => {
  const users = await UserService.getAllUsers()
  res.json(users)
}

export const getUserById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params
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

  try {
    const updated = await UserService.updateUser(Number(id), data)
    res.json(updated)
  } catch (err) {
    res.status(400).json({ error: 'Failed to update user', details: err })
  }
}

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params

  try {
    await UserService.deleteUser(Number(id))
    res.status(204).send()
  } catch (err) {
    res.status(404).json({ error: 'User not found', details: err })
  }
}
