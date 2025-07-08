import { Request, Response } from 'express';
import externalAPIService from '../services/externalAPIService';

class ExternalAPIController {
  // Get currency exchange rates
  async getCurrencyRates(req: Request, res: Response) {
    try {
      const baseCurrency = req.query.base as string || 'IDR';
      const rates = await externalAPIService.getCurrencyRates(baseCurrency);
      
      res.json({
        success: true,
        data: rates
      });
    } catch (error) {
      console.error('Error getting currency rates:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil kurs mata uang'
      });
    }
  }

  // Convert currency
  async convertCurrency(req: Request, res: Response) {
    try {
      const { amount, fromCurrency, toCurrency } = req.body;

      if (!amount || !fromCurrency || !toCurrency) {
        return res.status(400).json({
          success: false,
          message: 'Data amount, fromCurrency, dan toCurrency diperlukan'
        });
      }

      const convertedAmount = await externalAPIService.convertCurrency(
        parseFloat(amount),
        fromCurrency,
        toCurrency
      );

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
    } catch (error) {
      console.error('Error converting currency:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Gagal mengkonversi mata uang'
      });
    }
  }

  // Get stock market data
  async getStockData(req: Request, res: Response) {
    try {
      const { symbols } = req.query;
      
      if (!symbols) {
        return res.status(400).json({
          success: false,
          message: 'Parameter symbols diperlukan'
        });
      }

      const symbolArray = Array.isArray(symbols) 
        ? symbols.map(s => s as string) 
        : [symbols as string];
      const stockData = await externalAPIService.getStockData(symbolArray);

      res.json({
        success: true,
        data: stockData
      });
    } catch (error) {
      console.error('Error getting stock data:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil data saham'
      });
    }
  }

  // Get popular Indonesian stocks
  async getPopularStocks(req: Request, res: Response) {
    try {
      const stocks = await externalAPIService.getPopularStocks();
      
      res.json({
        success: true,
        data: stocks
      });
    } catch (error) {
      console.error('Error getting popular stocks:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil saham populer'
      });
    }
  }

  // Get weather data
  async getWeatherData(req: Request, res: Response) {
    try {
      const { location } = req.query;

      if (!location) {
        return res.status(400).json({
          success: false,
          message: 'Parameter location diperlukan'
        });
      }

      const weatherData = await externalAPIService.getWeatherData(location as string);

      res.json({
        success: true,
        data: weatherData
      });
    } catch (error) {
      console.error('Error getting weather data:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil data cuaca'
      });
    }
  }

  // Get financial news
  async getFinancialNews(req: Request, res: Response) {
    try {
      const category = req.query.category as string || 'business';
      const limit = parseInt(req.query.limit as string) || 10;

      const news = await externalAPIService.getFinancialNews(category, limit);

      res.json({
        success: true,
        data: news
      });
    } catch (error) {
      console.error('Error getting financial news:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil berita keuangan'
      });
    }
  }

  // Get news by category
  async getNewsByCategory(req: Request, res: Response) {
    try {
      const { category } = req.params;

      if (!category) {
        return res.status(400).json({
          success: false,
          message: 'Category parameter diperlukan'
        });
      }

      const news = await externalAPIService.getNewsByCategory(category);

      res.json({
        success: true,
        data: news
      });
    } catch (error) {
      console.error('Error getting news by category:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Gagal mengambil berita'
      });
    }
  }

  // Get trending financial topics
  async getTrendingTopics(req: Request, res: Response) {
    try {
      const topics = await externalAPIService.getTrendingTopics();

      res.json({
        success: true,
        data: topics
      });
    } catch (error) {
      console.error('Error getting trending topics:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil topik trending'
      });
    }
  }

  // Get market summary
  async getMarketSummary(req: Request, res: Response) {
    try {
      const summary = await externalAPIService.getMarketSummary();

      res.json({
        success: true,
        data: summary
      });
    } catch (error) {
      console.error('Error getting market summary:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil ringkasan pasar'
      });
    }
  }

  // Save user's external service preferences
  async saveServicePreferences(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { serviceType, serviceName, settings } = req.body;

      if (!serviceType || !serviceName || !settings) {
        return res.status(400).json({
          success: false,
          message: 'Data serviceType, serviceName, dan settings diperlukan'
        });
      }

      const result = await externalAPIService.saveServicePreferences(
        userId,
        serviceType,
        serviceName,
        settings
      );

      res.json(result);
    } catch (error) {
      console.error('Error saving service preferences:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Gagal menyimpan preferensi layanan'
      });
    }
  }

  // Get user's connected services
  async getUserServices(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const result = await externalAPIService.getUserServices(userId);

      res.json(result);
    } catch (error) {
      console.error('Error getting user services:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil layanan pengguna'
      });
    }
  }

  // Disconnect external service
  async disconnectService(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { serviceId } = req.params;

      if (!serviceId) {
        return res.status(400).json({
          success: false,
          message: 'Service ID diperlukan'
        });
      }

      const result = await externalAPIService.disconnectService(serviceId, userId);

      res.json(result);
    } catch (error) {
      console.error('Error disconnecting service:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal memutuskan layanan'
      });
    }
  }

  // Get service status
  async getServiceStatus(req: Request, res: Response) {
    try {
      const status = await externalAPIService.getServiceStatus();

      res.json(status);
    } catch (error) {
      console.error('Error getting service status:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal memeriksa status layanan'
      });
    }
  }
}

export default new ExternalAPIController(); 