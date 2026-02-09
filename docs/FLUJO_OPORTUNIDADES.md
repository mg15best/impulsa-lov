# Flujo de Oportunidades - Impulsa LOV

## Índice
1. [Introducción](#introducción)
2. [Modelo de Datos](#modelo-de-datos)
3. [Flujo de Trabajo](#flujo-de-trabajo)
4. [Estados y Etapas](#estados-y-etapas)
5. [Funcionalidades](#funcionalidades)
6. [Integración con Empresas](#integración-con-empresas)
7. [Permisos y Seguridad](#permisos-y-seguridad)

## Introducción

El módulo de Oportunidades permite el seguimiento sistemático del pipeline de ventas y oportunidades de negocio asociadas a cada empresa. Este sistema ayuda a gestionar el proceso desde la identificación inicial de una oportunidad hasta su cierre, ya sea exitoso o no.

### Objetivos

- **Seguimiento del Pipeline**: Visualizar y gestionar todas las oportunidades en diferentes etapas del proceso de venta
- **Gestión por Empresa**: Organizar oportunidades por empresa para un seguimiento coherente
- **Registro de Actividad**: Mantener un historial completo de notas y actividades por oportunidad
- **Métricas de Valor**: Estimar valores económicos y probabilidades de cierre
- **Trazabilidad**: Registrar el origen de cada oportunidad y su evolución

## Modelo de Datos

### Tabla: opportunities

Almacena la información principal de cada oportunidad.

**Campos Principales:**
- `id` (UUID): Identificador único de la oportunidad
- `company_id` (UUID): Referencia a la empresa (FK a empresas)
- `title` (TEXT): Título descriptivo de la oportunidad
- `description` (TEXT): Descripción detallada de la oportunidad

**Campos de Clasificación:**
- `stage_code` (TEXT): Etapa actual en el pipeline (del catálogo opportunity_stages)
- `status_code` (TEXT): Estado de la oportunidad (del catálogo opportunity_statuses)
- `source_code` (TEXT): Origen de la oportunidad (del catálogo lead_sources)

**Campos de Valor:**
- `estimated_value` (DECIMAL): Valor económico estimado de la oportunidad
- `probability` (INTEGER): Probabilidad de cierre (0-100%)

**Campos de Fechas:**
- `expected_close_date` (DATE): Fecha esperada de cierre
- `actual_close_date` (DATE): Fecha real de cierre

**Campos de Gestión:**
- `assigned_to_id` (UUID): Usuario asignado responsable
- `notes` (TEXT): Notas generales
- `created_by` (UUID): Usuario que creó el registro
- `created_at` (TIMESTAMP): Fecha de creación
- `updated_at` (TIMESTAMP): Fecha de última actualización

### Tabla: opportunity_notes

Almacena notas de seguimiento cronológico para cada oportunidad.

**Campos:**
- `id` (UUID): Identificador único de la nota
- `opportunity_id` (UUID): Referencia a la oportunidad (FK a opportunities)
- `note` (TEXT): Contenido de la nota
- `created_by` (UUID): Usuario que creó la nota
- `created_at` (TIMESTAMP): Fecha de creación de la nota
- `updated_at` (TIMESTAMP): Fecha de última actualización

### Relaciones

```
empresas (1) ----< (N) opportunities
opportunities (1) ----< (N) opportunity_notes
users (1) ----< (N) opportunities [assigned_to_id]
users (1) ----< (N) opportunities [created_by]
users (1) ----< (N) opportunity_notes [created_by]
```

## Flujo de Trabajo

### 1. Creación de Oportunidad

1. **Identificación**: Se identifica una nueva oportunidad de negocio
2. **Registro**: Se crea un registro en el sistema asociado a una empresa
3. **Clasificación**: Se asigna etapa inicial, estado, y origen
4. **Estimación**: Se define valor estimado y probabilidad de éxito
5. **Asignación**: Se asigna un responsable para su seguimiento

### 2. Seguimiento de Oportunidad

1. **Actualización**: Se actualiza la etapa conforme avanza el proceso
2. **Notas**: Se añaden notas de seguimiento con cada interacción
3. **Ajustes**: Se ajusta probabilidad y valor según evoluciona
4. **Fechas**: Se actualiza la fecha esperada de cierre

### 3. Cierre de Oportunidad

1. **Cierre Exitoso**:
   - Estado → "won" (Ganado)
   - Etapa → "closed_won" (Cerrado Ganado)
   - Se registra fecha real de cierre
   
2. **Cierre No Exitoso**:
   - Estado → "lost" (Perdido) o "cancelled" (Cancelado)
   - Etapa → "closed_lost" (Cerrado Perdido)
   - Se registra motivo en notas

## Estados y Etapas

### Etapas del Pipeline (opportunity_stages)

Las etapas representan el progreso de la oportunidad a través del proceso de venta:

1. **identification** - Identificación: Oportunidad detectada pero no cualificada
2. **qualification** - Cualificación: Se está evaluando si la oportunidad es viable
3. **proposal** - Propuesta: Se está preparando o presentando una propuesta
4. **negotiation** - Negociación: Se están discutiendo términos y condiciones
5. **closing** - Cierre: En proceso de formalización del acuerdo
6. **closed_won** - Cerrado Ganado: Oportunidad cerrada exitosamente
7. **closed_lost** - Cerrado Perdido: Oportunidad no concretada

### Estados (opportunity_statuses)

Los estados indican la situación actual de trabajo en la oportunidad:

1. **open** - Abierto: Oportunidad activa en etapas iniciales
2. **in_progress** - En Progreso: Se está trabajando activamente en la oportunidad
3. **on_hold** - En Espera: Pausada temporalmente
4. **won** - Ganado: Oportunidad cerrada con éxito
5. **lost** - Perdido: Oportunidad perdida
6. **cancelled** - Cancelado: Oportunidad cancelada

### Orígenes (lead_sources)

Se reutiliza el catálogo `lead_sources` existente:

- web, referral, event, partner, direct, campaign, social_media, other

## Funcionalidades

### Vista de Lista

- **Filtrado Múltiple**:
  - Por empresa
  - Por etapa del pipeline
  - Por estado
  - Búsqueda por texto en título y descripción

- **Información Visible**:
  - Título de la oportunidad
  - Empresa asociada
  - Etapa y estado (con badges de colores)
  - Valor estimado (formateado como moneda)
  - Probabilidad de cierre (%)
  - Fecha esperada de cierre

- **Acciones Disponibles**:
  - Ver detalles
  - Editar
  - Eliminar

### Vista de Detalles

Muestra información completa de la oportunidad:

- Todos los campos principales
- Descripción completa
- Notas generales
- **Sección de Notas de Seguimiento**:
  - Lista cronológica de notas
  - Añadir nuevas notas
  - Eliminar notas existentes

### Creación y Edición

Formulario con:
- Campos obligatorios: Título, Empresa
- Selección de etapa, estado y origen mediante catálogos
- Campos numéricos para valor y probabilidad
- Selector de fecha para cierre esperado
- Áreas de texto para descripción y notas

### Gestión de Notas

- **Añadir Nota**: Captura rápida de información de seguimiento
- **Visualización**: Ordenadas por fecha (más reciente primero)
- **Eliminar**: Control granular de notas obsoletas

## Integración con Empresas

### Relación Company-Opportunity

- Cada oportunidad está vinculada a una empresa específica
- Una empresa puede tener múltiples oportunidades
- El filtro por empresa permite ver todas las oportunidades de un cliente

### Vista Contextual

Aunque la vista principal es por oportunidades, el sistema está diseñado para:
- Mostrar el nombre de la empresa en cada oportunidad
- Filtrar oportunidades por empresa
- Navegar entre empresa y sus oportunidades

## Permisos y Seguridad

### Row Level Security (RLS)

Todas las tablas tienen RLS habilitado con las siguientes políticas:

#### opportunities

- **SELECT**: Todos los usuarios autenticados con rol pueden ver oportunidades
- **INSERT**: Solo usuarios con rol 'admin' o 'tecnico'
- **UPDATE**: Solo usuarios con rol 'admin' o 'tecnico'
- **DELETE**: Solo usuarios con rol 'admin' o 'tecnico'

#### opportunity_notes

- **SELECT**: Todos los usuarios autenticados con rol pueden ver notas
- **INSERT**: Solo usuarios con rol 'admin' o 'tecnico'
- **UPDATE**: Solo usuarios con rol 'admin' o 'tecnico'
- **DELETE**: Solo usuarios con rol 'admin' o 'tecnico'

### Permisos en la UI

La interfaz utiliza el componente `PermissionButton` que:
- Verifica permisos usando el hook `useUserRoles`
- Deshabilita automáticamente botones para usuarios sin permisos de escritura
- Permite visualización a todos los usuarios autenticados
- Restringe creación, edición y eliminación a admin/tecnico

## Casos de Uso

### Caso 1: Nueva Oportunidad desde Contacto

1. Se recibe un contacto de una empresa interesada
2. Se crea oportunidad con:
   - Título: "Consultoría en transformación digital"
   - Empresa: [Empresa existente]
   - Etapa: identification
   - Estado: open
   - Origen: web
   - Valor estimado: 15,000€
   - Probabilidad: 30%

3. Se añade nota inicial con contexto de la conversación

### Caso 2: Progresión de Oportunidad

1. Primera reunión → Añadir nota, cambiar etapa a "qualification"
2. Cualificación positiva → Añadir nota, cambiar etapa a "proposal", aumentar probabilidad a 50%
3. Propuesta enviada → Añadir nota con detalles de la propuesta
4. Negociación → Cambiar etapa a "negotiation", ajustar valor si hay cambios
5. Cierre → Estado a "won", etapa a "closed_won", registrar fecha real de cierre

### Caso 3: Seguimiento de Pipeline

1. Filtrar por etapa "proposal" para ver todas las propuestas pendientes
2. Revisar cada oportunidad y sus notas recientes
3. Identificar oportunidades que requieren seguimiento
4. Añadir notas de acción en cada una

## Métricas y Reportes

### KPIs Sugeridos

- **Tasa de Conversión**: % de oportunidades ganadas vs totales
- **Valor del Pipeline**: Suma de valores estimados ponderados por probabilidad
- **Tiempo Medio de Cierre**: Días promedio desde creación hasta cierre
- **Distribución por Etapa**: Número de oportunidades en cada etapa
- **Fuentes más Efectivas**: Orígenes con mayor tasa de conversión

### Análisis

- Pipeline por empresa para identificar clientes más activos
- Evolución temporal de oportunidades nuevas vs cerradas
- Análisis de probabilidad vs resultado real para calibración

## Mejores Prácticas

1. **Actualización Regular**: Mantener las oportunidades actualizadas con la etapa correcta
2. **Notas Descriptivas**: Añadir notas detalladas en cada interacción importante
3. **Valores Realistas**: Estimar valores conservadores y ajustar conforme se confirma
4. **Probabilidades Calibradas**: Usar probabilidades estándar por etapa y ajustar según contexto
5. **Fechas Actualizadas**: Revisar y actualizar fechas esperadas de cierre regularmente
6. **Cierre Completo**: Siempre cerrar oportunidades con estado final y fecha real

## Extensiones Futuras

Posibles mejoras al módulo:

1. **Tareas Asociadas**: Vincular tareas/actividades a oportunidades
2. **Documentos**: Adjuntar propuestas y contratos
3. **Flujos Automatizados**: Notificaciones automáticas en cambios de etapa
4. **Plantillas**: Templates de propuesta reutilizables
5. **Análisis Predictivo**: Sugerencias de probabilidad basadas en histórico
6. **Integración CRM**: Sincronización con sistemas externos
7. **Dashboard de Pipeline**: Visualización tipo kanban del pipeline
