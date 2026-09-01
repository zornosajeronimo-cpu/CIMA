import { useApp } from '@/state/AppContext';
import { GlassSurface } from '@/components/ui/GlassSurface';
import { CheckCircle, XCircle, AlertTriangle, Eye, Pencil, Globe } from 'lucide-react';
import type { PlannedAction } from '@/models/actionPlan';

// Risk is no longer color-coded (the palette is strictly grayscale).
// Each level gets its own icon and its own tone step instead, so the
// meaning survives without hue.
const RISK_LABEL: Record<string, string> = {
  read: 'Lectura',
  write: 'Escritura',
  destructive: 'Destructivo',
  external: 'Externo',
};

const RISK_ICON: Record<string, typeof Eye> = {
  read: Eye,
  write: Pencil,
  destructive: AlertTriangle,
  external: Globe,
};

// Tone step only — darkest/dimmest = lowest attention, brightest = highest.
// Destructive additionally gets a dashed border, not just a shade.
const RISK_STYLE: Record<string, { color: string; border: string; dashed?: boolean }> = {
  read:        { color: 'var(--cima-text-tertiary)',  border: 'var(--cima-border)' },
  write:       { color: 'var(--cima-text-secondary)', border: 'var(--cima-border-strong)' },
  external:    { color: 'var(--cima-text-secondary)', border: 'var(--cima-border-strong)' },
  destructive: { color: 'var(--cima-text-primary)',    border: 'var(--cima-border-strong)', dashed: true },
};

function ActionRow({ action, index }: { action: PlannedAction; index: number }) {
  const Icon = RISK_ICON[action.risk] ?? Eye;
  const style = RISK_STYLE[action.risk] ?? RISK_STYLE.read;

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
          display: 'flex', alignItems: 'center', gap: 5,
          fontSize: 10.5, fontFamily: 'IBM Plex Mono, monospace',
          padding: '2px 9px', borderRadius: 999,
          color: style.color,
          border: `1px ${style.dashed ? 'dashed' : 'solid'} ${style.border}`,
        }}>
          <Icon size={11} strokeWidth={2} />
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
      background: 'rgba(0,0,0,0.82)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
      backdropFilter: 'blur(6px)',
    }}>
      <GlassSurface hero radius="lg" style={{ maxWidth: 540, width: '100%', padding: '28px 28px 24px' }}>

        {/* Header */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 10, fontFamily: 'IBM Plex Mono, monospace', color: 'var(--cima-text-tertiary)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
            CIMA desea ejecutar
          </div>
          <h2 className="cima-display" style={{ fontSize: 18, margin: 0 }}>
            {plan.aiMessage}
          </h2>
          {plan.intent.confidence > 0 && (
            <div style={{ fontSize: 11.5, color: 'var(--cima-text-tertiary)', marginTop: 6 }}>
              Intención: <span style={{ color: 'var(--cima-text-secondary)', fontFamily: 'IBM Plex Mono, monospace' }}>{plan.intent.type}</span>
              {' '}· Confianza: <span style={{ color: 'var(--cima-text-secondary)' }}>{Math.round(plan.intent.confidence * 100)}%</span>
            </div>
          )}
        </div>

        {/* Risk warning — dashed border + icon carries the alert, not color */}
        {(destructiveActions > 0) && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderRadius: 'var(--radius-sm)',
            background: 'rgba(255,255,255,0.04)', border: '1px dashed var(--cima-border-strong)', marginBottom: 16,
          }}>
            <AlertTriangle size={14} color="var(--cima-text-primary)" />
            <span style={{ fontSize: 12.5, color: 'var(--cima-text-primary)' }}>
              Este plan incluye una acción destructiva. Revisa cuidadosamente antes de confirmar.
            </span>
          </div>
        )}

        {/* Actions */}
        <div style={{ marginBottom: 4 }}>
          <div style={{ fontSize: 11, fontFamily: 'IBM Plex Mono, monospace', color: 'var(--cima-text-tertiary)', letterSpacing: '0.05em', marginBottom: 4 }}>
            {plan.actions.length} ACCI{plan.actions.length !== 1 ? 'ONES' : 'ÓN'} · {writeActions} escritura{writeActions !== 1 ? 's' : ''}
          </div>
          {plan.actions.map((action, i) => (
            <ActionRow key={action.id} action={action} index={i} />
          ))}
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <button
            onClick={confirmPlan}
            className="cima-focusable"
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
              padding: '10px 16px', borderRadius: 'var(--radius-sm)',
              background: 'var(--cima-accent-dim)', border: '1px solid var(--cima-accent-line)',
              color: 'var(--cima-text-primary)', fontSize: 13, fontWeight: 600, cursor: 'pointer',
              transition: 'background 160ms var(--ease-quiet)',
            }}
          >
            <CheckCircle size={15} /> Confirmar
          </button>
          <button
            onClick={cancelPlan}
            className="cima-focusable"
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
              padding: '10px 16px', borderRadius: 'var(--radius-sm)',
              background: 'transparent', border: '1px solid var(--cima-border-strong)',
              color: 'var(--cima-text-secondary)', fontSize: 13, cursor: 'pointer',
              transition: 'all 160ms var(--ease-quiet)',
            }}
          >
            <XCircle size={15} /> Cancelar
          </button>
        </div>
      </GlassSurface>
    </div>
  );
}
