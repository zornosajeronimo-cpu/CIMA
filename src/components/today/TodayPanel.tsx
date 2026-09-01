import { useApp } from '@/state/AppContext';
import { GlassSurface } from '@/components/ui/GlassSurface';
import { SectionHeader } from '@/components/ui/SectionHeader';

export function TodayPanel() {
  const { state, toggleTask } = useApp();

  return (
    <GlassSurface style={{ padding: 'var(--space-5)', height: '100%' }}>
      <SectionHeader eyebrow="Today" title="What matters right now" />
      <ul
        style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 13 }}
        aria-label="Today's tasks"
      >
        {state.tasks.map((t) => (
          <li
            key={t.id}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}
          >
            <button
              className="cima-focusable"
              onClick={() => toggleTask(t.id)}
              aria-pressed={t.status === 'done'}
              aria-label={`Mark "${t.title}" as ${t.status === 'done' ? 'incomplete' : 'complete'}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                textAlign: 'left',
                flex: 1,
                minWidth: 0,
              }}
            >
              {/* Checkbox */}
              <span
                style={{
                  width: 13,
                  height: 13,
                  borderRadius: 4,
                  border: `1px solid ${t.status === 'done' ? 'var(--cima-accent-line)' : 'var(--cima-border-strong)'}`,
                  background: t.status === 'done' ? 'var(--cima-accent-dim)' : 'transparent',
                  flexShrink: 0,
                  transition: 'all 180ms var(--ease-quiet)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {t.status === 'done' && (
                  <svg width="7" height="5" viewBox="0 0 7 5" fill="none">
                    <path d="M1 2.5L2.8 4L6 1" stroke="var(--cima-accent)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              <span
                style={{
                  fontSize: 13,
                  color: t.status === 'done' ? 'var(--cima-text-tertiary)' : 'var(--cima-text-secondary)',
                  textDecoration: t.status === 'done' ? 'line-through' : 'none',
                  transition: 'color 180ms var(--ease-quiet)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {t.title}
              </span>
            </button>
            <span
              className="cima-mono"
              style={{ fontSize: 10.5, color: 'var(--cima-text-tertiary)', flexShrink: 0 }}
            >
              {t.meta}
            </span>
          </li>
        ))}
      </ul>
    </GlassSurface>
  );
}
