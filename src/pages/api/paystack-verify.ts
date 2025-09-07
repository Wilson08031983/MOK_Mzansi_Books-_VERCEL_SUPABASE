import type { NextApiRequest, NextApiResponse } from 'next';
import { paystackService } from '../../services/paystackService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  try {
    const { reference } = req.body as { reference?: string };
    if (!reference) return res.status(400).json({ message: 'Missing reference' });

    const raw = await paystackService.verifyTransaction(reference);
    // Some SDK variants wrap the transaction object under `data`
    const data: any = raw && typeof raw === 'object' && 'data' in raw && raw.data ? raw.data : raw;

    // Normalize fields from Paystack verify response
    const status = (data?.status ?? '').toString().toLowerCase();
    const gateway = (data?.gateway_response ?? '').toString().toLowerCase();
    const code = (data?.charge_response_code ?? '').toString().toLowerCase();
    const paidAt = (data as any)?.paidAt || (data as any)?.paid_at;

    // Consider common success signals across different Paystack response variations
    const isSuccess =
      status === 'success' ||
      status === 'successful' ||
      gateway.includes('success') ||
      gateway.includes('approved') ||
      code === '00' ||
      code === '0' ||
      Boolean(paidAt);

    if (!isSuccess) {
      // Log snapshot to help diagnose mismatches without leaking secrets
      console.warn('Paystack verify not successful', {
        status: data?.status,
        gateway_response: data?.gateway_response,
        charge_response_code: data?.charge_response_code,
        paidAt: (data as any)?.paidAt || (data as any)?.paid_at,
        reference,
      });
      return res.status(400).json({
        verified: false,
        message: 'Transaction not successful',
        data,
      });
    }

    return res.status(200).json({
      verified: true,
      data,
    });
  } catch (e: any) {
    console.error('Verify error:', e);
    return res.status(500).json({ message: e?.message || 'Internal error' });
  }
}