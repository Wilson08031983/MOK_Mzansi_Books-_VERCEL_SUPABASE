#!/usr/bin/env node

/**
 * Paystack Webhook Simulator
 *
 * Sends a signed webhook event to your webhook URL, optionally including
 * Vercel deployment protection bypass headers.
 *
 * Usage examples:
 *   WEBHOOK_URL="https://your-app.vercel.app/api/paystack-webhook" \
 *   PAYSTACK_SECRET_KEY_TEST="sk_test_..." \
 *   VERCEL_AUTOMATION_BYPASS_SECRET="abc123" \
 *   node scripts/simulate-paystack-webhook.js --event charge.success
 *
 * Or pass CLI flags:
 *   node scripts/simulate-paystack-webhook.js \
 *      --url https://your-app.vercel.app/api/paystack-webhook \
 *      --secret sk_test_... \
 *      --bypass abc123 \
 *      --event charge.success
 */

const crypto = require('crypto');

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const val = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true;
      args[key] = val;
    }
  }
  return args;
}

function getEnvOr(argVal, ...envKeys) {
  if (argVal) return argVal;
  for (const k of envKeys) {
    if (process.env[k]) return process.env[k];
  }
  return undefined;
}

(async function main() {
  const args = parseArgs(process.argv);

  const url = getEnvOr(args.url, 'WEBHOOK_URL');
  if (!url) {
    console.error('Missing webhook URL. Provide via --url or WEBHOOK_URL env.');
    process.exit(1);
  }

  const secret = getEnvOr(args.secret, 'PAYSTACK_SECRET_KEY_TEST', 'PAYSTACK_SECRET_KEY');
  if (!secret) {
    console.error('Missing Paystack secret. Provide via --secret or PAYSTACK_SECRET_KEY_TEST/PAYSTACK_SECRET_KEY env.');
    process.exit(1);
  }

  const bypassSecret = getEnvOr(args.bypass, 'VERCEL_AUTOMATION_BYPASS_SECRET');
  const eventType = args.event || 'charge.success';
  const userId = args.user || process.env.TEST_USER_ID;
  const tier = args.tier || process.env.TEST_SUBSCRIPTION_TIER;
  const email = args.email || process.env.TEST_CUSTOMER_EMAIL || 'qa+paystack@mokmzansibooks.com';

  // Minimal, representative Paystack-like payload
  const now = Date.now();
  const payload = {
    event: eventType,
    data: {
      id: now,
      reference: `TEST-REF-${now}`,
      amount: 6000, // amount in kobo
      currency: 'ZAR',
      customer: {
        email,
      },
      metadata: {
        ...(userId ? { user_id: userId } : {}),
        ...(tier ? { subscription_tier: tier } : {}),
      },
    },
  };

  const body = JSON.stringify(payload);
  const signature = crypto.createHmac('sha512', secret).update(body).digest('hex');

  const headers = {
    'Content-Type': 'application/json',
    'x-paystack-signature': signature,
  };

  if (bypassSecret) {
    headers['x-vercel-protection-bypass'] = bypassSecret;
    headers['x-vercel-set-bypass-cookie'] = '1';
  }

  try {
    console.log('Sending webhook to:', url);
    if (bypassSecret) console.log('Including Vercel automation bypass headers');

    const res = await fetch(url, {
      method: 'POST',
      headers,
      body,
    });

    const text = await res.text();
    console.log('Status:', res.status);
    console.log('Response:', text);

    if (!res.ok) process.exit(1);
  } catch (err) {
    console.error('Request failed:', err?.message || err);
    process.exit(1);
  }
})();