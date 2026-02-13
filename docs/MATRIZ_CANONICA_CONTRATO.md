# Matriz Canónica de Contrato Funcional (Fase 1)

## Objetivo

Este documento consolida la **fuente de verdad funcional** entre documentación, frontend y base de datos para:

1. Estados y transiciones válidas por entidad.
2. Roles y capacidades reales.
3. Definición exacta de KPIs y filtros.

> Alcance: contrato funcional operativo de la versión actual. En caso de conflicto con documentación legacy, prevalece esta matriz.

---

## 1) Estados y transiciones canónicas

### Empresa (`estado_empresa`)
- `pendiente` → `en_proceso`, `completada`
- `en_proceso` → `asesorada`, `completada`
- `asesorada` → `en_proceso`, `completada`
- `completada` → _(terminal)_

### Asesoramiento (`estado_asesoramiento`)
- `programado` → `en_curso`, `cancelado`
- `en_curso` → `completado`, `cancelado`
- `completado` → _(terminal)_
- `cancelado` → _(terminal)_

### Evento (`estado_evento`)
- `planificado` → `confirmado`, `cancelado`
- `confirmado` → `en_curso`, `cancelado`
- `en_curso` → `completado`
- `completado` → _(terminal)_
- `cancelado` → _(terminal)_

### Formación (`estado_formacion`)
- `planificada` → `en_curso`, `cancelada`
- `en_curso` → `completada`, `cancelada`
- `completada` → _(terminal)_
- `cancelada` → _(terminal)_

### Colaborador (`estado_colaborador`)
- `pendiente` → `activo`, `inactivo`
- `activo` → `inactivo`
- `inactivo` → `activo`

### Regla de enforcement
- **Frontend**: aplica transiciones canónicas en `src/lib/stateTransitions.ts` y formularios con `EstadoSelector`.
- **Backend/RLS**: no impone workflow de transiciones; mantiene flexibilidad de datos.

---

## 2) Roles y capacidades canónicas

### Roles válidos (`app_role`)
- `admin`
- `tecnico`
- `auditor`
- `it`

### Capacidades funcionales
- `admin`: lectura y escritura global según políticas RLS.
- `tecnico`: lectura y escritura en su ámbito de gestión según RLS.
- `auditor`: lectura.
- `it`: lectura.

### Regla funcional de UI
- `canWrite = admin || tecnico`
- `canRead = usuario autenticado con roles asignados`

---

## 3) KPIs canónicos (alineados con implementación actual)

### KPI 1: Empresas Asesoradas
- Tabla: `empresas`
- Filtro: `estado IN ('asesorada', 'completada')`

### KPI 2: Informes Generados
- Tabla: `asesoramientos`
- Filtro: `informe_generado = true`

### KPI 3: Eventos Realizados
- Tabla: `eventos`
- Filtro: `estado = 'completado'`

### KPI 4: Píldoras Formativas
- Tabla: `formaciones`
- Filtro: `tipo = 'pildora_formativa' AND estado = 'completada'`

### KPI 5: Entidades Colaboradoras
- Tabla: `colaboradores`
- Filtro: `estado = 'activo' AND convenio_firmado = true`

### KPI 6: Impactos de Difusión (legacy evidencias)
- Tabla: `evidencias`
- Filtro de tipo: `tipo IN ('fotografia', 'video', 'otro')`
- Condición relacional: vinculadas a `eventos.estado='completado'` o `formaciones.estado='completada'`

### KPI 7: Material de Apoyo (legacy evidencias)
- Tabla: `evidencias`
- Filtro: `tipo IN ('documento', 'certificado', 'informe') AND formacion_id IS NOT NULL`

### KPI 8: Cuadro de Mando PowerBI
- Fuente: variables de entorno
- Regla: `VITE_POWER_TENANT_ID`, `VITE_POWER_CLIENT_ID`, `VITE_POWER_API_BASE_URL` informadas

---

## 4) Side effects de negocio que forman parte del contrato

1. Alta de empresa dispara creación de tareas automáticas desde plantillas activas (`empresa_created`).
2. Completar una fase de cadena de tareas empresa→informe→plan dispara la siguiente fase.
3. Cambios de estado de tareas sincronizan `fecha_inicio` y `fecha_completado`.
4. El motor registra eventos en `task_automation_events` para auditoría funcional (`task_created`, `task_creation_failed`, duplicados, etc.).

### Trazabilidad y observabilidad (Fase 3)
- Tabla de eventos: `task_automation_events`.
- Estándar de eventos: `empresa_created`, `task_completed`, evaluación de plantilla, creación/skip/error.
- Política de idempotencia: no duplicar tareas por (`entity_type`, `entity_id`, `template_id`).

---

## 5) Criterio de consistencia

Una modificación funcional futura se considera consistente solo si actualiza de forma coordinada:

1. Implementación (`src/lib/stateTransitions.ts`, hooks, SQL/migrations).
2. Esta matriz canónica.
3. Documentación de detalle afectada (`ESTADOS_TRANSICIONES.md`, `MODELO_DOMINIO.md`, `DEFINICION_KPIS.md`).
