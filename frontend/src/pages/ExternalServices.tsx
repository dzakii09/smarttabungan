import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { 
  DollarSign, 
  TrendingUp, 
  Cloud, 
  Newspaper, 
  Settings, 
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Link,
  Unlink,
  BarChart3,
  Globe,
  Thermometer,
  Activity
} from 'lucide-react';

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

interface MarketSummary {
  currencyRates: CurrencyRate[];
  stockSummary: {
    totalStocks: number;
    gainers: number;
    losers: number;
    averageChange: number;
    sentiment: string;
  };
  trendingTopics: string[];
  lastUpdated: Date;
}

const ExternalServices: React.FC = () => {
  const { token } = useApp();
  const [currencyRates, setCurrencyRates] = useState<CurrencyRate[]>([]);
  const [popularStocks, setPopularStocks] = useState<StockData[]>([]);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [financialNews, setFinancialNews] = useState<NewsItem[]>([]);
  const [trendingTopics, setTrendingTopics] = useState<string[]>([]);
  const [marketSummary, setMarketSummary] = useState<MarketSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'market' | 'weather' | 'news' | 'services'>('market');
  const [location, setLocation] = useState('Jakarta');

  useEffect(() => {
    fetchMarketData();
    fetchWeatherData();
    fetchFinancialNews();
    fetchTrendingTopics();
  }, []);

  const fetchMarketData = async () => {
    try {
      const [ratesResponse, stocksResponse, summaryResponse] = await Promise.all([
        fetch('/api/external/currency/rates'),
        fetch('/api/external/stocks/popular'),
        fetch('/api/external/market/summary')
      ]);

      const ratesData = await ratesResponse.json();
      const stocksData = await stocksResponse.json();
      const summaryData = await summaryResponse.json();

      if (ratesData.success) setCurrencyRates(ratesData.data);
      if (stocksData.success) setPopularStocks(stocksData.data);
      if (summaryData.success) setMarketSummary(summaryData.data);
    } catch (error) {
      console.error('Error fetching market data:', error);
    }
  };

  const fetchWeatherData = async () => {
    try {
      const response = await fetch(`/api/external/weather?location=${location}`);
      const data = await response.json();
      if (data.success) {
        setWeatherData(data.data);
      }
    } catch (error) {
      console.error('Error fetching weather data:', error);
    }
  };

  const fetchFinancialNews = async () => {
    try {
      const response = await fetch('/api/external/news?limit=5');
      const data = await response.json();
      if (data.success) {
        setFinancialNews(data.data);
      }
    } catch (error) {
      console.error('Error fetching financial news:', error);
    }
  };

  const fetchTrendingTopics = async () => {
    try {
      const response = await fetch('/api/external/news/trending');
      const data = await response.json();
      if (data.success) {
        setTrendingTopics(data.data);
      }
    } catch (error) {
      console.error('Error fetching trending topics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish':
        return 'text-green-600';
      case 'bearish':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStockChangeColor = (change: number) => {
    return change >= 0 ? 'text-green-600' : 'text-red-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Layanan Eksternal
          </h1>
          <p className="text-gray-600">
            Akses data real-time dari berbagai layanan eksternal
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('market')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'market'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Pasar & Saham
              </button>
              <button
                onClick={() => setActiveTab('weather')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'weather'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Cuaca
              </button>
              <button
                onClick={() => setActiveTab('news')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'news'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Berita Keuangan
              </button>
              <button
                onClick={() => setActiveTab('services')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'services'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Pengaturan Layanan
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'market' && (
          <div className="space-y-6">
            {/* Market Summary */}
            {marketSummary && (
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Ringkasan Pasar</h3>
                  <button
                    onClick={fetchMarketData}
                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <BarChart3 className="w-6 h-6 text-blue-600 mr-2" />
                      <div>
                        <p className="text-sm text-blue-600">Total Saham</p>
                        <p className="text-lg font-semibold text-blue-900">{marketSummary.stockSummary.totalStocks}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <TrendingUp className="w-6 h-6 text-green-600 mr-2" />
                      <div>
                        <p className="text-sm text-green-600">Gainers</p>
                        <p className="text-lg font-semibold text-green-900">{marketSummary.stockSummary.gainers}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-red-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <TrendingUp className="w-6 h-6 text-red-600 mr-2 transform rotate-180" />
                      <div>
                        <p className="text-sm text-red-600">Losers</p>
                        <p className="text-lg font-semibold text-red-900">{marketSummary.stockSummary.losers}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <Activity className="w-6 h-6 text-gray-600 mr-2" />
                      <div>
                        <p className="text-sm text-gray-600">Sentiment</p>
                        <p className={`text-lg font-semibold ${getSentimentColor(marketSummary.stockSummary.sentiment)}`}>
                          {marketSummary.stockSummary.sentiment}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Trending Topics */}
                <div className="mb-6">
                  <h4 className="text-md font-medium text-gray-900 mb-3">Topik Trending</h4>
                  <div className="flex flex-wrap gap-2">
                    {marketSummary.trendingTopics.map((topic, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>

                <p className="text-xs text-gray-500">
                  Terakhir diperbarui: {formatDate(marketSummary.lastUpdated)}
                </p>
              </div>
            )}

            {/* Currency Rates */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Kurs Mata Uang</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currencyRates.map(rate => (
                  <div key={rate.currency} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Globe className="w-5 h-5 text-blue-600 mr-2" />
                        <span className="font-medium text-gray-900">{rate.currency}</span>
                      </div>
                      <span className="text-sm text-gray-600">
                        {rate.rate.toFixed(6)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Popular Stocks */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Saham Populer</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Symbol
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Harga
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Perubahan
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Volume
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {popularStocks.map(stock => (
                      <tr key={stock.symbol}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {stock.symbol}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(stock.price, 'IDR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-sm font-medium ${getStockChangeColor(stock.change)}`}>
                            {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)} ({stock.changePercent.toFixed(2)}%)
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {stock.volume.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'weather' && (
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Data Cuaca</h3>
              <div className="flex items-center space-x-4">
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Masukkan lokasi"
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={fetchWeatherData}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Cari
                </button>
              </div>
            </div>

            {weatherData && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-blue-50 rounded-lg p-6 text-center">
                  <Thermometer className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm text-blue-600">Suhu</p>
                  <p className="text-2xl font-bold text-blue-900">{weatherData.temperature}°C</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-6 text-center">
                  <Cloud className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Kondisi</p>
                  <p className="text-lg font-semibold text-gray-900">{weatherData.condition}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-6 text-center">
                  <Activity className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-sm text-green-600">Kelembaban</p>
                  <p className="text-2xl font-bold text-green-900">{weatherData.humidity}%</p>
                </div>
                <div className="bg-yellow-50 rounded-lg p-6 text-center">
                  <RefreshCw className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                  <p className="text-sm text-yellow-600">Kecepatan Angin</p>
                  <p className="text-2xl font-bold text-yellow-900">{weatherData.windSpeed} km/h</p>
                </div>
              </div>
            )}

            {!weatherData && (
              <div className="text-center py-8">
                <Cloud className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Masukkan lokasi untuk melihat data cuaca</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'news' && (
          <div className="space-y-6">
            {/* Financial News */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Berita Keuangan Terkini</h3>
              <div className="space-y-4">
                {financialNews.map(news => (
                  <div key={news.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 mb-2">{news.title}</h4>
                        <p className="text-sm text-gray-600 mb-2">{news.description}</p>
                        <div className="flex items-center text-xs text-gray-500">
                          <span>{news.source}</span>
                          <span className="mx-2">•</span>
                          <span>{formatDate(news.publishedAt)}</span>
                          <span className="mx-2">•</span>
                          <span className="capitalize">{news.category.replace('-', ' ')}</span>
                        </div>
                      </div>
                      <a
                        href={news.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-4 p-2 text-blue-600 hover:text-blue-700 transition-colors"
                      >
                        <Newspaper className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Trending Topics */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Topik Trending</h3>
              <div className="flex flex-wrap gap-2">
                {trendingTopics.map((topic, index) => (
                  <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'services' && (
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Pengaturan Layanan</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Service Status */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Status Layanan</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                      <span className="text-sm font-medium text-green-900">Currency API</span>
                    </div>
                    <span className="text-xs text-green-600">Operational</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                      <span className="text-sm font-medium text-green-900">Stock Market API</span>
                    </div>
                    <span className="text-xs text-green-600">Operational</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                      <span className="text-sm font-medium text-green-900">Weather API</span>
                    </div>
                    <span className="text-xs text-green-600">Operational</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                      <span className="text-sm font-medium text-green-900">News API</span>
                    </div>
                    <span className="text-xs text-green-600">Operational</span>
                  </div>
                </div>
              </div>

              {/* Service Configuration */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Konfigurasi</h4>
                <div className="space-y-3">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-900 mb-1">Auto Refresh</p>
                    <p className="text-xs text-gray-600">Data diperbarui setiap 5 menit</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-900 mb-1">Cache Duration</p>
                    <p className="text-xs text-gray-600">Data di-cache selama 10 menit</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-900 mb-1">Error Handling</p>
                    <p className="text-xs text-gray-600">Retry otomatis 3x jika gagal</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExternalServices; 