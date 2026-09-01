import React, { useState } from 'react';
import { useApp } from '@/state/AppContext';
import { Opportunity, OpportunityStage } from '@/models';

const STAGES: OpportunityStage[] = ['Lead', 'Discovery', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost'];

function formatValue(v?: number): string {
  if (!v) return '—';
  if (v >= 1000000) return `$${(v/1000000).toFixed(1)}M COP`;
  if (v >= 1000) return `$${(v/1000).toFixed(0)}K COP`;
  return `$${v} COP`;
}

export function SalesView() {
  const { state, dispatch } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [company, setCompany] = useState('');
  const [value, setValue] = useState('');
  const [stage, setStage] = useState<OpportunityStage>('Lead');
  const [nextAction, setNextAction] = useState('');

  const totalValue = state.opportunities
    .filter(o => o.stage !== 'Lost')
    .reduce((sum, o) => sum + (o.value || 0), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!company || !nextAction) return;

    const newOpp: Opportunity = {
      id: Date.now().toString(),
      company,
      value: value ? Number(value) : undefined,
      stage,
      nextAction,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    dispatch({ type: 'UPSERT_OPPORTUNITY', payload: newOpp });
    setCompany('');
    setValue('');
    setStage('Lead');
    setNextAction('');
    setShowForm(false);
  };

  const handleMove = (id: string, currentStage: OpportunityStage, direction: -1 | 1) => {
    const idx = STAGES.indexOf(currentStage);
    const nextIdx = idx + direction;
    if (nextIdx >= 0 && nextIdx < STAGES.length) {
      dispatch({ 
        type: 'UPDATE_OPPORTUNITY_STAGE', 
        payload: { id, stage: STAGES[nextIdx] } 
      });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '32px' }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h1 style={{ fontSize: 24, fontWeight: 600, margin: 0 }}>Sales Pipeline</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ color: 'var(--cima-text-secondary)', fontSize: 14 }}>
              Total Pipeline: <span style={{ color: 'var(--cima-text-primary)', fontWeight: 600 }}>{formatValue(totalValue)}</span>
            </span>
            <button 
              onClick={() => setShowForm(!showForm)}
              style={{
                background: 'var(--cima-surface-2)', border: '1px solid var(--cima-border)',
                color: 'var(--cima-text-primary)', padding: '6px 12px', borderRadius: 'var(--radius-sm)',
                cursor: 'pointer'
              }}
            >
              {showForm ? 'Cancel' : 'New Opportunity'}
            </button>
          </div>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="cima-glass-raised cima-fade-in" style={{ padding: 16, borderRadius: 'var(--radius-md)', display: 'flex', gap: 12, alignItems: 'flex-end', marginBottom: 24 }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: 12, color: 'var(--cima-text-secondary)', marginBottom: 4 }}>Company</label>
              <input 
                autoFocus
                value={company} onChange={e => setCompany(e.target.value)} required
                style={{ width: '100%', background: 'var(--cima-surface-1)', border: '1px solid var(--cima-border)', color: '#fff', padding: '6px 10px', borderRadius: 'var(--radius-sm)' }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: 12, color: 'var(--cima-text-secondary)', marginBottom: 4 }}>Value (COP)</label>
              <input 
                type="number" value={value} onChange={e => setValue(e.target.value)}
                style={{ width: '100%', background: 'var(--cima-surface-1)', border: '1px solid var(--cima-border)', color: '#fff', padding: '6px 10px', borderRadius: 'var(--radius-sm)' }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: 12, color: 'var(--cima-text-secondary)', marginBottom: 4 }}>Stage</label>
              <select 
                value={stage} onChange={e => setStage(e.target.value as OpportunityStage)}
                style={{ width: '100%', background: 'var(--cima-surface-1)', border: '1px solid var(--cima-border)', color: '#fff', padding: '6px 10px', borderRadius: 'var(--radius-sm)' }}
              >
                {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div style={{ flex: 2 }}>
              <label style={{ display: 'block', fontSize: 12, color: 'var(--cima-text-secondary)', marginBottom: 4 }}>Next Action</label>
              <input 
                value={nextAction} onChange={e => setNextAction(e.target.value)} required
                style={{ width: '100%', background: 'var(--cima-surface-1)', border: '1px solid var(--cima-border)', color: '#fff', padding: '6px 10px', borderRadius: 'var(--radius-sm)' }}
              />
            </div>
            <button type="submit" style={{ background: 'var(--cima-accent)', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontWeight: 500 }}>
              Create
            </button>
          </form>
        )}
      </div>

      <div className="cima-scroll" style={{ display: 'flex', gap: 14, overflowX: 'auto', paddingBottom: 12, flex: 1 }}>
        {STAGES.map(stageName => {
          const colOpps = state.opportunities.filter(o => o.stage === stageName);
          const colValue = colOpps.reduce((sum, o) => sum + (o.value || 0), 0);
          return (
            <div key={stageName} style={{ minWidth: 260, maxWidth: 280, flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, borderBottom: '1px solid var(--cima-border)', paddingBottom: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 600 }}>{stageName} <span style={{ color: 'var(--cima-text-tertiary)', fontWeight: 'normal', marginLeft: 4 }}>{colOpps.length}</span></span>
                <span style={{ fontSize: 12, color: 'var(--cima-text-secondary)' }}>{formatValue(colValue)}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, overflowY: 'auto', paddingRight: 4 }} className="cima-scroll">
                {colOpps.map(opp => {
                  const isWon = opp.stage === 'Won';
                  const isLost = opp.stage === 'Lost';
                  return (
                    <div key={opp.id} className="cima-glass" style={{ 
                      padding: 12, borderRadius: 'var(--radius-sm)',
                      background: isWon ? 'var(--cima-accent-dim)' : 'var(--cima-surface-1)',
                      borderColor: isWon ? 'var(--cima-accent-line)' : 'var(--cima-border)',
                      opacity: isLost ? 0.6 : 1,
                      textDecoration: isLost ? 'line-through' : 'none'
                    }}>
                      <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{opp.company}</div>
                      <div style={{ fontSize: 12, color: isWon ? 'var(--cima-accent)' : 'var(--cima-text-secondary)', marginBottom: 8 }}>
                        {formatValue(opp.value)}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--cima-text-primary)', marginBottom: 12, textDecoration: isLost ? 'line-through' : 'none' }}>
                        {opp.nextAction}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <button 
                          disabled={stageName === STAGES[0]}
                          onClick={() => handleMove(opp.id, opp.stage, -1)}
                          style={{ background: 'transparent', border: 'none', color: 'var(--cima-text-secondary)', cursor: 'pointer', padding: 4 }}
                        >←</button>
                        <button 
                          disabled={stageName === STAGES[STAGES.length - 1]}
                          onClick={() => handleMove(opp.id, opp.stage, 1)}
                          style={{ background: 'transparent', border: 'none', color: 'var(--cima-text-secondary)', cursor: 'pointer', padding: 4 }}
                        >→</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
