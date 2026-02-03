-- Create app_role enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'tecnico');

-- Create sector enum for companies
CREATE TYPE public.sector_empresa AS ENUM (
  'tecnologia',
  'industria',
  'servicios',
  'comercio',
  'turismo',
  'energia',
  'construccion',
  'agroalimentario',
  'otro'
);

-- Create status enum for companies
CREATE TYPE public.estado_empresa AS ENUM (
  'pendiente',
  'en_proceso',
  'asesorada',
  'completada'
);

-- Create fase_madurez enum for companies
CREATE TYPE public.fase_madurez AS ENUM (
  'idea',
  'validacion',
  'crecimiento',
  'consolidacion'
);

-- Create estado_asesoramiento enum
CREATE TYPE public.estado_asesoramiento AS ENUM (
  'programado',
  'en_curso',
  'completado',
  'cancelado'
);

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles table (separate from profiles as required)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Create empresas table
CREATE TABLE public.empresas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  cif TEXT UNIQUE,
  sector sector_empresa NOT NULL DEFAULT 'otro',
  fase_madurez fase_madurez NOT NULL DEFAULT 'idea',
  estado estado_empresa NOT NULL DEFAULT 'pendiente',
  descripcion TEXT,
  direccion TEXT,
  telefono TEXT,
  email TEXT,
  web TEXT,
  contacto_principal TEXT,
  tecnico_asignado_id UUID REFERENCES auth.users(id),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create contactos table
CREATE TABLE public.contactos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE NOT NULL,
  nombre TEXT NOT NULL,
  cargo TEXT,
  email TEXT,
  telefono TEXT,
  es_principal BOOLEAN DEFAULT false,
  notas TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create asesoramientos table
CREATE TABLE public.asesoramientos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE NOT NULL,
  tecnico_id UUID REFERENCES auth.users(id) NOT NULL,
  fecha DATE NOT NULL,
  hora_inicio TIME,
  duracion_minutos INTEGER DEFAULT 60,
  estado estado_asesoramiento NOT NULL DEFAULT 'programado',
  tema TEXT,
  acta TEXT,
  compromisos TEXT,
  proximos_pasos TEXT,
  informe_generado BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contactos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asesoramientos ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
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
      AND role = _role
  )
$$;

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(_user_id, 'admin')
$$;

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_empresas_updated_at
  BEFORE UPDATE ON public.empresas
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_contactos_updated_at
  BEFORE UPDATE ON public.contactos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_asesoramientos_updated_at
  BEFORE UPDATE ON public.asesoramientos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  
  -- Assign default role as tecnico for new users
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'tecnico');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- RLS Policies for user_roles
CREATE POLICY "Users can view all roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can insert roles"
  ON public.user_roles FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Only admins can update roles"
  ON public.user_roles FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Only admins can delete roles"
  ON public.user_roles FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- RLS Policies for empresas (all authenticated users can CRUD)
CREATE POLICY "Authenticated users can view all empresas"
  ON public.empresas FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert empresas"
  ON public.empresas FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Authenticated users can update empresas"
  ON public.empresas FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Admins can delete empresas"
  ON public.empresas FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- RLS Policies for contactos
CREATE POLICY "Authenticated users can view all contactos"
  ON public.contactos FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert contactos"
  ON public.contactos FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Authenticated users can update contactos"
  ON public.contactos FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Admins can delete contactos"
  ON public.contactos FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- RLS Policies for asesoramientos
CREATE POLICY "Authenticated users can view all asesoramientos"
  ON public.asesoramientos FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert asesoramientos"
  ON public.asesoramientos FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Authenticated users can update asesoramientos"
  ON public.asesoramientos FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Admins can delete asesoramientos"
  ON public.asesoramientos FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));