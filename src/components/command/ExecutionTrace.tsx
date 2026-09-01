import { useApp } from '@/state/AppContext';
import type { CommandState } from '@/state/reducer';
import { GlassSurface } from '@/components/ui/GlassSurface';
import { brain } from '@/core/brain/brain';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

const PIPELINE_STEPS: { key: CommandState | 'idle'; label: string; detail?: string }[] = [
  { key: 'thinking',             label: 'Entendiendo',    detail: 'Analizando intención' },
  { key: 'planning',             label: 'Planificando',   detail: 'Seleccionando herramientas' },
  { key: 'awaiting_confirmation', label: 'Esperando',      detail: 'Requiere tu aprobación' },
  { key: 'executing',            label: 'Ejecutando',     detail: 'Corriendo herramientas' },
  { key: 'completed',            label: 'Completado',     detail: 'Estado actualizado' },
  { key: 'failed',               label: 'Fallido',        detail: 'Ver error abajo' },
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

  const StatusIcon = commandState === 'completed' ? CheckCircle2 : commandState === 'failed' ? XCircle : Loader2;

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
              display: 'flex', alignItems: 'center', gap: 5,
              fontSize: 10.5, fontFamily: 'IBM Plex Mono, monospace',
              padding: '2px 9px', borderRadius: 999,
              color: 'var(--cima-text-primary)',
              border: '1px solid var(--cima-border-strong)',
            }}>
              <StatusIcon size={11} className={commandState !== 'completed' && commandState !== 'failed' ? 'cima-spin' : undefined} />
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
                      background: status === 'active' || status === 'done'
                        ? 'var(--cima-text-primary)'
                        : 'var(--cima-surface-2)',
                      border: `1px solid ${status === 'pending' ? 'var(--cima-border)' : 'transparent'}`,
                      boxShadow: status === 'active' ? '0 0 6px rgba(255,255,255,0.5)' : 'none',
                      transition: 'all 300ms var(--ease-quiet)',
                    }} />
                    <div style={{
                      fontSize: 10, fontFamily: 'IBM Plex Mono, monospace', textAlign: 'center',
                      color: status === 'active'
                        ? 'var(--cima-text-primary)'
                        : status === 'done'
                        ? 'var(--cima-text-secondary)'
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
              <div style={{ fontSize: 12.5, color: 'var(--cima-text-secondary)', lineHeight: 1.6, marginBottom: 8, borderLeft: '2px solid var(--cima-border-strong)', paddingLeft: 10 }}>
                {lastCompletedPlan.analysis}
              </div>
            )}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {lastCompletedPlan.actions.map(a => (
                <div key={a.id} style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  fontSize: 11, fontFamily: 'IBM Plex Mono, monospace',
                  padding: '3px 8px', borderRadius: 4,
                  color: a.status === 'completed' ? 'var(--cima-text-primary)' : 'var(--cima-text-tertiary)',
                  border: `1px ${a.status === 'completed' ? 'solid' : 'dashed'} var(--cima-border-strong)`,
                }}>
                  {a.status === 'completed' ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
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
