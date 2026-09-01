import { useApp } from '@/state/AppContext';
import { NAV_SECTIONS } from '@/lib/nav';
import { StatusIndicator } from '@/components/ui/StatusIndicator';

export function Sidebar() {
  const { state, navigate } = useApp();
  const { activeSection } = state;

  return (
    <aside
      style={{
        width: 220,
        flexShrink: 0,
        borderRight: '1px solid var(--cima-border)',
        display: 'flex',
        flexDirection: 'column',
        padding: '20px 12px',
        gap: 24,
      }}
    >
      {/* Wordmark */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '0 8px' }}>
        <div
          style={{
            width: 18,
            height: 18,
            borderRadius: 5,
            background: 'linear-gradient(160deg, rgba(150,210,180,0.9), rgba(78,158,116,0.5))',
            boxShadow: '0 0 8px rgba(78,158,116,0.2)',
            flexShrink: 0,
          }}
        />
        <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.02em' }}>CIMA OS</span>
      </div>

      {/* Navigation */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 1 }} role="navigation" aria-label="Main navigation">
        {NAV_SECTIONS.map((section) => {
          const Icon = section.icon;
          const isActive = activeSection === section.id;
          return (
            <button
              key={section.id}
              className="cima-focusable"
              onClick={() => navigate(section.id)}
              aria-current={isActive ? 'page' : undefined}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 9,
                padding: '7px 10px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: isActive ? 'var(--cima-surface-2)' : 'transparent',
                color: isActive ? 'var(--cima-text-primary)' : 'var(--cima-text-secondary)',
                fontSize: 13,
                textAlign: 'left',
                cursor: 'pointer',
                width: '100%',
                transition: 'background 140ms var(--ease-quiet), color 140ms var(--ease-quiet)',
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.background = 'transparent';
              }}
            >
              <Icon size={14} strokeWidth={1.75} style={{ flexShrink: 0 }} />
              <span style={{ flex: 1, lineHeight: 1 }}>{section.label}</span>
              {section.structural && (
                <span
                  style={{
                    width: 3,
                    height: 3,
                    borderRadius: 999,
                    background: 'var(--cima-text-tertiary)',
                    opacity: 0.5,
                    flexShrink: 0,
                  }}
                  aria-hidden="true"
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer status */}
      <div style={{ marginTop: 'auto', padding: '8px 8px 0' }}>
        <div style={{ height: 1, background: 'var(--cima-border)', marginBottom: 10 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <StatusIndicator color="var(--cima-accent)" pulse />
          <span className="cima-mono" style={{ fontSize: 10, color: 'var(--cima-text-tertiary)' }}>
            Core operational
          </span>
        </div>
      </div>
    </aside>
  );
}
