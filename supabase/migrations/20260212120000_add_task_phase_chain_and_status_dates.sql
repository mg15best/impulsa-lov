-- Add phase-chain automation for company accompaniment tasks
-- Sequence: Diagnóstico inicial -> Elaboración de informe -> Entrega del informe -> Plan de acción -> Seguimiento
-- Also keeps task status dates (fecha_inicio/fecha_completado) aligned with real status transitions.

-- Insert or update templates used by the company accompaniment chain.
INSERT INTO public.task_templates (
  name,
  trigger,
  title_template,
  description_template,
  default_due_days,
  default_priority,
  default_estado,
  required_role,
  assign_to_creator,
  is_active,
  tags,
  metadata
)
VALUES
  (
    'elaboracion_informe_empresa',
    'manual',
    'Elaboración de informe',
    'Elaborar el informe de diagnóstico con hallazgos, prioridades y recomendaciones para la empresa.',
    5,
    'high',
    'pending',
    'tecnico',
    false,
    true,
    ARRAY['informe', 'diagnostico', 'empresa'],
    jsonb_build_object('workflow_chain', 'empresa_informe_plan', 'sequence_order', 2)
  ),
  (
    'entrega_informe_empresa',
    'manual',
    'Entrega del informe',
    'Presentar y entregar formalmente el informe a la empresa, validando la comprensión de resultados.',
    3,
    'high',
    'pending',
    'tecnico',
    false,
    true,
    ARRAY['informe', 'entrega', 'empresa'],
    jsonb_build_object('workflow_chain', 'empresa_informe_plan', 'sequence_order', 3)
  ),
  (
    'plan_accion_empresa',
    'manual',
    'Plan de acción',
    'Definir junto a la empresa un plan de acción con hitos, responsables y plazos.',
    7,
    'high',
    'pending',
    'tecnico',
    false,
    true,
    ARRAY['plan', 'accion', 'empresa'],
    jsonb_build_object('workflow_chain', 'empresa_informe_plan', 'sequence_order', 4)
  ),
  (
    'seguimiento_plan_empresa',
    'manual',
    'Seguimiento',
    'Realizar seguimiento de la ejecución del plan de acción y registrar avances o bloqueos.',
    14,
    'medium',
    'pending',
    'tecnico',
    false,
    true,
    ARRAY['seguimiento', 'plan', 'empresa'],
    jsonb_build_object('workflow_chain', 'empresa_informe_plan', 'sequence_order', 5)
  )
ON CONFLICT (name) DO UPDATE
SET
  title_template = EXCLUDED.title_template,
  description_template = EXCLUDED.description_template,
  default_due_days = EXCLUDED.default_due_days,
  default_priority = EXCLUDED.default_priority,
  default_estado = EXCLUDED.default_estado,
  required_role = EXCLUDED.required_role,
  is_active = EXCLUDED.is_active,
  tags = EXCLUDED.tags,
  metadata = COALESCE(public.task_templates.metadata, '{}'::jsonb) || EXCLUDED.metadata,
  updated_at = now();

-- Tag the existing first phase template as part of the same chain.
UPDATE public.task_templates
SET
  metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object('workflow_chain', 'empresa_informe_plan', 'sequence_order', 1),
  updated_at = now()
WHERE name = 'diagnostico_inicial_empresa';

-- Keep status dates aligned with real status transitions.
CREATE OR REPLACE FUNCTION public.sync_task_status_dates()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.estado IN ('in_progress', 'completed') AND NEW.fecha_inicio IS NULL THEN
      NEW.fecha_inicio := CURRENT_DATE;
    END IF;

    IF NEW.estado = 'completed' AND NEW.fecha_completado IS NULL THEN
      NEW.fecha_completado := now();
    END IF;

    RETURN NEW;
  END IF;

  IF NEW.estado IS DISTINCT FROM OLD.estado THEN
    IF NEW.estado = 'in_progress' AND NEW.fecha_inicio IS NULL THEN
      NEW.fecha_inicio := CURRENT_DATE;
    END IF;

    IF NEW.estado = 'completed' THEN
      IF NEW.fecha_inicio IS NULL THEN
        NEW.fecha_inicio := CURRENT_DATE;
      END IF;

      IF NEW.fecha_completado IS NULL THEN
        NEW.fecha_completado := now();
      END IF;
    ELSIF OLD.estado = 'completed' THEN
      NEW.fecha_completado := NULL;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.sync_task_status_dates IS 'Synchronizes fecha_inicio and fecha_completado with task status transitions';

DROP TRIGGER IF EXISTS trigger_sync_task_status_dates ON public.tasks;
CREATE TRIGGER trigger_sync_task_status_dates
  BEFORE INSERT OR UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_task_status_dates();

-- Create next task automatically when completing a workflow phase.
CREATE OR REPLACE FUNCTION public.create_next_empresa_chain_task()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_template_name TEXT;
  v_next_template_name TEXT;
  v_next_template public.task_templates%ROWTYPE;
  v_due_date DATE;
  v_new_created_by UUID;
BEGIN
  IF NEW.estado <> 'completed' OR OLD.estado = 'completed' THEN
    RETURN NEW;
  END IF;

  SELECT name
  INTO v_current_template_name
  FROM public.task_templates
  WHERE id = NEW.template_id;

  IF v_current_template_name IS NULL THEN
    RETURN NEW;
  END IF;

  v_next_template_name := CASE v_current_template_name
    WHEN 'diagnostico_inicial_empresa' THEN 'elaboracion_informe_empresa'
    WHEN 'elaboracion_informe_empresa' THEN 'entrega_informe_empresa'
    WHEN 'entrega_informe_empresa' THEN 'plan_accion_empresa'
    WHEN 'plan_accion_empresa' THEN 'seguimiento_plan_empresa'
    ELSE NULL
  END;

  IF v_next_template_name IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT *
  INTO v_next_template
  FROM public.task_templates
  WHERE name = v_next_template_name
    AND is_active = true
  LIMIT 1;

  IF v_next_template.id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Avoid duplicates if the next phase task already exists for the same entity.
  IF EXISTS (
    SELECT 1
    FROM public.tasks t
    WHERE t.entity_type = NEW.entity_type
      AND t.entity_id IS NOT DISTINCT FROM NEW.entity_id
      AND t.template_id = v_next_template.id
  ) THEN
    RETURN NEW;
  END IF;

  v_due_date := NULL;
  IF v_next_template.default_due_days IS NOT NULL THEN
    v_due_date := COALESCE(NEW.fecha_completado::date, CURRENT_DATE) + v_next_template.default_due_days;
  END IF;

  v_new_created_by := COALESCE(auth.uid(), NEW.created_by);

  INSERT INTO public.tasks (
    entity_type,
    entity_id,
    titulo,
    descripcion,
    estado,
    prioridad,
    fecha_vencimiento,
    responsable_id,
    source,
    template_id,
    tags,
    created_by
  ) VALUES (
    NEW.entity_type,
    NEW.entity_id,
    v_next_template.title_template,
    v_next_template.description_template,
    v_next_template.default_estado,
    v_next_template.default_priority,
    v_due_date,
    NEW.responsable_id,
    'workflow',
    v_next_template.id,
    v_next_template.tags,
    v_new_created_by
  );

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.create_next_empresa_chain_task IS 'Creates the next accompaniment phase task when the previous workflow task is completed';

DROP TRIGGER IF EXISTS trigger_create_next_empresa_chain_task ON public.tasks;
CREATE TRIGGER trigger_create_next_empresa_chain_task
  AFTER UPDATE OF estado ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.create_next_empresa_chain_task();
