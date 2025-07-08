import express from 'express'
import { 
  createCategory, 
  getCategories, 
  getCategoryById, 
  updateCategory, 
  deleteCategory
} from '../controllers/categoryController'

const router = express.Router()

router.post('/', createCategory as any)
router.get('/', getCategories as any)
router.get('/:id', getCategoryById as any)
router.put('/:id', updateCategory as any)
router.delete('/:id', deleteCategory as any)

export default router 