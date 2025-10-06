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
  // Try to update the auth.users table directly since profiles table doesn't exist
  const { error } = await supabaseServer.auth.admin.updateUserById(userId, {
    email_confirm: true
  });

  if (error) {
    console.error('Failed to update auth.users:', error.message);
    
    // Fallback: try to create a simple record in a custom table
    const { error: fallbackError } = await supabaseServer
      .from('user_verifications')
      .upsert({ 
        user_id: userId, 
        email_verified: true, 
        verified_at: new Date().toISOString(),
        updated_at: new Date().toISOString() 
      }, { onConflict: 'user_id' });
    
    if (fallbackError) {
      console.error('Fallback also failed:', fallbackError.message);
      return { success: false, error: `Auth update failed: ${error.message}, Fallback failed: ${fallbackError.message}` };
    }
    
    console.log('✅ Used fallback user_verifications table');
    return { success: true };
  }
  
  console.log('✅ Updated auth.users table directly');
  return { success: true };
}