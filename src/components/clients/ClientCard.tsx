import type { Client } from '@/models';
import { useApp } from '@/state/AppContext';
import { StatusIndicator } from '@/components/ui/StatusIndicator';
import { STATUS_META } from '@/lib/nav';

interface ClientCardProps {
  client: Client;
}

export function ClientCard({ client }: ClientCardProps) {
  const { selectClient } = useApp();
  const statusColor = STATUS_META[client.status]?.color ?? 'var(--cima-text-tertiary)';

  return (
    <button
      className="cima-focusable"
      onClick={() => selectClient(client.id)}
      aria-label={`View ${client.name}`}
      style={{
        padding: '13px 15px',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--cima-border)',
        background: 'transparent',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        cursor: 'pointer',
        transition: 'border-color 180ms var(--ease-quiet), background 180ms var(--ease-quiet)',
        width: '100%',
        textAlign: 'left',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--cima-border-strong)';
        e.currentTarget.style.background = 'rgba(255,255,255,0.015)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--cima-border)';
        e.currentTarget.style.background = 'transparent';
      }}
    >
      {/* Name + status row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <span style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--cima-text-primary)' }}>
          {client.name}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
          <StatusIndicator color={statusColor} />
          <span className="cima-mono" style={{ fontSize: 10, color: 'var(--cima-text-tertiary)' }}>
            {client.status}
          </span>
        </span>
      </div>

      {/* Stage pill */}
      <div>
        <span
          style={{
            fontSize: 10.5,
            color: 'var(--cima-text-secondary)',
            background: 'var(--cima-surface-2)',
            border: '1px solid var(--cima-border)',
            padding: '2px 8px',
            borderRadius: 999,
          }}
        >
          {client.stage}
        </span>
      </div>

      {/* Next action */}
      <p style={{ fontSize: 11.5, color: 'var(--cima-text-tertiary)', margin: 0, lineHeight: 1.4 }}>
        {client.nextAction}
      </p>
    </button>
  );
}
