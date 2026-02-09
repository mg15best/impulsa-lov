/**
 * Definiciones centralizadas de KPIs - Impulsa LOV
 * 
 * Este archivo centraliza todas las definiciones de KPIs del sistema según
 * el contrato funcional PR-0 documentado en docs/DEFINICION_KPIS.md
 * 
 * Cada KPI incluye:
 * - id: Identificador único
 * - label: Etiqueta mostrada en UI
 * - description: Descripción del KPI
 * - source: Fuente de datos (tabla/campo)
 * - criteria: Criterio de contabilización
 * - formula: Fórmula de cálculo (SQL/lógica)
 * - target: Meta a alcanzar
 * - icon: Icono a mostrar
 * - color: Color de identificación
 * - updateFrequency: Frecuencia de actualización
 * - reference: Referencia al documento PR-0
 */

import { 
  Building2, 
  FileText, 
  Calendar, 
  GraduationCap, 
  Handshake, 
  Megaphone, 
  BookOpen, 
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle,
  Users,
  UserCheck,
  BookCheck,
  Award,
  Target,
  FileCheck,
  Layers
} from "lucide-react";

export interface KPIDefinition {
  id: string;
  label: string;
  description: string;
  source: string;
  criteria: string;
  formula: string;
  target: number;
  icon: React.ElementType;
  color: string;
  updateFrequency: string;
  reference: string;
  category?: 'operativo' | 'estrategico' | 'impacto'; // KPI category
  unit?: string; // Unit of measurement (e.g., '%', 'días', 'empresas')
}

/**
 * KPIs Operativos del Dashboard
 * Referencia: docs/DEFINICION_KPIS.md - Sección "KPIs Operativos"
 */
