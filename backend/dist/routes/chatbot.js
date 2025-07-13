"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const chatbotController_1 = require("../controllers/chatbotController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Kirim pesan ke chatbot (AI)
router.post('/message', auth_1.auth, chatbotController_1.sendMessage);
// (Opsional) Ambil riwayat percakapan
router.get('/history', auth_1.auth, chatbotController_1.getConversationHistory);
exports.default = router;
