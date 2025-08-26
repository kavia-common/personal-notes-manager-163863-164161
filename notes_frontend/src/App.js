import React, { useEffect, useMemo, useState } from 'react';
import './App.css';
import './components/notes.css';
import NotesList from './components/NotesList';
import NoteEditor from './components/NoteEditor';
import { ensureSchema, listNotes, createNote, updateNote, deleteNote } from './services/notesService';

// PUBLIC_INTERFACE
function App() {
  /**
   * This is the main App component that renders:
   * - a header with app title and environment status
   * - a responsive layout with a notes list and editor
   * It integrates with Supabase to persist notes and uses local state for UI.
   */
  const [theme, setTheme] = useState('light');
  const [notes, setNotes] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const supaConfigured = useMemo(
    () => Boolean(process.env.REACT_APP_SUPABASE_URL && process.env.REACT_APP_SUPABASE_KEY),
    []
  );
  const selectedNote = useMemo(
    () => notes.find((n) => n.id === selectedId),
    [notes, selectedId]
  );

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Initial load
  useEffect(() => {
    async function init() {
      try {
        await ensureSchema();
      } finally {
        await refreshNotes();
      }
    }
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  async function refreshNotes() {
    setLoading(true);
    try {
      const data = await listNotes();
      setNotes(data);
      if (data.length && !selectedId) {
        setSelectedId(data[0].id);
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Failed to load notes:', e?.message || e);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    try {
      const newNote = await createNote({ title: 'Untitled', content: '' });
      setNotes((prev) => [newNote, ...prev]);
      setSelectedId(newNote.id);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Failed to create note:', e?.message || e);
      alert('Failed to create note. Please ensure Supabase credentials are set and table exists.');
    }
  }

  async function handleSave(payload) {
    if (!selectedNote) return;
    const isNew = !selectedNote.id;
    try {
      if (isNew) {
        const created = await createNote(payload);
        setNotes((prev) => [created, ...prev]);
        setSelectedId(created.id);
      } else {
        const updated = await updateNote(selectedNote.id, payload);
        setNotes((prev) =>
          prev
            .map((n) => (n.id === updated.id ? updated : n))
            .sort(
              (a, b) =>
                new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime()
            )
        );
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Failed to save note:', e?.message || e);
      alert('Failed to save note. Please check your Supabase configuration.');
    }
  }

  async function handleDelete(id) {
    if (!id) return;
    if (!window.confirm('Delete this note? This action cannot be undone.')) return;
    try {
      await deleteNote(id);
      setNotes((prev) => prev.filter((n) => n.id !== id));
      setSelectedId((prev) => (prev === id ? null : prev));
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Failed to delete note:', e?.message || e);
      alert('Failed to delete note. Please check your Supabase configuration.');
    }
  }

  // If no note selected and not loading, show empty editor
  const editorNote = selectedNote || null;

  return (
    <div className="app-shell">
      <header className="header">
        <div className="header-inner">
          <div className="brand">
            <div className="logo">N</div>
            <div className="title">Personal Notes</div>
          </div>
          <div className="header-actions">
            <span
              title={
                supaConfigured
                  ? 'Supabase configured via environment'
                  : 'Supabase NOT configured. Set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_KEY'
              }
              style={{
                color: supaConfigured ? 'var(--success)' : 'var(--danger)',
                fontWeight: 700
              }}
            >
              {supaConfigured ? 'Connected' : 'Disconnected'}
            </span>
            <button
              className="btn"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
            </button>
          </div>
        </div>
      </header>

      <main className="container" role="main">
        <NotesList
          notes={notes}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onCreate={handleCreate}
        />
        <NoteEditor note={editorNote} onSave={handleSave} onDelete={handleDelete} />
      </main>

      {loading && (
        <div
          style={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            background: '#fff',
            border: '1px solid var(--border)',
            borderRadius: 8,
            padding: '8px 12px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
            color: 'var(--secondary)'
          }}
        >
          Loading notes...
        </div>
      )}
    </div>
  );
}

export default App;
