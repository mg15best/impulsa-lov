import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ShieldAlert, UserX, GitBranchPlus, AlertTriangle } from "lucide-react";

export interface OperationalHealthKPI {
  id: string;
  label: string;
  value: number;
  unit: string;
  numerator?: number | null;
  denominator?: number | null;
  icon: React.ElementType;
  color: string;
}

const iconMap: Record<string, { icon: React.ElementType; color: string }> = {
  invalid_transitions_rate: { icon: ShieldAlert, color: "text-destructive" },
  auto_tasks_without_owner_rate: { icon: UserX, color: "text-warning" },
  workflow_chain_lead_time_days: { icon: GitBranchPlus, color: "text-info" },
  company_state_discrepancy_rate: { icon: AlertTriangle, color: "text-orange-600" },
};

export function useOperationalHealthKPIs() {
  const [kpis, setKpis] = useState<OperationalHealthKPI[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    async function fetchOperationalHealth() {
      setIsLoading(true);
      const client = supabase as unknown as {
        from: (table: string) => { select: (columns: string) => Promise<{ data: unknown[] | null }> }
      };

      const { data } = await client
        .from("operational_health_kpis")
        .select("kpi_id, label, value, unit, numerator, denominator");

      const mapped = ((data || []) as Array<Record<string, unknown>>).map((row) => {
        const visual = iconMap[row.kpi_id] || { icon: ShieldAlert, color: "text-muted-foreground" };
        return {
          id: String(row.kpi_id || ""),
          label: String(row.label || ""),
          value: Number(row.value || 0),
          unit: String(row.unit || ""),
          numerator: typeof row.numerator === "number" ? row.numerator : null,
          denominator: typeof row.denominator === "number" ? row.denominator : null,
          icon: visual.icon,
          color: visual.color,
        } as OperationalHealthKPI;
      });

      setKpis(mapped);
      setIsLoading(false);
    }

    fetchOperationalHealth();
  }, []);

  return { kpis, isLoading };
}
