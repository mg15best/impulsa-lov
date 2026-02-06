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
  BarChart3 
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
    reference: "docs/DEFINICION_KPIS.md#kpi-8-cuadro-de-mando-powerbi"
  }
];

/**
 * Obtiene la definición de un KPI por su ID
 */
export function getKPIDefinition(id: string): KPIDefinition | undefined {
  return KPI_DEFINITIONS.find(kpi => kpi.id === id);
}

/**
 * Obtiene todas las definiciones de KPIs
 */
export function getAllKPIDefinitions(): KPIDefinition[] {
  return KPI_DEFINITIONS;
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
