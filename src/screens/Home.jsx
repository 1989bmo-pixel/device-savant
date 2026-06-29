import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { scenarios } from '../data/scenarios';

const SPECIALTY_COLORS = {
  'Electrophysiology': { bg: 'rgba(79,142,247,0.12)', text: '#93c5fd' },
  'Structural Heart':  { bg: 'rgba(251,146,60,0.12)',  text: '#fdba74' },
  'Neuromodulation':   { bg: 'rgba(167,139,250,0.12)', text: '#c4b5fd' },
};

export default function Home() {
  const { user, scores, logout } = useAuth();
  const navigate = useNavigate();

  const totalAttempts = scores.length;
  const avgScore = totalAttempts > 0
    ? Math.round(scores.reduce((sum, s) => sum + (s.score / s.total) * 100, 0) / totalAttempts)
    : null;

  const bestScore = totalAttempts > 0
    ? Math.max(...scores.map((s) => Math.round((s.score / s.total) * 100)))
    : null;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--navy)' }}>
      {/* Nav */}
      <nav style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 24px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--navy-light)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="16" height="16" viewBox="0 0 28 28" fill="none">
              <path d="M14 3L25 9V19L14 25L3 19V9L14 3Z" stroke="white" strokeWidth="2.5" fill="none"/>
              <circle cx="14" cy="14" r="4" fill="white"/>
            </svg>
          </div>
          <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--white)' }}>Device Savant</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{user?.company}</span>
          <button
            onClick={logout}
            style={{
              padding: '6px 14px',
              background: 'rgba(255,255,255,0.07)',
              color: 'var(--text-muted)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.875rem',
            }}
          >
            Sign Out
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px' }}>
        {/* Greeting */}
        <div style={{ marginBottom: 36 }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--white)', marginBottom: 6 }}>
            Welcome back, {user?.name?.split(' ')[0]}.
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Keep sharpening your clinical knowledge — one case at a time.
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 40 }}>
          <StatCard label="Cases Completed" value={totalAttempts} />
          <StatCard label="Average Score" value={avgScore !== null ? `${avgScore}%` : '—'} />
          <StatCard label="Best Score" value={bestScore !== null ? `${bestScore}%` : '—'} />
        </div>

        {/* Case library */}
        <div style={{ marginBottom: 16 }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--white)', marginBottom: 20 }}>
            Case Library
          </h2>
          <div style={{ display: 'grid', gap: 16 }}>
            {scenarios.map((scenario) => (
              <ScenarioCard
                key={scenario.id}
                scenario={scenario}
                lastAttempt={scores.find((s) => s.scenario_id === scenario.id)}
                onStart={() => navigate(`/scenario/${scenario.id}`)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ScenarioCard({ scenario, lastAttempt, onStart }) {
  const colors = SPECIALTY_COLORS[scenario.specialty] || { bg: 'rgba(255,255,255,0.08)', text: 'var(--text-muted)' };
  const lastPct = lastAttempt ? Math.round((lastAttempt.score / lastAttempt.total) * 100) : null;

  return (
    <div style={{
      background: 'var(--navy-card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      padding: '24px 28px',
      display: 'flex',
      alignItems: 'center',
      gap: 24,
      flexWrap: 'wrap',
    }}>
      <div style={{ flex: 1, minWidth: 220 }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
          <Tag bg={colors.bg} color={colors.text}>{scenario.specialty}</Tag>
          <Tag bg="rgba(255,255,255,0.05)" color="var(--text-muted)">{scenario.difficulty}</Tag>
          <Tag bg="rgba(255,255,255,0.05)" color="var(--text-muted)">{scenario.duration}</Tag>
        </div>
        <div style={{ fontWeight: 700, fontSize: '1.0625rem', color: 'var(--white)', marginBottom: 6 }}>
          {scenario.title}
        </div>
        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>
          {scenario.description}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexShrink: 0 }}>
        {lastPct !== null && (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '1.375rem',
              fontWeight: 800,
              color: lastPct >= 70 ? 'var(--success)' : lastPct >= 50 ? '#fb923c' : 'var(--error)',
            }}>
              {lastPct}%
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Last score</div>
          </div>
        )}
        <button
          onClick={onStart}
          style={{
            padding: '11px 24px',
            background: lastAttempt ? 'rgba(79,142,247,0.15)' : 'var(--accent)',
            color: lastAttempt ? 'var(--accent)' : 'white',
            border: lastAttempt ? '1px solid rgba(79,142,247,0.3)' : 'none',
            borderRadius: 'var(--radius-sm)',
            fontWeight: 700,
            fontSize: '0.9375rem',
            whiteSpace: 'nowrap',
          }}
        >
          {lastAttempt ? 'Retry' : 'Start →'}
        </button>
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div style={{
      background: 'var(--navy-card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      padding: '20px 24px',
    }}>
      <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--white)', marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{label}</div>
    </div>
  );
}

function Tag({ children, bg, color }) {
  return (
    <span style={{
      display: 'inline-block',
      padding: '3px 10px',
      borderRadius: 20,
      background: bg,
      color,
      fontSize: '0.75rem',
      fontWeight: 600,
    }}>
      {children}
    </span>
  );
}
