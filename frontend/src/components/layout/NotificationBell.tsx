import React, { useState } from 'react';
import { Bell, X, Check, Trash2, AlertTriangle, Info, CheckCircle, AlertCircle, Users } from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';
import GroupBudgetInvitations from '../notifications/GroupBudgetInvitations';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error' | 'budget_alert' | 'goal_reminder' | 'recurring_due';
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  metadata?: any;
}

const NotificationBell: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'notifications' | 'invitations'>('notifications');
  
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification
  } = useNotifications();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
      case 'budget_alert':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'goal_reminder':
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case 'recurring_due':
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'border-red-500 bg-red-50';
      case 'high':
        return 'border-orange-500 bg-orange-50';
      case 'medium':
        return 'border-yellow-500 bg-yellow-50';
      default:
        return 'border-gray-300 bg-gray-50';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Baru saja';
    if (diffInMinutes < 60) return `${diffInMinutes}m yang lalu`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}j yang lalu`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}h yang lalu`;
    
    return date.toLocaleDateString('id-ID');
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Notifikasi</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && activeTab === 'notifications' && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    Tandai semua dibaca
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>
            
            {/* Tabs */}
            <div className="flex mt-3 border-b border-gray-200">
              <button
                onClick={() => setActiveTab('notifications')}
                className={`flex-1 py-2 px-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'notifications'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Notifications ({notifications.length})
              </button>
              <button
                onClick={() => setActiveTab('invitations')}
                className={`flex-1 py-2 px-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'invitations'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Users className="w-4 h-4 inline mr-1" />
                Invitations
              </button>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {activeTab === 'notifications' ? (
              <>
                {loading ? (
                  <div className="p-4 text-center text-gray-500">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-2">Memuat notifikasi...</p>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p>Tidak ada notifikasi</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 hover:bg-gray-50 transition-colors ${
                          !notification.isRead ? getPriorityColor(notification.priority) : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {getNotificationIcon(notification.type)}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <h4 className={`text-sm font-medium ${
                                !notification.isRead ? 'text-gray-900' : 'text-gray-600'
                              }`}>
                                {notification.title}
                              </h4>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => markAsRead(notification.id)}
                                  className="p-1 hover:bg-gray-200 rounded-full"
                                  title="Tandai dibaca"
                                >
                                  <Check className="w-3 h-3 text-gray-500" />
                                </button>
                                <button
                                  onClick={() => deleteNotification(notification.id)}
                                  className="p-1 hover:bg-gray-200 rounded-full"
                                  title="Hapus"
                                >
                                  <Trash2 className="w-3 h-3 text-gray-500" />
                                </button>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-400 mt-2">
                              {formatTimeAgo(notification.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <GroupBudgetInvitations onClose={() => setIsOpen(false)} />
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200">
              <button
                onClick={() => {/* Navigate to full notifications page */}}
                className="w-full text-sm text-blue-600 hover:text-blue-800 text-center"
              >
                Lihat semua notifikasi
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell; 