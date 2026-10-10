export default function NoteList({ notes, onTogglePin, onDelete }) {
  if (notes.length === 0) {
    return <p className="empty">No notes yet. Create your first one above.</p>;
  }

  return (
    <ul className="notes">
      {notes.map((note) => (
        <li key={note._id} className={`note ${note.pinned ? 'pinned' : ''}`}>
          <div className="note-header">
            <h3>{note.title}</h3>
            <div className="actions">
              <button type="button" className="secondary" onClick={() => onTogglePin(note)}>
                {note.pinned ? 'Unpin' : 'Pin'}
              </button>
              <button type="button" className="danger" onClick={() => onDelete(note)}>
                Delete
              </button>
            </div>
          </div>
          {note.content && <p>{note.content}</p>}
          {note.tags.length > 0 && (
            <div className="tags">
              {note.tags.map((tag) => (
                <span key={tag} className="tag">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
