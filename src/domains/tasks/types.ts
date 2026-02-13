import type { Database } from "@/integrations/supabase/types";

export type Task = Database["public"]["Tables"]["tasks"]["Row"];
export type TaskInsert = Database["public"]["Tables"]["tasks"]["Insert"];
export type TaskStatus = Database["public"]["Enums"]["task_status"];
export type TaskPriority = Database["public"]["Enums"]["task_priority"];
export type TaskEntityType = Database["public"]["Enums"]["task_entity_type"];

export type TaskEmpresaRef = Pick<Database["public"]["Tables"]["empresas"]["Row"], "id" | "nombre">;

export interface TaskFormData {
  titulo: string;
  descripcion: string;
  entity_type: TaskEntityType;
  entity_id: string;
  estado: TaskStatus;
  prioridad: TaskPriority;
  fecha_vencimiento: string;
  fecha_inicio: string;
  responsable_id: string;
  source: string;
  observaciones: string;
}
