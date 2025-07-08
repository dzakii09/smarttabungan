import React, { useState, useEffect } from 'react';
import { Bell, Check, Trash2, Filter, Search } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import api from '../api';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  priority: string;
  isRead: boolean;
  createdAt: string;
  metadata?: any;
}

const Notifications: React.FC = () => {
  const { token } = useApp();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');

  const fetchNotifications = async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      const response = await api.get('/notifications?limit=100', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = (response.data as any).data || response.data;
      setNotifications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    if (!token) return;
    
    try {
      await api.patch(`/notifications/${notificationId}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!token) return;
    
    try {
      await api.patch('/notifications/mark-all-read', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    if (!token) return;
    
    try {
      await api.delete(`/notifications/${notificationId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-red-500 bg-red-50';
      case 'medium':
        return 'border-yellow-500 bg-yellow-50';
      case 'low':
        return 'border-blue-500 bg-blue-50';
      default:
        return 'border-gray-300 bg-gray-50';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'Tinggi';
      case 'medium':
        return 'Sedang';
      case 'low':
        return 'Rendah';
      default:
        return 'Sedang';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'budget_alert':
        return '💰';
      case 'bill_reminder':
        return '💳';
      case 'savings_goal':
        return '🎯';
      case 'unusual_spending':
        return '🔍';
      case 'system':
        return 'ℹ️';
      default:
        return '📢';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'budget_alert':
        return 'Alert Budget';
      case 'bill_reminder':
        return 'Pengingat Tagihan';
      case 'savings_goal':
        return 'Tujuan Tabungan';
      case 'unusual_spending':
        return 'Pengeluaran Tidak Biasa';
      case 'system':
        return 'Sistem';
      default:
        return 'Notifikasi';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || notification.type === filterType;
    const matchesPriority = filterPriority === 'all' || notification.priority === filterPriority;
    
    return matchesSearch && matchesType && matchesPriority;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    if (token) {
      fetchNotifications();
    }
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">Notifikasi</h1>
          <p className="text-neutral-600">
            {unreadCount > 0 ? `${unreadCount} notifikasi belum dibaca` : 'Semua notifikasi telah dibaca'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Tandai Semua Dibaca
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-neutral-100">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Cari notifikasi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Type Filter */}
          <div className="sm:w-48">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Semua Tipe</option>
              <option value="budget_alert">Alert Budget</option>
              <option value="bill_reminder">Pengingat Tagihan</option>
              <option value="savings_goal">Tujuan Tabungan</option>
              <option value="unusual_spending">Pengeluaran Tidak Biasa</option>
              <option value="system">Sistem</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div className="sm:w-48">
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Semua Prioritas</option>
              <option value="high">Tinggi</option>
              <option value="medium">Sedang</option>
              <option value="low">Rendah</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-lg p-8 text-center shadow-sm border border-neutral-100">
            <Bell className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || filterType !== 'all' || filterPriority !== 'all' 
                ? 'Tidak ada notifikasi yang sesuai filter' 
                : 'Tidak ada notifikasi'}
            </h3>
            <p className="text-gray-500">
              {searchTerm || filterType !== 'all' || filterPriority !== 'all'
                ? 'Coba ubah filter atau kata kunci pencarian'
                : 'Anda akan menerima notifikasi di sini ketika ada update penting'}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`bg-white rounded-lg p-4 shadow-sm border-l-4 ${getPriorityColor(notification.priority)} ${
                !notification.isRead ? 'ring-2 ring-blue-200' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-2xl">{getTypeIcon(notification.type)}</span>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-gray-900">
                          {notification.title}
                        </h3>
                        {!notification.isRead && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            Baru
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-sm text-gray-500">
                          {getTypeLabel(notification.type)}
                        </span>
                        <span className="text-gray-300">•</span>
                        <span className="text-sm text-gray-500">
                          Prioritas {getPriorityLabel(notification.priority)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-3">{notification.message}</p>
                  <p className="text-sm text-gray-400">
                    {formatDate(notification.createdAt)}
                  </p>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  {!notification.isRead && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors"
                      title="Tandai sebagai dibaca"
                    >
                      <Check size={16} />
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(notification.id)}
                    className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                    title="Hapus notifikasi"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications; 