import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Palette, 
  Globe, 
  Bell, 
  Target, 
  Save,
  Eye,
  EyeOff,
  Check,
  X
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import api from '../api';

interface UserPreferences {
  dashboardLayout: string;
  defaultCurrency: string;
  language: string;
  theme: 'light' | 'dark' | 'auto';
  notificationSettings: {
    email: boolean;
    push: boolean;
    inApp: boolean;
    daily: boolean;
    weekly: boolean;
    monthly: boolean;
    budgetAlerts: boolean;
    goalReminders: boolean;
    unusualSpending: boolean;
  };
  financialGoals: {
    monthlySavingsTarget: number;
    emergencyFundTarget: number;
    investmentPercentage: number;
  };
  spendingCategories: string[];
  favoriteFeatures: string[];
}

const UserPreferences: React.FC = () => {
  const { token } = useApp();
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'notifications' | 'goals' | 'features'>('general');

  const currencies = [
    { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp' },
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
    { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM' }
  ];

  const languages = [
    { code: 'id', name: 'Bahasa Indonesia' },
    { code: 'en', name: 'English' }
  ];

  const themes = [
    { value: 'light', name: 'Light', icon: '☀️' },
    { value: 'dark', name: 'Dark', icon: '🌙' },
    { value: 'auto', name: 'Auto', icon: '🔄' }
  ];

  const dashboardLayouts = [
    { value: 'default', name: 'Default' },
    { value: 'compact', name: 'Compact' },
    { value: 'detailed', name: 'Detailed' }
  ];

  const availableFeatures = [
    { id: 'dashboard', name: 'Dashboard', description: 'Ringkasan keuangan utama' },
    { id: 'transactions', name: 'Transactions', description: 'Riwayat transaksi' },
    { id: 'goals', name: 'Goals', description: 'Tujuan keuangan' },
    { id: 'budgets', name: 'Budgets', description: 'Pengaturan budget' },
    { id: 'analytics', name: 'Analytics', description: 'Analisis keuangan' },
    { id: 'ai-recommendations', name: 'AI Recommendations', description: 'Rekomendasi AI' },
    { id: 'chatbot', name: 'Chatbot', description: 'Asisten AI' }
  ];

  useEffect(() => {
    if (token) {
      fetchPreferences();
    }
  }, [token]);

  const fetchPreferences = async () => {
    try {
      setLoading(true);
      const response = await api.get('/personalization/preferences', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPreferences(response.data.data);
    } catch (error) {
      console.error('Error fetching preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePreferences = async (updates: Partial<UserPreferences>) => {
    try {
      setSaving(true);
      const response = await api.put('/personalization/preferences', updates, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPreferences(response.data.data);
    } catch (error) {
      console.error('Error updating preferences:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleGeneralChange = (field: keyof UserPreferences, value: any) => {
    if (!preferences) return;
    
    const updatedPreferences = { ...preferences, [field]: value };
    setPreferences(updatedPreferences);
    updatePreferences(updatedPreferences);
  };

  const handleNotificationChange = (field: keyof UserPreferences['notificationSettings'], value: boolean) => {
    if (!preferences) return;
    
    const updatedPreferences = {
      ...preferences,
      notificationSettings: {
        ...preferences.notificationSettings,
        [field]: value
      }
    };
    setPreferences(updatedPreferences);
    updatePreferences(updatedPreferences);
  };

  const handleFinancialGoalChange = (field: keyof UserPreferences['financialGoals'], value: number) => {
    if (!preferences) return;
    
    const updatedPreferences = {
      ...preferences,
      financialGoals: {
        ...preferences.financialGoals,
        [field]: value
      }
    };
    setPreferences(updatedPreferences);
    updatePreferences(updatedPreferences);
  };

  const toggleFavoriteFeature = (featureId: string) => {
    if (!preferences) return;
    
    const updatedFeatures = preferences.favoriteFeatures.includes(featureId)
      ? preferences.favoriteFeatures.filter(id => id !== featureId)
      : [...preferences.favoriteFeatures, featureId];
    
    const updatedPreferences = {
      ...preferences,
      favoriteFeatures: updatedFeatures
    };
    setPreferences(updatedPreferences);
    updatePreferences(updatedPreferences);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!preferences) {
    return (
      <div className="text-center py-12">
        <Settings className="mx-auto w-12 h-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Tidak dapat memuat preferensi
        </h3>
        <p className="text-gray-500">
          Terjadi kesalahan saat memuat pengaturan
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">User Preferences</h1>
          <p className="text-neutral-600">
            Sesuaikan pengaturan aplikasi sesuai preferensi Anda
          </p>
        </div>
        {saving && (
          <div className="flex items-center space-x-2 text-blue-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm">Menyimpan...</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-neutral-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('general')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'general'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
            }`}
          >
            Umum
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'notifications'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
            }`}
          >
            Notifikasi
          </button>
          <button
            onClick={() => setActiveTab('goals')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'goals'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
            }`}
          >
            Tujuan Keuangan
          </button>
          <button
            onClick={() => setActiveTab('features')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'features'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
            }`}
          >
            Fitur Favorit
          </button>
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'general' && (
        <div className="space-y-6">
          {/* Theme */}
          <div className="bg-white rounded-lg border border-neutral-200 p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center">
              <Palette className="w-5 h-5 mr-2" />
              Tema
            </h3>
            <div className="grid grid-cols-3 gap-4">
              {themes.map((theme) => (
                <button
                  key={theme.value}
                  onClick={() => handleGeneralChange('theme', theme.value)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    preferences.theme === theme.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <div className="text-2xl mb-2">{theme.icon}</div>
                  <div className="font-medium text-neutral-900">{theme.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Currency */}
          <div className="bg-white rounded-lg border border-neutral-200 p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center">
              <Globe className="w-5 h-5 mr-2" />
              Mata Uang
            </h3>
            <select
              value={preferences.defaultCurrency}
              onChange={(e) => handleGeneralChange('defaultCurrency', e.target.value)}
              className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {currencies.map((currency) => (
                <option key={currency.code} value={currency.code}>
                  {currency.symbol} - {currency.name}
                </option>
              ))}
            </select>
          </div>

          {/* Language */}
          <div className="bg-white rounded-lg border border-neutral-200 p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center">
              <Globe className="w-5 h-5 mr-2" />
              Bahasa
            </h3>
            <select
              value={preferences.language}
              onChange={(e) => handleGeneralChange('language', e.target.value)}
              className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {languages.map((language) => (
                <option key={language.code} value={language.code}>
                  {language.name}
                </option>
              ))}
            </select>
          </div>

          {/* Dashboard Layout */}
          <div className="bg-white rounded-lg border border-neutral-200 p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Layout Dashboard</h3>
            <select
              value={preferences.dashboardLayout}
              onChange={(e) => handleGeneralChange('dashboardLayout', e.target.value)}
              className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {dashboardLayouts.map((layout) => (
                <option key={layout.value} value={layout.value}>
                  {layout.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-neutral-200 p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center">
              <Bell className="w-5 h-5 mr-2" />
              Pengaturan Notifikasi
            </h3>
            
            <div className="space-y-4">
              {/* Channel Settings */}
              <div>
                <h4 className="font-medium text-neutral-900 mb-3">Saluran Notifikasi</h4>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={preferences.notificationSettings.email}
                      onChange={(e) => handleNotificationChange('email', e.target.checked)}
                      className="rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-3 text-neutral-700">Email</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={preferences.notificationSettings.push}
                      onChange={(e) => handleNotificationChange('push', e.target.checked)}
                      className="rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-3 text-neutral-700">Push Notification</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={preferences.notificationSettings.inApp}
                      onChange={(e) => handleNotificationChange('inApp', e.target.checked)}
                      className="rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-3 text-neutral-700">In-App Notification</span>
                  </label>
                </div>
              </div>

              {/* Frequency Settings */}
              <div>
                <h4 className="font-medium text-neutral-900 mb-3">Frekuensi Notifikasi</h4>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={preferences.notificationSettings.daily}
                      onChange={(e) => handleNotificationChange('daily', e.target.checked)}
                      className="rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-3 text-neutral-700">Laporan Harian</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={preferences.notificationSettings.weekly}
                      onChange={(e) => handleNotificationChange('weekly', e.target.checked)}
                      className="rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-3 text-neutral-700">Laporan Mingguan</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={preferences.notificationSettings.monthly}
                      onChange={(e) => handleNotificationChange('monthly', e.target.checked)}
                      className="rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-3 text-neutral-700">Laporan Bulanan</span>
                  </label>
                </div>
              </div>

              {/* Alert Settings */}
              <div>
                <h4 className="font-medium text-neutral-900 mb-3">Jenis Alert</h4>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={preferences.notificationSettings.budgetAlerts}
                      onChange={(e) => handleNotificationChange('budgetAlerts', e.target.checked)}
                      className="rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-3 text-neutral-700">Alert Budget</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={preferences.notificationSettings.goalReminders}
                      onChange={(e) => handleNotificationChange('goalReminders', e.target.checked)}
                      className="rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-3 text-neutral-700">Pengingat Tujuan</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={preferences.notificationSettings.unusualSpending}
                      onChange={(e) => handleNotificationChange('unusualSpending', e.target.checked)}
                      className="rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-3 text-neutral-700">Pengeluaran Tidak Biasa</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'goals' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-neutral-200 p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center">
              <Target className="w-5 h-5 mr-2" />
              Tujuan Keuangan
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Target Tabungan Bulanan (Rp)
                </label>
                <input
                  type="number"
                  value={preferences.financialGoals.monthlySavingsTarget}
                  onChange={(e) => handleFinancialGoalChange('monthlySavingsTarget', Number(e.target.value))}
                  className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Target Dana Darurat (Rp)
                </label>
                <input
                  type="number"
                  value={preferences.financialGoals.emergencyFundTarget}
                  onChange={(e) => handleFinancialGoalChange('emergencyFundTarget', Number(e.target.value))}
                  className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Persentase Investasi (%)
                </label>
                <input
                  type="number"
                  value={preferences.financialGoals.investmentPercentage}
                  onChange={(e) => handleFinancialGoalChange('investmentPercentage', Number(e.target.value))}
                  className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                  min="0"
                  max="100"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'features' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-neutral-200 p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Fitur Favorit</h3>
            <p className="text-neutral-600 mb-6">
              Pilih fitur yang ingin ditampilkan di dashboard utama
            </p>
            
            <div className="grid gap-4">
              {availableFeatures.map((feature) => (
                <div
                  key={feature.id}
                  className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                    preferences.favoriteFeatures.includes(feature.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                  onClick={() => toggleFavoriteFeature(feature.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-neutral-900">{feature.name}</h4>
                      <p className="text-sm text-neutral-600">{feature.description}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {preferences.favoriteFeatures.includes(feature.id) ? (
                        <Check className="w-5 h-5 text-blue-600" />
                      ) : (
                        <X className="w-5 h-5 text-neutral-400" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserPreferences; 