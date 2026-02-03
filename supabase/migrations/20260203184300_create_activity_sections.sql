-- Create enums for new sections

-- Eventos
CREATE TYPE public.tipo_evento AS ENUM (
  'taller',
  'seminario',
  'networking',
  'conferencia',
  'presentacion',
  'otro'
);

CREATE TYPE public.estado_evento AS ENUM (
  'planificado',
  'confirmado',
  'en_curso',
  'completado',
  'cancelado'
);

-- Formaciones
CREATE TYPE public.tipo_formacion AS ENUM (
  'pildora_formativa',
  'curso',
  'masterclass',
  'webinar',
  'otro'
);

CREATE TYPE public.estado_formacion AS ENUM (
  'planificada',
  'en_curso',
  'completada',
  'cancelada'
);

-- Evidencias
CREATE TYPE public.tipo_evidencia AS ENUM (
  'informe',
  'acta',
  'fotografia',
  'video',
  'certificado',
  'documento',
  'otro'
);

-- Colaboradores
CREATE TYPE public.tipo_colaborador AS ENUM (
  'entidad_publica',
  'entidad_privada',
  'asociacion',
  'universidad',
  'centro_investigacion',
  'otro'
);

CREATE TYPE public.estado_colaborador AS ENUM (
  'activo',
  'inactivo',
  'pendiente'
);

-- Create eventos table
CREATE TABLE public.eventos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  tipo tipo_evento NOT NULL DEFAULT 'otro',
  estado estado_evento NOT NULL DEFAULT 'planificado',
  fecha DATE,
  hora_inicio TIME,
  duracion_minutos INTEGER DEFAULT 120,
  ubicacion TEXT,
  descripcion TEXT,
  ponentes TEXT,
  asistentes_esperados INTEGER,
  asistentes_confirmados INTEGER DEFAULT 0,
  observaciones TEXT,
  empresa_id UUID REFERENCES public.empresas(id) ON DELETE SET NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create formaciones table
CREATE TABLE public.formaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  tipo tipo_formacion NOT NULL DEFAULT 'pildora_formativa',
  estado estado_formacion NOT NULL DEFAULT 'planificada',
  fecha_inicio DATE,
  fecha_fin DATE,
  duracion_horas INTEGER,
  formador TEXT,
  descripcion TEXT,
  objetivos TEXT,
  contenido TEXT,
  participantes_max INTEGER,
  participantes_inscritos INTEGER DEFAULT 0,
  modalidad TEXT, -- 'presencial', 'online', 'hibrida'
  ubicacion TEXT,
  materiales TEXT,
  observaciones TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create evidencias table
CREATE TABLE public.evidencias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  tipo tipo_evidencia NOT NULL DEFAULT 'documento',
  descripcion TEXT,
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  archivo_url TEXT,
  archivo_nombre TEXT,
  empresa_id UUID REFERENCES public.empresas(id) ON DELETE SET NULL,
  evento_id UUID REFERENCES public.eventos(id) ON DELETE SET NULL,
  formacion_id UUID REFERENCES public.formaciones(id) ON DELETE SET NULL,
  asesoramiento_id UUID REFERENCES public.asesoramientos(id) ON DELETE SET NULL,
  observaciones TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create colaboradores table
CREATE TABLE public.colaboradores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  tipo tipo_colaborador NOT NULL DEFAULT 'otro',
  estado estado_colaborador NOT NULL DEFAULT 'pendiente',
  cif TEXT,
  descripcion TEXT,
  direccion TEXT,
  telefono TEXT,
  email TEXT,
  web TEXT,
  contacto_principal TEXT,
  cargo_contacto TEXT,
  email_contacto TEXT,
  telefono_contacto TEXT,
  fecha_inicio_colaboracion DATE,
  ambito_colaboracion TEXT,
  convenio_firmado BOOLEAN DEFAULT false,
  observaciones TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.formaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evidencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.colaboradores ENABLE ROW LEVEL SECURITY;

-- Create triggers for updated_at
CREATE TRIGGER update_eventos_updated_at
  BEFORE UPDATE ON public.eventos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_formaciones_updated_at
  BEFORE UPDATE ON public.formaciones
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_evidencias_updated_at
  BEFORE UPDATE ON public.evidencias
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_colaboradores_updated_at
  BEFORE UPDATE ON public.colaboradores
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies for eventos
CREATE POLICY "Authenticated users can view all eventos"
  ON public.eventos FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert eventos"
  ON public.eventos FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Authenticated users can update eventos"
  ON public.eventos FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Admins can delete eventos"
  ON public.eventos FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- RLS Policies for formaciones
CREATE POLICY "Authenticated users can view all formaciones"
  ON public.formaciones FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert formaciones"
  ON public.formaciones FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Authenticated users can update formaciones"
  ON public.formaciones FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Admins can delete formaciones"
  ON public.formaciones FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- RLS Policies for evidencias
CREATE POLICY "Authenticated users can view all evidencias"
  ON public.evidencias FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert evidencias"
  ON public.evidencias FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Authenticated users can update evidencias"
  ON public.evidencias FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Admins can delete evidencias"
  ON public.evidencias FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- RLS Policies for colaboradores
CREATE POLICY "Authenticated users can view all colaboradores"
  ON public.colaboradores FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert colaboradores"
  ON public.colaboradores FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Authenticated users can update colaboradores"
  ON public.colaboradores FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Admins can delete colaboradores"
  ON public.colaboradores FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- Notify PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';
