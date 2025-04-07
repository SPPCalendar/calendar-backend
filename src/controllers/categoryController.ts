import { Request, Response } from 'express'
import * as CategoryService from '../services/categoryService.js'

export const getAllCategories = async (_req: Request, res: Response): Promise<void> => {
  const categories = await CategoryService.getAllCategories()
  res.json(categories)
}

export const getCategoryById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params
  const category = await CategoryService.getCategoryById(Number(id))

  if (!category) {
    res.status(404).json({ error: 'Category not found' })
    return
  }

  res.json(category)
}

export const createCategory = async (req: Request, res: Response): Promise<void> => {
  const { category_name, color, calendar_id } = req.body

  if (!category_name || !calendar_id) {
    res.status(400).json({ error: 'category_name and calendar_id are required' })
    return
  }

  try {
    const category = await CategoryService.createCategory({
      category_name,
      color,
      calendar_id,
    })

    res.status(201).json(category)
  } catch (err) {
    res.status(500).json({ error: 'Failed to create category', details: err })
  }
}

export const updateCategory = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params
  const { category_name, color, calendar_id } = req.body

  try {
    const updated = await CategoryService.updateCategory(Number(id), {
      category_name,
      color,
      calendar_id,
    })

    res.json(updated)
  } catch (err) {
    res.status(400).json({ error: 'Failed to update category', details: err })
  }
}

export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params

  try {
    await CategoryService.deleteCategory(Number(id))
    res.status(204).send()
  } catch (err) {
    res.status(404).json({ error: 'Category not found', details: err })
  }
}
