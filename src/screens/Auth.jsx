import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const inputStyle = {
  width: '100%',
  padding: '12px 16px',
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 'var(--radius-sm)',
  color: 'var(--text)',
  fontSize: '1rem',
  transition: 'border-color 0.15s',
};

export default function Auth() {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', company: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  function set(field, val) {
    setForm((f) => ({ ...f, [field]: val }));
    setError('');
  }

  async function submit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
      } else {
        if (!form.name || !form.company) {
          setError('Please fill in all fields.');
          return;
        }
        await signup(form.name, form.email, form.company, form.password);
      }
      navigate('/home');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      background: 'linear-gradient(135deg, #0a1628 0%, #0d1f3c 100%)',
    }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 56,
            height: 56,
            borderRadius: 16,
            background: 'var(--accent)',
            marginBottom: 16,
          }}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <path d="M14 3L25 9V19L14 25L3 19V9L14 3Z" stroke="white" strokeWidth="2" fill="none"/>
              <circle cx="14" cy="14" r="4" fill="white"/>
            </svg>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--white)', letterSpacing: '-0.5px' }}>
            Device Savant
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: 6 }}>
            Clinical simulation for medical device reps
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'var(--navy-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          padding: '32px',
        }}>
          {/* Toggle */}
          <div style={{
            display: 'flex',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: 'var(--radius-sm)',
            padding: 4,
            marginBottom: 28,
          }}>
            {['login', 'signup'].map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); }}
                style={{
                  flex: 1,
                  padding: '8px',
                  borderRadius: 6,
                  background: mode === m ? 'var(--accent)' : 'transparent',
                  color: mode === m ? 'white' : 'var(--text-muted)',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                }}
              >
                {m === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {mode === 'signup' && (
              <>
                <Field label="Full Name" value={form.name} onChange={(v) => set('name', v)} placeholder="Jane Smith" />
                <Field label="Company" value={form.company} onChange={(v) => set('company', v)} placeholder="Medtronic, Abbott, BSC..." />
              </>
            )}
            <Field label="Email" type="email" value={form.email} onChange={(v) => set('email', v)} placeholder="jane@company.com" />
            <Field label="Password" type="password" value={form.password} onChange={(v) => set('password', v)} placeholder="••••••••" />

            {error && (
              <div style={{
                background: 'var(--error-light)',
                border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: 'var(--radius-sm)',
                padding: '10px 14px',
                color: '#fca5a5',
                fontSize: '0.875rem',
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '13px',
                background: 'var(--accent)',
                color: 'white',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 700,
                fontSize: '1rem',
                marginTop: 4,
              }}
            >
              {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function Field({ label, type = 'text', value, onChange, placeholder }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required
        style={inputStyle}
        onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
        onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
      />
    </div>
  );
}
