# Arquitectura (alto nivel) — Quantum Guide

## Resumen
Quantum Guide es un **showroom conversacional**: una experiencia web que combina chat + panel visual reactivo. Su diseño separa claramente:
- **Interacción (UI)**
- **Cerebro (motor conversacional)**
- **Fuentes de verdad (datos)**
- **Acciones de negocio (agendar test drive / derivar a humano)**

## Componentes
1. **Web Showroom**
   - Chat.
   - Panel reactivo (imagen, colores, tabla).
   - CTA de Test Drive.

2. **Motor Conversacional**
   - Interpreta la intención (ej. "quiero auto urbano", "alquiler", "baterías").
   - Compone una respuesta con tono humano y enfoque comercial.
   - Produce una salida estructurada para la UI (qué mostrar en pantalla).

3. **Capa de Datos (fuente de verdad)**
   - Catálogo (productos + specs).
   - Stock por región/sucursal.
   - Sucursales.
   - Disponibilidad de Test Drive.
   - Multimedia (fotos/videos).

4. **Registro de Test Drive (demo)**
   - Captura datos mínimos.
   - Genera una lista de citas para operación de Quantum.

## Flujo principal (texto)
1) Usuario escribe una consulta.
2) Motor identifica intención + consulta dataset.
3) Motor responde al usuario + devuelve una instrucción de UI (mostrar modelo/tabla/CTA).
4) UI actualiza el panel visual.
5) Si el usuario acepta: se registra Test Drive.

## Contrato de salida (UI-driven)
La UI no debe "adivinar" qué mostrar. El motor debe entregar una salida estructurada, por ejemplo:
- `intent`: VEHICLE | ACCESSORIES | BATTERIES | RENTAL | TEST_DRIVE
- `selectedItemId`
- `mediaIds` (fotos/videos)
- `specsSummary` (tabla)
- `cta` (none | open_test_drive)

## Patrones de diseño
- `Singleton` (sí):
  - Cliente de datos (dataset/stock) y/o cliente de IA (cuando exista) como instancia única.
  - Razón: evitar re-instanciación, mantener configuración consistente, facilitar caching.
- `Adapter`:
  - Para soportar múltiples fuentes de datos (JSON, Sheet, DB) sin reescribir lógica.
- `Strategy`:
  - Para variar el estilo de asesoría según perfil (B2C urbano, emprendedor, B2B flota).

## Guardrails (obligatorio)
- Si un dato no existe o no está confirmado por la fuente de verdad:
  - Declarar "no confirmado".
  - Ofrecer alternativas (modelo similar / sucursal / asesor humano).
  - Nunca inventar precio, autonomía, stock o disponibilidad.
