# CIMA — Hotel OS
## Estructura final del negocio

> Villa de Leyva no es el mercado. Es el laboratorio donde se prueba el modelo antes de replicarlo en los Pueblos Patrimonio de Colombia.

---

## 1. Tamaño real del mercado (por qué el tablero es más grande de lo que parece)

| Nivel | Universo | Nota |
|---|---|---|
| Villa de Leyva | ~100-150 alojamientos con volumen real que vale la pena vender | El resto de lo que aparece en Booking/Tripadvisor es cuarto suelto o finca informal |
| Red oficial de Pueblos Patrimonio | 17-18 municipios (Barichara, Mompox, Girón, Salamina, Monguí, Honda, Santa Fe de Antioquia, El Socorro, Villa de Leyva, entre otros) | Programa formal de MinCIT/Fontur — 3.095 prestadores turísticos activos a julio 2023, +126% en 4 años |
| Pueblos similares fuera de la red oficial | Salento, Guatapé, Jardín, San Gil, etc. | Mismo perfil: hoteles familiares, venta por WhatsApp, cero sistemas serios |

**Conclusión honesta:** con solo Villa de Leyva, el techo del negocio es bajo — la intuición de que "200 ventas x $2,5M no es un negocio real" es correcta. El negocio real aparece cuando el mismo modelo se replica pueblo por pueblo. Villa de Leyva es la prueba, no el destino final.

---

## 2. Modelo de monetización

### Copiloto
- **Tarifa fija: $250.000 – $350.000 COP/mes.** Sin revenue share (la atribución de la venta es ambigua porque el humano aprieta "enviar").

### Autopiloto
- **Base: $100.000 – $150.000 COP/mes**, vendida explícitamente como cobertura de costos (WhatsApp API + hosting), no como utilidad — así se entiende incluso en meses de temporada baja.
- **+ Revenue share, solo sobre lo demostrablemente creado:**
 - 15% sobre upselling generado (spa, tours, upgrades) — comparable a lo que cobra una OTA (15-18%), pero aquí es 100% ingreso incremental.
 - 10% sobre la primera noche de una reserva rescatada (conversación enfriada, reactivada por seguimiento automático).
 - 0% sobre reservas orgánicas que iban a pasar de todas formas.

### Ancla de venta
Booking y Expedia cobran 15-18% (hasta 23-25% en tarifas preferentes) **sobre toda la reserva**, sin conocer al huésped. CIMA cobra menos y solo sobre lo incremental — ese es el argumento, no el precio de un chatbot genérico de $99 USD/mes.

### Ejemplo real (hotel boutique, 12 habitaciones, Villa de Leyva)
Con curva estacional real (baja: feb/may/sep/nov · media: ene/mar/abr/oct · alta: jun/jul/ago/dic):

| | Anual |
|---|---|
| Ingreso total del hotel | ≈ $506.000.000 COP |
| Ingreso incremental atribuible a CIMA (upsell + rescates) | ≈ $7.200.000 COP |
| Lo que paga el hotel a CIMA (base + comisión) | ≈ $2.640.000 COP |
| % del valor incremental que se queda el hotel | ≈ 63% |

**Segunda línea de ingreso (no depende de la confianza del hotel):** comisión de proveedores locales (tours, spas, restaurantes) por reservas generadas vía CIMA — igual que ya pagan hoy a agencias de turismo. Esto convierte a CIMA de "software para hoteles" en la **capa de comercio turístico del pueblo**, un mercado más grande que solo habitaciones.

---

## 3. Por qué un solo hotel no es negocio, y por qué el modelo sí lo es a escala

- **1-5 hoteles:** ingreso bajo por hotel (~$2,5M COP/año c/u). El objetivo aquí no es rentabilidad, es evidencia — casos de estudio reales que permiten vender el siguiente hotel sin fricción.
- **10-20+ hoteles (Villa de Leyva a saturación):** ~$25-50M COP/año agregados. Aquí se activa el benchmarking entre hoteles, que requiere volumen para ser real.
- **Red de Pueblos Patrimonio (escala nacional):** 1.500+ hoteles potenciales en 15-18 pueblos × ~$2,5M COP/año c/u ≈ $3.750M COP/año (~US$900.000-1.000.000) solo en comisión de hoteles, sin contar la capa de comercio turístico.

---

## 4. Estrategia de venta con cero capital (fases)

0. **Piloto gratuito** en un hotel de confianza en Villa de Leyva (60 días, Autopiloto sin costo) a cambio de datos + autorización de caso de estudio.
1. **Instrumentación obsesiva**: medir en pesos reales (ingreso incremental, conversión, tiempo de respuesta), no en "conversaciones atendidas".
2. **Caso de estudio con un solo número**: *"El Hotel X aumentó su upsell en X% en 60 días."*
3. **Gremio y canal institucional**: Cotelco Boyacá, reuniones del sector turístico local, y eventualmente Fontur/MinCIT como canal de digitalización turística — respaldo institucional que ningún competidor internacional puede igualar culturalmente.
4. **Puerta a puerta con el caso en mano**: nunca se vende software, se muestra un resultado ya comprobado en el propio pueblo del dueño.
5. **Referidos con incentivo cruzado** entre dueños de hotel.
6. **Contenido orgánico** (video corto del caso de estudio, compartido por WhatsApp — cero pauta).

---

## 5. Cómo escalar sin depender del tiempo del fundador

1. **Entrada modular de fricción cero** (ver escalera de módulos del producto): nunca se pide el "sí" grande, solo el primer paso gratis.
2. **Gestores locales con comisión recurrente** en cada pueblo nuevo — personas con credibilidad ya existente en el gremio hotelero de ese pueblo, no vendedores contratados por CIMA.
3. **Canal institucional** en vez de venta uno por uno: un acuerdo con la alcaldía o el gremio de un pueblo abre 40-80 hoteles de una sola vez.

---

## 6. El verdadero foso (por qué esto no lo copia un chatbot genérico)

- **No es la tecnología** — un chatbot con memoria es replicable en 6 meses (ya existen: HiJiffy, Visito, BossBot, desde $99 USD/mes).
- **Es la red entre pueblos no competidores** — portabilidad de perfil de huésped entre Villa de Leyva y Barichara no genera conflicto porque no compiten por el mismo huésped la misma semana.
- **Es el dato acumulado y el benchmarking**, que requiere volumen imposible de replicar sin ya tener la base de hoteles.
- **Es la relación institucional y local** — gestores locales y respaldo de gremios/alcaldías, que un competidor internacional no tiene ni el interés cultural de construir.

**Riesgo honesto:** nada de esto es defendible con velocidad cero. La ventaja se sostiene mientras CIMA expanda más rápido que cualquier competidor hacia el siguiente pueblo — la velocidad de expansión geográfica y la profundidad de las relaciones locales son la defensa real, no la superioridad tecnológica permanente.
