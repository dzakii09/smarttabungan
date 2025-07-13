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
exports.getTransactionsByCategory = exports.getTransactionStats = exports.deleteTransaction = exports.updateTransaction = exports.getTransactionById = exports.getTransactions = exports.createTransaction = void 0;
const database_1 = __importDefault(require("../utils/database"));
const notificationService_1 = __importDefault(require("../services/notificationService"));
const smartAlertService_1 = __importDefault(require("../services/smartAlertService"));
const createTransaction = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const { amount, description, categoryId, type, date } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        // Validasi userId
        if (!userId) {
            return res.status(401).json({ message: 'Gagal menyimpan transaksi' });
        }
        const transaction = yield database_1.default.transaction.create({
            data: {
                amount: parseFloat(amount),
                description,
                type,
                date: date ? new Date(date) : new Date(),
                userId,
                categoryId
            },
            include: {
                category: true
            }
        });
        // Create notification for new transaction
        try {
            if (type === 'expense') {
                // Check for budget alerts
                yield notificationService_1.default.checkAndCreateNotifications(userId);
                // Create transaction notification
                yield notificationService_1.default.createSystemNotification(userId, '💰 Transaksi Baru', `Pengeluaran ${((_b = transaction.category) === null || _b === void 0 ? void 0 : _b.name) || 'tanpa kategori'} sebesar Rp ${amount.toLocaleString('id-ID')} telah ditambahkan`, 'low');
                // Run smart alerts for unusual spending detection
                yield smartAlertService_1.default.detectUnusualSpending(userId, transaction.id);
            }
            else {
                // Income notification
                yield notificationService_1.default.createSystemNotification(userId, '💵 Pemasukan Baru', `Pemasukan ${((_c = transaction.category) === null || _c === void 0 ? void 0 : _c.name) || 'tanpa kategori'} sebesar Rp ${amount.toLocaleString('id-ID')} telah ditambahkan`, 'low');
            }
        }
        catch (notificationError) {
            console.error('Error creating notification:', notificationError);
            // Don't fail the transaction if notification fails
        }
        res.status(201).json({
            message: 'Transaction created successfully',
            transaction
        });
    }
    catch (error) {
        console.error('Create transaction error:', error);
        res.status(500).json({ message: 'Gagal menyimpan transaksi' });
    }
});
exports.createTransaction = createTransaction;
const getTransactions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const { page = 1, limit = 10, type, categoryId, startDate, endDate } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const where = { userId };
        if (type)
            where.type = type;
        if (categoryId)
            where.categoryId = categoryId;
        if (startDate && endDate) {
            where.date = {
                gte: new Date(startDate),
                lte: new Date(endDate)
            };
        }
        const transactions = yield database_1.default.transaction.findMany({
            where,
            include: {
                category: true
            },
            orderBy: {
                date: 'desc'
            },
            skip,
            take: parseInt(limit)
        });
        const total = yield database_1.default.transaction.count({ where });
        res.json({
            transactions,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    }
    catch (error) {
        console.error('Get transactions error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getTransactions = getTransactions;
const getTransactionById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const transaction = yield database_1.default.transaction.findFirst({
            where: {
                id,
                userId
            },
            include: {
                category: true
            }
        });
        if (!transaction) {
            res.status(404).json({ message: 'Transaction not found' });
            return;
        }
        res.json(transaction);
    }
    catch (error) {
        console.error('Get transaction error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getTransactionById = getTransactionById;
const updateTransaction = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const { amount, description, categoryId, type, date } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const transaction = yield database_1.default.transaction.findFirst({
            where: {
                id,
                userId
            }
        });
        if (!transaction) {
            res.status(404).json({ message: 'Transaction not found' });
            return;
        }
        const updatedTransaction = yield database_1.default.transaction.update({
            where: { id },
            data: {
                amount: amount ? parseFloat(amount) : undefined,
                description,
                type,
                date: date ? new Date(date) : undefined,
                categoryId
            },
            include: {
                category: true
            }
        });
        res.json({
            message: 'Transaction updated successfully',
            transaction: updatedTransaction
        });
    }
    catch (error) {
        console.error('Update transaction error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.updateTransaction = updateTransaction;
const deleteTransaction = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const transaction = yield database_1.default.transaction.findFirst({
            where: {
                id,
                userId
            }
        });
        if (!transaction) {
            res.status(404).json({ message: 'Transaction not found' });
            return;
        }
        yield database_1.default.transaction.delete({
            where: { id }
        });
        res.json({ message: 'Transaction deleted successfully' });
    }
    catch (error) {
        console.error('Delete transaction error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.deleteTransaction = deleteTransaction;
const getTransactionStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const { startDate, endDate } = req.query;
        const where = { userId };
        // Default to current month if no date range provided
        if (startDate && endDate) {
            where.date = {
                gte: new Date(startDate),
                lte: new Date(endDate)
            };
        }
        else {
            // Get current month data
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
            where.date = {
                gte: startOfMonth,
                lte: endOfMonth
            };
        }
        console.log('TransactionStats Query:', JSON.stringify(where, null, 2));
        const [income, expense] = yield Promise.all([
            database_1.default.transaction.aggregate({
                where: Object.assign(Object.assign({}, where), { type: 'income' }),
                _sum: { amount: true }
            }),
            database_1.default.transaction.aggregate({
                where: Object.assign(Object.assign({}, where), { type: 'expense' }),
                _sum: { amount: true }
            })
        ]);
        console.log('Income aggregate:', income);
        console.log('Expense aggregate:', expense);
        const totalIncome = income._sum.amount || 0;
        const totalExpense = expense._sum.amount || 0;
        const balance = totalIncome - totalExpense;
        res.json({
            totalIncome: totalIncome,
            totalExpense: totalExpense,
            balance
        });
    }
    catch (error) {
        console.error('Get transaction stats error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getTransactionStats = getTransactionStats;
const getTransactionsByCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const { startDate, endDate } = req.query;
        const where = { userId };
        if (startDate && endDate) {
            where.date = {
                gte: new Date(startDate),
                lte: new Date(endDate)
            };
        }
        const transactions = yield database_1.default.transaction.groupBy({
            by: ['categoryId'],
            where,
            _sum: {
                amount: true
            },
            _count: {
                id: true
            }
        });
        const categoryStats = yield Promise.all(transactions.map((transaction) => __awaiter(void 0, void 0, void 0, function* () {
            const category = yield database_1.default.category.findUnique({
                where: { id: transaction.categoryId }
            });
            return {
                category,
                totalAmount: transaction._sum.amount,
                count: transaction._count.id
            };
        })));
        res.json(categoryStats);
    }
    catch (error) {
        console.error('Get transactions by category error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getTransactionsByCategory = getTransactionsByCategory;
