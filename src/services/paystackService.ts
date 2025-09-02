import Paystack from 'paystack';
import { env } from '@/env.mjs';

const paystack = new Paystack(env.PAYSTACK_SECRET_KEY);

export const paystackService = {
  verifyTransaction: async (reference: string) => {
    try {
      const response = await paystack.transaction.verify(reference);
      return response.data;
    } catch (error) {
      console.error('Error verifying Paystack transaction:', error);
      throw new Error('Paystack transaction verification failed');
    }
  },

  chargeCard: async (email: string, amount: number, metadata: any = {}) => {
    try {
      const response = await paystack.transaction.initialize({
        email,
        amount,
        metadata,
      });
      return response.data;
    } catch (error) {
      console.error('Error initializing Paystack transaction:', error);
      throw new Error('Paystack transaction initialization failed');
    }
  },
};