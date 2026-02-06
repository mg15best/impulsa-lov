/**
 * Catalog Utilities
 * 
 * Utilities for working with the catalogs table to resolve labels from codes.
 * This provides a centralized way to manage code-label mappings across the application.
 */

import { supabase } from "@/integrations/supabase/client";

export interface CatalogEntry {
  id: string;
  catalog_type: string;
  code: string;
  label: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

/**
 * Fetch all active catalog entries for a given catalog type
 * @param catalogType - The type of catalog to fetch (e.g., 'event_types', 'event_statuses')
 * @returns Array of catalog entries sorted by sort_order
 */
export async function getCatalogEntries(catalogType: string): Promise<CatalogEntry[]> {
  const { data, error } = await supabase
    .from('catalogs')
    .select('*')
    .eq('catalog_type', catalogType)
    .eq('is_active', true)
    .order('sort_order', { ascending: true });
  
  if (error) {
    console.error(`Error fetching catalog entries for ${catalogType}:`, error);
    return [];
  }
  
  return data as CatalogEntry[];
}

/**
 * Resolve a label from a code for a given catalog type
 * @param catalogType - The type of catalog (e.g., 'event_types')
 * @param code - The code to resolve (e.g., 'taller')
 * @returns The label for the code, or the code itself if not found
 */
export async function getCatalogLabel(catalogType: string, code: string): Promise<string> {
  if (!code) return '';
  
  const { data, error } = await supabase
    .from('catalogs')
    .select('label')
    .eq('catalog_type', catalogType)
    .eq('code', code)
    .eq('is_active', true)
    .single();
  
  if (error || !data) {
    console.warn(`Label not found for catalog ${catalogType}, code ${code}`);
    return code; // Return the code itself as fallback
  }
  
  return data.label;
}

/**
 * Resolve multiple labels from codes for a given catalog type
 * Useful for batch resolution
 * @param catalogType - The type of catalog
 * @param codes - Array of codes to resolve
 * @returns Map of code -> label
 */
export async function getCatalogLabels(
  catalogType: string, 
  codes: string[]
): Promise<Map<string, string>> {
  const { data, error } = await supabase
    .from('catalogs')
    .select('code, label')
    .eq('catalog_type', catalogType)
    .in('code', codes)
    .eq('is_active', true);
  
  if (error || !data) {
    console.error(`Error fetching catalog labels for ${catalogType}:`, error);
    return new Map();
  }
  
  return new Map(data.map(entry => [entry.code, entry.label]));
}

/**
 * Create a lookup map for fast catalog code -> label resolution
 * This is useful when you need to resolve many codes in memory
 * @param catalogType - The type of catalog
 * @returns Map of code -> label for all active entries
 */
export async function createCatalogLookup(catalogType: string): Promise<Map<string, string>> {
  const entries = await getCatalogEntries(catalogType);
  return new Map(entries.map(entry => [entry.code, entry.label]));
}
