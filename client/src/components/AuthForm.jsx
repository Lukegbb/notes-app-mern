import { useState } from 'react';

export default function AuthForm({ onSubmit }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onSubmit(mode, form);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form className="card" onSubmit={handleSubmit}>
      <h2>{mode === 'login' ? 'Log in' : 'Create account'}</h2>

      {mode === 'register' && (
        <input placeholder="Name" value={form.name} onChange={update('name')} required />
      )}
      <input type="email" placeholder="Email" value={form.email} onChange={update('email')} required />
      <input
        type="password"
        placeholder="Password (min. 8 characters)"
        value={form.password}
        onChange={update('password')}
        minLength={8}
        required
      />

      {error && <p className="error">{error}</p>}

      <button type="submit">{mode === 'login' ? 'Log in' : 'Sign up'}</button>
      <button
        type="button"
        className="link"
        onClick={() => {
          setMode(mode === 'login' ? 'register' : 'login');
          setError('');
        }}
      >
        {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Log in'}
      </button>
    </form>
  );
}
