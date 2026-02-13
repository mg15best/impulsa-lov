/**
 * EstadoSelector Component
 * 
 * A reusable component for selecting and validating estado changes
 * with state transition rules enforcement.
 */

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { canTransition, getValidNextStates, getTransitionErrorMessage } from "@/lib/stateTransitions";

interface EstadoSelectorProps<T extends string> {
  entityType: "empresas" | "asesoramientos" | "eventos" | "formaciones" | "colaboradores";
  currentEstado?: T;
  value: T;
  onChange: (newEstado: T) => void;
  estadoLabels: Record<T, string>;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

/**
 * EstadoSelector component with transition validation
 * 
 * This component enforces state transition rules by:
 * 1. Only showing valid next states in the dropdown
 * 2. Validating transitions when estado changes
 * 3. Showing clear error messages for invalid transitions
 * 
 * @param entityType - The type of entity (empresas, asesoramientos, etc.)
 * @param currentEstado - The current estado (for edit mode). If not provided, all states are available (create mode)
 * @param value - The selected estado value
 * @param onChange - Callback when estado changes
 * @param estadoLabels - Map of estado values to display labels
 * @param label - Optional label for the field (defaults to "Estado")
 * @param required - Whether the field is required
 * @param disabled - Whether the field is disabled
 * @param className - Additional CSS classes
 */
export function EstadoSelector<T extends string>({
  entityType,
  currentEstado,
  value,
  onChange,
  estadoLabels,
  label = "Estado",
  required = false,
  disabled = false,
  className = "",
}: EstadoSelectorProps<T>) {
  const { toast } = useToast();
  const { user } = useAuth();

  const trackTransitionAttempt = async (newEstado: string, isValid: boolean, reason?: string) => {
    if (!supabase || !currentEstado) return;

    try {
      const client = supabase as unknown as {
        from: (table: string) => { insert: (payload: unknown) => Promise<unknown> }
      };
      await client.from("state_transition_attempts").insert({
        entity_type: entityType,
        current_state: currentEstado,
        attempted_state: newEstado,
        is_valid: isValid,
        reason: reason || null,
        created_by: user?.id || null,
      });
    } catch {
      // non-blocking telemetry
    }
  };

  // Get valid states for the dropdown
  const getAvailableStates = (): T[] => {
    // In create mode (no currentEstado), allow all states
    if (!currentEstado) {
      return Object.keys(estadoLabels) as T[];
    }

    // In edit mode, only allow valid transitions
    const validStates = getValidNextStates(entityType, currentEstado);
    return Object.keys(estadoLabels).filter(estado => 
      validStates.includes(estado)
    ) as T[];
  };

  const handleEstadoChange = async (newEstado: string) => {
    const typedNewEstado = newEstado as T;

    // If we have a current estado (edit mode), validate the transition
    if (currentEstado && currentEstado !== typedNewEstado) {
      const isValid = canTransition(entityType, currentEstado, typedNewEstado);
      
      if (!isValid) {
        const errorMessage = getTransitionErrorMessage(entityType, currentEstado, typedNewEstado);
        await trackTransitionAttempt(typedNewEstado, false, errorMessage);
        toast({
          title: "Transición de estado no válida",
          description: errorMessage,
          variant: "destructive",
        });
        return;
      }
    }

    if (currentEstado && currentEstado !== typedNewEstado) {
      await trackTransitionAttempt(typedNewEstado, true);
    }

    onChange(typedNewEstado);
  };

  const availableStates = getAvailableStates();

  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor="estado">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Select
        value={value}
        onValueChange={handleEstadoChange}
        disabled={disabled || availableStates.length === 1}
      >
        <SelectTrigger id="estado">
          <SelectValue placeholder="Seleccionar estado" />
        </SelectTrigger>
        <SelectContent>
          {availableStates.map((estado) => (
            <SelectItem key={estado} value={estado}>
              {estadoLabels[estado]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {currentEstado && availableStates.length === 1 && (
        <p className="text-sm text-muted-foreground">
          Estado final. No se permiten más cambios.
        </p>
      )}
    </div>
  );
}
