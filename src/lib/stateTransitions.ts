/**
 * State Transition Rules for Entity Management
 * 
 * This module defines valid state transitions for all entities in the system.
 * Each entity has a set of allowed state transitions that enforce business logic
 * and prevent invalid state changes in the frontend.
 * 
 * Usage:
 * - Use `canTransition()` to check if a transition is valid
 * - Use `getValidNextStates()` to get all possible next states from a current state
 * - Use `getTransitionErrorMessage()` to get user-friendly error messages
 */

import type { Database } from "@/integrations/supabase/types";

// Type definitions for all estado enums
export type EstadoEmpresa = Database["public"]["Enums"]["estado_empresa"];
export type EstadoAsesoramiento = Database["public"]["Enums"]["estado_asesoramiento"];
export type EstadoEvento = Database["public"]["Enums"]["estado_evento"];
export type EstadoFormacion = Database["public"]["Enums"]["estado_formacion"];
export type EstadoColaborador = Database["public"]["Enums"]["estado_colaborador"];
export type MaterialStatus = Database["public"]["Enums"]["material_status"];
export type DisseminationStatus = Database["public"]["Enums"]["dissemination_status"];

/**
 * State transition rules for Empresas
 * 
 * Flow: pendiente → en_proceso → asesorada → completada
 * 
 * Business rules:
 * - pendiente: Initial state, can move to en_proceso or be marked completada directly
 * - en_proceso: Active company being advised, can move to asesorada
 * - asesorada: Company has received advice, can move to completada or back to en_proceso
 * - completada: Final state, no further transitions (terminal state)
 */
const empresaTransitions: Record<EstadoEmpresa, EstadoEmpresa[]> = {
  pendiente: ["en_proceso", "completada"],
  en_proceso: ["asesorada", "completada"],
  asesorada: ["en_proceso", "completada"],
  completada: [], // Terminal state
};

/**
 * State transition rules for Asesoramientos
 * 
 * Flow: programado → en_curso → completado
 *                            ↘ cancelado (from any state)
 * 
 * Business rules:
 * - programado: Scheduled advisory, can start (en_curso) or be cancelled
 * - en_curso: Advisory in progress, can be completed or cancelled
 * - completado: Advisory finished successfully (terminal state)
 * - cancelado: Advisory cancelled (terminal state)
 */
const asesoramientoTransitions: Record<EstadoAsesoramiento, EstadoAsesoramiento[]> = {
  programado: ["en_curso", "cancelado"],
  en_curso: ["completado", "cancelado"],
  completado: [], // Terminal state
  cancelado: [], // Terminal state
};

/**
 * State transition rules for Eventos
 * 
 * Flow: planificado → confirmado → en_curso → completado
 *                                           ↘ cancelado (from planificado or confirmado)
 * 
 * Business rules:
 * - planificado: Event planned, can be confirmed or cancelled
 * - confirmado: Event confirmed, can start (en_curso) or be cancelled
 * - en_curso: Event in progress, can only be completed
 * - completado: Event finished successfully (terminal state)
 * - cancelado: Event cancelled (terminal state)
 */
const eventoTransitions: Record<EstadoEvento, EstadoEvento[]> = {
  planificado: ["confirmado", "cancelado"],
  confirmado: ["en_curso", "cancelado"],
  en_curso: ["completado"],
  completado: [], // Terminal state
  cancelado: [], // Terminal state
};

/**
 * State transition rules for Formaciones
 * 
 * Flow: planificada → en_curso → completada
 *                              ↘ cancelada (from any non-terminal state)
 * 
 * Business rules:
 * - planificada: Training planned, can start or be cancelled
 * - en_curso: Training in progress, can be completed or cancelled
 * - completada: Training finished successfully (terminal state)
 * - cancelada: Training cancelled (terminal state)
 */
const formacionTransitions: Record<EstadoFormacion, EstadoFormacion[]> = {
  planificada: ["en_curso", "cancelada"],
  en_curso: ["completada", "cancelada"],
  completada: [], // Terminal state
  cancelada: [], // Terminal state
};

/**
 * State transition rules for Colaboradores
 * 
 * Flow: pendiente → activo ↔ inactivo
 * 
 * Business rules:
 * - pendiente: Initial state, can be activated or marked inactive
 * - activo: Active collaborator, can be deactivated
 * - inactivo: Inactive collaborator, can be reactivated
 */
const colaboradorTransitions: Record<EstadoColaborador, EstadoColaborador[]> = {
  pendiente: ["activo", "inactivo"],
  activo: ["inactivo"],
  inactivo: ["activo"],
};

/**
 * State transition rules for Materials
 * 
 * Flow: draft → review → published → archived
 *                     ↘ draft (can return to draft from review)
 * 
 * Business rules:
 * - draft: Initial state, can move to review or directly to published
 * - review: Under review, can be published or sent back to draft
 * - published: Material is live, can be archived
 * - archived: Material is archived, can be republished
 */
