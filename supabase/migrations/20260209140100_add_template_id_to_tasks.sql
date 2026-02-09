-- PR-T2: Add template_id to tasks table
-- This links tasks created from templates back to their originating template

-- Add template_id column to tasks table
ALTER TABLE public.tasks 
  ADD COLUMN IF NOT EXISTS template_id UUID REFERENCES public.task_templates(id) ON DELETE SET NULL;

-- Create index for template_id
CREATE INDEX IF NOT EXISTS idx_tasks_template_id ON public.tasks(template_id) WHERE template_id IS NOT NULL;

-- Update source field to use 'automatica' instead of 'auto_generated' for consistency with requirements
-- Note: The source field is already TEXT, so no schema change needed, just documenting the convention
COMMENT ON COLUMN public.tasks.source IS 'Origin of the task: manual (user-created), automatica (auto-generated from template), imported, workflow, integration';
COMMENT ON COLUMN public.tasks.template_id IS 'Reference to the template used to create this task (if applicable)';
