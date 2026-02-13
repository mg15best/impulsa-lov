-- Fase 3: strengthen automatic task engine governance
-- Goals:
-- 1) deterministic assignment rules for automatic tasks
-- 2) observable automation events
-- 3) idempotency for template-driven task creation

-- -----------------------------------------------------------------------------
-- 1) Observability table for automation lifecycle
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.task_automation_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL CHECK (
    event_type IN (
      'empresa_created',
      'task_completed',
      'template_evaluated',
      'template_skipped_duplicate',
      'task_created',
      'task_creation_failed',
      'next_phase_skipped_duplicate',
      'next_phase_created'
    )
  ),
  trigger_name TEXT,
  entity_type task_entity_type,
  entity_id UUID,
  template_id UUID REFERENCES public.task_templates(id) ON DELETE SET NULL,
  task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'info' CHECK (status IN ('info', 'success', 'warning', 'error')),
  message TEXT,
  payload JSONB,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.task_automation_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can read task automation events" ON public.task_automation_events;
CREATE POLICY "Authenticated users can read task automation events"
  ON public.task_automation_events FOR SELECT
  TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin', 'tecnico', 'auditor', 'it']::app_role[]));

-- Inserts are performed by SECURITY DEFINER functions.

-- -----------------------------------------------------------------------------
-- 2) Helper to log automation events
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.log_task_automation_event(
  p_event_type TEXT,
  p_trigger_name TEXT,
  p_entity_type task_entity_type,
  p_entity_id UUID,
  p_template_id UUID,
  p_task_id UUID,
  p_status TEXT,
  p_message TEXT,
  p_payload JSONB,
  p_created_by UUID
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.task_automation_events (
    event_type,
    trigger_name,
    entity_type,
    entity_id,
    template_id,
    task_id,
    status,
    message,
    payload,
    created_by
  ) VALUES (
    p_event_type,
    p_trigger_name,
    p_entity_type,
    p_entity_id,
    p_template_id,
    p_task_id,
    p_status,
    p_message,
    p_payload,
    p_created_by
  );
EXCEPTION
  WHEN OTHERS THEN
    -- Never fail business flow due to observability side-effects.
    NULL;
END;
$$;

COMMENT ON FUNCTION public.log_task_automation_event IS 'Writes non-blocking logs for task automation lifecycle events';

-- -----------------------------------------------------------------------------
-- 3) Resolver for responsable_id to avoid null by design when possible
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.resolve_task_responsable(
  p_required_role app_role,
  p_assign_to_creator BOOLEAN,
  p_created_by UUID,
  p_entity_type task_entity_type,
  p_entity_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_responsable UUID;
BEGIN
  IF p_assign_to_creator AND p_created_by IS NOT NULL THEN
    RETURN p_created_by;
  END IF;

  IF p_required_role IS NULL THEN
    RETURN NULL;
  END IF;

  -- Business-first rule for company automation: use assigned technician when available.
  IF p_required_role = 'tecnico'::app_role
     AND p_entity_type = 'empresa'::task_entity_type
     AND p_entity_id IS NOT NULL THEN
    SELECT tecnico_asignado_id
    INTO v_responsable
    FROM public.empresas
    WHERE id = p_entity_id;

    IF v_responsable IS NOT NULL THEN
      RETURN v_responsable;
    END IF;
  END IF;

  -- Deterministic fallback by role.
  SELECT ur.user_id
  INTO v_responsable
  FROM public.user_roles ur
  WHERE ur.role = p_required_role
  ORDER BY ur.created_at ASC
  LIMIT 1;

  RETURN v_responsable;
END;
$$;

COMMENT ON FUNCTION public.resolve_task_responsable IS 'Resolves responsible user for automatic tasks with deterministic role-based fallback';

-- -----------------------------------------------------------------------------
-- 4) Override template-based task creator with idempotency + logs
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.create_tasks_from_templates(
  p_trigger template_trigger,
  p_entity_type task_entity_type,
  p_entity_id UUID,
  p_created_by UUID
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_template RECORD;
  v_responsable_id UUID;
  v_due_date DATE;
  v_task_id UUID;
BEGIN
  FOR v_template IN
    SELECT *
    FROM public.task_templates
    WHERE trigger = p_trigger
      AND is_active = true
  LOOP
    PERFORM public.log_task_automation_event(
      'template_evaluated',
      p_trigger::text,
      p_entity_type,
      p_entity_id,
      v_template.id,
      NULL,
      'info',
      'Evaluating template for automation trigger',
      jsonb_build_object('template_name', v_template.name),
      p_created_by
    );

    IF EXISTS (
      SELECT 1
      FROM public.tasks t
      WHERE t.entity_type = p_entity_type
        AND t.entity_id IS NOT DISTINCT FROM p_entity_id
        AND t.template_id = v_template.id
    ) THEN
      PERFORM public.log_task_automation_event(
        'template_skipped_duplicate',
        p_trigger::text,
        p_entity_type,
        p_entity_id,
        v_template.id,
        NULL,
        'warning',
        'Template skipped because task already exists for entity/template',
        jsonb_build_object('template_name', v_template.name),
        p_created_by
      );
      CONTINUE;
    END IF;

    BEGIN
      v_due_date := NULL;
      IF v_template.default_due_days IS NOT NULL THEN
        v_due_date := CURRENT_DATE + (v_template.default_due_days * INTERVAL '1 day');
      END IF;

      v_responsable_id := public.resolve_task_responsable(
        v_template.required_role,
        COALESCE(v_template.assign_to_creator, false),
        p_created_by,
        p_entity_type,
        p_entity_id
      );

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
        p_entity_type,
        p_entity_id,
        v_template.title_template,
        v_template.description_template,
        v_template.default_estado,
        v_template.default_priority,
        v_due_date,
        v_responsable_id,
        'automatica',
        v_template.id,
        v_template.tags,
        p_created_by
      ) RETURNING id INTO v_task_id;

      PERFORM public.log_task_automation_event(
        'task_created',
        p_trigger::text,
        p_entity_type,
        p_entity_id,
        v_template.id,
        v_task_id,
        'success',
        'Automatic task created from template',
        jsonb_build_object(
          'template_name', v_template.name,
          'responsable_id', v_responsable_id,
          'due_date', v_due_date
        ),
        p_created_by
      );
    EXCEPTION
      WHEN OTHERS THEN
        PERFORM public.log_task_automation_event(
          'task_creation_failed',
          p_trigger::text,
          p_entity_type,
          p_entity_id,
          v_template.id,
          NULL,
          'error',
          SQLERRM,
          jsonb_build_object('template_name', v_template.name),
          p_created_by
        );
    END;
  END LOOP;
