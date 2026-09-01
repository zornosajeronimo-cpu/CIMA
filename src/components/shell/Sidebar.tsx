import { useApp } from '@/state/AppContext';
import { NAV_SECTIONS } from '@/lib/nav';
import { StatusIndicator } from '@/components/ui/StatusIndicator';
import { GlassSurface } from '@/components/ui/GlassSurface';

export function Sidebar() {
  const { state, navigate } = useApp();
  const { activeSection } = state;

  return (
    <GlassSurface radius="xl" className="cima-sidebar-rail" style={{ margin: '12px 0 12px 12px' }}>
      {/* Wordmark */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '2px 8px' }}>
        <div
          style={{
            width: 20,
            height: 20,
            borderRadius: 7,
            background: 'radial-gradient(circle at 32% 30%, rgba(255,255,255,0.9), rgba(78,158,116,0.55))',
            boxShadow: '0 0 10px rgba(78,158,116,0.25)',
            flexShrink: 0,
          }}
        />
        <span className="cima-display" style={{ fontSize: 14 }}>CIMA OS</span>
      </div>

      {/* Navigation */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }} role="navigation" aria-label="Main navigation">
        {NAV_SECTIONS.map((section) => {
          const Icon = section.icon;
          const isActive = activeSection === section.id;
          return (
            <button
              key={section.id}
              className="cima-focusable cima-nav-item"
              onClick={() => navigate(section.id)}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon size={14} strokeWidth={1.75} style={{ flexShrink: 0 }} />
              <span style={{ flex: 1, lineHeight: 1 }}>{section.label}</span>
              <span className="cima-nav-dot" aria-hidden="true" />
            </button>
          );
        })}
      </nav>

      {/* Footer status — echoes the avatar/status circle from the reference layout */}
      <div style={{ padding: '8px 6px 2px' }}>
        <div style={{ height: 1, background: 'var(--cima-border)', marginBottom: 12 }} />
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 9,
            padding: '6px 6px',
            borderRadius: 999,
            background: 'var(--cima-surface-1)',
            border: '1px solid var(--cima-border)',
          }}
        >
          <span
            style={{
              width: 26,
              height: 26,
              borderRadius: '50%',
              flexShrink: 0,
              background: 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.12), rgba(255,255,255,0.02))',
              border: '1px solid var(--cima-border-strong)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <StatusIndicator color="var(--cima-accent)" pulse size={7} />
          </span>
          <span className="cima-mono" style={{ fontSize: 10.5, color: 'var(--cima-text-tertiary)' }}>
            Core operational
          </span>
        </div>
      </div>
    </GlassSurface>
  );
}
