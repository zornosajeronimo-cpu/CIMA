import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useApp } from '@/state/AppContext';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { GlassSurface } from '@/components/ui/GlassSurface';
import type { Experiment, ExperimentStatus } from '@/models';

export function ExperimentsView() {
  const { state, dispatch } = useApp();
  const [showForm, setShowForm] = useState(false);

  const [hypothesis, setHypothesis] = useState('');
  const [objective, setObjective] = useState('');
  const [method, setMethod] = useState('');
  const [status, setStatus] = useState<ExperimentStatus>('planned');

  const handleSave = () => {
    if (!hypothesis.trim() || !objective.trim()) return;

    const newExperiment: Experiment = {
      id: `e-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      hypothesis,
      objective,
      method,
      status,
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    dispatch({ type: 'UPSERT_EXPERIMENT', payload: newExperiment });
    setShowForm(false);
    setHypothesis('');
    setObjective('');
    setMethod('');
    setStatus('planned');
  };

  const handleStatusChange = (experiment: Experiment, newStatus: ExperimentStatus) => {
    dispatch({ type: 'UPSERT_EXPERIMENT', payload: { ...experiment, status: newStatus, updatedAt: new Date().toISOString() } });
  };

  const getBadgeColor = (stat: string) => {
    switch (stat) {
      case 'completed': return { bg: 'var(--cima-accent-dim)', color: 'var(--cima-accent)', border: 'var(--cima-accent-line)' };
      case 'running': return { bg: 'rgba(185, 146, 91, 0.14)', color: 'var(--cima-amber)', border: 'rgba(185, 146, 91, 0.35)' };
      case 'failed': return { bg: 'rgba(185, 96, 96, 0.14)', color: 'var(--cima-red)', border: 'rgba(185, 96, 96, 0.35)' };
      default: return { bg: 'var(--cima-surface-2)', color: 'var(--cima-text-secondary)', border: 'var(--cima-border-strong)' };
    }
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 28px 64px' }}>
      <SectionHeader 
        eyebrow="R&D" 
        title="Experiments Tracker"
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
            value={hypothesis}
            onChange={(e) => setHypothesis(e.target.value)}
            placeholder="Hypothesis"
            className="cima-focusable"
            style={{
              background: 'transparent', border: 'none', borderBottom: '1px solid var(--cima-border)',
              color: 'var(--cima-text-primary)', fontSize: 16, padding: '8px 0', outline: 'none'
            }}
          />
          <textarea
            value={objective}
            onChange={(e) => setObjective(e.target.value)}
            placeholder="Objective"
            className="cima-focusable cima-scroll"
            style={{
              background: 'transparent', border: '1px solid var(--cima-border)', borderRadius: 'var(--radius-sm)',
              color: 'var(--cima-text-primary)', fontSize: 14, padding: '12px', minHeight: 60, outline: 'none', resize: 'vertical'
            }}
          />
          <textarea
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            placeholder="Methodology"
            className="cima-focusable cima-scroll"
            style={{
              background: 'transparent', border: '1px solid var(--cima-border)', borderRadius: 'var(--radius-sm)',
              color: 'var(--cima-text-primary)', fontSize: 14, padding: '12px', minHeight: 80, outline: 'none', resize: 'vertical'
            }}
          />
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ExperimentStatus)}
              className="cima-focusable"
              style={{
                background: 'var(--cima-bg)', border: '1px solid var(--cima-border)', borderRadius: 'var(--radius-sm)',
                color: 'var(--cima-text-primary)', fontSize: 13, padding: '6px 12px', outline: 'none'
              }}
            >
              <option value="planned">Planned</option>
              <option value="running">Running</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>
            <div style={{ flex: 1 }} />
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

      {state.experiments.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 0', color: 'var(--cima-text-tertiary)', fontSize: 14 }}>
          No experiments recorded.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {state.experiments.map(exp => {
            const badge = getBadgeColor(exp.status);
            return (
              <div
                key={exp.id}
                style={{
                  border: '1px solid var(--cima-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: 20,
                  background: 'transparent'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div style={{ fontWeight: 600, fontSize: 16, color: 'var(--cima-text-primary)' }}>
                    {exp.hypothesis}
                  </div>
                  <div>
                    <select
                      value={exp.status}
                      onChange={(e) => handleStatusChange(exp, e.target.value as ExperimentStatus)}
                      style={{
                        background: badge.bg, color: badge.color, border: `1px solid ${badge.border}`,
                        borderRadius: 999, fontSize: 10.5, fontFamily: 'IBM Plex Mono,monospace',
                        padding: '2px 9px', outline: 'none', cursor: 'pointer', appearance: 'none', WebkitAppearance: 'none'
                      }}
                    >
                      <option value="planned">planned</option>
                      <option value="running">running</option>
                      <option value="completed">completed</option>
                      <option value="failed">failed</option>
                    </select>
                  </div>
                </div>

                <div style={{ fontSize: 14, color: 'var(--cima-text-secondary)', lineHeight: 1.5, marginBottom: 12 }}>
                  <span style={{ color: 'var(--cima-text-tertiary)', marginRight: 6 }}>Objective:</span>
                  {exp.objective}
                </div>

                {exp.method && (
                  <div style={{ fontSize: 13, color: 'var(--cima-text-secondary)', background: 'var(--cima-surface-1)', padding: 12, borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ fontSize: 11, color: 'var(--cima-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Methodology</div>
                    <div style={{ whiteSpace: 'pre-wrap' }}>{exp.method}</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
