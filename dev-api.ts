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

// Lazily load handlers inside route definitions to avoid crashing on startup
// when optional environment variables (e.g., Supabase keys) are not present.

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
app.post('/api/emails/welcome', (req: any, res: any) => {
  const handler = require('./api/emails/welcome').default;
  return wrapNextHandler(handler as any)(req, res);
});
app.post('/api/emails/invoice', (req: any, res: any) => {
  const handler = require('./api/emails/invoice').default;
  return wrapNextHandler(handler as any)(req, res);
});
app.post('/api/emails/account-lockout', (req: any, res: any) => {
  const handler = require('./api/emails/account-lockout').default;
  return wrapNextHandler(handler as any)(req, res);
});
app.post('/api/emails/confirmation', (req: any, res: any) => {
  const handler = require('./api/emails/confirmation').default;
  return wrapNextHandler(handler as any)(req, res);
});
app.post('/api/emails/verification', (req: any, res: any) => {
  const handler = require('./api/emails/verification').default;
  return wrapNextHandler(handler as any)(req, res);
});
app.post('/api/emails/password-reset', (req: any, res: any) => {
  const handler = require('./api/emails/password-reset').default;
  return wrapNextHandler(handler as any)(req, res);
});

// Authentication handlers
app.post('/api/signup', (req: any, res: any) => {
  const handler = require('./api/signup').default;
  return wrapNextHandler(handler as any)(req, res);
});
app.post('/api/verify-email', (req: any, res: any) => {
  const handler = require('./api/verify-email').default;
  return wrapNextHandler(handler as any)(req, res);
});
app.post('/api/resend-verification', (req: any, res: any) => {
  const handler = require('./api/resend-verification').default;
  return wrapNextHandler(handler as any)(req, res);
});

// Logo/Asset handlers
app.get('/api/logo', (req: any, res: any) => {
  const handler = require('./api/logo').default;
  return wrapNextHandler(handler as any)(req, res);
});
app.get('/api/get-logo', (req: any, res: any) => {
  const handler = require('./api/get-logo');
  return wrapNextHandler(handler as any)(req, res);
});

// Webhook handlers
app.post('/api/postmark-webhook', (req: any, res: any) => {
  const handler = require('./api/postmark-webhook').default;
  return wrapNextHandler(handler as any)(req, res);
});

// CORS middleware for all routes
app.use((req: any, res: any, next: any) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  next();
});

const PORT = Number(process.env.PORT || 3000);
app.listen(PORT, () => {
  console.log(`API-only dev server listening on http://localhost:${PORT}`);
  console.log('Available endpoints:');
  console.log('  POST /api/signup');
  console.log('  POST /api/verify-email');
  console.log('  POST /api/resend-verification');
  console.log('  POST /api/emails/welcome');
  console.log('  POST /api/emails/invoice');
  console.log('  POST /api/emails/account-lockout');
  console.log('  POST /api/emails/confirmation');
  console.log('  POST /api/emails/verification');
  console.log('  POST /api/emails/password-reset');
  console.log('  GET  /api/logo');
  console.log('  GET  /api/get-logo');
  console.log('  POST /api/postmark-webhook');
  console.log('  GET  /health');
});