-- PR-T2: Create task_templates table for automatic task generation
-- This table stores templates for tasks that should be automatically created
-- based on triggers (e.g., when creating a new empresa)

-- Create enum for template triggers
CREATE TYPE public.template_trigger AS ENUM (
  'empresa_created',
  'evento_created',
  'formacion_created',
  'colaborador_created',
  'opportunity_created',
  'grant_created',
  'manual' -- For templates that can be manually applied
);

-- Create task_templates table
CREATE TABLE IF NOT EXISTS public.task_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Template identification
  name TEXT NOT NULL UNIQUE,
  
  -- When this template should be triggered
  trigger template_trigger NOT NULL,
  
  -- Template for the task that will be created
  title_template TEXT NOT NULL,
  description_template TEXT,
  
  -- Default values for the task
  default_due_days INTEGER, -- Number of days from creation to set as due date
  default_priority task_priority DEFAULT 'medium',
  default_estado task_status DEFAULT 'pending',
  
  -- Assignment rules
  required_role app_role, -- If specified, task will be assigned to a user with this role
  assign_to_creator BOOLEAN DEFAULT false, -- If true, assign to the user who triggered the template
  
  -- Template settings
  is_active BOOLEAN DEFAULT true,
  
  -- Additional configuration
  metadata JSONB, -- For storing additional template configuration
  tags TEXT[], -- Default tags to apply to created tasks
  
  -- Audit fields
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Constraints
  CONSTRAINT task_templates_name_check CHECK (char_length(name) > 0),
  CONSTRAINT task_templates_title_template_check CHECK (char_length(title_template) > 0),
  CONSTRAINT task_templates_default_due_days_check CHECK (default_due_days IS NULL OR default_due_days > 0)
);

-- Create indexes for better query performance
CREATE INDEX idx_task_templates_trigger ON public.task_templates(trigger);
CREATE INDEX idx_task_templates_is_active ON public.task_templates(is_active) WHERE is_active = true;
CREATE INDEX idx_task_templates_name ON public.task_templates(name);

-- Enable RLS
ALTER TABLE public.task_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for task_templates

-- All authenticated users can view active templates
CREATE POLICY "Task templates are viewable by authenticated users"
  ON public.task_templates FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid()
    )
  );

-- Only admins can insert templates
CREATE POLICY "Task templates are insertable by admins"
  ON public.task_templates FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Only admins can update templates
CREATE POLICY "Task templates are updatable by admins"
  ON public.task_templates FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Only admins can delete templates
CREATE POLICY "Task templates are deletable by admins"
  ON public.task_templates FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Create trigger for updated_at
CREATE TRIGGER update_task_templates_updated_at
  BEFORE UPDATE ON public.task_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Add helpful comments
COMMENT ON TABLE public.task_templates IS 'Templates for automatic task creation based on system events';
COMMENT ON COLUMN public.task_templates.name IS 'Unique name identifying this template';
COMMENT ON COLUMN public.task_templates.trigger IS 'Event that triggers automatic task creation from this template';
COMMENT ON COLUMN public.task_templates.title_template IS 'Template for the task title (can include placeholders)';
COMMENT ON COLUMN public.task_templates.description_template IS 'Template for the task description (can include placeholders)';
COMMENT ON COLUMN public.task_templates.default_due_days IS 'Number of days from creation to set as due date';
COMMENT ON COLUMN public.task_templates.required_role IS 'Role required for task assignment (if specified, system will try to assign to a user with this role)';
COMMENT ON COLUMN public.task_templates.is_active IS 'Whether this template is currently active';
COMMENT ON COLUMN public.task_templates.metadata IS 'Additional configuration in JSON format';
