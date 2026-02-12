import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { Building2, CheckSquare, Clock3, FileText, ListChecks, TrendingUp, Users } from "lucide-react";
import { FemeteImpulsaBanner } from "@/components/FemeteImpulsaBanner";
import { useKPICalculations } from "@/hooks/useKPICalculations";
import type { Database } from "@/integrations/supabase/types";

type Task = Database["public"]["Tables"]["tasks"]["Row"];

type TaskKPIs = {
  pending: number;
  overdue: number;
  completed: number;
};

type TechnicianTaskSummary = {
  id: string;
  name: string;
  total: number;
  completed: number;
  pending: number;
  overdue: number;
};

function formatLocalDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

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
  const { 
    kpiValues, 
    strategicKpiValues, 
    impactKpiValues, 
    isLoading: kpisLoading 
  } = useKPICalculations();

  const [stats, setStats] = useState({
    totalEmpresas: 0,
    empresasEnProceso: 0,
    totalAsesoramientos: 0,
    asesoramientosCompletados: 0,
  });
  const [taskKPIs, setTaskKPIs] = useState<TaskKPIs>({
    pending: 0,
    overdue: 0,
    completed: 0,
  });
  const [technicianTaskSummary, setTechnicianTaskSummary] = useState<TechnicianTaskSummary[]>([]);

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

      const { data: taskRows } = await supabase
        .from("tasks")
        .select("estado, fecha_vencimiento, responsable_id");

      const todayDate = formatLocalDate(new Date());
      const pendingStatuses = new Set(["pending", "in_progress", "on_hold"]);
      const tasksData = (taskRows || []) as Pick<Task, "estado" | "fecha_vencimiento" | "responsable_id">[];

      const pending = tasksData.filter((task) => pendingStatuses.has(task.estado)).length;
      const overdue = tasksData.filter(
        (task) =>
          pendingStatuses.has(task.estado) &&
          Boolean(task.fecha_vencimiento) &&
          task.fecha_vencimiento < todayDate,
      ).length;
      const completed = tasksData.filter((task) => task.estado === "completed").length;

      setTaskKPIs({ pending, overdue, completed });

      const groupedByTechnician = new Map<string, TechnicianTaskSummary>();

      tasksData.forEach((task) => {
        if (!task.responsable_id) {
          return;
        }

        const current = groupedByTechnician.get(task.responsable_id) || {
          id: task.responsable_id,
          name: "Sin nombre",
          total: 0,
          completed: 0,
          pending: 0,
          overdue: 0,
        };

        current.total += 1;

        if (task.estado === "completed") {
          current.completed += 1;
        }

        if (pendingStatuses.has(task.estado)) {
          current.pending += 1;
          if (task.fecha_vencimiento && task.fecha_vencimiento < todayDate) {
            current.overdue += 1;
          }
        }

        groupedByTechnician.set(task.responsable_id, current);
      });

      const technicianIds = Array.from(groupedByTechnician.keys());

      if (technicianIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name, email")
          .in("id", technicianIds);

        const profileMap = new Map((profiles || []).map((profile) => [profile.id, profile]));

        const summary = Array.from(groupedByTechnician.values())
          .map((row) => ({
            ...row,
            name:
              profileMap.get(row.id)?.full_name ||
              profileMap.get(row.id)?.email ||
              "Técnico sin nombre",
          }))
          .sort((a, b) => b.completed - a.completed);

        setTechnicianTaskSummary(summary);
      } else {
        setTechnicianTaskSummary([]);
      }
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

      {/* Dashboard de Tareas + KPIs de ejecución */}
      <div>
        <h2 className="mb-4 text-lg font-semibold">Dashboard de tareas + KPIs de ejecución</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Seguimiento operativo interno (este panel no sustituye los KPIs estratégicos del proyecto).
        </p>

        <div className="mb-4 grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Tareas pendientes</CardTitle>
              <ListChecks className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{taskKPIs.pending}</div>
              <p className="text-xs text-muted-foreground">Incluye en curso y en espera</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Tareas vencidas</CardTitle>
              <Clock3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{taskKPIs.overdue}</div>
              <p className="text-xs text-muted-foreground">Pendientes con fecha ya superada</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Tareas completadas</CardTitle>
              <CheckSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{taskKPIs.completed}</div>
              <p className="text-xs text-muted-foreground">Cierre operativo acumulado</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Completadas por técnico</CardTitle>
          </CardHeader>
          <CardContent>
            {technicianTaskSummary.length === 0 ? (
              <p className="text-sm text-muted-foreground">No hay tareas asignadas a técnicos todavía.</p>
            ) : (
              <div className="space-y-3">
                {technicianTaskSummary.map((technician) => {
                  const completionRate = technician.total > 0
                    ? (technician.completed / technician.total) * 100
                    : 0;

                  return (
                    <div key={technician.id} className="space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium">{technician.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {technician.completed} completadas · {technician.pending} pendientes · {technician.overdue} vencidas
                        </p>
                      </div>
                      <Progress value={completionRate} />
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* KPIs Estratégicos */}
      <div>
        <h2 className="mb-4 text-lg font-semibold">KPIs Estratégicos</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {strategicKpiValues.map((kpi) => {
            const Icon = kpi.icon;
            
            return (
              <Card key={kpi.id}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">{kpi.label}</CardTitle>
                  <Icon className={`h-5 w-5 ${kpi.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {kpi.value.toFixed(1)}{kpi.unit ? ` ${kpi.unit}` : ''}
                  </div>
                  <Progress value={kpi.percentage} className="mt-2" />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Meta: {kpi.target}{kpi.unit ? ` ${kpi.unit}` : ''}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* KPIs de Impacto */}
      <div>
        <h2 className="mb-4 text-lg font-semibold">KPIs de Impacto</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {impactKpiValues.map((kpi) => {
            const Icon = kpi.icon;
            
            return (
              <Card key={kpi.id}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">{kpi.label}</CardTitle>
                  <Icon className={`h-5 w-5 ${kpi.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {kpi.unit === '%' ? kpi.value.toFixed(1) : kpi.value.toFixed(0)}{kpi.unit ? ` ${kpi.unit}` : ''}
                  </div>
                  <Progress value={kpi.percentage} className="mt-2" />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Meta: {kpi.target}{kpi.unit ? ` ${kpi.unit}` : ''}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
