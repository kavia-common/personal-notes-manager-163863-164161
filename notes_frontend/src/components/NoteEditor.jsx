import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import './notes.css';

/**
 * NoteEditor handles editing a note. It supports save and delete actions.
 */
export default function NoteEditor({ note, onSave, onDelete }) {
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const isNew = !note?.id;

  useEffect(() => {
    setTitle(note?.title || '');
    setContent(note?.content || '');
  }, [note]);

  const disabled = title.trim().length === 0;

  return (
    <section className="editor">
      {note ? (
        <>
          <div className="editor-header">
            <input
              className="title-input"
              placeholder="Note title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              aria-label="Note title"
            />
            <div className="actions">
              {!isNew && (
                <button
                  className="btn danger outline"
                  onClick={() => onDelete(note.id)}
                  aria-label="Delete note"
                >
                  Delete
                </button>
              )}
              <button
                className="btn primary"
                onClick={() => onSave({ title: title.trim(), content })}
                aria-label="Save note"
                disabled={disabled}
                title={disabled ? 'Title is required to save' : undefined}
              >
                {isNew ? 'Create' : 'Save'}
              </button>
            </div>
          </div>
          <textarea
            className="content-input"
            placeholder="Write your note here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            aria-label="Note content"
          />
        </>
      ) : (
        <div className="empty-editor">
          <h3>Select a note to view or edit</h3>
          <p>Or create a new note from the side panel.</p>
        </div>
      )}
    </section>
  );
}

NoteEditor.propTypes = {
  note: PropTypes.shape({
    id: PropTypes.any,
    title: PropTypes.string,
    content: PropTypes.string
  }),
  onSave: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired
};
