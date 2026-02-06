import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useUserRoles } from "@/hooks/useUserRoles";
import { Search, Loader2, Calendar, GraduationCap, FileText, ClipboardList } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Link } from "react-router-dom";
import type { Database } from "@/integrations/supabase/types";

type Evento = Database["public"]["Tables"]["eventos"]["Row"];
type Formacion = Database["public"]["Tables"]["formaciones"]["Row"];
type Evidencia = Database["public"]["Tables"]["evidencias"]["Row"];
type Asesoramiento = Database["public"]["Tables"]["asesoramientos"]["Row"];

type ActivityType = "evento" | "formacion" | "evidencia" | "asesoramiento";

interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  date: string;
  summary: string;
  relatedEntity?: string;
  detailUrl: string;
  rawData: Evento | Formacion | Evidencia | Asesoramiento;
}

const activityTypeLabels: Record<ActivityType, string> = {
  evento: "Evento",
  formacion: "Formación",
  evidencia: "Evidencia",
  asesoramiento: "Asesoramiento",
};

const activityTypeIcons: Record<ActivityType, any> = {
  evento: Calendar,
  formacion: GraduationCap,
  evidencia: FileText,
  asesoramiento: ClipboardList,
};

const activityTypeColors: Record<ActivityType, string> = {
  evento: "bg-blue-100 text-blue-800",
  formacion: "bg-green-100 text-green-800",
  evidencia: "bg-purple-100 text-purple-800",
  asesoramiento: "bg-orange-100 text-orange-800",
};

