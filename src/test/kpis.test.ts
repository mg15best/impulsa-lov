/**
 * KPI configuration tests
 */

import { describe, it, expect } from 'vitest';
import { 
  KPI_DEFINITIONS, 
  STRATEGIC_KPI_DEFINITIONS,
  IMPACT_KPI_DEFINITIONS,
  getKPIDefinition,
  getAllKPIDefinitions,
  getStrategicKPIDefinitions,
  getImpactKPIDefinitions,
  getAllKPIDefinitionsComplete
} from '../config/kpis';

describe('KPI Definitions', () => {
  it('should have 8 operational KPIs', () => {
    expect(KPI_DEFINITIONS).toHaveLength(8);
  });

  it('should have 6 strategic KPIs', () => {
    expect(STRATEGIC_KPI_DEFINITIONS).toHaveLength(6);
  });

  it('should have 4 impact KPIs', () => {
    expect(IMPACT_KPI_DEFINITIONS).toHaveLength(4);
  });

  it('should have 18 total KPIs', () => {
    const allKPIs = getAllKPIDefinitionsComplete();
    expect(allKPIs).toHaveLength(18);
  });

  it('all operational KPIs should have required fields', () => {
    KPI_DEFINITIONS.forEach(kpi => {
      expect(kpi.id).toBeTruthy();
      expect(kpi.label).toBeTruthy();
      expect(kpi.description).toBeTruthy();
      expect(kpi.source).toBeTruthy();
      expect(kpi.criteria).toBeTruthy();
      expect(kpi.formula).toBeTruthy();
      expect(kpi.target).toBeGreaterThan(0);
      expect(kpi.icon).toBeTruthy();
      expect(kpi.color).toBeTruthy();
      expect(kpi.updateFrequency).toBeTruthy();
      expect(kpi.reference).toBeTruthy();
    });
  });

  it('all strategic KPIs should have required fields and category', () => {
    STRATEGIC_KPI_DEFINITIONS.forEach(kpi => {
      expect(kpi.id).toBeTruthy();
      expect(kpi.label).toBeTruthy();
      expect(kpi.description).toBeTruthy();
      expect(kpi.source).toBeTruthy();
      expect(kpi.criteria).toBeTruthy();
      expect(kpi.formula).toBeTruthy();
      expect(kpi.target).toBeGreaterThan(0);
      expect(kpi.icon).toBeTruthy();
      expect(kpi.color).toBeTruthy();
      expect(kpi.updateFrequency).toBeTruthy();
      expect(kpi.reference).toBeTruthy();
      expect(kpi.category).toBe('estrategico');
      expect(kpi.unit).toBeTruthy();
    });
  });

  it('all impact KPIs should have required fields and category', () => {
    IMPACT_KPI_DEFINITIONS.forEach(kpi => {
      expect(kpi.id).toBeTruthy();
      expect(kpi.label).toBeTruthy();
      expect(kpi.description).toBeTruthy();
      expect(kpi.source).toBeTruthy();
      expect(kpi.criteria).toBeTruthy();
      expect(kpi.formula).toBeTruthy();
      expect(kpi.target).toBeGreaterThan(0);
      expect(kpi.icon).toBeTruthy();
      expect(kpi.color).toBeTruthy();
      expect(kpi.updateFrequency).toBeTruthy();
      expect(kpi.reference).toBeTruthy();
      expect(kpi.category).toBe('impacto');
    });
  });

  it('should find KPI by ID', () => {
    const kpi = getKPIDefinition('empresas_asesoradas');
    expect(kpi).toBeTruthy();
    expect(kpi?.label).toBe('Empresas asesoradas');
  });

  it('should find strategic KPI by ID', () => {
    const kpi = getKPIDefinition('tasa_conversion_empresas');
    expect(kpi).toBeTruthy();
    expect(kpi?.category).toBe('estrategico');
  });

  it('should find impact KPI by ID', () => {
    const kpi = getKPIDefinition('casos_exito');
    expect(kpi).toBeTruthy();
    expect(kpi?.category).toBe('impacto');
  });

  it('should return undefined for non-existent KPI', () => {
    const kpi = getKPIDefinition('non_existent_kpi');
    expect(kpi).toBeUndefined();
  });

  it('all KPI IDs should be unique', () => {
    const allKPIs = getAllKPIDefinitionsComplete();
    const ids = allKPIs.map(kpi => kpi.id);
    const uniqueIds = new Set(ids);
    expect(ids.length).toBe(uniqueIds.size);
  });

  it('KPI 1-8 should be operational', () => {
    const operationalIds = [
      'empresas_asesoradas',
      'informes_generados',
      'eventos_realizados',
      'pildoras_formativas',
      'entidades_colaboradoras',
      'impactos_difusion',
      'material_apoyo',
      'cuadro_mando_powerbi'
    ];

    operationalIds.forEach(id => {
      const kpi = getAllKPIDefinitions().find(k => k.id === id);
      expect(kpi).toBeTruthy();
    });
  });

  it('KPI 9-14 should be strategic', () => {
    const strategicIds = [
      'tasa_conversion_empresas',
      'tiempo_medio_asesoramiento',
      'tasa_finalizacion_asesoramientos',
      'empresas_por_tecnico',
      'tasa_asistencia_eventos',
      'tasa_ocupacion_formaciones'
    ];

    strategicIds.forEach(id => {
      const kpi = getStrategicKPIDefinitions().find(k => k.id === id);
      expect(kpi).toBeTruthy();
      expect(kpi?.category).toBe('estrategico');
    });
  });

  it('KPI 15-18 should be impact', () => {
    const impactIds = [
      'casos_exito',
      'cobertura_sectorial',
      'indice_documentacion',
      'diversidad_colaboradores'
    ];

    impactIds.forEach(id => {
      const kpi = getImpactKPIDefinitions().find(k => k.id === id);
      expect(kpi).toBeTruthy();
      expect(kpi?.category).toBe('impacto');
    });
  });

  it('strategic KPIs should have appropriate units', () => {
    const percentageKPIs = [
      'tasa_conversion_empresas',
      'tasa_finalizacion_asesoramientos',
      'tasa_asistencia_eventos',
      'tasa_ocupacion_formaciones'
    ];

    percentageKPIs.forEach(id => {
      const kpi = getKPIDefinition(id);
      expect(kpi?.unit).toBe('%');
    });

    const tiempoKpi = getKPIDefinition('tiempo_medio_asesoramiento');
    expect(tiempoKpi?.unit).toBe('días');

    const empresasKpi = getKPIDefinition('empresas_por_tecnico');
    expect(empresasKpi?.unit).toBe('empresas/técnico');
  });

  it('impact KPIs should have appropriate units', () => {
    const percentageKpi = getKPIDefinition('indice_documentacion');
    expect(percentageKpi?.unit).toBe('%');

    const countKPIs = ['casos_exito', 'cobertura_sectorial', 'diversidad_colaboradores'];
    countKPIs.forEach(id => {
      const kpi = getKPIDefinition(id);
      expect(kpi?.unit).toBeTruthy();
    });
  });
});

describe('KPI Helper Functions', () => {
  it('getAllKPIDefinitions should return only operational KPIs', () => {
    const kpis = getAllKPIDefinitions();
    expect(kpis).toHaveLength(8);
    expect(kpis.every(kpi => !kpi.category || kpi.category === 'operativo')).toBe(true);
  });

  it('getStrategicKPIDefinitions should return only strategic KPIs', () => {
    const kpis = getStrategicKPIDefinitions();
    expect(kpis).toHaveLength(6);
    expect(kpis.every(kpi => kpi.category === 'estrategico')).toBe(true);
  });

  it('getImpactKPIDefinitions should return only impact KPIs', () => {
    const kpis = getImpactKPIDefinitions();
    expect(kpis).toHaveLength(4);
    expect(kpis.every(kpi => kpi.category === 'impacto')).toBe(true);
  });

  it('getAllKPIDefinitionsComplete should combine all KPI categories', () => {
    const allKPIs = getAllKPIDefinitionsComplete();
    const operational = getAllKPIDefinitions();
    const strategic = getStrategicKPIDefinitions();
    const impact = getImpactKPIDefinitions();

    expect(allKPIs.length).toBe(operational.length + strategic.length + impact.length);
  });
});
