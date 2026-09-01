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
  Bot,
  Zap,
} from 'lucide-react';
import type { NavSection, SystemComponent } from '@/models';

export const NAV_SECTIONS: NavSection[] = [
  { id: 'overview',     label: 'Overview',     icon: Compass,       structural: false },
  { id: 'knowledge',    label: 'Knowledge',    icon: BookOpen,      structural: false },
  { id: 'clients',      label: 'Clients',      icon: Users,         structural: false },
  { id: 'systems',      label: 'Systems',      icon: Layers,        structural: false },
  { id: 'sales',        label: 'Sales',        icon: TrendingUp,    structural: false },
  { id: 'automations',  label: 'Automations',  icon: Zap,           structural: false },
  { id: 'agents',       label: 'Agents',       icon: Bot,           structural: false },
  { id: 'research',     label: 'Research',     icon: Search,        structural: false },
  { id: 'decisions',    label: 'Decisions',    icon: GitBranch,     structural: false },
  { id: 'lessons',      label: 'Lessons',      icon: Lightbulb,     structural: false },
  { id: 'experiments',  label: 'Experiments',  icon: FlaskConical,  structural: false },
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
