/*
 * Email end-to-end test using Resend and project templates
 * - Loads .env.local for server-side variables (RESEND_API_KEY, RESEND_DOMAIN, NEXT_PUBLIC_APP_URL)
 * - Sends both template-based and direct emails to admin@ and support@ addresses
 */

import fs from 'fs';
import path from 'path';
import { Resend } from 'resend';
import { emailService } from '../src/services/email/emailService';

// Minimal .env parser for .env.local (key=value with optional quotes)
function loadEnvLocal(filePath: string) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf8');
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith('\'') && val.endsWith('\''))) {
      val = val.slice(1, -1);
    }
    if (!(key in process.env)) {
      process.env[key] = val;
    }
  }
}

// Load .env.local from project root
const root = process.cwd();
loadEnvLocal(path.join(root, '.env.local'));

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_DOMAIN = process.env.RESEND_DOMAIN || 'mokmzansibooks.com';
const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || 'https://mokmzansibooks.com').replace(/\/$/, '');

if (!RESEND_API_KEY) {
  console.error('Missing RESEND_API_KEY in environment. Please set it in .env.local');
  process.exit(1);
}

const resend = new Resend(RESEND_API_KEY);

const recipients = [
  'admin@mokmzansibooks.com',
  'support@mokmzansibooks.com',
];

async function sendDirect(fromLocalPart: string, to: string, subject: string, html: string) {
  const from = `MOK Mzansi Books <${fromLocalPart}@${RESEND_DOMAIN}>`;
  const { data, error } = await resend.emails.send({ from, to, subject, html });
  if (error) {
    console.error(`❌ Direct email failed (${from} -> ${to}):`, error);
    return { ok: false, error };
  }
  console.log(`✅ Direct email sent (${from} -> ${to}): id=${data?.id}`);
  return { ok: true, id: data?.id };
}

async function main() {
  console.log('🧪 Starting email E2E test with Resend...');
  console.log(`Using domain: ${RESEND_DOMAIN}`);
  console.log(`App URL: ${APP_URL}`);

  const results: Record<string, any> = {};

  // 1) Template-based emails via project service
  for (const to of recipients) {
    try {
      await emailService.sendWelcomeEmail(to, 'Email Test');
      console.log(`✅ Template welcome sent -> ${to}`);
      await emailService.sendTrialReminder(to, 'Email Test');
      console.log(`✅ Template trial reminder sent -> ${to}`);
      results[`templates_${to}`] = true;
    } catch (e) {
      console.error(`❌ Template emails failed for ${to}:`, e);
      results[`templates_${to}`] = false;
    }
  }

  // 2) Direct identity checks: support -> admin and admin -> support
  try {
    await sendDirect('support', 'admin@mokmzansibooks.com', 'Support → Admin routing test', `
      <h1>Support → Admin routing test</h1>
      <p>This is a direct test email sent via Resend from support@${RESEND_DOMAIN} to admin@mokmzansibooks.com.</p>
      <p>Time: ${new Date().toISOString()}</p>
    `);
    await sendDirect('admin', 'support@mokmzansibooks.com', 'Admin → Support routing test', `
      <h1>Admin → Support routing test</h1>
      <p>This is a direct test email sent via Resend from admin@${RESEND_DOMAIN} to support@mokmzansibooks.com.</p>
      <p>Time: ${new Date().toISOString()}</p>
    `);
    results['direct_identity'] = true;
  } catch (e) {
    console.error('❌ Direct identity tests failed:', e);
    results['direct_identity'] = false;
  }

  // 3) Basic plaintext check
  for (const to of recipients) {
    try {
      await sendDirect('no-reply', to, 'Plaintext formatting check', `
        <p>Hello ${to},</p>
        <p>This is a simple formatting check from the automated tester.</p>
        <p><a href="${APP_URL}">Open App</a></p>
      `);
      results[`plain_${to}`] = true;
    } catch (e) {
      console.error(`❌ Plain email failed for ${to}:`, e);
      results[`plain_${to}`] = false;
    }
  }

  console.log('🏁 Email E2E test complete. Summary:');
  console.log(results);
}

main().catch((e) => {
  console.error('Unexpected error in email test:', e);
  process.exit(1);
});