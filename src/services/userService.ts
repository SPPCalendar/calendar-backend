import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const getAllUsers = () => {
  return prisma.user.findMany({
    include: {
      calendars: {
        include: {
          calendar: true,
        },
      },
    },
  })
}

export const getUserById = (id: number) => {
  return prisma.user.findUnique({
    where: { id },
    include: {
      calendars: {
        include: {
          calendar: true,
        },
      },
    },
  })
}

export const getUserByEmail = (email: string) => {
  return prisma.user.findUnique({
    where: { email },
  })
}

export const getUserByUsername = (username: string) => {
  return prisma.user.findUnique({
    where: { username },
  })
}

export const createUser = (data: {
  display_name: string
  username: string
  email: string
  email_confirmed?: boolean
  password_hash: string
}) => {
  return prisma.user.create({
    data: {
      ...data,
      email_confirmed: data.email_confirmed ?? false,
    },
  })
}

export const updateUser = (
  id: number,
  data: Partial<{
    display_name: string
    username: string
    email: string
    email_confirmed: boolean
    password_hash: string
  }>
) => {
  return prisma.user.update({
    where: { id },
    data,
  })
}

export const deleteUser = (id: number) => {
  return prisma.user.delete({
    where: { id },
  })
}
