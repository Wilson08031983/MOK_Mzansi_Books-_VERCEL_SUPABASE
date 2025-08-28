
import React from 'react';
import { Button } from '@/components/ui/button';
import { Menu, Bell } from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';
import { useAuth } from '@/hooks/useAuth';

interface DashboardHeaderProps {
  setSidebarOpen: (open: boolean) => void;
  notificationsOpen: boolean;
  setNotificationsOpen: (open: boolean) => void;
  notifications: {id: string; title: string; message: string; date: string; read: boolean}[];
  setNotifications: React.Dispatch<React.SetStateAction<{id: string; title: string; message: string; date: string; read: boolean}[]>>;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ 
  setSidebarOpen, 
  notificationsOpen, 
  setNotificationsOpen,
  notifications,
  setNotifications
}) => {
  const { user } = useAuth();
  const fullName = (
    user?.user_metadata?.full_name ||
    [user?.user_metadata?.first_name, user?.user_metadata?.last_name].filter(Boolean).join(' ') ||
    user?.email?.split('@')[0] ||
    'User'
  ).trim();
  const initials = fullName
    .split(' ')
    .filter(Boolean)
    .map((n) => n.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase();
  return (
    <header className="liquid-glass glow-hover border-b border-white/10 shadow-business animate-slide-up">
      <div className="flex items-center justify-between h-20 px-8">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <Menu className="h-6 w-6 text-slate-600 dark:text-slate-400" />
          </button>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-mokm-orange-600 via-mokm-pink-600 to-mokm-purple-600 bg-clip-text text-transparent font-ny">
            Dashboard
          </h1>
        </div>
        <div className="flex items-center space-x-4">
          <NotificationDropdown 
            notificationsOpen={notificationsOpen}
            setNotificationsOpen={setNotificationsOpen}
            notifications={notifications}
            setNotifications={setNotifications}
          />
          <div
            className="w-10 h-10 bg-gradient-to-br from-mokm-purple-500 to-mokm-blue-500 rounded-full flex items-center justify-center shadow-colored animate-float"
            title={fullName}
            aria-label={`Logged-in user: ${fullName}`}
          >
            <span className="text-white font-semibold font-sf-pro">{initials}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;

