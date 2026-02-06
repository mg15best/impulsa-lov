-- Add catalog entries for reports
-- These catalogs support the reports table

-- Report Statuses Catalog (status_code)
INSERT INTO public.catalogs (catalog_type, code, label, sort_order) VALUES
  ('report_statuses', 'draft', 'Borrador', 1),
  ('report_statuses', 'in_review', 'En Revisión', 2),
  ('report_statuses', 'approved', 'Aprobado', 3),
  ('report_statuses', 'published', 'Publicado', 4),
  ('report_statuses', 'archived', 'Archivado', 5)
ON CONFLICT (catalog_type, code) DO NOTHING;

-- Report Types Catalog (report_type_code)
INSERT INTO public.catalogs (catalog_type, code, label, sort_order) VALUES
  ('report_types', 'diagnostic', 'Diagnóstico', 1),
  ('report_types', 'progress', 'Seguimiento', 2),
  ('report_types', 'final', 'Final', 3),
  ('report_types', 'consultation', 'Consultoría', 4),
  ('report_types', 'evaluation', 'Evaluación', 5),
  ('report_types', 'financial', 'Financiero', 6),
  ('report_types', 'technical', 'Técnico', 7),
  ('report_types', 'other', 'Otro', 99)
ON CONFLICT (catalog_type, code) DO NOTHING;

-- Add comments to document these catalogs
COMMENT ON TABLE public.catalogs IS 'Transversal catalog table storing code-label pairs for various catalog types across the application. Used for report statuses, types, and other catalog entries.';
