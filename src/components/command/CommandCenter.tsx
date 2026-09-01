import { AIOrb } from './AIOrb';
import { CommandInput } from './CommandInput';
import { ActivityFeed } from '@/components/activity/ActivityFeed';
import { TodayPanel } from '@/components/today/TodayPanel';
import { ClientList } from '@/components/clients/ClientList';
import { SystemStatus } from '@/components/system/SystemStatus';
import { useApp } from '@/state/AppContext';

export function CommandCenter() {
  const { state } = useApp();
  
  return (
    <div
      style={{
        maxWidth: 1100,
        margin: '0 auto',
        padding: '44px 28px 60px',
        display: 'flex',
        flexDirection: 'column',
        gap: 40,
      }}
    >
      {/* Header */}
      <header style={{ textAlign: 'center' }}>
        <h1
          style={{
            fontSize: 24,
            fontWeight: 600,
            letterSpacing: '-0.02em',
            margin: 0,
          }}
        >
          CIMA OS
        </h1>
        <p style={{ fontSize: 13, color: 'var(--cima-text-secondary)', marginTop: 5 }}>
          Personal Intelligence &amp; Operations System
        </p>
      </header>

      {/* Orb + Command */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 22,
          padding: '6px 0',
        }}
      >
        <AIOrb active={state.isCommandRunning} />
        <CommandInput />
        
        {/* Command History / Demo Links */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', maxWidth: 600 }}>
          {state.commandHistory.slice(0, 3).map((cmd) => (
            <div
              key={cmd.id}
              className="cima-badge cima-badge-neutral"
              style={{ opacity: 0.7 }}
            >
              "{cmd.input}"
            </div>
          ))}
        </div>
      </div>

      {/* Three-column grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 16,
          alignItems: 'start',
        }}
      >
        <ActivityFeed />
        <TodayPanel />
        <ClientList />
      </div>

      {/* System status strip */}
      <SystemStatus />
    </div>
  );
}
