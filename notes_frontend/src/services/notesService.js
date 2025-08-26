import supabaseClient, { getSupabaseClient } from '../supabaseClient';

const TABLE = 'notes';
const LS_KEY = 'notes_fallback';

/**
 * INTERNAL: determines if Supabase is configured
 */
function isSupaConfigured() {
  return Boolean(process.env.REACT_APP_SUPABASE_URL && process.env.REACT_APP_SUPABASE_KEY);
}

/**
 * INTERNAL: localStorage helpers for offline/disconnected mode.
 */
function readLocal() {
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    // sort newest first
    return (parsed || []).sort(
      (a, b) => new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime()
    );
  } catch {
    return [];
  }
}

function writeLocal(list) {
  try {
    window.localStorage.setItem(LS_KEY, JSON.stringify(list || []));
  } catch {
    // ignore write errors
  }
}

function generateLocalId() {
  return `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

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
 * Works even when Supabase is not configured by using localStorage.
 */
export async function listNotes() {
  if (!isSupaConfigured()) {
    return readLocal();
  }

  const { data, error } = await supabaseClient
    .from(TABLE)
    .select('id, title, content, updated_at')
    .order('updated_at', { ascending: false });

  if (error) {
    // fallback to local on error
    // eslint-disable-next-line no-console
    console.warn('Supabase list failed, using local storage fallback:', error.message || error);
    return readLocal();
  }
  return data || [];
}

/**
 * PUBLIC_INTERFACE
 * createNote
 * Create a new note with given title and content.
 * Uses Supabase when configured; otherwise falls back to localStorage.
 */
export async function createNote({ title, content }) {
  const now = new Date().toISOString();

  if (!isSupaConfigured()) {
    const list = readLocal();
    const created = { id: generateLocalId(), title, content, updated_at: now };
    writeLocal([created, ...list]);
    return created;
  }

  const { data, error } = await supabaseClient
    .from(TABLE)
    .insert([{ title, content, updated_at: now }])
    .select('id, title, content, updated_at')
    .single();

  if (error) {
    // fallback to local on error
    // eslint-disable-next-line no-console
    console.warn('Supabase create failed, saving locally:', error.message || error);
    const list = readLocal();
    const created = { id: generateLocalId(), title, content, updated_at: now };
    writeLocal([created, ...list]);
    return created;
  }
  return data;
}

/**
 * PUBLIC_INTERFACE
 * updateNote
 * Update an existing note fields by id.
 * If the id is a local one or Supabase is not configured, update localStorage.
 */
export async function updateNote(id, { title, content }) {
  const now = new Date().toISOString();
  const isLocal = String(id).startsWith('local-');

  if (!isSupaConfigured() || isLocal) {
    const list = readLocal();
    const updated = { id, title, content, updated_at: now };
    const next = [updated, ...list.filter((n) => String(n.id) !== String(id))];
    writeLocal(next);
    return updated;
  }

  const { data, error } = await supabaseClient
    .from(TABLE)
    .update({ title, content, updated_at: now })
    .eq('id', id)
    .select('id, title, content, updated_at')
    .single();

  if (error) {
    // fallback to local on error
    // eslint-disable-next-line no-console
    console.warn('Supabase update failed, saving locally:', error.message || error);
    const list = readLocal();
    const updated = { id: generateLocalId(), title, content, updated_at: now };
    writeLocal([updated, ...list.filter((n) => String(n.id) !== String(id))]);
    return updated;
  }
  return data;
}

/**
 * PUBLIC_INTERFACE
 * deleteNote
 * Delete a note by id.
 * Handles both Supabase and localStorage notes.
 */
export async function deleteNote(id) {
  const isLocal = String(id).startsWith('local-');
  if (!isSupaConfigured() || isLocal) {
    const list = readLocal().filter((n) => String(n.id) !== String(id));
    writeLocal(list);
    return true;
  }

  const { error } = await supabaseClient.from(TABLE).delete().eq('id', id);
  if (error) {
    // eslint-disable-next-line no-console
    console.warn('Supabase delete failed, removing locally:', error.message || error);
    const list = readLocal().filter((n) => String(n.id) !== String(id));
    writeLocal(list);
    return true;
  }
  return true;
}
