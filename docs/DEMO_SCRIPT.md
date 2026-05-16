# Guion de Demo — Bot Quantum (3 minutos)

## Intro (30s)
"Quantum Guide es un asesor inteligente para Quantum Motors Bolivia. Su objetivo es convertir curiosidad en acción: desde una pregunta en el chat hasta un Test Drive agendado."

## Demo en vivo (2 min)

### Paso 1: Bienvenida (15s)
- Mostrar pantalla de inicio
- "El usuario llega y ve la bienvenida. El chat está limpio, listo para empezar."

### Paso 2: Explorar catálogo (30s)
- Escribir: **"modelos"**
- "El bot entiende que quiere ver vehículos y muestra el catálogo completo."
- Click en **"Nexus Plus"**
- "Vemos especificaciones reales: 205 km de autonomía, 120 km/h máxima, precio real."
- "Si hay stock, lo dice en tiempo real consultando la API."

### Paso 3: Ver sucursales (20s)
- Escribir: **"sucursales"**
- "El usuario puede ver donde encontrarnos en 8 ciudades de Bolivia."
- "Horarios, direcciones, teléfonos — todo actualizado."

### Paso 4: Agendar Test Drive (45s)
- Escribir: **"quiero probar"**
- "El bot detecta intención de Test Drive y abre el formulario."
- Llenar:
  - Nombre: **Juan Pérez**
  - Celular: **71234567**
  - Ciudad: **La Paz**
  - Producto: **Nexus Plus**
- Click **"Registrar Test Drive"**
- "El lead se guarda con ID único, timestamp, canal WEB. Un asesor lo contactará por WhatsApp."
- Abrir terminal, mostrar `src/data/leads.json` como prueba

### Paso 5: Arquitectura (opcional, 20s)
- "Todo esto consume 7 APIs REST construidas en Next.js."
- "Datos reales de tuquantum.com. Validaciones con zod. Rate limiting."
- "Costo de infraestructura: cero bolivianos."

### Paso 6: Cierre (10s)
- "De la curiosidad al Test Drive en menos de 2 minutos. Eso es Quantum Guide."

---

## Frases de respaldo (si algo falla)

- "Como cualquier demo en vivo, a veces hay sorpresas. Pero el código está en GitHub, 100% funcional."
- "Esto está corriendo en mi laptop, no en un servidor preparado. Es código real."
- "Si quieren, puedo mostrar los endpoints de la API funcionando en el navegador."

## Que NO decir

- ❌ "Esto es solo un prototipo" → Decir: "Es una demo funcional, lista para escalar"
- ❌ "Faltan muchas cosas" → Decir: "El MVP cubre los 3 flujos principales"
- ❌ "No tiene backend real" → Decir: "El backend consume archivos JSON que simulan la DB real"

## Preguntas esperadas del jurado

| Pregunta | Respuesta corta |
|---|---|
| "¿Usan IA real?" | "Por ahora es un motor de reglas, pero la arquitectura soporta integrar GPT/Claude fácilmente." |
| "¿Cómo se conecta con WhatsApp?" | "El plan es usar la API de WhatsApp Business. El backend ya está listo para recibir webhooks." |
| "¿Cuánto costó?" | "Cero. Next.js gratuito, JSON como DB, sin servidores pagos." |
| "¿Y si Quantum cambia precios?" | "Actualizan el archivo JSON y todo se refleja en tiempo real. Cuando tengan DB, solo cambiamos el adaptador." |
| "¿Qué sigue después?" | "Conectar DB real, integrar WhatsApp, y agregar financiamiento/cuotas." |
