/**
 * Hook personalizado para calcular los KPIs del Dashboard
 * 
 * Este hook implementa el cálculo de cada KPI según las definiciones
 * del contrato funcional PR-0 (docs/DEFINICION_KPIS.md)
 * 
 * Cada query está documentada con:
 * - Origen: tabla y campos utilizados
 * - Criterio: condiciones aplicadas
 * - Fórmula: lógica de cálculo
 */

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { KPI_DEFINITIONS, KPIValue } from "@/config/kpis";

export function useKPICalculations() {
  const [kpiValues, setKpiValues] = useState<KPIValue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    async function calculateKPIs() {
      try {
        setIsLoading(true);
        const calculatedValues: KPIValue[] = [];

        // KPI 1: Empresas Asesoradas
        // Origen: tabla empresas, campo estado
        // Criterio: estado IN ('asesorada', 'completada')
        // Fórmula: COUNT(DISTINCT id)
        const { count: empresasAsesoradas } = await supabase
          .from("empresas")
          .select("*", { count: "exact", head: true })
          .in("estado", ["asesorada", "completada"]);

        // KPI 2: Informes Generados
        // Origen: tabla asesoramientos, campo informe_generado
        // Criterio: informe_generado = true
        // Fórmula: COUNT(*)
        const { count: informesGenerados } = await supabase
          .from("asesoramientos")
          .select("*", { count: "exact", head: true })
          .eq("informe_generado", true);

        // KPI 3: Eventos Realizados
        // Origen: tabla eventos, campo estado
        // Criterio: estado = 'completado'
        // Fórmula: COUNT(*)
        const { count: eventosRealizados } = await supabase
          .from("eventos")
          .select("*", { count: "exact", head: true })
          .eq("estado", "completado");

        // KPI 4: Píldoras Formativas
        // Origen: tabla formaciones, campos tipo, estado
        // Criterio: tipo = 'pildora_formativa' AND estado = 'completada'
        // Fórmula: COUNT(*)
        const { count: pildorasFormativas } = await supabase
          .from("formaciones")
          .select("*", { count: "exact", head: true })
          .eq("tipo", "pildora_formativa")
          .eq("estado", "completada");

        // KPI 5: Entidades Colaboradoras
        // Origen: tabla colaboradores, campos estado, convenio_firmado
        // Criterio: estado = 'activo' AND convenio_firmado = true
        // Fórmula: COUNT(*)
        const { count: entidadesColaboradoras } = await supabase
          .from("colaboradores")
          .select("*", { count: "exact", head: true })
          .eq("estado", "activo")
          .eq("convenio_firmado", true);

        // KPI 6: Impactos de Difusión
        // Origen: tabla evidencias con relaciones a eventos/formaciones
        // Criterio: tipo IN ('fotografia', 'video', 'otro') relacionado con eventos/formaciones completados
        // Fórmula: COUNT(DISTINCT e.id) con JOIN a eventos y formaciones
        // Nota: Debido a las relaciones opcionales, se hacen dos queries separadas y se deduplicar los IDs
        const { data: evidenciasEventos } = await supabase
          .from("evidencias")
          .select("id, eventos!inner(estado)")
          .in("tipo", ["fotografia", "video", "otro"])
          .eq("eventos.estado", "completado");

        const { data: evidenciasFormaciones } = await supabase
          .from("evidencias")
          .select("id, formaciones!inner(estado)")
          .in("tipo", ["fotografia", "video", "otro"])
          .eq("formaciones.estado", "completada");

        // Combinar y deduplicar por ID
        const evidenciaIds = new Set([
          ...(evidenciasEventos?.map((e) => e.id) || []),
          ...(evidenciasFormaciones?.map((e) => e.id) || []),
        ]);
        const impactosDifusion = evidenciaIds.size;

        // KPI 7: Material de Apoyo
        // Origen: tabla evidencias, campos tipo, formacion_id
        // Criterio: tipo IN ('documento', 'certificado', 'informe') AND formacion_id IS NOT NULL
        // Fórmula: COUNT(*)
        const { count: materialApoyo } = await supabase
          .from("evidencias")
          .select("*", { count: "exact", head: true })
          .in("tipo", ["documento", "certificado", "informe"])
          .not("formacion_id", "is", null);

        // KPI 8: Cuadro de Mando PowerBI
        // Origen: Variables de entorno de configuración
        // Criterio: Todas las variables de PowerBI configuradas
        // Fórmula: boolean check de variables de entorno
        const powerBIConfigured =
          !!import.meta.env.VITE_POWER_TENANT_ID &&
          !!import.meta.env.VITE_POWER_CLIENT_ID &&
          !!import.meta.env.VITE_POWER_API_BASE_URL;

        // Mapear los valores calculados a la estructura de KPIValue
        const kpiValuesMap = new Map([
          ["empresas_asesoradas", empresasAsesoradas || 0],
          ["informes_generados", informesGenerados || 0],
          ["eventos_realizados", eventosRealizados || 0],
          ["pildoras_formativas", pildorasFormativas || 0],
          ["entidades_colaboradoras", entidadesColaboradoras || 0],
          ["impactos_difusion", impactosDifusion],
          ["material_apoyo", materialApoyo || 0],
          ["cuadro_mando_powerbi", powerBIConfigured ? 1 : 0],
        ]);

        // Construir array de KPIValue usando las definiciones centralizadas
        KPI_DEFINITIONS.forEach((def) => {
          const value = kpiValuesMap.get(def.id) || 0;
          const percentage = Math.min((value / def.target) * 100, 100);

          calculatedValues.push({
            id: def.id,
            label: def.label,
            value,
            target: def.target,
            percentage,
            icon: def.icon,
            color: def.color,
          });
        });

        setKpiValues(calculatedValues);
        setError(null);
      } catch (err) {
        console.error("Error calculating KPIs:", err);
        setError(err instanceof Error ? err : new Error("Unknown error"));
      } finally {
        setIsLoading(false);
      }
    }

    calculateKPIs();
  }, []);

  return { kpiValues, isLoading, error };
}
