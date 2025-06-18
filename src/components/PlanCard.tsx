
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { SUBSCRIPTION_PLANS, formatPrice } from '@/lib/paystack';

interface PlanCardProps {
  planKey: string;
  plan: typeof SUBSCRIPTION_PLANS[keyof typeof SUBSCRIPTION_PLANS];
  onSelectPlan: (planKey: string) => void;
}

const PlanCard = ({ planKey, plan, onSelectPlan }: PlanCardProps) => {
  const isPopular = planKey === 'monthly';

  return (
    <Card
      className={`relative transition-all duration-300 hover:shadow-xl cursor-pointer ${
        isPopular
          ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-blue-50 shadow-lg scale-105'
          : 'border-gray-200 bg-white hover:border-purple-200'
      }`}
      onClick={() => onSelectPlan(planKey)}
    >
      {isPopular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-gradient-to-r from-purple-600 to-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
            Most Popular
          </span>
        </div>
      )}
      
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-gray-800">
          {plan.name}
        </CardTitle>
        <div className="mt-4">
          <span className="text-4xl font-bold text-gray-800">
            {plan.price === 0 ? 'Free' : formatPrice(plan.price)}
          </span>
          {plan.price > 0 && (
            <span className="text-gray-600">
              /{planKey === 'annual' ? 'year' : 'month'}
            </span>
          )}
        </div>
        {planKey === 'annual' && (
          <div className="text-sm text-green-600 font-semibold">
            Save 5% annually
          </div>
        )}
      </CardHeader>

      <CardContent>
        <ul className="space-y-3 mb-8">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-center">
              <Check className="h-5 w-5 text-green-500 mr-3" />
              <span className="text-gray-700">{feature}</span>
            </li>
          ))}
        </ul>

        <Button
          className={`w-full h-12 font-semibold transition-all duration-300 ${
            isPopular
              ? 'bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white'
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
          }`}
        >
          {plan.price === 0 ? 'Start Free Trial' : 'Choose Plan'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default PlanCard;
