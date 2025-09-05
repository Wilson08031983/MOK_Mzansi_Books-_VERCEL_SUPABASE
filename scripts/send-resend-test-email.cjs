#!/usr/bin/env node

// Simple Resend test sender script
// Usage: node scripts/send-resend-test-email.cjs --to you@example.com [--subject "Subject"]

const { Resend } = require('resend');
const fs = require('fs');
const path = require('path');

// Load env from .env.local if present
try {
  const dotenv = require('dotenv');
  const envLocalPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envLocalPath)) {
    dotenv.config({ path: envLocalPath });
    console.log('[env] Loaded .env.local');
  } else {
    dotenv.config();
  }
} catch (e) {
  // dotenv might not be installed; continue with process.env
}

function parseArg(key, fallback = undefined) {
  const idx = process.argv.indexOf(key);
  if (idx !== -1 && process.argv[idx + 1]) return process.argv[idx + 1];
  return fallback;
}

(async () => {
  const to = parseArg('--to', process.env.TEST_EMAIL || 'support@mokmzansibooks.co.za');
  const subject = parseArg('--subject', 'Resend Test Email from MOK Mzansi Books');
  const domain = process.env.RESEND_DOMAIN;
  const apiKey = process.env.RESEND_API_KEY || process.env.VITE_RESEND_API_KEY;

  if (!apiKey) {
    console.error('[error] RESEND_API_KEY is not set. Please add it to your .env.local');
    process.exit(1);
  }
  if (!domain) {
    console.error('[error] RESEND_DOMAIN is not set. Please add it to your .env.local (your verified sending domain).');
    process.exit(1);
  }

  const resend = new Resend(apiKey);

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6;">
      <h2>Test Email</h2>
      <p>This is a test email sent via <strong>Resend</strong> to verify sending and delivery configuration.</p>
      <ul>
        <li><strong>Project:</strong> MOK Mzansi Books</li>
        <li><strong>Environment:</strong> ${process.env.NODE_ENV || 'development'}</li>
        <li><strong>Timestamp:</strong> ${new Date().toISOString()}</li>
      </ul>
      <p>If you received this message, outgoing email is working.</p>
    </div>
  `;

  try {
    console.log(`[send] Sending to ${to} using domain ${domain} ...`);
    const { data, error } = await resend.emails.send({
      from: `MOK Mzansi Books <no-reply@${domain}>`,
      to: [to],
      subject,
      html,
    });

    if (error) {
      console.error('[error] Failed to send email:', error);
      process.exit(1);
    }

    console.log('[ok] Email queued successfully with id:', data && data.id ? data.id : '(no id)');
    console.log('Please check the recipient inbox and spam folder to confirm receipt.');
  } catch (err) {
    console.error('[error] Unexpected error while sending:', err);
    process.exit(1);
  }
})();