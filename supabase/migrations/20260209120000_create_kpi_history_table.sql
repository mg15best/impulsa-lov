-- PR-K: Create kpi_history table and related objects for KPI tracking and export
-- This enables historical tracking of KPI values and Power BI integration

-- Create kpi_history table to store snapshots of KPI values over time
CREATE TABLE IF NOT EXISTS public.kpi_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- KPI identification
  kpi_id TEXT NOT NULL, -- References the KPI definition ID from config/kpis.ts
  label TEXT NOT NULL, -- KPI display name
  
  -- KPI values at snapshot time
  value NUMERIC NOT NULL, -- Actual value
  target NUMERIC NOT NULL, -- Target value
  percentage NUMERIC NOT NULL, -- Percentage of completion (value/target * 100)
  
  -- Snapshot metadata
  calculated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), -- When this snapshot was taken
  metadata JSONB, -- Additional context (e.g., breakdown by sector, technician, etc.)
  
  -- Audit fields
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Constraints
  CONSTRAINT kpi_history_kpi_id_check CHECK (char_length(kpi_id) > 0),
  CONSTRAINT kpi_history_label_check CHECK (char_length(label) > 0),
  CONSTRAINT kpi_history_value_check CHECK (value >= 0),
  CONSTRAINT kpi_history_target_check CHECK (target > 0),
  CONSTRAINT kpi_history_percentage_check CHECK (percentage >= 0)
);

-- Create indexes for better query performance
CREATE INDEX idx_kpi_history_kpi_id ON public.kpi_history(kpi_id);
CREATE INDEX idx_kpi_history_calculated_at ON public.kpi_history(calculated_at DESC);
CREATE INDEX idx_kpi_history_created_by ON public.kpi_history(created_by);
CREATE INDEX idx_kpi_history_kpi_date ON public.kpi_history(kpi_id, calculated_at DESC);

-- Create composite index for time-series queries
CREATE INDEX idx_kpi_history_timeseries ON public.kpi_history(kpi_id, calculated_at DESC, value);

-- Enable RLS
ALTER TABLE public.kpi_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for kpi_history
-- Read access: All authenticated users can view KPI history
CREATE POLICY "KPI history is viewable by authenticated users"
  ON public.kpi_history FOR SELECT
  TO authenticated
  USING (true);

-- Write access: Only admin and tecnico roles can create KPI snapshots
CREATE POLICY "KPI history is insertable by admin and tecnico"
  ON public.kpi_history FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'tecnico')
    )
  );

