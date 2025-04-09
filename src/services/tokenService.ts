import crypto from 'crypto'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()


export const hashToken = (token: string): string =>
  crypto.createHash('sha256').update(token).digest('hex')

export const saveRefreshToken = async (userId: number, token: string, expiresAt: Date) => {
  const token_hash = hashToken(token)
  
  return prisma.refreshToken.create({
    data: {
      userId,
      token_hash,
      expiresAt,
    },
  })
}

export const deleteRefreshToken = async (token: string) => {
  const token_hash = hashToken(token)

  return prisma.refreshToken.deleteMany({
    where: { token_hash },
  })
}

export const isRefreshTokenValid = async (token: string): Promise<boolean> => {
  const token_hash = hashToken(token)

  const found = await prisma.refreshToken.findUnique({
    where: { token_hash },
  })
  return !!found
}