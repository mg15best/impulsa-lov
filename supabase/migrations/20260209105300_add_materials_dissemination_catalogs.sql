-- PR-J: Add catalog entries for materials and dissemination impacts

-- Catalog entries for material_types
INSERT INTO public.catalogs (catalog_type, code, label, sort_order) VALUES
  ('material_types', 'documento', 'Documento', 1),
  ('material_types', 'video', 'Vídeo', 2),
  ('material_types', 'presentacion', 'Presentación', 3),
  ('material_types', 'template', 'Plantilla', 4),
  ('material_types', 'guia', 'Guía', 5),
  ('material_types', 'manual', 'Manual', 6),
  ('material_types', 'infografia', 'Infografía', 7),
  ('material_types', 'herramienta', 'Herramienta', 8),
  ('material_types', 'otro', 'Otro', 99);

-- Catalog entries for material_categories
INSERT INTO public.catalogs (catalog_type, code, label, sort_order) VALUES
  ('material_categories', 'implementacion', 'Implementación', 1),
  ('material_categories', 'gestion', 'Gestión', 2),
  ('material_categories', 'digitalizacion', 'Digitalización', 3),
  ('material_categories', 'innovacion', 'Innovación', 4),
  ('material_categories', 'sostenibilidad', 'Sostenibilidad', 5),
  ('material_categories', 'comercializacion', 'Comercialización', 6),
  ('material_categories', 'financiacion', 'Financiación', 7),
  ('material_categories', 'formacion', 'Formación', 8),
  ('material_categories', 'legal', 'Legal', 9),
  ('material_categories', 'otro', 'Otro', 99);

-- Catalog entries for material_formats
INSERT INTO public.catalogs (catalog_type, code, label, sort_order) VALUES
  ('material_formats', 'pdf', 'PDF', 1),
  ('material_formats', 'word', 'Word', 2),
  ('material_formats', 'excel', 'Excel', 3),
  ('material_formats', 'powerpoint', 'PowerPoint', 4),
  ('material_formats', 'video_mp4', 'Vídeo (MP4)', 5),
  ('material_formats', 'video_url', 'Vídeo (URL)', 6),
  ('material_formats', 'html', 'Web/HTML', 7),
  ('material_formats', 'interactive', 'Interactivo', 8),
  ('material_formats', 'zip', 'Archivo comprimido', 9),
  ('material_formats', 'otro', 'Otro', 99);

-- Catalog entries for dissemination_channels
INSERT INTO public.catalogs (catalog_type, code, label, sort_order) VALUES
  ('dissemination_channels', 'email', 'Email', 1),
  ('dissemination_channels', 'web', 'Web', 2),
  ('dissemination_channels', 'social_media', 'Redes Sociales', 3),
  ('dissemination_channels', 'evento', 'Evento', 4),
  ('dissemination_channels', 'webinar', 'Webinar', 5),
  ('dissemination_channels', 'newsletter', 'Newsletter', 6),
  ('dissemination_channels', 'prensa', 'Prensa', 7),
  ('dissemination_channels', 'telefono', 'Teléfono', 8),
  ('dissemination_channels', 'presencial', 'Presencial', 9),
  ('dissemination_channels', 'otro', 'Otro', 99);

-- Catalog entries for dissemination_types
INSERT INTO public.catalogs (catalog_type, code, label, sort_order) VALUES
  ('dissemination_types', 'campaign', 'Campaña', 1),
  ('dissemination_types', 'announcement', 'Anuncio', 2),
  ('dissemination_types', 'newsletter', 'Newsletter', 3),
  ('dissemination_types', 'invitation', 'Invitación', 4),
  ('dissemination_types', 'reminder', 'Recordatorio', 5),
  ('dissemination_types', 'followup', 'Seguimiento', 6),
  ('dissemination_types', 'promotion', 'Promoción', 7),
  ('dissemination_types', 'survey', 'Encuesta', 8),
  ('dissemination_types', 'report', 'Informe', 9),
  ('dissemination_types', 'otro', 'Otro', 99);

-- Catalog entries for audience_segments
INSERT INTO public.catalogs (catalog_type, code, label, sort_order) VALUES
  ('audience_segments', 'all_companies', 'Todas las empresas', 1),
  ('audience_segments', 'new_companies', 'Empresas nuevas', 2),
  ('audience_segments', 'active_companies', 'Empresas activas', 3),
  ('audience_segments', 'sector_tech', 'Sector tecnología', 4),
  ('audience_segments', 'sector_industry', 'Sector industria', 5),
  ('audience_segments', 'sector_services', 'Sector servicios', 6),
  ('audience_segments', 'phase_idea', 'Fase idea', 7),
  ('audience_segments', 'phase_validation', 'Fase validación', 8),
  ('audience_segments', 'phase_growth', 'Fase crecimiento', 9),
  ('audience_segments', 'phase_consolidation', 'Fase consolidación', 10),
  ('audience_segments', 'event_attendees', 'Asistentes a eventos', 11),
  ('audience_segments', 'training_participants', 'Participantes de formaciones', 12),
  ('audience_segments', 'custom', 'Personalizado', 99);

-- Add comments to document the new catalogs
COMMENT ON TABLE public.catalogs IS 'Transversal catalog table storing code-label pairs for various catalog types across the application. Updated with materials and dissemination impact catalogs.';
