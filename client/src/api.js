const TOKEN_KEY = 'notes_token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

async function request(path, { method = 'GET', body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`/api${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `Request failed (${res.status})`);
  }
  return data;
}

export const api = {
  register: (payload) => request('/auth/register', { method: 'POST', body: payload }),
  login: (payload) => request('/auth/login', { method: 'POST', body: payload }),
  listNotes: (params = {}) => {
    const query = new URLSearchParams(
      Object.entries(params).filter(([, value]) => value)
    ).toString();
    return request(`/notes${query ? `?${query}` : ''}`);
  },
  createNote: (note) => request('/notes', { method: 'POST', body: note }),
  updateNote: (id, changes) => request(`/notes/${id}`, { method: 'PATCH', body: changes }),
  deleteNote: (id) => request(`/notes/${id}`, { method: 'DELETE' }),
};
