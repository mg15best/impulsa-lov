/**
 * useCatalog Hook
 * 
 * React hook for fetching and using catalog data.
 * Provides caching through React Query to minimize database calls.
 */

import { useQuery } from "@tanstack/react-query";
import { getCatalogEntries, getCatalogLabel, type CatalogEntry } from "@/lib/catalogUtils";

/**
 * Hook to fetch all catalog entries for a given catalog type
 * Results are cached for 5 minutes
 * @param catalogType - The type of catalog to fetch
 */
export function useCatalog(catalogType: string) {
  return useQuery({
    queryKey: ['catalog', catalogType],
    queryFn: () => getCatalogEntries(catalogType),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });
}

/**
 * Hook to resolve a label from a code
 * @param catalogType - The type of catalog
 * @param code - The code to resolve
 */
export function useCatalogLabel(catalogType: string, code: string | null | undefined) {
  return useQuery({
    queryKey: ['catalog-label', catalogType, code],
    queryFn: () => getCatalogLabel(catalogType, code || ''),
    enabled: !!code, // Only run query if code is provided
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * Hook to create a lookup map for fast in-memory resolution
 * @param catalogType - The type of catalog
 */
export function useCatalogLookup(catalogType: string) {
  const { data: entries, isLoading, error } = useCatalog(catalogType);
  
  const lookup = new Map<string, string>();
  if (entries) {
    entries.forEach(entry => {
      lookup.set(entry.code, entry.label);
    });
  }
  
  return { lookup, isLoading, error };
}

/**
 * Helper to get label from lookup map with fallback to code
 */
export function resolveLabelFromLookup(
  lookup: Map<string, string>, 
  code: string | null | undefined
): string {
  if (!code) return '';
  return lookup.get(code) || code;
}
