import { useApp } from '@/state/AppContext';
import type { CommandState } from '@/state/reducer';
import { GlassSurface } from '@/components/ui/GlassSurface';
import { brain } from '@/core/brain/brain';

const PIPELINE_STEPS: { key: CommandState | 'idle'; label: string; detail?: string }[] = [
  { key: 'thinking',             label: 'Understanding',  detail: 'Analyzing intent' },
  { key: 'planning',             label: 'Building plan',  detail: 'Selecting tools' },
  { key: 'awaiting_confirmation', label: 'Waiting',       detail: 'Your approval needed' },
  { key: 'executing',            label: 'Executing',      detail: 'Running tools' },
  { key: 'completed',            label: 'Completed',      detail: 'State updated' },
  { key: 'failed',               label: 'Failed',         detail: 'See error below' },
];

const STATE_ORDER: CommandState[] = [
  'idle', 'thinking', 'planning', 'awaiting_confirmation', 'executing', 'completed', 'failed'
];

function stepStatus(step: CommandState | 'idle', currentState: CommandState): 'done' | 'active' | 'pending' {
  if (currentState === 'idle' || currentState === 'completed' || currentState === 'failed') return 'pending';
  const stepIdx = STATE_ORDER.indexOf(step as CommandState);
  const currentIdx = STATE_ORDER.indexOf(currentState);
  if (stepIdx < currentIdx) return 'done';
  if (stepIdx === currentIdx) return 'active';
  return 'pending';
}

export function ExecutionTrace() {
  const { state } = useApp();
  const { commandState, lastCompletedPlan } = state;

  const isVisible = commandState !== 'idle' || lastCompletedPlan !== null;
  if (!isVisible) return null;

  return (
    <div className="cima-fade-in" style={{ marginTop: 16 }}>
      <GlassSurface radius="md" style={{ padding: '16px 20px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontFamily: 'IBM Plex Mono, monospace', color: 'var(--cima-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Execution Trace · {brain.getProviderId()}
          </div>
          {commandState !== 'idle' && (
            <span style={{
              fontSize: 10.5, fontFamily: 'IBM Plex Mono, monospace',
              padding: '2px 8px', borderRadius: 999,
              background: commandState === 'completed' ? 'var(--cima-accent-dim)' : commandState === 'failed' ? 'rgba(185,96,96,0.12)' : 'rgba(185,146,91,0.12)',
              color: commandState === 'completed' ? 'var(--cima-accent)' : commandState === 'failed' ? 'var(--cima-red)' : 'var(--cima-amber)',
              border: `1px solid ${commandState === 'completed' ? 'var(--cima-accent-line)' : commandState === 'failed' ? 'rgba(185,96,96,0.3)' : 'rgba(185,146,91,0.3)'}`,
            }}>
              {commandState}
            </span>
          )}
        </div>

        {/* Pipeline steps */}
        {commandState !== 'idle' && (
          <div style={{ display: 'flex', gap: 0, alignItems: 'center', marginBottom: lastCompletedPlan ? 16 : 0, flexWrap: 'wrap', rowGap: 8 }}>
            {PIPELINE_STEPS.filter(s => s.key !== 'failed' || commandState === 'failed').map((step, i, arr) => {
              const status = commandState === 'completed'
                ? (step.key === 'completed' ? 'active' : step.key === 'failed' ? 'pending' : 'done')
                : commandState === 'failed'
                ? (step.key === 'failed' ? 'active' : 'done')
                : stepStatus(step.key as CommandState, commandState);

              return (
                <div key={step.key} style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                  <div style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '2px 6px',
                    minWidth: 72,
                  }}>
                    <div style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: status === 'active'
                        ? (commandState === 'failed' ? 'var(--cima-red)' : 'var(--cima-accent)')
                        : status === 'done'
                        ? 'var(--cima-accent)'
                        : 'var(--cima-surface-2)',
                      border: `1px solid ${status === 'pending' ? 'var(--cima-border)' : 'transparent'}`,
                      boxShadow: status === 'active' ? `0 0 6px ${commandState === 'failed' ? 'var(--cima-red)' : 'var(--cima-accent)'}` : 'none',
                      transition: 'all 300ms var(--ease-quiet)',
                    }} />
                    <div style={{
                      fontSize: 10, fontFamily: 'IBM Plex Mono, monospace', textAlign: 'center',
                      color: status === 'active'
                        ? 'var(--cima-text-primary)'
                        : status === 'done'
                        ? 'var(--cima-accent)'
                        : 'var(--cima-text-tertiary)',
                    }}>
                      {step.label}
                    </div>
                  </div>
                  {i < arr.length - 1 && (
                    <div style={{ width: 16, height: 1, background: 'var(--cima-border)', flexShrink: 0 }} />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Last plan summary */}
        {lastCompletedPlan && (
          <div style={{ borderTop: '1px solid var(--cima-border)', paddingTop: 12 }}>
            <div style={{ fontSize: 12, color: 'var(--cima-text-secondary)', marginBottom: 8 }}>
              {lastCompletedPlan.aiMessage}
            </div>
            {lastCompletedPlan.analysis && (
              <div style={{ fontSize: 12.5, color: 'var(--cima-text-secondary)', lineHeight: 1.6, marginBottom: 8, borderLeft: '2px solid var(--cima-accent-line)', paddingLeft: 10 }}>
                {lastCompletedPlan.analysis}
              </div>
            )}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {lastCompletedPlan.actions.map(a => (
                <div key={a.id} style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  fontSize: 11, fontFamily: 'IBM Plex Mono, monospace',
                  padding: '3px 8px', borderRadius: 4,
                  background: a.status === 'completed' ? 'var(--cima-accent-dim)' : 'rgba(185,96,96,0.1)',
                  color: a.status === 'completed' ? 'var(--cima-accent)' : 'var(--cima-red)',
                  border: `1px solid ${a.status === 'completed' ? 'var(--cima-accent-line)' : 'rgba(185,96,96,0.3)'}`,
                }}>
                  <span style={{ fontSize: 9 }}>{a.status === 'completed' ? '✓' : '✗'}</span>
                  {a.proposal.tool}
                  {a.status !== 'completed' && a.error && (
                    <span style={{ fontSize: 10, opacity: 0.8 }}>({a.error.slice(0, 30)})</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </GlassSurface>
    </div>
  );
}
