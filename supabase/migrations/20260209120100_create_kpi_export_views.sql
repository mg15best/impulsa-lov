-- PR-K: Create KPI export views for current and historical data
-- These views are optimized for Power BI consumption and CSV exports

-- View for current KPI values
-- This view provides the most recent snapshot of each KPI
CREATE OR REPLACE VIEW public.kpi_export AS
SELECT 
  kh.kpi_id,
  kh.label,
  kh.value,
  kh.target,
  kh.percentage,
  kh.calculated_at,
  kh.metadata,
  p.full_name as created_by_name,
  kh.created_at
FROM public.kpi_history kh
LEFT JOIN public.profiles p ON kh.created_by = p.id
WHERE kh.calculated_at IN (
  -- Get the most recent snapshot for each KPI
  SELECT MAX(calculated_at)
  FROM public.kpi_history
  GROUP BY kpi_id
)
ORDER BY kh.kpi_id;

-- View for historical KPI data export
-- This view provides all historical KPI data with useful metadata
CREATE OR REPLACE VIEW public.kpi_history_export AS
SELECT 
  kh.id,
  kh.kpi_id,
  kh.label,
  kh.value,
  kh.target,
  kh.percentage,
  kh.calculated_at,
  kh.metadata,
  p.full_name as created_by_name,
  p.role as created_by_role,
  kh.created_at,
  -- Additional calculated fields for analysis
  DATE(kh.calculated_at) as snapshot_date,
  EXTRACT(YEAR FROM kh.calculated_at) as snapshot_year,
  EXTRACT(MONTH FROM kh.calculated_at) as snapshot_month,
  EXTRACT(WEEK FROM kh.calculated_at) as snapshot_week,
  EXTRACT(DOW FROM kh.calculated_at) as snapshot_day_of_week,
  -- Performance indicators
  CASE 
    WHEN kh.percentage >= 100 THEN 'Alcanzado'
    WHEN kh.percentage >= 90 THEN 'Excelente'
    WHEN kh.percentage >= 75 THEN 'Bueno'
    WHEN kh.percentage >= 50 THEN 'En Progreso'
    ELSE 'Requiere Atención'
  END as status_label,
  CASE 
    WHEN kh.percentage >= 100 THEN 'success'
    WHEN kh.percentage >= 90 THEN 'success'
    WHEN kh.percentage >= 75 THEN 'info'
    WHEN kh.percentage >= 50 THEN 'warning'
    ELSE 'danger'
  END as status_color,
  -- Deviation from target
  kh.value - kh.target as deviation,
  CASE 
    WHEN kh.target > 0 THEN ROUND(((kh.value - kh.target)::NUMERIC / kh.target * 100), 2)
    ELSE 0
  END as deviation_percentage
FROM public.kpi_history kh
LEFT JOIN public.profiles p ON kh.created_by = p.id
ORDER BY kh.calculated_at DESC, kh.kpi_id;

-- Create view for materials that contribute to KPIs
-- This unified view helps understand which materials contribute to KPI 6 and 7
CREATE OR REPLACE VIEW public.materials_kpi_source AS
SELECT 
  m.id as material_id,
  m.titulo,
  m.descripcion,
  m.tipo,
  m.categoria,
  m.formato,
  m.estado,
  m.fecha_publicacion,
  m.numero_descargas,
  m.empresa_ids,
  m.evento_ids,
  m.formacion_ids,
  m.tags,
  m.created_at,
  -- Determine which KPI this material contributes to
  CASE 
    WHEN m.formacion_ids IS NOT NULL AND array_length(m.formacion_ids, 1) > 0 
      THEN 'KPI 7 - Material de Apoyo'
    ELSE NULL
  END as contributes_to_kpi,
  -- Additional context for analysis
  COALESCE(array_length(m.formacion_ids, 1), 0) as num_formaciones,
  COALESCE(array_length(m.evento_ids, 1), 0) as num_eventos,
  COALESCE(array_length(m.empresa_ids, 1), 0) as num_empresas
FROM public.materials m
WHERE m.estado = 'published';

-- Create view for dissemination impacts that contribute to KPIs
CREATE OR REPLACE VIEW public.dissemination_kpi_source AS
SELECT 
  di.id as dissemination_id,
  di.titulo,
  di.descripcion,
  di.canal,
  di.tipo,
  di.estado,
  di.entity_type,
  di.entity_id,
  di.fecha_inicio,
  di.fecha_fin,
  di.fecha_ejecucion,
  di.alcance,
  di.visualizaciones,
  di.descargas,
  di.interacciones,
  di.conversiones,
  di.empresa_ids,
  di.tags,
  di.created_at,
  -- Determine which KPI this dissemination contributes to
  CASE 
    WHEN di.estado = 'completed' THEN 'KPI 6 - Impactos de Difusión'
    ELSE NULL
  END as contributes_to_kpi,
  -- Total impact score (weighted sum of metrics)
  (COALESCE(di.alcance, 0) * 0.1 + 
   COALESCE(di.visualizaciones, 0) * 0.2 + 
   COALESCE(di.interacciones, 0) * 0.3 + 
   COALESCE(di.conversiones, 0) * 0.4) as impact_score,
  -- Additional context
  COALESCE(array_length(di.empresa_ids, 1), 0) as num_empresas,
  COALESCE(array_length(di.material_ids, 1), 0) as num_materials
FROM public.dissemination_impacts di;

-- Grant SELECT permissions to authenticated users
GRANT SELECT ON public.kpi_export TO authenticated;
GRANT SELECT ON public.kpi_history_export TO authenticated;
GRANT SELECT ON public.materials_kpi_source TO authenticated;
GRANT SELECT ON public.dissemination_kpi_source TO authenticated;

-- Add comments for documentation
COMMENT ON VIEW public.kpi_export IS 'Provides current (most recent) KPI values for dashboard display and quick exports';
COMMENT ON VIEW public.kpi_history_export IS 'Provides complete historical KPI data with analysis fields for Power BI and detailed reporting';
COMMENT ON VIEW public.materials_kpi_source IS 'Unified view of materials contributing to KPI 7 (Material de Apoyo)';
COMMENT ON VIEW public.dissemination_kpi_source IS 'Unified view of dissemination impacts contributing to KPI 6 (Impactos de Difusión)';
