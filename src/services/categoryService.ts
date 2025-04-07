import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const getAllCategories = () => {
  return prisma.category.findMany({
    include: {
      calendar: true,
      events: true,
    },
  })
}

export const getCategoryById = (id: number) => {
  return prisma.category.findUnique({
    where: { id },
    include: {
      calendar: true,
      events: true,
    },
  })
}

export const createCategory = (data: {
  category_name: string
  color?: string
  calendar_id: number
}) => {
  return prisma.category.create({ data })
}

export const updateCategory = (
  id: number,
  data: Partial<{
    category_name: string
    color: string
    calendar_id: number
  }>
) => {
  return prisma.category.update({
    where: { id },
    data,
  })
}

export const deleteCategory = (id: number) => {
  return prisma.category.delete({
    where: { id },
  })
}
