const BASE = import.meta.env.PROD ? '/api' : 'http://localhost:3001/api';

function getToken() {
  return localStorage.getItem('ds_token');
}

async function request(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  signup: (body) => request('/signup', { method: 'POST', body }),
  login: (body) => request('/login', { method: 'POST', body }),
  me: () => request('/me'),
  saveScore: (body) => request('/scores', { method: 'POST', body }),
};
