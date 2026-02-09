-- Add catalog entries for opportunities
-- These catalogs support the opportunities table

-- Opportunity Stages Catalog (stage_code)
INSERT INTO public.catalogs (catalog_type, code, label, sort_order) VALUES
  ('opportunity_stages', 'identification', 'Identificación', 1),
  ('opportunity_stages', 'qualification', 'Cualificación', 2),
  ('opportunity_stages', 'proposal', 'Propuesta', 3),
  ('opportunity_stages', 'negotiation', 'Negociación', 4),
  ('opportunity_stages', 'closing', 'Cierre', 5),
  ('opportunity_stages', 'closed_won', 'Cerrado Ganado', 6),
  ('opportunity_stages', 'closed_lost', 'Cerrado Perdido', 7)
ON CONFLICT (catalog_type, code) DO NOTHING;

-- Opportunity Status Catalog (status_code)
INSERT INTO public.catalogs (catalog_type, code, label, sort_order) VALUES
  ('opportunity_statuses', 'open', 'Abierto', 1),
  ('opportunity_statuses', 'in_progress', 'En Progreso', 2),
  ('opportunity_statuses', 'on_hold', 'En Espera', 3),
  ('opportunity_statuses', 'won', 'Ganado', 4),
  ('opportunity_statuses', 'lost', 'Perdido', 5),
  ('opportunity_statuses', 'cancelled', 'Cancelado', 6)
ON CONFLICT (catalog_type, code) DO NOTHING;

-- Opportunity Sources Catalog (source_code) - reuse existing lead_sources
-- This allows opportunities to share source codes with empresas
-- No additional entries needed as lead_sources catalog already exists
