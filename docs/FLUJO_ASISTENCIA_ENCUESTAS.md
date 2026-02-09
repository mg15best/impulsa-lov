# Flujo de Asistencia y Encuestas (PR-G)

## Introducción

Este documento describe el flujo de gestión de asistencia e impacto para formaciones y eventos en el sistema Impulsa LOV, implementado como parte del PR-G.

## Objetivos

1. **Gestionar asistentes**: Registrar y hacer seguimiento de participantes en formaciones y eventos
2. **Gestionar invitaciones**: Crear y dar seguimiento a invitaciones para eventos
3. **Medir impacto**: Recopilar feedback mediante encuestas de satisfacción
4. **Generar métricas**: Obtener datos sobre asistencia y satisfacción

## Estructura de Datos

### Tablas

#### 1. training_attendance
Gestiona la asistencia a formaciones (píldoras formativas, cursos, etc.)

**Campos principales:**
- `formacion_id`: Relación con la formación
- `company_id`: Empresa del asistente (opcional)
- `attendee_name`, `attendee_email`, `attendee_phone`, `attendee_position`: Datos del asistente
- `status`: Estado de la asistencia (registered, confirmed, attended, no_show, cancelled)
- `registration_date`: Fecha de registro
- `attendance_date`: Fecha de asistencia efectiva
- `certificate_issued`, `certificate_url`: Control de certificados
- `notes`: Notas adicionales

**Estados:**
- `registered`: Registrado (inicial)
- `confirmed`: Confirmado
- `attended`: Asistió efectivamente
- `no_show`: No asistió
- `cancelled`: Cancelado

#### 2. event_invites
Gestiona invitaciones para eventos

**Campos principales:**
- `evento_id`: Relación con el evento
- `company_id`: Empresa del invitado (opcional)
- `invitee_name`, `invitee_email`, `invitee_phone`, `invitee_position`: Datos del invitado
- `status`: Estado de la invitación (pending, sent, accepted, declined)
- `sent_date`: Fecha de envío
- `response_date`: Fecha de respuesta
- `response_notes`: Notas de la respuesta
- `notes`: Notas adicionales

**Estados:**
- `pending`: Pendiente de envío
- `sent`: Enviada
- `accepted`: Aceptada
- `declined`: Rechazada

#### 3. event_attendance
Gestiona la asistencia efectiva a eventos

**Campos principales:**
- `evento_id`: Relación con el evento
- `invite_id`: Relación con invitación (opcional)
- `company_id`: Empresa del asistente (opcional)
- `attendee_name`, `attendee_email`, `attendee_phone`, `attendee_position`: Datos del asistente
- `status`: Estado de la asistencia (igual que training_attendance)
- `registration_date`: Fecha de registro
- `attendance_date`: Fecha de asistencia efectiva
- `certificate_issued`, `certificate_url`: Control de certificados
- `notes`: Notas adicionales

#### 4. event_surveys
Encuestas de impacto para eventos

**Campos principales:**
- `evento_id`: Relación con el evento
- `attendance_id`: Relación con asistencia (opcional)
- `company_id`: Empresa del encuestado (opcional)
- `respondent_name`, `respondent_email`: Datos del encuestado
- `status`: Estado de la encuesta (draft, published, closed)
- **Valoraciones (1-5 estrellas):**
  - `satisfaction_rating`: Satisfacción general
  - `content_rating`: Calidad del contenido
  - `organization_rating`: Organización
  - `usefulness_rating`: Utilidad
- **Preguntas abiertas:**
  - `highlights`: Aspectos destacados
  - `improvements`: Mejoras sugeridas
  - `impact_description`: Impacto esperado
- `follow_up_interest`: Interés en seguimiento
- `follow_up_notes`: Notas de seguimiento
- `custom_responses`: Respuestas personalizadas (JSONB)
- `submitted_at`: Fecha de envío

## Flujos de Trabajo

### Flujo 1: Gestión de Asistencia a Formaciones

1. **Registro de Formación**
   - Un técnico crea una formación en la pantalla "Formaciones"
   - Define tipo, fechas, duración, formador, etc.

2. **Añadir Asistentes**
   - Al hacer clic en una formación, se abre la vista detallada
   - Desde ahí se accede al componente "Asistencia"
   - Se pueden añadir asistentes con el botón "+ Añadir Asistente"
   - Se capturan: nombre, email, teléfono, cargo
   - Estado inicial: "Registrado"

3. **Confirmar Asistencia**
   - Antes del evento, se puede cambiar estado a "Confirmado"
   - Permite tener control de quién confirmó vs. quién solo se registró

