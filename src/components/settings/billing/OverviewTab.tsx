import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLocalization } from '@/hooks/useLocalization';

const OverviewTab = ({ subscription, onCancel, onUpgrade }) => {
  const { t, formatDate } = useLocalization();

  const getStatusBadge = () => {
    switch (subscription.status) {
      case 'trial':
        return <Badge className="bg-emerald-500 hover:bg-emerald-600">{t('settings.billing.status.trial')}</Badge>;
      case 'active':
        return <Badge className="bg-blue-500 hover:bg-blue-600">{t('settings.billing.status.active')}</Badge>;
      case 'payment_failed':
        return <Badge className="bg-amber-500 hover:bg-amber-600">{t('settings.billing.status.paymentIssue')}</Badge>;
      case 'expired':
        return <Badge className="bg-red-500 hover:bg-red-600">{t('settings.billing.status.expired')}</Badge>;
      case 'canceled':
        return <Badge className="bg-gray-500 hover:bg-gray-600">{t('settings.billing.status.canceled')}</Badge>;
      default:
        return <Badge className="bg-gray-500 hover:bg-gray-600">{t('settings.billing.tiers.free')}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('settings.billing.overview.title')}</CardTitle>
        <CardDescription>{t('settings.billing.overview.description')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-between items-center">
          <span>{t('settings.billing.overview.currentPlan')}</span>
          <span className="font-semibold">{subscription.tier}</span>
        </div>
        <div className="flex justify-between items-center">
          <span>{t('settings.billing.overview.status')}</span>
          {getStatusBadge()}
        </div>
        <div className="flex justify-between items-center">
          <span>{t('settings.billing.overview.nextBillingDate')}</span>
          <span className="font-semibold">{formatDate(subscription.currentPeriodEnd)}</span>
        </div>
        {subscription.trialDaysLeft && (
          <div className="flex justify-between items-center text-yellow-500">
            <span>{t('settings.billing.overview.trialEndsIn')}</span>
            <span className="font-semibold">{t('settings.billing.overview.daysLeft', { count: subscription.trialDaysLeft })}</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel}>{t('settings.billing.overview.cancelSubscription')}</Button>
        <Button onClick={() => onUpgrade(subscription.tier === 'monthly' ? 'annual' : 'monthly')}>
          {t('settings.billing.overview.upgradePlan')}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default OverviewTab;