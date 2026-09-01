import { useApp } from '@/state/AppContext';
import { GlassSurface } from '@/components/ui/GlassSurface';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { StatusIndicator } from '@/components/ui/StatusIndicator';

export function ActivityFeed() {
  const { state } = useApp();
  const activities = state.activities.slice(0, 5);

  return (
    <GlassSurface style={{ padding: 'var(--space-5)', height: '100%' }}>
      <SectionHeader eyebrow="Live" title="What CIMA is doing" />
      <ul
        style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 13 }}
        aria-label="Activity feed"
      >
        {activities.map((a) => (
          <li
            key={a.id}
            className="cima-fade-in"
            style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}
          >
            <span style={{ marginTop: 5, flexShrink: 0 }}>
              <StatusIndicator
                color={
                  a.state === 'active'
                    ? 'var(--cima-accent)'
                    : a.state === 'queued'
                    ? 'var(--cima-text-tertiary)'
                    : 'rgba(237,240,238,0.2)'
                }
                pulse={a.state === 'active'}
              />
            </span>
            <span
              style={{
                fontSize: 13,
                color: a.state === 'done' ? 'var(--cima-text-tertiary)' : 'var(--cima-text-secondary)',
                textDecoration: a.state === 'done' ? 'line-through' : 'none',
                lineHeight: 1.45,
              }}
            >
              {a.label}
            </span>
          </li>
        ))}
      </ul>
    </GlassSurface>
  );
}