4. **Registro de Asistencia Efectiva**
   - Durante o después del evento, se marca como "Asistió" o "No asistió"
   - Al marcar "Asistió", se registra automáticamente la fecha de asistencia
   - Botones rápidos de check/x en la tabla para agilizar el proceso

5. **Emisión de Certificados** (futuro)
   - Checkbox para indicar si se emitió certificado
   - URL del certificado si está disponible

### Flujo 2: Gestión de Invitaciones para Eventos

1. **Creación de Evento**
   - Un técnico crea un evento en la pantalla "Eventos"
   - Define tipo, fecha, ubicación, ponentes, etc.

2. **Crear Invitaciones**
   - Al hacer clic en un evento, se abre la vista detallada
   - Primera sección: "Invitaciones"
   - Se pueden crear invitaciones con "+ Añadir Invitación"
   - Se capturan: nombre, email, teléfono, cargo
   - Estado inicial: "Pendiente"

3. **Enviar Invitaciones**
   - Se marca como "Enviada" cuando se ha contactado al invitado
   - Registra automáticamente la fecha de envío
   - Botón de sobre (✉) en la tabla

4. **Registrar Respuestas**
   - Cuando el invitado responde, se marca como "Aceptada" o "Rechazada"
   - Registra automáticamente la fecha de respuesta
   - Botones de check (✓) y x (✗) en la tabla

### Flujo 3: Gestión de Asistencia a Eventos

1. **Registro de Asistentes**
   - Segunda sección en la vista detallada del evento: "Asistencia"
   - Similar al flujo de formaciones
   - Se pueden añadir asistentes directamente
   - O pueden venir vinculados a una invitación aceptada

2. **Seguimiento de Asistencia**
   - Estados: Registrado → Confirmado → Asistió / No asistió
   - Contador visual de asistentes confirmados vs. esperados

### Flujo 4: Encuestas de Impacto

1. **Creación de Encuestas**
   - Tercera sección en la vista detallada del evento: "Encuestas de Impacto"
   - Se pueden crear encuestas con "+ Nueva Encuesta"
   - Opcionalmente vinculadas a un asistente específico

2. **Valoraciones**
   - 4 categorías con escalas de 1-5 estrellas:
     - Satisfacción general
     - Calidad del contenido
     - Organización
     - Utilidad
   - Interfaz visual con estrellas clickeables

3. **Preguntas Abiertas**
   - Aspectos destacados: ¿Qué te ha parecido más valioso?
   - Mejoras sugeridas: ¿Qué se podría mejorar?
   - Impacto esperado: ¿Cómo aplicarás lo aprendido?

4. **Seguimiento**
   - Checkbox: "Me interesa un seguimiento posterior"
   - Si está marcado, aparece campo de notas de seguimiento
   - Permite identificar oportunidades de asesoramiento

5. **Análisis**
   - Valoración media visible en el header
   - Tabla con todas las respuestas
   - Permite ver tendencias y áreas de mejora

## Componentes UI

### TrainingAttendanceManager
**Ubicación**: `src/components/TrainingAttendanceManager.tsx`

**Uso**:
```tsx
<TrainingAttendanceManager 
  formacionId={formacion.id} 
  formacionTitulo={formacion.titulo}
/>
```

**Características**:
- Lista de asistentes con estado
- Dialog para añadir asistentes
- Botones rápidos para marcar asistencia
- Integración con catálogos de estados

### EventInvitesManager
**Ubicación**: `src/components/EventInvitesManager.tsx`

**Uso**:
```tsx
<EventInvitesManager 
  eventoId={evento.id} 
  eventoNombre={evento.nombre}
/>
```

**Características**:
- Lista de invitaciones con estado
- Dialog para crear invitaciones
- Botones rápidos para cambiar estado (enviar, aceptar, rechazar)
- Control de fechas automático

### EventAttendanceManager
**Ubicación**: `src/components/EventAttendanceManager.tsx`

**Uso**:
```tsx
<EventAttendanceManager 
  eventoId={evento.id} 
  eventoNombre={evento.nombre}
/>
```

**Características**:
- Similar a TrainingAttendanceManager
- Contador de asistentes confirmados vs. esperados
- Posible vinculación con invitaciones

### EventSurveysManager
**Ubicación**: `src/components/EventSurveysManager.tsx`

**Uso**:
```tsx
<EventSurveysManager 
  eventoId={evento.id} 
  eventoNombre={evento.nombre}
/>
```

**Características**:
- Lista de encuestas con valoraciones
- Dialog completo para encuestas con:
  - Valoraciones por estrellas
  - Preguntas abiertas
  - Interés en seguimiento
- Valoración media calculada automáticamente
- Tabla con vista resumida de respuestas

