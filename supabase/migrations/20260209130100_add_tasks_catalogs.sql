-- PR-T1: Add catalog entries for tasks

-- Task types catalog (for categorizing tasks)
INSERT INTO public.catalogs (catalog_type, code, label, sort_order) VALUES
  ('task_types', 'seguimiento', 'Seguimiento', 1),
  ('task_types', 'revision', 'Revisión', 2),
  ('task_types', 'documentacion', 'Documentación', 3),
  ('task_types', 'contacto', 'Contacto', 4),
  ('task_types', 'evaluacion', 'Evaluación', 5),
  ('task_types', 'preparacion', 'Preparación', 6),
  ('task_types', 'entrega', 'Entrega', 7),
  ('task_types', 'otro', 'Otro', 99);

-- Task sources catalog
INSERT INTO public.catalogs (catalog_type, code, label, sort_order) VALUES
  ('task_sources', 'manual', 'Manual', 1),
  ('task_sources', 'auto_generated', 'Generada automáticamente', 2),
  ('task_sources', 'imported', 'Importada', 3),
  ('task_sources', 'workflow', 'Flujo de trabajo', 4),
  ('task_sources', 'integration', 'Integración', 5);

COMMENT ON TABLE public.catalogs IS 'Transversal catalog table storing code-label pairs for various catalog types across the application, including task types and sources';
