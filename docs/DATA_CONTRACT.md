# Contrato de Datos — Quantum Guide

Este documento define los campos mínimos necesarios para cumplir el requisito: **stock en tiempo real** + información completa + multimedia.

## 1) Productos (catálogo)
Campos mínimos por ítem:
- `id` (string, único y estable)
- `nombre` (string)
- `categoria` (enum sugerido: VEHICULO | ACCESORIO | BATERIA | SERVICIO)
- `precio` (number + moneda)
- `descripcion_corta` (string)
- `especificaciones` (objeto clave-valor, solo lo relevante)
- `colores` (array de strings)
- `media` (array): fotos/videos asociados (ver sección Media)

## 2) Stock
- `product_id`
- `region` (ej. SCZ, LPZ, CBB)
- `sucursal_id`
- `cantidad` (integer)
- `estado` (ej. DISPONIBLE | BAJO_STOCK | SIN_STOCK)
- `ultima_actualizacion` (timestamp)

## 3) Sucursales
- `id`
- `ciudad`
- `direccion`
- `horario`
- `telefono` (opcional según política)
- `maps_url` (opcional)

## 4) Test Drive (disponibilidad y reglas)
Para demo puede ser simple, pero debe existir:
- `region`
- `sucursal_id`
- `dias_horarios` (texto o estructura)
- `requisitos` (texto)

## 5) Registro de Test Drive (leads)
Campos mínimos:
- `nombre`
- `celular`
- `region`
- `sucursal_id`
- `fecha_hora_preferida`
- `modelo_interes` (product_id)
- `canal_origen` (WEB | IG | FB | WHATSAPP | TIKTOK)
- `timestamp`

## 6) Media (fotos y videos)
- `id`
- `type` (IMAGE | VIDEO)
- `url` (o path local en demo)
- `title` (opcional)
- `product_id` (relación)

## Notas de calidad
- No publicar datos personales sensibles en repositorios públicos.
- Mantener coherencia de IDs entre catálogo/stock/media.
