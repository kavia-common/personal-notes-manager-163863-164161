//
// Supabase client initialization for the Notes app.
// Reads configuration from environment variables.
//
// IMPORTANT: Do not hardcode values. Ensure the following ENV variables are provided in the environment:
// - REACT_APP_SUPABASE_URL
// - REACT_APP_SUPABASE_KEY
//
import { createClient } from '@supabase/supabase-js';

/**
 * PUBLIC_INTERFACE
 * getSupabaseClient
 * Returns a singleton Supabase client instance configured from environment variables.
 */
export function getSupabaseClient() {
  /** This function returns a configured supabase client. */
  const url = process.env.REACT_APP_SUPABASE_URL;
  const key = process.env.REACT_APP_SUPABASE_KEY;

  if (!url || !key) {
    // Provide a helpful error early to guide proper environment setup
    // We don't throw to avoid crashing the UI; instead we log and continue.
    // Calls will fail gracefully with proper error messages.
    // eslint-disable-next-line no-console
    console.error(
      'Supabase environment variables missing. Please set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_KEY in .env.'
    );
  }

  return createClient(url || '', key || '');
}

export default getSupabaseClient();
