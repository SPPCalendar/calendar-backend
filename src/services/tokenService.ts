import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export const saveRefreshToken = async (userId: number, token: string, expiresAt: Date) => {
  return prisma.refreshToken.create({
    data: {
      userId,
      token,
      expiresAt,
    },
  })
}

export const deleteRefreshToken = async (token: string) => {
  return prisma.refreshToken.deleteMany({
    where: { token },
  })
}

export const isRefreshTokenValid = async (token: string): Promise<boolean> => {
  const found = await prisma.refreshToken.findUnique({
    where: { token },
  })
  return !!found
}