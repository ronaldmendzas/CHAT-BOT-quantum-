# Alcance (MVP) — Quantum Guide (Demo)

## Objetivo del MVP
Entregar una **demo estable** que demuestre que Quantum Motors puede atender consultas digitales de forma "casi humana", con información consistente y con un cierre a **Test Drive**, sin depender de integraciones frágiles o costos obligatorios.

## Incluye (Demo)
- Experiencia Web tipo showroom:
  - Chat conversacional.
  - Panel reactivo: imagen del modelo, colores disponibles y tabla resumida de especificaciones.
- Asesoría guiada con filtros mínimos:
  - Tipo de interés (vehículos / accesorios / baterías / alquiler / test drive).
  - 2–3 preguntas de contexto (uso, ciudad, rango de presupuesto).
- Respuestas con enfoque en valor:
  - Ahorro económico.
  - No emisiones de CO2.
  - Beneficios de electromovilidad.
- Verificación de datos (demo):
  - El bot debe basarse en una **fuente de datos** (catálogo/stock/sucursales) y **no inventar** valores.
- Agendamiento de Test Drive (demo):
  - Registro simple con: nombre, celular, ciudad/sucursal, fecha/hora preferida.

## No incluye (Demo)
- Integración omnicanal oficial completa (WhatsApp/Instagram/TikTok) en vivo.
  - Se documenta como fase posterior por dependencias externas (permisos, configuración, políticas, costos potenciales).
- Pagos / reservas con cobro.
- Financiamiento bancario integrado.
- CRM completo con seguimiento automatizado.
- Autenticación de usuarios final.

## Criterios de éxito (Definition of Done)
La demo se considera lista si, en vivo, se completan sin fallas estos 3 recorridos:
1. Guía por filtros → recomendación de 1–3 opciones → panel visual cambia correctamente.
2. Consulta de stock/sucursal (según dataset) → respuesta consistente.
3. Cierre → registro de Test Drive capturado.

## Riesgos controlados por diseño
- Alucinación: si un dato no existe en el dataset, el bot lo declara como no confirmado y ofrece alternativa/derivación.
- Demo frágil: la web debe operar con modo "mock" si no hay proveedor de IA disponible.
