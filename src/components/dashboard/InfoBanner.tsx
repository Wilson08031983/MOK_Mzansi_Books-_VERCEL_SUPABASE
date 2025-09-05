import React from 'react';
import NextPublicHolidayDisplay from '../hr/NextPublicHolidayDisplay';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { useSubscriptionAccess } from '@/hooks/useSubscriptionAccess';
import { useSubscription } from '@/hooks/useSubscription';
import { useLocalization } from '@/hooks/useLocalization';

interface InfoBannerProps {
  className?: string;
}

const InfoBanner: React.FC<InfoBannerProps> = ({ className }) => {
  const { t } = useLocalization();
  const { isTrial, daysLeft } = useSubscriptionAccess();
  const { subscription } = useSubscription();

  const isCancelled = subscription?.status === 'canceled';
  const showTrialBanner = Boolean(isTrial && typeof daysLeft === 'number' && daysLeft >= 0 && !isCancelled);
  // Always show canceled banner when canceled; days-left line is optional
  const showCancelledBanner = Boolean(isCancelled);
  const isEndingSoon = typeof daysLeft === 'number' && daysLeft <= 3;

  return (
    <div className={`mb-6 animate-fade-in ${className || ''}`}>
      {showTrialBanner && (
        <div className="mb-4 rounded-xl border border-yellow-500/30 bg-yellow-400/10 dark:bg-yellow-500/10 p-4 backdrop-blur-sm shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="shrink-0 rounded-full bg-yellow-500/20 p-2 border border-yellow-500/30">
                <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <div className="text-sm sm:text-base font-semibold text-yellow-800 dark:text-yellow-200">
                  {t('settings.billing.trialDaysLeft', { days: daysLeft as number })}
                </div>
                {isEndingSoon && (
                  <div className="text-xs sm:text-sm text-yellow-800/80 dark:text-yellow-200/80">
                    {t('settings.billing.trialEndingSoon')}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link to="/pricing">
                <Button size="sm" variant="outline" className="h-8 border-yellow-500/40 text-yellow-800 dark:text-yellow-200 hover:bg-yellow-500/20">
                  {t('settings.billing.viewPlans')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {showCancelledBanner && (
        <div className="mb-4 rounded-xl border border-red-500/30 bg-red-400/10 dark:bg-red-500/10 p-4 backdrop-blur-sm shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="shrink-0 rounded-full bg-red-500/20 p-2 border border-red-500/30">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <div className="text-sm sm:text-base font-semibold text-red-800 dark:text-red-200">
                  {t('settings.billing.toasts.canceledTitle')}
                </div>
                {typeof daysLeft === 'number' && daysLeft >= 0 && daysLeft < 10000 && (
                  <div className="text-xs sm:text-sm text-red-800/80 dark:text-red-200/80">
                    {t('settings.billing.daysLeft', { count: daysLeft as number })}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link to="/pricing">
                <Button size="sm" variant="outline" className="h-8 border-red-500/40 text-red-800 dark:text-red-200 hover:bg-red-500/20">
                  {t('settings.billing.viewPlans')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      <NextPublicHolidayDisplay compact={true} />
    </div>
  );
};

export default InfoBanner;
