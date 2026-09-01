import { useState } from 'react';
import { Star, Trash2, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { useApp } from '@/state/AppContext';
import { SectionHeader } from '@/components/ui/SectionHeader';
import type { KnowledgeItem, KnowledgeCategory } from '@/models';

const CATEGORIES: KnowledgeCategory[] = ['general', 'technical', 'client', 'business', 'process'];

export function KnowledgeView() {
  const { state, dispatch } = useApp();
  const [filter, setFilter] = useState<KnowledgeCategory | 'all'>('all');
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<KnowledgeCategory>('general');
  const [important, setImportant] = useState(false);

  const filteredItems = state.knowledge.filter(k => filter === 'all' || k.category === filter);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const newItem: KnowledgeItem = {
      id: `k-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title,
      content,
      category,
      tags: [],
      important,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    dispatch({ type: 'UPSERT_KNOWLEDGE', payload: newItem });
    setShowForm(false);
    setTitle('');
    setContent('');
    setCategory('general');
    setImportant(false);
  };

  const getCategoryColor = (cat: KnowledgeCategory) => {
    switch (cat) {
      case 'technical': return 'cima-badge-green';
      case 'client': return 'cima-badge-amber';
      default: return 'cima-badge-neutral';
    }
  };

  return (
    <div className="cima-view cima-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <SectionHeader eyebrow="Intelligence" title="Knowledge Base" />
        <button className="cima-btn-primary" onClick={() => setShowForm(!showForm)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Plus size={14} /> New Entry
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} style={{ background: 'var(--cima-surface-1)', border: '1px solid var(--cima-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 'var(--space-5)' }}>
          <div className="cima-form-row">
            <label className="cima-form-label">Title</label>
            <input className="cima-input" value={title} onChange={e => setTitle(e.target.value)} required placeholder="Entry title..." />
          </div>
          <div className="cima-form-row">
            <label className="cima-form-label">Category</label>
            <select className="cima-select" value={category} onChange={e => setCategory(e.target.value as KnowledgeCategory)}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="cima-form-row">
            <label className="cima-form-label">Content</label>
            <textarea className="cima-textarea" value={content} onChange={e => setContent(e.target.value)} required placeholder="Knowledge content..." />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="checkbox" id="k-important" checked={important} onChange={e => setImportant(e.target.checked)} />
            <label htmlFor="k-important" style={{ fontSize: 13, color: 'var(--cima-text-primary)' }}>Mark as important</label>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button type="submit" className="cima-btn-primary">Save Entry</button>
            <button type="button" className="cima-btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </form>
      )}

      <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
        <button onClick={() => setFilter('all')} className={`cima-badge ${filter === 'all' ? 'cima-badge-green' : 'cima-badge-neutral'}`} style={{ border: 'none', cursor: 'pointer' }}>All</button>
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setFilter(c)} className={`cima-badge ${filter === c ? 'cima-badge-green' : 'cima-badge-neutral'}`} style={{ border: 'none', cursor: 'pointer' }}>
            {c}
          </button>
        ))}
      </div>

      {filteredItems.length === 0 ? (
        <div className="cima-empty-state">
          <div className="cima-empty-eyebrow">Empty</div>
          <h3 className="cima-empty-title">No knowledge entries found</h3>
          <p className="cima-empty-body">Document your operating principles, client notes, and technical findings here.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {filteredItems.map(item => {
            const isExpanded = expandedId === item.id;
            return (
              <div key={item.id} className="cima-card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    {item.important && <Star size={14} fill="var(--cima-accent)" color="var(--cima-accent)" />}
                    <h3 style={{ fontSize: 15, fontWeight: 600, margin: 0, color: 'var(--cima-text-primary)' }}>{item.title}</h3>
                  </div>
                  <span className={`cima-badge ${getCategoryColor(item.category)}`}>{item.category}</span>
                </div>
                
                <div style={{ fontSize: 13.5, color: 'var(--cima-text-secondary)', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                  {isExpanded ? item.content : item.content.length > 100 ? `${item.content.slice(0, 100)}...` : item.content}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: 12 }}>
                  <button className="cima-btn-ghost" style={{ padding: '4px 8px', fontSize: 11 }} onClick={() => setExpandedId(isExpanded ? null : item.id)}>
                    {isExpanded ? <span style={{ display:'flex', alignItems:'center', gap:4 }}><ChevronUp size={12}/> Less</span> : <span style={{ display:'flex', alignItems:'center', gap:4 }}><ChevronDown size={12}/> More</span>}
                  </button>
                  <button className="cima-btn-danger" onClick={() => dispatch({ type: 'DELETE_KNOWLEDGE', payload: item.id })}>
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
