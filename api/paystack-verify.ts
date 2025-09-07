import handler from '../src/pages/api/paystack-verify';

// Vercel function wrapper that re-uses the Next-style handler from src/pages/api
export default async function vercelHandler(req: any, res: any) {
  return handler(req, res);
}