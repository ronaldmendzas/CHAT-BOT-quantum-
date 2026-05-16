# Estándar de Commits y Branching

## Formato de mensajes (Conventional Commits)
Usar mensajes claros y consistentes:

- `docs:` documentación
- `feat:` nueva funcionalidad
- `fix:` corrección de bug
- `refactor:` refactor sin cambio de comportamiento
- `style:` cambios de estilo (UI/format)
- `test:` tests
- `chore:` mantenimiento

Ejemplos:
- `docs: add MVP scope and data contract`
- `feat: add test drive booking form`
- `fix: prevent model switch when intent is rental`

## Branching
- Rama principal: `main`
- Ramas de trabajo:
  - `feat/<tema>`
  - `fix/<tema>`
  - `docs/<tema>`

## Pull Requests (mínimo)
- Descripción breve del cambio.
- Captura o evidencia si afecta UI.
- Confirmar que no se suben secretos (`.env`).
