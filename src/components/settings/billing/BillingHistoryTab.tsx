import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLocalization } from '@/hooks/useLocalization';

const BillingHistoryTab = ({ history }) => {
  const { t, formatCurrency } = useLocalization();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('settings.billing.history.title')}</CardTitle>
        <CardDescription>{t('settings.billing.history.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {history.map((item, index) => (
            <li key={index} className="flex justify-between items-center">
              <div>
                <p className="font-semibold">{item.description}</p>
                <p className="text-sm text-gray-500">{item.date}</p>
              </div>
              <div className="text-right">
                <p className={`font-semibold ${item.status === 'succeeded' ? 'text-green-500' : 'text-red-500'}`}>
                  {formatCurrency(item.amount)}
                </p>
                <Badge variant={item.status === 'succeeded' ? 'default' : 'destructive'}>
                  {item.status}
                </Badge>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default BillingHistoryTab;