import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useApp } from '@/state/AppContext';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { GlassSurface } from '@/components/ui/GlassSurface';
import type { Lesson } from '@/models';

export function LessonsView() {
  const { state, dispatch } = useApp();
  const [showForm, setShowForm] = useState(false);

  const [title, setTitle] = useState('');
  const [context, setContext] = useState('');
  const [learning, setLearning] = useState('');
  const [application, setApplication] = useState('');
  const [tags, setTags] = useState('');

  const handleSave = () => {
    if (!title.trim() || !learning.trim()) return;

    const newLesson: Lesson = {
      id: `l-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title,
      context,
      learning,
      application,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    dispatch({ type: 'UPSERT_LESSON', payload: newLesson });
    setShowForm(false);
    setTitle('');
    setContext('');
    setLearning('');
    setApplication('');
    setTags('');
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 28px 64px' }}>
      <SectionHeader 
        eyebrow="Retrospective" 
        title="Lessons Learned"
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
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="cima-focusable"
            style={{
              background: 'transparent', border: 'none', borderBottom: '1px solid var(--cima-border)',
              color: 'var(--cima-text-primary)', fontSize: 16, padding: '8px 0', outline: 'none'
            }}
          />
          <input
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="Context (brief)"
            className="cima-focusable"
            style={{
              background: 'transparent', border: '1px solid var(--cima-border)', borderRadius: 'var(--radius-sm)',
              color: 'var(--cima-text-primary)', fontSize: 14, padding: '12px', outline: 'none'
            }}
          />
          <textarea
            value={learning}
            onChange={(e) => setLearning(e.target.value)}
            placeholder="Learning"
            className="cima-focusable cima-scroll"
            style={{
              background: 'transparent', border: '1px solid var(--cima-border)', borderRadius: 'var(--radius-sm)',
              color: 'var(--cima-text-primary)', fontSize: 14, padding: '12px', minHeight: 80, outline: 'none', resize: 'vertical'
            }}
          />
          <textarea
            value={application}
            onChange={(e) => setApplication(e.target.value)}
            placeholder="Application (how to use this)"
            className="cima-focusable cima-scroll"
            style={{
              background: 'transparent', border: '1px solid var(--cima-border)', borderRadius: 'var(--radius-sm)',
              color: 'var(--cima-text-primary)', fontSize: 14, padding: '12px', minHeight: 60, outline: 'none', resize: 'vertical'
            }}
          />
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="Tags (comma-separated)"
            className="cima-focusable"
            style={{
              background: 'transparent', border: '1px solid var(--cima-border)', borderRadius: 'var(--radius-sm)',
              color: 'var(--cima-text-primary)', fontSize: 14, padding: '12px', outline: 'none'
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
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

      {state.lessons.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 0', color: 'var(--cima-text-tertiary)', fontSize: 14 }}>
          No lessons found.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {state.lessons.map(lesson => (
            <div
              key={lesson.id}
              style={{
                border: '1px solid var(--cima-border)',
                borderRadius: 'var(--radius-md)',
                padding: 20,
                background: 'transparent'
              }}
            >
              <div className="cima-mono" style={{ fontSize: 11, color: 'var(--cima-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                {lesson.context}
              </div>
              <div style={{ fontWeight: 600, fontSize: 16, color: 'var(--cima-text-primary)', marginBottom: 12 }}>
                {lesson.title}
              </div>
              
              <div style={{ fontSize: 14, color: 'var(--cima-text-secondary)', lineHeight: 1.6, marginBottom: 16, whiteSpace: 'pre-wrap' }}>
                {lesson.learning}
              </div>

              {lesson.application && (
                <div style={{ fontSize: 13, color: 'var(--cima-text-secondary)', background: 'var(--cima-surface-1)', padding: 12, borderRadius: 'var(--radius-sm)', marginBottom: 16 }}>
                  <span style={{ fontWeight: 600, color: 'var(--cima-text-primary)', marginRight: 6 }}>Application:</span>
                  {lesson.application}
                </div>
              )}

              {lesson.tags && lesson.tags.length > 0 && (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {lesson.tags.map(tag => (
                    <span 
                      key={tag}
                      style={{ 
                        display: 'inline-flex', alignItems: 'center', padding: '2px 9px', 
                        borderRadius: 999, fontSize: 10.5, fontFamily: 'IBM Plex Mono,monospace', 
                        background: 'var(--cima-surface-2)', color: 'var(--cima-text-secondary)', border: '1px solid var(--cima-border)' 
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
