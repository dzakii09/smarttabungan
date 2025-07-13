"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const goalController_1 = require("../controllers/goalController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.post('/', auth_1.auth, goalController_1.createGoal);
router.get('/', auth_1.auth, goalController_1.getGoals);
router.get('/:id', auth_1.auth, goalController_1.getGoalById);
router.put('/:id', auth_1.auth, goalController_1.updateGoal);
router.delete('/:id', auth_1.auth, goalController_1.deleteGoal);
router.patch('/:id/progress', auth_1.auth, goalController_1.updateGoalProgress);
exports.default = router;
