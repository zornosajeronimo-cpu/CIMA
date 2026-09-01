import React, { useState } from 'react';
import { useApp } from '@/state/AppContext';
import { BusinessSystem, BusinessSystemComponent, BusinessSystemStatus } from '@/models';

const COMPONENT_TYPES = ['whatsapp', 'crm', 'database', 'ai', 'dashboard', 'notification', 'api', 'automation', 'other'] as const;
type CompType = typeof COMPONENT_TYPES[number];

const STATUSES: BusinessSystemStatus[] = ['Concept', 'Design', 'Build', 'Live', 'Paused'];

function getStatusColor(status: BusinessSystemStatus) {
  if (status === 'Live') return 'var(--cima-accent)';
  if (status === 'Design' || status === 'Build') return 'var(--cima-amber)';
  return 'var(--cima-text-secondary)';
}

function getComponentColor(type: CompType) {
  if (type === 'whatsapp' || type === 'ai') return 'var(--cima-accent)';
  if (type === 'automation' || type === 'crm' || type === 'notification') return 'var(--cima-amber)';
  return 'var(--cima-text-secondary)';
}

export function SystemsView() {
  const { state, dispatch } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [clientId, setClientId] = useState('');
  const [status, setStatus] = useState<BusinessSystemStatus>('Concept');
  const [description, setDescription] = useState('');
  const [selectedComps, setSelectedComps] = useState<Set<CompType>>(new Set());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    const components: BusinessSystemComponent[] = Array.from(selectedComps).map(c => ({ name: c, type: c }));

    const sys: BusinessSystem = {
      id: Date.now().toString(),
      name,
      clientId: clientId || undefined,
      status,
      description,
      components,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    dispatch({ type: 'UPSERT_BUSINESS_SYSTEM', payload: sys });
    setShowForm(false);
    setName('');
    setClientId('');
    setStatus('Concept');
    setDescription('');
    setSelectedComps(new Set());
  };

  const toggleComp = (c: CompType) => {
    const next = new Set(selectedComps);
    if (next.has(c)) next.delete(c);
    else next.add(c);
    setSelectedComps(next);
  };

  const systemsByClient = state.businessSystems.reduce((acc, sys) => {
    const cId = sys.clientId || 'unassigned';
    if (!acc[cId]) acc[cId] = [];
    acc[cId].push(sys);
    return acc;
  }, {} as Record<string, BusinessSystem[]>);

  return (
    <div style={{ padding: '32px', height: '100%', overflowY: 'auto' }} className="cima-scroll">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, margin: 0 }}>Business Systems</h1>
        <button 
          onClick={() => setShowForm(!showForm)}
          style={{
            background: 'var(--cima-surface-2)', border: '1px solid var(--cima-border)',
            color: 'var(--cima-text-primary)', padding: '6px 12px', borderRadius: 'var(--radius-sm)',
            cursor: 'pointer'
          }}
        >
          {showForm ? 'Cancel' : 'New System'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="cima-glass-raised cima-fade-in" style={{ padding: 20, borderRadius: 'var(--radius-md)', marginBottom: 32, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: 12, color: 'var(--cima-text-secondary)', marginBottom: 4 }}>System Name</label>
              <input value={name} onChange={e => setName(e.target.value)} required style={{ width: '100%', background: 'var(--cima-surface-1)', border: '1px solid var(--cima-border)', color: '#fff', padding: '8px 12px', borderRadius: 'var(--radius-sm)' }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: 12, color: 'var(--cima-text-secondary)', marginBottom: 4 }}>Client</label>
              <select value={clientId} onChange={e => setClientId(e.target.value)} style={{ width: '100%', background: 'var(--cima-surface-1)', border: '1px solid var(--cima-border)', color: '#fff', padding: '8px 12px', borderRadius: 'var(--radius-sm)' }}>
                <option value="">(Internal / Unassigned)</option>
                {state.clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div style={{ width: 150 }}>
              <label style={{ display: 'block', fontSize: 12, color: 'var(--cima-text-secondary)', marginBottom: 4 }}>Status</label>
              <select value={status} onChange={e => setStatus(e.target.value as BusinessSystemStatus)} style={{ width: '100%', background: 'var(--cima-surface-1)', border: '1px solid var(--cima-border)', color: '#fff', padding: '8px 12px', borderRadius: 'var(--radius-sm)' }}>
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, color: 'var(--cima-text-secondary)', marginBottom: 4 }}>Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} style={{ width: '100%', background: 'var(--cima-surface-1)', border: '1px solid var(--cima-border)', color: '#fff', padding: '8px 12px', borderRadius: 'var(--radius-sm)', minHeight: 60 }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, color: 'var(--cima-text-secondary)', marginBottom: 8 }}>Components</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {COMPONENT_TYPES.map(c => (
                <button
                  key={c} type="button" onClick={() => toggleComp(c)}
                  style={{
                    padding: '4px 10px', borderRadius: 16, fontSize: 12, cursor: 'pointer',
                    background: selectedComps.has(c) ? 'var(--cima-surface-2)' : 'transparent',
                    border: `1px solid ${selectedComps.has(c) ? getComponentColor(c) : 'var(--cima-border)'}`,
                    color: selectedComps.has(c) ? getComponentColor(c) : 'var(--cima-text-secondary)',
                  }}
                >{c}</button>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" style={{ background: 'var(--cima-accent)', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontWeight: 500 }}>
              Save System
            </button>
          </div>
        </form>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
        {Object.entries(systemsByClient).map(([cId, systems]) => {
          const clientName = cId === 'unassigned' ? 'Internal Systems' : (state.clients.find(c => c.id === cId)?.name || 'Unknown Client');
          return (
            <div key={cId}>
              <h2 style={{ fontSize: 14, color: 'var(--cima-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16, borderBottom: '1px solid var(--cima-border)', paddingBottom: 8 }}>
                {clientName}
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
                {systems.map(sys => (
                  <div key={sys.id} className="cima-glass" style={{ padding: 20, borderRadius: 'var(--radius-md)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>{sys.name}</h3>
                      <span style={{ fontSize: 12, padding: '2px 8px', borderRadius: 12, border: `1px solid ${getStatusColor(sys.status)}`, color: getStatusColor(sys.status) }}>
                        {sys.status}
                      </span>
                    </div>
                    {sys.description && <p style={{ fontSize: 13, color: 'var(--cima-text-secondary)', marginBottom: 16, lineHeight: 1.4 }}>{sys.description}</p>}
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 12 }}>
                      {sys.components.map((c, i) => (
                        <span key={i} style={{
                          fontSize: 11, padding: '2px 8px', borderRadius: 10,
                          background: 'var(--cima-surface-1)', border: '1px solid var(--cima-border)',
                          color: getComponentColor(c.type)
                        }}>
                          {c.type}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
