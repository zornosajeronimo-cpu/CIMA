# CIMA / Anfitriona — Spec de Producto, Arquitectura y Precios
**Documento de referencia para diseño, construcción (Antigravity) y venta en Villa de Leyva**
Fecha: agosto 2026 · TRM referencia: $3.128 COP/USD (18 ago 2026)

---

## 0. Resumen ejecutivo

CIMA es la plataforma. **Anfitriona** es el agente conversacional que habla con el huésped. El producto es **modular**: tres agentes independientes que se combinan según lo que cada hotel necesita y lo que ya tiene.

- **Módulo 1 — Agente de Texto**: el núcleo, siempre incluido.
- **Módulo 2 — Agente de Voz**: notas de voz en WhatsApp (2A) y, como capa opcional futura, línea telefónica en tiempo real (2B).
- **Módulo 3 — Inteligencia Operacional**: el cerebro que valida disponibilidad, detecta patrones y vigila la reputación. Tiene **dos variantes según si el hotel tiene PMS o no** — y esa es la variable que más mueve el precio.

El costo real de operar esto es 4 a 10 veces menor que lo que agencias colombianas genéricas cobran solo de "mantenimiento" por un bot que no entiende hotelería. Eso deja espacio para un modelo de precio bajo + comisión por resultado que sea sostenible de verdad, no solo bonito en el discurso de venta.

---

## 1. Arquitectura modular

### Módulo 1 — Agente de Texto (base, siempre presente)
Resuelve WhatsApp: disponibilidad, tarifas, upsell de una sola línea, reactivación de reservas frías, FAQs. Es el punto de entrada de todo hotel, sin excepción — incluso el plan más económico lo incluye completo.

### Módulo 2 — Agente de Voz
- **2A — Notas de voz en WhatsApp** (recomendado para todos los planes con voz): STT → mismo cerebro de texto → TTS, todo dentro del mismo hilo de WhatsApp. No requiere telefonía. Barato, y culturalmente es como ya se comunican los huéspedes colombianos.
- **2B — Línea telefónica en tiempo real** (opcional, fase 2, no recomendado para el piloto): requiere Twilio/SIP + modelo de voz en tiempo real. 5–10x más caro por minuto que 2A. Solo tiene sentido si un hotel específico pide explícitamente poder recibir llamadas.

### Módulo 3 — Inteligencia Operacional (dos variantes)

La **capa de inteligencia** (patrones de temporada, alertas de ocupación, quejas agregadas, Guardián de Reputación) es **idéntica** en ambas variantes. Lo que cambia es la **capa de datos** debajo:

| | **CIMA Conector** | **CIMA Núcleo** |
|---|---|---|
| Cuándo se usa | El hotel ya tiene PMS/motor de reservas | El hotel no tiene ningún sistema formal |
| Qué construye CIMA | Integración vía API contra el sistema existente | Un calendario/disponibilidad propio desde cero — CIMA se vuelve la fuente de verdad |
| Riesgo operativo | Bajo — el PMS ya es la verdad validada | Alto — si CIMA falla, el hotel pierde su única fuente de disponibilidad; requiere respaldo, panel de administración manual, resolución de conflictos |
| Velocidad de arranque | Rápida (días) | Más lenta (semanas) — hay que construir y probar el sistema base |
| Por qué cuesta más Núcleo | No es el cómputo — es el desarrollo inicial y la responsabilidad de mantener el sistema de registro completo del hotel | |

**Pregunta que hay que resolver antes de cotizar cualquier hotel**: ¿tiene PMS o no? Esa respuesta determina automáticamente cuál de las dos columnas de precio aplica. En el caso de Piedra de Luna, esto sigue sin confirmarse — es el primer dato a levantar en el onboarding.

---

## 2. Unit economics (costo por conversación)

Cifras en USD porque los tres proveedores principales (Anthropic, Meta/WhatsApp, proveedores de voz) facturan en dólares. Sin optimizaciones de caché de prompt todavía — hay margen para bajar esto más adelante.

| Componente | Costo por conversación | Fuente/supuesto |
|---|---|---|
| LLM (Claude Haiku 4.5 90% + Sonnet 5 10% para casos complejos) | $0,015–0,024 USD | Haiku 4.5: $1/$5 por millón de tokens · Sonnet 5: $2/$10 por millón de tokens |
| WhatsApp Business API (Meta, mercado Colombia) | $0,007–0,011 USD | Colombia tiene de las tarifas más bajas del mundo (~$0,0008–0,0034/mensaje); desde el 1 oct 2026 las respuestas de servicio dentro de la ventana de 24h también empiezan a cobrarse |
| **Subtotal texto** | **$0,022–0,035 USD (~70–110 COP)** | |
| Voz adicional (solo en conversaciones con nota de voz, ~30% del total) | +$0,06–0,10 USD (~190–310 COP) | STT streaming (~$0,005/min) + TTS calidad media (~$0,04/min), ~2 min de audio ida y vuelta |

## 3. Costos fijos mensuales (independientes del volumen)

