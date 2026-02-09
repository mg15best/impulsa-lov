-- PR-T2: Create trigger for automatic task creation on empresa creation
-- This implements the automatic rule: when creating a empresa → create automatic tasks from templates

-- Function to create tasks from templates based on a trigger event
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
  -- Loop through all active templates for this trigger
  FOR v_template IN 
    SELECT * FROM public.task_templates 
    WHERE trigger = p_trigger 
      AND is_active = true
  LOOP
    -- Calculate due date if default_due_days is specified
    v_due_date := NULL;
    IF v_template.default_due_days IS NOT NULL THEN
      v_due_date := CURRENT_DATE + (v_template.default_due_days || ' days')::INTERVAL;
    END IF;
    
    -- Determine responsable_id based on template rules
    v_responsable_id := NULL;
    IF v_template.assign_to_creator THEN
      v_responsable_id := p_created_by;
    ELSIF v_template.required_role IS NOT NULL THEN
      -- Try to find a user with the required role
      -- For now, we'll leave it NULL and let it be manually assigned
      -- In a more advanced implementation, you could implement assignment logic here
      -- e.g., round-robin assignment, least-loaded user, etc.
      v_responsable_id := NULL;
    END IF;
    
    -- Create the task from the template
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

COMMENT ON FUNCTION public.create_tasks_from_templates IS 'Creates tasks from active templates based on a trigger event';

-- Function to handle empresa creation and create automatic tasks
CREATE OR REPLACE FUNCTION public.handle_empresa_created()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Create tasks from templates for empresa creation
  PERFORM public.create_tasks_from_templates(
    'empresa_created'::template_trigger,
    'empresa'::task_entity_type,
    NEW.id,
    COALESCE(NEW.created_by, auth.uid())
  );
  
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.handle_empresa_created IS 'Trigger function to create automatic tasks when a new empresa is created';

-- Create trigger on empresas table
CREATE TRIGGER trigger_empresa_created_tasks
  AFTER INSERT ON public.empresas
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_empresa_created();

COMMENT ON TRIGGER trigger_empresa_created_tasks ON public.empresas IS 'Automatically creates tasks from templates when a new empresa is inserted';
