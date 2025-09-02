import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import PlanCard from '@/components/PlanCard';
import { useLocalization } from '@/hooks/useLocalization';

const PlansTab = ({ plans, currentPlan, onSelectPlan }) => {
  const { t } = useLocalization();

  return (
    <div className="space-y-6">
      <CardHeader className="text-center">
        <CardTitle>{t('settings.billing.plans.title')}</CardTitle>
        <CardDescription>{t('settings.billing.plans.description')}</CardDescription>
      </CardHeader>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            isCurrent={plan.id === currentPlan}
            onSelect={() => onSelectPlan(plan)}
          />
        ))}
      </div>
    </div>
  );
};

export default PlansTab;