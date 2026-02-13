# Fase 5 — Coherencia de navegación y flujos end-to-end

## Objetivo

Alinear la secuencia mental del usuario con la secuencia real de negocio:

1. Captación / alta de empresa
2. Asesoramiento
3. Entregables (informes / planes)
4. Seguimiento (tareas / KPIs)

## Cambios aplicados

## 1) Menú alineado al pipeline operativo real

Se reorganiza la navegación lateral para dejar de priorizar un catálogo plano de módulos:

- Sección **Resumen**: `Dashboard`
- Sección **Pipeline Operativo** con orden secuencial:
  - `1. Empresas`
  - `1.1 Contactos`
  - `1.2 Oportunidades`
  - `1.3 Subvenciones`
  - `2. Asesoramientos`
  - `3. Informes`
  - `3.1 Planes de Acción`
  - `4. Tareas`

Resultado: la navegación guía al usuario por el orden operativo esperado.

## 2) Estado de flujo visible entre pantallas

Se añade `FlowJourneyBar` en el header global (`AppLayout`), visible en pantallas de aplicación (desktop), con:

- pasos numerados del journey E2E,
- resaltado del paso actual,
- marcación visual de pasos previos completados,
- acceso directo por enlace a cada fase.

Además, se muestra una pista de automatización real del sistema:
- *"Automático: alta de empresa dispara tarea inicial de diagnóstico"*.

Resultado: el usuario entiende qué fase está transitando y qué automatización se dispara en el proceso.

## 3) Coherencia funcional UI ↔ negocio

La estructura visual del journey coincide con el flujo operativo acordado en fases previas:

- captura y calificación,
- ejecución de asesoramiento,
- producción de entregables,
- seguimiento operativo.

Esto reduce saltos cognitivos y mejora continuidad entre pantallas.

## Criterio de cumplimiento fase 5

Se considera cumplida cuando:

1. El menú principal sigue explícitamente el pipeline del negocio.
2. El estado del flujo es visible transversalmente en la aplicación.
3. El journey hace explícitos hitos y automatizaciones relevantes.
4. La navegación deja de ser solo inventario de módulos y se convierte en guía de proceso.
