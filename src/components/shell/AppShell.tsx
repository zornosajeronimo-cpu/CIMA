import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { useApp } from '@/state/AppContext';
import { NAV_SECTIONS } from '@/lib/nav';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { CommandCenter } from '@/components/command/CommandCenter';
import { ClientView } from '@/components/clients/ClientView';
import { GlassSurface } from '@/components/ui/GlassSurface';
import type { NavSection } from '@/models';

// ---------------------------------------------------------------------------
// Structural placeholder for sections not yet built
// ---------------------------------------------------------------------------

function StructuralPlaceholder({ section }: { section: NavSection }) {
  const { navigate } = useApp();
  return (
    <div
      className="cima-fade-in"
      style={{ maxWidth: 680, margin: '0 auto', padding: '64px 28px' }}
    >
      <GlassSurface style={{ padding: '36px 32px' }}>
        <div
          className="cima-mono"
          style={{
            fontSize: 10,
            color: 'var(--cima-text-tertiary)',
            marginBottom: 10,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          Structural — not yet built
        </div>
        <h2
          style={{ fontSize: 19, fontWeight: 600, margin: '0 0 10px', letterSpacing: '-0.015em' }}
        >
          {section.label}
        </h2>
        <p
          style={{
            fontSize: 13.5,
            color: 'var(--cima-text-secondary)',
            lineHeight: 1.65,
            maxWidth: 460,
            margin: 0,
          }}
        >
          This module is reserved in CIMA OS's information architecture. Its interface and
          logic will be designed in a later step — Paso 0 establishes only where it lives.
        </p>
        <button
          onClick={() => navigate('overview')}
          className="cima-focusable"
          style={{
            marginTop: 22,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: 'transparent',
            border: '1px solid var(--cima-border-strong)',
            color: 'var(--cima-text-primary)',
            borderRadius: 999,
            padding: '7px 16px',
            fontSize: 12,
            cursor: 'pointer',
            transition: 'background 160ms var(--ease-quiet)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--cima-surface-2)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          Back to Overview <ArrowUpRight size={12} />
        </button>
      </GlassSurface>
    </div>
  );
}

// ---------------------------------------------------------------------------
// AppShell — root layout: sidebar + topbar + content
// ---------------------------------------------------------------------------

export function AppShell() {
  const { state } = useApp();
  const { activeSection, selectedClientId, clients } = state;

  const activeNavSection = NAV_SECTIONS.find((s) => s.id === activeSection) ?? NAV_SECTIONS[0];

  // Resolve content
  let content: React.ReactNode;

  // If a client is selected anywhere, show its detail view
  if (selectedClientId) {
    const client = clients.find((c) => c.id === selectedClientId);
    content = client ? <ClientView client={client} /> : <CommandCenter />;
  } else if (activeSection === 'overview') {
    content = <CommandCenter />;
  } else {
    // All other sections are structural for now
    content = <StructuralPlaceholder section={activeNavSection} />;
  }

  return (
    <div className="cima-root">
      <Sidebar />
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          overflow: 'hidden',
        }}
      >
        <TopBar />
        <div className="cima-scroll" style={{ flex: 1, overflowY: 'auto' }}>
          {content}
        </div>
      </div>
    </div>
  );
}
