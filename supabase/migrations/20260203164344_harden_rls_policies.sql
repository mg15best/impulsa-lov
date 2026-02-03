-- Migration: Harden RLS Policies for Role-Based Access Control
-- This migration addresses stricter requirements for role-based access:
-- 1. Auditor/IT roles: read-only access (no INSERT/UPDATE/DELETE on business tables)
-- 2. Tecnico: UPDATE/DELETE strictly limited to created_by = auth.uid()
-- 3. User_roles: SELECT restricted to admins only (no self-view)
-- 4. Profiles: SELECT requires having a role (admin/tecnico/auditor/it)

-- Step 1: Update user_roles SELECT policy - restrict to admins only
DROP POLICY IF EXISTS "Users can view own roles, admins can view all" ON public.user_roles;

CREATE POLICY "Only admins can view roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- Step 2: Update profiles SELECT policy - require having a role
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

CREATE POLICY "Users with roles can view profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (
    public.has_any_role(auth.uid(), ARRAY['admin', 'tecnico', 'auditor', 'it']::app_role[])
  );

-- Step 3: Harden empresas policies
-- Drop existing INSERT policy and recreate with role check
DROP POLICY IF EXISTS "Authenticated users can insert empresas" ON public.empresas;

CREATE POLICY "Admins and tecnicos can insert empresas"
  ON public.empresas FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = created_by
    AND public.has_any_role(auth.uid(), ARRAY['admin', 'tecnico']::app_role[])
  );

-- Drop and recreate UPDATE policy to strictly enforce created_by for tecnico
DROP POLICY IF EXISTS "Admins and tecnicos can update empresas" ON public.empresas;

CREATE POLICY "Admins and tecnicos can update empresas"
  ON public.empresas FOR UPDATE
  TO authenticated
  USING (
    public.is_admin(auth.uid()) OR 
    (public.has_role(auth.uid(), 'tecnico') AND created_by = auth.uid())
  );

-- Ensure DELETE policy blocks auditor/it
DROP POLICY IF EXISTS "Only admins can delete empresas" ON public.empresas;

CREATE POLICY "Only admins can delete empresas"
  ON public.empresas FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- Step 4: Harden contactos policies
-- Drop existing INSERT policy and recreate with role check
DROP POLICY IF EXISTS "Authenticated users can insert contactos" ON public.contactos;

CREATE POLICY "Admins and tecnicos can insert contactos"
  ON public.contactos FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = created_by
    AND public.has_any_role(auth.uid(), ARRAY['admin', 'tecnico']::app_role[])
  );

-- Drop and recreate UPDATE policy to strictly enforce created_by for tecnico
DROP POLICY IF EXISTS "Admins and tecnicos can update contactos" ON public.contactos;

CREATE POLICY "Admins and tecnicos can update contactos"
  ON public.contactos FOR UPDATE
  TO authenticated
  USING (
    public.is_admin(auth.uid()) OR 
    (public.has_role(auth.uid(), 'tecnico') AND created_by = auth.uid())
  );

-- Ensure DELETE policy blocks auditor/it
DROP POLICY IF EXISTS "Only admins can delete contactos" ON public.contactos;

CREATE POLICY "Only admins can delete contactos"
  ON public.contactos FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- Step 5: Harden asesoramientos policies
-- Drop existing INSERT policy and recreate with role check
DROP POLICY IF EXISTS "Authenticated users can insert asesoramientos" ON public.asesoramientos;

CREATE POLICY "Admins and tecnicos can insert asesoramientos"
  ON public.asesoramientos FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = created_by
    AND public.has_any_role(auth.uid(), ARRAY['admin', 'tecnico']::app_role[])
  );

-- Drop and recreate UPDATE policy to strictly enforce created_by for tecnico
DROP POLICY IF EXISTS "Admins and tecnicos can update asesoramientos" ON public.asesoramientos;

CREATE POLICY "Admins and tecnicos can update asesoramientos"
  ON public.asesoramientos FOR UPDATE
  TO authenticated
  USING (
    public.is_admin(auth.uid()) OR 
    (public.has_role(auth.uid(), 'tecnico') AND created_by = auth.uid())
  );

-- Ensure DELETE policy blocks auditor/it
DROP POLICY IF EXISTS "Only admins can delete asesoramientos" ON public.asesoramientos;

CREATE POLICY "Only admins can delete asesoramientos"
  ON public.asesoramientos FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));
