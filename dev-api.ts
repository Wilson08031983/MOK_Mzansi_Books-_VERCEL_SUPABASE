// Minimal Express-based dev server to run API routes without Vercel CLI
// Using CommonJS-style requires to avoid TS ESM interop issues

// Register tsconfig paths so TS path aliases work at runtime
require('tsconfig-paths').register({
  baseUrl: __dirname,
  paths: { '@/*': ['./src/*'] }
});

const express = require('express');
const dotenv = require('dotenv');
// Load environment variables from .env.local (Next-style) and fallback to .env
dotenv.config({ path: '.env.local' });
dotenv.config();

const welcomeHandler = require('./api/emails/welcome').default;
const invoiceHandler = require('./api/emails/invoice').default;
const accountLockoutHandler = require('./api/emails/account-lockout').default;
const confirmationHandler = require('./api/emails/confirmation').default;

const signupHandler = require('./src/pages/api/signup').default;
const verifyEmailHandler = require('./src/pages/api/verify-email').default;
const resendVerificationHandler = require('./src/pages/api/resend-verification').default;

const app: any = express();
app.use(express.json({ limit: '2mb' }));

// Health check
app.get('/health', (_req: any, res: any) => {
  res.json({ ok: true, service: 'api-only-dev', ts: new Date().toISOString() });
});

// Wrap Next-style handlers so they can run under Express in dev
function wrapNextHandler(handler: (req: any, res: any) => Promise<void> | void) {
  return async (req: any, res: any) => {
    try {
      await handler(req as any, res as any);
    } catch (err) {
      console.error('Handler error:', err);
      if (!res.headersSent) {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  };
}

// Email handlers
app.post('/api/emails/welcome', wrapNextHandler(welcomeHandler as any));
app.post('/api/emails/invoice', wrapNextHandler(invoiceHandler as any));
app.post('/api/emails/account-lockout', wrapNextHandler(accountLockoutHandler as any));
app.post('/api/emails/confirmation', wrapNextHandler(confirmationHandler as any));

// Authentication handlers
app.post('/api/signup', wrapNextHandler(signupHandler as any));
app.post('/api/verify-email', wrapNextHandler(verifyEmailHandler as any));
app.post('/api/resend-verification', wrapNextHandler(resendVerificationHandler as any));

const PORT = Number(process.env.PORT || 3000);
app.listen(PORT, () => {
  console.log(`API-only dev server listening on http://localhost:${PORT}`);
});