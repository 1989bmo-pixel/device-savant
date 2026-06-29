import { useLocation, useNavigate } from 'react-router-dom';

export default function Results() {
  const { state } = useLocation();
  const navigate = useNavigate();

  if (!state) return navigate('/home'), null;

  const { score, total, scenario, answers } = state;
  const pct = Math.round((score / total) * 100);

  const grade = pct >= 90 ? { label: 'Expert', color: '#a78bfa' }
    : pct >= 70 ? { label: 'Proficient', color: 'var(--success)' }
    : pct >= 50 ? { label: 'Developing', color: '#fb923c' }
    : { label: 'Needs Review', color: 'var(--error)' };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--navy)' }}>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '48px 24px' }}>
        {/* Score hero */}
        <div style={{
          background: 'var(--navy-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          padding: '40px',
          textAlign: 'center',
          marginBottom: 28,
        }}>
          <div style={{ fontSize: '0.8125rem', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 24 }}>
            CASE COMPLETE
          </div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 120,
            height: 120,
            borderRadius: '50%',
            border: `4px solid ${grade.color}`,
            marginBottom: 20,
          }}>
            <span style={{ fontSize: '2.25rem', fontWeight: 800, color: grade.color }}>{pct}%</span>
          </div>
          <div style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--white)', marginBottom: 6 }}>
            {grade.label}
          </div>
          <div style={{ color: 'var(--text-muted)' }}>
            {score} of {total} questions correct
          </div>
        </div>

        {/* Key takeaways */}
        <div style={{
          background: 'var(--navy-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          padding: '28px',
          marginBottom: 28,
        }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--white)', marginBottom: 20 }}>
            Key Takeaways
          </h2>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {scenario.takeaways.map((t, i) => (
              <li key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <span style={{
                  display: 'inline-flex',
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  background: 'var(--accent-light)',
                  color: 'var(--accent)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: 1,
                }}>
                  {i + 1}
                </span>
                <span style={{ fontSize: '0.9375rem', lineHeight: 1.6, color: 'var(--text)' }}>{t}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Q&A review */}
        <div style={{
          background: 'var(--navy-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          padding: '28px',
          marginBottom: 32,
        }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--white)', marginBottom: 20 }}>
            Answer Review
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {answers.map((a, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                background: a.isCorrect ? 'var(--success-light)' : 'var(--error-light)',
                border: `1px solid ${a.isCorrect ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
              }}>
                <span style={{ fontWeight: 700, color: a.isCorrect ? 'var(--success)' : 'var(--error)', fontSize: '1rem' }}>
                  {a.isCorrect ? '✓' : '✗'}
                </span>
                <span style={{ fontSize: '0.875rem', color: 'var(--text)' }}>Question {i + 1}</span>
                {!a.isCorrect && (
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                    Correct: {a.correct.toUpperCase()}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate(`/scenario/${scenario.id}`)}
            style={{
              padding: '13px 28px',
              background: 'var(--accent)',
              color: 'white',
              borderRadius: 'var(--radius-sm)',
              fontWeight: 700,
            }}
          >
            Retry Case
          </button>
          <button
            onClick={() => navigate('/home')}
            style={{
              padding: '13px 28px',
              background: 'rgba(255,255,255,0.07)',
              color: 'var(--text)',
              borderRadius: 'var(--radius-sm)',
              fontWeight: 700,
            }}
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
