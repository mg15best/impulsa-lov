-- Add new fields to empresas table
-- This migration adds all requested fields that don't already exist

-- Add new columns to empresas table
ALTER TABLE public.empresas
  ADD COLUMN IF NOT EXISTS nombre_comercial TEXT,
  ADD COLUMN IF NOT EXISTS forma_juridica TEXT,
  ADD COLUMN IF NOT EXISTS redes_sociales JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS codigo_postal TEXT,
  ADD COLUMN IF NOT EXISTS municipio TEXT,
  ADD COLUMN IF NOT EXISTS isla TEXT,
  ADD COLUMN IF NOT EXISTS subsector TEXT,
  ADD COLUMN IF NOT EXISTS fecha_constitucion DATE,
  ADD COLUMN IF NOT EXISTS codigo_estado_pipeline TEXT,
  ADD COLUMN IF NOT EXISTS codigo_origen_lead TEXT,
  ADD COLUMN IF NOT EXISTS url_formulario_diagnostico TEXT,
  ADD COLUMN IF NOT EXISTS fecha_recepcion_diagnostico DATE,
  ADD COLUMN IF NOT EXISTS resumen_diagnostico TEXT,
  ADD COLUMN IF NOT EXISTS fecha_inicio DATE,
  ADD COLUMN IF NOT EXISTS fecha_finalizacion DATE,
  ADD COLUMN IF NOT EXISTS codigo_motivo_cierre TEXT,
  ADD COLUMN IF NOT EXISTS es_caso_exito BOOLEAN DEFAULT false;

-- Add comments to document the fields
COMMENT ON COLUMN public.empresas.nombre IS 'Nombre legal de la empresa';
COMMENT ON COLUMN public.empresas.nombre_comercial IS 'Nombre comercial de la empresa';
COMMENT ON COLUMN public.empresas.cif IS 'Identificación fiscal (CIF/NIF)';
COMMENT ON COLUMN public.empresas.forma_juridica IS 'Forma jurídica (S.L., S.A., Autónomo, etc.)';
COMMENT ON COLUMN public.empresas.web IS 'Sitio web de la empresa';
COMMENT ON COLUMN public.empresas.redes_sociales IS 'Enlaces a redes sociales en formato JSON';
COMMENT ON COLUMN public.empresas.direccion IS 'Dirección física de la empresa';
COMMENT ON COLUMN public.empresas.codigo_postal IS 'Código postal';
COMMENT ON COLUMN public.empresas.municipio IS 'Municipio';
COMMENT ON COLUMN public.empresas.isla IS 'Isla (para Canarias)';
COMMENT ON COLUMN public.empresas.sector IS 'Código/tipo de sector';
COMMENT ON COLUMN public.empresas.subsector IS 'Subsector específico';
COMMENT ON COLUMN public.empresas.fecha_constitucion IS 'Fecha de constitución de la empresa';
COMMENT ON COLUMN public.empresas.estado IS 'Estado del proceso de asesoramiento';
COMMENT ON COLUMN public.empresas.fase_madurez IS 'Fase de madurez/estado emergente';
COMMENT ON COLUMN public.empresas.codigo_estado_pipeline IS 'Código de estado en el pipeline de ventas';
COMMENT ON COLUMN public.empresas.codigo_origen_lead IS 'Código del origen del lead';
COMMENT ON COLUMN public.empresas.tecnico_asignado_id IS 'Usuario técnico asignado a la empresa';
COMMENT ON COLUMN public.empresas.url_formulario_diagnostico IS 'URL del formulario de diagnóstico';
COMMENT ON COLUMN public.empresas.fecha_recepcion_diagnostico IS 'Fecha de recepción del diagnóstico';
COMMENT ON COLUMN public.empresas.resumen_diagnostico IS 'Resumen del diagnóstico realizado';
COMMENT ON COLUMN public.empresas.fecha_inicio IS 'Fecha de inicio del proyecto/asesoramiento';
COMMENT ON COLUMN public.empresas.fecha_finalizacion IS 'Fecha de finalización del proyecto';
COMMENT ON COLUMN public.empresas.codigo_motivo_cierre IS 'Código del motivo de cierre';
COMMENT ON COLUMN public.empresas.es_caso_exito IS 'Indicador de caso de éxito';
