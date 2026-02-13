import { supabase } from "@/integrations/supabase/client";
import type { Task, TaskFormData, TaskInsert } from "./types";

function nullable(value: string) {
  return value.trim() ? value : null;
}

export function buildTaskPayload(formData: TaskFormData): TaskInsert {
  return {
    titulo: formData.titulo,
    descripcion: nullable(formData.descripcion),
    entity_type: formData.entity_type,
    entity_id: nullable(formData.entity_id),
    estado: formData.estado,
    prioridad: formData.prioridad,
    fecha_vencimiento: nullable(formData.fecha_vencimiento),
    fecha_inicio: nullable(formData.fecha_inicio),
    responsable_id: nullable(formData.responsable_id),
    source: nullable(formData.source) || "manual",
    observaciones: nullable(formData.observaciones),
  };
}

export async function createTask(payload: TaskInsert) {
  if (!supabase) throw new Error("Supabase no está configurado");
  const { error } = await supabase.from("tasks").insert([payload]);
  if (error) throw error;
}

export async function updateTask(taskId: string, payload: TaskInsert) {
  if (!supabase) throw new Error("Supabase no está configurado");
  const { error } = await supabase.from("tasks").update(payload).eq("id", taskId);
  if (error) throw error;
}

export async function deleteTask(taskId: string) {
  if (!supabase) throw new Error("Supabase no está configurado");
  const { error } = await supabase.from("tasks").delete().eq("id", taskId);
  if (error) throw error;
}

export function taskToFormData(task: Task): TaskFormData {
  return {
    titulo: task.titulo,
    descripcion: task.descripcion || "",
    entity_type: task.entity_type,
    entity_id: task.entity_id || "",
    estado: task.estado,
    prioridad: task.prioridad,
    fecha_vencimiento: task.fecha_vencimiento || "",
    fecha_inicio: task.fecha_inicio || "",
    responsable_id: task.responsable_id || "",
    source: task.source || "manual",
    observaciones: task.observaciones || "",
  };
}
