import { ArrowLeft } from 'lucide-react';
import type { Client } from '@/models';
import { useApp } from '@/state/AppContext';
import { GlassSurface } from '@/components/ui/GlassSurface';
import { StatusIndicator } from '@/components/ui/StatusIndicator';
import { STATUS_META } from '@/lib/nav';

interface ClientViewProps {
  client: Client;
}

function StructuralTab({ label }: { label: string }) {
  return (
    <div
      style={{
        padding: 'var(--space-5)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--cima-border)',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      <div
        className="cima-mono"
        style={{ fontSize: 10, color: 'var(--cima-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}
      >
        {label} — Structural
      </div>
      <p style={{ fontSize: 13, color: 'var(--cima-text-tertiary)', margin: 0, lineHeight: 1.5 }}>
        This section will be designed in a future step.
      </p>
    </div>
  );
}

export function ClientView({ client }: ClientViewProps) {
  const { selectClient } = useApp();
  const statusColor = STATUS_META[client.status]?.color ?? 'var(--cima-text-tertiary)';

  return (
    <div
      className="cima-fade-in cima-scroll"
      style={{ maxWidth: 760, margin: '0 auto', padding: '40px 28px 64px' }}
    >
      {/* Back */}
      <button
        className="cima-focusable"
        onClick={() => selectClient(null)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          background: 'transparent',
          border: 'none',
          color: 'var(--cima-text-tertiary)',
          fontSize: 12,
          cursor: 'pointer',
          padding: '4px 0',
          marginBottom: 28,
          transition: 'color 160ms var(--ease-quiet)',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--cima-text-secondary)')}
        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--cima-text-tertiary)')}
        aria-label="Back to overview"
      >
        <ArrowLeft size={13} strokeWidth={1.75} />
        Back to Overview
      </button>

      {/* Client header */}
      <GlassSurface raised style={{ padding: 'var(--space-6)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <div
              className="cima-mono"
              style={{ fontSize: 10, color: 'var(--cima-text-tertiary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}
            >
              Client
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em', margin: '0 0 8px' }}>
              {client.name}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span
                style={{
                  fontSize: 11,
                  color: 'var(--cima-text-secondary)',
                  background: 'var(--cima-surface-2)',
                  border: '1px solid var(--cima-border)',
                  padding: '2px 10px',
                  borderRadius: 999,
                }}
              >
                {client.stage}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <StatusIndicator color={statusColor} />
                <span style={{ fontSize: 12, color: 'var(--cima-text-secondary)' }}>{client.status}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Next action */}
        <div
          style={{
            marginTop: 'var(--space-5)',
            paddingTop: 'var(--space-4)',
            borderTop: '1px solid var(--cima-border)',
          }}
        >
          <div
            className="cima-mono"
            style={{ fontSize: 10, color: 'var(--cima-text-tertiary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}
          >
            Next action
          </div>
          <p style={{ fontSize: 14, color: 'var(--cima-text-secondary)', margin: 0, lineHeight: 1.5 }}>
            {client.nextAction}
          </p>
        </div>
      </GlassSurface>

      {/* Structural tabs */}
      <div
        style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 16 }}
      >
        <StructuralTab label="Projects" />
        <StructuralTab label="Tasks" />
        <StructuralTab label="Activity" />
        <StructuralTab label="Notes" />
      </div>
    </div>
  );
}
