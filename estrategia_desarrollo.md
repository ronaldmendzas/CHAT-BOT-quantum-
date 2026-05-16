# Proyecto Quantum Motors 2026 - Estrategia de Desarrollo

## Fase 1: El Cerebro e Interfaz Web (Lo que presentas como Demo)
Para el concurso, lo más impactante es la **página web interactiva**. Es donde el jurado verá la pantalla dividida (Chat + Visualizador).

### 1.1 El Motor de IA
- **Tecnología:** OpenAI (GPT-4o mini) o Anthropic.
- **Configuración:** Usarás "System Prompts" para que la IA sepa que es de Quantum Motors, conozca el stock y los precios.

### 1.2 La Interfaz Web (React/Next.js)
- **Lado Izquierdo:** Chat interactivo.
- **Lado Derecho:** Visualizador dinámico (Imágenes de los modelos, tablas de specs, botón de "Agendar Test Drive").
- **Lógica de Conexión:** La IA enviará códigos ocultos (ej. `[SHOW_MODEL: COLIBRI]`) que tu web entenderá para cambiar la imagen de la derecha.

---

## Fase 2: Conectividad Omnicanal (WhatsApp/Social Media)
Una vez que el "Cerebro" funciona en la web, lo conectas a las redes sociales.

### 2.1 Herramienta de Integración: Make.com o ManyChat
- **Función:** Actúan como puente. Reciben el mensaje de WhatsApp, se lo pasan a tu "Cerebro" de IA, y devuelven la respuesta.
- **Ventaja:** No tienes que programar cada API por separado.

### 2.2 Flujo de Datos
1. Usuario escribe a WhatsApp.
2. ManyChat/Make recibe el mensaje.
3. Se envía a la API de OpenAI (el mismo cerebro de la web).
4. El bot responde con info técnica y link a la web para el "Test Drive".

---

## Diferencias Clave entre Web y Redes Sociales
| Característica | Web Personalizada | WhatsApp / Instagram |
| :--- | :--- | :--- |
| **Visuales** | Pantalla dividida, tablas, interactivo. | Solo texto, imágenes simples y botones. |
| **Propósito** | Cerrar la venta y agendar citas. | Primer contacto y consultas rápidas. |
| **Experiencia** | Alta fidelidad (Premium). | Accesibilidad y rapidez (Cotidiano). |

---

## Siguientes Pasos para el Dev:
1. Definir el **Dataset** (Modelos, precios, servicios).
2. Crear un **Prototipo de UI** en la web (La pantalla dividida).
3. Configurar la **API de OpenAI** con la personalidad de Quantum.