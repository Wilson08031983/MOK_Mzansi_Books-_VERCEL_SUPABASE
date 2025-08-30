import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, BellRing, BellOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { inventoryNotificationService } from '@/emails/services/InventoryNotificationService';

interface LowStockAlertProps {
  lowStockItems: any[];
  onViewItems: () => void;
  className?: string;
}

export const LowStockAlert: React.FC<LowStockAlertProps> = ({
  lowStockItems,
  onViewItems,
  className = '',
}) => {
  const { toast } = useToast();
  const [isMuted, setIsMuted] = React.useState(false);

  const handleNotify = async () => {
    try {
      const success = await inventoryNotificationService.sendLowStockNotification();
      if (success) {
        toast({
          title: 'Notification Sent',
          description: 'Low stock notification has been sent to the configured recipients.',
        });
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      toast({
        title: 'Error',
        description: 'Failed to send notification. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const toggleMute = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    
    // Save to localStorage
    localStorage.setItem('inventoryAlertsMuted', String(newMutedState));
    
    toast({
      title: newMutedState ? 'Alerts Muted' : 'Alerts Unmuted',
      description: newMutedState 
        ? 'You will not receive low stock alerts.' 
        : 'You will receive low stock alerts.',
    });
  };

  // Don't show if there are no low stock items
  if (lowStockItems.length === 0) {
    return null;
  }

  // Check if alerts are muted in localStorage
  React.useEffect(() => {
    const muted = localStorage.getItem('inventoryAlertsMuted') === 'true';
    setIsMuted(muted);
  }, []);

  // Don't show if muted
  if (isMuted) {
    return null;
  }

  return (
    <Alert className={`mb-6 border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30 ${className}`}>
      <div className="flex items-start">
        <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
        <div className="ml-3 flex-1">
          <AlertTitle className="text-amber-800 dark:text-amber-200 font-medium">
            Low Stock Alert
          </AlertTitle>
          <AlertDescription className="text-amber-700 dark:text-amber-300">
            {lowStockItems.length} item{lowStockItems.length !== 1 ? 's are' : ' is'} running low on stock.
          </AlertDescription>
          <div className="mt-2 flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="border-amber-300 text-amber-800 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-200 dark:hover:bg-amber-900/50"
              onClick={onViewItems}
            >
              View Items
            </Button>
            <Button 
              variant="default" 
              size="sm" 
              className="bg-amber-600 hover:bg-amber-700 text-white"
              onClick={handleNotify}
            >
              <BellRing className="h-4 w-4 mr-2" />
              Notify Team
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-amber-600 hover:bg-amber-100 dark:text-amber-400 dark:hover:bg-amber-900/30"
              onClick={toggleMute}
            >
              <BellOff className="h-4 w-4 mr-2" />
              Mute Alerts
            </Button>
          </div>
        </div>
      </div>
    </Alert>
  );
};

export default LowStockAlert;
