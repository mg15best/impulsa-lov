-- PR-T2: Insert initial task template for "Diagnóstico inicial"
-- This template will be triggered when a new empresa is created

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
) VALUES (
  'diagnostico_inicial_empresa',
  'empresa_created',
  'Diagnóstico inicial',
  'Realizar el diagnóstico inicial de la empresa para evaluar su situación actual, necesidades y oportunidades de asesoramiento.',
  7, -- 7 days to complete
  'high', -- High priority
  'pending', -- Start as pending
  'tecnico', -- Assign to a tecnico
  false, -- Don't assign to creator (assign based on role instead)
  true, -- Active template
  ARRAY['diagnostico', 'inicial', 'empresa']
);

-- Add catalog entry for the new source type if not already present
INSERT INTO public.catalogs (category, code, label, description, is_active)
VALUES 
  ('task_sources', 'automatica', 'Automática', 'Tarea creada automáticamente por el sistema', true)
ON CONFLICT (category, code) DO NOTHING;
