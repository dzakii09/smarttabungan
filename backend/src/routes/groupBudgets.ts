import express from 'express'
import { auth } from '../middleware/auth'
import {
  createGroupBudget,
  getGroupBudgets,
  getGroupBudgetById,
  updateGroupBudget,
  deleteGroupBudget,
  searchUsers,
  inviteUser,
  acceptInvitation,
  declineInvitation,
  getUserInvitations,
  addGroupBudgetTransaction,
  getGroupBudgetPeriods,
  getGroupBudgetPeriodById,
  confirmGroupBudgetPeriod,
  getGroupBudgetPeriodConfirmations
} from '../controllers/groupBudgetController'

const router = express.Router()

// User search and invitation (harus sebelum /:id)
router.get('/search/users', auth as any, searchUsers as any)

// Group Budget CRUD
router.post('/', auth as any, createGroupBudget as any)
router.get('/', auth as any, getGroupBudgets as any)
router.get('/:id', auth as any, getGroupBudgetById as any)
router.put('/:id', auth as any, updateGroupBudget as any)
router.delete('/:id', auth as any, deleteGroupBudget as any)

// Group Budget Periods
router.get('/:groupBudgetId/periods', auth as any, getGroupBudgetPeriods as any)
router.get('/periods/:periodId', auth as any, getGroupBudgetPeriodById as any)
// Konfirmasi periode
router.post('/periods/:periodId/confirm', auth as any, confirmGroupBudgetPeriod as any)
router.get('/periods/:periodId/confirmations', auth as any, getGroupBudgetPeriodConfirmations as any)

// Group Budget Transactions
router.post('/transactions', auth as any, addGroupBudgetTransaction as any)

// Invitation management
router.post('/:groupBudgetId/invite', auth as any, inviteUser as any)
router.post('/invitations/:invitationId/accept', auth as any, acceptInvitation as any)
router.post('/invitations/:invitationId/decline', auth as any, declineInvitation as any)
router.get('/invitations/user', auth as any, getUserInvitations as any)

export default router 