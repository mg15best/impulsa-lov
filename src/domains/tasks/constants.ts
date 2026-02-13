import type { TaskEntityType, TaskFormData, TaskPriority, TaskStatus } from "./types";

export const initialTaskFormData: TaskFormData = {
  titulo: "",
  descripcion: "",
  entity_type: "general",
  entity_id: "",
  estado: "pending",
  prioridad: "medium",
  fecha_vencimiento: "",
  fecha_inicio: "",
  responsable_id: "",
  source: "manual",
  observaciones: "",
};

export const taskStatusLabels: Record<TaskStatus, string> = {
  pending: "Pendiente",
  in_progress: "En progreso",
  completed: "Completada",
  cancelled: "Cancelada",
  on_hold: "En espera",
};

export const taskStatusColors: Record<TaskStatus, string> = {
  pending: "bg-info/10 text-info",
  in_progress: "bg-warning/10 text-warning",
  completed: "bg-success/10 text-success",
  cancelled: "bg-destructive/10 text-destructive",
  on_hold: "bg-muted text-muted-foreground",
};

export const taskPriorityLabels: Record<TaskPriority, string> = {
  low: "Baja",
  medium: "Media",
  high: "Alta",
  urgent: "Urgente",
};

export const taskPriorityColors: Record<TaskPriority, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-info/10 text-info",
  high: "bg-warning/10 text-warning",
  urgent: "bg-destructive/10 text-destructive",
};

export const taskSourceLabels: Record<string, string> = {
  manual: "Manual",
  automatica: "Automática",
  workflow: "Workflow",
  imported: "Importada",
  integration: "Integración",
};

export const taskSourceColors: Record<string, string> = {
  manual: "bg-muted text-muted-foreground",
  automatica: "bg-info/10 text-info",
  workflow: "bg-success/10 text-success",
  imported: "bg-warning/10 text-warning",
  integration: "bg-primary/10 text-primary",
};

export const taskEntityTypeLabels: Record<TaskEntityType, string> = {
  general: "General",
  empresa: "Empresa",
  asesoramiento: "Asesoramiento",
  evento: "Evento",
  formacion: "Formación",
  colaborador: "Colaborador",
  material: "Material",
  dissemination_impact: "Impacto Difusión",
  opportunity: "Oportunidad",
  grant: "Subvención",
  action_plan: "Plan de Acción",
  report: "Informe",
};
