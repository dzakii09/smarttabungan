"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const settingsController_1 = __importDefault(require("../controllers/settingsController"));
const router = express_1.default.Router();
// Get user settings
router.get('/', auth_1.auth, settingsController_1.default.getUserSettings);
// Update user settings
router.put('/', auth_1.auth, settingsController_1.default.updateUserSettings);
// Update user profile
router.put('/profile', auth_1.auth, settingsController_1.default.updateUserProfile);
// Change password
router.put('/change-password', auth_1.auth, settingsController_1.default.changePassword);
// Update notification settings
router.put('/notifications', auth_1.auth, settingsController_1.default.updateNotificationSettings);
// Update appearance settings
router.put('/appearance', auth_1.auth, settingsController_1.default.updateAppearanceSettings);
exports.default = router;
