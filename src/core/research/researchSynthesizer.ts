// ============================================================
// Research Synthesizer — Segunda capa del Agente Investigador
//
// Toma el contenido crudo de Tavily y lo pasa por la IA para
// obtener un análisis profundo de nivel consultor experto.
// Completamente agnóstico al proveedor (Gemini, Claude, etc.)
// ============================================================

import type { TavilySearchResponse } from './tavilyClient';
import type { ResearchProfile } from './researchAgent';
import { activeProvider } from '@/core/ai/factory';

export interface SynthesisResult {
  profile: ResearchProfile;
  rawAnalysis: string;
  synthesizedByAI: boolean;
  modelId: string;
  latencyMs: number;
}

// ---------------------------------------------------------------------------
// Prompt del analista experto
// ---------------------------------------------------------------------------

function buildSynthesisPrompt(
  companyName: string,
  mainSearch: TavilySearchResponse,
  contactSearch: TavilySearchResponse,
  techSearch: TavilySearchResponse,
): string {
  const rawContent = [
    mainSearch.answer ? `RESPUESTA RESUMIDA DE BÚSQUEDA:\n${mainSearch.answer}` : '',
    '\n\nCONTENIDO DE PÁGINAS WEB ENCONTRADAS (PRINCIPAL):',
    ...mainSearch.results.map((r, i) =>
      `\n[Fuente ${i + 1}] ${r.title}\nURL: ${r.url}\n${r.content}`
    ),
    contactSearch.results.length > 0
      ? '\n\nCONTACTOS Y PERSONAS MENCIONADAS:\n' +
        contactSearch.results.map(r => r.content).join('\n')
      : '',
    techSearch.results.length > 0
      ? '\n\nTECNOLOGÍA, OPERACIONES Y RETOS:\n' +
        techSearch.results.map(r => r.content).join('\n')
      : '',
  ].filter(Boolean).join('\n');

  return `
Eres un analista estratégico de negocios e inteligencia competitiva de nivel senior, especializado en el mercado colombiano y latinoamericano.

Tu tarea es leer el siguiente contenido web encontrado sobre la empresa "${companyName}" y producir un análisis PROFUNDO, DETALLADO y ACCIONABLE, como si lo hiciera un consultor que conoce a fondo el sector.

IMPORTANTE: NO inventes datos. Si no encuentras la información, indícalo honestamente. Sé específico y técnico cuando el sector lo permita. Prioriza la profundidad sobre la brevedad.

---
${rawContent}
---

Devuelve un objeto JSON con EXACTAMENTE este esquema (sin markdown, solo JSON puro):

{
  "companyName": "nombre oficial de la empresa",
  "description": "Descripción profunda de 3-5 párrafos. Explica cómo opera, su modelo de negocio, su proceso productivo o de servicio, y su posición en la cadena de valor de su sector. Sé técnico y específico.",
  "executiveSummary": "Párrafo ejecutivo de 120-200 palabras que capture la esencia estratégica del negocio: qué problema resuelve, para quién, cómo lo resuelve y cuál es su ventaja competitiva.",
  "industry": "Industria o sector específico (ej: Agroindustria de propagación vegetal, Logística de última milla, EdTech B2B)",
  "location": "Ciudad, Departamento (Colombia)",
  "estimatedSize": "micro|pyme|mediana|grande",
  "estimatedSizeDetail": "Descripción del tamaño: infraestructura conocida, capacidad estimada, cantidad de empleados si se menciona",
  "painPoints": [
    "Dolor operativo específico 1 con su explicación técnica",
    "Dolor operativo específico 2",
    "Dolor operativo específico 3"
  ],
  "opportunities": [
    "Oportunidad concreta de digitalización/IA/automatización con nombre de tecnología o metodología específica",
    "Oportunidad 2",
    "Oportunidad 3"
  ],
  "keyPeople": [
    "Nombre o rol estructural identificado"
  ],
  "sources": [
    "url1",
    "url2"
  ],
  "conclusion": "Párrafo final de 80-120 palabras que cierre el análisis con una recomendación estratégica clara: ¿qué hace diferente a esta empresa? ¿cuál es su riesgo principal? ¿cuál es el ángulo de entrada más valioso para nosotros como consultores de IA?"
}
`;
}

