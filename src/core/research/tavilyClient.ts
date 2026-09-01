// ============================================================
// Tavily Search Client — Motor de búsqueda web para el Agente Investigador
// Permite que CIMA salga a internet a investigar clientes, mercados y competidores
// ============================================================

export interface TavilySearchResult {
  title: string;
  url: string;
  content: string;
  score: number;
  publishedDate?: string;
}

export interface TavilySearchResponse {
  query: string;
  results: TavilySearchResult[];
  answer?: string;        // Respuesta resumida de Tavily (si está disponible)
  responseTime: number;
}

export interface TavilySearchOptions {
  searchDepth?: 'basic' | 'advanced';
  maxResults?: number;
  includeAnswer?: boolean;
  includeDomains?: string[];
  excludeDomains?: string[];
  topic?: 'general' | 'news';
}

class TavilyClient {
  private apiKey: string;
  private baseUrl = 'https://api.tavily.com/search';

  constructor() {
    this.apiKey = import.meta.env.VITE_TAVILY_API_KEY ?? '';
  }

  get isConfigured(): boolean {
    return this.apiKey.trim().length > 0;
  }

  async search(query: string, options: TavilySearchOptions = {}): Promise<TavilySearchResponse> {
    if (!this.isConfigured) {
      throw new Error('VITE_TAVILY_API_KEY no está configurada en el entorno.');
    }

    const startMs = Date.now();

    const body = {
      api_key: this.apiKey,
      query,
      search_depth: options.searchDepth ?? 'basic',
      max_results: options.maxResults ?? 5,
      include_answer: options.includeAnswer ?? true,
      include_domains: options.includeDomains ?? [],
      exclude_domains: options.excludeDomains ?? [],
      topic: options.topic ?? 'general',
    };

    const res = await fetch(this.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(15000)
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Error de Tavily API: ${res.status} ${res.statusText} — ${errorText}`);
    }

    const data = await res.json();

    return {
      query,
      results: (data.results ?? []).map((r: Record<string, unknown>) => ({
        title: r.title as string,
        url: r.url as string,
        content: r.content as string,
        score: r.score as number,
        publishedDate: r.published_date as string | undefined,
      })),
      answer: data.answer as string | undefined,
      responseTime: Date.now() - startMs,
    };
  }

  /** Búsqueda especializada para investigar una empresa */
  async researchCompany(companyName: string, location?: string): Promise<TavilySearchResponse> {
    const locationHint = location ? ` ${location}` : '';
    // Query más profunda enfocada en operaciones, clientes y portafolio
    const query = `empresa "${companyName}"${locationHint} "quiénes somos" OR "servicios" OR "productos" OR "clientes" OR "historia"`;
    return this.search(query, {
      searchDepth: 'advanced',
      maxResults: 10,
      includeAnswer: true,
    });
  }

  /** Búsqueda de noticias recientes sobre una empresa o persona */
  async searchNews(topic: string): Promise<TavilySearchResponse> {
    return this.search(topic, {
      searchDepth: 'basic',
      maxResults: 6,
      includeAnswer: true,
      topic: 'news',
    });
  }

  /** Busca contactos clave de una empresa */
  async findContacts(companyName: string): Promise<TavilySearchResponse> {
    const query = `"${companyName}" (LinkedIn OR directorio) (CEO OR Gerente OR Fundador OR Director OR Comercial)`;
    return this.search(query, { searchDepth: 'advanced', maxResults: 5 });
  }

  /** Investigación de mercado y competencia */
  async marketResearch(industry: string, region?: string): Promise<TavilySearchResponse> {
    const regionHint = region ? ` en ${region}` : '';
    const query = `análisis de mercado "${industry}"${regionHint} tendencias tecnología competidores retos 2024 2025`;
    return this.search(query, { searchDepth: 'advanced', maxResults: 8, includeAnswer: true });
  }
}

// Singleton exportado
export const tavilyClient = new TavilyClient();
