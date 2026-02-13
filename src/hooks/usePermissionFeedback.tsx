import { useUserRoles } from "./useUserRoles";
import {
  isActionAllowedByPolicy,
  getPolicyRolesLabel,
  type CrudAction,
  type PolicyEntity,
} from "@/config/permissionPolicy";

/**
 * Hook centralizado para gestión de permisos con feedback de UI
 * Proporciona mensajes descriptivos cuando las acciones están deshabilitadas
 */
export function usePermissionFeedback() {
  const { canWrite, canRead, roles, isAdmin, isTecnico, isAuditor, isIT } = useUserRoles();

  /**
   * Obtiene el mensaje de feedback cuando una acción está deshabilitada por permisos
   * @param action - El tipo de acción (crear, editar, eliminar)
   * @returns Mensaje descriptivo o null si tiene permisos
   */
  const getPermissionMessage = (
    action: CrudAction = "create",
    entity: PolicyEntity = "generic"
  ): string | null => {
    const actionAllowed = isActionAllowedByPolicy(roles, action, entity);

    if (actionAllowed) {
      return null; // Usuario tiene permisos, no mostrar mensaje
    }

    // Mensajes específicos según el rol del usuario
    if (isAuditor) {
      return "Los auditores tienen permisos de solo lectura";
    }

    if (isIT) {
      return "El personal de IT tiene permisos de solo lectura";
    }

    if (roles.length === 0) {
      return "Sin permisos asignados. Contacta al administrador";
    }

    // Mensaje genérico para otros casos
    const actionLabels = {
      create: "crear",
      edit: "editar",
      delete: "eliminar",
    };

    const allowedRoles = getPolicyRolesLabel(action, entity);
    return `No tienes permisos para ${actionLabels[action]}. Roles permitidos: ${allowedRoles}`;
  };

  /**
   * Verifica si el usuario puede realizar una acción
   * Nota: Actualmente todas las acciones (create, edit, delete) requieren canWrite
   * @param action - El tipo de acción (actualmente no utilizado, todas requieren canWrite)
   * @returns true si tiene permisos, false si no
   */
  const canPerformAction = (
    action: CrudAction = "create",
    entity: PolicyEntity = "generic"
  ): boolean => {
    return isActionAllowedByPolicy(roles, action, entity);
  };

  return {
    canWrite,
    canRead,
    roles,
    isAdmin,
    isTecnico,
    isAuditor,
    isIT,
    getPermissionMessage,
    canPerformAction,
  };
}
