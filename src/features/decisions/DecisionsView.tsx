import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useApp } from '@/state/AppContext';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { GlassSurface } from '@/components/ui/GlassSurface';
import type { Decision } from '@/models';

export function DecisionsView() {
  const { state, dispatch } = useApp();
  const [showForm, setShowForm] = useState(false);

  const [problem, setProblem] = useState('');
  const [decision, setDecision] = useState('');
  const [reasons, setReasons] = useState('');
  const [alternatives, setAlternatives] = useState('');
  const [expectedOutcome, setExpectedOutcome] = useState('');

  const handleSave = () => {
    if (!problem.trim() || !decision.trim()) return;

    const newDecision: Decision = {
      id: `d-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      problem,
      decision,
      reasons: reasons.split('\n').map(r => r.trim()).filter(Boolean),
      alternatives: alternatives.split('\n').map(a => a.trim()).filter(Boolean),
      expectedOutcome,
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    dispatch({ type: 'UPSERT_DECISION', payload: newDecision });
    setShowForm(false);
    setProblem('');
    setDecision('');
    setReasons('');
    setAlternatives('');
    setExpectedOutcome('');
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 28px 64px' }}>
      <SectionHeader 
        eyebrow="Architecture" 
        title="Decision Log"
        action={
          <button 
            onClick={() => setShowForm(!showForm)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'var(--cima-surface-2)', border: '1px solid var(--cima-border)',
              color: 'var(--cima-text-primary)', padding: '6px 12px',
              borderRadius: 'var(--radius-md)', fontSize: 13, cursor: 'pointer'
            }}
          >
            <Plus size={14} /> New
          </button>
        }
      />

      {showForm && (
        <GlassSurface style={{ padding: 'var(--space-5)', marginBottom: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <input
            value={problem}
            onChange={(e) => setProblem(e.target.value)}
            placeholder="Problem Statement"
            className="cima-focusable"
            style={{
              background: 'transparent', border: 'none', borderBottom: '1px solid var(--cima-border)',
              color: 'var(--cima-text-primary)', fontSize: 16, padding: '8px 0', outline: 'none'
            }}
          />
          <textarea
            value={decision}
            onChange={(e) => setDecision(e.target.value)}
            placeholder="Decision"
            className="cima-focusable cima-scroll"
            style={{
              background: 'transparent', border: '1px solid var(--cima-border)', borderRadius: 'var(--radius-sm)',
              color: 'var(--cima-text-primary)', fontSize: 14, padding: '12px', minHeight: 60, outline: 'none', resize: 'vertical'
            }}
          />
          <textarea
            value={reasons}
            onChange={(e) => setReasons(e.target.value)}
            placeholder="Reasons (one per line)"
            className="cima-focusable cima-scroll"
            style={{
              background: 'transparent', border: '1px solid var(--cima-border)', borderRadius: 'var(--radius-sm)',
              color: 'var(--cima-text-primary)', fontSize: 14, padding: '12px', minHeight: 80, outline: 'none', resize: 'vertical'
            }}
          />
          <textarea
            value={alternatives}
            onChange={(e) => setAlternatives(e.target.value)}
            placeholder="Alternatives Considered (one per line, optional)"
            className="cima-focusable cima-scroll"
            style={{
              background: 'transparent', border: '1px solid var(--cima-border)', borderRadius: 'var(--radius-sm)',
              color: 'var(--cima-text-primary)', fontSize: 14, padding: '12px', minHeight: 60, outline: 'none', resize: 'vertical'
            }}
          />
          <input
            value={expectedOutcome}
            onChange={(e) => setExpectedOutcome(e.target.value)}
            placeholder="Expected Outcome"
            className="cima-focusable"
            style={{
              background: 'transparent', border: '1px solid var(--cima-border)', borderRadius: 'var(--radius-sm)',
              color: 'var(--cima-text-primary)', fontSize: 14, padding: '12px', outline: 'none'
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button 
              onClick={handleSave}
              style={{
                background: 'var(--cima-accent-dim)', border: '1px solid var(--cima-accent-line)',
                color: 'var(--cima-accent)', padding: '6px 16px', borderRadius: 'var(--radius-sm)',
                fontSize: 13, cursor: 'pointer'
              }}
            >
              Save
            </button>
          </div>
        </GlassSurface>
      )}

      {state.decisions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 0', color: 'var(--cima-text-tertiary)', fontSize: 14, lineHeight: 1.6 }}>
          No decisions recorded.<br/>Tracking decisions prevents repeating past mistakes and clarifies intent.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {state.decisions.map(dec => (
            <div
              key={dec.id}
              style={{
                border: '1px solid var(--cima-border)',
                borderRadius: 'var(--radius-md)',
                padding: 20,
                background: 'transparent'
              }}
            >
              <div className="cima-mono" style={{ fontSize: 11, color: 'var(--cima-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                {dec.problem}
              </div>
              <div style={{ fontWeight: 600, fontSize: 18, color: 'var(--cima-text-primary)', marginBottom: 16 }}>
                {dec.decision}
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {dec.reasons.length > 0 && (
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--cima-text-secondary)', marginBottom: 6 }}>Reasons</div>
                    <ul style={{ margin: 0, paddingLeft: 20, color: 'var(--cima-text-secondary)', fontSize: 14, lineHeight: 1.6 }}>
                      {dec.reasons.map((r, i) => <li key={i}>{r}</li>)}
                    </ul>
                  </div>
                )}
                {dec.alternatives && dec.alternatives.length > 0 && (
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--cima-text-secondary)', marginBottom: 6 }}>Alternatives</div>
                    <ul style={{ margin: 0, paddingLeft: 20, color: 'var(--cima-text-tertiary)', fontSize: 14, lineHeight: 1.6 }}>
                      {dec.alternatives.map((a, i) => <li key={i}>{a}</li>)}
                    </ul>
                  </div>
                )}
                {dec.expectedOutcome && (
                  <div style={{ 
                    marginTop: 8, padding: 12, background: 'var(--cima-surface-1)', 
                    borderRadius: 'var(--radius-sm)', border: '1px solid var(--cima-border)' 
                  }}>
                    <div style={{ fontSize: 11, color: 'var(--cima-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Expected Outcome</div>
                    <div style={{ fontSize: 14, color: 'var(--cima-text-primary)' }}>{dec.expectedOutcome}</div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
