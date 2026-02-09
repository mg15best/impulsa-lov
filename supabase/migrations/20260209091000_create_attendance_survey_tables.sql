-- PR-G: Create attendance and survey tables for trainings and events
-- This migration creates:
-- 1. training_attendance - attendance tracking for formaciones
-- 2. event_invites - invitation management for eventos
-- 3. event_attendance - attendance tracking for eventos
-- 4. event_surveys - impact surveys for eventos

-- Create enums for attendance and survey statuses
CREATE TYPE public.attendance_status AS ENUM (
  'registered',
  'confirmed',
  'attended',
  'no_show',
  'cancelled'
);

CREATE TYPE public.invite_status AS ENUM (
  'sent',
  'accepted',
  'declined',
  'pending'
);

CREATE TYPE public.survey_status AS ENUM (
  'draft',
  'published',
  'closed'
);

-- Table: training_attendance
-- Tracks attendance for formaciones (trainings)
CREATE TABLE IF NOT EXISTS public.training_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  formacion_id UUID NOT NULL REFERENCES public.formaciones(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.empresas(id) ON DELETE SET NULL,
  attendee_name TEXT NOT NULL,
  attendee_email TEXT,
  attendee_phone TEXT,
  attendee_position TEXT,
  status attendance_status NOT NULL DEFAULT 'registered',
  registration_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  attendance_date TIMESTAMP WITH TIME ZONE,
  certificate_issued BOOLEAN DEFAULT false,
  certificate_url TEXT,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table: event_invites
-- Manages invitations for eventos (events)
CREATE TABLE IF NOT EXISTS public.event_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id UUID NOT NULL REFERENCES public.eventos(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.empresas(id) ON DELETE SET NULL,
  invitee_name TEXT NOT NULL,
  invitee_email TEXT,
  invitee_phone TEXT,
  invitee_position TEXT,
  status invite_status NOT NULL DEFAULT 'pending',
  sent_date TIMESTAMP WITH TIME ZONE,
  response_date TIMESTAMP WITH TIME ZONE,
  response_notes TEXT,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table: event_attendance
-- Tracks actual attendance for eventos (events)
CREATE TABLE IF NOT EXISTS public.event_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id UUID NOT NULL REFERENCES public.eventos(id) ON DELETE CASCADE,
  invite_id UUID REFERENCES public.event_invites(id) ON DELETE SET NULL,
  company_id UUID REFERENCES public.empresas(id) ON DELETE SET NULL,
  attendee_name TEXT NOT NULL,
  attendee_email TEXT,
  attendee_phone TEXT,
  attendee_position TEXT,
  status attendance_status NOT NULL DEFAULT 'registered',
  registration_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  attendance_date TIMESTAMP WITH TIME ZONE,
  certificate_issued BOOLEAN DEFAULT false,
  certificate_url TEXT,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table: event_surveys
-- Impact surveys for eventos (events)
CREATE TABLE IF NOT EXISTS public.event_surveys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id UUID NOT NULL REFERENCES public.eventos(id) ON DELETE CASCADE,
  attendance_id UUID REFERENCES public.event_attendance(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.empresas(id) ON DELETE SET NULL,
  respondent_name TEXT,
  respondent_email TEXT,
  status survey_status NOT NULL DEFAULT 'draft',
  
  -- Survey questions - using JSONB for flexibility
  satisfaction_rating INTEGER CHECK (satisfaction_rating >= 1 AND satisfaction_rating <= 5),
  content_rating INTEGER CHECK (content_rating >= 1 AND content_rating <= 5),
  organization_rating INTEGER CHECK (organization_rating >= 1 AND organization_rating <= 5),
  usefulness_rating INTEGER CHECK (usefulness_rating >= 1 AND usefulness_rating <= 5),
  
  -- Open-ended questions
  highlights TEXT,
  improvements TEXT,
  impact_description TEXT,
  follow_up_interest BOOLEAN DEFAULT false,
  follow_up_notes TEXT,
  
  -- Additional survey data as JSON for custom questions
  custom_responses JSONB DEFAULT '{}'::jsonb,
  
  submitted_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX idx_training_attendance_formacion ON public.training_attendance(formacion_id);
CREATE INDEX idx_training_attendance_company ON public.training_attendance(company_id);
CREATE INDEX idx_training_attendance_status ON public.training_attendance(status);

CREATE INDEX idx_event_invites_evento ON public.event_invites(evento_id);
CREATE INDEX idx_event_invites_company ON public.event_invites(company_id);
CREATE INDEX idx_event_invites_status ON public.event_invites(status);

CREATE INDEX idx_event_attendance_evento ON public.event_attendance(evento_id);
CREATE INDEX idx_event_attendance_company ON public.event_attendance(company_id);
CREATE INDEX idx_event_attendance_invite ON public.event_attendance(invite_id);
CREATE INDEX idx_event_attendance_status ON public.event_attendance(status);

CREATE INDEX idx_event_surveys_evento ON public.event_surveys(evento_id);
CREATE INDEX idx_event_surveys_attendance ON public.event_surveys(attendance_id);
CREATE INDEX idx_event_surveys_company ON public.event_surveys(company_id);
CREATE INDEX idx_event_surveys_status ON public.event_surveys(status);

-- Enable RLS on all new tables
ALTER TABLE public.training_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_surveys ENABLE ROW LEVEL SECURITY;

-- Create triggers for updated_at
CREATE TRIGGER update_training_attendance_updated_at
  BEFORE UPDATE ON public.training_attendance
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_event_invites_updated_at
  BEFORE UPDATE ON public.event_invites
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_event_attendance_updated_at
  BEFORE UPDATE ON public.event_attendance
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_event_surveys_updated_at
  BEFORE UPDATE ON public.event_surveys
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies for training_attendance
CREATE POLICY "Authenticated users can view all training_attendance"
  ON public.training_attendance FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert training_attendance"
  ON public.training_attendance FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Admins and tecnicos can update training_attendance"
  ON public.training_attendance FOR UPDATE
  TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin', 'tecnico']::app_role[]));

CREATE POLICY "Admins can delete training_attendance"
  ON public.training_attendance FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- RLS Policies for event_invites
CREATE POLICY "Authenticated users can view all event_invites"
  ON public.event_invites FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert event_invites"
  ON public.event_invites FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Admins and tecnicos can update event_invites"
  ON public.event_invites FOR UPDATE
  TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin', 'tecnico']::app_role[]));

CREATE POLICY "Admins can delete event_invites"
  ON public.event_invites FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- RLS Policies for event_attendance
CREATE POLICY "Authenticated users can view all event_attendance"
  ON public.event_attendance FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert event_attendance"
  ON public.event_attendance FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Admins and tecnicos can update event_attendance"
  ON public.event_attendance FOR UPDATE
  TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin', 'tecnico']::app_role[]));

CREATE POLICY "Admins can delete event_attendance"
  ON public.event_attendance FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- RLS Policies for event_surveys
CREATE POLICY "Authenticated users can view all event_surveys"
  ON public.event_surveys FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert event_surveys"
  ON public.event_surveys FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Admins and tecnicos can update event_surveys"
  ON public.event_surveys FOR UPDATE
  TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin', 'tecnico']::app_role[]));

CREATE POLICY "Admins can delete event_surveys"
  ON public.event_surveys FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- Add comments for documentation
COMMENT ON TABLE public.training_attendance IS 'Tracks attendance for formaciones (trainings)';
COMMENT ON TABLE public.event_invites IS 'Manages invitations for eventos (events)';
COMMENT ON TABLE public.event_attendance IS 'Tracks actual attendance for eventos (events)';
COMMENT ON TABLE public.event_surveys IS 'Impact surveys for eventos (events)';

-- Notify PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';
