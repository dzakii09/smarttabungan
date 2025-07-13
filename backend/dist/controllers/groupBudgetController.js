"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGroupBudgetPeriodConfirmations = exports.confirmGroupBudgetPeriod = exports.getGroupBudgetPeriodById = exports.getGroupBudgetPeriods = exports.addGroupBudgetTransaction = exports.getUserInvitations = exports.declineInvitation = exports.acceptInvitation = exports.inviteUser = exports.searchUsers = exports.deleteGroupBudget = exports.updateGroupBudget = exports.getGroupBudgetById = exports.getGroupBudgets = exports.createGroupBudget = void 0;
const database_1 = __importDefault(require("../utils/database"));
const notificationService_1 = require("../services/notificationService");
// Create group budget
const createGroupBudget = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        console.log('=== CREATE GROUP BUDGET START ===');
        console.log('Request body:', req.body);
        const { name, description, amount, period, duration, startDate, endDate, categoryId, invitedEmails } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        console.log('User ID:', userId);
        console.log('Parsed data:', { name, description, amount, period, duration, startDate, endDate, categoryId });
        if (!userId) {
            console.error('No user ID found in request');
            return res.status(401).json({ message: 'User not authenticated' });
        }
        // Calculate end date based on duration if not provided
        let calculatedEndDate = endDate ? new Date(endDate) : null;
        if (!calculatedEndDate && duration) {
            calculatedEndDate = new Date(startDate);
            if (period === 'weekly') {
                calculatedEndDate.setDate(calculatedEndDate.getDate() + (duration * 7));
            }
            else if (period === 'monthly') {
                calculatedEndDate.setMonth(calculatedEndDate.getMonth() + duration);
            }
            else if (period === 'daily') {
                calculatedEndDate.setDate(calculatedEndDate.getDate() + duration);
            }
        }
        // Create group budget
        console.log('Creating group budget in database...');
        const groupBudget = yield database_1.default.groupBudget.create({
            data: {
                name,
                description,
                amount: parseFloat(amount),
                period,
                duration: duration || 1,
                startDate: new Date(startDate),
                endDate: calculatedEndDate || new Date(endDate),
                createdBy: userId,
                categoryId,
                members: {
                    create: {
                        userId,
                        role: 'owner'
                    }
                }
            },
            include: {
                creator: true,
                category: true,
                members: {
                    include: {
                        user: true
                    }
                }
            }
        });
        console.log('Group budget created successfully:', groupBudget.id);
        // Create periods automatically
        console.log('Creating periods...');
        const periods = yield createGroupBudgetPeriods(groupBudget.id, {
            period,
            duration: duration || 1,
            startDate: new Date(startDate),
            endDate: calculatedEndDate || new Date(endDate),
            totalAmount: parseFloat(amount)
        });
        console.log('Created', periods.length, 'periods');
        // Send invitations if emails provided
        if (invitedEmails && invitedEmails.length > 0) {
            console.log('Processing invitations for emails:', invitedEmails);
            for (const email of invitedEmails) {
                yield database_1.default.groupBudgetInvitation.create({
                    data: {
                        email,
                        groupBudgetId: groupBudget.id,
                        invitedBy: userId
                    }
                });
                // Send notification to invited user
                const invitedUser = yield database_1.default.user.findUnique({
                    where: { email }
                });
                if (invitedUser) {
                    yield (0, notificationService_1.sendNotification)({
                        userId: invitedUser.id,
                        title: 'Undangan Budget Group',
                        message: `Anda diundang untuk bergabung dengan budget group "${name}"`,
                        type: 'budget_invitation',
                        metadata: {
                            groupBudgetId: groupBudget.id,
                            groupBudgetName: name
                        }
                    });
                }
            }
        }
        console.log('=== CREATE GROUP BUDGET SUCCESS ===');
        res.status(201).json({
            message: 'Group budget created successfully',
            groupBudget: Object.assign(Object.assign({}, groupBudget), { periods })
        });
    }
    catch (error) {
        console.error('=== CREATE GROUP BUDGET ERROR ===');
        console.error('Error details:', error);
        console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
        console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
        res.status(500).json({ message: 'Server error', details: error instanceof Error ? error.message : 'Unknown error' });
    }
});
exports.createGroupBudget = createGroupBudget;
// Helper function to create periods
function createGroupBudgetPeriods(groupBudgetId, config) {
    return __awaiter(this, void 0, void 0, function* () {
        const periods = [];
        const periodAmount = config.totalAmount / config.duration;
        for (let i = 0; i < config.duration; i++) {
            const periodStartDate = new Date(config.startDate);
            const periodEndDate = new Date(config.startDate);
            // Calculate period dates
            if (config.period === 'weekly') {
                periodStartDate.setDate(periodStartDate.getDate() + (i * 7));
                periodEndDate.setDate(periodEndDate.getDate() + ((i + 1) * 7) - 1);
            }
            else if (config.period === 'monthly') {
                periodStartDate.setMonth(periodStartDate.getMonth() + i);
                periodEndDate.setMonth(periodEndDate.getMonth() + i + 1);
                periodEndDate.setDate(0); // Last day of the month
            }
            else if (config.period === 'daily') {
                periodStartDate.setDate(periodStartDate.getDate() + i);
                periodEndDate.setDate(periodEndDate.getDate() + i);
            }
            const period = yield database_1.default.groupBudgetPeriod.create({
                data: {
                    groupBudgetId,
                    periodNumber: i + 1,
                    startDate: periodStartDate,
                    endDate: periodEndDate,
                    budget: periodAmount,
                    spent: 0
                }
            });
            periods.push(period);
        }
        return periods;
    });
}
// Get all group budgets for user
const getGroupBudgets = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const groupBudgets = yield database_1.default.groupBudget.findMany({
            where: {
                OR: [
                    { createdBy: userId },
                    {
                        members: {
                            some: {
                                userId
                            }
                        }
                    }
                ]
            },
            include: {
                creator: true,
                category: true,
                members: {
                    include: {
                        user: true
                    }
                },
                invitations: true,
                periods: {
                    include: {
                        GroupBudgetPeriodConfirmation: true
                    },
                    orderBy: { periodNumber: 'asc' }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(groupBudgets);
    }
    catch (error) {
        console.error('Get group budgets error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getGroupBudgets = getGroupBudgets;
// Get group budget by ID
const getGroupBudgetById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const groupBudget = yield database_1.default.groupBudget.findFirst({
            where: {
                id,
                OR: [
                    { createdBy: userId },
                    {
                        members: {
                            some: {
                                userId
                            }
                        }
                    }
                ]
            },
            include: {
                creator: true,
                category: true,
                members: {
                    include: {
                        user: true
                    }
                },
                invitations: true
            }
        });
        if (!groupBudget) {
            return res.status(404).json({ message: 'Group budget not found' });
        }
        res.json(groupBudget);
    }
    catch (error) {
        console.error('Get group budget error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getGroupBudgetById = getGroupBudgetById;
// Update group budget
const updateGroupBudget = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { name, description, amount, period, startDate, endDate, categoryId } = req.body;
        const userId = req.user.id;
        // Check if user is owner
        const groupBudget = yield database_1.default.groupBudget.findFirst({
            where: {
                id,
                createdBy: userId
            }
        });
        if (!groupBudget) {
            return res.status(404).json({ message: 'Group budget not found or you are not the owner' });
        }
        const updatedGroupBudget = yield database_1.default.groupBudget.update({
            where: { id },
            data: {
                name,
                description,
                amount: parseFloat(amount),
                period,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                categoryId
            },
            include: {
                creator: true,
                category: true,
                members: {
                    include: {
                        user: true
                    }
                }
            }
        });
        res.json({
            message: 'Group budget updated successfully',
            groupBudget: updatedGroupBudget
        });
    }
    catch (error) {
        console.error('Update group budget error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.updateGroupBudget = updateGroupBudget;
// Delete group budget
const deleteGroupBudget = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        // Check if user is owner
        const groupBudget = yield database_1.default.groupBudget.findFirst({
            where: {
                id,
                createdBy: userId
            }
        });
        if (!groupBudget) {
            return res.status(404).json({ message: 'Group budget not found or you are not the owner' });
        }
        yield database_1.default.groupBudget.delete({
            where: { id }
        });
        res.json({ message: 'Group budget deleted successfully' });
    }
    catch (error) {
        console.error('Delete group budget error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.deleteGroupBudget = deleteGroupBudget;
// Search users to invite
const searchUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { query } = req.query;
        const userId = req.user.id;
        if (!query || typeof query !== 'string') {
            return res.status(400).json({ message: 'Query parameter is required' });
        }
        const users = yield database_1.default.user.findMany({
            where: {
                OR: [
                    { name: { contains: query } },
                    { email: { contains: query } }
                ],
                NOT: { id: userId } // Exclude current user
            },
            select: {
                id: true,
                name: true,
                email: true
            },
            take: 10
        });
        res.json(users);
    }
    catch (error) {
        console.error('Search users error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.searchUsers = searchUsers;
// Invite user to group budget
const inviteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { groupBudgetId } = req.params;
        const { email } = req.body;
        const userId = req.user.id;
        // Check if user is owner or admin
        const groupBudget = yield database_1.default.groupBudget.findFirst({
            where: {
                id: groupBudgetId,
                OR: [
                    { createdBy: userId },
                    {
                        members: {
                            some: {
                                userId,
                                role: { in: ['owner', 'admin'] }
                            }
                        }
                    }
                ]
            }
        });
        if (!groupBudget) {
            return res.status(404).json({ message: 'Group budget not found or you do not have permission' });
        }
        // Check if invitation already exists
        const existingInvitation = yield database_1.default.groupBudgetInvitation.findUnique({
            where: {
                groupBudgetId_email: {
                    groupBudgetId,
                    email
                }
            }
        });
        if (existingInvitation) {
            return res.status(400).json({ message: 'Invitation already sent to this email' });
        }
        // Create invitation
        const invitation = yield database_1.default.groupBudgetInvitation.create({
            data: {
                email,
                groupBudgetId,
                invitedBy: userId
            }
        });
        // Send notification to invited user
        const invitedUser = yield database_1.default.user.findUnique({
            where: { email }
        });
        if (invitedUser) {
            yield (0, notificationService_1.sendNotification)({
                userId: invitedUser.id,
                title: 'Undangan Budget Group',
                message: `Anda diundang untuk bergabung dengan budget group "${groupBudget.name}"`,
                type: 'budget_invitation',
                metadata: {
                    groupBudgetId,
                    groupBudgetName: groupBudget.name
                }
            });
        }
        res.status(201).json({
            message: 'Invitation sent successfully',
            invitation
        });
    }
    catch (error) {
        console.error('Invite user error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.inviteUser = inviteUser;
// Accept invitation
const acceptInvitation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { invitationId } = req.params;
        const userId = req.user.id;
        const invitation = yield database_1.default.groupBudgetInvitation.findUnique({
            where: { id: invitationId },
            include: { groupBudget: true }
        });
        if (!invitation) {
            return res.status(404).json({ message: 'Invitation not found' });
        }
        if (invitation.status !== 'pending') {
            return res.status(400).json({ message: 'Invitation already processed' });
        }
        // Update invitation status
        yield database_1.default.groupBudgetInvitation.update({
            where: { id: invitationId },
            data: {
                status: 'accepted',
                respondedAt: new Date()
            }
        });
        // Add user to group budget members
        yield database_1.default.groupBudgetMember.create({
            data: {
                groupBudgetId: invitation.groupBudgetId,
                userId,
                role: 'member'
            }
        });
        res.json({ message: 'Invitation accepted successfully' });
    }
    catch (error) {
        console.error('Accept invitation error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.acceptInvitation = acceptInvitation;
// Decline invitation
const declineInvitation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { invitationId } = req.params;
        const userId = req.user.id;
        const invitation = yield database_1.default.groupBudgetInvitation.findUnique({
            where: { id: invitationId }
        });
        if (!invitation) {
            return res.status(404).json({ message: 'Invitation not found' });
        }
        if (invitation.status !== 'pending') {
            return res.status(400).json({ message: 'Invitation already processed' });
        }
        yield database_1.default.groupBudgetInvitation.update({
            where: { id: invitationId },
            data: {
                status: 'declined',
                respondedAt: new Date()
            }
        });
        res.json({ message: 'Invitation declined successfully' });
    }
    catch (error) {
        console.error('Decline invitation error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.declineInvitation = declineInvitation;
// Get user invitations
const getUserInvitations = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const user = yield database_1.default.user.findUnique({
            where: { id: userId }
        });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const invitations = yield database_1.default.groupBudgetInvitation.findMany({
            where: {
                email: user.email,
                status: 'pending'
            },
            include: {
                groupBudget: {
                    include: {
                        creator: true,
                        category: true
                    }
                },
                inviter: true
            },
            orderBy: { invitedAt: 'desc' }
        });
        res.json(invitations);
    }
    catch (error) {
        console.error('Get user invitations error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getUserInvitations = getUserInvitations;
// Add transaction to group budget period
const addGroupBudgetTransaction = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { groupBudgetId, periodId, amount, description, type, date } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        // Check if user is member of the group budget
        const member = yield database_1.default.groupBudgetMember.findFirst({
            where: {
                groupBudgetId,
                userId
            }
        });
        if (!member) {
            return res.status(403).json({ message: 'You are not a member of this group budget' });
        }
        // Get period details to check if transaction is late
        const period = yield database_1.default.groupBudgetPeriod.findUnique({
            where: { id: periodId },
            include: {
                groupBudget: true
            }
        });
        if (!period) {
            return res.status(404).json({ message: 'Period not found' });
        }
        const transactionDate = new Date(date);
        const periodEndDate = new Date(period.endDate);
        const isLate = transactionDate > periodEndDate;
        // Create transaction
        const transaction = yield database_1.default.groupBudgetTransaction.create({
            data: {
                groupBudgetId,
                periodId,
                amount: parseFloat(amount),
                description,
                type,
                date: transactionDate,
                createdBy: userId
            },
            include: {
                creator: true,
                period: true
            }
        });
        // Update period spent amount
        yield database_1.default.groupBudgetPeriod.update({
            where: { id: periodId },
            data: {
                spent: {
                    increment: parseFloat(amount)
                }
            }
        });
        // Update group budget total spent
        yield database_1.default.groupBudget.update({
            where: { id: groupBudgetId },
            data: {
                spent: {
                    increment: parseFloat(amount)
                }
            }
        });
        // Send notification if transaction is late
        if (isLate) {
            const daysLate = Math.ceil((transactionDate.getTime() - periodEndDate.getTime()) / (1000 * 60 * 60 * 24));
            yield (0, notificationService_1.sendNotification)({
                userId,
                title: '⚠️ Transaksi Terlambat',
                message: `Transaksi "${description}" untuk periode ${period.periodNumber} terlambat ${daysLate} hari. Periode berakhir pada ${periodEndDate.toLocaleDateString('id-ID')}`,
                type: 'warning',
                metadata: {
                    groupBudgetId,
                    periodId,
                    transactionId: transaction.id,
                    daysLate
                }
            });
        }
        res.status(201).json({
            message: 'Transaction added successfully',
            transaction,
            isLate,
            warning: isLate ? `Transaksi terlambat ${Math.ceil((transactionDate.getTime() - periodEndDate.getTime()) / (1000 * 60 * 60 * 24))} hari` : null
        });
    }
    catch (error) {
        console.error('Add group budget transaction error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.addGroupBudgetTransaction = addGroupBudgetTransaction;
// Get group budget periods
const getGroupBudgetPeriods = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { groupBudgetId } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        // Check if user is member of the group budget
        const member = yield database_1.default.groupBudgetMember.findFirst({
            where: {
                groupBudgetId,
                userId
            }
        });
        if (!member) {
            return res.status(403).json({ message: 'You are not a member of this group budget' });
        }
        const periods = yield database_1.default.groupBudgetPeriod.findMany({
            where: { groupBudgetId },
            include: {
                transactions: {
                    include: {
                        creator: true
                    },
                    orderBy: { date: 'desc' }
                }
            },
            orderBy: { periodNumber: 'asc' }
        });
        res.json(periods);
    }
    catch (error) {
        console.error('Get group budget periods error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getGroupBudgetPeriods = getGroupBudgetPeriods;
// Get group budget period by ID
const getGroupBudgetPeriodById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { periodId } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        const period = yield database_1.default.groupBudgetPeriod.findFirst({
            where: { id: periodId },
            include: {
                groupBudget: {
                    include: {
                        members: {
                            where: { userId }
                        }
                    }
                },
                transactions: {
                    include: {
                        creator: true
                    },
                    orderBy: { date: 'desc' }
                }
            }
        });
        if (!period || period.groupBudget.members.length === 0) {
            return res.status(404).json({ message: 'Period not found or access denied' });
        }
        res.json(period);
    }
    catch (error) {
        console.error('Get group budget period error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getGroupBudgetPeriodById = getGroupBudgetPeriodById;
// Konfirmasi setoran periode oleh member
const confirmGroupBudgetPeriod = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { periodId } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId)
            return res.status(401).json({ message: 'User not authenticated' });
        // Cek apakah sudah pernah konfirmasi
        const existing = yield database_1.default.groupBudgetPeriodConfirmation.findUnique({
            where: { periodId_userId: { periodId, userId } }
        });
        if (existing && existing.confirmedAt) {
            return res.status(400).json({ message: 'Sudah konfirmasi sebelumnya' });
        }
        // Konfirmasi (upsert)
        const confirmation = yield database_1.default.groupBudgetPeriodConfirmation.upsert({
            where: { periodId_userId: { periodId, userId } },
            update: { confirmedAt: new Date() },
            create: { periodId, userId, confirmedAt: new Date() }
        });
        res.json({ message: 'Konfirmasi berhasil', confirmation });
    }
    catch (error) {
        console.error('Error confirmGroupBudgetPeriod:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.confirmGroupBudgetPeriod = confirmGroupBudgetPeriod;
// Get status konfirmasi semua member pada periode
const getGroupBudgetPeriodConfirmations = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { periodId } = req.params;
        // Ambil semua member group budget untuk periode ini
        const period = yield database_1.default.groupBudgetPeriod.findUnique({
            where: { id: periodId },
            include: {
                groupBudget: {
                    include: {
                        members: { include: { user: true } }
                    }
                }
            }
        });
        if (!period)
            return res.status(404).json({ message: 'Period not found' });
        const members = period.groupBudget.members;
        // Ambil status konfirmasi masing-masing member
        const confirmations = yield database_1.default.groupBudgetPeriodConfirmation.findMany({
            where: { periodId },
        });
        // Gabungkan data member dan konfirmasi
        const result = members.map(m => {
            const conf = confirmations.find(c => c.userId === m.userId);
            return {
                userId: m.userId,
                name: m.user.name,
                confirmedAt: (conf === null || conf === void 0 ? void 0 : conf.confirmedAt) || null
            };
        });
        res.json(result);
    }
    catch (error) {
        console.error('Error getGroupBudgetPeriodConfirmations:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getGroupBudgetPeriodConfirmations = getGroupBudgetPeriodConfirmations;
