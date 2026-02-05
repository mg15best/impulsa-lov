-- Add new fields to colaboradores table
-- This migration adds all requested fields that don't already exist

-- Add new columns to colaboradores table
ALTER TABLE public.colaboradores
  ADD COLUMN IF NOT EXISTS codigo_alcance TEXT,
  ADD COLUMN IF NOT EXISTS sectores_interes TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS tipos_apoyo TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS codigo_rango_ticket TEXT,
  ADD COLUMN IF NOT EXISTS requisitos_habituales TEXT,
  ADD COLUMN IF NOT EXISTS asignado_a UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add comments to document the fields
COMMENT ON COLUMN public.colaboradores.nombre IS 'Nombre de la entidad colaboradora';
COMMENT ON COLUMN public.colaboradores.cif IS 'Identificación fiscal (CIF/NIF)';
COMMENT ON COLUMN public.colaboradores.tipo IS 'Código de tipo de entidad';
COMMENT ON COLUMN public.colaboradores.codigo_alcance IS 'Código de alcance de la colaboración';
COMMENT ON COLUMN public.colaboradores.web IS 'Sitio web de la entidad';
COMMENT ON COLUMN public.colaboradores.contacto_principal IS 'Nombre del contacto principal';
COMMENT ON COLUMN public.colaboradores.cargo_contacto IS 'Rol/cargo del contacto principal';
COMMENT ON COLUMN public.colaboradores.telefono IS 'Teléfono general de la entidad';
COMMENT ON COLUMN public.colaboradores.email IS 'Correo electrónico general de la entidad';
COMMENT ON COLUMN public.colaboradores.email_contacto IS 'Correo electrónico del contacto principal';
COMMENT ON COLUMN public.colaboradores.telefono_contacto IS 'Teléfono del contacto principal';
COMMENT ON COLUMN public.colaboradores.sectores_interes IS 'Sectores de interés de la colaboración';
COMMENT ON COLUMN public.colaboradores.tipos_apoyo IS 'Tipos de apoyo que puede proporcionar';
COMMENT ON COLUMN public.colaboradores.codigo_rango_ticket IS 'Código de rango de ticket/importe';
COMMENT ON COLUMN public.colaboradores.requisitos_habituales IS 'Requisitos habituales para la colaboración';
COMMENT ON COLUMN public.colaboradores.estado IS 'Código de estado de la relación';
COMMENT ON COLUMN public.colaboradores.fecha_inicio_colaboracion IS 'Fecha de primer contacto';
COMMENT ON COLUMN public.colaboradores.asignado_a IS 'Usuario asignado como responsable';
COMMENT ON COLUMN public.colaboradores.observaciones IS 'Notas adicionales';
