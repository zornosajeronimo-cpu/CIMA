import { SYSTEM_STATUS, STATUS_META } from '@/lib/nav';
import { StatusIndicator } from '@/components/ui/StatusIndicator';

export function SystemStatus() {
  return (
    <div
      className="cima-glass"
      style={{
        borderRadius: 'var(--radius-md)',
        padding: '11px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 14,
      }}
    >
      <span className="cima-mono" style={{ fontSize: 10, color: 'var(--cima-text-tertiary)', letterSpacing: '0.04em' }}>
        System status
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
        {SYSTEM_STATUS.map((s) => (
          <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <StatusIndicator
              color={STATUS_META[s.status]?.color ?? 'var(--cima-text-tertiary)'}
              pulse={s.status === 'operational'}
            />
            <span style={{ fontSize: 12, color: 'var(--cima-text-secondary)' }}>{s.name}</span>
            <span className="cima-mono" style={{ fontSize: 10, color: 'var(--cima-text-tertiary)' }}>
              {STATUS_META[s.status]?.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
