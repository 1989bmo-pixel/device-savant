import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('ds_token');
    if (token) {
      api.me()
        .then((data) => { setUser(data); setScores(data.scores || []); })
        .catch(() => localStorage.removeItem('ds_token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  async function login(email, password) {
    const data = await api.login({ email, password });
    localStorage.setItem('ds_token', data.token);
    setUser(data.user);
    return data.user;
  }

  async function signup(name, email, company, password) {
    const data = await api.signup({ name, email, company, password });
    localStorage.setItem('ds_token', data.token);
    setUser(data.user);
    return data.user;
  }

  function logout() {
    localStorage.removeItem('ds_token');
    setUser(null);
    setScores([]);
  }

  async function saveScore(scenario_id, score, total) {
    await api.saveScore({ scenario_id, score, total });
    setScores((prev) => [{ scenario_id, score, total, completed_at: new Date().toISOString() }, ...prev]);
  }

  return (
    <AuthContext.Provider value={{ user, scores, loading, login, signup, logout, saveScore }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
