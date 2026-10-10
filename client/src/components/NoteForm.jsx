import { useState } from 'react';

export default function NoteForm({ onSubmit }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSubmit({
      title,
      content,
      tags: tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
    });
    setTitle('');
    setContent('');
    setTags('');
  };

  return (
    <form className="card" onSubmit={handleSubmit}>
      <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
      <textarea
        placeholder="Write your note..."
        rows={3}
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <input
        placeholder="Tags (comma separated)"
        value={tags}
        onChange={(e) => setTags(e.target.value)}
      />
      <button type="submit">Add note</button>
    </form>
  );
}
