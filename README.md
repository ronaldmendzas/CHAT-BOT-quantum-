# Quantum Guide (Bot Quantum) — README oficial

## Qué es
Quantum Guide es un **asesor inteligente e interactivo** para Quantum Motors Bolivia. Su meta es responder de forma "casi humana y amigable", con información confiable sobre productos, stock, sucursales y Test Drive; y convertir conversaciones en acciones (agendar prueba / derivar a asesor humano).

## Por qué existe (problema)
- La electromovilidad aún tiene barreras de confianza (autonomía, carga, costos).
- Las consultas llegan por múltiples canales y se enfrían por respuesta lenta.
- El catálogo de Quantum es amplio (vehículos, accesorios, baterías, alquiler) y requiere guía.
- Falta un puente claro entre interés digital y una acción concreta (Test Drive).

## Qué entrega este repositorio
Este repositorio documenta y prepara una **demo** del concepto:
- Web showroom: chat + panel visual reactivo.
- Filtros mínimos para recomendar modelos/servicios.
- Resumen visual (fotos/colores/tabla) según la conversación.
- Registro simple de Test Drive.

## Preparación local (sin desarrollar)
1) Instalar dependencias
- `cd web`
- `npm install`

2) Levantar el entorno local
- `npm run dev`
- Abrir: http://localhost:3000

## Configuración (opcional)
- Archivo de ejemplo: [.env.example](.env.example)
- Copiar a `.env` y completar si se usa Supabase (no subir a Git).
- `NEXT_PUBLIC_MEMORY_MODE=local` para demo simple, o `supabase` si se habilita Auth.

## Dataset demo
- Dataset base: [data/demo/dataset.json](data/demo/dataset.json)
- Estructura alineada a [docs/DATA_CONTRACT.md](docs/DATA_CONTRACT.md).

## Alcance (demo)
- Incluye: experiencia web + dataset estructurado + flujo de Test Drive.
- No incluye (demo): omnicanalidad oficial completa (WhatsApp/IG/TikTok) ni pagos/financiamiento.

Detalle: ver [docs/SCOPE_MVP.md](docs/SCOPE_MVP.md).

## Arquitectura (alto nivel)
La solución separa:
1) UI (Web Showroom)
2) Motor conversacional (intenciones + reglas + respuesta)
3) Fuentes de verdad (catálogo/stock/sucursales/test drive/multimedia)
4) Registro de Test Drive

Detalle: ver [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Tecnologías (resumen)
La demo se diseña para funcionar con costo cero y máxima estabilidad.

Detalle: ver [docs/TECH_STACK.md](docs/TECH_STACK.md).

## Datos (stock, sucursales, multimedia)
Para cumplir "stock en tiempo real" se define un contrato de datos mínimo.

Detalle: ver [docs/DATA_CONTRACT.md](docs/DATA_CONTRACT.md).

## Memoria del chat (persistencia + IA)
La demo puede guardar el historial del chat para que el usuario retome la conversacion en otro momento.

Detalle: ver [docs/MEMORIA_IA_SUPABASE.md](docs/MEMORIA_IA_SUPABASE.md).

## Plan de sprints
Plan de trabajo por fases (UI primero, backend cuando llegue la base de datos).

Detalle: ver [docs/SPRINTS.md](docs/SPRINTS.md).

## Estándar de commits
Usamos Conventional Commits.

Detalle: ver [docs/COMMITS.md](docs/COMMITS.md).

## Documento resumen para jurado
El documento resumen (orientado a jurado) vive en [README_VISION.md](README_VISION.md).
