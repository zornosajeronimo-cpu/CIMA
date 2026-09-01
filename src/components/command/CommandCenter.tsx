import { AIOrb } from './AIOrb';
import { CommandInput } from './CommandInput';
import { ExecutionTrace } from './ExecutionTrace';
import { ActivityFeed } from '@/components/activity/ActivityFeed';
import { TodayPanel } from '@/components/today/TodayPanel';
import { ClientList } from '@/components/clients/ClientList';
import { SystemStatus } from '@/components/system/SystemStatus';
import { GlassSurface } from '@/components/ui/GlassSurface';
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
        maxWidth: 1220,
        margin: '0 auto',
        padding: '8px 28px 60px',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
      }}
    >
      {/* Bento: left column stacks hero + a two-card row, right column
          is a single tall card spanning both — matches the reference
          structure exactly. */}
      <div className="cima-bento-main">
        <div className="cima-bento-left">
          {/* Hero: identity + particle sphere, command input anchored
              at the bottom of the card. */}
          <GlassSurface hero radius="xl" style={{ padding: '32px 28px 24px', display: 'flex', flexDirection: 'column', minHeight: 460 }}>
            <header style={{ textAlign: 'center', marginBottom: 8 }}>
              <h1 className="cima-display" style={{ fontSize: 24 }}>CIMA OS</h1>
              <p style={{ fontSize: 13, color: 'var(--cima-text-secondary)', marginTop: 5 }}>
                Sistema de Inteligencia y Operaciones Personales
              </p>
            </header>

            {/* Sphere fills the remaining space, centered */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AIOrb size={196} />
            </div>

            {/* Input anchored to the bottom of the hero card */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
              <div style={{ width: '100%', maxWidth: 480 }}>
                <CommandInput />
              </div>

              {state.commandState === 'idle' && state.commandHistory.length === 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', maxWidth: 520 }}>
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

              {state.commandHistory.length > 0 && state.commandState === 'idle' && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', maxWidth: 520 }}>
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

              <div style={{ width: '100%', maxWidth: 520 }}>
                <ExecutionTrace />
              </div>
            </div>
          </GlassSurface>

          {/* Two cards below the hero, matching the reference's bottom row */}
          <div className="cima-bento-row">
            <TodayPanel />
            <ClientList />
          </div>
        </div>

        {/* Right column: single tall card */}
        <ActivityFeed />
      </div>

      {/* System status footer */}
      <SystemStatus />
    </div>
  );
}