export const KPI_DEFINITIONS: KPIDefinition[] = [
  {
    id: "empresas_asesoradas",
    label: "Empresas asesoradas",
    description: "Número de empresas que han completado al menos un asesoramiento o que están en estado 'asesorada' o 'completada'",
    source: "Tabla: empresas, Campo: estado",
    criteria: "Empresas con estado = 'asesorada' OR estado = 'completada'",
    formula: "SELECT COUNT(DISTINCT id) FROM empresas WHERE estado IN ('asesorada', 'completada')",
    target: 20,
    icon: Building2,
    color: "text-primary",
    updateFrequency: "Diaria",
    reference: "docs/DEFINICION_KPIS.md#kpi-1-empresas-asesoradas"
  },
  {
    id: "informes_generados",
    label: "Informes generados",
    description: "Número de asesoramientos que tienen el indicador de informe generado marcado como verdadero",
    source: "Tabla: asesoramientos, Campo: informe_generado",
    criteria: "Asesoramientos con informe_generado = true",
    formula: "SELECT COUNT(*) FROM asesoramientos WHERE informe_generado = true",
    target: 15,
    icon: FileText,
    color: "text-info",
    updateFrequency: "Diaria",
    reference: "docs/DEFINICION_KPIS.md#kpi-2-informes-generados"
  },
  {
    id: "eventos_realizados",
    label: "Eventos realizados",
    description: "Número de eventos que han sido completados",
    source: "Tabla: eventos, Campo: estado",
    criteria: "Eventos con estado = 'completado'",
    formula: "SELECT COUNT(*) FROM eventos WHERE estado = 'completado'",
    target: 2,
    icon: Calendar,
    color: "text-warning",
    updateFrequency: "Diaria",
    reference: "docs/DEFINICION_KPIS.md#kpi-3-eventos-realizados"
  },
  {
    id: "pildoras_formativas",
    label: "Píldoras formativas",
    description: "Número de formaciones de tipo 'píldora formativa' que han sido completadas",
    source: "Tabla: formaciones, Campos: tipo, estado",
    criteria: "Formaciones con tipo = 'pildora_formativa' AND estado = 'completada'",
    formula: "SELECT COUNT(*) FROM formaciones WHERE tipo = 'pildora_formativa' AND estado = 'completada'",
    target: 6,
    icon: GraduationCap,
    color: "text-success",
    updateFrequency: "Diaria",
    reference: "docs/DEFINICION_KPIS.md#kpi-4-píldoras-formativas"
  },
  {
    id: "entidades_colaboradoras",
    label: "Entidades colaboradoras",
    description: "Número de colaboradores con estado activo y que tienen convenio firmado",
    source: "Tabla: colaboradores, Campos: estado, convenio_firmado",
    criteria: "Colaboradores con estado = 'activo' AND convenio_firmado = true",
    formula: "SELECT COUNT(*) FROM colaboradores WHERE estado = 'activo' AND convenio_firmado = true",
    target: 8,
    icon: Handshake,
    color: "text-accent-foreground",
    updateFrequency: "Semanal",
    reference: "docs/DEFINICION_KPIS.md#kpi-5-entidades-colaboradoras"
  },
  {
    id: "impactos_difusion",
    label: "Impactos de difusión",
    description: "Número de evidencias de tipo relacionado con difusión (fotografías, videos) asociadas a eventos o formaciones completadas",
    source: "Tabla: evidencias (con relaciones a eventos/formaciones), Campos: tipo, evento_id, formacion_id",
    criteria: "Evidencias con tipo IN ('fotografia', 'video', 'otro') relacionadas con eventos completados O formaciones completadas",
    formula: `SELECT COUNT(DISTINCT e.id) FROM evidencias e 
              LEFT JOIN eventos ev ON e.evento_id = ev.id 
              LEFT JOIN formaciones f ON e.formacion_id = f.id 
              WHERE e.tipo IN ('fotografia', 'video', 'otro') 
              AND (ev.estado = 'completado' OR f.estado = 'completada')`,
    target: 15,
    icon: Megaphone,
    color: "text-destructive",
    updateFrequency: "Semanal",
    reference: "docs/DEFINICION_KPIS.md#kpi-6-impactos-de-difusión"
  },
  {
    id: "material_apoyo",
    label: "Material de apoyo",
    description: "Número de evidencias de tipo documento o material educativo asociadas a formaciones",
    source: "Tabla: evidencias, Campos: tipo, formacion_id",
    criteria: "Evidencias con tipo IN ('documento', 'certificado', 'informe') relacionadas con formaciones",
    formula: "SELECT COUNT(*) FROM evidencias WHERE tipo IN ('documento', 'certificado', 'informe') AND formacion_id IS NOT NULL",
    target: 5,
    icon: BookOpen,
    color: "text-primary",
    updateFrequency: "Semanal",
    reference: "docs/DEFINICION_KPIS.md#kpi-7-material-de-apoyo"
  },
  {
    id: "cuadro_mando_powerbi",
    label: "Cuadro de mando PowerBI",
    description: "Indicador binario de si existe un dashboard de PowerBI configurado e integrado",
    source: "Configuración del sistema (variables de entorno)",
    criteria: "Integración con Power Platform activa y dashboard publicado",
    formula: `const powerBIConfigured = 
              !!import.meta.env.VITE_POWER_TENANT_ID && 
              !!import.meta.env.VITE_POWER_CLIENT_ID && 
              !!import.meta.env.VITE_POWER_API_BASE_URL; 
              return powerBIConfigured ? 1 : 0`,
    target: 1,
    icon: BarChart3,
    color: "text-info",
    updateFrequency: "Al cargar la aplicación",
    reference: "docs/DEFINICION_KPIS.md#kpi-8-cuadro-de-mando-powerbi",
    category: "operativo"
  }
];

/**
 * KPIs Estratégicos
 * Referencia: docs/DEFINICION_KPIS.md - Sección "KPIs Estratégicos"
 */
