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

export type BusinessSystemStatus = 'Concept' | 'Design' | 'Build' | 'Live' | 'Paused';
export interface BusinessSystemComponent {
  name: string;
  type: 'whatsapp' | 'crm' | 'database' | 'ai' | 'dashboard' | 'notification' | 'api' | 'automation' | 'other';
}
export interface BusinessSystem {
  id: string;
  name: string;
  description: string;
  clientId?: string;
  status: BusinessSystemStatus;
  components: BusinessSystemComponent[];
  createdAt: string;
  updatedAt: string;
}
