# Checklist Día de la Demo — Quantum Guide

## Antes de salir de casa

- [ ] `npm run build` pasa sin errores
- [ ] `git status` limpio (todo commiteado)
- [ ] Repo pusheado a GitHub
- [ ] Laptop cargada al 100%
- [ ] Cargador en la mochila
- [ ] Internet: hotspot de celular configurado y probado

## En el lugar (15 min antes)

- [ ] Conectar a WiFi del evento (o usar hotspot)
- [ ] Abrir terminal: `cd web && npm run dev`
- [ ] Abrir Chrome (no Safari, no Edge)
- [ ] Ir a `http://localhost:3000`
- [ ] Cerrar TODAS las tabs excepto localhost
- [ ] Cerrar Slack, Spotify, notificaciones
- [ ] Modo pantalla completa (F11)
- [ ] Zoom al 100% (Ctrl+0)
- [ ] Probar flujo rápido: hola → modelos → Nexus Plus → sucursales → test drive
- [ ] Verificar que `src/data/leads.json` tenga al menos 1 lead de prueba
- [ ] Hacer 1 respiración profunda

## Durante la demo (3 min)

- [ ] Hablar lento y claro
- [ ] No escribir muy rápido (el bot tarda 800ms)
- [ ] Mantener contacto visual con el jurado, no mirar solo la pantalla
- [ ] Si algo tarda: "Mientras carga, les cuento que..." (rellenar con arquitectura)
- [ ] Sonreír al final

## Si algo falla en vivo

| Problema | Solución rápida |
|---|---|
| La app no carga | F5. Si sigue, mostrar `npm run dev` en terminal |
| Imagen no carga | "Como usamos imágenes reales de tuquantum.com, a veces la CDN tarda. El sistema tiene fallback." |
| Bot no responde | Verificar que `npm run dev` siga corriendo. Si no, reabrir terminal |
| Formulario no envía | Revisar consola del navegador. Si es rate limit, esperar 10 min o reiniciar dev server |
| Teclado tapa input en mobile | No testear en mobile durante la demo, quedarse en desktop |

## Después de la demo

- [ ] Screenshots de cada pantalla para el jurado (si lo piden)
- [ ] Dejar laptop lista por si quieren ver más
- [ ] Apuntar feedback del jurado
- [ ] Celebrar (aunque sea un chocolate)

---

*Buena suerte, equipo. El código está listo, la arquitectura es sólida, y la demo va a romperla.*
