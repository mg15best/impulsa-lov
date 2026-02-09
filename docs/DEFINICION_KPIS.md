# Definición de KPIs - Impulsa LOV

## Índice
1. [Introducción](#introducción)
2. [KPIs Operativos](#kpis-operativos)
3. [KPIs Estratégicos](#kpis-estratégicos)
4. [KPIs de Impacto](#kpis-de-impacto)
5. [Fórmulas y Cálculos Detallados](#fórmulas-y-cálculos-detallados)
6. [Dashboard y Visualización](#dashboard-y-visualización)

## Introducción

Este documento define los KPIs (Key Performance Indicators) del sistema Impulsa LOV. Cada KPI incluye:
- **Fuente de datos**: De dónde se obtiene la información
- **Criterio**: Qué condiciones debe cumplir para ser contabilizado
- **Fórmula**: Cómo se calcula el valor
- **Meta**: Objetivo a alcanzar
- **Frecuencia de actualización**: Con qué frecuencia se actualiza

## KPIs Operativos

### KPI 1: Empresas Asesoradas

**Descripción**: Número de empresas que han completado al menos un asesoramiento o que están en estado "asesorada" o "completada".

**Fuente de datos**:
- Tabla: `empresas`
- Campo: `estado`

**Criterio**:
- Empresas con estado = 'asesorada' OR estado = 'completada'
- Alternativamente: Empresas con al menos un asesoramiento completado

**Fórmula**:
```sql
SELECT COUNT(DISTINCT id)
FROM empresas
WHERE estado IN ('asesorada', 'completada');
```

**Fórmula alternativa (basada en asesoramientos)**:
```sql
SELECT COUNT(DISTINCT empresa_id)
FROM asesoramientos
WHERE estado = 'completado';
```

**Meta**: 20 empresas
**Frecuencia de actualización**: Diaria
**Visualización**: Número absoluto con progreso hacia la meta

---

### KPI 2: Informes Generados

**Descripción**: Número de asesoramientos que tienen el indicador de informe generado marcado como verdadero.

**Fuente de datos**:
- Tabla: `asesoramientos`
- Campo: `informe_generado`

**Criterio**:
- Asesoramientos con informe_generado = true

**Fórmula**:
```sql
SELECT COUNT(*)
FROM asesoramientos
WHERE informe_generado = true;
```

**Meta**: 15 informes
**Frecuencia de actualización**: Diaria
**Visualización**: Número absoluto con progreso hacia la meta

---

### KPI 3: Eventos Realizados

**Descripción**: Número de eventos que han sido completados.

**Fuente de datos**:
- Tabla: `eventos`
- Campo: `estado`

**Criterio**:
- Eventos con estado = 'completado'

**Fórmula**:
```sql
SELECT COUNT(*)
FROM eventos
WHERE estado = 'completado';
```

**Meta**: 2 eventos
**Frecuencia de actualización**: Diaria
**Visualización**: Número absoluto con progreso hacia la meta

**KPIs relacionados**:
- Total de asistentes a eventos completados
- Eventos por tipo (taller, seminario, networking, etc.)

---

### KPI 4: Píldoras Formativas

**Descripción**: Número de formaciones de tipo "píldora formativa" que han sido completadas.

**Fuente de datos**:
- Tabla: `formaciones`
- Campos: `tipo`, `estado`

**Criterio**:
- Formaciones con tipo = 'pildora_formativa' AND estado = 'completada'

**Fórmula**:
```sql
SELECT COUNT(*)
FROM formaciones
WHERE tipo = 'pildora_formativa'
  AND estado = 'completada';
```

**Meta**: 6 píldoras formativas
**Frecuencia de actualización**: Diaria
**Visualización**: Número absoluto con progreso hacia la meta

**KPIs relacionados**:
- Total de participantes en píldoras formativas
- Horas totales de formación impartidas

---

### KPI 5: Entidades Colaboradoras

**Descripción**: Número de colaboradores con estado activo y que tienen convenio firmado.

**Fuente de datos**:
- Tabla: `colaboradores`
- Campos: `estado`, `convenio_firmado`

**Criterio**:
- Colaboradores con estado = 'activo' AND convenio_firmado = true

**Fórmula**:
```sql
SELECT COUNT(*)
FROM colaboradores
WHERE estado = 'activo'
  AND convenio_firmado = true;
```

**Fórmula alternativa (solo activos)**:
```sql
SELECT COUNT(*)
FROM colaboradores
WHERE estado = 'activo';
```

**Meta**: 8 entidades colaboradoras
**Frecuencia de actualización**: Semanal
**Visualización**: Número absoluto con progreso hacia la meta

---

### KPI 6: Impactos de Difusión

**Descripción**: Número de actividades de difusión completadas que han generado impacto medible.

**Fuente de datos** (PR-K Actualización):
- Tabla principal: `dissemination_impacts` (PR-J)
- Campo: `estado`
- Vista unificada: `dissemination_kpi_source` para análisis detallado

**Fuente de datos alternativa** (Legacy):
- Tabla: `evidencias`
- Campos: `tipo`, `evento_id`, `formacion_id`
- Tablas relacionadas: `eventos`, `formaciones`

**Criterio**:
- **Preferido (PR-K)**: Difusiones con estado = 'completed' en tabla `dissemination_impacts`
- **Alternativo**: Evidencias con tipo IN ('fotografia', 'video', 'otro') relacionadas con eventos completados O formaciones completadas

**Fórmula preferida (PR-K)**:
```sql
SELECT COUNT(*)
FROM dissemination_impacts
WHERE estado = 'completed';
```

**Fórmula alternativa (Legacy)**:
```sql
SELECT COUNT(DISTINCT e.id)
FROM evidencias e
LEFT JOIN eventos ev ON e.evento_id = ev.id
LEFT JOIN formaciones f ON e.formacion_id = f.id
WHERE e.tipo IN ('fotografia', 'video', 'otro')
  AND (
    ev.estado = 'completado'
    OR f.estado = 'completada'
  );
```

**Vista unificada para Power BI**:
```sql
SELECT * FROM dissemination_kpi_source
WHERE contributes_to_kpi = 'KPI 6 - Impactos de Difusión';
```

**Meta**: 15 impactos de difusión
**Frecuencia de actualización**: Semanal
**Visualización**: Número absoluto con progreso hacia la meta

**Notas**: 
- PR-K introduce la tabla `dissemination_impacts` como fuente principal para este KPI
- La vista `dissemination_kpi_source` unifica el acceso a datos de difusión
- Se mantiene compatibilidad con `evidencias` para datos históricos

---

### KPI 7: Material de Apoyo

**Descripción**: Número de materiales educativos publicados y asociados a formaciones.

**Fuente de datos** (PR-K Actualización):
- Tabla principal: `materials` (PR-J)
- Campos: `estado`, `tipo`, `formacion_ids`
- Vista unificada: `materials_kpi_source` para análisis detallado

**Fuente de datos alternativa** (Legacy):
- Tabla: `evidencias`
- Campos: `tipo`, `formacion_id`

**Criterio**:
- **Preferido (PR-K)**: Materiales con estado = 'published' AND (tipo IN ('documento', 'guia', 'manual', 'presentacion') OR tiene formaciones asociadas)
- **Alternativo**: Evidencias con tipo IN ('documento', 'certificado', 'informe') relacionadas con formaciones

**Fórmula preferida (PR-K)**:
```sql
SELECT COUNT(*)
FROM materials
WHERE estado = 'published' 
  AND (tipo IN ('documento', 'guia', 'manual', 'presentacion') 
       OR (formacion_ids IS NOT NULL AND array_length(formacion_ids, 1) > 0));
```

**Fórmula alternativa (Legacy)**:
```sql
SELECT COUNT(*)
FROM evidencias
WHERE tipo IN ('documento', 'certificado', 'informe')
  AND formacion_id IS NOT NULL;
```

**Vista unificada para Power BI**:
```sql
SELECT * FROM materials_kpi_source
WHERE contributes_to_kpi = 'KPI 7 - Material de Apoyo';
```

**Meta**: 5 materiales de apoyo
**Frecuencia de actualización**: Semanal
**Visualización**: Número absoluto con progreso hacia la meta

**Notas**: 
- PR-K introduce la tabla `materials` como fuente principal para este KPI
- La vista `materials_kpi_source` unifica el acceso a datos de materiales
- Se mantiene compatibilidad con `evidencias` para datos históricos
- Los materiales pueden estar asociados a múltiples formaciones vía array `formacion_ids`

---

### KPI 8: Cuadro de Mando PowerBI

**Descripción**: Indicador binario de si existe un dashboard de PowerBI configurado e integrado.

**Fuente de datos**:
- Configuración del sistema
- Estado de la integración con Power Platform

**Criterio**:
- Integración con Power Platform activa
- Dashboard publicado y accesible

**Fórmula**:
```javascript
// En el código del frontend
const powerBIConfigured = 
  !!import.meta.env.VITE_POWER_TENANT_ID &&
  !!import.meta.env.VITE_POWER_CLIENT_ID &&
  !!import.meta.env.VITE_POWER_API_BASE_URL;

const kpiValue = powerBIConfigured ? 1 : 0;
```

**Meta**: 1 (configurado)
**Frecuencia de actualización**: Al cargar la aplicación
**Visualización**: Indicador binario (Sí/No)

---

## KPIs Estratégicos

### KPI 9: Tasa de Conversión de Empresas

**Descripción**: Porcentaje de empresas que pasan de estado "pendiente" a "asesorada" o "completada".

**Fuente de datos**:
- Tabla: `empresas`
- Campo: `estado`

**Criterio**:
- Numerador: Empresas con estado IN ('asesorada', 'completada')
- Denominador: Total de empresas

**Fórmula**:
```sql
SELECT 
  ROUND(
    (COUNT(CASE WHEN estado IN ('asesorada', 'completada') THEN 1 END)::NUMERIC / 
     NULLIF(COUNT(*), 0)::NUMERIC * 100), 
    2
  ) as tasa_conversion
FROM empresas;
```

**Meta**: 80%
**Frecuencia de actualización**: Semanal
**Visualización**: Porcentaje con barra de progreso

---

### KPI 10: Tiempo Medio de Asesoramiento

**Descripción**: Tiempo promedio desde que una empresa se registra hasta que recibe su primer asesoramiento completado.

**Fuente de datos**:
- Tablas: `empresas`, `asesoramientos`
- Campos: `created_at`, `fecha`, `estado`

**Criterio**:
- Diferencia en días entre empresa.created_at y el primer asesoramiento.fecha donde estado = 'completado'

**Fórmula**:
```sql
SELECT ROUND(AVG(dias_hasta_asesoramiento)) as promedio_dias
FROM (
  SELECT 
    e.id,
    MIN(a.fecha)::date - e.created_at::date as dias_hasta_asesoramiento
  FROM empresas e
  INNER JOIN asesoramientos a ON e.id = a.empresa_id
  WHERE a.estado = 'completado'
  GROUP BY e.id
) sub;
```

**Meta**: < 15 días
**Frecuencia de actualización**: Semanal
**Visualización**: Número de días promedio

---

### KPI 11: Tasa de Finalización de Asesoramientos

**Descripción**: Porcentaje de asesoramientos programados que se completan (no se cancelan).

**Fuente de datos**:
- Tabla: `asesoramientos`
- Campo: `estado`

**Criterio**:
- Numerador: Asesoramientos con estado = 'completado'
- Denominador: Asesoramientos con estado IN ('completado', 'cancelado')

**Fórmula**:
```sql
SELECT 
  ROUND(
    (COUNT(CASE WHEN estado = 'completado' THEN 1 END)::NUMERIC / 
     NULLIF(COUNT(CASE WHEN estado IN ('completado', 'cancelado') THEN 1 END), 0)::NUMERIC * 100),
    2
  ) as tasa_finalizacion
FROM asesoramientos;
```

**Meta**: 90%
**Frecuencia de actualización**: Semanal
**Visualización**: Porcentaje

---

### KPI 12: Empresas por Técnico

**Descripción**: Número promedio de empresas asignadas por técnico.

**Fuente de datos**:
- Tabla: `empresas`
- Campo: `tecnico_asignado_id`

**Criterio**:
- Contar empresas agrupadas por técnico
- Calcular promedio

**Fórmula**:
```sql
SELECT 
  ROUND(COUNT(*)::NUMERIC / NULLIF(COUNT(DISTINCT tecnico_asignado_id), 0)::NUMERIC, 2) as promedio_empresas_por_tecnico
FROM empresas
WHERE tecnico_asignado_id IS NOT NULL;
```

**Distribución por técnico**:
```sql
SELECT 
  u.full_name as tecnico,
  COUNT(e.id) as num_empresas
FROM empresas e
INNER JOIN profiles u ON e.tecnico_asignado_id = u.id
GROUP BY u.full_name
ORDER BY num_empresas DESC;
```

**Meta**: 5-10 empresas por técnico
**Frecuencia de actualización**: Semanal
**Visualización**: Número promedio y distribución por técnico

---

### KPI 13: Tasa de Asistencia a Eventos

**Descripción**: Ratio entre asistentes confirmados y esperados en eventos completados.

**Fuente de datos**:
- Tabla: `eventos`
- Campos: `asistentes_confirmados`, `asistentes_esperados`, `estado`

**Criterio**:
- Eventos completados con asistentes_esperados > 0

**Fórmula**:
```sql
SELECT 
  ROUND(
    (SUM(asistentes_confirmados)::NUMERIC / 
     NULLIF(SUM(asistentes_esperados), 0)::NUMERIC * 100),
    2
  ) as tasa_asistencia
FROM eventos
WHERE estado = 'completado'
  AND asistentes_esperados > 0;
```

**Meta**: 85%
**Frecuencia de actualización**: Después de cada evento
**Visualización**: Porcentaje

---

### KPI 14: Tasa de Ocupación de Formaciones

**Descripción**: Ratio entre participantes inscritos y máximo permitido en formaciones completadas.

**Fuente de datos**:
- Tabla: `formaciones`
- Campos: `participantes_inscritos`, `participantes_max`, `estado`

**Criterio**:
- Formaciones completadas con participantes_max > 0

**Fórmula**:
```sql
SELECT 
  ROUND(
    (SUM(participantes_inscritos)::NUMERIC / 
     NULLIF(SUM(participantes_max), 0)::NUMERIC * 100),
    2
  ) as tasa_ocupacion
FROM formaciones
WHERE estado = 'completada'
  AND participantes_max > 0;
```

**Meta**: 80%
**Frecuencia de actualización**: Después de cada formación
**Visualización**: Porcentaje

---

## KPIs de Impacto

### KPI 15: Casos de Éxito

**Descripción**: Número de empresas marcadas como casos de éxito.

**Fuente de datos**:
- Tabla: `empresas`
- Campo: `es_caso_exito`

**Criterio**:
- Empresas con es_caso_exito = true

**Fórmula**:
```sql
SELECT COUNT(*)
FROM empresas
WHERE es_caso_exito = true;
```

**Meta**: 5 casos de éxito
**Frecuencia de actualización**: Mensual
**Visualización**: Número absoluto

---

### KPI 16: Cobertura Sectorial

**Descripción**: Número de sectores diferentes representados en las empresas asesoradas.

**Fuente de datos**:
- Tabla: `empresas`
- Campo: `sector`

**Criterio**:
- Contar sectores únicos en empresas asesoradas/completadas

**Fórmula**:
```sql
SELECT COUNT(DISTINCT sector)
FROM empresas
WHERE estado IN ('asesorada', 'completada');
```

**Meta**: 6 sectores diferentes
**Frecuencia de actualización**: Semanal
**Visualización**: Número de sectores

**Distribución por sector**:
```sql
SELECT 
  sector,
  COUNT(*) as num_empresas
FROM empresas
WHERE estado IN ('asesorada', 'completada')
GROUP BY sector
ORDER BY num_empresas DESC;
```

---

### KPI 17: Índice de Documentación

**Descripción**: Porcentaje de asesoramientos completados que tienen acta, compromisos y próximos pasos documentados.

**Fuente de datos**:
- Tabla: `asesoramientos`
- Campos: `estado`, `acta`, `compromisos`, `proximos_pasos`

**Criterio**:
- Asesoramientos completados con todos los campos de documentación completos

**Fórmula**:
```sql
SELECT 
  ROUND(
    (COUNT(CASE 
      WHEN acta IS NOT NULL 
        AND acta != '' 
        AND compromisos IS NOT NULL 
        AND compromisos != ''
        AND proximos_pasos IS NOT NULL
        AND proximos_pasos != ''
      THEN 1 
    END)::NUMERIC / 
     NULLIF(COUNT(*), 0)::NUMERIC * 100),
    2
  ) as indice_documentacion
FROM asesoramientos
WHERE estado = 'completado';
```

**Meta**: 95%
**Frecuencia de actualización**: Diaria
**Visualización**: Porcentaje

---

### KPI 18: Diversidad de Colaboradores

**Descripción**: Número de tipos diferentes de colaboradores activos.

**Fuente de datos**:
- Tabla: `colaboradores`
- Campo: `tipo`, `estado`

**Criterio**:
- Tipos únicos de colaboradores con estado = 'activo'

**Fórmula**:
```sql
SELECT COUNT(DISTINCT tipo)
FROM colaboradores
WHERE estado = 'activo';
```

**Distribución por tipo**:
```sql
SELECT 
  tipo,
  COUNT(*) as num_colaboradores
FROM colaboradores
WHERE estado = 'activo'
GROUP BY tipo
ORDER BY num_colaboradores DESC;
```

**Meta**: 4 tipos diferentes
**Frecuencia de actualización**: Mensual
**Visualización**: Número de tipos

---

## Fórmulas y Cálculos Detallados

### Cálculo de KPIs en el Dashboard (TypeScript/JavaScript)

```typescript
interface KPIData {
  label: string;
  value: number;
  target: number;
  percentage: number;
  trend?: 'up' | 'down' | 'stable'; // Reserved for future use - compare with historical values
}

async function calculateKPIs(): Promise<KPIData[]> {
  const kpis: KPIData[] = [];
  
  // KPI 1: Empresas Asesoradas
  const { count: empresasAsesoradas } = await supabase
    .from('empresas')
    .select('*', { count: 'exact', head: true })
    .in('estado', ['asesorada', 'completada']);
  
  kpis.push({
    label: 'Empresas asesoradas',
    value: empresasAsesoradas || 0,
    target: 20,
    percentage: Math.min(((empresasAsesoradas || 0) / 20) * 100, 100)
  });
  
  // KPI 2: Informes Generados
  const { count: informesGenerados } = await supabase
    .from('asesoramientos')
    .select('*', { count: 'exact', head: true })
    .eq('informe_generado', true);
  
  kpis.push({
    label: 'Informes generados',
    value: informesGenerados || 0,
    target: 15,
    percentage: Math.min(((informesGenerados || 0) / 15) * 100, 100)
  });
  
  // KPI 3: Eventos Realizados
  const { count: eventosRealizados } = await supabase
    .from('eventos')
    .select('*', { count: 'exact', head: true })
    .eq('estado', 'completado');
  
  kpis.push({
    label: 'Eventos realizados',
    value: eventosRealizados || 0,
    target: 2,
    percentage: Math.min(((eventosRealizados || 0) / 2) * 100, 100)
  });
  
  // KPI 4: Píldoras Formativas
  const { count: pildorasFormativas } = await supabase
    .from('formaciones')
    .select('*', { count: 'exact', head: true })
    .eq('tipo', 'pildora_formativa')
    .eq('estado', 'completada');
  
  kpis.push({
    label: 'Píldoras formativas',
    value: pildorasFormativas || 0,
    target: 6,
    percentage: Math.min(((pildorasFormativas || 0) / 6) * 100, 100)
  });
  
  // KPI 5: Entidades Colaboradoras
  const { count: colaboradoresActivos } = await supabase
    .from('colaboradores')
    .select('*', { count: 'exact', head: true })
    .eq('estado', 'activo')
    .eq('convenio_firmado', true);
  
  kpis.push({
    label: 'Entidades colaboradoras',
    value: colaboradoresActivos || 0,
    target: 8,
    percentage: Math.min(((colaboradoresActivos || 0) / 8) * 100, 100)
  });
  
  // KPI 6: Impactos de Difusión
  // Note: This requires two separate queries due to optional relationships
  const { data: evidenciasEventos } = await supabase
    .from('evidencias')
    .select('id, eventos!inner(estado)')
    .in('tipo', ['fotografia', 'video', 'otro'])
    .eq('eventos.estado', 'completado');
  
  const { data: evidenciasFormaciones } = await supabase
    .from('evidencias')
    .select('id, formaciones!inner(estado)')
    .in('tipo', ['fotografia', 'video', 'otro'])
    .eq('formaciones.estado', 'completada');
  
  // Combine and deduplicate by ID
  const evidenciaIds = new Set([
    ...(evidenciasEventos?.map(e => e.id) || []),
    ...(evidenciasFormaciones?.map(e => e.id) || [])
  ]);
  
  kpis.push({
    label: 'Impactos de difusión',
    value: evidenciaIds.size,
    target: 15,
    percentage: Math.min((evidenciaIds.size / 15) * 100, 100)
  });
  
  // KPI 7: Material de Apoyo
  const { count: materialesApoyo } = await supabase
    .from('evidencias')
    .select('*', { count: 'exact', head: true })
    .in('tipo', ['documento', 'certificado', 'informe'])
    .not('formacion_id', 'is', null);
  
  kpis.push({
    label: 'Material de apoyo',
    value: materialesApoyo || 0,
    target: 5,
    percentage: Math.min(((materialesApoyo || 0) / 5) * 100, 100)
  });
  
  // KPI 8: Cuadro de Mando PowerBI
  const powerBIConfigured = 
    !!import.meta.env.VITE_POWER_TENANT_ID &&
    !!import.meta.env.VITE_POWER_CLIENT_ID &&
    !!import.meta.env.VITE_POWER_API_BASE_URL;
  
  kpis.push({
    label: 'Cuadro de mando PowerBI',
    value: powerBIConfigured ? 1 : 0,
    target: 1,
    percentage: powerBIConfigured ? 100 : 0
  });
  
  return kpis;
}
```

### Queries SQL Optimizadas

Para obtener múltiples KPIs en una sola consulta:

```sql
-- KPIs Principales en una consulta
WITH kpi_data AS (
  SELECT
    -- KPI 1: Empresas Asesoradas
    COUNT(DISTINCT CASE 
      WHEN e.estado IN ('asesorada', 'completada') 
      THEN e.id 
    END) as empresas_asesoradas,
    
    -- KPI 15: Casos de Éxito
    COUNT(DISTINCT CASE 
      WHEN e.es_caso_exito = true 
      THEN e.id 
    END) as casos_exito,
    
    -- KPI 16: Cobertura Sectorial
    COUNT(DISTINCT CASE 
      WHEN e.estado IN ('asesorada', 'completada') 
      THEN e.sector 
    END) as sectores_cubiertos,
    
    -- Total empresas
    COUNT(DISTINCT e.id) as total_empresas
    
  FROM empresas e
)
SELECT * FROM kpi_data;
```

## Dashboard y Visualización

### Organización de KPIs en el Dashboard

**Panel Principal** (KPIs Operativos):
1. Empresas asesoradas (20)
2. Informes generados (15)
3. Eventos realizados (2)
4. Píldoras formativas (6)
5. Entidades colaboradoras (8)
6. Impactos de difusión (15)
7. Material de apoyo (5)
8. Cuadro de mando PowerBI (1)

**Panel Estratégico**:
- Tasa de conversión de empresas
- Tiempo medio de asesoramiento
- Tasa de finalización de asesoramientos
- Empresas por técnico
- Tasa de asistencia a eventos
- Tasa de ocupación de formaciones

**Panel de Impacto**:
- Casos de éxito
- Cobertura sectorial
- Índice de documentación
- Diversidad de colaboradores

### Colores y Visualización

**Código de colores por porcentaje de cumplimiento**:
- 0-49%: Rojo (requiere atención)
- 50-74%: Amarillo (en progreso)
- 75-89%: Azul (buen progreso)
- 90-100%: Verde (meta alcanzada)

**Tipos de visualización**:
- **Números absolutos**: Para KPIs con metas específicas
- **Barras de progreso**: Para mostrar avance hacia meta
- **Gráficos de tendencia**: Para mostrar evolución temporal
- **Gráficos de pastel**: Para distribuciones (sectores, tipos)

### Actualización de KPIs

**En tiempo real**:
- Empresas asesoradas
- Informes generados

**Diaria**:
- Eventos realizados
- Píldoras formativas
- Índice de documentación

**Semanal**:
- Entidades colaboradoras
- Impactos de difusión
- Material de apoyo
- KPIs estratégicos

**Mensual**:
- Casos de éxito
- Diversidad de colaboradores
- Revisión de metas

## Notas Importantes

1. **Cacheo de datos**: Para mejorar el rendimiento, considerar implementar cacheo de KPIs con actualización periódica.

2. **Histórico**: Se recomienda almacenar valores históricos de KPIs para análisis de tendencias.

3. **Alertas**: Configurar alertas cuando un KPI esté por debajo del 50% de su meta.

4. **Exportación**: Permitir exportación de KPIs a Excel/CSV para reporting.

5. **Personalización**: Los usuarios admin deben poder ajustar las metas de cada KPI según necesidades del programa.

6. **Integración con PowerBI**: Los KPIs deben estar disponibles vía API para integración con PowerBI.

7. **Validación de datos**: Implementar validaciones para evitar datos inconsistentes que afecten los KPIs.

8. **Documentación de cambios**: Registrar cambios en las metas y fórmulas de KPIs para auditoría.
