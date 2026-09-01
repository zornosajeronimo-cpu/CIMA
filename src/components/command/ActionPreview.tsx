import { useApp } from '@/state/AppContext';
import { GlassSurface } from '@/components/ui/GlassSurface';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import type { PlannedAction } from '@/models/actionPlan';

const RISK_LABEL: Record<string, string> = {
  read: 'Read',
  write: 'Write',
  destructive: 'Destructive',
  external: 'External',
};

const RISK_COLOR: Record<string, string> = {
  read: 'var(--cima-accent)',
  write: 'var(--cima-amber)',
  destructive: 'var(--cima-red)',
  external: 'var(--cima-red)',
};

function ActionRow({ action, index }: { action: PlannedAction; index: number }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 6,
      padding: '12px 0',
      borderBottom: '1px solid var(--cima-border)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 11, fontFamily: 'IBM Plex Mono, monospace', color: 'var(--cima-text-tertiary)', minWidth: 16 }}>
            {index + 1}.
          </span>
          <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--cima-text-primary)' }}>
            {action.proposal.tool}
          </span>
        </div>
        <span style={{
          fontSize: 10.5, fontFamily: 'IBM Plex Mono, monospace',
          padding: '2px 8px', borderRadius: 999,
          background: `${RISK_COLOR[action.risk]}18`,
          color: RISK_COLOR[action.risk],
          border: `1px solid ${RISK_COLOR[action.risk]}40`,
        }}>
          {RISK_LABEL[action.risk]}
        </span>
      </div>
      <div style={{ fontSize: 12, color: 'var(--cima-text-secondary)', paddingLeft: 24, fontStyle: 'italic' }}>
        {action.proposal.reason}
      </div>
      {Object.keys(action.proposal.parameters).length > 0 && (
        <div style={{ paddingLeft: 24, display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 2 }}>
          {Object.entries(action.proposal.parameters)
            .filter(([, v]) => v !== undefined && v !== '')
            .map(([k, v]) => (
              <span key={k} style={{
                fontSize: 11, fontFamily: 'IBM Plex Mono, monospace',
                padding: '2px 8px', borderRadius: 4,
                background: 'var(--cima-surface-2)', color: 'var(--cima-text-secondary)',
                border: '1px solid var(--cima-border)',
              }}>
                {k}: <strong style={{ color: 'var(--cima-text-primary)' }}>{String(v)}</strong>
              </span>
            ))}
        </div>
      )}
    </div>
  );
}

export function ActionPreview() {
  const { state, confirmPlan, cancelPlan } = useApp();
  const plan = state.pendingConfirmation;

  if (!plan) return null;

  const writeActions = plan.actions.filter(a => a.risk === 'write').length;
  const destructiveActions = plan.actions.filter(a => a.risk === 'destructive').length;

  return (
    <div className="cima-fade-in" style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(10,14,12,0.85)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
      backdropFilter: 'blur(4px)',
    }}>
      <GlassSurface style={{ maxWidth: 540, width: '100%', padding: '28px 28px 24px' }}>

        {/* Header */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 10, fontFamily: 'IBM Plex Mono, monospace', color: 'var(--cima-text-tertiary)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
            CIMA wants to execute
          </div>
          <h2 style={{ fontSize: 17, fontWeight: 600, margin: 0, letterSpacing: '-0.015em' }}>
            {plan.aiMessage}
          </h2>
          {plan.intent.confidence > 0 && (
            <div style={{ fontSize: 11.5, color: 'var(--cima-text-tertiary)', marginTop: 6 }}>
              Intent: <span style={{ color: 'var(--cima-text-secondary)', fontFamily: 'IBM Plex Mono, monospace' }}>{plan.intent.type}</span>
              {' '}· Confidence: <span style={{ color: 'var(--cima-text-secondary)' }}>{Math.round(plan.intent.confidence * 100)}%</span>
            </div>
          )}
        </div>

        {/* Risk warning */}
        {(destructiveActions > 0) && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderRadius: 'var(--radius-sm)',
            background: 'rgba(185,96,96,0.1)', border: '1px solid rgba(185,96,96,0.3)', marginBottom: 16,
          }}>
            <AlertTriangle size={14} color="var(--cima-red)" />
            <span style={{ fontSize: 12.5, color: 'var(--cima-red)' }}>
              This plan includes a destructive action. Review carefully before confirming.
            </span>
          </div>
        )}

        {/* Actions */}
        <div style={{ marginBottom: 4 }}>
          <div style={{ fontSize: 11, fontFamily: 'IBM Plex Mono, monospace', color: 'var(--cima-text-tertiary)', letterSpacing: '0.05em', marginBottom: 4 }}>
            {plan.actions.length} ACTION{plan.actions.length !== 1 ? 'S' : ''} · {writeActions} write{writeActions !== 1 ? 's' : ''}
          </div>
          {plan.actions.map((action, i) => (
            <ActionRow key={action.id} action={action} index={i} />
          ))}
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <button
            onClick={confirmPlan}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
              padding: '10px 16px', borderRadius: 'var(--radius-sm)',
              background: 'var(--cima-accent-dim)', border: '1px solid var(--cima-accent-line)',
              color: 'var(--cima-accent)', fontSize: 13, fontWeight: 600, cursor: 'pointer',
              transition: 'background 160ms var(--ease-quiet)',
            }}
          >
            <CheckCircle size={15} /> Confirm
          </button>
          <button
            onClick={cancelPlan}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
              padding: '10px 16px', borderRadius: 'var(--radius-sm)',
              background: 'transparent', border: '1px solid var(--cima-border-strong)',
              color: 'var(--cima-text-secondary)', fontSize: 13, cursor: 'pointer',
              transition: 'all 160ms var(--ease-quiet)',
            }}
          >
            <XCircle size={15} /> Cancel
          </button>
        </div>
      </GlassSurface>
    </div>
  );
}
