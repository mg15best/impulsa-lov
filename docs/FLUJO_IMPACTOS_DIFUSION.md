# Flujo de Impactos de Difusión

## Descripción General

El módulo de **Impactos de Difusión** permite registrar, gestionar y analizar las actividades de difusión y comunicación del programa IMPULSA, así como medir su impacto a través de métricas cuantificables.

## Tabla de Base de Datos: `dissemination_impacts`

### Campos Principales

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID | Identificador único del impacto |
| `titulo` | TEXT | Título de la actividad de difusión (obligatorio) |
| `descripcion` | TEXT | Descripción detallada de la actividad |
| `canal` | TEXT | Canal de difusión (catálogo: `dissemination_channels`) |
| `tipo` | TEXT | Tipo de difusión (catálogo: `dissemination_types`) |
| `estado` | ENUM | Estado (`planned`, `active`, `completed`, `cancelled`) |
| `entity_type` | ENUM | Tipo de entidad relacionada (`empresa`, `evento`, `formacion`, `material`, `general`) |
| `entity_id` | UUID | ID de la entidad relacionada |
| `empresa_ids` | UUID[] | Array de IDs de empresas afectadas |
| `fecha_inicio` | DATE | Fecha de inicio de la actividad |
| `fecha_fin` | DATE | Fecha de fin de la actividad |
| `fecha_ejecucion` | DATE | Fecha real de ejecución |
| `alcance` | INTEGER | Alcance/impresiones de la difusión |
| `visualizaciones` | INTEGER | Número de visualizaciones |
| `descargas` | INTEGER | Número de descargas |
| `interacciones` | INTEGER | Número de interacciones/clics |
| `conversiones` | INTEGER | Número de conversiones (registros, aplicaciones, etc.) |
| `metricas_adicionales` | JSONB | Métricas personalizadas en formato JSON |
| `presupuesto` | DECIMAL | Presupuesto asignado (€) |
| `coste_real` | DECIMAL | Coste real ejecutado (€) |
| `publico_objetivo` | TEXT | Descripción del público objetivo |
| `segmento` | TEXT | Segmento de audiencia (catálogo: `audience_segments`) |
| `material_ids` | UUID[] | Array de IDs de materiales utilizados |
| `tags` | TEXT[] | Etiquetas para clasificación |
| `observaciones` | TEXT | Observaciones adicionales |
| `created_by` | UUID | Usuario creador |
| `created_at` | TIMESTAMP | Fecha de creación |
| `updated_at` | TIMESTAMP | Fecha de última actualización |

### Índices

- `idx_dissemination_impacts_canal`: Índice en canal
- `idx_dissemination_impacts_tipo`: Índice en tipo
- `idx_dissemination_impacts_estado`: Índice en estado
- `idx_dissemination_impacts_entity`: Índice compuesto en entity_type y entity_id
- `idx_dissemination_impacts_tags`: Índice GIN para búsqueda en tags
- `idx_dissemination_impacts_empresa_ids`: Índice GIN para empresas afectadas
- `idx_dissemination_impacts_material_ids`: Índice GIN para materiales utilizados
- `idx_dissemination_impacts_metricas`: Índice GIN para métricas adicionales

## Catálogos Relacionados

### `dissemination_channels` - Canales de Difusión

| Código | Etiqueta | Descripción |
|--------|----------|-------------|
| `email` | Email | Correo electrónico (newsletters, mailings) |
| `web` | Web | Sitio web institucional |
| `social_media` | Redes Sociales | Facebook, Twitter, LinkedIn, Instagram |
| `evento` | Evento | Difusión en eventos presenciales |
| `webinar` | Webinar | Webinars y eventos online |
| `newsletter` | Newsletter | Boletines informativos |
| `prensa` | Prensa | Medios de comunicación y prensa |
| `telefono` | Teléfono | Llamadas telefónicas |
| `presencial` | Presencial | Comunicación presencial directa |
| `otro` | Otro | Otros canales |

### `dissemination_types` - Tipos de Difusión

| Código | Etiqueta | Descripción |
|--------|----------|-------------|
| `campaign` | Campaña | Campañas de comunicación |
| `announcement` | Anuncio | Anuncios y comunicados |
| `newsletter` | Newsletter | Envío de newsletter |
| `invitation` | Invitación | Invitaciones a eventos/formaciones |
| `reminder` | Recordatorio | Recordatorios y seguimientos |
| `followup` | Seguimiento | Comunicaciones de seguimiento |
| `promotion` | Promoción | Promociones y ofertas |
| `survey` | Encuesta | Envío de encuestas |
| `report` | Informe | Difusión de informes y resultados |
| `otro` | Otro | Otros tipos |

