-- Fase 6: control metrics for logical consistency and operational quality

-- 1) Store transition attempts (valid + invalid) for quality metrics
CREATE TABLE IF NOT EXISTS public.state_transition_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,
  current_state TEXT NOT NULL,
  attempted_state TEXT NOT NULL,
  is_valid BOOLEAN NOT NULL,
  reason TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.state_transition_attempts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can read transition attempts" ON public.state_transition_attempts;
CREATE POLICY "Authenticated users can read transition attempts"
  ON public.state_transition_attempts FOR SELECT
  TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin', 'tecnico', 'auditor', 'it']::app_role[]));

DROP POLICY IF EXISTS "Authenticated users can insert transition attempts" ON public.state_transition_attempts;
CREATE POLICY "Authenticated users can insert transition attempts"
  ON public.state_transition_attempts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- 2) Unified quality view (one row per KPI)
CREATE OR REPLACE VIEW public.operational_health_kpis AS
WITH transition_stats AS (
  SELECT
    COUNT(*)::numeric AS total,
    COUNT(*) FILTER (WHERE NOT is_valid)::numeric AS invalid
  FROM public.state_transition_attempts
),
automation_assignment AS (
  SELECT
    COUNT(*)::numeric AS total,
    COUNT(*) FILTER (
      WHERE COALESCE(payload->>'responsable_id', '') = '' OR payload->>'responsable_id' = 'null'
    )::numeric AS without_responsable
  FROM public.task_automation_events
  WHERE event_type = 'task_created'
),
chain_leadtime AS (
  SELECT AVG(EXTRACT(EPOCH FROM (n.created_at - p.fecha_completado))/86400.0)::numeric AS days_avg
  FROM public.tasks p
  JOIN public.task_templates tp ON tp.id = p.template_id
  JOIN public.tasks n
    ON n.entity_type = p.entity_type
   AND n.entity_id IS NOT DISTINCT FROM p.entity_id
  JOIN public.task_templates tn ON tn.id = n.template_id
  WHERE (tp.metadata->>'workflow_chain') = 'empresa_informe_plan'
    AND (tn.metadata->>'workflow_chain') = 'empresa_informe_plan'
    AND (tn.metadata->>'sequence_order')::int = (tp.metadata->>'sequence_order')::int + 1
    AND p.fecha_completado IS NOT NULL
),
company_discrepancy AS (
  SELECT
    COUNT(*)::numeric AS total,
    COUNT(*) FILTER (
      WHERE (
        e.estado IN ('asesorada', 'completada')
        AND COALESCE(a.completed_count, 0) = 0
      )
      OR (
        e.estado = 'pendiente'
        AND COALESCE(a.completed_count, 0) > 0
      )
    )::numeric AS mismatched
  FROM public.empresas e
  LEFT JOIN (
    SELECT empresa_id, COUNT(*) FILTER (WHERE estado = 'completado') AS completed_count
    FROM public.asesoramientos
    GROUP BY empresa_id
  ) a ON a.empresa_id = e.id
)
SELECT
  'invalid_transitions_rate'::text AS kpi_id,
  'Transiciones inválidas intentadas'::text AS label,
  ROUND(COALESCE((ts.invalid / NULLIF(ts.total, 0)) * 100, 0), 2) AS value,
  '%'::text AS unit,
  COALESCE(ts.invalid::int, 0) AS numerator,
  COALESCE(ts.total::int, 0) AS denominator
FROM transition_stats ts
UNION ALL
SELECT
  'auto_tasks_without_owner_rate',
  'Tareas automáticas sin responsable inicial',
  ROUND(COALESCE((aa.without_responsable / NULLIF(aa.total, 0)) * 100, 0), 2),
  '%',
  COALESCE(aa.without_responsable::int, 0),
  COALESCE(aa.total::int, 0)
FROM automation_assignment aa
UNION ALL
SELECT
  'workflow_chain_lead_time_days',
  'Lead time entre fases automáticas',
  ROUND(COALESCE(cl.days_avg, 0), 2),
  'días',
  NULL::int,
  NULL::int
FROM chain_leadtime cl
UNION ALL
SELECT
  'company_state_discrepancy_rate',
  'Discrepancias empresa vs asesoramientos',
  ROUND(COALESCE((cd.mismatched / NULLIF(cd.total, 0)) * 100, 0), 2),
  '%',
  COALESCE(cd.mismatched::int, 0),
  COALESCE(cd.total::int, 0)
FROM company_discrepancy cd;

NOTIFY pgrst, 'reload schema';
