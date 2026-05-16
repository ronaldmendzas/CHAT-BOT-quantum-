# Plan de Sprints — Quantum Guide

Este plan asume que primero se construye la interfaz y, cuando llegue la base de datos real, se implementa el backend.

## Objetivo general
- Sprint 1: UI completa (sin backend real).
- Sprint 2: Backend con la base de datos real.
- Sprint 3: Integracion completa + pruebas.

---

## Sprint 0 — Preparacion (ya listo)
**Objetivo:** dejar el repositorio listo para arrancar.

**Entregables**
- Scaffold web (Next.js).
- Documentacion base.
- Dataset demo y `.env.example`.

**Criterios de salida**
- Repo limpio y listo para desarrollo.

---

## Sprint 1 — Interfaz (sin backend real)
**Objetivo:** construir la experiencia completa de UI para el showroom web.

**Entregables**
- Layout split (chat + panel visual).
- Componentes: lista de productos, detalle, stock demo, formulario Test Drive demo.
- Estados de UI y flujo de conversacion (mock por reglas).
- Conexiones a dataset demo local.

**Criterios de salida**
- UI navegable en desktop y mobile.
- Flujos principales funcionando con datos demo.
- No depende de base de datos real.

---

## Sprint 2 — Backend (cuando llegue la base de datos)
**Objetivo:** reemplazar el dataset demo por la base real y agregar APIs.

**Entregables**
- Endpoints para catalogo, stock, sucursales y test drive.
- Adaptador de datos (DB real -> contrato de datos).
- Persistencia del chat (segun decision: Supabase o local).
- Validaciones basicas de entrada.

**Criterios de salida**
- UI consumiendo datos reales.
- Datos consistentes con [docs/DATA_CONTRACT.md](docs/DATA_CONTRACT.md).

---

## Sprint 3 — Integracion y estabilidad
**Objetivo:** asegurar calidad y preparar demo final.

**Entregables**
- Pruebas basicas (smoke tests).
- Manejo de errores y estados vacios.
- Pulido de UX y textos finales.
- Checklist de demo y guion de presentacion.

**Criterios de salida**
- Demo estable y repetible.
- Sin errores criticos en flujos clave.

---

## Dependencias
- Base de datos real (para Sprint 2).
- Decidir modo de memoria (local o Supabase) antes de cerrar Sprint 2.

## Notas
- Este plan mantiene el costo en 0 Bs.
- Se puede ajustar en funcion del avance real.
