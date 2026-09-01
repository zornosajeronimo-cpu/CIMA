import type { Client, Task, Activity, KnowledgeItem, ResearchEntry, Decision, Lesson, Opportunity, BusinessSystem, Automation, Agent } from '@/models';

const NOW = new Date().toISOString();

export const SEED_CLIENTS: Client[] = [
  { id: 'plantulas', name: 'Plántulas de Colombia', stage: 'Discovery', status: 'On track', nextAction: 'Map operations with the agronomy team', createdAt: NOW, updatedAt: NOW },
  { id: 'plasticpack', name: 'Plasticpack', stage: 'Solution Design', status: 'Needs input', nextAction: 'Confirm process scope with plant manager', createdAt: NOW, updatedAt: NOW },
  { id: 'colegio', name: 'Colegio', stage: 'Discovery', status: 'On track', nextAction: 'Draft first discovery summary', createdAt: NOW, updatedAt: NOW },
];

export const SEED_TASKS: Task[] = [
  { id: 't1', title: 'Plasticpack — solution design review', status: 'pending', priority: 'high', meta: '11:00', clientId: 'plasticpack', createdAt: NOW, updatedAt: NOW },
  { id: 't2', title: 'Draft Colegio discovery summary', status: 'pending', priority: 'medium', meta: 'Before 3pm', clientId: 'colegio', createdAt: NOW, updatedAt: NOW },
  { id: 't3', title: 'Read up on context engineering', status: 'done', priority: 'low', meta: 'Ongoing', createdAt: NOW, updatedAt: NOW },
];

export const SEED_ACTIVITIES: Activity[] = [
  { id: 'a1', type: 'system', label: 'Reviewing Plántulas operations', state: 'active', timestamp: NOW },
  { id: 'a2', type: 'system', label: 'Preparing Plasticpack discovery notes', state: 'active', timestamp: NOW },
];

export const SEED_KNOWLEDGE: KnowledgeItem[] = [
  { id: 'k1', title: 'Context Engineering', content: 'Context Engineering is the practice of...', category: 'technical', tags: ['ai'], important: true, createdAt: NOW, updatedAt: NOW },
  { id: 'k2', title: 'Plasticpack Pains', content: 'Plasticpack main pain: complaints not reaching quality team...', category: 'client', clientId: 'plasticpack', tags: ['discovery'], important: true, createdAt: NOW, updatedAt: NOW },
  { id: 'k3', title: 'Plántulas Operations', content: 'Plántulas operations run on WhatsApp + manual spreadsheets...', category: 'client', clientId: 'plantulas', tags: ['discovery'], important: false, createdAt: NOW, updatedAt: NOW },
];

export const SEED_RESEARCH: ResearchEntry[] = [
  { id: 'r1', question: 'How do hotel chatbots handle upsell timing?', finding: 'Best results at check-in day, not weeks before.', relevance: 'high', tags: ['hospitality'], createdAt: NOW, updatedAt: NOW },
];

export const SEED_DECISIONS: Decision[] = [
  { id: 'd1', problem: 'How to price the first client pilot', decision: 'Free for 60 days, in exchange for a case study', reasons: ['Build trust', 'Get real data', 'Create referral anchor'], alternatives: [], expectedOutcome: 'Case study ready', tags: ['pricing'], createdAt: NOW, updatedAt: NOW },
];

export const SEED_LESSONS: Lesson[] = [
  { id: 'l1', title: 'Discovery must happen before solution design', context: 'Jumping to solutions...', learning: 'Jumping to solutions without discovery wastes 2-3x the time.', application: 'Always run discovery', tags: ['process'], createdAt: NOW, updatedAt: NOW },
];

export const SEED_OPPORTUNITIES: Opportunity[] = [
  { id: 'o1', company: 'Plasticpack', stage: 'Proposal', value: 3500000, nextAction: 'Send proposal this week', createdAt: NOW, updatedAt: NOW },
  { id: 'o2', company: 'Colegio San José', stage: 'Discovery', value: 2000000, nextAction: 'Second call pending', createdAt: NOW, updatedAt: NOW },
  { id: 'o3', company: 'Plántulas de Colombia', stage: 'Won', value: 1800000, nextAction: 'Start onboarding', createdAt: NOW, updatedAt: NOW },
];

export const SEED_BUSINESS_SYSTEMS: BusinessSystem[] = [
  { id: 'bs1', name: 'Operational Intelligence', clientId: 'plantulas', status: 'Design', description: '', components: [{ name: 'WhatsApp', type: 'whatsapp' }, { name: 'DB', type: 'database' }, { name: 'AI', type: 'ai' }, { name: 'Dash', type: 'dashboard' }], createdAt: NOW, updatedAt: NOW },
  { id: 'bs2', name: 'Complaints Intelligence', clientId: 'plasticpack', status: 'Build', description: '', components: [{ name: 'WhatsApp', type: 'whatsapp' }, { name: 'CRM', type: 'crm' }, { name: 'AI', type: 'ai' }, { name: 'Notify', type: 'notification' }], createdAt: NOW, updatedAt: NOW },
  { id: 'bs3', name: 'Admissions Automation', clientId: 'colegio', status: 'Concept', description: '', components: [{ name: 'WhatsApp', type: 'whatsapp' }, { name: 'DB', type: 'database' }, { name: 'AI', type: 'ai' }, { name: 'Dash', type: 'dashboard' }], createdAt: NOW, updatedAt: NOW },
];

export const SEED_AUTOMATIONS: Automation[] = [
  { id: 'au1', name: 'New inquiry → create lead', trigger: { type: 'form_submission', description: 'New web form submission' }, actions: [
    { order: 1, tool: 'validateData', description: 'Validate form data', simulated: true },
    { order: 2, tool: 'createLead', description: 'Create opportunity in Sales', simulated: true },
    { order: 3, tool: 'sendNotification', description: 'Send WhatsApp notification', simulated: true },
    { order: 4, tool: 'logActivity', description: 'Log activity in CIMA', simulated: false },
  ], description: '', status: 'draft', conditions: [], createdAt: NOW, updatedAt: NOW },
];

export const SEED_AGENTS: Agent[] = [
  { id: 'ag1', name: 'Research Agent', description: '', goal: 'Find, analyze, and synthesize information from multiple sources', tools: [{name: 'webSearch', description: ''}, {name: 'saveResearch', description: ''}], status: 'idle', contextRequired: [], createdAt: NOW, updatedAt: NOW },
  { id: 'ag2', name: 'Sales Agent', description: '', goal: 'Track opportunities and suggest next best actions', tools: [], status: 'idle', contextRequired: [], createdAt: NOW, updatedAt: NOW },
  { id: 'ag3', name: 'Operations Agent', description: '', goal: 'Monitor client systems and flag anomalies', tools: [], status: 'idle', contextRequired: [], createdAt: NOW, updatedAt: NOW },
  { id: 'ag4', name: 'Builder Agent', description: '', goal: 'Design and scaffold automation workflows', tools: [], status: 'idle', contextRequired: [], createdAt: NOW, updatedAt: NOW },
  { id: 'ag5', name: 'Analyst Agent', description: '', goal: 'Analyze data and generate insights', tools: [], status: 'idle', contextRequired: [], createdAt: NOW, updatedAt: NOW },
];