export default function Actividades() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const { toast } = useToast();
  const { user } = useAuth();
  const { canRead } = useUserRoles();

  const fetchActivities = async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      // Fetch all activity types in parallel
      const [eventosResult, formacionesResult, evidenciasResult, asesoramientosResult] = await Promise.all([
        supabase.from("eventos").select("*").order("fecha", { ascending: false }),
        supabase.from("formaciones").select("*").order("fecha_inicio", { ascending: false }),
        supabase.from("evidencias").select("*, empresa:empresas(nombre), evento:eventos(nombre), formacion:formaciones(titulo), asesoramiento:asesoramientos(tema)").order("fecha", { ascending: false }),
        supabase.from("asesoramientos").select("*, empresa:empresas(nombre)").order("fecha", { ascending: false }),
      ]);

      const items: ActivityItem[] = [];

      // Process Eventos
      if (eventosResult.data) {
        eventosResult.data.forEach((evento: Evento) => {
          items.push({
            id: evento.id,
            type: "evento",
            title: evento.nombre,
            date: evento.fecha || evento.created_at,
            summary: evento.descripcion || evento.objetivo || "Sin descripción",
            relatedEntity: evento.ubicacion || undefined,
            detailUrl: `/eventos`,
            rawData: evento,
          });
        });
      }

      // Process Formaciones
      if (formacionesResult.data) {
        formacionesResult.data.forEach((formacion: Formacion) => {
          items.push({
            id: formacion.id,
            type: "formacion",
            title: formacion.titulo,
            date: formacion.fecha_inicio || formacion.created_at,
            summary: formacion.descripcion || formacion.objetivos || "Sin descripción",
            relatedEntity: formacion.formador || undefined,
            detailUrl: `/formaciones`,
            rawData: formacion,
          });
        });
      }

      // Process Evidencias
      if (evidenciasResult.data) {
        evidenciasResult.data.forEach((evidencia: any) => {
          let relatedEntity = evidencia.empresa?.nombre;
          if (evidencia.evento) {
            relatedEntity = `Evento: ${evidencia.evento.nombre}`;
          } else if (evidencia.formacion) {
            relatedEntity = `Formación: ${evidencia.formacion.titulo}`;
          } else if (evidencia.asesoramiento) {
            relatedEntity = `Asesoramiento: ${evidencia.asesoramiento.tema}`;
          }

          items.push({
            id: evidencia.id,
            type: "evidencia",
            title: evidencia.titulo,
            date: evidencia.fecha,
            summary: evidencia.descripcion || "Sin descripción",
            relatedEntity,
            detailUrl: `/evidencias`,
            rawData: evidencia,
          });
        });
      }

      // Process Asesoramientos
      if (asesoramientosResult.data) {
        asesoramientosResult.data.forEach((asesoramiento: any) => {
          items.push({
            id: asesoramiento.id,
            type: "asesoramiento",
            title: asesoramiento.tema || "Asesoramiento sin título",
            date: asesoramiento.fecha,
            summary: asesoramiento.acta || "Sin descripción",
            relatedEntity: asesoramiento.empresa?.nombre || undefined,
            detailUrl: `/asesoramientos`,
            rawData: asesoramiento,
          });
        });
      }

      // Sort all items by date (most recent first)
      items.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateB.getTime() - dateA.getTime();
      });

      setActivities(items);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  // Filter activities based on search term, type, and date range
  const filteredActivities = activities.filter((activity) => {
    // Search filter
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      activity.title.toLowerCase().includes(searchLower) ||
      activity.summary.toLowerCase().includes(searchLower) ||
      (activity.relatedEntity?.toLowerCase().includes(searchLower) ?? false);

    // Type filter
    const matchesType = filterType === "all" || activity.type === filterType;

    // Date range filter
    let matchesDateRange = true;
    const activityDate = new Date(activity.date);
    
    if (filterDateFrom) {
      const dateFrom = new Date(filterDateFrom);
      matchesDateRange = matchesDateRange && activityDate >= dateFrom;
    }
    
    if (filterDateTo) {
      const dateTo = new Date(filterDateTo);
      dateTo.setHours(23, 59, 59, 999); // Include the entire end date
      matchesDateRange = matchesDateRange && activityDate <= dateTo;
    }

    return matchesSearch && matchesType && matchesDateRange;
  });

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd MMM yyyy", { locale: es });
    } catch {
      return dateString;
    }
  };

  if (!canRead && supabase) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Actividades</CardTitle>
          <CardDescription>No tienes permisos para ver las actividades</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Actividades</CardTitle>
            <CardDescription>
              Vista agregada de eventos, formaciones, evidencias y asesoramientos
            </CardDescription>
          </div>
        </div>
        <div className="flex flex-col gap-4 mt-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar actividades..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Tipo de actividad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="evento">Eventos</SelectItem>
                <SelectItem value="formacion">Formaciones</SelectItem>
                <SelectItem value="evidencia">Evidencias</SelectItem>
                <SelectItem value="asesoramiento">Asesoramientos</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex-1">
              <Label className="text-sm text-muted-foreground mb-2">Fecha desde</Label>
              <Input
                type="date"
                value={filterDateFrom}
                onChange={(e) => setFilterDateFrom(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <Label className="text-sm text-muted-foreground mb-2">Fecha hasta</Label>
              <Input
                type="date"
                value={filterDateTo}
                onChange={(e) => setFilterDateTo(e.target.value)}
              />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredActivities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No se encontraron actividades
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">Tipo</TableHead>
                <TableHead className="w-[150px]">Fecha</TableHead>
                <TableHead>Título</TableHead>
                <TableHead className="hidden md:table-cell">Resumen</TableHead>
                <TableHead className="hidden lg:table-cell">Entidad relacionada</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredActivities.map((activity) => {
                const Icon = activityTypeIcons[activity.type];
                return (
                  <TableRow key={`${activity.type}-${activity.id}`}>
                    <TableCell>
                      <Badge className={activityTypeColors[activity.type]}>
                        <Icon className="h-3 w-3 mr-1" />
                        {activityTypeLabels[activity.type]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(activity.date)}
                    </TableCell>
                    <TableCell className="font-medium">
                      <Link
                        to={activity.detailUrl}
                        className="hover:underline text-primary"
                      >
                        {activity.title}
                      </Link>
                    </TableCell>
                    <TableCell className="hidden md:table-cell max-w-md truncate text-sm">
                      {activity.summary}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                      {activity.relatedEntity || "-"}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
