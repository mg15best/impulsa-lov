# Fase 4 — Reorganización de arquitectura frontend por dominio

## Objetivo

Reducir acoplamiento y complejidad cognitiva en páginas, separando responsabilidades en capas de dominio.

## Decisiones aplicadas

## 1) Capa de acceso a datos por entidad (Tasks)

Se extrae la carga de datos de la página `Tareas` a un módulo de dominio:

- `src/domains/tasks/useTasksPageData.ts`
  - Contrato tipado de selección para tareas (`TASKS_SELECT`) y empresas (`EMPRESAS_SELECT`).
  - Filtros de vista por estado/prioridad/entidad.
  - Búsqueda local encapsulada en el hook de dominio.

Resultado: `Tareas` deja de contener consultas directas y concentra solo composición de interfaz.

## 2) Patrón de carga tipado por vista (más allá de `useDataLoader`)

Se introduce:

- `src/hooks/useSupabaseList.ts`
  - Hook reutilizable con `select` explícito por vista.
  - Evita depender de `select('*')` implícito.
  - Mantiene loading/error/reload y feedback homogéneo.

Esto estandariza un contrato de lectura más explícito y seguro para nuevas páginas por dominio.

## 3) Capa de reglas de negocio compartida (Tasks)

Se centralizan reglas de tarea en módulos de dominio:

- `src/domains/tasks/constants.ts`
  - labels, colores, defaults de formulario.
- `src/domains/tasks/taskService.ts`
  - normalización de payload (`buildTaskPayload`),
  - operaciones CRUD (`createTask`, `updateTask`, `deleteTask`),
  - adaptación entidad→formulario (`taskToFormData`).
- `src/domains/tasks/types.ts`
  - tipado de entidades, formulario y contratos auxiliares.

Resultado: reglas reutilizables y consistentes entre vistas/componentes.

## 4) Componentes de flujo reutilizables

Se añade componente de dominio:

- `src/domains/tasks/components/TaskSourceBadge.tsx`
  - renderiza trazabilidad de origen (`manual`, `automatica`, `workflow`, etc.)
  - evita duplicación de lógica de badge en páginas.

## 5) Resultado funcional en `src/pages/Tareas.tsx`

La página queda reorganizada como capa de orquestación UI:

- consume hooks/servicios/componentes de dominio,
- reduce lógica directa embebida,
- conserva comportamiento funcional previo.

## Criterio de cumplimiento de fase

Se considera aplicada esta fase para el dominio `tasks` cuando:

1. La página no hace consultas directas a Supabase ni `select('*')` implícito.
2. Reglas de negocio y constantes se encuentran en módulos de dominio.
3. Existe al menos un componente de flujo reutilizable.
4. El patrón puede replicarse en otros dominios (`empresas`, `informes`, `grants`, etc.).