-- Update trigger for updated_at (not used but keeping pattern consistency)
CREATE TRIGGER update_kpi_history_updated_at
  BEFORE UPDATE ON public.kpi_history
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to snapshot current KPI values
-- This function can be called manually or scheduled via pg_cron
CREATE OR REPLACE FUNCTION public.snapshot_kpis()
RETURNS TABLE (
  snapshot_count INTEGER,
  snapshot_time TIMESTAMP WITH TIME ZONE
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_snapshot_time TIMESTAMP WITH TIME ZONE;
  v_count INTEGER := 0;
  v_empresas_asesoradas INTEGER;
  v_informes_generados INTEGER;
  v_eventos_realizados INTEGER;
  v_pildoras_formativas INTEGER;
  v_entidades_colaboradoras INTEGER;
  v_impactos_difusion INTEGER;
  v_material_apoyo INTEGER;
  v_powerbi_configured INTEGER;
BEGIN
  -- Set snapshot time
  v_snapshot_time := now();
  
  -- Calculate KPI 1: Empresas Asesoradas
  SELECT COUNT(DISTINCT id) INTO v_empresas_asesoradas
  FROM empresas
  WHERE estado IN ('asesorada', 'completada');
  
  INSERT INTO kpi_history (kpi_id, label, value, target, percentage, calculated_at, created_by)
  VALUES (
    'empresas_asesoradas',
    'Empresas asesoradas',
    v_empresas_asesoradas,
    20,
    LEAST((v_empresas_asesoradas::NUMERIC / 20) * 100, 100),
    v_snapshot_time,
    auth.uid()
  );
  v_count := v_count + 1;
  
  -- Calculate KPI 2: Informes Generados
  SELECT COUNT(*) INTO v_informes_generados
  FROM asesoramientos
  WHERE informe_generado = true;
  
  INSERT INTO kpi_history (kpi_id, label, value, target, percentage, calculated_at, created_by)
  VALUES (
    'informes_generados',
    'Informes generados',
    v_informes_generados,
    15,
    LEAST((v_informes_generados::NUMERIC / 15) * 100, 100),
    v_snapshot_time,
    auth.uid()
  );
  v_count := v_count + 1;
  
  -- Calculate KPI 3: Eventos Realizados
  SELECT COUNT(*) INTO v_eventos_realizados
  FROM eventos
  WHERE estado = 'completado';
  
  INSERT INTO kpi_history (kpi_id, label, value, target, percentage, calculated_at, created_by)
  VALUES (
    'eventos_realizados',
    'Eventos realizados',
    v_eventos_realizados,
    2,
    LEAST((v_eventos_realizados::NUMERIC / 2) * 100, 100),
    v_snapshot_time,
    auth.uid()
  );
  v_count := v_count + 1;
  
  -- Calculate KPI 4: Píldoras Formativas
  SELECT COUNT(*) INTO v_pildoras_formativas
  FROM formaciones
  WHERE tipo = 'pildora_formativa' AND estado = 'completada';
  
  INSERT INTO kpi_history (kpi_id, label, value, target, percentage, calculated_at, created_by)
  VALUES (
    'pildoras_formativas',
    'Píldoras formativas',
    v_pildoras_formativas,
    6,
    LEAST((v_pildoras_formativas::NUMERIC / 6) * 100, 100),
    v_snapshot_time,
    auth.uid()
  );
  v_count := v_count + 1;
  
  -- Calculate KPI 5: Entidades Colaboradoras
  SELECT COUNT(*) INTO v_entidades_colaboradoras
  FROM colaboradores
  WHERE estado = 'activo' AND convenio_firmado = true;
  
  INSERT INTO kpi_history (kpi_id, label, value, target, percentage, calculated_at, created_by)
  VALUES (
    'entidades_colaboradoras',
    'Entidades colaboradoras',
    v_entidades_colaboradoras,
    8,
    LEAST((v_entidades_colaboradoras::NUMERIC / 8) * 100, 100),
    v_snapshot_time,
    auth.uid()
  );
  v_count := v_count + 1;
  
  -- Calculate KPI 6: Impactos de Difusión (using materials and dissemination_impacts)
  -- Count from dissemination_impacts with estado = 'completed'
  SELECT COUNT(*) INTO v_impactos_difusion
  FROM dissemination_impacts
  WHERE estado = 'completed';
  
  INSERT INTO kpi_history (kpi_id, label, value, target, percentage, calculated_at, created_by)
  VALUES (
    'impactos_difusion',
    'Impactos de difusión',
    v_impactos_difusion,
    15,
    LEAST((v_impactos_difusion::NUMERIC / 15) * 100, 100),
    v_snapshot_time,
    auth.uid()
  );
  v_count := v_count + 1;
  
  -- Calculate KPI 7: Material de Apoyo (using materials table)
  -- Count materials with estado = 'published' and tipo in educational categories
  SELECT COUNT(*) INTO v_material_apoyo
  FROM materials
  WHERE estado = 'published' 
    AND (tipo IN ('documento', 'guia', 'manual', 'presentacion') 
         OR formacion_ids IS NOT NULL AND array_length(formacion_ids, 1) > 0);
  
  INSERT INTO kpi_history (kpi_id, label, value, target, percentage, calculated_at, created_by)
  VALUES (
    'material_apoyo',
    'Material de apoyo',
    v_material_apoyo,
    5,
    LEAST((v_material_apoyo::NUMERIC / 5) * 100, 100),
    v_snapshot_time,
    auth.uid()
  );
  v_count := v_count + 1;
  
  -- KPI 8: Cuadro de Mando PowerBI - this is configuration-based, 
  -- so we'll snapshot it as 0 (not configured) by default
  -- Can be manually updated when PowerBI is configured
  v_powerbi_configured := 0;
  
  INSERT INTO kpi_history (kpi_id, label, value, target, percentage, calculated_at, created_by)
  VALUES (
    'cuadro_mando_powerbi',
    'Cuadro de mando PowerBI',
    v_powerbi_configured,
    1,
    (v_powerbi_configured::NUMERIC / 1) * 100,
    v_snapshot_time,
    auth.uid()
  );
  v_count := v_count + 1;
  
  -- Return summary
  RETURN QUERY SELECT v_count, v_snapshot_time;
END;
$$;

-- Grant execute permission to authenticated users with appropriate roles
GRANT EXECUTE ON FUNCTION public.snapshot_kpis() TO authenticated;

-- Add comment
COMMENT ON FUNCTION public.snapshot_kpis() IS 'Creates a snapshot of all current KPI values in the kpi_history table. Can be called manually or scheduled.';
COMMENT ON TABLE public.kpi_history IS 'Stores historical snapshots of KPI values for trend analysis and Power BI integration';
