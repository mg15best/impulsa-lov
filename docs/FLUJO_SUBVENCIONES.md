# Flujo de Gestión de Subvenciones

## Resumen
Este documento describe el flujo de gestión de subvenciones (grants) en el sistema Impulsa LOV, incluyendo las estructuras de datos, relaciones, estados y flujo de trabajo.

## Estructura de Datos

### Tabla: `grants`
Almacena las subvenciones disponibles para las empresas.

**Campos principales:**
- `id`: UUID único de la subvención
- `company_id`: Relación con la empresa (FK → `empresas.id`)
- `title`: Título/nombre de la subvención
- `description`: Descripción detallada
- `status_code`: Estado actual (catálogo `grant_statuses`)
- `type_code`: Tipo de subvención (catálogo `grant_types`)
- `program_code`: Programa de subvención (catálogo `grant_programs`)
- `priority_code`: Nivel de prioridad (catálogo `priority_levels`)
- `amount_requested`: Monto solicitado en euros
- `amount_awarded`: Monto aprobado/concedido en euros
- `application_deadline`: Fecha límite de solicitud
- `decision_date`: Fecha de decisión
- `grant_period_start`: Inicio del período de la subvención
- `grant_period_end`: Fin del período de la subvención
- `responsible_user_id`: Usuario responsable
- `notes`: Notas adicionales
- Campos de auditoría: `created_by`, `created_at`, `updated_at`

### Tabla: `grant_applications`
Almacena las solicitudes/entregas específicas dentro de una subvención.

**Campos principales:**
- `id`: UUID único de la solicitud
- `grant_id`: Relación con la subvención (FK → `grants.id`)
- `title`: Título de la solicitud
- `description`: Descripción de la solicitud
- `status_code`: Estado de la solicitud (catálogo `grant_application_statuses`)
- `submitted_date`: Fecha de envío
- `review_date`: Fecha de revisión
- `decision_date`: Fecha de decisión
- `assigned_to_id`: Usuario asignado
- `feedback`: Comentarios o retroalimentación
- `documents_url`: URL de documentos relacionados
- `order_index`: Orden de visualización
- `notes`: Notas adicionales
- Campos de auditoría: `created_by`, `created_at`, `updated_at`

## Relaciones

```
empresas (1) ──────< (N) grants (1) ──────< (N) grant_applications
```

- Una **empresa** puede tener múltiples **subvenciones**
- Una **subvención** puede tener múltiples **solicitudes**
- Las solicitudes se eliminan en cascada si se elimina la subvención
- Las subvenciones se eliminan en cascada si se elimina la empresa

## Catálogos Utilizados

### 1. `grant_statuses` (Estados de Subvenciones)
- `draft`: Borrador
- `submitted`: Enviada
- `under_review`: En Revisión
- `approved`: Aprobada
- `rejected`: Rechazada
- `in_progress`: En Progreso
- `completed`: Completada
- `cancelled`: Cancelada

### 2. `grant_types` (Tipos de Subvenciones)
- `seed_funding`: Financiación Semilla
- `equipment`: Equipamiento
- `training`: Formación
- `innovation`: Innovación
- `r_and_d`: I+D
- `sustainability`: Sostenibilidad
- `export`: Exportación
- `digitalization`: Digitalización
- `infrastructure`: Infraestructura
- `other`: Otro

### 3. `grant_programs` (Programas de Subvenciones)
- `national`: Programa Nacional
- `regional`: Programa Regional
- `european`: Programa Europeo
- `private`: Programa Privado
- `local`: Programa Local
- `sector_specific`: Programa Sectorial
- `other`: Otro

### 4. `grant_application_statuses` (Estados de Solicitudes)
- `draft`: Borrador
- `pending`: Pendiente
- `submitted`: Enviada
- `under_review`: En Revisión
- `approved`: Aprobada
- `rejected`: Rechazada
- `requires_changes`: Requiere Cambios
- `cancelled`: Cancelada

### 5. `priority_levels` (Niveles de Prioridad - compartido)
- `critical`: Crítica
- `high`: Alta
- `medium`: Media
- `low`: Baja

## Flujo de Trabajo

### 1. Creación de Subvención
1. Usuario con permisos de escritura (admin/tecnico) accede al módulo de Subvenciones
2. Hace clic en "Nueva Subvención"
3. Completa los campos obligatorios:
   - Título
   - Empresa asociada
4. Opcionalmente completa:
   - Tipo de subvención
   - Programa
   - Montos (solicitado/aprobado)
   - Fechas importantes
   - Descripción y notas
5. Guarda la subvención (estado inicial: `draft`)

