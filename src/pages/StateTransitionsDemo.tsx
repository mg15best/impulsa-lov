/**
 * State Transitions Demo Page
 * 
 * This page demonstrates the state transition validation rules.
 * It allows you to test different state transitions and see the validation in action.
 */

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EstadoSelector } from "@/components/EstadoSelector";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type EstadoEmpresa = Database["public"]["Enums"]["estado_empresa"];
type EstadoAsesoramiento = Database["public"]["Enums"]["estado_asesoramiento"];
type EstadoEvento = Database["public"]["Enums"]["estado_evento"];
type EstadoFormacion = Database["public"]["Enums"]["estado_formacion"];
type EstadoColaborador = Database["public"]["Enums"]["estado_colaborador"];

const empresaLabels: Record<EstadoEmpresa, string> = {
  pendiente: "Pendiente",
  en_proceso: "En proceso",
  asesorada: "Asesorada",
  completada: "Completada",
};

const asesoramientoLabels: Record<EstadoAsesoramiento, string> = {
  programado: "Programado",
  en_curso: "En curso",
  completado: "Completado",
  cancelado: "Cancelado",
};

const eventoLabels: Record<EstadoEvento, string> = {
  planificado: "Planificado",
  confirmado: "Confirmado",
  en_curso: "En curso",
  completado: "Completado",
  cancelado: "Cancelado",
};

const formacionLabels: Record<EstadoFormacion, string> = {
  planificada: "Planificada",
  en_curso: "En curso",
  completada: "Completada",
  cancelada: "Cancelada",
};

const colaboradorLabels: Record<EstadoColaborador, string> = {
  pendiente: "Pendiente",
  activo: "Activo",
  inactivo: "Inactivo",
};

export default function StateTransitionsDemo() {
  const [empresaEstado, setEmpresaEstado] = useState<EstadoEmpresa>("pendiente");
  const [asesoramientoEstado, setAsesoramientoEstado] = useState<EstadoAsesoramiento>("programado");
  const [eventoEstado, setEventoEstado] = useState<EstadoEvento>("planificado");
  const [formacionEstado, setFormacionEstado] = useState<EstadoFormacion>("planificada");
  const [colaboradorEstado, setColaboradorEstado] = useState<EstadoColaborador>("pendiente");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Demo de Transiciones de Estado</h1>
        <p className="text-muted-foreground">
          Prueba las reglas de transición de estados para cada entidad
        </p>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Cómo usar esta demo</AlertTitle>
        <AlertDescription>
          Cada selector muestra solo los estados válidos desde el estado actual.
          Si intentas seleccionar un estado no válido (por ejemplo, desde un estado terminal),
          verás un mensaje de error. Los estados terminales no permiten más cambios.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Empresas */}
        <Card>
          <CardHeader>
            <CardTitle>Empresas</CardTitle>
            <CardDescription>
              Flujo: pendiente → en_proceso → asesorada → completada (terminal)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Estado actual:</span>
              <Badge>{empresaLabels[empresaEstado]}</Badge>
            </div>
            <EstadoSelector
              entityType="empresas"
              currentEstado={empresaEstado}
              value={empresaEstado}
              onChange={setEmpresaEstado}
              estadoLabels={empresaLabels}
              label="Cambiar a estado"
            />
          </CardContent>
        </Card>

        {/* Asesoramientos */}
        <Card>
          <CardHeader>
            <CardTitle>Asesoramientos</CardTitle>
            <CardDescription>
              Flujo: programado → en_curso → completado/cancelado (ambos terminales)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Estado actual:</span>
              <Badge>{asesoramientoLabels[asesoramientoEstado]}</Badge>
            </div>
            <EstadoSelector
              entityType="asesoramientos"
              currentEstado={asesoramientoEstado}
              value={asesoramientoEstado}
              onChange={setAsesoramientoEstado}
              estadoLabels={asesoramientoLabels}
              label="Cambiar a estado"
            />
          </CardContent>
        </Card>

        {/* Eventos */}
        <Card>
          <CardHeader>
            <CardTitle>Eventos</CardTitle>
            <CardDescription>
              Flujo: planificado → confirmado → en_curso → completado/cancelado (ambos terminales)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Estado actual:</span>
              <Badge>{eventoLabels[eventoEstado]}</Badge>
            </div>
            <EstadoSelector
              entityType="eventos"
              currentEstado={eventoEstado}
              value={eventoEstado}
              onChange={setEventoEstado}
              estadoLabels={eventoLabels}
              label="Cambiar a estado"
            />
          </CardContent>
        </Card>

        {/* Formaciones */}
        <Card>
          <CardHeader>
            <CardTitle>Formaciones</CardTitle>
            <CardDescription>
              Flujo: planificada → en_curso → completada/cancelada (ambas terminales)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Estado actual:</span>
              <Badge>{formacionLabels[formacionEstado]}</Badge>
            </div>
            <EstadoSelector
              entityType="formaciones"
              currentEstado={formacionEstado}
              value={formacionEstado}
              onChange={setFormacionEstado}
              estadoLabels={formacionLabels}
              label="Cambiar a estado"
            />
          </CardContent>
        </Card>

        {/* Colaboradores */}
        <Card>
          <CardHeader>
            <CardTitle>Colaboradores</CardTitle>
            <CardDescription>
              Flujo: pendiente → activo ↔ inactivo (bidireccional, no hay estados terminales)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Estado actual:</span>
              <Badge>{colaboradorLabels[colaboradorEstado]}</Badge>
            </div>
            <EstadoSelector
              entityType="colaboradores"
              currentEstado={colaboradorEstado}
              value={colaboradorEstado}
              onChange={setColaboradorEstado}
              estadoLabels={colaboradorLabels}
              label="Cambiar a estado"
            />
          </CardContent>
        </Card>
      </div>

      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-900">Ejemplos de Validaciones</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-800 space-y-2">
          <p>✅ <strong>Válido:</strong> Empresa: pendiente → en_proceso → asesorada → completada</p>
          <p>✅ <strong>Válido:</strong> Empresa: pendiente → completada (directo)</p>
          <p>❌ <strong>Inválido:</strong> Empresa: completada → cualquier otro (estado terminal)</p>
          <p>❌ <strong>Inválido:</strong> Asesoramiento: completado → cualquier otro (estado terminal)</p>
          <p>✅ <strong>Válido:</strong> Colaborador: activo ↔ inactivo (bidireccional)</p>
          <p>❌ <strong>Inválido:</strong> Evento: en_curso → cancelado (no se permite cancelar evento en curso)</p>
        </CardContent>
      </Card>
    </div>
  );
}
