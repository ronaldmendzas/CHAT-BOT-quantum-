# Tecnologías — Quantum Guide

Este documento define el stack recomendado para **demo (costo 0)** y el stack para **fase posterior** (cuando la empresa habilite recursos/canales).

## Stack recomendado para la demo (costo 0)
### Interfaz
- Web (HTML/CSS/JS) o framework web ligero.
- Estilos: Tailwind (CDN) u hojas CSS simples.

### Motor conversacional
- Modo A (seguro para demo): **Mock inteligente** (intenciones + dataset).
- Modo B (IA real sin pago): **LLM local** (si el hardware lo permite).

### Datos
- Dataset estructurado (JSON local o spreadsheet exportada).
- Multimedia (fotos/videos) referenciados por URL o archivos locales.

### Agendamiento
- Registro simple (archivo local/hoja) para demostrar flujo de negocio.

## Stack para fase posterior (omnicanal real)
### Canales
- WhatsApp/Instagram/Facebook: conectores oficiales (según permisos y políticas vigentes).
- TikTok: integración según capacidades habilitadas; alternativamente, redirección a la web para experiencia premium.

### Motor de IA
- Proveedor de LLM vía API (cuando exista autorización/presupuesto).
- RAG/consulta a fuentes de verdad (stock, sucursales, disponibilidad) antes de responder.

### Datos y operación
- Base de datos (ej. Postgres) para stock, citas y trazabilidad.
- Panel interno para que Quantum gestione citas.

## Principios de selección (senior)
- La demo prioriza: estabilidad, claridad, trazabilidad del dato.
- Producción prioriza: seguridad, escalabilidad, integraciones oficiales.
