
// PayStack configuration
export const PAYSTACK_CONFIG = {
  publicKey: 'pk_live_04cecd786eaed713e065a61d330535507b4cc05a',
  secretKey: 'sk_live_568472e1fee6118f30893183f231c170a54f0bce', // This should be in backend
};

export const SUBSCRIPTION_PLANS = {
  trial: {
    name: 'Free 30-Day Trial',
    price: 0,
    features: ['Limited Features', 'Up to 5 invoices per month', 'Basic support'],
    duration: 30,
    type: 'trial'
  },
  monthly: {
    name: 'Monthly Subscription',
    price: 6000, // R60.00 in kobo (PayStack uses kobo)
    features: ['All Features', 'Unlimited invoices', 'Priority support', 'Advanced analytics'],
    duration: 30,
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
