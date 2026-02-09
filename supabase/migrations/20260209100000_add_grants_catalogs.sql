-- Add catalog entries for grants management
-- These catalogs support the grants and grant_applications tables

-- Grant Statuses Catalog (status_code)
INSERT INTO public.catalogs (catalog_type, code, label, sort_order) VALUES
  ('grant_statuses', 'draft', 'Borrador', 1),
  ('grant_statuses', 'submitted', 'Enviada', 2),
  ('grant_statuses', 'under_review', 'En Revisión', 3),
  ('grant_statuses', 'approved', 'Aprobada', 4),
  ('grant_statuses', 'rejected', 'Rechazada', 5),
  ('grant_statuses', 'in_progress', 'En Progreso', 6),
  ('grant_statuses', 'completed', 'Completada', 7),
  ('grant_statuses', 'cancelled', 'Cancelada', 8)
ON CONFLICT (catalog_type, code) DO NOTHING;

-- Grant Types Catalog (type_code)
INSERT INTO public.catalogs (catalog_type, code, label, sort_order) VALUES
  ('grant_types', 'seed_funding', 'Financiación Semilla', 1),
  ('grant_types', 'equipment', 'Equipamiento', 2),
  ('grant_types', 'training', 'Formación', 3),
  ('grant_types', 'innovation', 'Innovación', 4),
  ('grant_types', 'r_and_d', 'I+D', 5),
  ('grant_types', 'sustainability', 'Sostenibilidad', 6),
  ('grant_types', 'export', 'Exportación', 7),
  ('grant_types', 'digitalization', 'Digitalización', 8),
  ('grant_types', 'infrastructure', 'Infraestructura', 9),
  ('grant_types', 'other', 'Otro', 99)
ON CONFLICT (catalog_type, code) DO NOTHING;

-- Grant Programs Catalog (program_code)
INSERT INTO public.catalogs (catalog_type, code, label, sort_order) VALUES
  ('grant_programs', 'national', 'Programa Nacional', 1),
  ('grant_programs', 'regional', 'Programa Regional', 2),
  ('grant_programs', 'european', 'Programa Europeo', 3),
  ('grant_programs', 'private', 'Programa Privado', 4),
  ('grant_programs', 'local', 'Programa Local', 5),
  ('grant_programs', 'sector_specific', 'Programa Sectorial', 6),
  ('grant_programs', 'other', 'Otro', 99)
ON CONFLICT (catalog_type, code) DO NOTHING;

-- Grant Application Statuses Catalog (status_code for applications)
INSERT INTO public.catalogs (catalog_type, code, label, sort_order) VALUES
  ('grant_application_statuses', 'draft', 'Borrador', 1),
  ('grant_application_statuses', 'pending', 'Pendiente', 2),
  ('grant_application_statuses', 'submitted', 'Enviada', 3),
  ('grant_application_statuses', 'under_review', 'En Revisión', 4),
  ('grant_application_statuses', 'approved', 'Aprobada', 5),
  ('grant_application_statuses', 'rejected', 'Rechazada', 6),
  ('grant_application_statuses', 'requires_changes', 'Requiere Cambios', 7),
  ('grant_application_statuses', 'cancelled', 'Cancelada', 8)
ON CONFLICT (catalog_type, code) DO NOTHING;

-- Add comments to document these catalogs
COMMENT ON TABLE public.catalogs IS 'Transversal catalog table storing code-label pairs for various catalog types across the application. Used for grant statuses, types, programs, and application statuses among others.';
