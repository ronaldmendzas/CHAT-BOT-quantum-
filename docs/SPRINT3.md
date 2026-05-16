# Sprint 3 — Integración, Estabilidad y Demo Final

## Objetivo
Dejar el proyecto 100% listo para presentar al jurado de Cochetech 2026. Sin bugs críticos, con un flujo demoable de punta a punta, y documentación de presentación.

**Fecha límite:** Día de la presentación
**Tiempo estimado:** 3-5 días

---

## FASE 1: Smoke Tests y Validación (1 día)

### Checklist de flujos críticos

| # | Flujo | Pasos | Estado esperado |
|---|---|---|---|
| 1 | **Welcome** | Abrir app | Logo + "Bienvenido a Quantum Motors" + chat limpio |
| 2 | **Catálogo** | Escribir "modelos" | Panel derecho muestra grid de 26 productos con imágenes |
| 3 | **Detalle de producto** | Click en "Nexus Plus" | Muestra specs, precio, stock por región, imagen grande |
| 4 | **Sucursales** | Escribir "sucursales" | Lista de 8 sucursales con dirección, horario, teléfono |
| 5 | **Test Drive** | Escribir "test drive" | Aparece formulario con select de modelos |
| 6 | **Registro de lead** | Llenar form → click "Registrar" | Mensaje de éxito + lead guardado en `leads.json` |
| 7 | **Chat continuo** | Seguir escribiendo | El chat mantiene contexto, respuestas coherentes |
| 8 | **Responsive** | Redimensionar a 375px | Layout vertical, chat arriba, showroom abajo |
| 9 | **Indicador escribiendo** | Enviar mensaje | Aparece "Bot Quantum está escribiendo..." por 800ms |
| 10 | **Limpiar chat** | Click en "✕" | Chat vuelve a welcome, showroom vuelve a "Bienvenido" |

### Cómo probar

```bash
cd web
npm run dev
```

Abrir en navegador: `http://localhost:3000`

**Datos de prueba para Test Drive:**
- Nombre: `Juan Pérez`
- Celular: `71234567` (o `+591 71234567`)
- Ciudad: `La Paz`
- Producto: cualquiera del select

**Verificar lead guardado:**
```bash
cat src/data/leads.json
```

Debe aparecer un objeto con `id`, `nombre`, `timestamp`, `estado: "PENDIENTE"`.

---

## FASE 2: Contingencias y Edge Cases (1 día)

### Qué pasa si...

| Escenario | Comportamiento actual | Necesita fix? |
|---|---|---|
| `tuquantum.com` cae | Muestra "Imagen no disponible" | ✅ Ya arreglado (ImageWithFallback) |
| Usuario manda mensaje vacío | No pasa nada | ✅ OK |
| Usuario escribe "xyz123" | "No estoy seguro de entender..." | ✅ OK |
| API de productos falla | Spinner + "Cargando showroom..." eterno | ⚠️ Agregar timeout/retry |
| 4 Test Drive seguidos | "Rate limit exceeded" (429) | ✅ Ya arreglado |
| Celular inválido | Mensaje rojo debajo del input | ✅ Ya arreglado |
| Nombre con números | "Solo letras y espacios" | ✅ Ya arreglado |
| Sin productos en API | Showroom vacío | ⚠️ Agregar "No hay productos disponibles" |
| Mobile: teclado abre | Input tapado | ⚠️ Testear en iPhone/Android real |

### Fixes urgentes (si falla en smoke test)

1. **Agregar timeout en `useDataset`**
   - Si las APIs no responden en 10 segundos, mostrar error
   
2. **Agregar retry en `lib/api.ts`**
   - Si fetch falla, reintentar 1 vez antes de throw

3. **Mensaje cuando no hay productos**
   - Si `products.length === 0`, mostrar "Catálogo no disponible temporalmente"

4. **Test en dispositivos reales**
   - iPhone Safari
   - Android Chrome
   - Verificar que el teclado no tape el input

---

## FASE 3: Pulido Visual (1 día)

### Lista de ajustes menores

| # | Ajuste | Archivo | Prioridad |
|---|---|---|---|
| 1 | Scrollbar custom verde sutil | `globals.css` | Media |
| 2 | Animación de entrada para burbujas de chat | `ChatPanel.tsx` | Media |
| 3 | Hover effect en cards de producto más visible | `ProductCard.tsx` | Baja |
| 4 | Tipografía: usar Inter más consistente | `layout.tsx` | Baja |
| 5 | Favicon verificar que sea logo Quantum | `favicon.ico` | Baja |
| 6 | Meta tags para preview en redes | `layout.tsx` | Baja |

### NO tocar (riesgo de romper)

- Colores de la paleta (ya está aprobado)
- Layout 45/55 (funciona bien)
- Lógica del intent engine (funciona)
- Validaciones del formulario (funcionan)

