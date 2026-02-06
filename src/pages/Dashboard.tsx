import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { Building2, FileText, TrendingUp, Users } from "lucide-react";
import { FemeteImpulsaBanner } from "@/components/FemeteImpulsaBanner";
import { useKPICalculations } from "@/hooks/useKPICalculations";

/**
 * Dashboard Principal - Impulsa LOV
 * 
 * Este componente muestra los KPIs principales del sistema según las definiciones
 * del contrato funcional PR-0 (docs/DEFINICION_KPIS.md)
 * 
 * Los KPIs se calculan utilizando el hook useKPICalculations que implementa
 * las fórmulas documentadas en docs/DEFINICION_KPIS.md
 */
export default function Dashboard() {
  // Cargar KPIs usando hook centralizado
  // Los KPIs están definidos en src/config/kpis.ts y calculados en src/hooks/useKPICalculations.ts
  const { kpiValues, isLoading: kpisLoading } = useKPICalculations();

  const [stats, setStats] = useState({
    totalEmpresas: 0,
    empresasEnProceso: 0,
    totalAsesoramientos: 0,
    asesoramientosCompletados: 0,
  });

  useEffect(() => {
    if (!supabase) {
      return;
    }

    async function fetchStats() {
      // Estadísticas operativas adicionales (no son KPIs principales)
      const { count: totalEmpresas } = await supabase
        .from("empresas")
        .select("*", { count: "exact", head: true });

      const { count: empresasEnProceso } = await supabase
        .from("empresas")
        .select("*", { count: "exact", head: true })
        .eq("estado", "en_proceso");

      const { count: totalAsesoramientos } = await supabase
        .from("asesoramientos")
        .select("*", { count: "exact", head: true });

      const { count: asesoramientosCompletados } = await supabase
        .from("asesoramientos")
        .select("*", { count: "exact", head: true })
        .eq("estado", "completado");

      setStats({
        totalEmpresas: totalEmpresas || 0,
        empresasEnProceso: empresasEnProceso || 0,
        totalAsesoramientos: totalAsesoramientos || 0,
        asesoramientosCompletados: asesoramientosCompletados || 0,
      });
    }

    fetchStats();
  }, []);

  if (!supabase) {
    return (
      <div className="space-y-6">
        <FemeteImpulsaBanner />
        
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Configura Supabase para habilitar los indicadores.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <FemeteImpulsaBanner />
      
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Panel de control del proyecto FEMETE IMPULSA
        </p>
      </div>

      {/* KPIs STARS */}
      <div>
        <h2 className="mb-4 text-lg font-semibold">Indicadores STARS</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {kpiValues.map((kpi) => {
            const Icon = kpi.icon;
            
            return (
              <Card key={kpi.id}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">{kpi.label}</CardTitle>
                  <Icon className={`h-5 w-5 ${kpi.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {kpi.value} / {kpi.target}
                  </div>
                  <Progress value={kpi.percentage} className="mt-2" />
                  <p className="mt-1 text-xs text-muted-foreground">
                    {kpi.percentage.toFixed(0)}% completado
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Estadísticas Operativas */}
      <div>
        <h2 className="mb-4 text-lg font-semibold">Estadísticas Operativas</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Empresas</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalEmpresas}</div>
              <p className="text-xs text-muted-foreground">
                Empresas registradas
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">En Proceso</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.empresasEnProceso}</div>
              <p className="text-xs text-muted-foreground">
                Empresas activas
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Asesoramientos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalAsesoramientos}</div>
              <p className="text-xs text-muted-foreground">
                Total realizados
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Completados</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.asesoramientosCompletados}</div>
              <p className="text-xs text-muted-foreground">
                Asesoramientos cerrados
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
