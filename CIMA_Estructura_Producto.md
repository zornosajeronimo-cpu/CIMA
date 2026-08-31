# CIMA — Hotel OS
## Estructura final del producto

> El sistema operativo inteligente del huésped: un recepcionista digital que conoce a cada huésped, y un cerebro operacional que usa ese conocimiento para hacer al hotel más rentable — empezando por Villa de Leyva.

---

## 1. Arquitectura general

```
                     CIMA
                      │
              ┌───────┴───────┐
              │               │
        GUEST BRAIN      HOTEL BRAIN
              │               │
   Contexto / Historial   Ocupación / Inventario
   Preferencias            Reglas de precio / upsell
   Intención               Benchmarking (fase 2+)
              │               │
              └───────┬───────┘
                       │
               DECISION ENGINE
                       │
               NEXT BEST ACTION
                       │
              HUÉSPED  +  HOTEL
```

**Guest Brain**: entiende quién es el huésped, qué ha comprado, qué prefiere, cuándo suele viajar y qué nivel de satisfacción tiene. Determina cómo debe ser atendido.

**Hotel Brain**: en el MVP es *visibilidad operativa en tiempo real* (quién llega, quién es recurrente, quién tiene alta probabilidad de upsell por reglas simples) — **no** "patrones descubiertos por IA". Ese nivel solo se activa de forma honesta cuando hay volumen real de datos (fase 2+, ver más abajo).

**Decision Engine**: cruza ambos cerebros y decide la siguiente mejor acción — responder, ofrecer, escalar a humano, o alertar al hotel.

---

## 2. Los dos modelos de operación

| | **Copiloto** | **Autopiloto** |
|---|---|---|
| Qué hace | CIMA sugiere la respuesta; el dueño/staff revisa y envía | CIMA responde, cotiza y cierra de forma autónoma 24/7 |
| Para quién | Hoteles boutique pequeños (6-12 hab.) donde el dueño no está listo para soltar el control del WhatsApp | Hoteles con más volumen o menos disponibilidad de staff para atender de noche/fin de semana |
| Escalamiento a humano | Constante (todo pasa por revisión) | Solo en casos ambiguos, quejas, o reservas de alto valor |
| Rol comercial | Puerta de entrada de bajo riesgo — construye confianza | El producto de mayor retorno, una vez hay confianza |

Ambos comparten la misma base técnica; la diferencia es el nivel de autonomía que el hotel activa. El hotel puede migrar de Copiloto a Autopiloto sin cambiar de sistema.

---

## 3. Escalera de módulos (land-and-expand)

En vez de vender "el sistema completo" desde el día uno, el producto se activa en escalones — cada uno es una decisión pequeña y fácil de aceptar:

1. **Módulo gratuito — Respuestas automáticas.** Las 5 preguntas más frecuentes (disponibilidad, precio, mascotas, parqueadero, cómo llegar). Cero riesgo, instalación en un día.
2. **Recuperación de reservas.** Detecta conversaciones enfriadas y hace seguimiento automático 24-48h después.
3. **Upsell conversacional.** Activa las tres ventanas de venta (ver sección 5).
4. **Autopiloto completo.** Cierre de reservas y upsell sin intervención humana.
5. **Benchmarking (fase 2, requiere 5-8 hoteles activos).** "Tu tasa de upsell está en X%, el promedio de hoteles similares en Villa de Leyva es Y%."
6. **Red de desborde entre pueblos (fase 3, requiere expansión multi-pueblo).** Cuando un hotel está lleno, el huésped se ofrece a un hotel aliado en **otro** pueblo patrimonio (nunca dentro del mismo pueblo, para no generar conflicto de competencia directa) y el hotel de origen recibe comisión de referido.
7. **Capa de comercio turístico.** Tours, spas y restaurantes locales pagan comisión por reservas generadas vía CIMA — igual que ya le pagan hoy a agencias.

---

## 4. Requisitos técnicos no negociables

- **WhatsApp Business API oficial** (no la app gratuita) — es lo único que permite automatización real, múltiples agentes y pagos integrados.
- **Integración con el inventario real del hotel.** Si no lee disponibilidad real (PMS o, en el MVP, una hoja estructurada tipo "PMS pobre"), todo lo demás es teatro — alguien tiene que actualizar a mano y el sistema empieza a mentir.
- **Memoria del huésped en capas**, no todo permanente:
 - *Sesión*: "estoy preguntando por este fin de semana."
 - *Estancia*: "estoy hospedado actualmente."
 - *Perfil*: preferencias declaradas (vista, ubicación, etc.)
 - *Historial*: número de estadías, gasto total.
 - *Preferencias*: viaja en pareja / familia / solo.
 - *Sensibilidad*: incidencias pasadas que requieren atención prioritaria.
- **Transición fluida a humano** con contexto completo — el agente humano nunca debe pedirle al huésped que se repita.

---

## 5. El mecanismo real de upsell (no es magia de IA, es timing)

| Momento | Acción | Por qué funciona |
|---|---|---|
| 48h antes de llegada | Una sola oferta relevante al perfil ya declarado (pareja → cena romántica; familia → actividad infantil) | Una oferta, no catálogo — el catálogo mata la conversión |
| Día 1, tras check-in | Recomendación local con link de pago directo (tour, cabalgata, viñedo) | Venta de impulso; aquí se cierra la mayoría del upsell real |
| Check-out −1 día | Oferta de extender una noche si hay disponibilidad | El huésped ya está satisfecho — es la más fácil de cerrar |

---

## 6. KPIs del producto

**Huésped**: tiempo hasta resolver, satisfacción, conversión, recompra, ingreso por huésped.
**Hotel**: ingresos generados por CIMA, upselling, reservas recuperadas, horas ahorradas, precisión de recomendaciones.
**Nunca**: "% de mensajes respondidos por IA" — es una métrica de tecnología, no de negocio.

---

## 7. Roadmap de producto

1. **MVP — Recepcionista inteligente por WhatsApp** (1 hotel piloto en Villa de Leyva): reconocer, responder, recomendar, reservar, recuperar, escalar.
2. **Hotel Brain básico**: visibilidad operativa en tiempo real, reglas simples de priorización.
3. **Benchmarking multi-hotel** (5-8 hoteles en Villa de Leyva).
4. **Red de desborde entre pueblos patrimonio** (expansión geográfica activa).
5. **Capa de comercio turístico local** (monetización de proveedores, no solo hoteles).
