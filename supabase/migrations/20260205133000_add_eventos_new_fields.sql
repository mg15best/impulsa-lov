-- Add new fields to eventos table
-- This migration adds all requested fields that don't already exist

-- Add new columns to eventos table
ALTER TABLE public.eventos
  ADD COLUMN IF NOT EXISTS fecha_fin DATE,
  ADD COLUMN IF NOT EXISTS hora_fin TIME,
  ADD COLUMN IF NOT EXISTS formato TEXT,
  ADD COLUMN IF NOT EXISTS objetivo TEXT,
  ADD COLUMN IF NOT EXISTS notas_programa TEXT,
  ADD COLUMN IF NOT EXISTS notas_evidencia TEXT;

-- Add comments to document the fields
COMMENT ON COLUMN public.eventos.nombre IS 'Título del evento';
COMMENT ON COLUMN public.eventos.tipo IS 'Código de tipo de evento';
COMMENT ON COLUMN public.eventos.estado IS 'Estado del evento';
COMMENT ON COLUMN public.eventos.fecha IS 'Fecha de inicio del evento';
COMMENT ON COLUMN public.eventos.hora_inicio IS 'Hora de inicio del evento';
COMMENT ON COLUMN public.eventos.fecha_fin IS 'Fecha de fin del evento';
COMMENT ON COLUMN public.eventos.hora_fin IS 'Hora de fin del evento';
COMMENT ON COLUMN public.eventos.formato IS 'Código de formato (presencial, online, híbrido)';
COMMENT ON COLUMN public.eventos.ubicacion IS 'Ubicación o URL del evento';
COMMENT ON COLUMN public.eventos.objetivo IS 'Objetivo del evento';
COMMENT ON COLUMN public.eventos.notas_programa IS 'Notas del programa del evento';
COMMENT ON COLUMN public.eventos.notas_evidencia IS 'Notas de evidencia del evento';
COMMENT ON COLUMN public.eventos.observaciones IS 'Observaciones adicionales';
