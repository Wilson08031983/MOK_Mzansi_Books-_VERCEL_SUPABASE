// Minimal Express-based dev server to run API routes without Vercel CLI
// Using CommonJS-style requires to avoid TS ESM interop issues

const express = require('express');
const welcomeHandler = require('./api/emails/welcome').default;
const invoiceHandler = require('./api/emails/invoice').default;
const accountLockoutHandler = require('./api/emails/account-lockout').default;

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

app.post('/api/emails/welcome', wrapNextHandler(welcomeHandler as any));
app.post('/api/emails/invoice', wrapNextHandler(invoiceHandler as any));
app.post('/api/emails/account-lockout', wrapNextHandler(accountLockoutHandler as any));

const PORT = Number(process.env.PORT || 3000);
app.listen(PORT, () => {
  console.log(`API-only dev server listening on http://localhost:${PORT}`);
});