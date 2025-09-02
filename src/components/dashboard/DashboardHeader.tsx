
import React from 'react';
import { Button } from '@/components/ui/button';
import { Menu, Bell, Info } from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

interface DashboardHeaderProps {
  setSidebarOpen: (open: boolean) => void;
  notificationsOpen: boolean;
  setNotificationsOpen: (open: boolean) => void;
  notifications: {id: string; title: string; message: string; date: string; read: boolean}[];
  setNotifications: React.Dispatch<React.SetStateAction<{id: string; title: string; message: string; date: string; read: boolean}[]>>;
}

const getDaysRemaining = (endDate: Date) => {
  const now = new Date();
  const diffTime = endDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ 
  setSidebarOpen, 
  notificationsOpen, 
  setNotificationsOpen,
  notifications,
  setNotifications
}) => {
  const { user } = useAuth();
  const { subscription } = useSubscription();
  const { toast } = useToast();
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
      {subscription && (subscription.status === 'trial' || subscription.status === 'past_due' || subscription.status === 'canceled') && (
        <div className={`w-full py-2 text-center text-sm font-medium ${subscription.status === 'trial' ? 'bg-yellow-500 text-yellow-900' : 'bg-red-500 text-white'}`}>
          <div className="container mx-auto flex items-center justify-center space-x-2">
            <Info className="h-4 w-4" />
            {subscription.status === 'trial' && (
              <span>
                Your trial ends in {getDaysRemaining(new Date(subscription.currentPeriodEnd))} days. <Link to="/settings?tab=billing" className="underline hover:no-underline">Upgrade now</Link> to continue enjoying full access.
              </span>
            )}
            {subscription.status === 'past_due' && (
              <span>
                Your subscription is past due. Please <Link to="/settings?tab=billing" className="underline hover:no-underline">update your payment information</Link> to restore access.
              </span>
            )}
            {subscription.status === 'canceled' && (
              <span>
                Your subscription has been canceled. <Link to="/settings?tab=billing" className="underline hover:no-underline">Resubscribe</Link> to regain access.
              </span>
            )}
          </div>
        </div>
      )}
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

