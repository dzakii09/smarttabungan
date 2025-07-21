import express from 'express'
import { auth } from '../middleware/auth'
import {
  createTabunganBersama,
  getTabunganBersamas,
  getTabunganBersamaById,
  updateTabunganBersama,
  deleteTabunganBersama,
  searchUsers,
  inviteUser,
  acceptInvitation,
  declineInvitation,
  getUserInvitations,
  addTabunganBersamaTransaction,
  getTabunganBersamaPeriods,
  getTabunganBersamaPeriodById,
  confirmTabunganBersamaPeriod,
  getTabunganBersamaPeriodConfirmations
} from '../controllers/tabunganBersamaController'

const router = express.Router()

// User search and invitation (harus sebelum /:id)
router.get('/search/users', auth as any, searchUsers as any)

// Tabungan Bersama CRUD
router.post('/', auth as any, createTabunganBersama as any)
router.get('/', auth as any, getTabunganBersamas as any)
router.get('/:id', auth as any, getTabunganBersamaById as any)
router.put('/:id', auth as any, updateTabunganBersama as any)
router.delete('/:id', auth as any, deleteTabunganBersama as any)

// Tabungan Bersama Periods
router.get('/:groupBudgetId/periods', auth as any, getTabunganBersamaPeriods as any)
router.get('/periods/:periodId', auth as any, getTabunganBersamaPeriodById as any)
// Konfirmasi periode
router.post('/periods/:periodId/confirm', auth as any, confirmTabunganBersamaPeriod as any)
router.get('/periods/:periodId/confirmations', auth as any, getTabunganBersamaPeriodConfirmations as any)

// Tabungan Bersama Transactions
router.post('/transactions', auth as any, addTabunganBersamaTransaction as any)

// Invitation management
router.post('/:groupBudgetId/invite', auth as any, inviteUser as any)
router.post('/invitations/:invitationId/accept', auth as any, acceptInvitation as any)
router.post('/invitations/:invitationId/decline', auth as any, declineInvitation as any)
router.get('/invitations/user', auth as any, getUserInvitations as any)

export default router 