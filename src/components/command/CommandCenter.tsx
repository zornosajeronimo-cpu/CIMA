import { AIOrb } from './AIOrb';
import { CommandInput } from './CommandInput';
import { ExecutionTrace } from './ExecutionTrace';
import { ActivityFeed } from '@/components/activity/ActivityFeed';
import { TodayPanel } from '@/components/today/TodayPanel';
import { ClientList } from '@/components/clients/ClientList';
import { SystemStatus } from '@/components/system/SystemStatus';
import { useApp } from '@/state/AppContext';

const DEMO_COMMANDS = [
  'Analiza Plasticpack',
  'Actualiza Plasticpack a negociación',
  '¿Qué oportunidades tengo?',
  'Guarda esto como aprendizaje',
];

export function CommandCenter() {
  const { state, submitCommand } = useApp();

  return (
    <div
      style={{
        maxWidth: 1100,
        margin: '0 auto',
        padding: '44px 28px 60px',
        display: 'flex',
        flexDirection: 'column',
        gap: 36,
      }}
    >
      {/* Header */}
      <header style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em', margin: 0 }}>
          CIMA OS
        </h1>
        <p style={{ fontSize: 13, color: 'var(--cima-text-secondary)', marginTop: 5 }}>
          Personal Intelligence &amp; Operations System
        </p>
      </header>

      {/* Orb + Command + Trace */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, padding: '4px 0' }}>
        <AIOrb />
        <CommandInput />

        {/* Demo commands — only show when idle */}
        {state.commandState === 'idle' && state.commandHistory.length === 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', maxWidth: 560 }}>
            {DEMO_COMMANDS.map(cmd => (
              <button
                key={cmd}
                onClick={() => submitCommand(cmd)}
                style={{
                  background: 'transparent', border: '1px solid var(--cima-border)',
                  color: 'var(--cima-text-tertiary)', borderRadius: 999,
                  padding: '4px 12px', fontSize: 11.5, cursor: 'pointer',
                  transition: 'all 160ms var(--ease-quiet)', fontFamily: 'inherit',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--cima-border-strong)'; e.currentTarget.style.color = 'var(--cima-text-secondary)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--cima-border)'; e.currentTarget.style.color = 'var(--cima-text-tertiary)'; }}
              >
                {cmd}
              </button>
            ))}
          </div>
        )}

        {/* Recent commands when history exists */}
        {state.commandHistory.length > 0 && state.commandState === 'idle' && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', maxWidth: 560 }}>
            {state.commandHistory.slice(0, 3).map(cmd => (
              <div key={cmd.id} style={{
                padding: '3px 10px', borderRadius: 999,
                fontSize: 11, fontFamily: 'IBM Plex Mono, monospace',
                background: 'var(--cima-surface-1)', color: 'var(--cima-text-tertiary)',
                border: '1px solid var(--cima-border)',
              }}>
                "{cmd.input.slice(0, 40)}{cmd.input.length > 40 ? '...' : ''}"
              </div>
            ))}
          </div>
        )}

        {/* Execution pipeline trace */}
        <div style={{ width: '100%', maxWidth: 520 }}>
          <ExecutionTrace />
        </div>
      </div>

      {/* Three-column grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, alignItems: 'start' }}>
        <ActivityFeed />
        <TodayPanel />
        <ClientList />
      </div>

      {/* System status */}
      <SystemStatus />
    </div>
  );
}