const materialTransitions: Record<MaterialStatus, MaterialStatus[]> = {
  draft: ["review", "published"],
  review: ["draft", "published"],
  published: ["archived"],
  archived: ["published"],
};

/**
 * State transition rules for Dissemination Impacts
 * 
 * Flow: planned → active → completed
 *                       ↘ cancelled (from planned or active)
 * 
 * Business rules:
 * - planned: Impact activity planned, can be activated or cancelled
 * - active: Impact activity in progress, can be completed or cancelled
 * - completed: Activity finished successfully (terminal state)
 * - cancelled: Activity cancelled (terminal state)
 */
const disseminationTransitions: Record<DisseminationStatus, DisseminationStatus[]> = {
  planned: ["active", "cancelled"],
  active: ["completed", "cancelled"],
  completed: [], // Terminal state
  cancelled: [], // Terminal state
};

// Type for all transition maps
type TransitionMap<T extends string> = Record<T, T[]>;

/**
 * Check if a state transition is valid for a given entity type
 * 
 * @param entityType - The type of entity (empresas, asesoramientos, etc.)
 * @param currentState - The current state of the entity
 * @param newState - The desired new state
 * @returns true if the transition is valid, false otherwise
 */
export function canTransition(
  entityType: "empresas" | "asesoramientos" | "eventos" | "formaciones" | "colaboradores" | "materials" | "dissemination_impacts",
  currentState: string,
  newState: string
): boolean {
  let transitions: TransitionMap<string>;

  switch (entityType) {
    case "empresas":
      transitions = empresaTransitions;
      break;
    case "asesoramientos":
      transitions = asesoramientoTransitions;
      break;
    case "eventos":
      transitions = eventoTransitions;
      break;
    case "formaciones":
      transitions = formacionTransitions;
      break;
    case "colaboradores":
      transitions = colaboradorTransitions;
      break;
    case "materials":
      transitions = materialTransitions;
      break;
    case "dissemination_impacts":
      transitions = disseminationTransitions;
      break;
    default:
      return false;
  }

  // Allow staying in the same state
  if (currentState === newState) {
    return true;
  }

  // Check if the transition is valid
  const validNextStates = transitions[currentState];
  return validNextStates ? validNextStates.includes(newState) : false;
}

/**
 * Get all valid next states from a current state
 * 
 * @param entityType - The type of entity
 * @param currentState - The current state of the entity
 * @returns Array of valid next states (including the current state)
 */
export function getValidNextStates(
  entityType: "empresas" | "asesoramientos" | "eventos" | "formaciones" | "colaboradores" | "materials" | "dissemination_impacts",
  currentState: string
): string[] {
  let transitions: TransitionMap<string>;

  switch (entityType) {
    case "empresas":
      transitions = empresaTransitions;
      break;
    case "asesoramientos":
      transitions = asesoramientoTransitions;
      break;
    case "eventos":
      transitions = eventoTransitions;
      break;
    case "formaciones":
      transitions = formacionTransitions;
      break;
    case "colaboradores":
      transitions = colaboradorTransitions;
      break;
    case "materials":
      transitions = materialTransitions;
      break;
    case "dissemination_impacts":
      transitions = disseminationTransitions;
      break;
    default:
      return [currentState];
  }

  const validNextStates = transitions[currentState] || [];
  // Always include current state as valid (can stay in same state)
  return [currentState, ...validNextStates];
}

/**
 * Get a user-friendly error message for an invalid transition
 * 
 * @param entityType - The type of entity
 * @param currentState - The current state
 * @param attemptedState - The state that was attempted
 * @returns A user-friendly error message
 */
export function getTransitionErrorMessage(
  entityType: "empresas" | "asesoramientos" | "eventos" | "formaciones" | "colaboradores" | "materials" | "dissemination_impacts",
  currentState: string,
  attemptedState: string
): string {
  const validNextStates = getValidNextStates(entityType, currentState);
  
  // Remove current state from the list for the message
  const transitionStates = validNextStates.filter(s => s !== currentState);
  
  const entityLabels = {
    empresas: "empresa",
    asesoramientos: "asesoramiento",
    eventos: "evento",
    formaciones: "formación",
    colaboradores: "colaborador",
    materials: "material",
    dissemination_impacts: "impacto de difusión",
  };
  
  const entityLabel = entityLabels[entityType];
  
  if (transitionStates.length === 0) {
    return `No se puede cambiar el estado de un ${entityLabel} en estado "${currentState}". Este es un estado final.`;
  }
  
  return `No se puede cambiar de "${currentState}" a "${attemptedState}". Estados válidos desde "${currentState}": ${transitionStates.join(", ")}.`;
}

/**
 * Export the transition rules for documentation or testing purposes
 */
export const transitionRules = {
  empresas: empresaTransitions,
  asesoramientos: asesoramientoTransitions,
  eventos: eventoTransitions,
  formaciones: formacionTransitions,
  colaboradores: colaboradorTransitions,
  materials: materialTransitions,
  dissemination_impacts: disseminationTransitions,
};
