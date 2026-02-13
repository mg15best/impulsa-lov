import { useMemo } from "react";
import { useSupabaseList } from "@/hooks/useSupabaseList";
import type { Task, TaskEmpresaRef, TaskEntityType, TaskPriority, TaskStatus } from "./types";

interface UseTasksPageDataArgs {
  filterEstado: string;
  filterPrioridad: string;
  filterEntityType: string;
  searchTerm: string;
}

const TASKS_SELECT = "id, entity_type, entity_id, titulo, descripcion, estado, prioridad, fecha_vencimiento, fecha_inicio, fecha_completado, responsable_id, source, template_id, tags, observaciones, created_by, created_at, updated_at";
const EMPRESAS_SELECT = "id, nombre";

export function useTasksPageData({
  filterEstado,
  filterPrioridad,
  filterEntityType,
  searchTerm,
}: UseTasksPageDataArgs) {
  const tasksQuery = useSupabaseList<Task>({
    tableName: "tasks",
    select: TASKS_SELECT,
    applyFilters: (query) => {
      let q = query.order("created_at", { ascending: false });

      if (filterEstado !== "all") q = q.eq("estado", filterEstado as TaskStatus);
      if (filterPrioridad !== "all") q = q.eq("prioridad", filterPrioridad as TaskPriority);
      if (filterEntityType !== "all") q = q.eq("entity_type", filterEntityType as TaskEntityType);

      return q;
    },
    dependencies: [filterEstado, filterPrioridad, filterEntityType],
  });

  const empresasQuery = useSupabaseList<TaskEmpresaRef>({
    tableName: "empresas",
    select: EMPRESAS_SELECT,
    applyFilters: (query) => query.order("nombre"),
  });

  const filteredTasks = useMemo(() => {
    if (!searchTerm.trim()) return tasksQuery.data;
    const term = searchTerm.toLowerCase();
    return tasksQuery.data.filter(
      (task) =>
        task.titulo.toLowerCase().includes(term) ||
        task.descripcion?.toLowerCase().includes(term) ||
        task.observaciones?.toLowerCase().includes(term)
    );
  }, [tasksQuery.data, searchTerm]);

  return {
    tasks: filteredTasks,
    tasksLoading: tasksQuery.loading,
    reloadTasks: tasksQuery.reload,
    empresas: empresasQuery.data,
  };
}
