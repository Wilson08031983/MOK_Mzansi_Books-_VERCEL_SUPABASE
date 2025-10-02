import { supabaseServer } from '@/integrations/supabase/serverClient';

export async function insertVerificationToken(params: {
  userId: string;
  tokenHash: string;
  purpose?: 'email_verification' | 'password_reset';
  expiresAt: string;
}): Promise<{ id?: string; error?: string }> {
  const { userId, tokenHash, purpose = 'email_verification', expiresAt } = params;
  const { data, error } = await supabaseServer
    .from('verification_tokens')
    .insert([{ user_id: userId, token_hash: tokenHash, purpose, expires_at: expiresAt }])
    .select('id')
    .single();

  if (error) return { error: error.message };
  return { id: (data as any)?.id };
}

export async function findTokenByHash(userId: string, tokenHash: string): Promise<{ token?: any; error?: string }> {
  const { data, error } = await supabaseServer
    .from('verification_tokens')
    .select('*')
    .eq('user_id', userId)
    .eq('token_hash', tokenHash)
    .limit(1)
    .maybeSingle();

  if (error) return { error: error.message };
  if (!data) return { token: undefined };
  return { token: data };
}

export async function markTokenUsed(id: string): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabaseServer
    .from('verification_tokens')
    .update({ used_at: new Date().toISOString() })
    .eq('id', id);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function invalidateOtherTokensForUser(userId: string, exceptId?: string): Promise<{ success: boolean; error?: string }> {
  let query = supabaseServer
    .from('verification_tokens')
    .update({ used_at: new Date().toISOString() })
    .eq('user_id', userId)
    .is('used_at', null);

  if (exceptId) {
    query = query.neq('id', exceptId);
  }

  const { error } = await query;
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function markUserEmailVerified(userId: string): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabaseServer
    .from('profiles')
    .update({ email_verified: true, verified_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq('id', userId);

  if (error) return { success: false, error: error.message };
  return { success: true };
}