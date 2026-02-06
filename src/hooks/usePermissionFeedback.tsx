import { useUserRoles } from "./useUserRoles";

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
  const getPermissionMessage = (action: "create" | "edit" | "delete" = "create"): string | null => {
    if (canWrite) {
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

    return `No tienes permisos para ${actionLabels[action]}. Solo admin y técnico pueden realizar esta acción`;
  };

  /**
   * Verifica si el usuario puede realizar una acción
   * @param action - El tipo de acción
   * @returns true si tiene permisos, false si no
   */
  const canPerformAction = (action: "create" | "edit" | "delete" = "create"): boolean => {
    return canWrite;
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
