import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import type { PostgrestFilterBuilder } from "@supabase/postgrest-js";

type QueryBuilder = PostgrestFilterBuilder<never, never, unknown[]>;

/**
 * Hook reutilizable para consolidar patrones de carga de datos.
 * 
 * Este hook maneja:
 * - Estados de carga y error
 * - Fetch inicial y reload
 * - Filtros aplicados mediante una función customizable
 * - Notificaciones de error mediante toast
 * 
 * @template T Tipo de datos que se cargarán
 * @param tableName Nombre de la tabla de Supabase
 * @param applyFilters Función opcional para aplicar filtros a la query
 * @param dependencies Array de dependencias que disparará un reload cuando cambien
 * @returns Objeto con datos, loading, error y función reload
 */
export function useDataLoader<T>(
  tableName: string,
  applyFilters?: (query: QueryBuilder) => QueryBuilder,
  dependencies: unknown[] = []
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Stringify dependencies to create a stable reference
  const depsKey = useMemo(() => JSON.stringify(dependencies), [dependencies]);

  const fetchData = useCallback(async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let query = supabase.from(tableName).select("*") as QueryBuilder;
      
      // Apply custom filters if provided
      if (applyFilters) {
        query = applyFilters(query);
      }

      const { data: result, error: fetchError } = await query;

      if (fetchError) {
        setError(fetchError.message);
        toast({
          title: "Error",
          description: fetchError.message,
          variant: "destructive",
        });
      } else {
        setData(result || []);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error desconocido";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
    // depsKey is intentionally included to trigger refetch when dependencies change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableName, applyFilters, toast, depsKey]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const reload = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    reload,
  };
}

/**
 * Hook para manejar búsqueda local en los datos cargados.
 * 
 * @template T Tipo de datos
 * @param data Array de datos a filtrar
 * @param searchTerm Término de búsqueda
 * @param searchFields Función que determina si un item coincide con la búsqueda
 * @returns Array filtrado
 */
export function useLocalSearch<T>(
  data: T[],
  searchTerm: string,
  searchFields: (item: T, term: string) => boolean
): T[] {
  if (!searchTerm.trim()) {
    return data;
  }

  const term = searchTerm.toLowerCase();
  return data.filter((item) => searchFields(item, term));
}
