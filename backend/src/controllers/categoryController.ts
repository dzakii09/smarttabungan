import { Request, Response } from 'express'
import prisma from '../utils/database'

export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, type, icon, color } = req.body
    const category = await prisma.category.create({
      data: { name, type, icon, color }
    })
    res.status(201).json({
      message: 'Category created successfully',
      category
    })
  } catch (error) {
    console.error('Create category error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

export const getCategories = async (req: Request, res: Response) => {
  try {
    const { type } = req.query
    const where: any = {}
    if (type) {
      where.type = type
    }
    const categories = await prisma.category.findMany({
      where,
      orderBy: { name: 'asc' }
    })
    res.json(categories)
  } catch (error) {
    console.error('Get categories error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

export const getCategoryById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const category = await prisma.category.findUnique({ where: { id } })
    if (!category) {
      res.status(404).json({ message: 'Category not found' })
      return
    }
    res.json(category)
  } catch (error) {
    console.error('Get category error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { name, type, icon, color } = req.body
    const category = await prisma.category.findUnique({ where: { id } })
    if (!category) {
      res.status(404).json({ message: 'Category not found' })
      return
    }
    const updatedCategory = await prisma.category.update({
      where: { id },
      data: { name, type, icon, color }
    })
    res.json({
      message: 'Category updated successfully',
      category: updatedCategory
    })
  } catch (error) {
    console.error('Update category error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const category = await prisma.category.findUnique({ where: { id } })
    if (!category) {
      res.status(404).json({ message: 'Category not found' })
      return
    }
    await prisma.category.delete({ where: { id } })
    res.json({ message: 'Category deleted successfully' })
  } catch (error) {
    console.error('Delete category error:', error)
    res.status(500).json({ message: 'Server error' })
  }
} 