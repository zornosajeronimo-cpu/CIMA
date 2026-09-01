import React, { useState, useMemo } from 'react';
import { useApp } from '@/state/AppContext';
import { Client, ClientStage, ClientStatus } from '@/models';

const STAGES: ClientStage[] = ['Discovery', 'Solution Design', 'Build', 'Live'];
const STATUSES: ClientStatus[] = ['On track', 'Needs input', 'Blocked'];

function getStatusColor(status: ClientStatus) {
  if (status === 'On track') return 'var(--cima-accent)';
  if (status === 'Needs input') return 'var(--cima-amber)';
  return 'var(--cima-red)';
}

export function ClientsView() {
  const { state, dispatch, selectClient } = useApp();
  const [showForm, setShowForm] = useState(false);
  
  // Create form state
  const [name, setName] = useState('');
  const [stage, setStage] = useState<ClientStage>('Discovery');
  const [status, setStatus] = useState<ClientStatus>('On track');
  const [nextAction, setNextAction] = useState('');

  // Edit form state
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editStage, setEditStage] = useState<ClientStage>('Discovery');
  const [editStatus, setEditStatus] = useState<ClientStatus>('On track');
  const [editNextAction, setEditNextAction] = useState('');

  const selectedClient = state.clients.find(c => c.id === state.selectedClientId);

  // Setup edit state when selected client changes or edit mode toggles
  React.useEffect(() => {
    if (selectedClient) {
      setEditName(selectedClient.name);
      setEditStage(selectedClient.stage);
      setEditStatus(selectedClient.status);
      setEditNextAction(selectedClient.nextAction);
    }
  }, [selectedClient, isEditing]);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !nextAction) return;
    
    const newClient: Client = {
      id: Date.now().toString(),
      name,
      stage,
      status,
      nextAction,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    dispatch({ type: 'UPSERT_CLIENT', payload: newClient });
    setShowForm(false);
    setName('');
    setStage('Discovery');
    setStatus('On track');
    setNextAction('');
    selectClient(newClient.id);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient || !editName || !editNextAction) return;

    const updatedClient: Client = {
      ...selectedClient,
      name: editName,
      stage: editStage,
      status: editStatus,
      nextAction: editNextAction,
      updatedAt: new Date().toISOString()
    };

    dispatch({ type: 'UPSERT_CLIENT', payload: updatedClient });
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (selectedClient && window.confirm('Are you sure you want to delete this client?')) {
      dispatch({ type: 'DELETE_CLIENT', payload: selectedClient.id });
      selectClient(null);
    }
  };

  // Linked items
  const linkedOpps = useMemo(() => {
    if (!selectedClient) return [];
    return state.opportunities.filter(o => o.clientId === selectedClient.id || o.company.toLowerCase() === selectedClient.name.toLowerCase());
  }, [state.opportunities, selectedClient]);

  const linkedTasks = useMemo(() => {
    if (!selectedClient) return [];
    return state.tasks.filter(t => t.clientId === selectedClient.id);
  }, [state.tasks, selectedClient]);

  const linkedSystems = useMemo(() => {
    if (!selectedClient) return [];
    return state.businessSystems.filter(s => s.clientId === selectedClient.id);
  }, [state.businessSystems, selectedClient]);

  const linkedKnowledge = useMemo(() => {
    if (!selectedClient) return [];
    return state.knowledge.filter(k => k.clientId === selectedClient.id);
  }, [state.knowledge, selectedClient]);

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {/* Left Sidebar */}
      <div style={{ width: 260, borderRight: '1px solid var(--cima-border)', padding: 16, flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
        <button 
          onClick={() => { setShowForm(true); selectClient(null); setIsEditing(false); }}
          style={{
            background: 'var(--cima-accent)', color: '#fff', border: 'none', padding: '10px',
            borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontWeight: 500, marginBottom: 16, width: '100%'
          }}
        >
          New Client
        </button>
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }} className="cima-scroll">
          {state.clients.map(c => {
            const isActive = state.selectedClientId === c.id && !showForm;
            return (
              <button
                key={c.id}
                onClick={() => { selectClient(c.id); setShowForm(false); setIsEditing(false); }}
                style={{
                  textAlign: 'left', padding: '10px 12px', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                  background: isActive ? 'var(--cima-surface-2)' : 'transparent',
                  border: isActive ? '1px solid var(--cima-border-strong)' : '1px solid transparent',
                  color: isActive ? 'var(--cima-text-primary)' : 'var(--cima-text-secondary)',
                  display: 'flex', flexDirection: 'column', gap: 6
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: isActive ? 600 : 500 }}>{c.name}</span>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: getStatusColor(c.status) }} />
                </div>
                <div style={{ fontSize: 11, background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: 10, alignSelf: 'flex-start' }}>
                  {c.stage}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Main Area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '32px 28px' }} className="cima-scroll">
        {showForm && (
          <div className="cima-fade-in" style={{ maxWidth: 600, margin: '0 auto' }}>
            <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 24 }}>Create New Client</h2>
            <form onSubmit={handleCreateSubmit} className="cima-glass" style={{ padding: 24, borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--cima-text-secondary)', marginBottom: 4 }}>Company Name</label>
                <input value={name} onChange={e => setName(e.target.value)} required autoFocus style={{ width: '100%', background: 'var(--cima-surface-1)', border: '1px solid var(--cima-border)', color: '#fff', padding: '8px 12px', borderRadius: 'var(--radius-sm)' }} />
              </div>
              <div style={{ display: 'flex', gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: 12, color: 'var(--cima-text-secondary)', marginBottom: 4 }}>Stage</label>
                  <select value={stage} onChange={e => setStage(e.target.value as ClientStage)} style={{ width: '100%', background: 'var(--cima-surface-1)', border: '1px solid var(--cima-border)', color: '#fff', padding: '8px 12px', borderRadius: 'var(--radius-sm)' }}>
                    {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: 12, color: 'var(--cima-text-secondary)', marginBottom: 4 }}>Status</label>
                  <select value={status} onChange={e => setStatus(e.target.value as ClientStatus)} style={{ width: '100%', background: 'var(--cima-surface-1)', border: '1px solid var(--cima-border)', color: '#fff', padding: '8px 12px', borderRadius: 'var(--radius-sm)' }}>
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--cima-text-secondary)', marginBottom: 4 }}>Next Action</label>
                <textarea value={nextAction} onChange={e => setNextAction(e.target.value)} required style={{ width: '100%', background: 'var(--cima-surface-1)', border: '1px solid var(--cima-border)', color: '#fff', padding: '8px 12px', borderRadius: 'var(--radius-sm)', minHeight: 80 }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
                <button type="button" onClick={() => setShowForm(false)} style={{ background: 'transparent', border: '1px solid var(--cima-border)', color: 'var(--cima-text-primary)', padding: '8px 16px', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ background: 'var(--cima-accent)', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontWeight: 500 }}>Create Client</button>
              </div>
            </form>
          </div>
        )}

        {!showForm && selectedClient && (
          <div className="cima-fade-in" style={{ maxWidth: 800, margin: '0 auto' }}>
            {isEditing ? (
              <form onSubmit={handleEditSubmit} className="cima-glass" style={{ padding: 24, borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 32 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2 style={{ fontSize: 18, margin: 0 }}>Edit Client</h2>
                  <button type="button" onClick={handleDelete} style={{ background: 'transparent', border: 'none', color: 'var(--cima-red)', cursor: 'pointer', fontSize: 13 }}>Delete Client</button>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: 'var(--cima-text-secondary)', marginBottom: 4 }}>Company Name</label>
                  <input value={editName} onChange={e => setEditName(e.target.value)} required style={{ width: '100%', background: 'var(--cima-surface-1)', border: '1px solid var(--cima-border)', color: '#fff', padding: '8px 12px', borderRadius: 'var(--radius-sm)' }} />
                </div>
                <div style={{ display: 'flex', gap: 16 }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: 12, color: 'var(--cima-text-secondary)', marginBottom: 4 }}>Stage</label>
                    <select value={editStage} onChange={e => setEditStage(e.target.value as ClientStage)} style={{ width: '100%', background: 'var(--cima-surface-1)', border: '1px solid var(--cima-border)', color: '#fff', padding: '8px 12px', borderRadius: 'var(--radius-sm)' }}>
                      {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: 12, color: 'var(--cima-text-secondary)', marginBottom: 4 }}>Status</label>
                    <select value={editStatus} onChange={e => setEditStatus(e.target.value as ClientStatus)} style={{ width: '100%', background: 'var(--cima-surface-1)', border: '1px solid var(--cima-border)', color: '#fff', padding: '8px 12px', borderRadius: 'var(--radius-sm)' }}>
                      {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: 'var(--cima-text-secondary)', marginBottom: 4 }}>Next Action</label>
                  <textarea value={editNextAction} onChange={e => setEditNextAction(e.target.value)} required style={{ width: '100%', background: 'var(--cima-surface-1)', border: '1px solid var(--cima-border)', color: '#fff', padding: '8px 12px', borderRadius: 'var(--radius-sm)', minHeight: 80 }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
                  <button type="button" onClick={() => setIsEditing(false)} style={{ background: 'transparent', border: '1px solid var(--cima-border)', color: 'var(--cima-text-primary)', padding: '8px 16px', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}>Cancel</button>
                  <button type="submit" style={{ background: 'var(--cima-accent)', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontWeight: 500 }}>Save Changes</button>
                </div>
              </form>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                      <h1 style={{ fontSize: 28, fontWeight: 600, margin: 0 }}>{selectedClient.name}</h1>
                      <span style={{ fontSize: 12, padding: '2px 8px', borderRadius: 12, background: 'var(--cima-surface-2)', border: '1px solid var(--cima-border)' }}>{selectedClient.stage}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: getStatusColor(selectedClient.status) }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: getStatusColor(selectedClient.status) }} />
                        {selectedClient.status}
                      </span>
                    </div>
                    <p style={{ color: 'var(--cima-text-secondary)', fontSize: 14, margin: 0 }}>
                      <strong style={{ color: 'var(--cima-text-primary)' }}>Next Action:</strong> {selectedClient.nextAction}
                    </p>
                  </div>
                  <button onClick={() => setIsEditing(true)} style={{ background: 'var(--cima-surface-2)', border: '1px solid var(--cima-border)', color: 'var(--cima-text-primary)', padding: '6px 16px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: 13 }}>
                    Edit
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                  {/* Opportunities */}
                  <div className="cima-glass" style={{ padding: 20, borderRadius: 'var(--radius-md)' }}>
                    <h3 style={{ fontSize: 14, textTransform: 'uppercase', color: 'var(--cima-text-secondary)', margin: '0 0 16px 0', letterSpacing: '0.05em' }}>Linked Opportunities</h3>
                    {linkedOpps.length === 0 ? <div style={{ fontSize: 13, color: 'var(--cima-text-tertiary)' }}>No opportunities linked.</div> : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {linkedOpps.map(o => (
                          <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, paddingBottom: 8, borderBottom: '1px solid var(--cima-border)' }}>
                            <span>{o.company}</span>
                            <span style={{ color: o.stage === 'Won' ? 'var(--cima-accent)' : 'var(--cima-text-secondary)' }}>{o.stage} - {o.value ? `$${o.value}` : '—'}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Systems */}
                  <div className="cima-glass" style={{ padding: 20, borderRadius: 'var(--radius-md)' }}>
                    <h3 style={{ fontSize: 14, textTransform: 'uppercase', color: 'var(--cima-text-secondary)', margin: '0 0 16px 0', letterSpacing: '0.05em' }}>Business Systems</h3>
                    {linkedSystems.length === 0 ? <div style={{ fontSize: 13, color: 'var(--cima-text-tertiary)' }}>No systems built yet.</div> : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {linkedSystems.map(s => (
                          <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, paddingBottom: 8, borderBottom: '1px solid var(--cima-border)' }}>
                            <span>{s.name}</span>
                            <span style={{ color: s.status === 'Live' ? 'var(--cima-accent)' : 'var(--cima-text-secondary)' }}>{s.status}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Tasks */}
                  <div className="cima-glass" style={{ padding: 20, borderRadius: 'var(--radius-md)' }}>
                    <h3 style={{ fontSize: 14, textTransform: 'uppercase', color: 'var(--cima-text-secondary)', margin: '0 0 16px 0', letterSpacing: '0.05em' }}>Tasks</h3>
                    {linkedTasks.length === 0 ? <div style={{ fontSize: 13, color: 'var(--cima-text-tertiary)' }}>No active tasks.</div> : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {linkedTasks.map(t => (
                          <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, paddingBottom: 8, borderBottom: '1px solid var(--cima-border)' }}>
                            <span style={{ color: t.status === 'done' ? 'var(--cima-accent)' : 'var(--cima-text-tertiary)' }}>{t.status === 'done' ? '✓' : '○'}</span>
                            <span style={{ textDecoration: t.status === 'done' ? 'line-through' : 'none', color: t.status === 'done' ? 'var(--cima-text-secondary)' : 'var(--cima-text-primary)' }}>{t.title}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Knowledge */}
                  <div className="cima-glass" style={{ padding: 20, borderRadius: 'var(--radius-md)' }}>
                    <h3 style={{ fontSize: 14, textTransform: 'uppercase', color: 'var(--cima-text-secondary)', margin: '0 0 16px 0', letterSpacing: '0.05em' }}>Knowledge & Notes</h3>
                    {linkedKnowledge.length === 0 ? <div style={{ fontSize: 13, color: 'var(--cima-text-tertiary)' }}>No knowledge items.</div> : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {linkedKnowledge.map(k => (
                          <div key={k.id} style={{ fontSize: 13, paddingBottom: 8, borderBottom: '1px solid var(--cima-border)' }}>
                            <div style={{ fontWeight: 500, marginBottom: 4 }}>{k.title}</div>
                            <div style={{ color: 'var(--cima-text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{k.content}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {!showForm && !selectedClient && (
          <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--cima-text-tertiary)', fontSize: 14 }}>
            Select a client from the sidebar or create a new one.
          </div>
        )}
      </div>
    </div>
  );
}
