import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import type { PostgrestFilterBuilder } from "@supabase/postgrest-js";

type QueryBuilder = PostgrestFilterBuilder<never, never, unknown[]>;

interface UseSupabaseListOptions<T> {
  tableName: string;
  select: string;
  applyFilters?: (query: QueryBuilder) => QueryBuilder;
  dependencies?: unknown[];
  onSuccess?: (rows: T[]) => void;
}

/**
 * Carga tipada y reutilizable para vistas que requieren contratos de selección explícitos.
 * Evita el patrón implícito select('*') y permite tipar por vista.
 */
export function useSupabaseList<T>({
  tableName,
  select,
  applyFilters,
  dependencies = [],
  onSuccess,
}: UseSupabaseListOptions<T>) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const applyFiltersRef = useRef(applyFilters);
  const onSuccessRef = useRef(onSuccess);

  const depsKey = useMemo(() => JSON.stringify(dependencies), [dependencies]);

  useEffect(() => {
    applyFiltersRef.current = applyFilters;
    onSuccessRef.current = onSuccess;
  }, [applyFilters, onSuccess]);

  const fetchData = useCallback(async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let query = supabase.from(tableName).select(select) as QueryBuilder;
      if (applyFiltersRef.current) {
        query = applyFiltersRef.current(query);
      }

      const { data: rows, error: fetchError } = await query;

      if (fetchError) {
        setError(fetchError.message);
        toast({
          title: "Error",
          description: fetchError.message,
          variant: "destructive",
        });
        return;
      }

      const typedRows = (rows || []) as T[];
      setData(typedRows);
      onSuccessRef.current?.(typedRows);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error desconocido";
      setError(message);
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableName, select, toast, depsKey]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    reload: fetchData,
  };
}
