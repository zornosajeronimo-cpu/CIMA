import { useApp } from '@/state/AppContext';
import { AgentStatus } from '@/models';

function getAgentStatusColor(status: AgentStatus) {
  if (status === 'running') return 'var(--cima-amber)';
  if (status === 'disabled') return 'var(--cima-red)';
  return 'var(--cima-text-secondary)';
}

export function AgentsView() {
  const { state } = useApp();

  return (
    <div style={{ padding: '32px', height: '100%', overflowY: 'auto' }} className="cima-scroll">
      <div style={{ background: 'var(--cima-surface-2)', border: '1px solid var(--cima-border-strong)', color: 'var(--cima-text-primary)', padding: '12px 16px', borderRadius: 'var(--radius-md)', fontSize: 14, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: 'var(--cima-red)' }} />
        AI Provider not connected — agents are in standby
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, margin: 0 }}>Agents</h1>
      </div>

      {state.agents.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 0', color: 'var(--cima-text-tertiary)' }}>
          No agents available.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
          {state.agents.map(agent => (
            <div key={agent.id} className="cima-glass" style={{ padding: 24, borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>{agent.name}</h3>
                <span style={{ fontSize: 12, padding: '2px 8px', borderRadius: 12, border: `1px solid ${getAgentStatusColor(agent.status)}`, color: getAgentStatusColor(agent.status) }}>
                  {agent.status}
                </span>
              </div>
              
              <div style={{ fontStyle: 'italic', color: 'var(--cima-text-secondary)', fontSize: 14, marginBottom: 20, lineHeight: 1.5 }}>
                "{agent.goal}"
              </div>
              
              <div style={{ marginBottom: 20, flex: 1 }}>
                <div style={{ fontSize: 12, color: 'var(--cima-text-tertiary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Capabilities</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {agent.tools.map(tool => (
                    <span key={tool.name} style={{ background: 'var(--cima-surface-1)', border: '1px solid var(--cima-border)', color: 'var(--cima-text-secondary)', fontSize: 11, padding: '2px 8px', borderRadius: 4 }} title={tool.description}>
                      {tool.name}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: '1px solid var(--cima-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="cima-mono" style={{ fontSize: 10, color: 'var(--cima-text-tertiary)' }}>
                  Requires AI Provider
                </span>
                <button disabled style={{ background: 'var(--cima-surface-2)', border: '1px solid var(--cima-border)', color: 'var(--cima-text-tertiary)', padding: '6px 12px', borderRadius: 'var(--radius-sm)', cursor: 'not-allowed', fontSize: 13 }}>
                  Run
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

