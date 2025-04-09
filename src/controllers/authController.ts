import { Request, Response } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { createUser, getUserByEmail, getUserByUsername } from '../services/userService.js'

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret'
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refreshsecret'
const PASSWORD_SALT_ROUNDS = process.env.PASSWORD_SALT_ROUNDS ? parseInt(process.env.PASSWORD_SALT_ROUNDS) : 10
const ACCESS_TOKEN_EXPIRES_IN = '15m'
const REFRESH_TOKEN_EXPIRES_IN = '7d'

// Token generation
const generateTokens = (userId: number) => {
  const accessToken = jwt.sign({ userId }, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRES_IN })
  const refreshToken = jwt.sign({ userId }, JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRES_IN })
  return { accessToken, refreshToken }
}

// POST /register
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { display_name, username, email, password } = req.body

    if (!display_name || !username || !email || !password) {
      res.status(400).json({ error: 'Missing required fields' })
      return
    }
    
    const existingUser = await getUserByEmail(email) || await getUserByUsername(username)
    if (existingUser) {
      res.status(409).json({ message: 'Email or username already in use' })
      return
    } 

    const password_hash = await bcrypt.hash(password, PASSWORD_SALT_ROUNDS)

    const user = await createUser({
      display_name,
      username,
      email,
      password_hash,
      email_confirmed: false,
    })

    const tokens = generateTokens(user.id)

    res.status(201).json({ userId: user.id, ...tokens })
  } catch (err) {
    res.status(500).json({ message: 'Registration failed', error: err })
  }
}

// POST /login
export const login = async (req: Request, res: Response): Promise<void>  => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      res.status(400).json({ error: 'Missing email or password' })
      return
    }

    const user = await getUserByEmail(email)
    if (!user) {
      res.status(401).json({ message: 'Invalid credentials' })
      return
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash)
    if (!passwordMatch) {
      res.status(401).json({ message: 'Invalid credentials' })
      return
    }

    const tokens = generateTokens(user.id)
    res.json({ userId: user.id, ...tokens })
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err })
  }
}

// POST /refresh
export const refresh = (req: Request, res: Response): void => {
  try {
    const { refreshToken } = req.body
    if (!refreshToken) {
      res.status(400).json({ message: 'No refresh token' })
      return
    }

    const payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as { userId: number }
    const tokens = generateTokens(payload.userId)

    res.json( { userId: payload.userId, ...tokens })
  } catch {
    res.status(401).json({ message: 'Invalid or expired refresh token' })
  }
}

export const logout = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body
    if (!refreshToken) return res.status(400).json({ message: 'No refresh token' })

    await deleteRefreshToken(refreshToken)
    res.status(200).json({ message: 'Logged out successfully' })
  } catch {
    res.status(500).json({ message: 'Logout failed' })
  }
}