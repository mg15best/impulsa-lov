# Integración Power BI - Impulsa LOV

## Índice
1. [Introducción](#introducción)
2. [Modo de Consumo](#modo-de-consumo)
3. [Configuración de Conexión](#configuración-de-conexión)
4. [Vistas y Tablas Disponibles](#vistas-y-tablas-disponibles)
5. [Mapeo de Datos](#mapeo-de-datos)
6. [Seguridad y Permisos](#seguridad-y-permisos)
7. [Actualización de Datos](#actualización-de-datos)
8. [Ejemplos de Consultas](#ejemplos-de-consultas)

## Introducción

Este documento describe la integración de Impulsa LOV con Microsoft Power BI para la generación de informes y dashboards avanzados. La integración permite consumir datos del sistema mediante una conexión directa a la base de datos PostgreSQL de Supabase.

### Objetivos de la Integración

- **Análisis Avanzado**: Crear dashboards personalizados con visualizaciones complejas
- **Histórico de KPIs**: Analizar tendencias y evolución temporal de indicadores
- **Reportes Ejecutivos**: Generar informes automáticos para dirección
- **Exportación de Datos**: Facilitar la extracción de datos para análisis externo

## Modo de Consumo

### Opción Recomendada: Conexión Directa a PostgreSQL

Power BI se conectará directamente a la base de datos PostgreSQL de Supabase mediante:

**Ventajas**:
- ✅ Datos en tiempo real
- ✅ Uso de Row Level Security (RLS) de Supabase
- ✅ Consultas optimizadas mediante vistas
- ✅ Sin necesidad de APIs intermedias
- ✅ Mejor rendimiento para grandes volúmenes de datos

**Configuración**:
```
Tipo de Conexión: PostgreSQL
Servidor: db.SUPABASE_PROJECT_ID.supabase.co
Puerto: 5432
Base de Datos: postgres
Modo de Datos: DirectQuery (recomendado) o Import
```

### Autenticación

Se recomienda crear un usuario de solo lectura específico para Power BI:

```sql
-- Crear usuario de Power BI (ejecutar como admin)
CREATE USER powerbi_reader WITH PASSWORD 'SECURE_PASSWORD';

-- Otorgar permisos de lectura
GRANT USAGE ON SCHEMA public TO powerbi_reader;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO powerbi_reader;
GRANT SELECT ON ALL VIEWS IN SCHEMA public TO powerbi_reader;

-- Asegurar permisos en tablas futuras
ALTER DEFAULT PRIVILEGES IN SCHEMA public 
  GRANT SELECT ON TABLES TO powerbi_reader;
```

**Nota**: Este usuario respetará las políticas RLS de Supabase si se configura correctamente.

## Vistas y Tablas Disponibles

### Vistas de KPIs (Recomendadas para Power BI)

#### 1. `kpi_export`
**Propósito**: Valores actuales de todos los KPIs
**Uso**: Dashboard principal de KPIs

**Campos**:
- `kpi_id` (TEXT): Identificador único del KPI
- `label` (TEXT): Nombre del KPI
- `value` (NUMERIC): Valor actual
- `target` (NUMERIC): Meta objetivo
- `percentage` (NUMERIC): Porcentaje de cumplimiento
- `calculated_at` (TIMESTAMP): Fecha del último cálculo
- `metadata` (JSONB): Metadatos adicionales
- `created_by_name` (TEXT): Usuario que generó el snapshot
- `created_at` (TIMESTAMP): Fecha de creación

**Ejemplo de uso en Power BI**:
```sql
SELECT * FROM kpi_export
ORDER BY kpi_id;
```

#### 2. `kpi_history_export`
**Propósito**: Histórico completo de KPIs para análisis temporal
**Uso**: Gráficos de tendencias, análisis de evolución

**Campos adicionales**:
- `snapshot_date` (DATE): Fecha del snapshot (sin hora)
- `snapshot_year` (INTEGER): Año del snapshot
- `snapshot_month` (INTEGER): Mes del snapshot
- `snapshot_week` (INTEGER): Semana del snapshot
- `snapshot_day_of_week` (INTEGER): Día de la semana
- `status_label` (TEXT): Etiqueta de estado ('Alcanzado', 'Excelente', etc.)
- `status_color` (TEXT): Color del estado ('success', 'warning', etc.)
- `deviation` (NUMERIC): Desviación respecto al objetivo
- `deviation_percentage` (NUMERIC): Desviación en porcentaje

**Ejemplo de uso en Power BI**:
```sql
-- Últimos 90 días de historia
SELECT * FROM kpi_history_export
WHERE calculated_at >= CURRENT_DATE - INTERVAL '90 days'
ORDER BY calculated_at DESC, kpi_id;
```

#### 3. `materials_kpi_source`
**Propósito**: Vista unificada de materiales que contribuyen a KPIs
**Uso**: Análisis de materiales educativos

**Campos clave**:
- `material_id` (UUID)
- `titulo` (TEXT)
- `tipo` (TEXT)
- `estado` (TEXT)
- `contributes_to_kpi` (TEXT): Indica a qué KPI contribuye
- `num_formaciones` (INTEGER): Número de formaciones asociadas
- `num_eventos` (INTEGER): Número de eventos asociados
- `numero_descargas` (INTEGER): Total de descargas

#### 4. `dissemination_kpi_source`
**Propósito**: Vista unificada de impactos de difusión
**Uso**: Análisis de actividades de comunicación

**Campos clave**:
- `dissemination_id` (UUID)
- `titulo` (TEXT)
- `canal` (TEXT)
- `tipo` (TEXT)
- `estado` (TEXT)
- `contributes_to_kpi` (TEXT): Indica a qué KPI contribuye
- `alcance` (INTEGER): Alcance/impresiones
- `visualizaciones` (INTEGER): Número de vistas
- `interacciones` (INTEGER): Interacciones
- `conversiones` (INTEGER): Conversiones
- `impact_score` (NUMERIC): Puntuación de impacto calculada

### Tablas Base (Para Análisis Detallado)

#### Empresas
- `empresas`: Información completa de empresas
- `colaboradores`: Entidades colaboradoras
- `asesoramientos`: Asesoramientos realizados

#### Actividades
- `eventos`: Eventos y talleres
- `formaciones`: Formaciones y píldoras formativas
- `materials`: Materiales educativos (PR-J)
- `dissemination_impacts`: Impactos de difusión (PR-J)

#### Catálogos
- `catalogs`: Definición de catálogos
- `catalog_values`: Valores de catálogos

## Mapeo de Datos

### Dashboard Principal - KPIs Operativos

**Medidas recomendadas**:
```dax
// Porcentaje de cumplimiento promedio
Cumplimiento Promedio = 
AVERAGE(kpi_export[percentage])

// Número de KPIs alcanzados (>= 100%)
KPIs Alcanzados = 
COUNTROWS(
  FILTER(kpi_export, kpi_export[percentage] >= 100)
)

// Alerta de KPIs críticos (< 50%)
KPIs Críticos = 
COUNTROWS(
  FILTER(kpi_export, kpi_export[percentage] < 50)
)
```

**Visualizaciones sugeridas**:
- Tarjetas (Cards) para cada KPI mostrando valor/target
- Medidores (Gauges) con porcentaje de cumplimiento
- Gráfico de barras horizontal con todos los KPIs
- Tabla con detalles de cada KPI

### Dashboard de Tendencias - KPIs Históricos

**Medidas recomendadas**:
```dax
// Tendencia mensual
Tendencia Mensual = 
CALCULATE(
  AVERAGE(kpi_history_export[value]),
  DATESINPERIOD(
    kpi_history_export[snapshot_date],
    LASTDATE(kpi_history_export[snapshot_date]),
    -1,
    MONTH
  )
)

// Crecimiento vs mes anterior
Crecimiento MoM = 
VAR CurrentValue = AVERAGE(kpi_history_export[value])
VAR PreviousValue = 
  CALCULATE(
    AVERAGE(kpi_history_export[value]),
    DATEADD(kpi_history_export[snapshot_date], -1, MONTH)
  )
RETURN
  DIVIDE(CurrentValue - PreviousValue, PreviousValue, 0)
```

**Visualizaciones sugeridas**:
- Gráfico de líneas: evolución temporal de cada KPI
- Gráfico de áreas apiladas: comparación de múltiples KPIs
- Tabla de evolución con valores y variaciones
- Mapa de calor: rendimiento por KPI y periodo

### Dashboard de Materiales

**Medidas recomendadas**:
```dax
// Total de materiales activos
Total Materiales = 
COUNTROWS(materials_kpi_source)

// Materiales por tipo
Materiales por Tipo = 
CALCULATE(
  COUNT(materials_kpi_source[material_id]),
  ALLEXCEPT(materials_kpi_source, materials_kpi_source[tipo])
)

// Tasa de uso (materiales con formaciones)
Tasa de Uso = 
DIVIDE(
  COUNTROWS(
    FILTER(materials_kpi_source, materials_kpi_source[num_formaciones] > 0)
  ),
  COUNTROWS(materials_kpi_source),
  0
)
```

### Dashboard de Difusión

**Medidas recomendadas**:
```dax
// Alcance total
Alcance Total = 
SUM(dissemination_kpi_source[alcance])

// ROI de difusión (conversiones / alcance)
ROI Difusión = 
DIVIDE(
  SUM(dissemination_kpi_source[conversiones]),
  SUM(dissemination_kpi_source[alcance]),
  0
)

// Puntuación de impacto promedio
Impacto Promedio = 
AVERAGE(dissemination_kpi_source[impact_score])
```

## Seguridad y Permisos

### Row Level Security (RLS)

Las vistas heredan las políticas RLS de Supabase:

**kpi_export y kpi_history_export**:
- ✅ Lectura: Todos los usuarios autenticados
- ❌ Escritura: Solo admin y tecnico

**materials_kpi_source**:
- ✅ Lectura: Usuarios autenticados
- Datos filtrados según permisos del usuario

**dissemination_kpi_source**:
- ✅ Lectura: Usuarios autenticados
- Datos filtrados según permisos del usuario

### Configuración de RLS en Power BI

Para implementar seguridad adicional en Power BI:

```dax
// Crear rol de usuario
[UserRole] = 
LOOKUPVALUE(
  profiles[role],
  profiles[email],
  USERNAME()
)

// Aplicar filtro
[RLS Filter] = 
[UserRole] IN {"admin", "tecnico", "visualizador"}
```

## Actualización de Datos

### Frecuencia de Actualización Recomendada

**DirectQuery** (Recomendado):
- Datos en tiempo real
- Sin necesidad de actualización programada
- Mayor carga en la base de datos

**Import Mode**:
- Actualización programada cada 1-4 horas
- Mejor rendimiento en Power BI
- Datos con cierto retraso

### Snapshot Manual de KPIs

Para crear snapshots históricos:

```sql
-- Ejecutar manualmente o programar
SELECT * FROM snapshot_kpis();
```

**Programación con pg_cron** (opcional):
```sql
-- Snapshot diario a las 00:00
SELECT cron.schedule('daily-kpi-snapshot', '0 0 * * *', 
  'SELECT snapshot_kpis();'
);
```

## Ejemplos de Consultas

### Query 1: KPIs del mes actual vs mes anterior

```sql
WITH current_month AS (
  SELECT 
    kpi_id,
    AVG(value) as current_value,
    AVG(percentage) as current_percentage
  FROM kpi_history_export
  WHERE snapshot_year = EXTRACT(YEAR FROM CURRENT_DATE)
    AND snapshot_month = EXTRACT(MONTH FROM CURRENT_DATE)
  GROUP BY kpi_id
),
previous_month AS (
  SELECT 
    kpi_id,
    AVG(value) as previous_value,
    AVG(percentage) as previous_percentage
  FROM kpi_history_export
  WHERE snapshot_date >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month'
    AND snapshot_date < DATE_TRUNC('month', CURRENT_DATE)
  GROUP BY kpi_id
)
SELECT 
  c.kpi_id,
  c.current_value,
  p.previous_value,
  c.current_value - p.previous_value as value_change,
  c.current_percentage,
  p.previous_percentage,
  c.current_percentage - p.previous_percentage as percentage_change
FROM current_month c
LEFT JOIN previous_month p ON c.kpi_id = p.kpi_id
ORDER BY c.kpi_id;
```

### Query 2: Top 10 materiales más descargados

```sql
SELECT 
  titulo,
  tipo,
  numero_descargas,
  num_formaciones,
  num_eventos,
  num_empresas
FROM materials_kpi_source
ORDER BY numero_descargas DESC
LIMIT 10;
```

### Query 3: Rendimiento de campañas de difusión

```sql
SELECT 
  titulo,
  canal,
  tipo,
  alcance,
  visualizaciones,
  interacciones,
  conversiones,
  impact_score,
  CASE 
    WHEN alcance > 0 THEN ROUND((visualizaciones::NUMERIC / alcance * 100), 2)
    ELSE 0
  END as tasa_visualizacion,
  CASE 
    WHEN visualizaciones > 0 THEN ROUND((interacciones::NUMERIC / visualizaciones * 100), 2)
    ELSE 0
  END as tasa_interaccion
FROM dissemination_kpi_source
WHERE estado = 'completed'
ORDER BY impact_score DESC;
```

### Query 4: Evolución semanal de KPIs

```sql
SELECT 
  snapshot_week,
  snapshot_year,
  kpi_id,
  label,
  AVG(value) as avg_value,
  AVG(percentage) as avg_percentage,
  MIN(value) as min_value,
  MAX(value) as max_value
FROM kpi_history_export
WHERE calculated_at >= CURRENT_DATE - INTERVAL '12 weeks'
GROUP BY snapshot_week, snapshot_year, kpi_id, label
ORDER BY snapshot_year DESC, snapshot_week DESC, kpi_id;
```

## Mejores Prácticas

### Performance

1. **Usar vistas en lugar de tablas base** cuando sea posible
2. **Implementar filtros de fecha** para limitar el volumen de datos
3. **Usar DirectQuery para dashboards en tiempo real**, Import para análisis histórico
4. **Crear índices** en campos frecuentemente filtrados o agrupados
5. **Limitar el número de visualizaciones** en una sola página del dashboard

### Diseño de Dashboards

1. **Página 1**: Overview ejecutivo con KPIs principales
2. **Página 2**: Tendencias y evolución temporal
3. **Página 3**: Análisis detallado por categoría (empresas, formaciones, etc.)
4. **Página 4**: Análisis de materiales y difusión
5. **Incluir filtros globales**: fecha, técnico asignado, sector

### Actualización de Datos

1. **Snapshot diario** de KPIs para análisis histórico
2. **Actualización del modelo** en Power BI cada 1-4 horas (modo Import)
3. **Monitorear el rendimiento** de las queries y optimizar si es necesario

## Soporte y Mantenimiento

### Contacto
- Documentación técnica: `docs/DEFINICION_KPIS.md`
- Configuración de KPIs: `src/config/kpis.ts`
- Cálculos de KPIs: `src/hooks/useKPICalculations.ts`

### Versionado
- **Versión**: 1.0 (PR-K)
- **Fecha**: 2026-02-09
- **Autor**: Sistema Impulsa LOV

### Cambios Futuros
- Los nuevos KPIs se añadirán automáticamente a las vistas
- Las tablas base mantendrán compatibilidad hacia atrás
- Los cambios en el esquema se documentarán en las migraciones

---

**Nota**: Esta integración fue diseñada como parte de PR-K para completar el sistema de 360º de KPIs de Impulsa LOV.
