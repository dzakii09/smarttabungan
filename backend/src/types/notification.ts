export type NotificationType = 
  | 'info' 
  | 'warning' 
  | 'success' 
  | 'error' 
  | 'budget_alert' 
  | 'goal_reminder' 
  | 'recurring_due'
  | 'budget_invitation';

export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  priority: NotificationPriority;
  scheduledAt?: Date;
  sentAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  metadata?: any;
}

export interface NotificationResponse {
  success: boolean;
  data?: Notification | Notification[];
  message?: string;
  count?: number;
}

export interface NotificationFilters {
  userId: string;
  type?: NotificationType;
  isRead?: boolean;
  priority?: NotificationPriority;
  limit?: number;
  offset?: number;
} 