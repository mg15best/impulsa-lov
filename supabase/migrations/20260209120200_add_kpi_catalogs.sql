-- PR-K: Add catalog entries for KPI-related types

-- Add KPI type catalog entry
INSERT INTO public.catalogs (code, name, description, is_active, created_at, updated_at)
VALUES (
  'kpi_types',
  'Tipos de KPI',
  'Categorías de KPIs: operativos, estratégicos, de impacto',
  true,
  now(),
  now()
) ON CONFLICT (code) DO NOTHING;

-- Add KPI type values
INSERT INTO public.catalog_values (catalog_code, value, label, description, sort_order, is_active, metadata, created_at, updated_at)
VALUES 
  ('kpi_types', 'operativo', 'Operativo', 'KPIs que miden la actividad operacional del día a día', 1, true, 
   '{"color": "blue", "icon": "activity"}', now(), now()),
  ('kpi_types', 'estrategico', 'Estratégico', 'KPIs que miden el desempeño estratégico y la eficiencia', 2, true, 
   '{"color": "purple", "icon": "target"}', now(), now()),
  ('kpi_types', 'impacto', 'Impacto', 'KPIs que miden el impacto y resultados del programa', 3, true, 
   '{"color": "green", "icon": "trending-up"}', now(), now())
ON CONFLICT (catalog_code, value) DO NOTHING;

-- Add KPI frequency catalog entry
INSERT INTO public.catalogs (code, name, description, is_active, created_at, updated_at)
VALUES (
  'kpi_update_frequencies',
  'Frecuencias de Actualización de KPI',
  'Frecuencias con las que se actualizan los diferentes KPIs',
  true,
  now(),
  now()
) ON CONFLICT (code) DO NOTHING;

-- Add KPI frequency values
INSERT INTO public.catalog_values (catalog_code, value, label, description, sort_order, is_active, metadata, created_at, updated_at)
VALUES 
  ('kpi_update_frequencies', 'realtime', 'Tiempo Real', 'Se actualiza en tiempo real con cada cambio', 1, true, 
   '{"interval_minutes": 0}', now(), now()),
  ('kpi_update_frequencies', 'daily', 'Diaria', 'Se actualiza una vez al día', 2, true, 
   '{"interval_minutes": 1440}', now(), now()),
  ('kpi_update_frequencies', 'weekly', 'Semanal', 'Se actualiza una vez por semana', 3, true, 
   '{"interval_minutes": 10080}', now(), now()),
  ('kpi_update_frequencies', 'monthly', 'Mensual', 'Se actualiza una vez al mes', 4, true, 
   '{"interval_minutes": 43200}', now(), now()),
  ('kpi_update_frequencies', 'on_load', 'Al Cargar', 'Se actualiza al cargar la aplicación', 5, true, 
   '{"interval_minutes": null}', now(), now())
ON CONFLICT (catalog_code, value) DO NOTHING;