### `audience_segments` - Segmentos de Audiencia

| Código | Etiqueta | Descripción |
|--------|----------|-------------|
| `all_companies` | Todas las empresas | Todas las empresas registradas |
| `new_companies` | Empresas nuevas | Empresas recientemente incorporadas |
| `active_companies` | Empresas activas | Empresas con actividad reciente |
| `sector_tech` | Sector tecnología | Empresas del sector tecnológico |
| `sector_industry` | Sector industria | Empresas del sector industrial |
| `sector_services` | Sector servicios | Empresas del sector servicios |
| `phase_idea` | Fase idea | Empresas en fase de idea |
| `phase_validation` | Fase validación | Empresas en fase de validación |
| `phase_growth` | Fase crecimiento | Empresas en fase de crecimiento |
| `phase_consolidation` | Fase consolidación | Empresas en fase de consolidación |
| `event_attendees` | Asistentes a eventos | Empresas que asistieron a eventos |
| `training_participants` | Participantes de formaciones | Empresas participantes en formaciones |
| `custom` | Personalizado | Segmentación personalizada |

## Estados y Transiciones

### Estados Disponibles

1. **planned** (Planificado)
   - Actividad de difusión planificada
   - Aún no ejecutada
   
2. **active** (Activo)
   - Actividad en curso
   - Se están registrando métricas
   
3. **completed** (Completado)
   - Actividad finalizada
   - Métricas finales registradas
   - Estado terminal
   
4. **cancelled** (Cancelado)
   - Actividad cancelada
   - Estado terminal

### Flujo de Transiciones

```
planned → active → completed
           ↓
        cancelled
```

**Reglas:**
- `planned` puede activarse o cancelarse
- `active` puede completarse o cancelarse
- `completed` y `cancelled` son estados terminales (no permiten más transiciones)

## Casos de Uso

### 1. Campaña de Email para Invitación a Evento

**Flujo:**
1. Se crea impacto vinculado al evento
2. Se define el segmento de audiencia objetivo
3. Se ejecuta el envío de emails
4. Se registran métricas (alcance, visualizaciones, conversiones)
5. Se marca como completado

**Ejemplo:**
```typescript
{
  titulo: "Invitación - Taller de Digitalización",
  canal: "email",
  tipo: "invitation",
  estado: "completed",
  entity_type: "evento",
  entity_id: "uuid-evento-123",
  segmento: "active_companies",
  alcance: 150,
  visualizaciones: 120,
  interacciones: 45,
  conversiones: 28
}
```

### 2. Publicación en Redes Sociales

**Flujo:**
1. Se crea impacto para RRSS vinculado a material
2. Se publica contenido en redes sociales
3. Se recopilan métricas de engagement
4. Se actualiza con datos reales de alcance

**Ejemplo:**
```typescript
{
  titulo: "Post LinkedIn - Guía de Innovación",
  canal: "social_media",
  tipo: "promotion",
  estado: "completed",
  entity_type: "material",
  entity_id: "uuid-material-456",
  material_ids: ["uuid-material-456"],
  alcance: 5000,
  visualizaciones: 1200,
  interacciones: 85,
  descargas: 42
}
```

### 3. Campaña General de Awareness

**Flujo:**
1. Se crea impacto general (no vinculado a entidad específica)
2. Se ejecuta campaña multicanal
3. Se registran métricas por canal
4. Se analiza efectividad

**Ejemplo:**
```typescript
{
  titulo: "Campaña Awareness Q1 2024",
  canal: "social_media",
  tipo: "campaign",
  estado: "active",
  entity_type: "general",
  fecha_inicio: "2024-01-01",
  fecha_fin: "2024-03-31",
  presupuesto: 5000,
  coste_real: 4200,
  alcance: 25000,
  interacciones: 1500,
  conversiones: 120
}
```

### 4. Newsletter Mensual

**Flujo:**
1. Se crea impacto tipo newsletter
2. Se segmenta audiencia
3. Se envía newsletter
4. Se registran métricas de apertura y clics

