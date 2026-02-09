-- PR-T1: Create tasks table for task management core
-- This implements a polymorphic task system that can be linked to various entities

-- Create enum for task status
CREATE TYPE public.task_status AS ENUM (
  'pending',
  'in_progress',
  'completed',
  'cancelled',
  'on_hold'
);

-- Create enum for task priority
CREATE TYPE public.task_priority AS ENUM (
  'low',
  'medium',
  'high',
  'urgent'
);

-- Create enum for entity types that can have tasks
CREATE TYPE public.task_entity_type AS ENUM (
  'empresa',
  'evento',
  'formacion',
  'colaborador',
  'material',
  'dissemination_impact',
  'opportunity',
  'grant',
  'action_plan',
  'report',
  'general' -- For tasks not tied to specific entities
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Polymorphic relationship to entities
  entity_type task_entity_type NOT NULL DEFAULT 'general',
  entity_id UUID, -- ID of the related entity (empresa, evento, etc.)
  
  -- Basic task information
  titulo TEXT NOT NULL,
  descripcion TEXT,
  
  -- Status and priority
  estado task_status NOT NULL DEFAULT 'pending',
  prioridad task_priority NOT NULL DEFAULT 'medium',
  
  -- Dates
  fecha_vencimiento DATE,
  fecha_inicio DATE,
  fecha_completado TIMESTAMP WITH TIME ZONE,
  
  -- Assignment
  responsable_id UUID REFERENCES auth.users(id), -- User responsible for the task
  
  -- Source/Origin
  source TEXT DEFAULT 'manual', -- 'manual', 'auto_generated', 'imported', etc.
  
  -- Additional metadata
  tags TEXT[], -- Array of tags for searchability
  observaciones TEXT,
  
  -- Audit fields
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Constraints
  CONSTRAINT tasks_titulo_check CHECK (char_length(titulo) > 0),
  CONSTRAINT tasks_dates_check CHECK (
    fecha_completado IS NULL OR 
    fecha_inicio IS NULL OR 
    fecha_completado >= fecha_inicio
  )
);

-- Create indexes for better query performance
CREATE INDEX idx_tasks_entity ON public.tasks(entity_type, entity_id);
CREATE INDEX idx_tasks_entity_type ON public.tasks(entity_type);
CREATE INDEX idx_tasks_estado ON public.tasks(estado);
CREATE INDEX idx_tasks_prioridad ON public.tasks(prioridad);
CREATE INDEX idx_tasks_responsable ON public.tasks(responsable_id);
CREATE INDEX idx_tasks_created_by ON public.tasks(created_by);
CREATE INDEX idx_tasks_created_at ON public.tasks(created_at DESC);
CREATE INDEX idx_tasks_fecha_vencimiento ON public.tasks(fecha_vencimiento) WHERE fecha_vencimiento IS NOT NULL;
CREATE INDEX idx_tasks_source ON public.tasks(source);
CREATE INDEX idx_tasks_tags ON public.tasks USING gin(tags);

-- Enable RLS
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tasks

-- All authenticated users can view tasks
CREATE POLICY "Tasks are viewable by authenticated users"
  ON public.tasks FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid()
    )
  );

-- Users with write permission can insert tasks
CREATE POLICY "Tasks are insertable by users with write permission"
  ON public.tasks FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'tecnico')
    )
  );

-- Users with write permission can update tasks
-- Admins can update all, tecnicos can update their own or assigned tasks
CREATE POLICY "Tasks are updatable by users with write permission"
  ON public.tasks FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND (
        role = 'admin' OR 
        (role = 'tecnico' AND (created_by = auth.uid() OR responsable_id = auth.uid()))
      )
    )
  );

-- Only admins can delete tasks
CREATE POLICY "Tasks are deletable by admins"
  ON public.tasks FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Create trigger for updated_at
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Add helpful comments
COMMENT ON TABLE public.tasks IS 'Tasks table for managing tasks across all entities in the system';
COMMENT ON COLUMN public.tasks.entity_type IS 'Type of entity this task is related to';
COMMENT ON COLUMN public.tasks.entity_id IS 'UUID of the related entity';
COMMENT ON COLUMN public.tasks.titulo IS 'Title of the task';
COMMENT ON COLUMN public.tasks.descripcion IS 'Detailed description of the task';
COMMENT ON COLUMN public.tasks.estado IS 'Current status of the task (pending, in_progress, completed, cancelled, on_hold)';
COMMENT ON COLUMN public.tasks.prioridad IS 'Priority level of the task (low, medium, high, urgent)';
COMMENT ON COLUMN public.tasks.fecha_vencimiento IS 'Due date for the task';
COMMENT ON COLUMN public.tasks.fecha_inicio IS 'Start date of the task';
COMMENT ON COLUMN public.tasks.fecha_completado IS 'Date and time when the task was completed';
COMMENT ON COLUMN public.tasks.responsable_id IS 'User assigned as responsible for completing the task';
COMMENT ON COLUMN public.tasks.source IS 'Origin of the task (manual, auto_generated, imported, etc.)';
COMMENT ON COLUMN public.tasks.tags IS 'Array of tags for searchability and categorization';
COMMENT ON COLUMN public.tasks.observaciones IS 'Additional observations or notes about the task';

-- Helper function to get tasks for a specific entity
CREATE OR REPLACE FUNCTION public.get_tasks_for_entity(
  p_entity_type task_entity_type,
  p_entity_id UUID
)
RETURNS SETOF public.tasks
LANGUAGE sql
STABLE
AS $$
  SELECT * FROM public.tasks
  WHERE entity_type = p_entity_type AND entity_id = p_entity_id
  ORDER BY 
    CASE estado
      WHEN 'in_progress' THEN 1
      WHEN 'pending' THEN 2
      WHEN 'on_hold' THEN 3
      WHEN 'completed' THEN 4
      WHEN 'cancelled' THEN 5
    END,
    CASE prioridad
      WHEN 'urgent' THEN 1
      WHEN 'high' THEN 2
      WHEN 'medium' THEN 3
      WHEN 'low' THEN 4
    END,
    fecha_vencimiento NULLS LAST,
    created_at DESC;
$$;

COMMENT ON FUNCTION public.get_tasks_for_entity IS 'Helper function to retrieve all tasks for a given entity, sorted by status and priority';

-- Helper function to count pending tasks for an entity
CREATE OR REPLACE FUNCTION public.count_pending_tasks_for_entity(
  p_entity_type task_entity_type,
  p_entity_id UUID
)
RETURNS BIGINT
LANGUAGE sql
STABLE
AS $$
  SELECT COUNT(*) FROM public.tasks
  WHERE entity_type = p_entity_type 
    AND entity_id = p_entity_id
    AND estado IN ('pending', 'in_progress');
$$;

COMMENT ON FUNCTION public.count_pending_tasks_for_entity IS 'Helper function to count pending and in-progress tasks for a given entity';
