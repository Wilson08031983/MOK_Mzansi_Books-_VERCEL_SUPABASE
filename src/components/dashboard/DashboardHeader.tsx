
import React from 'react';
import { Button } from '@/components/ui/button';
import { Menu, Bell, Info } from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { useToast } from '@/hooks/use-toast';
import { useSubscriptionAccess } from '@/hooks/useSubscriptionAccess';
import { Link } from 'react-router-dom';
import emailServiceClient from '@/services/emailService';
import GraceBanner from '@/components/common/GraceBanner';

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
  return Math.max(0, diffDays); // Ensure non-negative
};

const getTrialDaysLeft = (subscription: any, userEmail?: string) => {
  if (!subscription) return null;

  // Admin special-case: do not show trial strip for admin paid account
  if (userEmail && userEmail.toLowerCase() === 'admin@mokmzansibooks.com') return null;
  
  const status = subscription.status?.toLowerCase() || '';
  const tier = subscription.tier?.toLowerCase() || '';
  
  // Only show for trial users; rely primarily on status to avoid mismatches
  const isTrial = status === 'trial' || status === 'trialing' || (!status && tier === 'trial');
  if (!isTrial) {
    return null;
  }
  
  // Calculate days remaining from trial period end
  if (subscription.currentPeriodEnd) {
    return getDaysRemaining(new Date(subscription.currentPeriodEnd));
  }
  
  // Fallback: calculate from creation date + 31 days
  if (subscription.createdAt) {
    const trialStart = new Date(subscription.createdAt);
    const trialEnd = new Date(trialStart.getTime() + (31 * 24 * 60 * 60 * 1000));
    return getDaysRemaining(trialEnd);
  }
  
  return null;
};

const shouldShowReminderEmail = (daysLeft: number | null) => {
  return daysLeft !== null && daysLeft <= 5 && daysLeft > 0;
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
  const { isInGrace, graceDaysLeft } = useSubscriptionAccess();
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
  const trialDaysLeft = getTrialDaysLeft(subscription, user?.email || undefined);
  const showEmailReminder = shouldShowReminderEmail(trialDaysLeft);
  
  // Effect to send email reminder at 5 days left
  React.useEffect(() => {
    const shouldSend =
      showEmailReminder &&
      user?.email &&
      (subscription?.status?.toLowerCase?.() === 'trial' ||
        subscription?.status?.toLowerCase?.() === 'trialing');
    if (!shouldSend) return;

    // Ensure we only send once per user per dayLeft value
    const key = `trial-reminder-sent:${user!.email}:${trialDaysLeft}`;
    if (localStorage.getItem(key)) {
      return;
    }

    const name = fullName || 'User';
    emailServiceClient
      .sendTrialReminderEmail(user!.email!, name)
      .then(() => {
        localStorage.setItem(key, '1');
        console.log(`Trial reminder email sent to ${user!.email} for ${trialDaysLeft} days left`);
      })
      .catch((err: any) => {
        console.warn('Failed to send trial reminder email:', err);
      });

    toast({
      title: 'Trial Ending Soon',
      description: `Your trial expires in ${trialDaysLeft} days. Upgrade now to continue using all features.`,
      duration: 10000,
    });
  }, [showEmailReminder, user?.email, trialDaysLeft, toast, subscription?.status, subscription?.tier, fullName]);

  return (
    <header className="liquid-glass glow-hover border-b border-white/10 shadow-business animate-slide-up relative z-50">
      <GraceBanner show={isInGrace} daysLeft={graceDaysLeft ?? null} />
      {/* Trial Countdown Strip - Above Dashboard heading */}
      {trialDaysLeft !== null && (
        <div className="w-full py-1 text-center text-sm font-medium bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg">
          <div className="container mx-auto flex items-center justify-center space-x-2">
            <Info className="h-3 w-3" />
            <span className="font-semibold">
              {trialDaysLeft > 0 ? (
                <>
                  {trialDaysLeft} day{trialDaysLeft !== 1 ? 's' : ''} left in your trial
                  {trialDaysLeft <= 5 && (
                    <span className="ml-2 animate-pulse">⚠️ Upgrade soon!</span>
                  )}
                </>
              ) : (
                "Your trial has expired"
              )}
            </span>
            <Link 
              to="/settings?tab=billing" 
              className="ml-2 px-2 py-0.5 bg-white/20 hover:bg-white/30 rounded-md transition-colors underline hover:no-underline"
            >
              Upgrade Now
            </Link>
          </div>
        </div>
      )}
      {/* Other subscription status messages */}
      {subscription && ((subscription.status === 'past_due' && !isInGrace) || subscription.status === 'canceled') && (
        <div className="w-full py-2 text-center text-sm font-medium bg-red-500 text-white">
          <div className="container mx-auto flex items-center justify-center space-x-2">
            <Info className="h-4 w-4" />
            {subscription.status === 'past_due' && !isInGrace && (
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

