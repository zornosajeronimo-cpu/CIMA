import type { AppState } from '@/state/reducer';

export interface SearchResult {
  type: 'client' | 'knowledge' | 'research' | 'lesson' | 'decision' | 'task' | 'opportunity';
  id: string;
  title: string;
  subtitle?: string;
  sectionId: string;
}

export function globalSearch(query: string, state: AppState): SearchResult[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase();
  const results: SearchResult[] = [];

  state.clients.forEach(c => {
    if (c.name.toLowerCase().includes(q) || c.nextAction.toLowerCase().includes(q)) {
      results.push({ type: 'client', id: c.id, title: c.name, subtitle: c.stage, sectionId: 'clients' });
    }
  });
  state.knowledge.forEach(k => {
    if (k.title.toLowerCase().includes(q) || k.content.toLowerCase().includes(q)) {
      results.push({ type: 'knowledge', id: k.id, title: k.title, subtitle: k.category, sectionId: 'knowledge' });
    }
  });
  state.research.forEach(r => {
    if (r.question.toLowerCase().includes(q) || r.finding.toLowerCase().includes(q)) {
      results.push({ type: 'research', id: r.id, title: r.question, subtitle: r.relevance, sectionId: 'research' });
    }
  });
  state.lessons.forEach(l => {
    if (l.title.toLowerCase().includes(q) || l.learning.toLowerCase().includes(q)) {
      results.push({ type: 'lesson', id: l.id, title: l.title, subtitle: l.learning.slice(0, 60), sectionId: 'lessons' });
    }
  });
  state.decisions.forEach(d => {
    if (d.problem.toLowerCase().includes(q) || d.decision.toLowerCase().includes(q)) {
      results.push({ type: 'decision', id: d.id, title: d.problem, subtitle: d.decision.slice(0, 60), sectionId: 'decisions' });
    }
  });
  state.tasks.forEach(t => {
    if (t.title.toLowerCase().includes(q)) {
      results.push({ type: 'task', id: t.id, title: t.title, subtitle: t.status, sectionId: 'overview' });
    }
  });
  state.opportunities.forEach(o => {
    if (o.company.toLowerCase().includes(q)) {
      results.push({ type: 'opportunity', id: o.id, title: o.company, subtitle: o.stage, sectionId: 'sales' });
    }
  });

  return results.slice(0, 20);
}
