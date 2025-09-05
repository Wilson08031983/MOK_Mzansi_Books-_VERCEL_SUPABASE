
import React, { useEffect, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuthHook';

interface WelcomeSectionProps {
  period: string;
  setPeriod: (period: string) => void;
}

const WelcomeSection: React.FC<WelcomeSectionProps> = ({ period, setPeriod }) => {
  const { user } = useAuth();

  // Determine first-time vs returning using a per-user localStorage flag
  const { greetingName, isFirstTimeKey } = useMemo(() => {
    const firstName = user?.user_metadata?.first_name || user?.email?.split('@')[0] || 'there';
    const userId = user?.id || 'anonymous';
    const key = `user_first_login_seen_${userId}`;
    return { greetingName: firstName, isFirstTimeKey: key };
  }, [user]);

  const isFirstTime = useMemo(() => {
    try {
      return !localStorage.getItem(isFirstTimeKey);
    } catch {
      return false;
    }
  }, [isFirstTimeKey]);

  useEffect(() => {
    // Mark first-login as seen when the dashboard is viewed the first time
    try {
      if (isFirstTime) {
        localStorage.setItem(isFirstTimeKey, 'true');
      }
    } catch (e) {
      console.warn('WelcomeSection: failed to set first-login flag', e);
    }
  }, [isFirstTime, isFirstTimeKey]);

  return (
    <div className="flex items-center justify-between mb-10 animate-fade-in">
      <div>
        <h2 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-3 font-ny">{isFirstTime ? `Welcome, ${greetingName}!` : `Welcome back, ${greetingName}!`}</h2>
        <p className="text-slate-600 dark:text-slate-300 text-lg font-sf-pro">{isFirstTime ? "Let's get you started. Here's an overview of your workspace." : "Here's what's happening with your business today."}</p>
      </div>
      <div className="flex items-center space-x-6">
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="px-4 py-3 liquid-glass glow-hover bg-white/10 dark:bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-mokm-purple-500/40 focus:border-mokm-purple-500/40 shadow-business hover:shadow-business-lg transition-all duration-300 font-sf-pro"
        >
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
        </select>
      </div>
    </div>
  );
};

export default WelcomeSection;