END;
$$;

COMMENT ON FUNCTION public.create_tasks_from_templates IS 'Creates idempotent automatic tasks from templates with assignment resolver and event logs';

-- -----------------------------------------------------------------------------
-- 5) Track origin event for empresa creation trigger
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_empresa_created()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_created_by UUID;
BEGIN
  v_created_by := COALESCE(NEW.created_by, auth.uid());

  PERFORM public.log_task_automation_event(
    'empresa_created',
    'trigger_empresa_created_tasks',
    'empresa'::task_entity_type,
    NEW.id,
    NULL,
    NULL,
    'info',
    'Empresa created trigger received',
    NULL,
    v_created_by
  );

  PERFORM public.create_tasks_from_templates(
    'empresa_created'::template_trigger,
    'empresa'::task_entity_type,
    NEW.id,
    v_created_by
  );

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.handle_empresa_created IS 'Handles company creation trigger and logs automation event chain';

-- -----------------------------------------------------------------------------
-- 6) Enhance next-phase chain trigger with explicit observability
-- -----------------------------------------------------------------------------
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
  v_new_task_id UUID;
BEGIN
  IF NEW.estado <> 'completed' OR OLD.estado = 'completed' THEN
    RETURN NEW;
  END IF;

  PERFORM public.log_task_automation_event(
    'task_completed',
    'trigger_create_next_empresa_chain_task',
    NEW.entity_type,
    NEW.entity_id,
    NEW.template_id,
    NEW.id,
    'info',
    'Task completion detected for chain evaluation',
    jsonb_build_object('old_estado', OLD.estado, 'new_estado', NEW.estado),
    COALESCE(auth.uid(), NEW.created_by)
  );

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

  IF EXISTS (
    SELECT 1
    FROM public.tasks t
    WHERE t.entity_type = NEW.entity_type
      AND t.entity_id IS NOT DISTINCT FROM NEW.entity_id
      AND t.template_id = v_next_template.id
  ) THEN
    PERFORM public.log_task_automation_event(
      'next_phase_skipped_duplicate',
      'trigger_create_next_empresa_chain_task',
      NEW.entity_type,
      NEW.entity_id,
      v_next_template.id,
      NULL,
      'warning',
      'Next chain phase already exists; skipping creation',
      jsonb_build_object('next_template_name', v_next_template.name),
      COALESCE(auth.uid(), NEW.created_by)
    );
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
  ) RETURNING id INTO v_new_task_id;

  PERFORM public.log_task_automation_event(
    'next_phase_created',
    'trigger_create_next_empresa_chain_task',
    NEW.entity_type,
    NEW.entity_id,
    v_next_template.id,
    v_new_task_id,
    'success',
    'Next workflow chain task created',
    jsonb_build_object('next_template_name', v_next_template.name, 'due_date', v_due_date),
    v_new_created_by
  );

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.create_next_empresa_chain_task IS 'Creates next company chain task with duplicate protection and automation logs';

NOTIFY pgrst, 'reload schema';
