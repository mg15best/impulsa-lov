-- Add automatic task rules for eventos and formaciones lifecycle

-- 1) Extend template triggers for completion events
ALTER TYPE public.template_trigger ADD VALUE IF NOT EXISTS 'evento_completed';
ALTER TYPE public.template_trigger ADD VALUE IF NOT EXISTS 'formacion_completed';

-- 2) Seed templates for eventos/formaciones cycle
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
  'preparar_materiales_evento',
  'evento_created',
  'Preparar materiales',
  'Preparar materiales, recursos y logística para el evento.',
  2,
  'high',
  'pending',
  'tecnico',
  true,
  true,
  ARRAY['evento', 'materiales', 'preparacion']
),
(
  'preparar_materiales_formacion',
  'formacion_created',
  'Preparar materiales',
  'Preparar materiales didácticos y recursos necesarios para la formación.',
  2,
  'high',
  'pending',
  'tecnico',
  true,
  true,
  ARRAY['formacion', 'materiales', 'preparacion']
),
(
  'registrar_evidencias_evento',
  'evento_completed',
  'Registrar evidencias',
  'Registrar evidencias del evento (actas, fotografías, informes y adjuntos relacionados).',
  1,
  'high',
  'pending',
  'tecnico',
  true,
  true,
  ARRAY['evento', 'evidencias', 'cierre']
),
(
  'registrar_evidencias_formacion',
  'formacion_completed',
  'Registrar evidencias',
  'Registrar evidencias de la formación (actas, fotografías, certificados y adjuntos relacionados).',
  1,
  'high',
  'pending',
  'tecnico',
  true,
  true,
  ARRAY['formacion', 'evidencias', 'cierre']
),
(
  'impacto_difusion_evento',
  'evento_completed',
  'Impacto de difusión',
  'Registrar y analizar el impacto de difusión generado por el evento.',
  3,
  'medium',
  'pending',
  'tecnico',
  true,
  true,
  ARRAY['evento', 'difusion', 'impacto']
),
(
  'impacto_difusion_formacion',
  'formacion_completed',
  'Impacto de difusión',
  'Registrar y analizar el impacto de difusión generado por la formación.',
  3,
  'medium',
  'pending',
  'tecnico',
  true,
  true,
  ARRAY['formacion', 'difusion', 'impacto']
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

-- 3) Trigger handlers for eventos lifecycle
CREATE OR REPLACE FUNCTION public.handle_evento_created()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM public.create_tasks_from_templates(
    'evento_created'::template_trigger,
    'evento'::task_entity_type,
    NEW.id,
    COALESCE(NEW.created_by, auth.uid())
  );

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_evento_completed()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM public.create_tasks_from_templates(
    'evento_completed'::template_trigger,
    'evento'::task_entity_type,
    NEW.id,
    COALESCE(NEW.created_by, auth.uid())
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_evento_created_tasks ON public.eventos;
CREATE TRIGGER trigger_evento_created_tasks
  AFTER INSERT ON public.eventos
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_evento_created();

DROP TRIGGER IF EXISTS trigger_evento_completed_tasks ON public.eventos;
CREATE TRIGGER trigger_evento_completed_tasks
  AFTER UPDATE OF estado ON public.eventos
  FOR EACH ROW
  WHEN (NEW.estado = 'completado'::public.estado_evento AND OLD.estado IS DISTINCT FROM NEW.estado)
  EXECUTE FUNCTION public.handle_evento_completed();

-- 4) Trigger handlers for formaciones lifecycle
CREATE OR REPLACE FUNCTION public.handle_formacion_created()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM public.create_tasks_from_templates(
    'formacion_created'::template_trigger,
    'formacion'::task_entity_type,
    NEW.id,
    COALESCE(NEW.created_by, auth.uid())
  );

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_formacion_completed()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM public.create_tasks_from_templates(
    'formacion_completed'::template_trigger,
    'formacion'::task_entity_type,
    NEW.id,
    COALESCE(NEW.created_by, auth.uid())
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_formacion_created_tasks ON public.formaciones;
CREATE TRIGGER trigger_formacion_created_tasks
  AFTER INSERT ON public.formaciones
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_formacion_created();

DROP TRIGGER IF EXISTS trigger_formacion_completed_tasks ON public.formaciones;
CREATE TRIGGER trigger_formacion_completed_tasks
  AFTER UPDATE OF estado ON public.formaciones
  FOR EACH ROW
  WHEN (NEW.estado = 'completada'::public.estado_formacion AND OLD.estado IS DISTINCT FROM NEW.estado)
  EXECUTE FUNCTION public.handle_formacion_completed();

COMMENT ON FUNCTION public.handle_evento_created IS 'Creates automatic tasks from templates when an evento is created';
COMMENT ON FUNCTION public.handle_evento_completed IS 'Creates automatic tasks from templates when an evento is completed';
COMMENT ON FUNCTION public.handle_formacion_created IS 'Creates automatic tasks from templates when a formacion is created';
COMMENT ON FUNCTION public.handle_formacion_completed IS 'Creates automatic tasks from templates when a formacion is completed';

COMMENT ON TRIGGER trigger_evento_created_tasks ON public.eventos IS 'Automatically creates "Preparar materiales" tasks when an evento is inserted';
COMMENT ON TRIGGER trigger_evento_completed_tasks ON public.eventos IS 'Automatically creates "Registrar evidencias" and "Impacto de difusión" tasks when an evento is completed';
COMMENT ON TRIGGER trigger_formacion_created_tasks ON public.formaciones IS 'Automatically creates "Preparar materiales" tasks when a formacion is inserted';
COMMENT ON TRIGGER trigger_formacion_completed_tasks ON public.formaciones IS 'Automatically creates "Registrar evidencias" and "Impacto de difusión" tasks when a formacion is completed';
