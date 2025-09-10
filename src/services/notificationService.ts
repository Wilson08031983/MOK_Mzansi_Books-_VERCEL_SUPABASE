import { safeLocalStorage } from '@/utils/safeAccess';
import { playBeepSound } from '@/utils/audioUtils';

export interface NotificationSettings {
  email: {
    enabled: boolean;
    address: string;
    invoiceReminders: boolean;
    paymentReceived: boolean;
    lowStock: boolean;
    systemAlerts: boolean;
    weeklyReports: boolean;
    monthlyReports: boolean;
  };
  inApp: {
    enabled: boolean;
    sound: boolean;
    desktop: boolean;
    newInvoices: boolean;
    taskReminders: boolean;
    clientMessages: boolean;
    systemUpdates: boolean;
  };
  frequency: {
    invoiceReminders: string;
    reportSchedule: string;
    digestFrequency: string;
  };
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type?: 'invoice' | 'payment' | 'system' | 'task' | 'client';
}

// Helper to retrieve the current user's id for scoping
function getCurrentUserId(): string | null {
  try {
    const raw = localStorage.getItem('mokUser');
    if (!raw) return null;
    const user = JSON.parse(raw);
    return user?.id || null;
  } catch {
    return null;
  }
}

// Compute per-user scoped storage keys to isolate data across accounts
function scopedKey(base: string): string {
  const userId = getCurrentUserId();
  return userId ? `${base}:${userId}` : base; // fallback to base for unauthenticated contexts
}

const defaultSettings: NotificationSettings = {
  email: {
    enabled: true,
    address: 'admin@mokmzansibooks.com',
    invoiceReminders: true,
    paymentReceived: true,
    lowStock: true,
    systemAlerts: true,
    weeklyReports: false,
    monthlyReports: true
  },
  inApp: {
    enabled: true,
    sound: true,
    desktop: true,
    newInvoices: true,
    taskReminders: true,
    clientMessages: true,
    systemUpdates: true
  },
  frequency: {
    invoiceReminders: '7',
    reportSchedule: 'weekly',
    digestFrequency: 'daily'
  }
};

// Get notification settings (scoped per user)
export const getNotificationSettings = (): NotificationSettings => {
  const key = scopedKey('notificationSettings');
  const stored = safeLocalStorage.getItem<NotificationSettings>(key, defaultSettings);
  return { ...defaultSettings, ...stored };
};

// Save notification settings (scoped per user)
export const saveNotificationSettings = (settings: NotificationSettings): void => {
  const key = scopedKey('notificationSettings');
  safeLocalStorage.setItem(key, settings);
};

// Get notifications (scoped per user)
export const getNotifications = (): NotificationItem[] => {
  const key = scopedKey('notifications');
  return safeLocalStorage.getItem<NotificationItem[]>(key, []);
};

// Save notifications (scoped per user)
export const saveNotifications = (notifications: NotificationItem[]): void => {
  const key = scopedKey('notifications');
  safeLocalStorage.setItem(key, notifications);
};

// Add a new notification (scoped per user)
export const addNotification = (notification: Omit<NotificationItem, 'id' | 'date' | 'read'>): void => {
  const settings = getNotificationSettings();
  const notifications = getNotifications();
  
  const newNotification: NotificationItem = {
    ...notification,
    id: Date.now().toString(),
    date: new Date().toISOString(),
    read: false
  };

  // Check if this type of notification is enabled
  const shouldShow = settings.inApp.enabled && (
    (notification.type === 'invoice' && settings.inApp.newInvoices) ||
    (notification.type === 'task' && settings.inApp.taskReminders) ||
    (notification.type === 'client' && settings.inApp.clientMessages) ||
    (notification.type === 'system' && settings.inApp.systemUpdates) ||
    !notification.type // Show if no type specified
  );

  if (shouldShow) {
    notifications.unshift(newNotification);
    
    // Keep only the latest 50 notifications
    if (notifications.length > 50) {
      notifications.splice(50);
    }
    
    saveNotifications(notifications);

    // Play sound if enabled
    if (settings.inApp.sound) {
      playBeepSound();
    }

    // Show desktop notification if enabled and permission granted
    if (settings.inApp.desktop && typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/favicon.ico',
          tag: newNotification.id
        });
      } else if (Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new Notification(notification.title, {
              body: notification.message,
              icon: '/favicon.ico',
              tag: newNotification.id
            });
          }
        });
      }
    }
  }
};

// Mark notification as read (scoped per user)
export const markNotificationAsRead = (id: string): void => {
  const notifications = getNotifications();
  const updated = notifications.map(n => 
    n.id === id ? { ...n, read: true } : n
  );
  saveNotifications(updated);
};

// Mark all notifications as read (scoped per user)
export const markAllNotificationsAsRead = (): void => {
  const notifications = getNotifications();
  const updated = notifications.map(n => ({ ...n, read: true }));
  saveNotifications(updated);
};

// Clear all notifications (scoped per user)
export const clearAllNotifications = (): void => {
  saveNotifications([]);
};

// Request desktop notification permission
export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (typeof window !== 'undefined' && 'Notification' in window) {
    return await Notification.requestPermission();
  }
  return 'denied';
};

// Check if desktop notifications are supported and permitted
export const canShowDesktopNotifications = (): boolean => {
  return typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted';
};