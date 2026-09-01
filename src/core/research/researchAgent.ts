// ============================================================
// Agente Investigador — El primer agente especializado de CIMA
//
// Flujo:
//   Comando → Investigar empresa
//     → Tavily Search (web real) — 2 búsquedas en paralelo
//     → ResearchSynthesizer (IA) — análisis profundo de nivel consultor
//     → CIMA guarda en Client + ResearchEntry + KnowledgeItems
//
// El Agente Investigador NO es llamado directamente por la UI.
// El AI Brain lo invoca al detectar el intent RESEARCH_*.
// ============================================================

import { tavilyClient } from './tavilyClient';
import { synthesizeResearch } from './researchSynthesizer';
import type { AppState } from '@/state/reducer';
import type { Client, ResearchEntry, KnowledgeItem } from '@/models';

const uid = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
const now = () => new Date().toISOString();

// ---------------------------------------------------------------------------
// Tipos de resultado del Agente
// ---------------------------------------------------------------------------

export interface ResearchProfile {
  /** Nombre normalizado de la empresa */
  companyName: string;
  /** Descripción profunda (generada por IA) */
  description: string;
  /** Resumen ejecutivo corto para mostrar en tarjetas */
  executiveSummary: string;
  /** Sector o industria */
  industry: string;
  /** País o ciudad estimada */
  location: string;
  /** Tamaño estimado (startup / pyme / enterprise) */
  estimatedSize: 'micro' | 'pyme' | 'mediana' | 'grande' | 'desconocido';
  /** Posibles dolores o necesidades identificados */
  painPoints: string[];
  /** Oportunidades detectadas */
  opportunities: string[];
  /** Personas clave o contactos mencionados */
  keyPeople: string[];
  /** URLs relevantes encontradas */
  sources: string[];
}

export interface AgentResearchResult {
  profile: ResearchProfile;
  /** Lista de acciones de estado para despachar al AppReducer */
  stateUpdates: {
    client?: Partial<Client>;
    researchEntry?: ResearchEntry;
    knowledgeItems?: KnowledgeItem[];
  };
  /** Métricas de la ejecución del agente */
  meta: {
    searchQueries: string[];
    totalResults: number;
    researchTimeMs: number;
    tavilyAnswer?: string;
  };
}

// ---------------------------------------------------------------------------
// Agente Principal
// ---------------------------------------------------------------------------

export class ResearchAgent {
  readonly id = 'research-agent';
  readonly name = 'Agente Investigador';

