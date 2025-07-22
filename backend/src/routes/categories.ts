import express from 'express'
import { 
  createCategory, 
  getCategories, 
  getCategoryById, 
  updateCategory, 
  deleteCategory
} from '../controllers/categoryController'
import { auth } from '../middleware/auth'

const router = express.Router()

// Allow public access to get categories for now
router.get('/', getCategories as any)
router.get('/:id', getCategoryById as any)

// Require auth for modifications
router.post('/', auth as any, createCategory as any)
router.put('/:id', auth as any, updateCategory as any)
router.delete('/:id', auth as any, deleteCategory as any)

export default router 