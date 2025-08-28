
import React from 'react';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';
import { markAllNotificationsAsRead, getNotifications } from '@/services/notificationService';

interface NotificationDropdownProps {
  notificationsOpen: boolean;
  setNotificationsOpen: (open: boolean) => void;
  notifications: {id: string; title: string; message: string; date: string; read: boolean}[];
  setNotifications: React.Dispatch<React.SetStateAction<{id: string; title: string; message: string; date: string; read: boolean}[]>>;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  notificationsOpen,
  setNotificationsOpen,
  notifications,
  setNotifications
}) => {
  return (
    <div className="relative">
      <Button 
        variant="ghost" 
        size="sm"
        onClick={() => setNotificationsOpen(!notificationsOpen)}
        className="relative glass backdrop-blur-md bg-white/10 dark:bg-white/5 hover:bg-white/15 dark:hover:bg-white/10 border border-white/10 shadow-business hover:shadow-business-lg transition-all duration-300"
      >
        <Bell className="h-5 w-5 text-slate-600 dark:text-slate-400" />
        {notifications.filter(n => !n.read).length > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-gradient-to-r from-mokm-orange-500 to-mokm-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold animate-pulse">
            {notifications.filter(n => !n.read).length}
          </span>
        )}
      </Button>
      
      {notificationsOpen && (
        <div className="absolute right-0 mt-3 w-80 glass backdrop-blur-xl bg-white/10 dark:bg-black/40 rounded-2xl shadow-business-xl border border-white/10 z-50 animate-scale-in">
          <div className="p-6 border-b border-white/10">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 font-sf-pro">Notifications</h3>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {notifications.map(notification => (
              <div key={notification.id} className={`p-4 border-b border-white/5 hover:bg-white/10 dark:hover:bg-white/5 transition-colors ${!notification.read ? 'bg-gradient-to-r from-mokm-orange-50/30 to-mokm-pink-50/30' : ''}`}>
                <p className="font-medium text-sm text-slate-900 dark:text-slate-100 font-sf-pro">{notification.title}</p>
                <p className="text-sm text-slate-600 dark:text-slate-300 font-sf-pro">{notification.message}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-sf-pro">{notification.date}</p>
              </div>
            ))}
            {notifications.length === 0 && (
              <div className="p-6 text-center text-slate-500 dark:text-slate-400 text-sm font-sf-pro">No notifications</div>
            )}
          </div>
          <div className="p-4 text-center border-t border-white/10">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => {
                markAllNotificationsAsRead();
                setNotifications(getNotifications());
                setNotificationsOpen(false);
              }}
              className="text-mokm-purple-600 hover:bg-mokm-purple-50 font-sf-pro"
            >
              Mark all as read
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
