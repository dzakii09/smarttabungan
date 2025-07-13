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
exports.deleteCategory = exports.updateCategory = exports.getCategoryById = exports.getCategories = exports.createCategory = void 0;
const database_1 = __importDefault(require("../utils/database"));
const createCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, type, icon, color } = req.body;
        const category = yield database_1.default.category.create({
            data: { name, type, icon, color }
        });
        res.status(201).json({
            message: 'Category created successfully',
            category
        });
    }
    catch (error) {
        console.error('Create category error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.createCategory = createCategory;
const getCategories = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { type } = req.query;
        const where = {};
        if (type) {
            where.type = type;
        }
        const categories = yield database_1.default.category.findMany({
            where,
            orderBy: { name: 'asc' }
        });
        res.json(categories);
    }
    catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getCategories = getCategories;
const getCategoryById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const category = yield database_1.default.category.findUnique({ where: { id } });
        if (!category) {
            res.status(404).json({ message: 'Category not found' });
            return;
        }
        res.json(category);
    }
    catch (error) {
        console.error('Get category error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getCategoryById = getCategoryById;
const updateCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { name, type, icon, color } = req.body;
        const category = yield database_1.default.category.findUnique({ where: { id } });
        if (!category) {
            res.status(404).json({ message: 'Category not found' });
            return;
        }
        const updatedCategory = yield database_1.default.category.update({
            where: { id },
            data: { name, type, icon, color }
        });
        res.json({
            message: 'Category updated successfully',
            category: updatedCategory
        });
    }
    catch (error) {
        console.error('Update category error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.updateCategory = updateCategory;
const deleteCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const category = yield database_1.default.category.findUnique({ where: { id } });
        if (!category) {
            res.status(404).json({ message: 'Category not found' });
            return;
        }
        yield database_1.default.category.delete({ where: { id } });
        res.json({ message: 'Category deleted successfully' });
    }
    catch (error) {
        console.error('Delete category error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.deleteCategory = deleteCategory;
