# Fase 6 — Modelo de métricas de control y calidad operativa

## Objetivo

Medir la consistencia lógica del sistema, no solo volumen de actividad.

## KPIs de salud lógica incorporados

1. **% transiciones inválidas intentadas**
   - Fuente: `state_transition_attempts`
   - Fórmula: `invalid / total * 100`
   - Captura tanto intentos válidos como inválidos para medir salud de uso del flujo.

2. **% tareas automáticas sin responsable inicial**
   - Fuente: `task_automation_events` (`event_type = 'task_created'`)
   - Fórmula: `sin_responsable / total_task_created * 100`
   - Usa `payload.responsable_id` registrado en evento de creación automática.

3. **Lead time entre fases de cadena automática (días)**
   - Fuente: `tasks + task_templates`
   - Fórmula: promedio de días entre `fecha_completado` de fase N y `created_at` de fase N+1
   - Alcance: cadena `empresa_informe_plan`.

4. **Discrepancias estado empresa vs asesoramientos (%)**
   - Fuente: `empresas + asesoramientos`
   - Casos discrepantes:
     - empresa `asesorada/completada` sin asesoramiento completado,
     - empresa `pendiente` con asesoramiento completado.
   - Fórmula: `mismatched / total_empresas * 100`.

## Implementación técnica

### Backend

- Nueva tabla: `state_transition_attempts` (telemetría de intentos de transición).
- Nueva vista unificada: `operational_health_kpis` (una fila por KPI de salud).
- Migración: `supabase/migrations/20260214100000_add_operational_health_kpis.sql`.

### Frontend

- `EstadoSelector` registra intentos válidos/ inválidos de transición (no bloqueante).
- Nuevo hook `useOperationalHealthKPIs` consume `operational_health_kpis`.
- `Dashboard` añade sección **KPIs de salud lógica (consistencia)**.

## Separación de categorías KPI

Con esta fase, el dashboard queda explícitamente segmentado en:

1. **Operativos** (ejecución del programa)
2. **Estratégicos** (resultado agregado)
3. **Impacto** (efecto del programa)
4. **Salud lógica / integridad** (consistencia del sistema)

Esto permite distinguir claramente rendimiento de negocio vs calidad operativa del sistema.