export const STRATEGIC_KPI_DEFINITIONS: KPIDefinition[] = [
  {
    id: "tasa_conversion_empresas",
    label: "Tasa de conversión de empresas",
    description: "Porcentaje de empresas que pasan de estado 'pendiente' a 'asesorada' o 'completada'",
    source: "Tabla: empresas, Campo: estado",
    criteria: "Numerador: estado IN ('asesorada', 'completada'), Denominador: Total empresas",
    formula: "SELECT ROUND((COUNT(CASE WHEN estado IN ('asesorada', 'completada') THEN 1 END)::NUMERIC / NULLIF(COUNT(*), 0)::NUMERIC * 100), 2) FROM empresas",
    target: 80,
    icon: TrendingUp,
    color: "text-purple-600",
    updateFrequency: "Semanal",
    reference: "docs/DEFINICION_KPIS.md#kpi-9-tasa-de-conversión-de-empresas",
    category: "estrategico",
    unit: "%"
  },
  {
    id: "tiempo_medio_asesoramiento",
    label: "Tiempo medio de asesoramiento",
    description: "Tiempo promedio desde que una empresa se registra hasta que recibe su primer asesoramiento completado",
    source: "Tablas: empresas, asesoramientos, Campos: created_at, fecha, estado",
    criteria: "Diferencia en días entre empresa.created_at y el primer asesoramiento.fecha donde estado = 'completado'",
    formula: "SELECT ROUND(AVG(dias_hasta_asesoramiento)) FROM (SELECT e.id, MIN(a.fecha)::date - e.created_at::date as dias_hasta_asesoramiento FROM empresas e INNER JOIN asesoramientos a ON e.id = a.empresa_id WHERE a.estado = 'completado' GROUP BY e.id) sub",
    target: 15,
    icon: Clock,
    color: "text-blue-600",
    updateFrequency: "Semanal",
    reference: "docs/DEFINICION_KPIS.md#kpi-10-tiempo-medio-de-asesoramiento",
    category: "estrategico",
    unit: "días"
  },
  {
    id: "tasa_finalizacion_asesoramientos",
    label: "Tasa de finalización de asesoramientos",
    description: "Porcentaje de asesoramientos programados que se completan (no se cancelan)",
    source: "Tabla: asesoramientos, Campo: estado",
    criteria: "Numerador: estado = 'completado', Denominador: estado IN ('completado', 'cancelado')",
    formula: "SELECT ROUND((COUNT(CASE WHEN estado = 'completado' THEN 1 END)::NUMERIC / NULLIF(COUNT(CASE WHEN estado IN ('completado', 'cancelado') THEN 1 END), 0)::NUMERIC * 100), 2) FROM asesoramientos",
    target: 90,
    icon: CheckCircle,
    color: "text-green-600",
    updateFrequency: "Semanal",
    reference: "docs/DEFINICION_KPIS.md#kpi-11-tasa-de-finalización-de-asesoramientos",
    category: "estrategico",
    unit: "%"
  },
  {
    id: "empresas_por_tecnico",
    label: "Empresas por técnico",
    description: "Número promedio de empresas asignadas por técnico",
    source: "Tabla: empresas, Campo: tecnico_asignado_id",
    criteria: "Contar empresas agrupadas por técnico y calcular promedio",
    formula: "SELECT ROUND(COUNT(*)::NUMERIC / NULLIF(COUNT(DISTINCT tecnico_asignado_id), 0)::NUMERIC, 2) FROM empresas WHERE tecnico_asignado_id IS NOT NULL",
    target: 7.5,
    icon: Users,
    color: "text-indigo-600",
    updateFrequency: "Semanal",
    reference: "docs/DEFINICION_KPIS.md#kpi-12-empresas-por-técnico",
    category: "estrategico",
    unit: "empresas/técnico"
  },
  {
    id: "tasa_asistencia_eventos",
    label: "Tasa de asistencia a eventos",
    description: "Ratio entre asistentes confirmados y esperados en eventos completados",
    source: "Tabla: eventos, Campos: asistentes_confirmados, asistentes_esperados, estado",
    criteria: "Eventos completados con asistentes_esperados > 0",
    formula: "SELECT ROUND((SUM(asistentes_confirmados)::NUMERIC / NULLIF(SUM(asistentes_esperados), 0)::NUMERIC * 100), 2) FROM eventos WHERE estado = 'completado' AND asistentes_esperados > 0",
    target: 85,
    icon: UserCheck,
    color: "text-orange-600",
    updateFrequency: "Después de cada evento",
    reference: "docs/DEFINICION_KPIS.md#kpi-13-tasa-de-asistencia-a-eventos",
    category: "estrategico",
    unit: "%"
  },
  {
    id: "tasa_ocupacion_formaciones",
    label: "Tasa de ocupación de formaciones",
    description: "Ratio entre participantes inscritos y máximo permitido en formaciones completadas",
    source: "Tabla: formaciones, Campos: participantes_inscritos, participantes_max, estado",
    criteria: "Formaciones completadas con participantes_max > 0",
    formula: "SELECT ROUND((SUM(participantes_inscritos)::NUMERIC / NULLIF(SUM(participantes_max), 0)::NUMERIC * 100), 2) FROM formaciones WHERE estado = 'completada' AND participantes_max > 0",
    target: 80,
    icon: BookCheck,
    color: "text-teal-600",
    updateFrequency: "Después de cada formación",
    reference: "docs/DEFINICION_KPIS.md#kpi-14-tasa-de-ocupación-de-formaciones",
    category: "estrategico",
    unit: "%"
  }
];

/**
 * KPIs de Impacto
 * Referencia: docs/DEFINICION_KPIS.md - Sección "KPIs de Impacto"
 */
