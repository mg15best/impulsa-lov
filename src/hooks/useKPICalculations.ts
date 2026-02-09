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
import { 
  KPI_DEFINITIONS, 
  STRATEGIC_KPI_DEFINITIONS, 
  IMPACT_KPI_DEFINITIONS, 
  KPIValue 
} from "@/config/kpis";

export function useKPICalculations() {
  const [kpiValues, setKpiValues] = useState<KPIValue[]>([]);
  const [strategicKpiValues, setStrategicKpiValues] = useState<KPIValue[]>([]);
  const [impactKpiValues, setImpactKpiValues] = useState<KPIValue[]>([]);
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

        // Calculate Strategic KPIs (KPIs 9-14)
        const strategicValues: KPIValue[] = [];

        // KPI 9: Tasa de Conversión de Empresas
        // Origen: tabla empresas, campo estado
        // Criterio: (empresas asesoradas/completadas) / total empresas * 100
        const { data: empresasConversion } = await supabase
          .from("empresas")
          .select("estado");
        
        const totalEmpresas = empresasConversion?.length || 0;
        const empresasConvertidas = empresasConversion?.filter(e => 
          e.estado === 'asesorada' || e.estado === 'completada'
        ).length || 0;
        const tasaConversion = totalEmpresas > 0 
          ? (empresasConvertidas / totalEmpresas) * 100 
          : 0;

        // KPI 10: Tiempo Medio de Asesoramiento
        // Origen: tablas empresas y asesoramientos
        // Criterio: días promedio desde creación empresa hasta primer asesoramiento completado
        const { data: asesoramientosData } = await supabase
          .from("asesoramientos")
          .select("empresa_id, fecha, created_at")
          .eq("estado", "completado")
          .order("fecha", { ascending: true });

        const { data: empresasData } = await supabase
          .from("empresas")
          .select("id, created_at");

        let tiempoMedio = 0;
        if (asesoramientosData && empresasData) {
          const empresasConAsesoramiento = new Map<string, Date>();
          asesoramientosData.forEach(a => {
            if (!empresasConAsesoramiento.has(a.empresa_id)) {
              empresasConAsesoramiento.set(a.empresa_id, new Date(a.fecha));
            }
          });

          const tiempos: number[] = [];
          empresasConAsesoramiento.forEach((fechaAsesoramiento, empresaId) => {
            const empresa = empresasData.find(e => e.id === empresaId);
            if (empresa) {
              const fechaCreacion = new Date(empresa.created_at);
              const dias = Math.floor((fechaAsesoramiento.getTime() - fechaCreacion.getTime()) / (1000 * 60 * 60 * 24));
              if (dias >= 0) tiempos.push(dias);
            }
          });

          tiempoMedio = tiempos.length > 0 
            ? Math.round(tiempos.reduce((a, b) => a + b, 0) / tiempos.length) 
            : 0;
        }

        // KPI 11: Tasa de Finalización de Asesoramientos
        // Origen: tabla asesoramientos, campo estado
        const { data: asesoramientosFinalizacion } = await supabase
          .from("asesoramientos")
          .select("estado")
          .in("estado", ["completado", "cancelado"]);
        
        const totalFinalizados = asesoramientosFinalizacion?.length || 0;
        const completados = asesoramientosFinalizacion?.filter(a => a.estado === 'completado').length || 0;
        const tasaFinalizacion = totalFinalizados > 0 
          ? (completados / totalFinalizados) * 100 
          : 0;

        // KPI 12: Empresas por Técnico
        // Origen: tabla empresas, campo tecnico_asignado_id
        const { data: empresasPorTecnico } = await supabase
          .from("empresas")
          .select("tecnico_asignado_id")
          .not("tecnico_asignado_id", "is", null);
        
        const tecnicos = new Set(empresasPorTecnico?.map(e => e.tecnico_asignado_id) || []);
        const totalEmpresasAsignadas = empresasPorTecnico?.length || 0;
        const promedioEmpresasPorTecnico = tecnicos.size > 0 
          ? totalEmpresasAsignadas / tecnicos.size 
          : 0;

        // KPI 13: Tasa de Asistencia a Eventos
        // Origen: tabla eventos, campos asistentes_confirmados, asistentes_esperados
        const { data: eventosAsistencia } = await supabase
          .from("eventos")
          .select("asistentes_confirmados, asistentes_esperados")
          .eq("estado", "completado")
          .gt("asistentes_esperados", 0);
        
        const totalEsperados = eventosAsistencia?.reduce((sum, e) => sum + (e.asistentes_esperados || 0), 0) || 0;
        const totalConfirmados = eventosAsistencia?.reduce((sum, e) => sum + (e.asistentes_confirmados || 0), 0) || 0;
        const tasaAsistencia = totalEsperados > 0 
          ? (totalConfirmados / totalEsperados) * 100 
          : 0;

        // KPI 14: Tasa de Ocupación de Formaciones
        // Origen: tabla formaciones, campos participantes_inscritos, participantes_max
        const { data: formacionesOcupacion } = await supabase
          .from("formaciones")
          .select("participantes_inscritos, participantes_max")
          .eq("estado", "completada")
          .gt("participantes_max", 0);
        
        const totalMaxParticipantes = formacionesOcupacion?.reduce((sum, f) => sum + (f.participantes_max || 0), 0) || 0;
        const totalInscritos = formacionesOcupacion?.reduce((sum, f) => sum + (f.participantes_inscritos || 0), 0) || 0;
        const tasaOcupacion = totalMaxParticipantes > 0 
          ? (totalInscritos / totalMaxParticipantes) * 100 
          : 0;

        // Mapear valores estratégicos calculados
        const strategicValuesMap = new Map([
          ["tasa_conversion_empresas", tasaConversion],
          ["tiempo_medio_asesoramiento", tiempoMedio],
          ["tasa_finalizacion_asesoramientos", tasaFinalizacion],
          ["empresas_por_tecnico", promedioEmpresasPorTecnico],
          ["tasa_asistencia_eventos", tasaAsistencia],
          ["tasa_ocupacion_formaciones", tasaOcupacion],
        ]);

        // Construir array de KPIValue para KPIs estratégicos
        STRATEGIC_KPI_DEFINITIONS.forEach((def) => {
          const value = strategicValuesMap.get(def.id) || 0;
          // For KPIs where value is already a percentage, use value directly for percentage display
          // For count-based KPIs, calculate percentage of target
          const percentage = def.isPercentageValue
            ? Math.min(value, 100) // Already a percentage
            : Math.min((value / def.target) * 100, 100);

          strategicValues.push({
            id: def.id,
            label: def.label,
            value: Math.round(value * 100) / 100, // Round to 2 decimals
            target: def.target,
            percentage,
            icon: def.icon,
            color: def.color,
            unit: def.unit,
          });
        });

        setStrategicKpiValues(strategicValues);

        // Calculate Impact KPIs (KPIs 15-18)
        const impactValues: KPIValue[] = [];

        // KPI 15: Casos de Éxito
        // Origen: tabla empresas, campo es_caso_exito
        const { count: casosExito } = await supabase
          .from("empresas")
          .select("*", { count: "exact", head: true })
          .eq("es_caso_exito", true);

        // KPI 16: Cobertura Sectorial
        // Origen: tabla empresas, campo sector
        const { data: sectoresData } = await supabase
          .from("empresas")
          .select("sector")
          .in("estado", ["asesorada", "completada"])
          .not("sector", "is", null);
        
        const sectoresUnicos = new Set(sectoresData?.map(e => e.sector) || []);
        const coberturaSectorial = sectoresUnicos.size;

        // KPI 17: Índice de Documentación
        // Origen: tabla asesoramientos, campos acta, compromisos, proximos_pasos
        const { data: asesoramientosDoc } = await supabase
          .from("asesoramientos")
          .select("acta, compromisos, proximos_pasos")
          .eq("estado", "completado");
        
        const totalAsesoramientosCompletados = asesoramientosDoc?.length || 0;
        const asesoramientosCompletos = asesoramientosDoc?.filter(a => 
          a.acta && a.acta.trim() !== '' &&
          a.compromisos && a.compromisos.trim() !== '' &&
          a.proximos_pasos && a.proximos_pasos.trim() !== ''
        ).length || 0;
        const indiceDocumentacion = totalAsesoramientosCompletados > 0 
          ? (asesoramientosCompletos / totalAsesoramientosCompletados) * 100 
          : 0;

        // KPI 18: Diversidad de Colaboradores
        // Origen: tabla colaboradores, campo tipo
        const { data: colaboradoresTipos } = await supabase
          .from("colaboradores")
          .select("tipo")
          .eq("estado", "activo")
          .not("tipo", "is", null);
        
        const tiposUnicos = new Set(colaboradoresTipos?.map(c => c.tipo) || []);
        const diversidadColaboradores = tiposUnicos.size;

        // Mapear valores de impacto calculados
        const impactValuesMap = new Map([
          ["casos_exito", casosExito || 0],
          ["cobertura_sectorial", coberturaSectorial],
          ["indice_documentacion", indiceDocumentacion],
          ["diversidad_colaboradores", diversidadColaboradores],
        ]);

        // Construir array de KPIValue para KPIs de impacto
        IMPACT_KPI_DEFINITIONS.forEach((def) => {
          const value = impactValuesMap.get(def.id) || 0;
          // For KPIs where value is already a percentage, use value directly for percentage display
          const percentage = def.isPercentageValue
            ? Math.min(value, 100)
            : Math.min((value / def.target) * 100, 100);

          impactValues.push({
            id: def.id,
            label: def.label,
            value: Math.round(value * 100) / 100, // Round to 2 decimals
            target: def.target,
            percentage,
            icon: def.icon,
            color: def.color,
            unit: def.unit,
          });
        });

        setImpactKpiValues(impactValues);
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

  return { 
    kpiValues, 
    strategicKpiValues, 
    impactKpiValues, 
    isLoading, 
    error 
  };
}
