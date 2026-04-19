import { createClient } from '@supabase/supabase-js';

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey  = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error(
    '[Supabase] ❌ Missing env vars. ' +
    'Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are in .env ' +
    'then restart the dev server.'
  );
}

/**
 * Singleton Supabase client — ONE instance, created at module level.
 *
 * IMPORTANT – do NOT pass a custom storageKey.
 * Supabase's PKCE flow writes the code_verifier to localStorage under an
 * internal key (e.g. "supabase.auth.token-code-verifier").  If you set a
 * custom storageKey, the SESSION is read from the new key but the verifier
 * remains under the old key → keys never match → "OAuth state parameter
 * missing" error on every Google callback.
 *
 * Let Supabase manage its own key naming by leaving storageKey unset.
 */
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    flowType:         'pkce',   // PKCE is the correct flow for SPAs (default in v2)
    detectSessionInUrl: true,   // auto-exchanges ?code= on callback page load
    persistSession:   true,
    autoRefreshToken: true,
  },
});
