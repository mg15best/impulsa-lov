-- Add automatic task rules for asesoramientos (session traceability)

-- 1) Extend enums for new automatic triggers and entity linkage
ALTER TYPE public.template_trigger ADD VALUE IF NOT EXISTS 'asesoramiento_created';
ALTER TYPE public.template_trigger ADD VALUE IF NOT EXISTS 'asesoramiento_completed';

ALTER TYPE public.task_entity_type ADD VALUE IF NOT EXISTS 'asesoramiento';

-- 2) Improve generic template task creation to avoid duplicate tasks
CREATE OR REPLACE FUNCTION public.create_tasks_from_templates(
  p_trigger template_trigger,
  p_entity_type task_entity_type,
  p_entity_id UUID,
  p_created_by UUID
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_template RECORD;
  v_responsable_id UUID;
  v_due_date DATE;
BEGIN
  FOR v_template IN
    SELECT *
    FROM public.task_templates
    WHERE trigger = p_trigger
      AND is_active = true
  LOOP
    -- Avoid duplicate tasks from repeated trigger execution
    IF EXISTS (
      SELECT 1
      FROM public.tasks t
      WHERE t.template_id = v_template.id
        AND t.entity_type = p_entity_type
        AND t.entity_id = p_entity_id
    ) THEN
      CONTINUE;
    END IF;

    v_due_date := NULL;
    IF v_template.default_due_days IS NOT NULL THEN
      v_due_date := CURRENT_DATE + (v_template.default_due_days * INTERVAL '1 day');
    END IF;

    v_responsable_id := NULL;
    IF v_template.assign_to_creator THEN
      v_responsable_id := p_created_by;
    ELSIF v_template.required_role IS NOT NULL THEN
      v_responsable_id := NULL;
    END IF;

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
    );
  END LOOP;
END;
$$;

-- 3) Seed templates for asesoramiento lifecycle
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
  tags
) VALUES
(
  'preparar_sesion_asesoramiento',
  'asesoramiento_created',
  'Preparar sesión',
  'Preparar la sesión de asesoramiento: revisar contexto, objetivos y documentación previa.',
  1,
  'high',
  'pending',
  'tecnico',
  true,
  true,
  ARRAY['asesoramiento', 'sesion', 'preparacion']
),
(
  'registrar_conclusiones_asesoramiento',
  'asesoramiento_completed',
  'Registrar conclusiones y evidencias',
  'Documentar conclusiones de la sesión de asesoramiento y adjuntar evidencias correspondientes.',
  1,
  'high',
  'pending',
  'tecnico',
  true,
  true,
  ARRAY['asesoramiento', 'conclusiones', 'evidencias']
)
ON CONFLICT (name) DO UPDATE
SET
  trigger = EXCLUDED.trigger,
  title_template = EXCLUDED.title_template,
  description_template = EXCLUDED.description_template,
  default_due_days = EXCLUDED.default_due_days,
  default_priority = EXCLUDED.default_priority,
  default_estado = EXCLUDED.default_estado,
  required_role = EXCLUDED.required_role,
  assign_to_creator = EXCLUDED.assign_to_creator,
  is_active = EXCLUDED.is_active,
  tags = EXCLUDED.tags,
  updated_at = now();

-- 4) Trigger handlers for asesoramientos
CREATE OR REPLACE FUNCTION public.handle_asesoramiento_created()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM public.create_tasks_from_templates(
    'asesoramiento_created'::template_trigger,
    'asesoramiento'::task_entity_type,
    NEW.id,
    COALESCE(NEW.tecnico_id, NEW.created_by, auth.uid())
  );

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_asesoramiento_completed()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM public.create_tasks_from_templates(
    'asesoramiento_completed'::template_trigger,
    'asesoramiento'::task_entity_type,
    NEW.id,
    COALESCE(NEW.tecnico_id, NEW.created_by, auth.uid())
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_asesoramiento_created_tasks ON public.asesoramientos;
CREATE TRIGGER trigger_asesoramiento_created_tasks
  AFTER INSERT ON public.asesoramientos
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_asesoramiento_created();

DROP TRIGGER IF EXISTS trigger_asesoramiento_completed_tasks ON public.asesoramientos;
CREATE TRIGGER trigger_asesoramiento_completed_tasks
  AFTER UPDATE OF estado ON public.asesoramientos
  FOR EACH ROW
  WHEN (NEW.estado = 'completado'::public.estado_asesoramiento AND OLD.estado IS DISTINCT FROM NEW.estado)
  EXECUTE FUNCTION public.handle_asesoramiento_completed();

COMMENT ON FUNCTION public.handle_asesoramiento_created IS 'Creates automatic tasks from templates when an asesoramiento is created';
COMMENT ON FUNCTION public.handle_asesoramiento_completed IS 'Creates automatic tasks from templates when an asesoramiento transitions to completed';

COMMENT ON TRIGGER trigger_asesoramiento_created_tasks ON public.asesoramientos IS 'Automatically creates "Preparar sesión" task when an asesoramiento is inserted';
COMMENT ON TRIGGER trigger_asesoramiento_completed_tasks ON public.asesoramientos IS 'Automatically creates "Registrar conclusiones y evidencias" task when an asesoramiento is completed';
