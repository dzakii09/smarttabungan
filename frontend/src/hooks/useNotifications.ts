import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import api from '../api';

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

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
}

export const useNotifications = (): UseNotificationsReturn => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date>(new Date());

  const token = localStorage.getItem('token');

  const fetchNotifications = useCallback(async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      const response = await api.get('/notifications?limit=10', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const data = (response.data as any).data;
      const newNotifications = data.notifications || [];
      const newUnreadCount = data.unreadCount || 0;
      
      // Check for new notifications since last check
      const newNotificationsSinceLastCheck = newNotifications.filter(
        (notif: Notification) => new Date(notif.createdAt) > lastChecked
      );
      
      // Show toast for new notifications
      newNotificationsSinceLastCheck.forEach((notif: Notification) => {
        if (!notif.isRead) {
          const toastType = getToastType(notif.type);
          toast[toastType](notif.title, {
            description: notif.message,
            duration: 5000,
            action: {
              label: 'Lihat',
              onClick: () => {
                // Could navigate to notifications page or mark as read
                markAsRead(notif.id);
              }
            }
          });
        }
      });
      
      setNotifications(newNotifications);
      setUnreadCount(newUnreadCount);
      setLastChecked(new Date());
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [token, lastChecked]);

  const markAsRead = useCallback(async (id: string) => {
    if (!token) return;
    
    try {
      await api.patch(`/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === id ? { ...notif, isRead: true } : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, [token]);

  const markAllAsRead = useCallback(async () => {
    if (!token) return;
    
    try {
      await api.patch('/notifications/mark-all-read', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }, [token]);

  const deleteNotification = useCallback(async (id: string) => {
    if (!token) return;
    
    try {
      await api.delete(`/notifications/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setNotifications(prev => prev.filter(notif => notif.id !== id));
      const deletedNotif = notifications.find(n => n.id === id);
      if (deletedNotif && !deletedNotif.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  }, [token, notifications]);

  // Polling for new notifications every 30 seconds
  useEffect(() => {
    if (!token) return;

    fetchNotifications();
    
    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [token, fetchNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
  };
};

const getToastType = (type: string): 'success' | 'error' | 'warning' | 'info' => {
  switch (type) {
    case 'success':
    case 'goal_reminder':
      return 'success';
    case 'error':
      return 'error';
    case 'warning':
    case 'budget_alert':
    case 'recurring_due':
      return 'warning';
    default:
      return 'info';
  }
}; 