// ---------------------------------------------------------------------------
// Sintetizador principal
// ---------------------------------------------------------------------------

export async function synthesizeResearch(
  companyName: string,
  mainSearch: TavilySearchResponse,
  contactSearch: TavilySearchResponse,
  techSearch: TavilySearchResponse,
): Promise<SynthesisResult> {
  const startMs = Date.now();

  const synthesisPrompt = buildSynthesisPrompt(companyName, mainSearch, contactSearch, techSearch);

  try {
    // Llamamos al proveedor activo (Gemini o Claude) con un request especial de síntesis
    // Usamos el campo systemPrompt para sobreescribir el system prompt estándar de CIMA
    const aiResponse = await activeProvider.process({
      commandText: `Analiza la empresa "${companyName}" con el contenido web provisto en el system prompt.`,
      context: {},
      availableTools: [],
      systemPrompt: synthesisPrompt,
    });

    // Gemini, al pasarle responseMimeType: application/json, devuelve el JSON parseado directamente
    // como las propiedades del objeto aiResponse, no como texto en aiResponse.analysis.
    const rawText = aiResponse.analysis ?? aiResponse.message ?? '';

    let parsed: Partial<ResearchProfile & {
      estimatedSizeDetail?: string;
      conclusion?: string;
    }>;

    // Si rawText está vacío pero aiResponse tiene companyName o description,
    // significa que el provider nos devolvió el objeto ya parseado.
    if (!rawText && (aiResponse as any).companyName) {
      parsed = aiResponse as any;
    } else {
      try {
        const cleaned = rawText.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
        parsed = JSON.parse(cleaned);
      } catch {
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('La IA no devolvió un JSON válido en la síntesis.');
        }
      }
    }

    const profile: ResearchProfile = {
      companyName: parsed.companyName ?? companyName,
      description: parsed.description ?? rawText,
      executiveSummary: parsed.executiveSummary ?? parsed.description ?? rawText.slice(0, 300),
      industry: parsed.industry ?? 'Por determinar',
      location: parsed.location ?? 'Colombia',
      estimatedSize: (parsed.estimatedSize as ResearchProfile['estimatedSize']) ?? 'desconocido',
      painPoints: parsed.painPoints ?? [],
      opportunities: parsed.opportunities ?? [],
      keyPeople: parsed.keyPeople ?? [],
      sources: parsed.sources ?? mainSearch.results.map(r => r.url),
    };

    return {
      profile,
      rawAnalysis: rawText,
      synthesizedByAI: true,
      modelId: aiResponse.meta?.modelId ?? activeProvider.id,
      latencyMs: Date.now() - startMs,
    };

  } catch (err) {
    // Fallback: retornar perfil básico heurístico si la síntesis falla
    console.warn('[CIMA ResearchSynthesizer] Síntesis IA falló, usando extracción heurística:', err);

    const fallbackSummary = mainSearch.answer
      ?? mainSearch.results[0]?.content?.slice(0, 400)
      ?? `Empresa: ${companyName}`;

    return {
      profile: {
        companyName,
        description: fallbackSummary,
        executiveSummary: fallbackSummary,
        industry: 'Por determinar',
        location: 'Colombia',
        estimatedSize: 'desconocido',
        painPoints: ['Necesidades a confirmar en reunión inicial'],
        opportunities: [
          'Automatización de procesos internos',
          'Implementación de IA para eficiencia operativa',
        ],
        keyPeople: [],
        sources: mainSearch.results.map(r => r.url),
      },
      rawAnalysis: fallbackSummary,
      synthesizedByAI: false,
      modelId: 'fallback-heuristic',
      latencyMs: Date.now() - startMs,
    };
  }
}