  /**
   * Investiga una empresa desde cero usando búsqueda web real + síntesis IA.
   * Retorna un perfil estructurado de nivel consultor y las actualizaciones de estado sugeridas.
   */
  async investigateCompany(
    companyName: string,
    state: AppState,
    options: { createIfNew?: boolean; location?: string } = {},
  ): Promise<AgentResearchResult> {
    const startMs = Date.now();
    const searchQueries: string[] = [];

    // 1. Búsqueda principal sobre la empresa
    const companyQuery = `empresa "${companyName}"${options.location ? ` ${options.location}` : ''}`;
    searchQueries.push(companyQuery);

    // 2. Búsquedas en paralelo para reducir latencia y cubrir más terreno
    searchQueries.push(`${companyName} CEO fundador contacto`);
    searchQueries.push(`${companyName} tecnología software operaciones`);
    
    const [mainSearch, contactSearch, techSearch] = await Promise.all([
      tavilyClient.researchCompany(companyName, options.location),
      tavilyClient.findContacts(companyName),
      tavilyClient.search(`${companyName} (tecnología OR software OR operaciones OR logística OR retos)`, { searchDepth: 'basic', maxResults: 4 }),
    ]);

    // 3. Síntesis IA — convierte contenido crudo en análisis profundo de nivel consultor
    const synthesis = await synthesizeResearch(companyName, mainSearch, contactSearch, techSearch);
    const profile = synthesis.profile;

    // 4. Buscar cliente existente
    const existingClient = state.clients.find(
      c => (c.name || '').toLowerCase().includes(companyName.toLowerCase())
    );

    // 5. Construir los objetos de estado

    // ResearchEntry — documento formal de la investigación
    const researchEntry: ResearchEntry = {
      id: uid('res'),
      question: `¿Quién es ${companyName} y cómo podemos ayudarles?`,
      finding: [
        `## Resumen Ejecutivo\n${profile.executiveSummary}`,
        `## Descripción\n${profile.description}`,
        `## Tamaño Estimado\n${profile.estimatedSize}`,
        `## Personas Clave\n${profile.keyPeople.length > 0 ? profile.keyPeople.join(', ') : 'No identificadas'}`,
        `## Dolores / Necesidades\n${profile.painPoints.map(p => `- ${p}`).join('\n')}`,
        `## Oportunidades\n${profile.opportunities.map(o => `- ${o}`).join('\n')}`,
        `## Fuentes Web\n${profile.sources.map(s => `- ${s}`).join('\n')}`,
      ].join('\n\n'),
      conclusion: profile.executiveSummary,
      relevance: 'high',
      tags: ['investigación', 'prospecto', profile.estimatedSize],
      clientId: existingClient?.id,
      createdAt: now(),
      updatedAt: now(),
    };

    // KnowledgeItems — hechos rápidos para el motor de contexto
    const knowledgeItems: KnowledgeItem[] = [
      {
        id: uid('kn'),
        title: `${companyName} — Resumen ejecutivo`,
        content: profile.executiveSummary,
        category: 'client',
        important: true,
        tags: ['empresa', companyName.toLowerCase()],
        clientId: existingClient?.id,
        createdAt: now(),
        updatedAt: now(),
      },
      ...(profile.painPoints.length > 0 ? [{
        id: uid('kn'),
        title: `${companyName} — Dolores identificados`,
        content: profile.painPoints.join('\n- '),
        category: 'client' as const,
        important: false,
        tags: ['dolores', companyName.toLowerCase()],
        clientId: existingClient?.id,
        createdAt: now(),
        updatedAt: now(),
      }] : []),
    ];

    // Actualización parcial del cliente si existe, o propuesta de creación
    const clientUpdate: Client | undefined = existingClient
      ? {
          ...existingClient,
          notes: [
            existingClient.notes ?? '',
            `\n\n[Investigación automática ${new Date().toLocaleDateString('es-CO')}]`,
            profile.executiveSummary,
          ].join(''),
          updatedAt: now(),
        }
      : options.createIfNew
      ? {
          id: uid('client'),
          name: profile.companyName,
          stage: 'Discovery',
          status: 'On track',
          nextAction: 'Primer contacto',
          notes: profile.executiveSummary,
          createdAt: now(),
          updatedAt: now(),
        }
      : undefined;

    return {
      profile,
      stateUpdates: {
        client: clientUpdate,
        researchEntry,
        knowledgeItems,
      },
      meta: {
        searchQueries,
        totalResults: mainSearch.results.length + contactSearch.results.length,
        researchTimeMs: Date.now() - startMs,
        tavilyAnswer: mainSearch.answer,
      },
    };
  }

  /**
   * Busca noticias recientes sobre un tema o empresa
   */
  async searchLatestNews(topic: string): Promise<{ summary: string; sources: string[] }> {
    const newsResult = await tavilyClient.searchNews(topic);
    const summary = newsResult.answer
      ?? newsResult.results.map(r => `• ${r.title}: ${r.content.slice(0, 120)}`).join('\n');
    const sources = newsResult.results.map(r => r.url);
    return { summary, sources };
  }

  /**
   * Hace una investigación de mercado sobre una industria
   */
  async analyzeMarket(industry: string, region = 'Colombia'): Promise<{ summary: string; sources: string[] }> {
    const result = await tavilyClient.marketResearch(industry, region);
    const summary = result.answer
      ?? result.results.map(r => `• ${r.title}: ${r.content.slice(0, 120)}`).join('\n');
    const sources = result.results.map(r => r.url);
    return { summary, sources };
  }
}

// Singleton exportado
export const researchAgent = new ResearchAgent();
