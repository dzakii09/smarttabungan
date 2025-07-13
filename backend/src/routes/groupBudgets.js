"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const groupBudgetController_1 = require("../controllers/groupBudgetController");
const router = express_1.default.Router();
// User search and invitation (harus sebelum /:id)
router.get('/search/users', auth_1.auth, groupBudgetController_1.searchUsers);
// Group Budget CRUD
router.post('/', auth_1.auth, groupBudgetController_1.createGroupBudget);
router.get('/', auth_1.auth, groupBudgetController_1.getGroupBudgets);
router.get('/:id', auth_1.auth, groupBudgetController_1.getGroupBudgetById);
router.put('/:id', auth_1.auth, groupBudgetController_1.updateGroupBudget);
router.delete('/:id', auth_1.auth, groupBudgetController_1.deleteGroupBudget);
// Group Budget Periods
router.get('/:groupBudgetId/periods', auth_1.auth, groupBudgetController_1.getGroupBudgetPeriods);
router.get('/periods/:periodId', auth_1.auth, groupBudgetController_1.getGroupBudgetPeriodById);
// Konfirmasi periode
router.post('/periods/:periodId/confirm', auth_1.auth, groupBudgetController_1.confirmGroupBudgetPeriod);
router.get('/periods/:periodId/confirmations', auth_1.auth, groupBudgetController_1.getGroupBudgetPeriodConfirmations);
// Group Budget Transactions
router.post('/transactions', auth_1.auth, groupBudgetController_1.addGroupBudgetTransaction);
// Invitation management
router.post('/:groupBudgetId/invite', auth_1.auth, groupBudgetController_1.inviteUser);
router.post('/invitations/:invitationId/accept', auth_1.auth, groupBudgetController_1.acceptInvitation);
router.post('/invitations/:invitationId/decline', auth_1.auth, groupBudgetController_1.declineInvitation);
router.get('/invitations/user', auth_1.auth, groupBudgetController_1.getUserInvitations);
exports.default = router;
