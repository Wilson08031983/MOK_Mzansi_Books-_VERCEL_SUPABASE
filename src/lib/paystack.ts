
// PayStack configuration
export const PAYSTACK_CONFIG = {
  publicKey: (
    import.meta.env.MODE !== 'production'
      ? (import.meta.env.VITE_PAYSTACK_PUBLIC_KEY_TEST || import.meta.env.VITE_PAYSTACK_PUBLIC_KEY)
      : import.meta.env.VITE_PAYSTACK_PUBLIC_KEY
  ) as string,
};

export const SUBSCRIPTION_PLANS = {
  trial: {
    name: 'Free 30-Day Trial',
    price: 0,
    features: [
      'Free for 30 days',
      'Up to 5 invoices per month',
      'Up to 5 quotations per month',
      'Up to 5 clients',
      'Up to 5 projects',
      'Up to 5 inventory items',
      'Up to 5 suppliers',
      'Up to 5 storage locations',
      'Basic support'
    ],
    duration: 30,
    type: 'trial'
  },
  monthly: {
    name: 'Monthly Subscription',
    price: 6000, // R60.00 in kobo (PayStack uses kobo)
    features: ['All Features', 'Unlimited invoices', 'Priority support', 'Advanced analytics'],
    duration: 31,
    type: 'monthly'
  },
  annual: {
    name: 'Annual Subscription',
    price: 68400, // R684.00 (R60 * 12 months with 5% discount) in kobo
    features: ['All Features', 'Unlimited invoices', 'Priority support', 'Advanced analytics', '5% Discount'],
    duration: 365,
    type: 'annual'
  }
};

export const formatPrice = (priceInKobo: number) => {
  return `R${(priceInKobo / 100).toFixed(2)}`;
};
