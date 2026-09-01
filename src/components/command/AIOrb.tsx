import { useApp } from '@/state/AppContext';

const STATE_LABEL: Record<string, string> = {
  idle: '',
  thinking: 'Understanding your command...',
  planning: 'Building action plan...',
  awaiting_confirmation: 'Waiting for your approval',
  executing: 'Executing...',
  completed: 'Done',
  failed: 'Something went wrong',
};

const STATE_COLOR: Record<string, string> = {
  idle: 'var(--cima-text-tertiary)',
  thinking: 'var(--cima-amber)',
  planning: 'var(--cima-amber)',
  awaiting_confirmation: 'var(--cima-accent)',
  executing: 'var(--cima-accent)',
  completed: 'var(--cima-accent)',
  failed: 'var(--cima-red)',
};

export function AIOrb({ active }: { active?: boolean }) {
  const { state } = useApp();
  const { commandState } = state;

  const isAnimated = active || (commandState !== 'idle' && commandState !== 'completed' && commandState !== 'failed');
  const orbColor = STATE_COLOR[commandState] ?? 'var(--cima-text-tertiary)';
  const label = STATE_LABEL[commandState];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
      <div style={{ position: 'relative', width: 56, height: 56 }}>
        {/* Pulse ring */}
        {isAnimated && (
          <div style={{
            position: 'absolute', inset: -6, borderRadius: '50%',
            border: `1px solid ${orbColor}`,
            opacity: 0.4,
            animation: 'cima-pulse 1.8s ease-in-out infinite',
          }} />
        )}
        {/* Core orb */}
        <div style={{
          width: 56, height: 56, borderRadius: '50%',
          background: isAnimated
            ? `radial-gradient(circle at 35% 35%, ${orbColor}60, ${orbColor}18)`
            : 'radial-gradient(circle at 35% 35%, rgba(78,158,116,0.22), rgba(78,158,116,0.06))',
          border: `1px solid ${isAnimated ? orbColor : 'var(--cima-border-strong)'}`,
          transition: 'all 400ms var(--ease-quiet)',
          boxShadow: isAnimated ? `0 0 20px ${orbColor}30` : 'none',
        }} />
      </div>
      {label && (
        <div style={{
          fontSize: 11, fontFamily: 'IBM Plex Mono, monospace',
          color: orbColor, letterSpacing: '0.03em',
          transition: 'color 300ms var(--ease-quiet)',
        }}>
          {label}
        </div>
      )}
    </div>
  );
}