**Ejemplo:**
```typescript
{
  titulo: "Newsletter Febrero 2024",
  canal: "newsletter",
  tipo: "newsletter",
  estado: "completed",
  entity_type: "general",
  segmento: "all_companies",
  fecha_ejecucion: "2024-02-15",
  alcance: 200,
  visualizaciones: 145,
  interacciones: 68,
  metricas_adicionales: {
    tasa_apertura: 72.5,
    tasa_clics: 34.0,
    rebotes: 5
  }
}
```

## Métricas de Impacto

### Métricas Estándar

| Métrica | Descripción | Uso |
|---------|-------------|-----|
| **Alcance** | Número de personas/empresas que potencialmente vieron la comunicación | Indica el tamaño de la audiencia |
| **Visualizaciones** | Número real de visualizaciones del contenido | Mide engagement inicial |
| **Descargas** | Número de descargas de materiales | Mide interés en recursos |
| **Interacciones** | Clics, likes, compartidos, respuestas | Mide engagement activo |
| **Conversiones** | Registros, inscripciones, aplicaciones resultantes | Mide efectividad real |

### Métricas Adicionales (JSONB)

Permite almacenar métricas personalizadas:

```json
{
  "tasa_apertura": 75.5,
  "tasa_clics": 32.0,
  "tasa_conversion": 14.2,
  "rebotes": 8,
  "compartidos": 25,
  "comentarios": 12,
  "ctr": 2.5,
  "roi": 180
}
```

## Permisos y Seguridad (RLS)

### Políticas de Row-Level Security

1. **SELECT**: 
   - Todos los usuarios autenticados con roles pueden ver impactos

2. **INSERT**:
   - Solo usuarios `admin` o `tecnico` pueden crear impactos

3. **UPDATE**:
   - Administradores pueden actualizar cualquier impacto
   - Técnicos solo pueden actualizar sus propios impactos

4. **DELETE**:
   - Solo administradores pueden eliminar impactos

## Funciones Helper

### `get_dissemination_impacts_for_entity(p_entity_type, p_entity_id)`

Obtiene todos los impactos de difusión para una entidad específica.

**Uso:**
```sql
SELECT * FROM get_dissemination_impacts_for_entity('evento', 'uuid-evento');
SELECT * FROM get_dissemination_impacts_for_entity('empresa', 'uuid-empresa');
```

### `get_total_impact_metrics_for_entity(p_entity_type, p_entity_id)`

Obtiene métricas agregadas de todos los impactos de una entidad.

**Uso:**
```sql
SELECT * FROM get_total_impact_metrics_for_entity('evento', 'uuid-evento');
-- Retorna: total_alcance, total_visualizaciones, total_descargas, 
--          total_interacciones, total_conversiones, total_actividades
```

## UI - Página de Impactos de Difusión

**Ubicación:** `/impactos-difusion`

**Características:**
- **Dashboard de métricas**: Cards resumen con totales agregados
- Listado con filtros por canal, estado y tipo de entidad
- Búsqueda por título y descripción
- Edición en diálogo modal con secciones organizadas
- Badges de estado con colores distintivos
- Visualización de métricas en tabla

**Secciones del Formulario:**
1. Información básica (título, descripción)
2. Clasificación (canal, tipo, estado, entidad)
3. Fechas (inicio, fin, ejecución)
4. Métricas de impacto (alcance, visualizaciones, descargas, interacciones, conversiones)
5. Presupuesto (presupuesto, coste real)
6. Audiencia (público objetivo, segmento)
7. Observaciones

## Reportes y Análisis

### Métricas Clave para Dashboard

```sql
-- Resumen global de impactos
SELECT 
  COUNT(*) as total_actividades,
  SUM(alcance) as alcance_total,
  SUM(visualizaciones) as visualizaciones_total,
  SUM(interacciones) as interacciones_total,
  SUM(conversiones) as conversiones_total,
  AVG(CASE WHEN alcance > 0 
      THEN (interacciones::float / alcance) * 100 
      ELSE 0 END) as tasa_interaccion_media
FROM dissemination_impacts
WHERE estado = 'completed';

-- Impactos por canal
SELECT 
  canal,
  COUNT(*) as actividades,
  SUM(alcance) as alcance_total,
  SUM(conversiones) as conversiones_total
FROM dissemination_impacts
WHERE estado = 'completed'
GROUP BY canal
ORDER BY conversiones_total DESC;

-- ROI de actividades (con presupuesto)
SELECT 
  titulo,
  presupuesto,
  coste_real,
  conversiones,
  CASE WHEN coste_real > 0 
    THEN ROUND((conversiones::float / coste_real), 2)
    ELSE 0 END as coste_por_conversion
FROM dissemination_impacts
WHERE estado = 'completed' 
  AND coste_real IS NOT NULL
ORDER BY coste_por_conversion ASC;
```

