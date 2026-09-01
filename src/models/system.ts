import type { CSSProperties, ComponentType } from 'react';

export type SystemComponentStatus = 'operational' | 'ready' | 'standby';

export interface SystemComponent {
  id: string;
  name: string;
  status: SystemComponentStatus;
}

export interface NavSection {
  id: string;
  label: string;
  icon: ComponentType<{ size?: number | string; strokeWidth?: number | string; style?: CSSProperties; className?: string }>;
  /** true = placeholder only, not built yet */
  structural: boolean;
}

// Future structures reserved for AI expansion (Paso 1+):
// KnowledgeItem, Decision, Lesson, Experiment — intentionally not built yet.
