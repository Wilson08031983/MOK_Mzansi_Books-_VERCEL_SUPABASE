const getSecretKey = () =>
  process.env.NODE_ENV !== 'production'
    ? (process.env.PAYSTACK_SECRET_KEY_TEST || undefined)
    : process.env.PAYSTACK_SECRET_KEY;

async function getPaystack() {
  // Dynamically import CJS module to avoid ESM "exports is not defined" issues during bundling
  const mod: any = await import('paystack');
  const Paystack = mod?.default ?? mod;
  const secretKey = getSecretKey();
  if (!secretKey) {
    const env = process.env.NODE_ENV !== 'production' ? 'development' : 'production';
    throw new Error(
      `Missing Paystack secret key for ${env}. ` +
      `Set PAYSTACK_SECRET_KEY${env === 'development' ? '_TEST' : ''} in server environment.`
    );
  }
  return new Paystack(secretKey);
}

export const paystackService = {
  verifyTransaction: async (reference: string) => {
    try {
      const paystack = await getPaystack();
      const response = await paystack.transaction.verify(reference);
      return response.data;
    } catch (error) {
      console.error('Error verifying Paystack transaction:', error);
      throw new Error('Paystack transaction verification failed');
    }
  },

  chargeCard: async (email: string, amount: number, metadata: any = {}) => {
    try {
      const paystack = await getPaystack();
      const response = await paystack.transaction.initialize({
        email,
        amount,
        currency: 'ZAR',
        callback_url: process.env.PAYSTACK_CALLBACK_URL,
        metadata,
      });
      return response.data;
    } catch (error) {
      console.error('Error initializing Paystack transaction:', error);
      throw new Error('Paystack transaction initialization failed');
    }
  },

  chargeAuthorization: async (
    email: string,
    amount: number,
    authorizationCode: string,
    metadata: any = {}
  ) => {
    try {
      const paystack = await getPaystack();
      const response = await (paystack as any).transaction.charge({
        email,
        amount,
        authorization_code: authorizationCode,
        metadata,
      });
      return response.data;
    } catch (error) {
      console.error('Error charging Paystack authorization:', error);
      throw new Error('Paystack charge authorization failed');
    }
  },
};