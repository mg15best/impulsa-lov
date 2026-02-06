-- Add catalog entries for action plans
-- These catalogs support the action_plans and action_plan_items tables

-- Action Plan Statuses Catalog (status_code)
INSERT INTO public.catalogs (catalog_type, code, label, sort_order) VALUES
  ('action_plan_statuses', 'draft', 'Borrador', 1),
  ('action_plan_statuses', 'active', 'Activo', 2),
  ('action_plan_statuses', 'in_progress', 'En Progreso', 3),
  ('action_plan_statuses', 'completed', 'Completado', 4),
  ('action_plan_statuses', 'on_hold', 'En Espera', 5),
  ('action_plan_statuses', 'cancelled', 'Cancelado', 6)
ON CONFLICT (catalog_type, code) DO NOTHING;

-- Action Plan Categories Catalog (category_code)
INSERT INTO public.catalogs (catalog_type, code, label, sort_order) VALUES
  ('action_plan_categories', 'strategy', 'Estrategia', 1),
  ('action_plan_categories', 'operations', 'Operaciones', 2),
  ('action_plan_categories', 'marketing', 'Marketing', 3),
  ('action_plan_categories', 'sales', 'Ventas', 4),
  ('action_plan_categories', 'finance', 'Finanzas', 5),
  ('action_plan_categories', 'hr', 'Recursos Humanos', 6),
  ('action_plan_categories', 'technology', 'Tecnología', 7),
  ('action_plan_categories', 'innovation', 'Innovación', 8),
  ('action_plan_categories', 'sustainability', 'Sostenibilidad', 9),
  ('action_plan_categories', 'other', 'Otro', 99)
ON CONFLICT (catalog_type, code) DO NOTHING;

-- Priority Levels Catalog (priority_code) - shared between plans and items
INSERT INTO public.catalogs (catalog_type, code, label, sort_order) VALUES
  ('priority_levels', 'critical', 'Crítica', 1),
  ('priority_levels', 'high', 'Alta', 2),
  ('priority_levels', 'medium', 'Media', 3),
  ('priority_levels', 'low', 'Baja', 4)
ON CONFLICT (catalog_type, code) DO NOTHING;

-- Action Plan Item Statuses Catalog (status_code for items)
INSERT INTO public.catalogs (catalog_type, code, label, sort_order) VALUES
  ('action_plan_item_statuses', 'pending', 'Pendiente', 1),
  ('action_plan_item_statuses', 'in_progress', 'En Progreso', 2),
  ('action_plan_item_statuses', 'blocked', 'Bloqueado', 3),
  ('action_plan_item_statuses', 'completed', 'Completado', 4),
  ('action_plan_item_statuses', 'cancelled', 'Cancelado', 5)
ON CONFLICT (catalog_type, code) DO NOTHING;

-- Add comments to document these catalogs
COMMENT ON TABLE public.catalogs IS 'Transversal catalog table storing code-label pairs for various catalog types across the application. Used for action plan statuses, categories, priorities, and item statuses among others.';
