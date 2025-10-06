#!/usr/bin/env node

/**
 * Supabase User Cleanup Script
 *
 * Deletes Supabase auth users and related records for specified emails:
 * - verification_tokens entries
 * - profiles row (if table exists)
 * - user_verifications row (fallback table, if exists)
 * - invitations by email (if table exists)
 *
 * Loads env from .env.vercel (preferred) or .env.local.
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

const { createClient } = require('@supabase/supabase-js');

// Support multiple env var names (Vercel/Vite conventions)
const SUPABASE_URL =
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.VITE_PUBLIC_SUPABASE_URL;

const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase credentials (SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY)');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

// Target emails to clean up
const TARGET_EMAILS = [
  'mokgethwamoabelo@gmail.com',
  'mokgethwamoabelo@icloud.com',
  'mokgethwamoabelo@yahoo.com',
];

async function findAuthUserByEmail(email) {
  const { data, error } = await supabase.auth.admin.listUsers();
  if (error) throw new Error(error.message);
  const user = data?.users?.find((u) => u.email?.toLowerCase() === email.toLowerCase());
  return user || null;
}

async function deleteSupabaseRowsSafely(table, filters) {
  try {
    let query = supabase.from(table).delete();
    Object.entries(filters || {}).forEach(([col, val]) => {
      query = query.eq(col, val);
    });
    const { error } = await query;
    if (error) {
      // Some tables may not exist; log and continue
      console.warn(`⚠️  ${table} delete warning: ${error.message}`);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err) {
    console.warn(`⚠️  ${table} delete error: ${err.message}`);
    return { success: false, error: err.message };
  }
}

async function cleanupUserByEmail(email) {
  const result = {
    email,
    found: false,
    userId: null,
    actions: [],
  };

  try {
    const user = await findAuthUserByEmail(email);
    if (!user) {
      result.actions.push({ step: 'find_user', status: 'not_found' });
      return result;
    }

    result.found = true;
    result.userId = user.id;
    result.actions.push({ step: 'find_user', status: 'found', userId: user.id });

    // Delete verification tokens
    const delTokens = await deleteSupabaseRowsSafely('verification_tokens', { user_id: user.id });
    result.actions.push({ step: 'delete_verification_tokens', status: delTokens.success ? 'ok' : 'warn', error: delTokens.error });

    // Delete fallback user_verifications table rows if present
    const delUserVerifications = await deleteSupabaseRowsSafely('user_verifications', { user_id: user.id });
    result.actions.push({ step: 'delete_user_verifications', status: delUserVerifications.success ? 'ok' : 'warn', error: delUserVerifications.error });

    // Delete profiles row if present (id = auth user id)
    const delProfile = await deleteSupabaseRowsSafely('profiles', { id: user.id });
    result.actions.push({ step: 'delete_profiles', status: delProfile.success ? 'ok' : 'warn', error: delProfile.error });

    // Delete invitations by email, if table exists
    const delInvitations = await deleteSupabaseRowsSafely('invitations', { email });
    result.actions.push({ step: 'delete_invitations', status: delInvitations.success ? 'ok' : 'warn', error: delInvitations.error });

    // Finally delete auth user
    const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
    if (deleteError) {
      result.actions.push({ step: 'delete_auth_user', status: 'error', error: deleteError.message });
    } else {
      result.actions.push({ step: 'delete_auth_user', status: 'ok' });
    }

    return result;
  } catch (err) {
    result.actions.push({ step: 'cleanup_error', status: 'error', error: err.message });
    return result;
  }
}

async function main() {
  console.log('🧹 Supabase Cleanup: starting...');
  const summary = { timestamp: new Date().toISOString(), results: [] };

  for (const email of TARGET_EMAILS) {
    console.log(`➡️  Cleaning: ${email}`);
    const res = await cleanupUserByEmail(email);
    summary.results.push(res);
    console.log(`   - found: ${res.found} userId: ${res.userId || 'n/a'}`);
    res.actions.forEach((a) => console.log(`   - ${a.step}: ${a.status}${a.error ? ` (${a.error})` : ''}`));
  }

  const outFile = path.join(__dirname, 'supabase_cleanup_results.json');
  fs.writeFileSync(outFile, JSON.stringify(summary, null, 2));
  console.log(`✅ Cleanup complete. Results saved to ${outFile}`);
}

if (require.main === module) {
  main().catch((e) => {
    console.error('💥 Cleanup failed:', e);
    process.exit(1);
  });
}

module.exports = { main, cleanupUserByEmail };