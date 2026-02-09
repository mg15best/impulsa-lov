-- PR-G: Add catalog entries for attendance and survey status codes

-- Insert catalog entries for attendance statuses
INSERT INTO public.catalogs (catalog_type, code, label, sort_order) VALUES
  ('attendance_statuses', 'registered', 'Registrado', 1),
  ('attendance_statuses', 'confirmed', 'Confirmado', 2),
  ('attendance_statuses', 'attended', 'Asistió', 3),
  ('attendance_statuses', 'no_show', 'No asistió', 4),
  ('attendance_statuses', 'cancelled', 'Cancelado', 5)
ON CONFLICT (catalog_type, code) DO NOTHING;

-- Insert catalog entries for invite statuses
INSERT INTO public.catalogs (catalog_type, code, label, sort_order) VALUES
  ('invite_statuses', 'pending', 'Pendiente', 1),
  ('invite_statuses', 'sent', 'Enviada', 2),
  ('invite_statuses', 'accepted', 'Aceptada', 3),
  ('invite_statuses', 'declined', 'Rechazada', 4)
ON CONFLICT (catalog_type, code) DO NOTHING;

-- Insert catalog entries for survey statuses
INSERT INTO public.catalogs (catalog_type, code, label, sort_order) VALUES
  ('survey_statuses', 'draft', 'Borrador', 1),
  ('survey_statuses', 'published', 'Publicada', 2),
  ('survey_statuses', 'closed', 'Cerrada', 3)
ON CONFLICT (catalog_type, code) DO NOTHING;

-- Add comments
COMMENT ON TABLE public.catalogs IS 'Extended with attendance_statuses, invite_statuses, and survey_statuses for PR-G';