| Componente | Costo mensual |
|---|---|
| Servidor/hosting | $15–20 USD |
| BSP/plataforma de envío WhatsApp (Twilio, 360dialog, Gupshup o similar) | $25–35 USD |
| Monitoreo, logs, respaldos | $5–10 USD |
| **Subtotal infraestructura compartida** | **$45–65 USD/mes (~140.000–200.000 COP/mes)** |
| Inteligencia Operacional — Conector | +$5–10 USD/mes (llamadas API al PMS, sync) |
| Inteligencia Operacional — Núcleo | +$15–25 USD/mes (cómputo extra + redundancia/respaldos) |

## 4. COGS mensual total — todas las combinaciones

**Caso representativo: hotel de ~20 habitaciones, ~450 conversaciones/mes, ~30% con nota de voz** (coherente con el volumen mostrado en la demo de Piedra de Luna).

| Combinación | COGS mensual |
|---|---|
| Solo Texto + Conector | $65–85 USD → **≈200.000–260.000 COP** |
| Solo Texto + Núcleo | $75–100 USD → **≈230.000–310.000 COP** |
| Texto + Voz + Conector | $80–105 USD → **≈250.000–325.000 COP** |
| Texto + Voz + Núcleo | $90–120 USD → **≈280.000–370.000 COP** |

### Escalado por tamaño de hotel (multiplicador sobre el caso representativo de 20 habitaciones)

| Tamaño | Habitaciones | Conversaciones/mes aprox. | Multiplicador sobre COGS base |
|---|---|---|---|
| Pequeño | 10–15 | 200–280 | ×0,7–0,8 |
| Mediano (caso base) | 16–30 | 350–550 | ×1,0 |
| Grande | 31–50 | 700–1.000 | ×1,6–1,9 |

La infraestructura compartida (los $45–65 USD fijos) casi no cambia con el tamaño — es lo que hace que el margen mejore en hoteles más grandes. Lo que sí escala linealmente es LLM + WhatsApp + voz.

---

## 5. Riesgo cambiario — nota importante para el pricing

El COGS es 90%+ en dólares. El ingreso va a ser 100% en pesos. La TRM se ha movido <cite index="111-1">-22,16% en un año</cite>, con mínimos de $3.087 y máximos de $4.073 en las últimas 52 semanas. Eso significa que si el peso se fortalece (como ha pasado en 2026), tu margen en COP mejora solo; pero si se devalúa fuerte, tu margen se puede comer rápido si el precio está fijado en COP sin colchón.

**Recomendación**: fijar el precio al hotel en COP (así lo espera el cliente), pero:
1. Construir el precio con un colchón de al menos 15-20% sobre el COGS calculado a la TRM actual.
2. Revisar precios cada trimestre, no anualmente — la volatilidad de este mercado no perdona compromisos de precio a un año.
3. Si el volumen crece mucho (varios hoteles), vale la pena evaluar facturar en USD o indexado a TRM para contratos grandes.

---

## 6. Arquitectura de precios — planes completos

Tres planes, cada uno con dos variantes de precio (Conector / Núcleo), pensados para un hotel del tamaño mediano (16-30 habitaciones). Ajustar con los multiplicadores de la sección 4 para hoteles más pequeños o grandes.

### Plan Esencial — solo Módulo 1 (Texto)
Para el hotel que solo necesita dejar de perder reservas por no contestar WhatsApp a tiempo, sin voz ni analítica profunda.

| | Conector (con PMS) | Núcleo (sin PMS) |
|---|---|---|
| Base mensual | 400.000–450.000 COP | 480.000–550.000 COP |
| Setup único | — | 900.000–1.400.000 COP |
| Comisión sobre upsell/reservas rescatadas | 4–5% | 5–6% |

### Plan Autopiloto — Módulos 1+2A+3 completo (el producto insignia)
Texto + voz + inteligencia operacional completa, envío automático.

| | Conector (con PMS) | Núcleo (sin PMS) |
|---|---|---|
| Base mensual | 550.000–650.000 COP | 700.000–850.000 COP |
| Setup único | — | 1.400.000–2.000.000 COP |
| Comisión sobre upsell/noches extra/reservas rescatadas | 6–8% | 8–10% |

### Plan Copiloto — mismo alcance que Autopiloto, sin comisión
El dueño aprueba cada mensaje antes de enviarlo. CIMA no participa del upside de conversión, así que se cobra fijo y más alto.

| | Conector (con PMS) | Núcleo (sin PMS) |
|---|---|---|
| Precio mensual fijo | 800.000–950.000 COP | 950.000–1.150.000 COP |
| Comisión | Ninguna | Ninguna |

### Módulo 2B (línea telefónica en tiempo real) — add-on opcional, cualquier plan
+150.000–300.000 COP/mes base + consumo por minuto (~$0,08–0,15 USD/min, ~250–470 COP/min). No incluir en el piloto.

---

## 7. ¿Por qué esto es un negocio realmente bueno? (margen ilustrativo)

