import { useState } from 'react';
import { Sparkles, ChevronRight, ChevronLeft } from 'lucide-react';
import { useApp } from '@/state/AppContext';
import { NAV_SECTIONS } from '@/lib/nav';
import { StatusIndicator } from '@/components/ui/StatusIndicator';
import { GlassSurface } from '@/components/ui/GlassSurface';

export function Sidebar() {
  const { state, navigate } = useApp();
  const { activeSection } = state;
  const [collapsed, setCollapsed] = useState(true);

  const width = collapsed ? 64 : 208;

  return (
    <GlassSurface
      radius="xl"
      className="cima-sidebar-rail"
      style={{ margin: '12px 0 12px 12px', width, padding: collapsed ? '18px 0' : '18px 14px' }}
    >
      {/* Collapse handle — the circular bulge from the reference layout */}
      <button
        type="button"
        className="cima-sidebar-handle cima-focusable"
        onClick={() => setCollapsed((c) => !c)}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>

      {/* Logo mark */}
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          border: '1px solid var(--cima-border-strong)',
          background: 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.14), rgba(255,255,255,0.02))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
        title="CIMA OS"
      >
        <Sparkles size={14} strokeWidth={1.75} color="var(--cima-text-primary)" />
      </div>

      {/* Navigation */}
      <nav
        style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1, width: '100%', alignItems: collapsed ? 'center' : 'stretch' }}
        role="navigation"
        aria-label="Main navigation"
      >
        {NAV_SECTIONS.map((section) => {
          const Icon = section.icon;
          const isActive = activeSection === section.id;
          return (
            <button
              key={section.id}
              className="cima-focusable cima-nav-item"
              onClick={() => navigate(section.id)}
              aria-current={isActive ? 'page' : undefined}
              title={collapsed ? section.label : undefined}
              style={{
                width: collapsed ? 38 : '100%',
                height: collapsed ? 38 : undefined,
                justifyContent: collapsed ? 'center' : 'flex-start',
                padding: collapsed ? 0 : '8px 10px',
                borderRadius: collapsed ? '50%' : 'var(--radius-sm)',
              }}
            >
              <Icon size={14} strokeWidth={1.75} style={{ flexShrink: 0 }} />
              {!collapsed && <span style={{ flex: 1, lineHeight: 1, textAlign: 'left' }}>{section.label}</span>}
              {!collapsed && <span className="cima-nav-dot" aria-hidden="true" />}
            </button>
          );
        })}
      </nav>

      {/* Bottom status avatar — single circle, matches the reference exactly */}
      <div
        title="Core operational"
        style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          flexShrink: 0,
          background: 'var(--cima-surface-1)',
          border: '1px solid var(--cima-border-strong)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <StatusIndicator color="var(--cima-text-primary)" pulse size={7} />
      </div>
    </GlassSurface>
  );
}
