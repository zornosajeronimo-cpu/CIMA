import {
  Compass,
  BookOpen,
  Users,
  Layers,
  Search,
  TrendingUp,
  GitBranch,
  Lightbulb,
  FlaskConical,
  Archive,
} from 'lucide-react';
import type { NavSection, SystemComponent } from '@/models';

export const NAV_SECTIONS: NavSection[] = [
  { id: 'overview',     label: 'Overview',     icon: Compass,       structural: false },
  { id: 'knowledge',    label: 'Knowledge',    icon: BookOpen,      structural: true  },
  { id: 'clients',      label: 'Clients',      icon: Users,         structural: false },
  { id: 'systems',      label: 'Systems',      icon: Layers,        structural: true  },
  { id: 'research',     label: 'Research',     icon: Search,        structural: true  },
  { id: 'sales',        label: 'Sales',        icon: TrendingUp,    structural: true  },
  { id: 'decisions',    label: 'Decisions',    icon: GitBranch,     structural: true  },
  { id: 'lessons',      label: 'Lessons',      icon: Lightbulb,     structural: true  },
  { id: 'experiments',  label: 'Experiments',  icon: FlaskConical,  structural: true  },
  { id: 'archive',      label: 'Archive',      icon: Archive,       structural: true  },
];

export const SYSTEM_STATUS: SystemComponent[] = [
  { id: 'core',        name: 'CIMA Core',   status: 'operational' },
  { id: 'knowledge',   name: 'Knowledge',   status: 'ready'       },
  { id: 'agents',      name: 'Agents',      status: 'standby'     },
  { id: 'automations', name: 'Automations', status: 'ready'       },
];

export const STATUS_META: Record<string, { color: string; label?: string }> = {
  operational:   { color: 'var(--cima-accent)',         label: 'Operational' },
  ready:         { color: 'var(--cima-accent)',         label: 'Ready'       },
  standby:       { color: 'var(--cima-text-tertiary)',  label: 'Standby'     },
  'On track':    { color: 'var(--cima-accent)'  },
  'Needs input': { color: 'var(--cima-amber)'   },
  'Blocked':     { color: 'var(--cima-red)'     },
};
