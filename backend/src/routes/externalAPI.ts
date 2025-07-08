import express from 'express'
import externalAPIController from '../controllers/externalAPIController'
import { auth } from '../middleware/auth'

const router = express.Router()

// Currency endpoints
router.get('/currency/rates', externalAPIController.getCurrencyRates as any)
router.post('/currency/convert', auth as any, externalAPIController.convertCurrency as any)

// Stock market endpoints
router.get('/stocks/data', externalAPIController.getStockData as any)
router.get('/stocks/popular', externalAPIController.getPopularStocks as any)

// Weather endpoints
router.get('/weather', externalAPIController.getWeatherData as any)

// News endpoints
router.get('/news', externalAPIController.getFinancialNews as any)
router.get('/news/category/:category', externalAPIController.getNewsByCategory as any)
router.get('/news/trending', externalAPIController.getTrendingTopics as any)

// Market summary
router.get('/market/summary', externalAPIController.getMarketSummary as any)

// Service management (requires auth)
router.post('/services/preferences', auth as any, externalAPIController.saveServicePreferences as any)
router.get('/services/user', auth as any, externalAPIController.getUserServices as any)
router.delete('/services/:serviceId', auth as any, externalAPIController.disconnectService as any)
router.get('/services/status', externalAPIController.getServiceStatus as any)

export default router 