import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLocalization } from '@/hooks/useLocalization';

type Props = {
  className?: string;
  show?: boolean;
  daysLeft?: number | null;
  // Whether to show a small “Retry Payment” link to Billing
  showRetryLink?: boolean;
};

const GraceBanner: React.FC<Props> = ({ className = '', show = false, daysLeft, showRetryLink = true }) => {
  const { t } = useLocalization?.() || { t: (k: string, d?: any) => (d?.defaultText || k) };

  if (!show) return null;

  const desc =
    t('paymentFailedDesc', { defaultText: "Your payment was not successful. We'll retry automatically for the next 5 days." }) ||
    "Your payment was not successful. We'll retry automatically for the next 5 days.";

  return (
    <div className={`rounded-md p-4 bg-red-600 text-white shadow-md ${className}`}>
      <div className="flex items-start">
        <AlertTriangle className="h-5 w-5 text-white mr-3 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-semibold">Payment Failed</h3>
          <p className="opacity-90">{desc}</p>
          {typeof daysLeft === 'number' && (
            <p className="opacity-90 mt-1">
              Grace ends in {daysLeft} day{daysLeft === 1 ? '' : 's'}.
            </p>
          )}
        </div>
        {showRetryLink && (
          <div className="ml-3 mt-1">
            <Link
              to="/settings?tab=billing"
              className="px-2 py-1 rounded bg-white/20 hover:bg-white/30 transition-colors underline hover:no-underline"
            >
              Retry Payment
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default GraceBanner;