-- Migration: Role-Based Access Control with Secure RLS Policies
-- Extends app_role enum and hardens RLS policies

-- Step 1: Extend app_role enum to include 'auditor' and 'it'
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'auditor';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'it';

-- Step 2: Create helper function to check if user has any of the specified roles
CREATE OR REPLACE FUNCTION public.has_any_role(_user_id UUID, _roles app_role[])
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = ANY(_roles)
  )
$$;

-- Step 3: Update RLS policies for user_roles (restrict to admins only)
DROP POLICY IF EXISTS "Users can view all roles" ON public.user_roles;

CREATE POLICY "Users can view own roles, admins can view all"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.is_admin(auth.uid()));

-- Existing policies for user_roles INSERT, UPDATE, DELETE already restrict to admins

-- Step 4: Update RLS policies for empresas
-- Drop existing permissive policies
DROP POLICY IF EXISTS "Authenticated users can update empresas" ON public.empresas;
DROP POLICY IF EXISTS "Admins can delete empresas" ON public.empresas;

-- Create new role-aware policies for empresas
CREATE POLICY "Admins and tecnicos can update empresas"
  ON public.empresas FOR UPDATE
  TO authenticated
  USING (
    public.has_any_role(auth.uid(), ARRAY['admin', 'tecnico']::app_role[])
    AND (
      public.is_admin(auth.uid()) OR 
      created_by = auth.uid() OR 
      tecnico_asignado_id = auth.uid()
    )
  );

CREATE POLICY "Only admins can delete empresas"
  ON public.empresas FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- Step 5: Update RLS policies for contactos
-- Drop existing permissive policies
DROP POLICY IF EXISTS "Authenticated users can update contactos" ON public.contactos;
DROP POLICY IF EXISTS "Admins can delete contactos" ON public.contactos;

-- Create new role-aware policies for contactos
CREATE POLICY "Admins and tecnicos can update contactos"
  ON public.contactos FOR UPDATE
  TO authenticated
  USING (
    public.has_any_role(auth.uid(), ARRAY['admin', 'tecnico']::app_role[])
    AND (
      public.is_admin(auth.uid()) OR 
      created_by = auth.uid()
    )
  );

CREATE POLICY "Only admins can delete contactos"
  ON public.contactos FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- Step 6: Update RLS policies for asesoramientos
-- Drop existing permissive policies
DROP POLICY IF EXISTS "Authenticated users can update asesoramientos" ON public.asesoramientos;
DROP POLICY IF EXISTS "Admins can delete asesoramientos" ON public.asesoramientos;

-- Create new role-aware policies for asesoramientos
CREATE POLICY "Admins and tecnicos can update asesoramientos"
  ON public.asesoramientos FOR UPDATE
  TO authenticated
  USING (
    public.has_any_role(auth.uid(), ARRAY['admin', 'tecnico']::app_role[])
    AND (
      public.is_admin(auth.uid()) OR 
      created_by = auth.uid() OR 
      tecnico_id = auth.uid()
    )
  );

CREATE POLICY "Only admins can delete asesoramientos"
  ON public.asesoramientos FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- Note: INSERT policies already use created_by = auth.uid() which is secure
-- SELECT policies allow all authenticated users (read access for auditor/it roles)
