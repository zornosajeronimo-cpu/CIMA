import { AIOrb } from './AIOrb';
import { CommandInput } from './CommandInput';
import { ActivityFeed } from '@/components/activity/ActivityFeed';
import { TodayPanel } from '@/components/today/TodayPanel';
import { ClientList } from '@/components/clients/ClientList';
import { SystemStatus } from '@/components/system/SystemStatus';

/**
 * CommandCenter — the Overview / home screen.
 * All data flows from AppContext; no static arrays here.
 */
export function CommandCenter() {
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
        <AIOrb />
        <CommandInput />
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
