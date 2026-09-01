import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { useApp } from '@/state/AppContext';
import { NAV_SECTIONS } from '@/lib/nav';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { CommandCenter } from '@/components/command/CommandCenter';
import { GlassSurface } from '@/components/ui/GlassSurface';
import type { NavSection } from '@/models';

// Import feature views
import { KnowledgeView } from '@/features/knowledge/KnowledgeView';
import { ClientsView } from '@/features/clients/ClientsView';
import { ResearchView } from '@/features/research/ResearchView';
import { SalesView } from '@/features/sales/SalesView';
import { DecisionsView } from '@/features/decisions/DecisionsView';
import { LessonsView } from '@/features/lessons/LessonsView';
import { ExperimentsView } from '@/features/experiments/ExperimentsView';
import { SystemsView } from '@/features/systems/SystemsView';
import { AutomationsView } from '@/features/automations/AutomationsView';
import { AgentsView } from '@/features/agents/AgentsView';

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
      <GlassSurface radius="lg" style={{ padding: '36px 32px' }}>
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
        <h2 className="cima-display" style={{ fontSize: 20, margin: '0 0 10px' }}>
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
          className="cima-focusable cima-btn-ghost"
          style={{ marginTop: 22, display: 'inline-flex', alignItems: 'center', gap: 6 }}
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
  const { activeSection } = state;

  const activeNavSection = NAV_SECTIONS.find((s) => s.id === activeSection) ?? NAV_SECTIONS[0];

  // Resolve content
  let content: React.ReactNode;

  switch (activeSection) {
    case 'overview':
      content = <CommandCenter />;
      break;
    case 'knowledge':
      content = <KnowledgeView />;
      break;
    case 'clients':
      content = <ClientsView />;
      break;
    case 'research':
      content = <ResearchView />;
      break;
    case 'sales':
      content = <SalesView />;
      break;
    case 'decisions':
      content = <DecisionsView />;
      break;
    case 'lessons':
      content = <LessonsView />;
      break;
    case 'experiments':
      content = <ExperimentsView />;
      break;
    case 'systems':
      content = <SystemsView />;
      break;
    case 'automations':
      content = <AutomationsView />;
      break;
    case 'agents':
      content = <AgentsView />;
      break;
    default:
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
