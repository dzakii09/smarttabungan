import { PrismaClient } from '../../generated/prisma';

const prisma = new PrismaClient();

interface CurrencyRate {
  currency: string;
  rate: number;
  lastUpdated: Date;
}

interface StockData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  lastUpdated: Date;
}

interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  lastUpdated: Date;
}

interface NewsItem {
  id: string;
  title: string;
  description: string;
  url: string;
  publishedAt: Date;
  source: string;
  category: string;
}

class ExternalAPIService {
  private readonly currencyAPIKey = process.env.CURRENCY_API_KEY || 'demo';
  private readonly weatherAPIKey = process.env.WEATHER_API_KEY || 'demo';
  private readonly newsAPIKey = process.env.NEWS_API_KEY || 'demo';

  // Get currency exchange rates
  async getCurrencyRates(baseCurrency: string = 'IDR'): Promise<CurrencyRate[]> {
    try {
      // In real implementation, this would call actual currency API
      // For now, return mock data
      const mockRates: CurrencyRate[] = [
        {
          currency: 'USD',
          rate: 0.000065,
          lastUpdated: new Date()
        },
        {
          currency: 'EUR',
          rate: 0.000060,
          lastUpdated: new Date()
        },
        {
          currency: 'JPY',
          rate: 0.0098,
          lastUpdated: new Date()
        },
        {
          currency: 'SGD',
          rate: 0.000088,
          lastUpdated: new Date()
        },
        {
          currency: 'MYR',
          rate: 0.00031,
          lastUpdated: new Date()
        }
      ];

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      return mockRates;
    } catch (error) {
      console.error('Error getting currency rates:', error);
      throw new Error('Gagal mengambil kurs mata uang');
    }
  }

  // Convert currency
  async convertCurrency(
    amount: number,
    fromCurrency: string,
    toCurrency: string
  ): Promise<number> {
    try {
      if (fromCurrency === toCurrency) {
        return amount;
      }

      const rates = await this.getCurrencyRates(fromCurrency);
      const targetRate = rates.find(rate => rate.currency === toCurrency);

      if (!targetRate) {
        throw new Error(`Kurs untuk ${toCurrency} tidak tersedia`);
      }

      return amount * targetRate.rate;
    } catch (error) {
      console.error('Error converting currency:', error);
      throw new Error('Gagal mengkonversi mata uang');
    }
  }

  // Get stock market data
  async getStockData(symbols: string[]): Promise<StockData[]> {
    try {
      // In real implementation, this would call actual stock API
      // For now, return mock data
      const mockStocks: StockData[] = symbols.map(symbol => ({
        symbol,
        price: Math.random() * 1000 + 100,
        change: (Math.random() - 0.5) * 50,
        changePercent: (Math.random() - 0.5) * 10,
        volume: Math.floor(Math.random() * 1000000),
        marketCap: Math.floor(Math.random() * 1000000000),
        lastUpdated: new Date()
      }));

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));

