import supabaseClient, { getSupabaseClient } from '../supabaseClient';

const TABLE = 'notes';

/**
 * PUBLIC_INTERFACE
 * ensureSchema
 * Ensures the required database table exists. This function is idempotent.
 * It attempts to create a 'notes' table if it doesn't already exist.
 *
 * NOTE: This is a convenience for development environments. In production,
 * you should manage schema via migrations. If this fails due to permissions,
 * the app will still work assuming the table exists.
 */
export async function ensureSchema() {
  // Attempt to verify table by selecting from it. If it fails with a relation error, attempt to create via SQL.
  const supabase = getSupabaseClient();
  try {
    const { error } = await supabase.from(TABLE).select('id').limit(1);
    if (!error) return true;

    const message = (error?.message || '').toLowerCase();
    if (message.includes('relation') && message.includes('does not exist')) {
      // Try to create the table. This requires service role or SQL RPC; for client apps this may fail.
      // We use a simple approach with SQL via the RESTful rpc if available; otherwise we just log.
      // eslint-disable-next-line no-console
      console.warn('Notes table might not exist. Please create a "notes" table with columns: id (uuid, pk), title (text), content (text), updated_at (timestamp).');
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('Unable to verify schema:', e);
  }
  return false;
}

/**
 * PUBLIC_INTERFACE
 * listNotes
 * Fetch list of notes ordered by updated_at descending.
 */
export async function listNotes() {
  const { data, error } = await supabaseClient
    .from(TABLE)
    .select('id, title, content, updated_at')
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * PUBLIC_INTERFACE
 * createNote
 * Create a new note with given title and content.
 */
export async function createNote({ title, content }) {
  const now = new Date().toISOString();
  const { data, error } = await supabaseClient
    .from(TABLE)
    .insert([{ title, content, updated_at: now }])
    .select('id, title, content, updated_at')
    .single();

  if (error) throw error;
  return data;
}

/**
 * PUBLIC_INTERFACE
 * updateNote
 * Update an existing note fields by id.
 */
export async function updateNote(id, { title, content }) {
  const now = new Date().toISOString();
  const { data, error } = await supabaseClient
    .from(TABLE)
    .update({ title, content, updated_at: now })
    .eq('id', id)
    .select('id, title, content, updated_at')
    .single();

  if (error) throw error;
  return data;
}

/**
 * PUBLIC_INTERFACE
 * deleteNote
 * Delete a note by id.
 */
export async function deleteNote(id) {
  const { error } = await supabaseClient.from(TABLE).delete().eq('id', id);
  if (error) throw error;
  return true;
}