### Integración con Power BI

**Datos exportables para Power BI:**

1. **Tabla de Impactos**: Todos los campos de `dissemination_impacts`
2. **Vista de Métricas Agregadas**: Por período, canal, tipo
3. **Vista de Conversiones**: Conversiones por campaña y segmento
4. **Vista de ROI**: Coste vs. conversiones

**Consulta recomendada para Power BI:**
```sql
SELECT 
  di.id,
  di.titulo,
  di.canal,
  di.tipo,
  di.estado,
  di.entity_type,
  di.fecha_ejecucion,
  di.alcance,
  di.visualizaciones,
  di.descargas,
  di.interacciones,
  di.conversiones,
  di.presupuesto,
  di.coste_real,
  di.segmento,
  di.created_at,
  -- Cálculos derivados
  CASE WHEN di.alcance > 0 
    THEN (di.interacciones::float / di.alcance) * 100 
    ELSE 0 END as tasa_interaccion,
  CASE WHEN di.visualizaciones > 0 
    THEN (di.conversiones::float / di.visualizaciones) * 100 
    ELSE 0 END as tasa_conversion,
  CASE WHEN di.coste_real > 0 
    THEN ROUND((di.conversiones::float / di.coste_real), 2)
    ELSE 0 END as coste_por_conversion
FROM dissemination_impacts di
WHERE di.estado IN ('completed', 'active');
```

## Ejemplos de Integración

### En perfil de Empresa

```typescript
// Mostrar impactos relacionados con la empresa
const { data: impacts } = await supabase
  .from('dissemination_impacts')
  .select('*')
  .contains('empresa_ids', [empresaId]);
```

### En página de Evento

```typescript
// Obtener impactos del evento
const { data: impacts } = await supabase.rpc(
  'get_dissemination_impacts_for_entity',
  { p_entity_type: 'evento', p_entity_id: eventoId }
);

// Obtener métricas totales del evento
const { data: metrics } = await supabase.rpc(
  'get_total_impact_metrics_for_entity',
  { p_entity_type: 'evento', p_entity_id: eventoId }
);
```

### Dashboard General

```typescript
// Métricas totales para dashboard
const { data: impacts } = await supabase
  .from('dissemination_impacts')
  .select('alcance, visualizaciones, descargas, interacciones, conversiones')
  .eq('estado', 'completed');

const totals = impacts.reduce((acc, impact) => ({
  alcance: acc.alcance + (impact.alcance || 0),
  visualizaciones: acc.visualizaciones + (impact.visualizaciones || 0),
  descargas: acc.descargas + (impact.descargas || 0),
  interacciones: acc.interacciones + (impact.interacciones || 0),
  conversiones: acc.conversiones + (impact.conversiones || 0),
}), { alcance: 0, visualizaciones: 0, descargas: 0, interacciones: 0, conversiones: 0 });
```

## Mejores Prácticas

1. **Registro Oportuno**: Registrar impactos inmediatamente después de ejecutar actividades
2. **Métricas Reales**: Usar datos reales de plataformas (Google Analytics, mailchimp, etc.)
3. **Segmentación Clara**: Definir bien el público objetivo y segmento
4. **Vinculación**: Vincular impactos a las entidades correspondientes (eventos, materiales, etc.)
5. **Actualización de Estado**: Mantener estados actualizados (`planned` → `active` → `completed`)
6. **Presupuesto**: Registrar presupuesto y coste real para análisis de ROI
7. **Métricas Adicionales**: Usar campo JSONB para métricas específicas del canal
8. **Tags**: Usar tags para facilitar análisis temáticos
9. **Materiales**: Vincular los materiales utilizados en cada actividad
10. **Documentación**: Incluir observaciones relevantes sobre la ejecución

## KPIs Sugeridos

- **Tasa de Interacción**: `(interacciones / alcance) × 100`
- **Tasa de Conversión**: `(conversiones / visualizaciones) × 100`
- **Coste por Conversión**: `coste_real / conversiones`
- **ROI**: `((conversiones × valor_conversión) - coste_real) / coste_real × 100`
- **Efectividad por Canal**: Comparar métricas entre canales
- **Tendencia Temporal**: Evolución de métricas en el tiempo
