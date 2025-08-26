import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import './notes.css';

/**
 * NotesList component shows a list of notes with a search bar.
 */
export default function NotesList({ notes, selectedId, onSelect, onCreate }) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return notes;
    return notes.filter(
      (n) =>
        (n.title || '').toLowerCase().includes(q) ||
        (n.content || '').toLowerCase().includes(q)
    );
  }, [notes, query]);

  return (
    <aside className="notes-list">
      <div className="list-header">
        <input
          className="search"
          placeholder="Search notes..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search notes"
        />
        <button className="btn primary" onClick={onCreate} aria-label="Create note">
          + New
        </button>
      </div>
      <ul className="list">
        {filtered.map((note) => (
          <li
            key={note.id}
            className={`item ${selectedId === note.id ? 'active' : ''}`}
            onClick={() => onSelect(note.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onSelect(note.id);
            }}
          >
            <div className="title">{note.title || 'Untitled'}</div>
            <div className="snippet">
              {(note.content || '').slice(0, 80) || 'No content'}
            </div>
            <div className="time">
              {note.updated_at ? new Date(note.updated_at).toLocaleString() : ''}
            </div>
          </li>
        ))}
        {filtered.length === 0 && (
          <li className="empty">No notes found. Create your first note!</li>
        )}
      </ul>
    </aside>
  );
}

NotesList.propTypes = {
  notes: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.any,
      title: PropTypes.string,
      content: PropTypes.string,
      updated_at: PropTypes.string
    })
  ).isRequired,
  selectedId: PropTypes.any,
  onSelect: PropTypes.func.isRequired,
  onCreate: PropTypes.func.isRequired
};
