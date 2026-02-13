import type { Database } from "@/integrations/supabase/types";

export type AppRole = Database["public"]["Enums"]["app_role"];
export type CrudAction = "create" | "edit" | "delete";

export type PolicyEntity =
  | "empresas"
  | "contactos"
  | "asesoramientos"
  | "tasks"
  | "eventos"
  | "formaciones"
  | "evidencias"
  | "colaboradores"
  | "oportunidades"
  | "grants"
  | "planes_accion"
  | "informes"
  | "materials"
  | "dissemination_impacts"
  | "generic";

interface PolicyRule {
  create: AppRole[];
  edit: AppRole[];
  delete: AppRole[];
  notes: string;
}

const writeRoles: AppRole[] = ["admin", "tecnico"];

/**
 * Matriz de permisos funcional de UI alineada con RLS donde está definido explícitamente.
 * - Para tablas con RLS conocido en migraciones/docs: reglas específicas.
 * - Para el resto: fallback operativo admin/técnico para create/edit/delete.
 */
export const PERMISSION_POLICY: Record<PolicyEntity, PolicyRule> = {
  empresas: {
    create: writeRoles,
    edit: writeRoles,
    delete: ["admin"],
    notes: "RLS: update admin/técnico (con scope); delete solo admin",
  },
  contactos: {
    create: writeRoles,
    edit: writeRoles,
    delete: ["admin"],
    notes: "RLS: update admin/técnico (con scope); delete solo admin",
  },
  asesoramientos: {
    create: writeRoles,
    edit: writeRoles,
    delete: ["admin"],
    notes: "RLS: update admin/técnico (con scope); delete solo admin",
  },
  tasks: {
    create: writeRoles,
    edit: writeRoles,
    delete: ["admin"],
    notes: "RLS/flujo: update admin/técnico (con scope); delete solo admin",
  },

  // Fallback por dominio con el patrón funcional vigente
  eventos: { create: writeRoles, edit: writeRoles, delete: writeRoles, notes: "Fallback UI" },
  formaciones: { create: writeRoles, edit: writeRoles, delete: writeRoles, notes: "Fallback UI" },
  evidencias: { create: writeRoles, edit: writeRoles, delete: writeRoles, notes: "Fallback UI" },
  colaboradores: { create: writeRoles, edit: writeRoles, delete: writeRoles, notes: "Fallback UI" },
  oportunidades: { create: writeRoles, edit: writeRoles, delete: writeRoles, notes: "Fallback UI" },
  grants: { create: writeRoles, edit: writeRoles, delete: writeRoles, notes: "Fallback UI" },
  planes_accion: { create: writeRoles, edit: writeRoles, delete: writeRoles, notes: "Fallback UI" },
  informes: { create: writeRoles, edit: writeRoles, delete: writeRoles, notes: "Fallback UI" },
  materials: { create: writeRoles, edit: writeRoles, delete: writeRoles, notes: "Fallback UI" },
  dissemination_impacts: { create: writeRoles, edit: writeRoles, delete: writeRoles, notes: "Fallback UI" },
  generic: { create: writeRoles, edit: writeRoles, delete: writeRoles, notes: "Fallback UI" },
};

export function isActionAllowedByPolicy(
  roles: AppRole[],
  action: CrudAction,
  entity: PolicyEntity = "generic"
): boolean {
  const rule = PERMISSION_POLICY[entity] ?? PERMISSION_POLICY.generic;
  return rule[action].some((role) => roles.includes(role));
}

export function getPolicyRolesLabel(action: CrudAction, entity: PolicyEntity = "generic"): string {
  const rule = PERMISSION_POLICY[entity] ?? PERMISSION_POLICY.generic;
  return rule[action].join(" / ");
}
