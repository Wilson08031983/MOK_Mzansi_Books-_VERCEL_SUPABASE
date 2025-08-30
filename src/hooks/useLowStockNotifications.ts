import { useState, useEffect, useCallback } from 'react';
import { inventoryNotificationService } from '../emails/services/InventoryNotificationService';
import { toast } from 'sonner';

export const useLowStockNotifications = () => {
  const [lowStockItems, setLowStockItems] = useState<any[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState(
    inventoryNotificationService.getSettings()
  );
  const [notificationHistory, setNotificationHistory] = useState(
    inventoryNotificationService.getNotificationHistory()
  );

  // Load low stock items and check for notifications
  const checkLowStock = useCallback(async () => {
    setIsChecking(true);
    try {
      const items = inventoryNotificationService.checkLowStock();
      setLowStockItems(items);
      
      // If we have low stock items, show a toast notification
      if (items.length > 0) {
        toast.warning(
          `${items.length} item${items.length > 1 ? 's are' : ' is'} low on stock. Check inventory.`,
          {
            duration: 10000,
            action: {
              label: 'View',
              onClick: () => {
                // Scroll to inventory section or open inventory page
                const inventorySection = document.getElementById('inventory-section');
                if (inventorySection) {
                  inventorySection.scrollIntoView({ behavior: 'smooth' });
                }
              },
            },
          }
        );
      }
      
      return items;
    } catch (error) {
      console.error('Error checking low stock:', error);
      toast.error('Failed to check inventory levels');
      return [];
    } finally {
      setIsChecking(false);
    }
  }, []);

  // Send low stock notification
  const sendLowStockNotification = useCallback(async (recipients?: string[]) => {
    try {
      const success = await inventoryNotificationService.sendLowStockNotification(recipients);
      if (success) {
        toast.success('Low stock notification sent successfully');
      } else {
        toast.info('No low stock items to notify about');
      }
      return success;
    } catch (error) {
      console.error('Error sending notification:', error);
      toast.error('Failed to send notification');
      return false;
    }
  }, []);

  // Update notification settings
  const updateNotificationSettings = useCallback((settings: any) => {
    inventoryNotificationService.updateSettings(settings);
    setNotificationSettings(inventoryNotificationService.getSettings());
    toast.success('Notification settings updated');
  }, []);

  // Mark notification as viewed
  const markNotificationAsViewed = useCallback((notificationId: string) => {
    inventoryNotificationService.markAsViewed(notificationId);
    setNotificationHistory(inventoryNotificationService.getNotificationHistory());
  }, []);

  // Initial load
  useEffect(() => {
    checkLowStock();
    
    // Set up periodic check (e.g., every 30 minutes)
    const intervalId = setInterval(checkLowStock, 30 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, [checkLowStock]);

  return {
    lowStockItems,
    isChecking,
    notificationSettings,
    notificationHistory,
    checkLowStock,
    sendLowStockNotification,
    updateNotificationSettings,
    markNotificationAsViewed,
  };
};

export default useLowStockNotifications;
