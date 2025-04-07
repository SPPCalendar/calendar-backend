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

export const createUser = async (req: Request, res: Response): Promise<void> => {
  const { display_name, username, email, password_hash, email_confirmed } = req.body

  if (!display_name || !username || !email || !password_hash) {
    res.status(400).json({ error: 'Missing required fields' })
    return
  }

  try {
    const newUser = await UserService.createUser({
      display_name,
      username,
      email,
      password_hash,
      email_confirmed,
    })

    res.status(201).json(newUser)
  } catch (err: any) {
    if (err.code === 'P2002') {
      res.status(409).json({ error: 'Email or username already in use' })
    } else {
      res.status(500).json({ error: 'Failed to create user', details: err })
    }
  }
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
