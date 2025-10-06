#!/usr/bin/env node

/**
 * Postmark Suppression Removal Script
 *
 * Removes specified emails from Postmark suppression list.
 * Uses the official postmark client and loads env from .env.vercel or .env.local.
 */

const fs = require('fs');
const path = require('path');

// Prefer .env.local for local runs, fallback to .env.vercel
const envPathLocal = path.join(process.cwd(), '.env.local');
const envPathVercel = path.join(process.cwd(), '.env.vercel');
if (fs.existsSync(envPathLocal)) {
  require('dotenv').config({ path: envPathLocal });
} else if (fs.existsSync(envPathVercel)) {
  require('dotenv').config({ path: envPathVercel });
} else {
  require('dotenv').config();
}

const postmark = require('postmark');

const POSTMARK_TOKEN = process.env.POSTMARK_SERVER_TOKEN;
if (!POSTMARK_TOKEN) {
  console.error('❌ Missing POSTMARK_SERVER_TOKEN');
  process.exit(1);
}

const client = new postmark.ServerClient(POSTMARK_TOKEN);
const MESSAGE_STREAM = process.env.POSTMARK_MESSAGE_STREAM || 'outbound';

const TARGET_EMAILS = [
  'mokgethwamoabelo@gmail.com',
  'mokgethwamoabelo@icloud.com',
  'mokgethwamoabelo@yahoo.com',
];

async function removeSuppressions(emails) {
  const summary = { timestamp: new Date().toISOString(), emails, actions: [] };
  try {
    const current = await client.getSuppressions(MESSAGE_STREAM);
    const suppressedSet = new Set((current.Suppressions || []).map((s) => s.EmailAddress.toLowerCase()));

    const targetsInSuppression = emails.filter((e) => suppressedSet.has(e.toLowerCase()));
    summary.actions.push({ step: 'list_suppressions', found: current.Suppressions.length, targets_in_list: targetsInSuppression });

    if (targetsInSuppression.length === 0) {
      summary.actions.push({ step: 'delete_skip', reason: 'none_in_suppression' });
    } else {
      try {
        const payload = { Suppressions: targetsInSuppression.map((e) => ({ EmailAddress: e })) };
        const res = await client.deleteSuppressions(MESSAGE_STREAM, payload);
        summary.actions.push({ step: 'delete_attempt', status: 'ok', result: res });
      } catch (err) {
        summary.actions.push({ step: 'delete_attempt', status: 'error', error: err.message, code: err.code });
      }
    }

    return summary;
  } catch (err) {
    summary.actions.push({ step: 'list_error', error: err.message, code: err.code });
    return summary;
  }
}

async function main() {
  console.log('🧹 Postmark Suppression Cleanup: starting...');
  const summary = await removeSuppressions(TARGET_EMAILS);
  const outFile = path.join(__dirname, 'postmark_suppression_cleanup.json');
  fs.writeFileSync(outFile, JSON.stringify(summary, null, 2));
  console.log(`✅ Suppression cleanup complete. Results saved to ${outFile}`);
}

if (require.main === module) {
  main().catch((e) => {
    console.error('💥 Suppression cleanup failed:', e);
    process.exit(1);
  });
}

module.exports = { removeSuppressions };