import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { scenarios } from '../data/scenarios';
import { useAuth } from '../context/AuthContext';

export default function ScenarioPlayer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { saveScore } = useAuth();
  const scenario = scenarios.find((s) => s.id === id);

  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [saving, setSaving] = useState(false);

  if (!scenario) return <div style={{ padding: 40, color: 'var(--text-muted)' }}>Scenario not found.</div>;

  const q = scenario.questions[current];
  const total = scenario.questions.length;
  const progress = ((current) / total) * 100;

  function select(optId) {
    if (revealed) return;
    setSelected(optId);
  }

  function confirm() {
    if (!selected || revealed) return;
    setRevealed(true);
  }

  async function next() {
    const record = { questionId: q.id, selected, correct: q.correct, isCorrect: selected === q.correct };
    const newAnswers = [...answers, record];

    if (current + 1 < total) {
      setAnswers(newAnswers);
      setCurrent((c) => c + 1);
      setSelected(null);
      setRevealed(false);
    } else {
      const score = newAnswers.filter((a) => a.isCorrect).length;
      setSaving(true);
      try { await saveScore(scenario.id, score, total); } catch {}
      navigate(`/results/${scenario.id}`, { state: { answers: newAnswers, score, total, scenario } });
    }
  }

  const isCorrect = revealed && selected === q.correct;
  const isWrong = revealed && selected !== q.correct;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--navy)' }}>
      {/* Header */}
      <div style={{
        padding: '16px 24px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--navy-light)',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
      }}>
        <button
          onClick={() => navigate('/home')}
          style={{
            background: 'transparent',
            color: 'var(--text-muted)',
            padding: '4px 0',
            fontSize: '0.875rem',
          }}
        >
          ← Exit
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: 6 }}>
            {scenario.title} — Question {current + 1} of {total}
          </div>
          <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2 }}>
            <div style={{
              height: '100%',
              width: `${progress}%`,
              background: 'var(--accent)',
              borderRadius: 2,
              transition: 'width 0.4s ease',
            }} />
          </div>
        </div>
        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', minWidth: 60, textAlign: 'right' }}>
          {Math.round(progress)}%
        </div>
      </div>

      {/* Body */}
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '40px 24px' }}>
        {/* Question */}
        <div style={{
          background: 'var(--navy-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          padding: '28px',
          marginBottom: 24,
        }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.08em', marginBottom: 14 }}>
            QUESTION {current + 1}
          </div>
          <p style={{ fontSize: '1.0625rem', lineHeight: 1.65, color: 'var(--white)', fontWeight: 500 }}>
            {q.stem}
          </p>
        </div>

        {/* Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
          {q.options.map((opt) => {
            const isSelected = selected === opt.id;
            const isThisCorrect = revealed && opt.id === q.correct;
            const isThisWrong = revealed && isSelected && opt.id !== q.correct;

            let borderColor = 'var(--border)';
            let bg = 'var(--navy-card)';
            let textColor = 'var(--text)';

            if (isThisCorrect) { borderColor = 'var(--success)'; bg = 'var(--success-light)'; textColor = '#86efac'; }
            else if (isThisWrong) { borderColor = 'var(--error)'; bg = 'var(--error-light)'; textColor = '#fca5a5'; }
            else if (isSelected && !revealed) { borderColor = 'var(--accent)'; bg = 'var(--accent-light)'; textColor = 'var(--white)'; }

            return (
              <button
                key={opt.id}
                onClick={() => select(opt.id)}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 14,
                  padding: '16px 18px',
                  background: bg,
                  border: `1px solid ${borderColor}`,
                  borderRadius: 'var(--radius-sm)',
                  color: textColor,
                  textAlign: 'left',
                  cursor: revealed ? 'default' : 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 26,
                  height: 26,
                  borderRadius: 6,
                  background: isThisCorrect ? 'var(--success)' : isThisWrong ? 'var(--error)' : isSelected ? 'var(--accent)' : 'rgba(255,255,255,0.06)',
                  color: 'white',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  flexShrink: 0,
                }}>
                  {opt.id.toUpperCase()}
                </span>
                <span style={{ lineHeight: 1.55, paddingTop: 3, fontSize: '0.9375rem' }}>{opt.text}</span>
              </button>
            );
          })}
        </div>

        {/* Feedback */}
        {revealed && (
          <div style={{
            background: isCorrect ? 'var(--success-light)' : 'var(--error-light)',
            border: `1px solid ${isCorrect ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
            borderRadius: 'var(--radius)',
            padding: '20px 24px',
            marginBottom: 24,
          }}>
            <div style={{ fontWeight: 700, marginBottom: 8, color: isCorrect ? '#86efac' : '#fca5a5' }}>
              {isCorrect ? '✓ Correct' : '✗ Incorrect'}
            </div>
            <p style={{ fontSize: '0.9375rem', lineHeight: 1.65, color: 'var(--text)' }}>
              {q.explanation}
            </p>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          {!revealed ? (
            <button
              onClick={confirm}
              disabled={!selected}
              style={{
                padding: '12px 28px',
                background: selected ? 'var(--accent)' : 'rgba(255,255,255,0.06)',
                color: selected ? 'white' : 'var(--text-muted)',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 700,
              }}
            >
              Submit Answer
            </button>
          ) : (
            <button
              onClick={next}
              disabled={saving}
              style={{
                padding: '12px 28px',
                background: 'var(--accent)',
                color: 'white',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 700,
              }}
            >
              {current + 1 < total ? 'Next Question →' : saving ? 'Saving...' : 'See Results →'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