---

## FASE 4: Documentación de Demo (1 día)

### Archivos a crear

#### 1. `docs/DEMO_SCRIPT.md` — Guion de presentación

```markdown
# Guion de Demo — Bot Quantum (3 minutos)

## Intro (30s)
"Quantum Guide es un asesor inteligente para Quantum Motors Bolivia. 
Su objetivo es convertir curiosidad en acción: desde una pregunta en el chat 
hasta un Test Drive agendado."

## Demo en vivo (2 min)

### Paso 1: Bienvenida (15s)
- Mostrar pantalla de inicio
- "El usuario llega y ve la bienvenida. El chat está limpio, listo para empezar."

### Paso 2: Explorar catálogo (30s)
- Escribir: "modelos"
- "El bot entiende que quiere ver vehículos y muestra el catálogo completo."
- Click en "Nexus Plus"
- "Vemos especificaciones reales: 205 km de autonomía, 120 km/h máxima, precio real."

### Paso 3: Ver sucursales (20s)
- Escribir: "sucursales"
- "El usuario puede ver dónde encontrarnos en 8 ciudades de Bolivia."

### Paso 4: Agendar Test Drive (45s)
- Escribir: "quiero probar"
- Aparece formulario
- Llenar: Juan Pérez, 71234567, La Paz, Nexus Plus
- Click "Registrar"
- "El lead se guarda con timestamp, IP, estado PENDIENTE. Un asesor lo contactará."
- Mostrar `leads.json` como prueba

### Paso 5: Cierre (10s)
- "De la curiosidad al Test Drive en menos de 2 minutos. Eso es Quantum Guide."
```

#### 2. `docs/DEMO_CHECKLIST.md` — Checklist del día

```markdown
# Checklist Día de la Demo

## Antes de salir
- [ ] `npm run build` pasa sin errores
- [ ] `git status` limpio (todo commiteado)
- [ ] Laptop cargada al 100%
- [ ] Backup: repo pusheado a GitHub
- [ ] Internet estable (o hotspot de celular listo)

## En el lugar
- [ ] Abrir Chrome (no Safari ni Edge)
- [ ] Cerrar todas las tabs menos localhost:3000
- [ ] Modo pantalla completa (F11)
- [ ] Zoom al 100% (Ctrl+0)
- [ ] Probar: hola → modelos → sucursales → test drive
- [ ] Verificar que `leads.json` tenga datos de prueba

## Durante la demo
- [ ] Hablar lento y claro
- [ ] No escribir muy rápido (el bot responde en 800ms)
- [ ] Si algo falla: "Como cualquier demo en vivo, a veces hay sorpresas. 
      Pero el código está en GitHub, 100% funcional."

## Después
- [ ] Screenshots para el jurado (opcional)
- [ ] Dejar laptop lista por si piden ver algo más
```

---

## FASE 5: Métricas y Datos para el Jurado (opcional, 1 día)

### Datos técnicos que impresionan

| Métrica | Valor |
|---|---|
| Productos reales en catálogo | 26 |
| Sucursales mapeadas | 8 ciudades |
| APIs REST creadas | 7 endpoints |
| Tiempo de respuesta del bot | ~800ms |
| Rate limiting | 3 peticiones / 10 minutos |
| Validaciones de formulario | 3 campos + zod en backend |
| Líneas de código (sin node_modules) | ~2,500 |
| Commits con Conventional Commits | 25+ |
| Dependencias externas | 0 pagas (costo $0) |

### Capturas recomendadas

1. Pantalla de inicio (welcome)
2. Catálogo con grid de productos
3. Detalle de Nexus Plus con specs
4. Lista de sucursales
5. Formulario de Test Drive lleno
6. Mensaje de éxito "Solicitud registrada"
7. Archivo `leads.json` con datos reales

---

## DECISIONES DE ESTE SPRINT

| Decisión | Rationale |
|---|---|
| **No agregar más features** | El MVP está completo. Más features = más riesgo de bugs. |
| **No cambiar paleta/colores** | Ya fue aprobada por el usuario. |
| **No migrar a DB real** | Fuera de alcance para la demo. JSON es suficiente. |
| **No implementar Auth** | No aporta valor al jurado en 3 minutos de demo. |
| **No tests unitarios** | Smoke tests manuales son suficientes para una demo. |

---

## DEFINICIÓN DE "DONE" PARA SPRINT 3

- [ ] Todos los flujos del smoke test pasan
- [ ] Build sin errores
- [ ] Guion de demo escrito y practicado 2 veces
- [ ] Checklist impreso o en teléfono
- [ ] Repo pusheado con tag `v1.0-demo`
- [ ] Capturas de pantalla guardadas

---

*Sprint 3 — Preparado para Cochetech 2026*
