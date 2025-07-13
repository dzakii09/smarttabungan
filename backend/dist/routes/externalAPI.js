"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const externalAPIController_1 = __importDefault(require("../controllers/externalAPIController"));
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Currency endpoints
router.get('/currency/rates', externalAPIController_1.default.getCurrencyRates);
router.post('/currency/convert', auth_1.auth, externalAPIController_1.default.convertCurrency);
// Stock market endpoints
router.get('/stocks/data', externalAPIController_1.default.getStockData);
router.get('/stocks/popular', externalAPIController_1.default.getPopularStocks);
// Weather endpoints
router.get('/weather', externalAPIController_1.default.getWeatherData);
// News endpoints
router.get('/news', externalAPIController_1.default.getFinancialNews);
router.get('/news/category/:category', externalAPIController_1.default.getNewsByCategory);
router.get('/news/trending', externalAPIController_1.default.getTrendingTopics);
// Market summary
router.get('/market/summary', externalAPIController_1.default.getMarketSummary);
// Service management (requires auth)
router.post('/services/preferences', auth_1.auth, externalAPIController_1.default.saveServicePreferences);
router.get('/services/user', auth_1.auth, externalAPIController_1.default.getUserServices);
router.delete('/services/:serviceId', auth_1.auth, externalAPIController_1.default.disconnectService);
router.get('/services/status', externalAPIController_1.default.getServiceStatus);
exports.default = router;
