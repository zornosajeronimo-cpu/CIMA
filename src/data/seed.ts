import type { Client, Task, Activity } from '@/models';

const NOW = new Date().toISOString();

export const SEED_CLIENTS: Client[] = [
  {
    id: 'plantulas',
    name: 'Plántulas de Colombia',
    stage: 'Discovery',
    status: 'On track',
    nextAction: 'Map operations with the agronomy team',
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: 'plasticpack',
    name: 'Plasticpack',
    stage: 'Solution Design',
    status: 'Needs input',
    nextAction: 'Confirm process scope with plant manager',
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: 'colegio',
    name: 'Colegio',
    stage: 'Discovery',
    status: 'On track',
    nextAction: 'Draft first discovery summary',
    createdAt: NOW,
    updatedAt: NOW,
  },
];

export const SEED_TASKS: Task[] = [
  {
    id: 't1',
    title: 'Plasticpack — solution design review',
    status: 'pending',
    priority: 'high',
    meta: '11:00',
    clientId: 'plasticpack',
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: 't2',
    title: 'Draft Colegio discovery summary',
    status: 'pending',
    priority: 'medium',
    meta: 'Before 3pm',
    clientId: 'colegio',
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: 't3',
    title: 'Read up on context engineering',
    status: 'done',
    priority: 'low',
    meta: 'Ongoing',
    createdAt: NOW,
    updatedAt: NOW,
  },
];

export const SEED_ACTIVITIES: Activity[] = [
  {
    id: 'a1',
    type: 'system',
    label: 'Reviewing Plántulas operations',
    state: 'active',
    timestamp: NOW,
  },
  {
    id: 'a2',
    type: 'system',
    label: 'Preparing Plasticpack discovery notes',
    state: 'active',
    timestamp: NOW,
  },
  {
    id: 'a3',
    type: 'system',
    label: 'Researching agent architecture patterns',
    state: 'queued',
    timestamp: NOW,
  },
  {
    id: 'a4',
    type: 'system',
    label: 'Testing a new coding workflow',
    state: 'queued',
    timestamp: NOW,
  },
];
