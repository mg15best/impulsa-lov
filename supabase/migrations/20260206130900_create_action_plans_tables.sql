-- Create action_plans table
CREATE TABLE IF NOT EXISTS public.action_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status_code TEXT NOT NULL DEFAULT 'draft',
  category_code TEXT,
  priority_code TEXT DEFAULT 'medium',
  start_date DATE,
  end_date DATE,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  responsible_user_id UUID REFERENCES auth.users(id),
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create action_plan_items table
CREATE TABLE IF NOT EXISTS public.action_plan_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action_plan_id UUID REFERENCES public.action_plans(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status_code TEXT NOT NULL DEFAULT 'pending',
  priority_code TEXT DEFAULT 'medium',
  due_date DATE,
  completed_date DATE,
  assigned_to_id UUID REFERENCES auth.users(id),
  order_index INTEGER DEFAULT 0,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX idx_action_plans_company ON public.action_plans(company_id);
CREATE INDEX idx_action_plans_status ON public.action_plans(status_code);
CREATE INDEX idx_action_plans_responsible ON public.action_plans(responsible_user_id);
CREATE INDEX idx_action_plan_items_plan ON public.action_plan_items(action_plan_id);
CREATE INDEX idx_action_plan_items_status ON public.action_plan_items(status_code);
CREATE INDEX idx_action_plan_items_assigned ON public.action_plan_items(assigned_to_id);

-- Enable RLS
ALTER TABLE public.action_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.action_plan_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for action_plans
-- Users with read permission can view all action plans
CREATE POLICY "Action plans are viewable by authenticated users with read permission"
  ON public.action_plans FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid()
    )
  );

-- Users with write permission can insert action plans
CREATE POLICY "Action plans are insertable by users with write permission"
  ON public.action_plans FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'tecnico')
    )
  );

-- Users with write permission can update action plans
CREATE POLICY "Action plans are updatable by users with write permission"
  ON public.action_plans FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'tecnico')
    )
  );

-- Users with write permission can delete action plans
CREATE POLICY "Action plans are deletable by users with write permission"
  ON public.action_plans FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'tecnico')
    )
  );

-- RLS Policies for action_plan_items
-- Users with read permission can view all action plan items
CREATE POLICY "Action plan items are viewable by authenticated users with read permission"
  ON public.action_plan_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid()
    )
  );

-- Users with write permission can insert action plan items
CREATE POLICY "Action plan items are insertable by users with write permission"
  ON public.action_plan_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'tecnico')
    )
  );

-- Users with write permission can update action plan items
CREATE POLICY "Action plan items are updatable by users with write permission"
  ON public.action_plan_items FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'tecnico')
    )
  );

-- Users with write permission can delete action plan items
CREATE POLICY "Action plan items are deletable by users with write permission"
  ON public.action_plan_items FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'tecnico')
    )
  );

-- Create triggers for updated_at
CREATE TRIGGER update_action_plans_updated_at
  BEFORE UPDATE ON public.action_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_action_plan_items_updated_at
  BEFORE UPDATE ON public.action_plan_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Add comments to document the tables
COMMENT ON TABLE public.action_plans IS 'Action plans for companies with status tracking and progress management';
COMMENT ON TABLE public.action_plan_items IS 'Individual items/tasks within an action plan';
COMMENT ON COLUMN public.action_plans.company_id IS 'Reference to the company this action plan belongs to';
COMMENT ON COLUMN public.action_plans.status_code IS 'Status of the action plan (from catalog)';
COMMENT ON COLUMN public.action_plans.category_code IS 'Category of the action plan (from catalog)';
COMMENT ON COLUMN public.action_plans.priority_code IS 'Priority level (from catalog)';
COMMENT ON COLUMN public.action_plans.progress IS 'Progress percentage (0-100)';
COMMENT ON COLUMN public.action_plan_items.action_plan_id IS 'Reference to the parent action plan';
COMMENT ON COLUMN public.action_plan_items.status_code IS 'Status of the item (from catalog)';
COMMENT ON COLUMN public.action_plan_items.priority_code IS 'Priority level (from catalog)';
COMMENT ON COLUMN public.action_plan_items.order_index IS 'Display order within the action plan';
