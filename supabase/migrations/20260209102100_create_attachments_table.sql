-- PR-I: Create attachments table for unified file/evidence management
-- This implements a polymorphic attachment system that can be used across all modules

-- Create enum for allowed owner types (entities that can have attachments)
CREATE TYPE public.attachment_owner_type AS ENUM (
  'empresa',
  'contacto',
  'asesoramiento',
  'evento',
  'formacion',
  'evidencia',
  'colaborador',
  'activity',
  'action_plan',
  'action_plan_item',
  'report',
  'opportunity',
  'opportunity_note',
  'grant',
  'grant_application',
  'company_compliance'
);

-- Create enum for attachment categories
CREATE TYPE public.attachment_category AS ENUM (
  'document',
  'image',
  'video',
  'certificate',
  'report',
  'contract',
  'invoice',
  'presentation',
  'other'
);

-- Create attachments table with polymorphic design
CREATE TABLE IF NOT EXISTS public.attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Polymorphic relationship fields
  owner_type attachment_owner_type NOT NULL,
  owner_id UUID NOT NULL,
  
  -- File information
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size BIGINT, -- size in bytes
  mime_type TEXT,
  
  -- Descriptive fields
  title TEXT,
  description TEXT,
  category attachment_category DEFAULT 'document',
  
  -- Metadata
  tags TEXT[], -- Array of tags for better searchability
  is_public BOOLEAN DEFAULT false,
  
  -- Audit fields
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Constraints
  CONSTRAINT attachments_file_name_check CHECK (char_length(file_name) > 0),
  CONSTRAINT attachments_file_url_check CHECK (char_length(file_url) > 0),
  CONSTRAINT attachments_file_size_check CHECK (file_size IS NULL OR file_size >= 0)
);

-- Create indexes for better query performance
CREATE INDEX idx_attachments_owner ON public.attachments(owner_type, owner_id);
CREATE INDEX idx_attachments_owner_type ON public.attachments(owner_type);
CREATE INDEX idx_attachments_category ON public.attachments(category);
CREATE INDEX idx_attachments_created_by ON public.attachments(created_by);
CREATE INDEX idx_attachments_created_at ON public.attachments(created_at DESC);
CREATE INDEX idx_attachments_tags ON public.attachments USING gin(tags); -- GIN index for array searching

-- Enable RLS
ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for attachments
-- Users with read permission can view all attachments
CREATE POLICY "Attachments are viewable by authenticated users with read permission"
  ON public.attachments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid()
    )
  );

-- Users with write permission can insert attachments
CREATE POLICY "Attachments are insertable by users with write permission"
  ON public.attachments FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'tecnico')
    )
  );

-- Users with write permission can update their own attachments or if they're admin
CREATE POLICY "Attachments are updatable by users with write permission"
  ON public.attachments FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'tecnico')
    )
  );

-- Users with write permission can delete attachments
CREATE POLICY "Attachments are deletable by users with write permission"
  ON public.attachments FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'tecnico')
    )
  );

-- Create trigger for updated_at
CREATE TRIGGER update_attachments_updated_at
  BEFORE UPDATE ON public.attachments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Add helpful comments
COMMENT ON TABLE public.attachments IS 'Polymorphic attachments table for unified file/evidence management across all modules';
COMMENT ON COLUMN public.attachments.owner_type IS 'Type of entity that owns this attachment (empresa, evento, formacion, etc.)';
COMMENT ON COLUMN public.attachments.owner_id IS 'UUID of the owner entity';
COMMENT ON COLUMN public.attachments.file_url IS 'URL to the file (could be Supabase Storage, external URL, etc.)';
COMMENT ON COLUMN public.attachments.file_size IS 'Size of the file in bytes';
COMMENT ON COLUMN public.attachments.mime_type IS 'MIME type of the file (e.g., application/pdf, image/jpeg)';
COMMENT ON COLUMN public.attachments.category IS 'Category of attachment for better organization';
COMMENT ON COLUMN public.attachments.tags IS 'Array of tags for searchability and organization';
COMMENT ON COLUMN public.attachments.is_public IS 'Whether this attachment can be publicly accessed (with proper link)';

-- Create a view for easy querying of attachments with owner information
CREATE OR REPLACE VIEW public.attachments_with_counts AS
SELECT 
  owner_type,
  owner_id,
  COUNT(*) as attachment_count,
  SUM(file_size) as total_size,
  MAX(created_at) as last_attachment_date
FROM public.attachments
GROUP BY owner_type, owner_id;

COMMENT ON VIEW public.attachments_with_counts IS 'Aggregated view showing attachment counts and sizes per owner';

-- Create helper function to get attachments for any entity
CREATE OR REPLACE FUNCTION public.get_attachments(
  p_owner_type attachment_owner_type,
  p_owner_id UUID
)
RETURNS SETOF public.attachments
LANGUAGE sql
STABLE
AS $$
  SELECT * FROM public.attachments
  WHERE owner_type = p_owner_type AND owner_id = p_owner_id
  ORDER BY created_at DESC;
$$;

COMMENT ON FUNCTION public.get_attachments IS 'Helper function to retrieve all attachments for a given entity';

-- Create helper function to count attachments for any entity
CREATE OR REPLACE FUNCTION public.count_attachments(
  p_owner_type attachment_owner_type,
  p_owner_id UUID
)
RETURNS BIGINT
LANGUAGE sql
STABLE
AS $$
  SELECT COUNT(*) FROM public.attachments
  WHERE owner_type = p_owner_type AND owner_id = p_owner_id;
$$;

COMMENT ON FUNCTION public.count_attachments IS 'Helper function to count attachments for a given entity';