## Integración con Pantallas Existentes

### Formaciones.tsx
- Vista principal: Lista de formaciones con filtros
- Al hacer clic en una formación:
  - Se muestra vista detallada
  - Card con información de la formación
  - Componente `TrainingAttendanceManager`
  - Botón "Volver" para regresar a la lista

### Eventos.tsx
- Vista principal: Lista de eventos con filtros
- Al hacer clic en un evento:
  - Se muestra vista detallada
  - Card con información del evento
  - Componente `EventInvitesManager`
  - Componente `EventAttendanceManager`
  - Componente `EventSurveysManager`
  - Botón "Volver" para regresar a la lista

## Permisos y Seguridad

### Políticas RLS
Todas las tablas tienen políticas Row Level Security (RLS) configuradas:

- **SELECT**: Todos los usuarios autenticados pueden ver
- **INSERT**: Todos los usuarios autenticados pueden crear (con created_by = auth.uid())
- **UPDATE**: Solo admins y técnicos pueden actualizar
- **DELETE**: Solo admins pueden eliminar

### Permisos en UI
- Botones de creación usan `PermissionButton` con `action="create"`
- Respeta permisos de usuario (admin, tecnico, auditor, it)
- Auditors e IT solo pueden ver, no modificar

## Catálogos Utilizados

### attendance_statuses
| Código | Etiqueta | Uso |
|--------|----------|-----|
| registered | Registrado | Estado inicial de asistencia |
| confirmed | Confirmado | Asistencia confirmada |
| attended | Asistió | Asistencia efectiva |
| no_show | No asistió | No se presentó |
| cancelled | Cancelado | Cancelado |

### invite_statuses
| Código | Etiqueta | Uso |
|--------|----------|-----|
| pending | Pendiente | Invitación creada, no enviada |
| sent | Enviada | Invitación enviada |
| accepted | Aceptada | Invitación aceptada |
| declined | Rechazada | Invitación rechazada |

### survey_statuses
| Código | Etiqueta | Uso |
|--------|----------|-----|
| draft | Borrador | Encuesta en borrador |
| published | Publicada | Encuesta publicada |
| closed | Cerrada | Encuesta cerrada |

## Métricas y Reportes (Futuro)

### Métricas Disponibles
- Tasa de asistencia: asistidos / registrados
- Tasa de conversión invitaciones: aceptadas / enviadas
- Satisfacción promedio por evento/formación
- Interés en seguimiento: % de encuestados interesados
- Certificados emitidos

### Reportes Potenciales
- Informe de asistencia por período
- Informe de satisfacción por tipo de evento
- Informe de impacto por empresa
- Identificación de oportunidades de seguimiento

## Notas de Implementación

### Migraciones
1. `20260209091000_create_attendance_survey_tables.sql`: Crea las 4 tablas
2. `20260209091100_add_attendance_survey_catalogs.sql`: Añade catálogos de estados

### TypeScript Types
- Actualizado `src/integrations/supabase/types.ts` con:
  - Nuevas enums: `attendance_status`, `invite_status`, `survey_status`
  - Nuevas tablas: `training_attendance`, `event_invites`, `event_attendance`, `event_surveys`

### Hooks Utilizados
- `useDataLoader`: Para cargar datos con filtros
- `useCatalogLookup`: Para resolución de labels de catálogos
- `useAuth`: Para usuario actual
- `useToast`: Para notificaciones

### Componentes UI de shadcn/ui
- Dialog, Button, Input, Label, Textarea
- Table, Card, Badge
- Select (con CatalogSelect personalizado)

## Mejoras Futuras

1. **Envío automático de invitaciones**: Integración con email
2. **Recordatorios**: Notificaciones automáticas
3. **Certificados automáticos**: Generación PDF
4. **Encuestas públicas**: Link público para responder
5. **Dashboard de métricas**: Visualizaciones de asistencia e impacto
6. **Exportación**: Excel/CSV de asistentes y encuestas
7. **Plantillas de encuestas**: Encuestas reutilizables
8. **Firma digital**: Para control de asistencia
9. **QR codes**: Para check-in rápido
10. **Integración con calendario**: Sync con Google Calendar, Outlook

## Referencias

- Patrón de catálogos: `docs/CATALOG_PATTERN.md`
- Patrón de carga de datos: `docs/DATA_LOADING_PATTERN.md`
- Inventario de catálogos: `docs/INVENTARIO_CATALOGOS.md`
- Migraciones: `supabase/migrations/`
- Componentes: `src/components/`
- Páginas: `src/pages/Formaciones.tsx`, `src/pages/Eventos.tsx`
