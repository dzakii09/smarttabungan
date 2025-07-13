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
exports.updateGoalProgress = exports.deleteGoal = exports.updateGoal = exports.getGoalById = exports.getGoals = exports.createGoal = void 0;
const database_1 = __importDefault(require("../utils/database"));
const notificationService_1 = __importDefault(require("../services/notificationService"));
const createGoal = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { title, description, targetAmount, targetDate } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        // Validasi userId
        if (!userId) {
            return res.status(401).json({ message: 'Gagal menyimpan goal' });
        }
        const goal = yield database_1.default.goal.create({
            data: {
                title,
                description,
                targetAmount: parseFloat(targetAmount),
                targetDate: targetDate ? new Date(targetDate) : null,
                userId
            }
        });
        // Create notification for new goal
        try {
            yield notificationService_1.default.createSystemNotification(userId, '🎯 Tujuan Baru Dibuat', `Tujuan "${title}" dengan target Rp ${parseFloat(targetAmount).toLocaleString('id-ID')} telah dibuat`, 'low');
        }
        catch (notificationError) {
            console.error('Error creating goal notification:', notificationError);
        }
        res.status(201).json({
            message: 'Goal created successfully',
            goal
        });
    }
    catch (error) {
        console.error('Create goal error:', error);
        res.status(500).json({ message: 'Gagal menyimpan goal' });
    }
});
exports.createGoal = createGoal;
const getGoals = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const goals = yield database_1.default.goal.findMany({
            where: { userId },
            orderBy: {
                createdAt: 'desc'
            }
        });
        res.json(goals);
    }
    catch (error) {
        console.error('Get goals error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getGoals = getGoals;
const getGoalById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const goal = yield database_1.default.goal.findFirst({
            where: {
                id,
                userId
            }
        });
        if (!goal) {
            res.status(404).json({ message: 'Goal not found' });
            return;
        }
        res.json(goal);
    }
    catch (error) {
        console.error('Get goal error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getGoalById = getGoalById;
const updateGoal = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const { title, description, targetAmount, targetDate, currentAmount, isCompleted } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const goal = yield database_1.default.goal.findFirst({
            where: {
                id,
                userId
            }
        });
        if (!goal) {
            res.status(404).json({ message: 'Goal not found' });
            return;
        }
        const updatedGoal = yield database_1.default.goal.update({
            where: { id },
            data: {
                title,
                description,
                targetAmount: targetAmount ? parseFloat(targetAmount) : undefined,
                targetDate: targetDate ? new Date(targetDate) : undefined,
                currentAmount: currentAmount ? parseFloat(currentAmount) : undefined,
                isCompleted
            }
        });
        res.json({
            message: 'Goal updated successfully',
            goal: updatedGoal
        });
    }
    catch (error) {
        console.error('Update goal error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.updateGoal = updateGoal;
const deleteGoal = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const goal = yield database_1.default.goal.findFirst({
            where: {
                id,
                userId
            }
        });
        if (!goal) {
            res.status(404).json({ message: 'Goal not found' });
            return;
        }
        yield database_1.default.goal.delete({
            where: { id }
        });
        res.json({ message: 'Goal deleted successfully' });
    }
    catch (error) {
        console.error('Delete goal error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.deleteGoal = deleteGoal;
const updateGoalProgress = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const { currentAmount } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const goal = yield database_1.default.goal.findFirst({
            where: {
                id,
                userId
            }
        });
        if (!goal) {
            res.status(404).json({ message: 'Goal not found' });
            return;
        }
        const newCurrentAmount = parseFloat(currentAmount);
        const isCompleted = newCurrentAmount >= goal.targetAmount;
        const wasCompleted = goal.isCompleted;
        const updatedGoal = yield database_1.default.goal.update({
            where: { id },
            data: {
                currentAmount: newCurrentAmount,
                isCompleted
            }
        });
        // Create notifications for goal progress
        try {
            const progress = (newCurrentAmount / goal.targetAmount) * 100;
            if (isCompleted && !wasCompleted) {
                // Goal completed
                yield notificationService_1.default.createSystemNotification(userId, '🎉 Tujuan Tercapai!', `Selamat! Anda telah mencapai tujuan "${goal.title}"`, 'high');
            }
            else if (progress >= 75 && progress < 100) {
                // Near completion
                yield notificationService_1.default.createSystemNotification(userId, '🎯 Hampir Tercapai!', `Tujuan "${goal.title}" sudah ${Math.round(progress)}% tercapai`, 'medium');
            }
        }
        catch (notificationError) {
            console.error('Error creating goal progress notification:', notificationError);
        }
        res.json({
            message: 'Goal progress updated successfully',
            goal: updatedGoal
        });
    }
    catch (error) {
        console.error('Update goal progress error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.updateGoalProgress = updateGoalProgress;
