import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useApp } from '@/state/AppContext';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { GlassSurface } from '@/components/ui/GlassSurface';
import type { ResearchEntry } from '@/models';

export function ResearchView() {
  const { state, dispatch } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  const [question, setQuestion] = useState('');
  const [finding, setFinding] = useState('');
  const [conclusion, setConclusion] = useState('');
  const [relevance, setRelevance] = useState<'low' | 'medium' | 'high'>('medium');
  const [clientId, setClientId] = useState('');

  const filteredEntries = state.research.filter(r => 
    filter === 'all' ? true : r.relevance === filter
  );

  const handleSave = () => {
    if (!question.trim() || !finding.trim()) return;

    const newEntry: ResearchEntry = {
      id: `r-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      question,
      finding,
      conclusion: conclusion.trim() || undefined,
      relevance,
      clientId: clientId || undefined,
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    dispatch({ type: 'UPSERT_RESEARCH', payload: newEntry });
    setShowForm(false);
    setQuestion('');
    setFinding('');
    setConclusion('');
    setRelevance('medium');
    setClientId('');
  };

  const getBadgeColor = (rel: string) => {
    switch (rel) {
      case 'high': return { bg: 'var(--cima-accent-dim)', color: 'var(--cima-accent)', border: 'var(--cima-accent-line)' };
      case 'medium': return { bg: 'rgba(185, 146, 91, 0.14)', color: 'var(--cima-amber)', border: 'rgba(185, 146, 91, 0.35)' };
      default: return { bg: 'var(--cima-surface-2)', color: 'var(--cima-text-secondary)', border: 'var(--cima-border-strong)' };
    }
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 28px 64px' }}>
      <SectionHeader 
        eyebrow="Investigation" 
        title="Research Log"
        action={
          <button 
            onClick={() => setShowForm(!showForm)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'var(--cima-surface-2)', border: '1px solid var(--cima-border)',
              color: 'var(--cima-text-primary)', padding: '6px 12px',
              borderRadius: 'var(--radius-md)', fontSize: 13, cursor: 'pointer'
            }}
          >
            <Plus size={14} /> New
          </button>
        }
      />

      {showForm && (
        <GlassSurface style={{ padding: 'var(--space-5)', marginBottom: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Question"
            className="cima-focusable"
            style={{
              background: 'transparent', border: 'none', borderBottom: '1px solid var(--cima-border)',
              color: 'var(--cima-text-primary)', fontSize: 16, padding: '8px 0', outline: 'none'
            }}
          />
          <textarea
            value={finding}
            onChange={(e) => setFinding(e.target.value)}
            placeholder="Finding"
            className="cima-focusable cima-scroll"
            style={{
              background: 'transparent', border: '1px solid var(--cima-border)', borderRadius: 'var(--radius-sm)',
              color: 'var(--cima-text-primary)', fontSize: 14, padding: '12px', minHeight: 80, outline: 'none', resize: 'vertical'
            }}
          />
          <textarea
            value={conclusion}
            onChange={(e) => setConclusion(e.target.value)}
            placeholder="Conclusion (optional)"
            className="cima-focusable cima-scroll"
            style={{
              background: 'transparent', border: '1px solid var(--cima-border)', borderRadius: 'var(--radius-sm)',
              color: 'var(--cima-text-primary)', fontSize: 14, padding: '12px', minHeight: 60, outline: 'none', resize: 'vertical'
            }}
          />
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <select
              value={relevance}
              onChange={(e) => setRelevance(e.target.value as 'low' | 'medium' | 'high')}
              className="cima-focusable"
              style={{
                background: 'var(--cima-bg)', border: '1px solid var(--cima-border)', borderRadius: 'var(--radius-sm)',
                color: 'var(--cima-text-primary)', fontSize: 13, padding: '6px 12px', outline: 'none'
              }}
            >
              <option value="high">High Relevance</option>
              <option value="medium">Medium Relevance</option>
              <option value="low">Low Relevance</option>
            </select>
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="cima-focusable"
              style={{
                background: 'var(--cima-bg)', border: '1px solid var(--cima-border)', borderRadius: 'var(--radius-sm)',
                color: 'var(--cima-text-primary)', fontSize: 13, padding: '6px 12px', outline: 'none'
              }}
            >
              <option value="">No Client Linked</option>
              {state.clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <div style={{ flex: 1 }} />
            <button 
              onClick={handleSave}
              style={{
                background: 'var(--cima-accent-dim)', border: '1px solid var(--cima-accent-line)',
                color: 'var(--cima-accent)', padding: '6px 16px', borderRadius: 'var(--radius-sm)',
                fontSize: 13, cursor: 'pointer'
              }}
            >
              Save
            </button>
          </div>
        </GlassSurface>
      )}

      <div style={{ display: 'flex', gap: 8, marginBottom: 'var(--space-5)' }}>
        {(['all', 'high', 'medium', 'low'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              background: filter === f ? 'var(--cima-surface-2)' : 'transparent',
              border: filter === f ? '1px solid var(--cima-border-strong)' : '1px solid transparent',
              color: filter === f ? 'var(--cima-text-primary)' : 'var(--cima-text-secondary)',
              padding: '4px 12px', borderRadius: 999, fontSize: 12, cursor: 'pointer', textTransform: 'capitalize'
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {filteredEntries.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 0', color: 'var(--cima-text-tertiary)', fontSize: 14 }}>
          No research entries found.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {filteredEntries.map(entry => {
            const badge = getBadgeColor(entry.relevance);
            const client = entry.clientId ? state.clients.find(c => c.id === entry.clientId) : null;
            return (
              <div
                key={entry.id}
                style={{
                  border: '1px solid var(--cima-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: 20,
                  background: 'transparent'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div style={{ fontWeight: 600, fontSize: 16, color: 'var(--cima-text-primary)' }}>
                    {entry.question}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {client && (
                      <span style={{ 
                        display: 'inline-flex', alignItems: 'center', padding: '2px 9px', 
                        borderRadius: 999, fontSize: 10.5, fontFamily: 'IBM Plex Mono,monospace', 
                        background: 'var(--cima-surface-2)', color: 'var(--cima-text-secondary)', border: '1px solid var(--cima-border-strong)' 
                      }}>
                        {client.name}
                      </span>
                    )}
                    <span style={{ 
                      display: 'inline-flex', alignItems: 'center', padding: '2px 9px', 
                      borderRadius: 999, fontSize: 10.5, fontFamily: 'IBM Plex Mono,monospace', 
                      background: badge.bg, color: badge.color, border: `1px solid ${badge.border}` 
                    }}>
                      {entry.relevance}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--cima-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Finding</div>
                    <div style={{ fontSize: 14, color: 'var(--cima-text-secondary)', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                      {entry.finding}
                    </div>
                  </div>
                  {entry.conclusion && (
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--cima-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Conclusion</div>
                      <div style={{ fontSize: 14, color: 'var(--cima-text-primary)', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                        {entry.conclusion}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
