import React, { useState, useEffect } from 'react';
import { useApp } from '@/state/AppContext';
import type { Automation } from '@/models';

function AutomationCard({ automation }: { automation: Automation }) {
  const { dispatch } = useApp();
  const [simSteps, setSimSteps] = useState<number>(0);
  const [simRunning, setSimRunning] = useState(false);

  const isSimulating = automation.status === 'simulating';

  const runSimulation = () => {
    dispatch({ type: 'RUN_AUTOMATION_SIMULATION', payload: automation.id });
    setSimRunning(true);
    setSimSteps(0);
  };

  useEffect(() => {
    if (simRunning) {
      automation.actions.forEach((_, i) => {
        setTimeout(() => {
          setSimSteps(prev => prev + 1);
          if (i === automation.actions.length - 1) {
            setTimeout(() => setSimRunning(false), 800);
          }
        }, (i + 1) * 600);
      });
    }
  }, [simRunning, automation.actions]);

  return (
    <div className="cima-glass" style={{ padding: 20, borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div>
          <h3 style={{ margin: '0 0 4px 0', fontSize: 16, fontWeight: 600 }}>{automation.name}</h3>
          <div style={{ fontSize: 12, color: 'var(--cima-text-secondary)' }}>
            <span style={{ fontWeight: 600, color: 'var(--cima-text-primary)' }}>Trigger:</span> {automation.trigger.description}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: 'var(--cima-text-secondary)' }}>{automation.actions.length} actions</span>
          <span style={{ fontSize: 12, padding: '2px 8px', borderRadius: 12, border: '1px solid var(--cima-border)', color: isSimulating ? 'var(--cima-amber)' : 'var(--cima-text-secondary)' }}>
            {automation.status}
          </span>
        </div>
      </div>
      
      <div style={{ marginTop: 'auto', paddingTop: 16 }}>
        <button 
          onClick={runSimulation}
          disabled={simRunning}
          style={{
            width: '100%', background: simRunning ? 'var(--cima-surface-2)' : 'var(--cima-surface-1)', border: '1px solid var(--cima-border)',
            color: simRunning ? 'var(--cima-amber)' : 'var(--cima-text-primary)', padding: '8px', borderRadius: 'var(--radius-sm)',
            cursor: simRunning ? 'default' : 'pointer', fontWeight: 500, fontSize: 13
          }}
        >
          {simRunning ? 'Simulating...' : 'Simulate'}
        </button>
      </div>

      {(simRunning || (isSimulating && simSteps > 0)) && (
        <div className="cima-fade-in" style={{ marginTop: 16, padding: 12, background: 'var(--cima-surface-1)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--cima-border)' }}>
          {automation.actions.map((act, i) => (
            <div key={i} style={{ 
              display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, marginBottom: 8,
              opacity: i < simSteps ? 1 : 0.3,
              transition: 'opacity 0.3s ease'
            }}>
              <span style={{ color: i < simSteps ? 'var(--cima-accent)' : 'var(--cima-text-tertiary)' }}>{i < simSteps ? '✓' : '○'}</span>
              <span style={{ color: 'var(--cima-text-primary)' }}>{act.description}</span>
              <span style={{ fontSize: 10, padding: '2px 4px', borderRadius: 4, background: 'var(--cima-surface-2)', color: 'var(--cima-text-secondary)', marginLeft: 'auto' }}>
                [{act.simulated ? 'SIMULATED' : 'REAL'}]
              </span>
            </div>
          ))}
          {simSteps === automation.actions.length && !simRunning && (
            <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--cima-border)', color: 'var(--cima-accent)', fontSize: 13, textAlign: 'center' }}>
              Simulation complete
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function AutomationsView() {
  const { state, dispatch } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [triggerDesc, setTriggerDesc] = useState('');
  const [actions, setActions] = useState<string[]>(['']);

  const handleAddAction = () => setActions([...actions, '']);
  const handleUpdateAction = (i: number, val: string) => {
    const next = [...actions];
    next[i] = val;
    setActions(next);
  };
  const handleRemoveAction = (i: number) => {
    setActions(actions.filter((_, idx) => idx !== i));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !triggerDesc) return;
    const validActions = actions.filter(a => a.trim().length > 0);
    if (validActions.length === 0) return;

    const newAuto: Automation = {
      id: Date.now().toString(),
      name,
      description: '',
      trigger: { type: 'manual', description: triggerDesc },
      conditions: [],
      actions: validActions.map((desc, i) => ({
        order: i, tool: 'api', description: desc, simulated: true
      })),
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    dispatch({ type: 'UPSERT_AUTOMATION', payload: newAuto });
    setShowForm(false);
    setName('');
    setTriggerDesc('');
    setActions(['']);
  };

  return (
    <div style={{ padding: '32px', height: '100%', overflowY: 'auto' }} className="cima-scroll">
      <div style={{ background: 'var(--cima-amber)', color: '#000', padding: '8px 16px', borderRadius: 'var(--radius-sm)', fontSize: 13, fontWeight: 600, textAlign: 'center', marginBottom: 24 }}>
        Simulation mode — no external services are connected
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, margin: 0 }}>Automations</h1>
        <button 
          onClick={() => setShowForm(!showForm)}
          style={{
            background: 'var(--cima-surface-2)', border: '1px solid var(--cima-border)',
            color: 'var(--cima-text-primary)', padding: '6px 12px', borderRadius: 'var(--radius-sm)', cursor: 'pointer'
          }}
        >
          {showForm ? 'Cancel' : 'New Automation'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="cima-glass-raised cima-fade-in" style={{ padding: 20, borderRadius: 'var(--radius-md)', marginBottom: 32, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: 12, color: 'var(--cima-text-secondary)', marginBottom: 4 }}>Name</label>
              <input value={name} onChange={e => setName(e.target.value)} required style={{ width: '100%', background: 'var(--cima-surface-1)', border: '1px solid var(--cima-border)', color: '#fff', padding: '8px 12px', borderRadius: 'var(--radius-sm)' }} />
            </div>
            <div style={{ flex: 2 }}>
              <label style={{ display: 'block', fontSize: 12, color: 'var(--cima-text-secondary)', marginBottom: 4 }}>Trigger Description</label>
              <input value={triggerDesc} onChange={e => setTriggerDesc(e.target.value)} required style={{ width: '100%', background: 'var(--cima-surface-1)', border: '1px solid var(--cima-border)', color: '#fff', padding: '8px 12px', borderRadius: 'var(--radius-sm)' }} placeholder="e.g. When a new email arrives from a client" />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, color: 'var(--cima-text-secondary)', marginBottom: 8 }}>Actions</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {actions.map((act, i) => (
                <div key={i} style={{ display: 'flex', gap: 8 }}>
                  <span style={{ color: 'var(--cima-text-tertiary)', width: 24, textAlign: 'center', alignSelf: 'center', fontSize: 12 }}>{i + 1}.</span>
                  <input value={act} onChange={e => handleUpdateAction(i, e.target.value)} style={{ flex: 1, background: 'var(--cima-surface-1)', border: '1px solid var(--cima-border)', color: '#fff', padding: '6px 12px', borderRadius: 'var(--radius-sm)' }} placeholder="Action description" />
                  <button type="button" onClick={() => handleRemoveAction(i)} style={{ background: 'transparent', border: 'none', color: 'var(--cima-red)', cursor: 'pointer', fontSize: 16 }}>×</button>
                </div>
              ))}
            </div>
            <button type="button" onClick={handleAddAction} style={{ marginTop: 8, background: 'transparent', border: '1px dashed var(--cima-border)', color: 'var(--cima-text-secondary)', padding: '6px 12px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: 12 }}>
              + Add Action
            </button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" style={{ background: 'var(--cima-accent)', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontWeight: 500 }}>
              Create Automation
            </button>
          </div>
        </form>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
        {state.automations.map(auto => <AutomationCard key={auto.id} automation={auto} />)}
      </div>
    </div>
  );
}

