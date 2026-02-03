import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { Building2, FileText, Calendar, GraduationCap, Handshake, Megaphone, TrendingUp, Users, BookOpen, BarChart3 } from "lucide-react";

interface KPI {
  label: string;
  value: number;
  target: number;
  icon: React.ElementType;
  color: string;
}

export default function Dashboard() {
  const [kpis, setKpis] = useState<KPI[]>([
    { label: "Empresas asesoradas", value: 0, target: 20, icon: Building2, color: "text-primary" },
    { label: "Informes generados", value: 0, target: 15, icon: FileText, color: "text-info" },
    { label: "Eventos realizados", value: 0, target: 2, icon: Calendar, color: "text-warning" },
    { label: "Píldoras formativas", value: 0, target: 6, icon: GraduationCap, color: "text-success" },
    { label: "Entidades colaboradoras", value: 0, target: 8, icon: Handshake, color: "text-accent-foreground" },
    { label: "Impactos de difusión", value: 0, target: 15, icon: Megaphone, color: "text-destructive" },
    { label: "Material de apoyo", value: 0, target: 5, icon: BookOpen, color: "text-primary" },
    { label: "Cuadro de mando PowerBI", value: 0, target: 1, icon: BarChart3, color: "text-info" },
  ]);

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
      // Fetch empresas count
      const { count: totalEmpresas } = await supabase
        .from("empresas")
        .select("*", { count: "exact", head: true });

      const { count: empresasAsesoradas } = await supabase
        .from("empresas")
        .select("*", { count: "exact", head: true })
        .in("estado", ["asesorada", "completada"]);

      const { count: empresasEnProceso } = await supabase
        .from("empresas")
        .select("*", { count: "exact", head: true })
        .eq("estado", "en_proceso");

      // Fetch asesoramientos
      const { count: totalAsesoramientos } = await supabase
        .from("asesoramientos")
        .select("*", { count: "exact", head: true });

      const { count: asesoramientosCompletados } = await supabase
        .from("asesoramientos")
        .select("*", { count: "exact", head: true })
        .eq("estado", "completado");

      const { count: informesGenerados } = await supabase
        .from("asesoramientos")
        .select("*", { count: "exact", head: true })
        .eq("informe_generado", true);

      setStats({
        totalEmpresas: totalEmpresas || 0,
        empresasEnProceso: empresasEnProceso || 0,
        totalAsesoramientos: totalAsesoramientos || 0,
        asesoramientosCompletados: asesoramientosCompletados || 0,
      });

      setKpis((prev) =>
        prev.map((kpi) => {
          if (kpi.label === "Empresas asesoradas") {
            return { ...kpi, value: empresasAsesoradas || 0 };
          }
          if (kpi.label === "Informes generados") {
            return { ...kpi, value: informesGenerados || 0 };
          }
          return kpi;
        })
      );
    }

    fetchStats();
  }, []);

  if (!supabase) {
    return (
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Configura Supabase para habilitar los indicadores.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
          {kpis.map((kpi) => {
            const percentage = Math.min((kpi.value / kpi.target) * 100, 100);
            const Icon = kpi.icon;
            
            return (
              <Card key={kpi.label}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">{kpi.label}</CardTitle>
                  <Icon className={`h-5 w-5 ${kpi.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {kpi.value} / {kpi.target}
                  </div>
                  <Progress value={percentage} className="mt-2" />
                  <p className="mt-1 text-xs text-muted-foreground">
                    {percentage.toFixed(0)}% completado
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
