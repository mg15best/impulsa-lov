# Mapeo de Entidades: Esquema Actual vs. Esquema Propuesto

## Índice
1. [Introducción](#introducción)
2. [Tabla de Mapeo de Entidades](#tabla-de-mapeo-de-entidades)
3. [Decisiones de Mapeo por Entidad](#decisiones-de-mapeo-por-entidad)
4. [Campos Clave por Entidad](#campos-clave-por-entidad)
5. [Relaciones entre Entidades](#relaciones-entre-entidades)

## Introducción

Este documento establece el mapeo detallado entre las entidades actuales del sistema Impulsa LOV (en español) y el esquema propuesto con nomenclatura en inglés. El objetivo es facilitar la migración futura manteniendo la claridad sobre qué entidades se renombran, consolidan o mantienen sin cambios.

### Convenciones

- **Renombrar**: La entidad mantiene su propósito pero cambia de nombre
- **Mantener**: La entidad se conserva sin cambios significativos  
- **Consolidar**: Múltiples entidades se combinan en una sola
- **Descartar**: La entidad se elimina o se fusiona completamente con otra
- **Nueva**: Entidad nueva que no existía en el esquema actual

## Tabla de Mapeo de Entidades

| Entidad Actual (ES) | Entidad Propuesta (EN) | Acción | Justificación |
|---------------------|------------------------|---------|---------------|
| **empresas** | **companies** | Renombrar | Estandarización a nomenclatura inglesa para API y código |
| **contactos** | **company_contacts** | Renombrar | Más específico, indica que son contactos de empresas |
| **asesoramientos** | **consultations** | Renombrar | Término más preciso en inglés para sesiones de consultoría |
| **eventos** | **events** | Renombrar | Traducción directa, mantiene el mismo propósito |
| **formaciones** | **trainings** | Renombrar | Traducción directa para actividades formativas |
| **evidencias** | **attachments** | Renombrar | Más genérico y comprensible en contextos internacionales |
| **colaboradores** | **partner_entities** | Renombrar | Más claro que son entidades colaboradoras, no empleados |
| **profiles** | **user_profiles** | Renombrar | Más específico sobre su propósito |
| **user_roles** | **user_roles** | Mantener | Ya está en inglés y es claro |

## Decisiones de Mapeo por Entidad

### 1. Empresas → Companies

**Decisión**: Renombrar

**Razón**: 
- Estandarización del código y API a nomenclatura inglesa
- Facilita la colaboración con desarrolladores internacionales
- Mejora la claridad en el código TypeScript/JavaScript

**Campos Destacados**:
- `nombre` → `legal_name`
- `nombre_comercial` → `trade_name`
- `cif` → `tax_id`
- `sector` → `sector_code`
- `fase_madurez` → `maturity_phase`
- `tecnico_asignado_id` → `assigned_technician_id`

### 2. Contactos → Company Contacts

**Decisión**: Renombrar con mayor especificidad

**Razón**:
- "contactos" es ambiguo (¿contactos de qué?)
- "company_contacts" deja claro que son personas de contacto en empresas
- Evita confusión con otros tipos de contactos futuros

**Campos Destacados**:
- `empresa_id` → `company_id`
- `nombre` → `full_name`
- `cargo` → `position`
- `es_principal` → `is_primary`

### 3. Asesoramientos → Consultations

**Decisión**: Renombrar

**Razón**:
- "Consultations" es el término técnico más apropiado en inglés
- Evita confusiones con "advisory" que es más amplio
- Representa mejor las sesiones de consultoría uno-a-uno

**Campos Destacados**:
- `empresa_id` → `company_id`
- `tecnico_id` → `consultant_id`
- `fecha` → `date`
- `duracion_minutos` → `duration_minutes`
- `estado` → `status`
- `acta` → `minutes`
- `compromisos` → `commitments`
- `proximos_pasos` → `next_steps`

### 4. Eventos → Events

**Decisión**: Renombrar (traducción directa)

**Razón**:
- Traducción estándar y clara
- Mantiene el mismo propósito y alcance
- Ampliamente comprendido en contextos técnicos

**Campos Destacados**:
- `nombre` → `name`
- `tipo` → `type`
- `estado` → `status`
- `fecha` → `date`
- `ubicacion` → `location`
- `ponentes` → `speakers`
- `asistentes_esperados` → `expected_attendees`
- `asistentes_confirmados` → `confirmed_attendees`

### 5. Formaciones → Trainings

**Decisión**: Renombrar

**Razón**:
- "Trainings" es el término estándar para actividades formativas
- Cubre todos los tipos: cursos, talleres, webinars, etc.
- Claro y preciso en contextos empresariales

**Campos Destacados**:
- `titulo` → `title`
- `tipo` → `type`
- `estado` → `status`
- `fecha_inicio` → `start_date`
- `fecha_fin` → `end_date`
- `duracion_horas` → `duration_hours`
- `formador` → `instructor`
- `participantes_max` → `max_participants`
- `participantes_inscritos` → `enrolled_participants`

### 6. Evidencias → Attachments

**Decisión**: Renombrar con generalización

**Razón**:
- "Evidencias" es muy específico del contexto español/legal
- "Attachments" es más universal y comprensible
- Representa mejor el propósito: archivos adjuntos a entidades
- Permite uso más amplio (no solo para evidencia legal)

**Campos Destacados**:
- `titulo` → `title`
- `tipo` → `type`
- `descripcion` → `description`
- `fecha` → `date`
- `archivo_url` → `file_url`
- `archivo_nombre` → `file_name`

**Relaciones Mantenidas**:
- `empresa_id` → `company_id`
- `evento_id` → `event_id`
- `formacion_id` → `training_id`
- `asesoramiento_id` → `consultation_id`

### 7. Colaboradores → Partner Entities

**Decisión**: Renombrar con mayor especificidad

**Razón**:
- "Colaboradores" se puede confundir con empleados/colaboradores internos
- "Partner Entities" deja claro que son organizaciones externas colaboradoras
- Evita confusión conceptual con "Entities" (ver siguiente sección)
- Más preciso en inglés empresarial

**Campos Destacados**:
- `nombre` → `name`
- `tipo` → `type`
- `estado` → `status`
- `cif` → `tax_id`
- `contacto_principal` → `primary_contact_name`
- `cargo_contacto` → `primary_contact_position`
- `fecha_inicio_colaboracion` → `partnership_start_date`
- `ambito_colaboracion` → `partnership_scope`
- `convenio_firmado` → `agreement_signed`
- `asignado_a` → `assigned_to`

### 8. Profiles → User Profiles

**Decisión**: Renombrar para mayor claridad

**Razón**:
- "profiles" es genérico
- "user_profiles" especifica que son perfiles de usuario
- Evita ambigüedad con "company profiles" u otros perfiles

**Campos**:
- `id` → `id` (sin cambio)
- `email` → `email`
- `full_name` → `full_name`
- `avatar_url` → `avatar_url`

### 9. User Roles → User Roles

**Decisión**: Mantener

**Razón**:
- Ya está en inglés
- Nomenclatura clara y estándar
- No requiere cambios

## Campos Clave por Entidad

### Patrones Comunes de Renombrado

| Patrón ES | Patrón EN | Ejemplos |
|-----------|-----------|----------|
| `nombre` | `name` / `legal_name` | empresas.nombre → companies.legal_name |
| `fecha` | `date` | asesoramientos.fecha → consultations.date |
| `estado` | `status` | empresas.estado → companies.status |
| `tipo` | `type` | eventos.tipo → events.type |
| `descripcion` | `description` | empresas.descripcion → companies.description |
| `observaciones` | `notes` / `remarks` | colaboradores.observaciones → partner_entities.notes |
| `codigo_*` | `*_code` | codigo_postal → postal_code |
| `fecha_*` | `*_date` | fecha_inicio → start_date |
| `*_id` | `*_id` | empresa_id → company_id |

### Campos de Auditoría

Estos campos mantienen el mismo propósito en todas las entidades:

| Campo Actual | Campo Propuesto | Tipo |
|--------------|-----------------|------|
| `created_by` | `created_by` | UUID (FK a users) |
| `created_at` | `created_at` | TIMESTAMP |
| `updated_at` | `updated_at` | TIMESTAMP |

## Relaciones entre Entidades

### Relaciones 1:N (Uno a Muchos)

| Relación Actual | Relación Propuesta |
|----------------|-------------------|
| empresas → contactos | companies → company_contacts |
| empresas → asesoramientos | companies → consultations |
| users → empresas (asignado) | users → companies (assigned) |
| users → asesoramientos | users → consultations |
| empresas → eventos (opcional) | companies → events (opcional) |
| users → colaboradores (asignado) | users → partner_entities (assigned) |

### Relaciones N:1 Opcionales (Evidencias/Attachments)

Las evidencias/attachments pueden relacionarse con múltiples tipos de entidades:

| Relación Actual | Relación Propuesta |
|----------------|-------------------|
| evidencias → empresas | attachments → companies |
| evidencias → eventos | attachments → events |
| evidencias → formaciones | attachments → trainings |
| evidencias → asesoramientos | attachments → consultations |

## Resumen de Cambios

### Entidades Renombradas: 8
1. empresas → companies
2. contactos → company_contacts
3. asesoramientos → consultations
4. eventos → events
5. formaciones → trainings
6. evidencias → attachments
7. colaboradores → partner_entities
8. profiles → user_profiles

### Entidades Mantenidas: 1
1. user_roles (ya en inglés)

### Entidades Consolidadas: 0
No se consolidan entidades en esta fase

### Entidades Descartadas: 0
Todas las entidades actuales se preservan en el nuevo esquema

## Notas de Implementación

1. **Compatibilidad hacia atrás**: Durante la transición, se pueden mantener vistas (views) con los nombres antiguos apuntando a las nuevas tablas
2. **Migración de datos**: Será necesario un script de migración que renombre las tablas y campos
3. **Actualización de código**: Todo el código TypeScript/JavaScript deberá actualizarse para usar los nuevos nombres
4. **Documentación de API**: Los endpoints de la API cambiarán de `/empresas` a `/companies`, etc.
5. **Período de transición**: Se recomienda mantener ambos nombres durante un período de gracia usando alias

## Referencias

- [Modelo de Dominio Actual](./MODELO_DOMINIO.md)
- [Decisiones de Duplicidades Conceptuales](./DECISIONES_DUPLICIDADES.md)
- [Glosario EN→ES para UI](./GLOSARIO_UI.md)
- [Inventario de Catálogos](./INVENTARIO_CATALOGOS.md)
