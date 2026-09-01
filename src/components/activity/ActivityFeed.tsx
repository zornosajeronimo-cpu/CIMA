import { useState } from 'react';
import { useApp } from '@/state/AppContext';
import { GlassSurface } from '@/components/ui/GlassSurface';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { StatusIndicator } from '@/components/ui/StatusIndicator';

export function ActivityFeed() {
  const { state } = useApp();
  const [tab, setTab] = useState<'activity' | 'executions'>('activity');
  
  const activities = state.activities.slice(0, 5);
  const executions = state.executions.slice(0, 5);

  return (
    <GlassSurface style={{ padding: 'var(--space-5)', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <SectionHeader eyebrow="Live" title="System Monitor" />
        <div style={{ display: 'flex', gap: 6 }}>
          <button 
            onClick={() => setTab('activity')}
            style={{ 
              background: 'transparent', border: 'none', cursor: 'pointer',
              fontSize: 11, padding: '2px 6px', borderRadius: 4,
              color: tab === 'activity' ? 'var(--cima-accent)' : 'var(--cima-text-tertiary)',
              backgroundColor: tab === 'activity' ? 'rgba(78, 158, 116, 0.1)' : 'transparent',
              fontFamily: 'IBM Plex Mono, monospace'
            }}
          >
            ACTIVITY
          </button>
          <button 
            onClick={() => setTab('executions')}
            style={{ 
              background: 'transparent', border: 'none', cursor: 'pointer',
              fontSize: 11, padding: '2px 6px', borderRadius: 4,
              color: tab === 'executions' ? 'var(--cima-text-primary)' : 'var(--cima-text-tertiary)',
              backgroundColor: tab === 'executions' ? 'var(--cima-surface-2)' : 'transparent',
              fontFamily: 'IBM Plex Mono, monospace'
            }}
          >
            EXECUTIONS
          </button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {tab === 'activity' ? (
          <ul
            style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 13 }}
            aria-label="Activity feed"
          >
            {activities.length === 0 && <li style={{ fontSize: 12, color: 'var(--cima-text-tertiary)' }}>No recent activity</li>}
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
                    lineHeight: 1.45,
                  }}
                >
                  {a.label}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <ul
            style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 13 }}
            aria-label="Executions feed"
          >
            {executions.length === 0 && <li style={{ fontSize: 12, color: 'var(--cima-text-tertiary)' }}>No recent executions</li>}
            {executions.map((e) => (
              <li
                key={e.id}
                className="cima-fade-in"
                style={{ display: 'flex', flexDirection: 'column', gap: 4, paddingBottom: 8, borderBottom: '1px solid var(--cima-border)' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 11, fontFamily: 'IBM Plex Mono, monospace', color: 'var(--cima-text-secondary)' }}>
                    {e.intentType}
                  </span>
                  <span className={`cima-badge cima-badge-${e.status === 'completed' ? 'green' : e.status === 'failed' ? 'red' : 'amber'}`}>
                    {e.status}
                  </span>
                </div>
                <div style={{ fontSize: 13, color: 'var(--cima-text-primary)' }}>"{e.commandText}"</div>
                {e.toolName && <div style={{ fontSize: 11, color: 'var(--cima-text-tertiary)' }}>Tool: {e.toolName}</div>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </GlassSurface>
  );
}