export const IMPACT_KPI_DEFINITIONS: KPIDefinition[] = [
  {
    id: "casos_exito",
    label: "Casos de éxito",
    description: "Número de empresas marcadas como casos de éxito",
    source: "Tabla: empresas, Campo: es_caso_exito",
    criteria: "Empresas con es_caso_exito = true",
    formula: "SELECT COUNT(*) FROM empresas WHERE es_caso_exito = true",
    target: 5,
    icon: Award,
    color: "text-yellow-600",
    updateFrequency: "Mensual",
    reference: "docs/DEFINICION_KPIS.md#kpi-15-casos-de-éxito",
    category: "impacto",
    unit: "empresas"
  },
  {
    id: "cobertura_sectorial",
    label: "Cobertura sectorial",
    description: "Número de sectores diferentes representados en las empresas asesoradas",
    source: "Tabla: empresas, Campo: sector",
    criteria: "Contar sectores únicos en empresas asesoradas/completadas",
    formula: "SELECT COUNT(DISTINCT sector) FROM empresas WHERE estado IN ('asesorada', 'completada')",
    target: 6,
    icon: Target,
    color: "text-pink-600",
    updateFrequency: "Semanal",
    reference: "docs/DEFINICION_KPIS.md#kpi-16-cobertura-sectorial",
    category: "impacto",
    unit: "sectores"
  },
  {
    id: "indice_documentacion",
    label: "Índice de documentación",
    description: "Porcentaje de asesoramientos completados que tienen acta, compromisos y próximos pasos documentados",
    source: "Tabla: asesoramientos, Campos: estado, acta, compromisos, proximos_pasos",
    criteria: "Asesoramientos completados con todos los campos de documentación completos",
    formula: "SELECT ROUND((COUNT(CASE WHEN acta IS NOT NULL AND acta != '' AND compromisos IS NOT NULL AND compromisos != '' AND proximos_pasos IS NOT NULL AND proximos_pasos != '' THEN 1 END)::NUMERIC / NULLIF(COUNT(*), 0)::NUMERIC * 100), 2) FROM asesoramientos WHERE estado = 'completado'",
    target: 95,
    icon: FileCheck,
    color: "text-cyan-600",
    updateFrequency: "Diaria",
    reference: "docs/DEFINICION_KPIS.md#kpi-17-índice-de-documentación",
    category: "impacto",
    unit: "%"
  },
  {
    id: "diversidad_colaboradores",
    label: "Diversidad de colaboradores",
    description: "Número de tipos diferentes de colaboradores activos",
    source: "Tabla: colaboradores, Campo: tipo, estado",
    criteria: "Tipos únicos de colaboradores con estado = 'activo'",
    formula: "SELECT COUNT(DISTINCT tipo) FROM colaboradores WHERE estado = 'activo'",
    target: 4,
    icon: Layers,
    color: "text-violet-600",
    updateFrequency: "Mensual",
    reference: "docs/DEFINICION_KPIS.md#kpi-18-diversidad-de-colaboradores",
    category: "impacto",
    unit: "tipos"
  }
];

/**
 * Obtiene la definición de un KPI por su ID
 */
export function getKPIDefinition(id: string): KPIDefinition | undefined {
  const allKPIs = [...KPI_DEFINITIONS, ...STRATEGIC_KPI_DEFINITIONS, ...IMPACT_KPI_DEFINITIONS];
  return allKPIs.find(kpi => kpi.id === id);
}

/**
 * Obtiene todas las definiciones de KPIs operativos
 */
export function getAllKPIDefinitions(): KPIDefinition[] {
  return KPI_DEFINITIONS;
}

/**
 * Obtiene todas las definiciones de KPIs estratégicos
 */
export function getStrategicKPIDefinitions(): KPIDefinition[] {
  return STRATEGIC_KPI_DEFINITIONS;
}

/**
 * Obtiene todas las definiciones de KPIs de impacto
 */
export function getImpactKPIDefinitions(): KPIDefinition[] {
  return IMPACT_KPI_DEFINITIONS;
}

/**
 * Obtiene todas las definiciones de KPIs (todas las categorías)
 */
export function getAllKPIDefinitionsComplete(): KPIDefinition[] {
  return [...KPI_DEFINITIONS, ...STRATEGIC_KPI_DEFINITIONS, ...IMPACT_KPI_DEFINITIONS];
}

/**
 * Tipo para los valores calculados de KPIs
 */
export interface KPIValue {
  id: string;
  label: string;
  value: number;
  target: number;
  percentage: number;
  icon: React.ElementType;
  color: string;
}
