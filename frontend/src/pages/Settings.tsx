import React, { useState, useEffect } from 'react';
import { 
  User, 
  Bell, 
  Palette, 
  Shield, 
  Globe,
  Save,
  Eye,
  EyeOff,
  Check,
  X
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import api from '../api';

interface UserSettings {
  profile: {
    name: string;
    email: string;
  };
  notifications: {
    email: boolean;
    push: boolean;
    inApp: boolean;
    budgetAlerts: boolean;
    goalReminders: boolean;
    unusualSpending: boolean;
  };
  appearance: {
    theme: 'light' | 'dark' | 'auto';
    language: 'id' | 'en';
    currency: 'IDR' | 'USD' | 'EUR' | 'SGD' | 'MYR';
  };
  security: {
    changePassword: boolean;
    twoFactorAuth: boolean;
  };
}

const Settings: React.FC = () => {
  const { user, token } = useApp();
  const [settings, setSettings] = useState<UserSettings>({
    profile: {
      name: user?.name || '',
      email: user?.email || '',
    },
    notifications: {
      email: true,
      push: false,
      inApp: true,
      budgetAlerts: true,
      goalReminders: true,
      unusualSpending: true
    },
    appearance: {
      theme: 'light',
      language: 'id',
      currency: 'IDR'
    },
    security: {
      changePassword: false,
      twoFactorAuth: false
    }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'appearance' | 'security'>('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

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

  useEffect(() => {
    if (token) {
      fetchSettings();
    }
  }, [token]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      // For now, we'll use default settings since we removed personalization
      // In the future, you can add a settings endpoint
      setSettings({
        profile: {
          name: user?.name || '',
          email: user?.email || '',
        },
        notifications: {
          email: true,
          push: false,
          inApp: true,
          budgetAlerts: true,
          goalReminders: true,
          unusualSpending: true
        },
        appearance: {
          theme: 'light',
          language: 'id',
          currency: 'IDR'
        },
        security: {
          changePassword: false,
          twoFactorAuth: false
        }
      });
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (updates: Partial<UserSettings>) => {
    try {
      setSaving(true);
      // For now, just update local state
      // In the future, you can add a settings endpoint
      setSettings(prev => ({ ...prev, ...updates }));
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Error updating settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleProfileChange = (field: keyof UserSettings['profile'], value: any) => {
    const updatedProfile = { ...settings.profile, [field]: value };
    setSettings(prev => ({ ...prev, profile: updatedProfile }));
    updateSettings({ profile: updatedProfile });
  };

  const handleNotificationChange = (field: keyof UserSettings['notifications'], value: boolean) => {
    const updatedNotifications = { ...settings.notifications, [field]: value };
    setSettings(prev => ({ ...prev, notifications: updatedNotifications }));
    updateSettings({ notifications: updatedNotifications });
  };

  const handleAppearanceChange = (field: keyof UserSettings['appearance'], value: any) => {
    const updatedAppearance = { ...settings.appearance, [field]: value };
    setSettings(prev => ({ ...prev, appearance: updatedAppearance }));
    updateSettings({ appearance: updatedAppearance });
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Password baru tidak cocok');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      alert('Password minimal 6 karakter');
      return;
    }

    try {
      setSaving(true);
      const response = await api.put('/settings/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        alert('Password berhasil diubah');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setSettings(prev => ({ 
          ...prev, 
          security: { ...prev.security, changePassword: false } 
        }));
      }
    } catch (error) {
      console.error('Error changing password:', error);
      alert('Gagal mengubah password');
    } finally {
      setSaving(false);
    }
  };

  const handleProfileUpdate = async () => {
    try {
      setSaving(true);
      const response = await api.put('/settings/profile', {
        name: settings.profile.name,
        email: settings.profile.email
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        alert('Profil berhasil diperbarui');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Gagal memperbarui profil');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Pengaturan</h1>
          <p className="mt-2 text-gray-600">Kelola profil, notifikasi, tampilan, dan keamanan akun Anda</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'profile', label: 'Profil', icon: User },
              { id: 'notifications', label: 'Notifikasi', icon: Bell },
              { id: 'appearance', label: 'Tampilan', icon: Palette },
              { id: 'security', label: 'Keamanan', icon: Shield }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow">
          {activeTab === 'profile' && (
            <div className="p-6 space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Profil Akun</h2>
              
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={settings.profile.name}
                  onChange={(e) => handleProfileChange('name', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={settings.profile.email}
                  onChange={(e) => handleProfileChange('email', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleProfileUpdate}
                  disabled={saving}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="p-6 space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Pengaturan Notifikasi</h2>
              
              <div className="space-y-4">
                {[
                  { key: 'email', label: 'Notifikasi Email', description: 'Terima notifikasi melalui email' },
                  { key: 'push', label: 'Push Notifications', description: 'Notifikasi di browser' },
                  { key: 'inApp', label: 'Notifikasi dalam Aplikasi', description: 'Notifikasi di dalam aplikasi' },
                  { key: 'budgetAlerts', label: 'Peringatan Budget', description: 'Ketika budget melebihi batas' },
                  { key: 'goalReminders', label: 'Pengingat Tujuan', description: 'Pengingat untuk tujuan keuangan' },
                  { key: 'unusualSpending', label: 'Pengeluaran Tidak Biasa', description: 'Deteksi pengeluaran anomali' }
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">{item.label}</h3>
                      <p className="text-sm text-gray-600">{item.description}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.notifications[item.key as keyof UserSettings['notifications']]}
                        onChange={(e) => handleNotificationChange(
                          item.key as keyof UserSettings['notifications'], 
                          e.target.checked
                        )}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="p-6 space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Pengaturan Tampilan</h2>
              
              {/* Theme */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">Tema</label>
                <div className="grid grid-cols-3 gap-4">
                  {themes.map((theme) => (
                    <button
                      key={theme.value}
                      onClick={() => handleAppearanceChange('theme', theme.value)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        settings.appearance.theme === theme.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-2xl mb-2">{theme.icon}</div>
                      <div className="font-medium text-gray-900">{theme.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Language */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bahasa
                </label>
                <select
                  value={settings.appearance.language}
                  onChange={(e) => handleAppearanceChange('language', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {languages.map((language) => (
                    <option key={language.code} value={language.code}>
                      {language.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Currency */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mata Uang
                </label>
                <select
                  value={settings.appearance.currency}
                  onChange={(e) => handleAppearanceChange('currency', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {currencies.map((currency) => (
                    <option key={currency.code} value={currency.code}>
                      {currency.symbol} - {currency.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="p-6 space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Pengaturan Keamanan</h2>
              
              {/* Change Password */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">Ubah Password</h3>
                    <p className="text-sm text-gray-600">Perbarui password akun Anda</p>
                  </div>
                  <button
                    onClick={() => setSettings(prev => ({ 
                      ...prev, 
                      security: { ...prev.security, changePassword: !prev.security.changePassword } 
                    }))}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Ubah Password
                  </button>
                </div>

                {settings.security.changePassword && (
                  <div className="p-4 bg-blue-50 rounded-lg space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Password Saat Ini
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                          className="w-full p-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-gray-400" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Password Baru
                      </label>
                      <input
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Konfirmasi Password Baru
                      </label>
                      <input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div className="flex space-x-3">
                      <button
                        onClick={handlePasswordChange}
                        disabled={saving}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                      >
                        {saving ? 'Menyimpan...' : 'Simpan Password'}
                      </button>
                      <button
                        onClick={() => {
                          setSettings(prev => ({ 
                            ...prev, 
                            security: { ...prev.security, changePassword: false } 
                          }));
                          setPasswordData({
                            currentPassword: '',
                            newPassword: '',
                            confirmPassword: ''
                          });
                        }}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                      >
                        Batal
                      </button>
                    </div>
                  </div>
                )}

                {/* Two Factor Auth */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">Two-Factor Authentication</h3>
                    <p className="text-sm text-gray-600">Tingkatkan keamanan dengan 2FA</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.security.twoFactorAuth}
                      onChange={(e) => setSettings(prev => ({ 
                        ...prev, 
                        security: { ...prev.security, twoFactorAuth: e.target.checked } 
                      }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings; 