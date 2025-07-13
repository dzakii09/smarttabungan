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
const database_1 = __importDefault(require("./database"));
const defaultCategories = [
    // Income categories
    { name: 'Gaji', type: 'income', icon: 'DollarSign', color: '#10B981' },
    { name: 'Bonus', type: 'income', icon: 'DollarSign', color: '#059669' },
    // Expense categories
    { name: 'Makanan & Minuman', type: 'expense', icon: 'Utensils', color: '#2563EB' },
    { name: 'Transportasi', type: 'expense', icon: 'Car', color: '#059669' },
    { name: 'Belanja', type: 'expense', icon: 'ShoppingBag', color: '#F59E0B' },
    { name: 'Tagihan', type: 'expense', icon: 'DollarSign', color: '#8B5CF6' },
    { name: 'Hiburan', type: 'expense', icon: 'DollarSign', color: '#EF4444' },
    { name: 'Investasi', type: 'expense', icon: 'DollarSign', color: '#DC2626' },
    { name: 'Lainnya', type: 'expense', icon: 'DollarSign', color: '#6B7280' }
];
function seedCategories() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log('Seeding categories...');
            // First, delete all existing categories
            yield database_1.default.category.deleteMany({});
            console.log('Deleted existing categories');
            // Then create new categories
            for (const category of defaultCategories) {
                try {
                    yield database_1.default.category.create({
                        data: category
                    });
                    console.log(`Created category: ${category.name} (${category.type})`);
                }
                catch (error) {
                    console.error(`Error creating category ${category.name} (${category.type}):`, error);
                    // Log more details about the error
                    if (error instanceof Error) {
                        console.error('Error message:', error.message);
                    }
                }
            }
            console.log('Categories seeded successfully!');
        }
        catch (error) {
            console.error('Error seeding categories:', error);
        }
        finally {
            yield database_1.default.$disconnect();
        }
    });
}
// Run if this file is executed directly
if (require.main === module) {
    seedCategories();
}
exports.default = seedCategories;
