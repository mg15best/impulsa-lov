-- Add new fields to formaciones table
-- This migration adds all requested fields that don't already exist

-- Add new columns to formaciones table
ALTER TABLE public.formaciones
  ADD COLUMN IF NOT EXISTS tema TEXT,
  ADD COLUMN IF NOT EXISTS hora_inicio TIME,
  ADD COLUMN IF NOT EXISTS hora_fin TIME,
  ADD COLUMN IF NOT EXISTS notas_evidencia TEXT;

-- Add comments to document the fields
COMMENT ON COLUMN public.formaciones.titulo IS 'Título de la formación';
COMMENT ON COLUMN public.formaciones.tema IS 'Tema de la formación';
COMMENT ON COLUMN public.formaciones.tipo IS 'Tipo de formación';
COMMENT ON COLUMN public.formaciones.estado IS 'Estado de la formación';
COMMENT ON COLUMN public.formaciones.objetivos IS 'Objetivos de la formación';
COMMENT ON COLUMN public.formaciones.modalidad IS 'Código de modalidad (presencial, online, híbrida)';
COMMENT ON COLUMN public.formaciones.fecha_inicio IS 'Fecha de inicio de la formación';
COMMENT ON COLUMN public.formaciones.hora_inicio IS 'Hora de inicio de la formación';
COMMENT ON COLUMN public.formaciones.fecha_fin IS 'Fecha de fin de la formación';
COMMENT ON COLUMN public.formaciones.hora_fin IS 'Hora de fin de la formación';
COMMENT ON COLUMN public.formaciones.duracion_horas IS 'Duración en horas de la formación';
COMMENT ON COLUMN public.formaciones.formador IS 'Proveedor/Formador de la formación';
COMMENT ON COLUMN public.formaciones.materiales IS 'Notas de materiales de la formación';
COMMENT ON COLUMN public.formaciones.notas_evidencia IS 'Notas de evidencia de la formación';
COMMENT ON COLUMN public.formaciones.observaciones IS 'Observaciones adicionales';
