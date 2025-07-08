import express from 'express'
import { 
  createGoal, 
  getGoals, 
  getGoalById, 
  updateGoal, 
  deleteGoal,
  updateGoalProgress
} from '../controllers/goalController'
import { auth } from '../middleware/auth'

const router = express.Router()

router.post('/', auth as any, createGoal as any)
router.get('/', auth as any, getGoals as any)
router.get('/:id', auth as any, getGoalById as any)
router.put('/:id', auth as any, updateGoal as any)
router.delete('/:id', auth as any, deleteGoal as any)
router.patch('/:id/progress', auth as any, updateGoalProgress as any)

export default router 