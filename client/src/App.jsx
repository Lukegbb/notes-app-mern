import { useCallback, useEffect, useState } from 'react';
import { api, clearToken, getToken, setToken } from './api.js';
import AuthForm from './components/AuthForm.jsx';
import NoteForm from './components/NoteForm.jsx';
import NoteList from './components/NoteList.jsx';

export default function App() {
  const [loggedIn, setLoggedIn] = useState(Boolean(getToken()));
  const [notes, setNotes] = useState([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  const loadNotes = useCallback(async () => {
    try {
      const data = await api.listNotes({ search });
      setNotes(data.items);
      setError('');
    } catch (err) {
      setError(err.message);
    }
  }, [search]);

  useEffect(() => {
    if (loggedIn) loadNotes();
  }, [loggedIn, loadNotes]);

  const handleAuth = async (mode, payload) => {
    const data = mode === 'login' ? await api.login(payload) : await api.register(payload);
    setToken(data.token);
    setLoggedIn(true);
  };

  const handleLogout = () => {
    clearToken();
    setLoggedIn(false);
    setNotes([]);
  };

  const handleCreate = async (note) => {
    await api.createNote(note);
    loadNotes();
  };

  const handleTogglePin = async (note) => {
    await api.updateNote(note._id, { pinned: !note.pinned });
    loadNotes();
  };

  const handleDelete = async (note) => {
    await api.deleteNote(note._id);
    loadNotes();
  };

  if (!loggedIn) {
    return (
      <main className="container">
        <h1>Notes</h1>
        <AuthForm onSubmit={handleAuth} />
      </main>
    );
  }

  return (
    <main className="container">
      <header className="header">
        <h1>My notes</h1>
        <button type="button" className="secondary" onClick={handleLogout}>
          Log out
        </button>
      </header>

      <NoteForm onSubmit={handleCreate} />

      <input
        className="search"
        type="search"
        placeholder="Search notes..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {error && <p className="error">{error}</p>}

      <NoteList notes={notes} onTogglePin={handleTogglePin} onDelete={handleDelete} />
    </main>
  );
}
