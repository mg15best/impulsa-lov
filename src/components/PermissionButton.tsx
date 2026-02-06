import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { usePermissionFeedback } from "@/hooks/usePermissionFeedback";
import type { ButtonProps } from "@/components/ui/button";

interface PermissionButtonProps extends ButtonProps {
  /**
   * Tipo de acción que requiere permisos
   */
  action?: "create" | "edit" | "delete";
  /**
   * Condiciones adicionales que deben cumplirse (ej: empresas.length > 0)
   */
  additionalDisabled?: boolean;
  /**
   * Mensaje para condiciones adicionales cuando están deshabilitadas
   */
  additionalDisabledMessage?: string;
  /**
   * Children del botón
   */
  children: React.ReactNode;
}

/**
 * Botón con gestión automática de permisos y tooltips informativos
 * 
 * Muestra un tooltip explicativo cuando el botón está deshabilitado por:
 * - Falta de permisos del usuario
 * - Condiciones adicionales no cumplidas
 * 
 * @example
 * <PermissionButton action="create">
 *   <Plus className="mr-2 h-4 w-4" />
 *   Nueva Empresa
 * </PermissionButton>
 * 
 * @example
 * <PermissionButton 
 *   action="create"
 *   additionalDisabled={empresas.length === 0}
 *   additionalDisabledMessage="Primero debes crear al menos una empresa"
 * >
 *   <Plus className="mr-2 h-4 w-4" />
 *   Nuevo Contacto
 * </PermissionButton>
 */
export function PermissionButton({
  action = "create",
  additionalDisabled = false,
  additionalDisabledMessage,
  children,
  disabled: externalDisabled,
  ...buttonProps
}: PermissionButtonProps) {
  const { canPerformAction, getPermissionMessage } = usePermissionFeedback();

  const hasPermission = canPerformAction(action);
  const permissionMessage = getPermissionMessage(action);
  
  // El botón está deshabilitado si:
  // 1. No tiene permisos, O
  // 2. Hay condiciones adicionales no cumplidas, O
  // 3. Está explícitamente deshabilitado externamente
  const isDisabled = !hasPermission || additionalDisabled || externalDisabled;

  // Determinar el mensaje del tooltip
  let tooltipMessage: string | null = null;
  if (!hasPermission) {
    tooltipMessage = permissionMessage;
  } else if (additionalDisabled && additionalDisabledMessage) {
    tooltipMessage = additionalDisabledMessage;
  }

  // Si no está deshabilitado o no hay mensaje, renderizar botón sin tooltip
  if (!isDisabled || !tooltipMessage) {
    return (
      <Button disabled={isDisabled} {...buttonProps}>
        {children}
      </Button>
    );
  }

  // Renderizar botón con tooltip informativo
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span>
            <Button disabled={isDisabled} {...buttonProps}>
              {children}
            </Button>
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltipMessage}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