Ejemplo con supuestos explícitos — no es una promesa, es una ilustración de que la matemática funciona:

**Hotel de 20 habitaciones, Plan Autopiloto + Conector.**

- Ingreso base: 600.000 COP/mes
- Supuesto: ~120-150 reservas/mes, de las cuales CIMA influye en ~25 (reservas rescatadas + upsells + noches extra) con un valor incremental promedio de ~60.000 COP cada una → ~1.500.000 COP/mes de valor generado
- Comisión al 7%: ~105.000 COP/mes
- **Ingreso total CIMA: ~705.000 COP/mes**
- **COGS: ~250.000–325.000 COP/mes**
- **Margen bruto: ~55-65%**

Eso es un margen de software real, no el margen ajustado de una agencia de implementación que vive de cobrar una vez y desaparecer. Y compite de frente contra:
- Agencias genéricas colombianas: 1.500.000–8.000.000 COP de implementación + 1.300.000–3.500.000 COP/mes de mantenimiento, sin nada de esto especializado en hotelería.
- Asksuite/HiJiffy/Quicktext (los líderes globales de hotelería): ~150-300 USD/mes (≈470.000–940.000 COP/mes), pero **requieren que el hotel ya tenga un PMS reconocible** — no sirven para el hotel boutique sin sistema, que es exactamente el segmento de Villa de Leyva.

---

## 8. Producto final

### Nombre y marca
- **CIMA** — la plataforma/motor. No la ve el huésped.
- **Anfitriona** — el agente conversacional. Nombre consistente en todos los hoteles de Villa de Leyva (tono, colores y tarifas personalizados por propiedad, pero el nombre del producto se mantiene). Esto es una decisión de mercado, no solo de marca: en un pueblo donde los dueños de hotel se conocen entre sí, que "Anfitriona" sea reconocible de boca en boca ("es el mismo bot que tiene el Hotel X, muy bueno") es un activo de adquisición gratis. Si cada hotel tuviera un nombre distinto, se pierde ese efecto.

### Cómo se ve para el hotelero
Un hotelero de Villa de Leyva no compra "tres módulos y dos tipos de capa de inteligencia" — eso es la arquitectura interna. Lo que ve son tres preguntas simples en el onboarding:

1. **¿Tienes un sistema de reservas (PMS) o llevas todo en Excel/agenda/cabeza?** → determina Conector vs Núcleo.
2. **¿Quieres que también entienda notas de voz, o solo texto por ahora?** → determina si se activa el Módulo 2A.
3. **¿Quieres que responda solo, o que te pida aprobación antes de enviar?** → determina Autopiloto vs Copiloto.

Tres respuestas, un precio claro, sin necesidad de que el hotelero entienda nada de arquitectura.

### Por qué esto gana en Villa de Leyva específicamente
- Es un pueblo turístico con muchos hoteles boutique pequeños que comparten el mismo problema exacto (WhatsApp a las 11pm, sin PMS formal) — el mismo producto sirve para casi todos sin rediseño.
- Los dueños se conocen entre sí — un piloto exitoso en Piedra de Luna es la mejor pieza de venta para el siguiente hotel, sin necesidad de publicidad paga.
- Ningún competidor grande (Asksuite, HiJiffy) baja a este tamaño de propiedad porque su modelo de integración asume un PMS que estos hoteles no tienen.
- Las agencias genéricas colombianas no entienden hotelería (no saben qué es una reserva fría, un upsell de una sola línea, o por qué el momento del check-out importa) — pierden contra un producto construido específicamente para esto.

### Por qué escala sin volverse un negocio de proyectos a la medida
El riesgo real de este modelo es que "Núcleo" (construir el sistema desde cero por hotel) se vuelva una implementación bespoke cada vez, lo cual no escala. La forma de evitarlo: el motor de Núcleo se construye **una sola vez** como producto reutilizable (un panel de administración genérico de disponibilidad/calendario), no una vez por hotel. Onboardear un hotel nuevo en Núcleo debería ser **configuración**, no desarrollo — cargar habitaciones, tarifas y políticas en un panel ya existente. Si cada hotel Núcleo requiere código nuevo, el negocio deja de ser SaaS y vuelve a ser agencia de implementación, exactamente lo que se supone que hay que vencer.

---

## 9. Antes de construir — preguntas abiertas

1. **¿Piedra de Luna tiene PMS o no?** Determina el plan y el precio real desde el día uno.
2. ¿El número de WhatsApp del hotel ya es Business API, o hay que migrarlo desde un número personal? Afecta el cronograma de arranque.
3. Definir el umbral exacto de "insatisfacción" que activa el Guardián de Reputación — vale la pena una fase de calibración con conversaciones reales antes de activarlo en automático.
4. Decidir el proveedor de TTS para las notas de voz: edge-tts (casi gratis, calidad más robótica, ya usado en JARVIS) vs una opción paga de mejor calidad (~$0,03-0,05/min) — para un hotel boutique la calidad de voz sí pesa en la percepción de marca, vale la pena probar ambas con huéspedes reales antes de decidir.
