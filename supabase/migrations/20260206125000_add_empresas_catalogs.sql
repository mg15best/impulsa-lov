-- Add catalog entries for empresas *_code fields
-- These catalogs support the structural fields added in PR-C

-- Pipeline Statuses Catalog (pipeline_status_code)
INSERT INTO public.catalogs (catalog_type, code, label, sort_order) VALUES
  ('pipeline_statuses', 'lead', 'Lead', 1),
  ('pipeline_statuses', 'qualified', 'Cualificado', 2),
  ('pipeline_statuses', 'proposal', 'Propuesta', 3),
  ('pipeline_statuses', 'negotiation', 'Negociación', 4),
  ('pipeline_statuses', 'won', 'Ganado', 5),
  ('pipeline_statuses', 'lost', 'Perdido', 6)
ON CONFLICT (catalog_type, code) DO NOTHING;

-- Lead Sources Catalog (lead_source_code)
INSERT INTO public.catalogs (catalog_type, code, label, sort_order) VALUES
  ('lead_sources', 'web', 'Sitio Web', 1),
  ('lead_sources', 'referral', 'Referido', 2),
  ('lead_sources', 'event', 'Evento', 3),
  ('lead_sources', 'partner', 'Socio/Partner', 4),
  ('lead_sources', 'direct', 'Contacto Directo', 5),
  ('lead_sources', 'campaign', 'Campaña', 6),
  ('lead_sources', 'social_media', 'Redes Sociales', 7),
  ('lead_sources', 'other', 'Otro', 99)
ON CONFLICT (catalog_type, code) DO NOTHING;

-- Legal Forms Catalog (legal_form)
INSERT INTO public.catalogs (catalog_type, code, label, sort_order) VALUES
  ('legal_forms', 'sl', 'S.L. (Sociedad Limitada)', 1),
  ('legal_forms', 'sa', 'S.A. (Sociedad Anónima)', 2),
  ('legal_forms', 'autonomo', 'Autónomo', 3),
  ('legal_forms', 'cooperativa', 'Cooperativa', 4),
  ('legal_forms', 'asociacion', 'Asociación', 5),
  ('legal_forms', 'fundacion', 'Fundación', 6),
  ('legal_forms', 'slp', 'S.L.P. (Sociedad Limitada Profesional)', 7),
  ('legal_forms', 'cb', 'C.B. (Comunidad de Bienes)', 8),
  ('legal_forms', 'slu', 'S.L.U. (Sociedad Limitada Unipersonal)', 9),
  ('legal_forms', 'other', 'Otra', 99)
ON CONFLICT (catalog_type, code) DO NOTHING;

-- Close Reasons Catalog (close_reason_code)
INSERT INTO public.catalogs (catalog_type, code, label, sort_order) VALUES
  ('close_reasons', 'completed', 'Completado con éxito', 1),
  ('close_reasons', 'not_interested', 'No interesado', 2),
  ('close_reasons', 'no_budget', 'Sin presupuesto', 3),
  ('close_reasons', 'no_fit', 'No se ajusta al perfil', 4),
  ('close_reasons', 'duplicate', 'Duplicado', 5),
  ('close_reasons', 'no_response', 'Sin respuesta', 6),
  ('close_reasons', 'timing', 'Timing incorrecto', 7),
  ('close_reasons', 'other', 'Otro motivo', 99)
ON CONFLICT (catalog_type, code) DO NOTHING;

-- Add comments to document these catalogs
COMMENT ON TABLE public.catalogs IS 'Transversal catalog table storing code-label pairs for various catalog types across the application. Used for pipeline statuses, lead sources, legal forms, and close reasons among others.';
