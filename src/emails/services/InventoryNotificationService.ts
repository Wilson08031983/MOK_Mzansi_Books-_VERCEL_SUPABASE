import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { LowStockEmail } from '../templates/LowStockEmail';

// Local storage keys
const INVENTORY_ITEMS_KEY = 'inventoryItems';
const NOTIFICATION_SETTINGS_KEY = 'notificationSettings';
const NOTIFICATION_HISTORY_KEY = 'notificationHistory';

// Default notification settings
const DEFAULT_SETTINGS = {
  emailNotifications: true,
  notificationThreshold: 3, // days
  lastNotificationSent: null,
  recipients: [],
};

interface InventoryItem {
  id: string;
  name: string;
  sku?: string;
  currentStock: number;
  minimumStock: number;
  category?: string;
  lastRestocked?: string;
  // Add other inventory item properties as needed
}

interface NotificationSettings {
  emailNotifications: boolean;
  notificationThreshold: number;
  lastNotificationSent: string | null;
  recipients: string[];
  // Add other notification settings as needed
}

interface NotificationHistory {
  id: string;
  date: string;
  type: 'low_stock' | 'out_of_stock' | 'restock_reminder';
  items: Array<{
    id: string;
    name: string;
    currentStock: number;
    minimumStock: number;
  }>;
  sentTo: string[];
  viewed: boolean;
}

class InventoryNotificationService {
  private settings: NotificationSettings;
  private companyName: string;
  private baseUrl: string;

  constructor(companyName: string = 'MOK Mzansi Books', baseUrl: string = window.location.origin) {
    this.companyName = companyName;
    this.baseUrl = baseUrl;
    this.settings = this.loadSettings();
  }

  // Load notification settings from localStorage
  private loadSettings(): NotificationSettings {
    try {
      const settings = localStorage.getItem(NOTIFICATION_SETTINGS_KEY);
      return settings ? JSON.parse(settings) : { ...DEFAULT_SETTINGS };
    } catch (error) {
      console.error('Error loading notification settings:', error);
      return { ...DEFAULT_SETTINGS };
    }
  }

  // Save notification settings to localStorage
  private saveSettings(): void {
    try {
      localStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(this.settings));
    } catch (error) {
      console.error('Error saving notification settings:', error);
    }
  }

  // Get current notification settings
  public getSettings(): NotificationSettings {
    return { ...this.settings };
  }

  // Update notification settings
  public updateSettings(updates: Partial<NotificationSettings>): void {
    this.settings = { ...this.settings, ...updates };
    this.saveSettings();
  }

  // Check for low stock items
  public checkLowStock(): InventoryItem[] {
    try {
      const items = this.getInventoryItems();
      return items.filter(item => item.currentStock <= item.minimumStock);
    } catch (error) {
      console.error('Error checking low stock items:', error);
      return [];
    }
  }

  // Get inventory items from localStorage
  private getInventoryItems(): InventoryItem[] {
    try {
      const items = localStorage.getItem(INVENTORY_ITEMS_KEY);
      return items ? JSON.parse(items) : [];
    } catch (error) {
      console.error('Error loading inventory items:', error);
      return [];
    }
  }

  // Send low stock notification
  public async sendLowStockNotification(recipients?: string[]): Promise<boolean> {
    if (!this.settings.emailNotifications) {
      console.log('Email notifications are disabled');
      return false;
    }

    const lowStockItems = this.checkLowStock();
    if (lowStockItems.length === 0) {
      console.log('No low stock items to report');
      return false;
    }

    const targetRecipients = recipients?.length ? recipients : this.settings.recipients;
    if (targetRecipients.length === 0) {
      console.warn('No recipients specified for low stock notification');
      return false;
    }

    try {
      const emailContent = renderToStaticMarkup(
        React.createElement(LowStockEmail, {
          items: lowStockItems,
          companyName: this.companyName,
          inventoryLink: `${this.baseUrl}/inventory`,
        })
      );

      // In a real implementation, you would send the email here
      // For now, we'll just log it and save to notification history
      console.log('Sending low stock notification to:', targetRecipients);
      console.log('Email content:', emailContent);

      // Save to notification history
      this.saveNotificationHistory({
        date: new Date().toISOString(),
        type: 'low_stock',
        items: lowStockItems.map(item => ({
          id: item.id,
          name: item.name,
          currentStock: item.currentStock,
          minimumStock: item.minimumStock,
        })),
        sentTo: targetRecipients,
        viewed: false,
      });

      // Update last notification sent time
      this.updateSettings({
        lastNotificationSent: new Date().toISOString(),
      });

      return true;
    } catch (error) {
      console.error('Error sending low stock notification:', error);
      return false;
    }
  }

  // Save notification to history
  private saveNotificationHistory(notification: Omit<NotificationHistory, 'id'>): void {
    try {
      const history = this.getNotificationHistory();
      const newNotification = {
        ...notification,
        id: `notification_${Date.now()}`,
      };
      
      history.unshift(newNotification);
      
      // Keep only the last 100 notifications
      const recentHistory = history.slice(0, 100);
      
      localStorage.setItem(NOTIFICATION_HISTORY_KEY, JSON.stringify(recentHistory));
    } catch (error) {
      console.error('Error saving notification history:', error);
    }
  }

  // Get notification history
  public getNotificationHistory(): NotificationHistory[] {
    try {
      const history = localStorage.getItem(NOTIFICATION_HISTORY_KEY);
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.error('Error loading notification history:', error);
      return [];
    }
  }

  // Mark notification as viewed
  public markAsViewed(notificationId: string): void {
    try {
      const history = this.getNotificationHistory();
      const updatedHistory = history.map(notification => 
        notification.id === notificationId 
          ? { ...notification, viewed: true } 
          : notification
      );
      
      localStorage.setItem(NOTIFICATION_HISTORY_KEY, JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Error marking notification as viewed:', error);
    }
  }
}

// Create a singleton instance
export const inventoryNotificationService = new InventoryNotificationService();

export default InventoryNotificationService;
