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
const externalAPIService_1 = __importDefault(require("../services/externalAPIService"));
class ExternalAPIController {
    // Get currency exchange rates
    getCurrencyRates(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const baseCurrency = req.query.base || 'IDR';
                const rates = yield externalAPIService_1.default.getCurrencyRates(baseCurrency);
                res.json({
                    success: true,
                    data: rates
                });
            }
            catch (error) {
                console.error('Error getting currency rates:', error);
                res.status(500).json({
                    success: false,
                    message: 'Gagal mengambil kurs mata uang'
                });
            }
        });
    }
    // Convert currency
    convertCurrency(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { amount, fromCurrency, toCurrency } = req.body;
                if (!amount || !fromCurrency || !toCurrency) {
                    return res.status(400).json({
                        success: false,
                        message: 'Data amount, fromCurrency, dan toCurrency diperlukan'
                    });
                }
                const convertedAmount = yield externalAPIService_1.default.convertCurrency(parseFloat(amount), fromCurrency, toCurrency);
                res.json({
                    success: true,
                    data: {
                        originalAmount: amount,
                        fromCurrency,
                        toCurrency,
                        convertedAmount,
                        rate: convertedAmount / parseFloat(amount)
                    }
                });
            }
            catch (error) {
                console.error('Error converting currency:', error);
                res.status(500).json({
                    success: false,
                    message: error instanceof Error ? error.message : 'Gagal mengkonversi mata uang'
                });
            }
        });
    }
    // Get stock market data
    getStockData(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { symbols } = req.query;
                if (!symbols) {
                    return res.status(400).json({
                        success: false,
                        message: 'Parameter symbols diperlukan'
                    });
                }
                const symbolArray = Array.isArray(symbols)
                    ? symbols.map(s => s)
                    : [symbols];
                const stockData = yield externalAPIService_1.default.getStockData(symbolArray);
                res.json({
                    success: true,
                    data: stockData
                });
            }
            catch (error) {
                console.error('Error getting stock data:', error);
                res.status(500).json({
                    success: false,
                    message: 'Gagal mengambil data saham'
                });
            }
        });
    }
    // Get popular Indonesian stocks
    getPopularStocks(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const stocks = yield externalAPIService_1.default.getPopularStocks();
                res.json({
                    success: true,
                    data: stocks
                });
            }
            catch (error) {
                console.error('Error getting popular stocks:', error);
                res.status(500).json({
                    success: false,
                    message: 'Gagal mengambil saham populer'
                });
            }
        });
    }
    // Get weather data
    getWeatherData(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { location } = req.query;
                if (!location) {
                    return res.status(400).json({
                        success: false,
                        message: 'Parameter location diperlukan'
                    });
                }
                const weatherData = yield externalAPIService_1.default.getWeatherData(location);
                res.json({
                    success: true,
                    data: weatherData
                });
            }
            catch (error) {
                console.error('Error getting weather data:', error);
                res.status(500).json({
                    success: false,
                    message: 'Gagal mengambil data cuaca'
                });
            }
        });
    }
    // Get financial news
    getFinancialNews(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const category = req.query.category || 'business';
                const limit = parseInt(req.query.limit) || 10;
                const news = yield externalAPIService_1.default.getFinancialNews(category, limit);
                res.json({
                    success: true,
                    data: news
                });
            }
            catch (error) {
                console.error('Error getting financial news:', error);
                res.status(500).json({
                    success: false,
                    message: 'Gagal mengambil berita keuangan'
                });
            }
        });
    }
    // Get news by category
    getNewsByCategory(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { category } = req.params;
                if (!category) {
                    return res.status(400).json({
                        success: false,
                        message: 'Category parameter diperlukan'
                    });
                }
                const news = yield externalAPIService_1.default.getNewsByCategory(category);
                res.json({
                    success: true,
                    data: news
                });
            }
            catch (error) {
                console.error('Error getting news by category:', error);
                res.status(500).json({
                    success: false,
                    message: error instanceof Error ? error.message : 'Gagal mengambil berita'
                });
            }
        });
    }
    // Get trending financial topics
    getTrendingTopics(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const topics = yield externalAPIService_1.default.getTrendingTopics();
                res.json({
                    success: true,
                    data: topics
                });
            }
            catch (error) {
                console.error('Error getting trending topics:', error);
                res.status(500).json({
                    success: false,
                    message: 'Gagal mengambil topik trending'
                });
            }
        });
    }
    // Get market summary
    getMarketSummary(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const summary = yield externalAPIService_1.default.getMarketSummary();
                res.json({
                    success: true,
                    data: summary
                });
            }
            catch (error) {
                console.error('Error getting market summary:', error);
                res.status(500).json({
                    success: false,
                    message: 'Gagal mengambil ringkasan pasar'
                });
            }
        });
    }
    // Save user's external service preferences
    saveServicePreferences(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.user.id;
                const { serviceType, serviceName, settings } = req.body;
                if (!serviceType || !serviceName || !settings) {
                    return res.status(400).json({
                        success: false,
                        message: 'Data serviceType, serviceName, dan settings diperlukan'
                    });
                }
                const result = yield externalAPIService_1.default.saveServicePreferences(userId, serviceType, serviceName, settings);
                res.json(result);
            }
            catch (error) {
                console.error('Error saving service preferences:', error);
                res.status(500).json({
                    success: false,
                    message: error instanceof Error ? error.message : 'Gagal menyimpan preferensi layanan'
                });
            }
        });
    }
    // Get user's connected services
    getUserServices(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.user.id;
                const result = yield externalAPIService_1.default.getUserServices(userId);
                res.json(result);
            }
            catch (error) {
                console.error('Error getting user services:', error);
                res.status(500).json({
                    success: false,
                    message: 'Gagal mengambil layanan pengguna'
                });
            }
        });
    }
    // Disconnect external service
    disconnectService(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.user.id;
                const { serviceId } = req.params;
                if (!serviceId) {
                    return res.status(400).json({
                        success: false,
                        message: 'Service ID diperlukan'
                    });
                }
                const result = yield externalAPIService_1.default.disconnectService(serviceId, userId);
                res.json(result);
            }
            catch (error) {
                console.error('Error disconnecting service:', error);
                res.status(500).json({
                    success: false,
                    message: 'Gagal memutuskan layanan'
                });
            }
        });
    }
    // Get service status
    getServiceStatus(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const status = yield externalAPIService_1.default.getServiceStatus();
                res.json(status);
            }
            catch (error) {
                console.error('Error getting service status:', error);
                res.status(500).json({
                    success: false,
                    message: 'Gagal memeriksa status layanan'
                });
            }
        });
    }
}
exports.default = new ExternalAPIController();