### 2. Gestión de Solicitudes
1. Desde la vista de detalle de una subvención, se pueden añadir solicitudes específicas
2. Cada solicitud representa un trámite o entrega dentro de la subvención
3. Las solicitudes tienen su propio ciclo de vida:
   - `draft` → `pending` → `submitted` → `under_review` → `approved`/`rejected`
4. Se puede incluir feedback y documentación en cada solicitud

### 3. Seguimiento y Actualización
1. Los estados de la subvención se actualizan conforme avanza el proceso
2. Los montos se actualizan cuando se conoce la aprobación
3. Las fechas de decisión se registran para seguimiento
4. El progreso se monitorea mediante:
   - Estado de la subvención
   - Estados de las solicitudes asociadas
   - Montos solicitados vs. aprobados

### 4. Filtrado y Búsqueda
Los usuarios pueden filtrar subvenciones por:
- Estado
- Tipo
- Empresa
- Búsqueda por texto (título/descripción)

## Permisos y Seguridad

### Políticas RLS (Row Level Security)
- **Lectura (SELECT)**: Todos los usuarios autenticados con roles pueden ver subvenciones y solicitudes
- **Escritura (INSERT/UPDATE/DELETE)**: Solo usuarios con roles `admin` o `tecnico` pueden crear, modificar o eliminar

### Permisos en UI
- Botones de creación/edición/eliminación solo visibles para usuarios con `canWrite = true`
- Los usuarios de solo lectura pueden ver toda la información pero no modificarla

## Integración con el Sistema

### Relación con Empresas
- Cada subvención está vinculada a una empresa específica
- Desde la vista de empresa se puede acceder a sus subvenciones
- Las subvenciones forman parte del histórico de gestión de la empresa

### Indicadores y Métricas
Métricas relevantes que se pueden derivar:
- Total de subvenciones por empresa
- Montos totales solicitados vs. aprobados
- Tasa de éxito (aprobadas/total)
- Distribución por tipo y programa
- Tiempos de resolución

## Campos de Auditoría

Todas las tablas incluyen:
- `created_by`: Usuario que creó el registro
- `created_at`: Fecha de creación (automático)
- `updated_at`: Fecha de última actualización (automático mediante trigger)

## Índices para Performance

### Tabla `grants`:
- `idx_grants_company`: Índice en `company_id`
- `idx_grants_status`: Índice en `status_code`
- `idx_grants_type`: Índice en `type_code`
- `idx_grants_program`: Índice en `program_code`
- `idx_grants_responsible`: Índice en `responsible_user_id`

### Tabla `grant_applications`:
- `idx_grant_applications_grant`: Índice en `grant_id`
- `idx_grant_applications_status`: Índice en `status_code`
- `idx_grant_applications_assigned`: Índice en `assigned_to_id`

## Patrones de Uso

### Caso 1: Nueva Subvención Regional
1. Crear subvención con `program_code = 'regional'`
2. Establecer `type_code` según la naturaleza (ej: `innovation`)
3. Registrar `amount_requested` y `application_deadline`
4. Estado inicial: `draft`
5. Añadir solicitud para la primera entrega
6. Actualizar estado a `submitted` cuando se envíe
7. Actualizar a `under_review` durante evaluación
8. Finalizar con `approved` o `rejected`
9. Si se aprueba, registrar `amount_awarded`

### Caso 2: Seguimiento de Múltiples Solicitudes
1. Una subvención europea tiene 3 fases
2. Crear 3 solicitudes (grant_applications) vinculadas
3. Cada solicitud avanza independientemente
4. El estado global de la subvención refleja el estado general
5. Las solicitudes individuales reflejan el estado de cada fase

## Notas Técnicas

- **Triggers**: `update_updated_at_column()` se ejecuta automáticamente en UPDATE
- **Cascada**: DELETE en grants elimina automáticamente las grant_applications
- **Tipos numéricos**: `amount_requested` y `amount_awarded` usan `NUMERIC(15,2)` para precisión monetaria
- **Fechas**: Campos de fecha usan tipo `DATE` (sin hora)
- **Timestamps**: Campos de auditoría usan `TIMESTAMP WITH TIME ZONE`

## Próximas Mejoras Potenciales

1. Notificaciones automáticas antes de `application_deadline`
2. Dashboard de métricas de subvenciones
3. Exportación de reportes en PDF/Excel
4. Integración con sistema de documentos para adjuntar archivos
5. Historial de cambios de estado
6. Plantillas de solicitudes por tipo
7. Workflow automático de aprobaciones
8. Integración con calendario para fechas importantes
