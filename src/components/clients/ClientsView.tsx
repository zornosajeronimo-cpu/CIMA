import { useState, useMemo } from 'react';
import { useApp } from '@/state/AppContext';
import { GlassSurface } from '@/components/ui/GlassSurface';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { StatStrip } from '@/components/ui/StatTile';
import { Search, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import type { Client } from '@/models';

const STATUS_ICON: Record<string, typeof CheckCircle2> = {
  'On track': CheckCircle2,
  'Needs input': Clock,
  Blocked: AlertTriangle,
};

function countByStatus(clients: Client[], status: string) {
  return clients.filter((c) => c.status === status).length;
}

export function ClientsView() {
  const { state, selectClient } = useApp();
  const [query, setQuery] = useState('');
  const [detailId, setDetailId] = useState<string | null>(state.clients[0]?.id ?? null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return state.clients;
    return state.clients.filter((c) => c.name.toLowerCase().includes(q));
  }, [state.clients, query]);

  const detail = state.clients.find((c) => c.id === detailId) ?? null;

  const handleSelect = (c: Client) => {
    setDetailId(c.id);
    selectClient(c.id);
  };

  return (
    <div className="cima-fade-in" style={{ maxWidth: 1180, margin: '0 auto', padding: '8px 28px 60px' }}>
      <StatStrip
        items={[
          { label: 'Total clients', value: state.clients.length },
          { label: 'On track', value: countByStatus(state.clients, 'On track') },
          { label: 'Needs input', value: countByStatus(state.clients, 'Needs input') },
          { label: 'Blocked', value: countByStatus(state.clients, 'Blocked') },
        ]}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.15fr', gap: 14, alignItems: 'start' }}>
        {/* Dense, filterable list — the primary pattern, not a card grid */}
        <GlassSurface style={{ padding: 16 }}>
          <SectionHeader eyebrow="Clients" title="Active engagements" />
          <div
            style={{
              display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12,
              padding: '7px 10px', border: '1px solid var(--cima-border)', borderRadius: 'var(--radius-sm)',
            }}
          >
            <Search size={13} color="var(--cima-text-tertiary)" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar cliente..."
              className="cima-focusable"
              style={{
                flex: 1, background: 'transparent', border: 'none', outline: 'none',
                color: 'var(--cima-text-primary)', fontSize: 13, fontFamily: 'inherit',
              }}
            />
          </div>

          <div
            className="cima-scroll"
            style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 540, overflowY: 'auto' }}
          >
            {filtered.length === 0 && (
              <p style={{ fontSize: 12, color: 'var(--cima-text-tertiary)', padding: '8px 4px' }}>
                Sin resultados para "{query}".
              </p>
            )}
            {filtered.map((c) => {
              const Icon = STATUS_ICON[c.status] ?? Clock;
              const isSelected = c.id === detailId;
              return (
                <button
                  key={c.id}
                  className="cima-focusable"
                  onClick={() => handleSelect(c)}
                  aria-current={isSelected ? 'true' : undefined}
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10,
                    padding: '10px 12px', borderRadius: 'var(--radius-sm)',
                    border: `1px solid ${isSelected ? 'var(--cima-border-strong)' : 'var(--cima-border)'}`,
                    background: isSelected ? 'var(--cima-surface-2)' : 'transparent',
                    cursor: 'pointer', textAlign: 'left', width: '100%', fontFamily: 'inherit',
                    transition: 'border-color 140ms var(--ease-quiet), background 140ms var(--ease-quiet)',
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0 }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--cima-text-primary)' }}>
                      {c.name}
                    </span>
                    <span
                      style={{
                        fontSize: 11.5, color: 'var(--cima-text-tertiary)',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      }}
                    >
                      {c.nextAction}
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                    <span className="cima-badge cima-badge-neutral">{c.stage}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10.5, color: 'var(--cima-text-tertiary)' }}>
                      <Icon size={11} /> {c.status}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </GlassSurface>

        {/* Detail panel */}
        <GlassSurface style={{ padding: 20, minHeight: 300 }}>
          {!detail ? (
            <div className="cima-empty-state">
              <div className="cima-empty-eyebrow">Clients</div>
              <p className="cima-empty-title">Selecciona un cliente</p>
              <p className="cima-empty-body">Elige un cliente de la lista para ver su detalle aquí.</p>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
                <div>
                  <h2 className="cima-display" style={{ fontSize: 19, margin: 0 }}>{detail.name}</h2>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 6, fontSize: 11.5, color: 'var(--cima-text-secondary)' }}>
                    {(() => {
                      const Icon = STATUS_ICON[detail.status] ?? Clock;
                      return <Icon size={12} />;
                    })()}
                    {detail.status}
                  </span>
                </div>
                <span className="cima-badge cima-badge-neutral">{detail.stage}</span>
              </div>

              <div className="cima-form-row">
                <span className="cima-form-label">Next action</span>
                <p style={{ fontSize: 13.5, color: 'var(--cima-text-secondary)', margin: 0, lineHeight: 1.6 }}>
                  {detail.nextAction}
                </p>
              </div>
            </>
          )}
        </GlassSurface>
      </div>
    </div>
  );
}