      return mockStocks;
    } catch (error) {
      console.error('Error getting stock data:', error);
      throw new Error('Gagal mengambil data saham');
    }
  }

  // Get popular Indonesian stocks
  async getPopularStocks(): Promise<StockData[]> {
    const popularSymbols = [
      'BBCA.JK', 'BBRI.JK', 'BMRI.JK', 'ASII.JK', 'TLKM.JK',
      'PGAS.JK', 'KLBF.JK', 'UNVR.JK', 'ICBP.JK', 'INDF.JK'
    ];

    return this.getStockData(popularSymbols);
  }

  // Get weather data
  async getWeatherData(location: string): Promise<WeatherData> {
    try {
      // In real implementation, this would call actual weather API
      // For now, return mock data
      const mockWeather: WeatherData = {
        location,
        temperature: Math.floor(Math.random() * 20) + 20, // 20-40°C
        condition: ['Cerah', 'Berawan', 'Hujan Ringan', 'Hujan Lebat'][Math.floor(Math.random() * 4)],
        humidity: Math.floor(Math.random() * 40) + 40, // 40-80%
        windSpeed: Math.floor(Math.random() * 20) + 5, // 5-25 km/h
        lastUpdated: new Date()
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 600));

      return mockWeather;
    } catch (error) {
      console.error('Error getting weather data:', error);
      throw new Error('Gagal mengambil data cuaca');
    }
  }

  // Get financial news
  async getFinancialNews(category: string = 'business', limit: number = 10): Promise<NewsItem[]> {
    try {
      // In real implementation, this would call actual news API
      // For now, return mock data
      const mockNews: NewsItem[] = [
        {
          id: '1',
          title: 'BI Pertahankan Suku Bunga Acuan di 6%',
          description: 'Bank Indonesia mempertahankan suku bunga acuan 7-day reverse repo rate di level 6% pada rapat dewan gubernur bulan ini.',
          url: 'https://example.com/news/1',
          publishedAt: new Date(),
          source: 'Kompas',
          category: 'monetary-policy'
        },
        {
          id: '2',
          title: 'Rupiah Menguat Terhadap Dollar AS',
          description: 'Nilai tukar rupiah menguat 0.5% terhadap dollar AS di perdagangan hari ini.',
          url: 'https://example.com/news/2',
          publishedAt: new Date(Date.now() - 3600000),
          source: 'Reuters',
          category: 'currency'
        },
        {
          id: '3',
          title: 'IHSG Naik 1.2% di Penutupan',
          description: 'Indeks Harga Saham Gabungan (IHSG) naik 1.2% di penutupan perdagangan hari ini.',
          url: 'https://example.com/news/3',
          publishedAt: new Date(Date.now() - 7200000),
          source: 'Bloomberg',
          category: 'stock-market'
        },
        {
          id: '4',
          title: 'Inflasi Indonesia Terkendali di 3.2%',
          description: 'Tingkat inflasi Indonesia tetap terkendali di level 3.2% pada bulan ini.',
          url: 'https://example.com/news/4',
          publishedAt: new Date(Date.now() - 10800000),
          source: 'CNBC Indonesia',
          category: 'inflation'
        },
        {
          id: '5',
          title: 'Pertumbuhan Ekonomi Q3 Capai 5.1%',
          description: 'Pertumbuhan ekonomi Indonesia pada kuartal ketiga mencapai 5.1% year-on-year.',
          url: 'https://example.com/news/5',
          publishedAt: new Date(Date.now() - 14400000),
          source: 'BPS',
          category: 'economic-growth'
        }
      ];

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 400));

      return mockNews.slice(0, limit);
    } catch (error) {
      console.error('Error getting financial news:', error);
      throw new Error('Gagal mengambil berita keuangan');
    }
  }

  // Get news by category
  async getNewsByCategory(category: string): Promise<NewsItem[]> {
    const categories = {
      'monetary-policy': 'Kebijakan Moneter',
      'currency': 'Mata Uang',
      'stock-market': 'Pasar Saham',
      'inflation': 'Inflasi',
      'economic-growth': 'Pertumbuhan Ekonomi',
      'investment': 'Investasi',
      'banking': 'Perbankan',
      'fintech': 'Fintech'
    };

    if (!categories[category as keyof typeof categories]) {
      throw new Error('Kategori berita tidak valid');
    }

    return this.getFinancialNews(category, 20);
  }

  // Get trending financial topics
  async getTrendingTopics(): Promise<string[]> {
    try {
      // In real implementation, this would analyze news and social media
      // For now, return mock trending topics
      const trendingTopics = [
        'Suku Bunga BI',
        'Rupiah vs Dollar',
        'IHSG Hari Ini',
        'Inflasi Indonesia',
        'Pertumbuhan Ekonomi',
        'Investasi Saham',
        'Crypto Indonesia',
        'Fintech Startup'
      ];

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));

      return trendingTopics;
    } catch (error) {
      console.error('Error getting trending topics:', error);
      throw new Error('Gagal mengambil topik trending');
    }
  }

  // Get market summary
  async getMarketSummary(): Promise<any> {
    try {
      // Get various market data
      const [currencyRates, popularStocks, trendingTopics] = await Promise.all([
        this.getCurrencyRates(),
        this.getPopularStocks(),
        this.getTrendingTopics()
      ]);

      // Calculate market sentiment
      const stockChanges = popularStocks.map(stock => stock.changePercent);
      const averageChange = stockChanges.reduce((sum, change) => sum + change, 0) / stockChanges.length;
      
      let sentiment = 'neutral';
      if (averageChange > 2) sentiment = 'bullish';
      else if (averageChange < -2) sentiment = 'bearish';

      return {
        currencyRates: currencyRates.slice(0, 5), // Top 5 currencies
        stockSummary: {
          totalStocks: popularStocks.length,
          gainers: popularStocks.filter(stock => stock.changePercent > 0).length,
          losers: popularStocks.filter(stock => stock.changePercent < 0).length,
          averageChange,
          sentiment
        },
        trendingTopics: trendingTopics.slice(0, 5), // Top 5 topics
        lastUpdated: new Date()
      };
    } catch (error) {
      console.error('Error getting market summary:', error);
      throw new Error('Gagal mengambil ringkasan pasar');
    }
  }

  // Save user's external service preferences
  async saveServicePreferences(
    userId: string,
    serviceType: string,
    serviceName: string,
    settings: any
  ) {
    try {
      const existingService = await prisma.externalService.findFirst({
        where: {
          userId,
          serviceType,
          serviceName
        }
      });

      if (existingService) {
        await prisma.externalService.update({
          where: { id: existingService.id },
          data: {
            settings,
            lastSync: new Date()
          }
        });
      } else {
        await prisma.externalService.create({
          data: {
            userId,
            serviceType,
            serviceName,
            isConnected: true,
            settings,
            lastSync: new Date()
          }
        });
      }

      return {
        success: true,
        message: 'Preferensi layanan berhasil disimpan'
      };
    } catch (error) {
      console.error('Error saving service preferences:', error);
      throw new Error('Gagal menyimpan preferensi layanan');
    }
  }

  // Get user's connected services
  async getUserServices(userId: string) {
    try {
      const services = await prisma.externalService.findMany({
        where: { userId, isConnected: true }
      });

      return {
        success: true,
        data: services
      };
    } catch (error) {
      console.error('Error getting user services:', error);
      throw new Error('Gagal mengambil layanan pengguna');
    }
  }

  // Disconnect external service
  async disconnectService(serviceId: string, userId: string) {
    try {
      const service = await prisma.externalService.findFirst({
        where: { id: serviceId, userId }
      });

      if (!service) {
        throw new Error('Layanan tidak ditemukan');
      }

      await prisma.externalService.update({
        where: { id: serviceId },
        data: { isConnected: false }
      });

      return {
        success: true,
        message: 'Layanan berhasil diputuskan'
      };
    } catch (error) {
      console.error('Error disconnecting service:', error);
      throw new Error('Gagal memutuskan layanan');
    }
  }

  // Get service status
  async getServiceStatus(): Promise<any> {
    try {
      const services = [
        { name: 'Currency API', status: 'operational' },
        { name: 'Stock Market API', status: 'operational' },
        { name: 'Weather API', status: 'operational' },
        { name: 'News API', status: 'operational' }
      ];

      // Simulate status check
      await new Promise(resolve => setTimeout(resolve, 200));

      return {
        success: true,
        data: {
          services,
          lastChecked: new Date(),
          overallStatus: 'operational'
        }
      };
    } catch (error) {
      console.error('Error getting service status:', error);
      throw new Error('Gagal memeriksa status layanan');
    }
  }
}

export default new ExternalAPIService(); 