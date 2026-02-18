import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useUserRoles } from "@/hooks/useUserRoles";
import { useDataLoader, useLocalSearch } from "@/hooks/useDataLoader";
import { PermissionButton } from "@/components/PermissionButton";
import { EstadoSelector } from "@/components/EstadoSelector";
import { EventInvitesManager } from "@/components/EventInvitesManager";
import { EventAttendanceManager } from "@/components/EventAttendanceManager";
import { EventSurveysManager } from "@/components/EventSurveysManager";
import { Plus, Search, Calendar, Filter, Loader2, ArrowLeft } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";
import { normalizeOptionalDate, normalizeOptionalString } from "@/lib/payloadUtils";
import { safeInsertWithSchemaFallback } from "@/lib/supabaseInsert";
import { useCatalogLookup, resolveLabelFromLookup } from "@/hooks/useCatalog";
import { CatalogSelect } from "@/components/CatalogSelect";

type Evento = Database["public"]["Tables"]["eventos"]["Row"];
type TipoEvento = Database["public"]["Enums"]["tipo_evento"];
type EstadoEvento = Database["public"]["Enums"]["estado_evento"];

// Estado colors remain local as they're UI presentation logic, not catalog data
const estadoColors: Record<EstadoEvento, string> = {
  planificado: "bg-muted text-muted-foreground",
  confirmado: "bg-info/10 text-info",
  en_curso: "bg-warning/10 text-warning",
  completado: "bg-success/10 text-success",
  cancelado: "bg-destructive/10 text-destructive",
};

export default function Eventos() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTipo, setFilterTipo] = useState<string>("all");
  const [filterEstado, setFilterEstado] = useState<string>("all");
  const [selectedEvento, setSelectedEvento] = useState<Evento | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { canWrite } = useUserRoles();
  
  // Load catalog lookups for event types and statuses
  const { lookup: tipoLookup, isLoading: tipoLoading } = useCatalogLookup('event_types');
  const { lookup: estadoLookup, isLoading: estadoLoading } = useCatalogLookup('event_statuses');

  // Use the consolidated data loader hook
  const { data: eventos, loading, reload } = useDataLoader<Evento>(
    "eventos",
    (query) => {
      let filteredQuery = query.order("created_at", { ascending: false });
      
      if (filterTipo && filterTipo !== "all") {
        filteredQuery = filteredQuery.eq("tipo", filterTipo as TipoEvento);
      }
      if (filterEstado && filterEstado !== "all") {
        filteredQuery = filteredQuery.eq("estado", filterEstado as EstadoEvento);
      }
      
      return filteredQuery;
    },
    [filterTipo, filterEstado]
  );

  // Use local search hook for filtering
  const filteredEventos = useLocalSearch(
    eventos,
    searchTerm,
    (evento, term) =>
      evento.nombre.toLowerCase().includes(term) ||
      evento.ubicacion?.toLowerCase().includes(term)
  );

  const [formData, setFormData] = useState({
    nombre: "",
    tipo: "otro" as TipoEvento,
    estado: "planificado" as EstadoEvento,
    fecha: "",
    hora_inicio: "",
    fecha_fin: "",
    hora_fin: "",
    duracion_minutos: 120,
    formato: "",
    ubicacion: "",
    descripcion: "",
    objetivo: "",
    ponentes: "",
    asistentes_esperados: 0,
    notas_programa: "",
    notas_evidencia: "",
    observaciones: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !supabase) return;

    setSaving(true);
    const payload: Database["public"]["Tables"]["eventos"]["Insert"] = {
      ...formData,
      fecha: normalizeOptionalDate(formData.fecha),
      hora_inicio: normalizeOptionalString(formData.hora_inicio),
      fecha_fin: normalizeOptionalDate(formData.fecha_fin),
      hora_fin: normalizeOptionalString(formData.hora_fin),
      formato: normalizeOptionalString(formData.formato),
      ubicacion: normalizeOptionalString(formData.ubicacion),
      descripcion: normalizeOptionalString(formData.descripcion),
      objetivo: normalizeOptionalString(formData.objetivo),
      ponentes: normalizeOptionalString(formData.ponentes),
      notas_programa: normalizeOptionalString(formData.notas_programa),
      notas_evidencia: normalizeOptionalString(formData.notas_evidencia),
      observaciones: normalizeOptionalString(formData.observaciones),
      created_by: user.id,
    };

    const { error, removedColumns } = await safeInsertWithSchemaFallback({
      tableName: "eventos",
      payload,
      insertFn: async (currentPayload) => {
        const { error: insertError } = await supabase
          .from("eventos")
          .insert(currentPayload as Database["public"]["Tables"]["eventos"]["Insert"]);

        return { data: { success: true }, error: insertError };
      },
    });

    if (error) {
      const details = removedColumns.length > 0
        ? `Se omitieron campos no disponibles temporalmente: ${removedColumns.join(", ")}.`
        : "";

      toast({
        title: "Error al crear evento",
        description: `${error.message} ${details}`.trim(),
        variant: "destructive",
      });
    } else {
      toast({ title: "Evento creado", description: "El evento se ha registrado correctamente." });
      setDialogOpen(false);
      setFormData({
        nombre: "",
        tipo: "otro",
        estado: "planificado",
        fecha: "",
        hora_inicio: "",
        fecha_fin: "",
        hora_fin: "",
        duracion_minutos: 120,
        formato: "",
        ubicacion: "",
        descripcion: "",
        objetivo: "",
        ponentes: "",
        asistentes_esperados: 0,
        notas_programa: "",
        notas_evidencia: "",
        observaciones: "",
      });
      reload();
    }
    setSaving(false);
  };

  if (!supabase) {
    return (
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Eventos</h1>
        <p className="text-muted-foreground">
          Configura Supabase para habilitar esta vista.
        </p>
      </div>
    );
  }

  // If an evento is selected, show detail view with invites, attendance, and surveys
  if (selectedEvento) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => setSelectedEvento(null)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{selectedEvento.nombre}</h1>
            <p className="text-muted-foreground">
              {resolveLabelFromLookup(tipoLookup, selectedEvento.tipo)} · {selectedEvento.ubicacion || "Sin ubicación"}
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Detalles del Evento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label className="text-sm font-medium">Tipo</Label>
                <p className="text-sm text-muted-foreground">{resolveLabelFromLookup(tipoLookup, selectedEvento.tipo)}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Estado</Label>
                <Badge className={estadoColors[selectedEvento.estado]}>
                  {resolveLabelFromLookup(estadoLookup, selectedEvento.estado)}
                </Badge>
              </div>
              <div>
                <Label className="text-sm font-medium">Fecha</Label>
                <p className="text-sm text-muted-foreground">
                  {selectedEvento.fecha ? new Date(selectedEvento.fecha).toLocaleDateString() : "-"}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">Duración</Label>
                <p className="text-sm text-muted-foreground">{selectedEvento.duracion_minutos || 0} minutos</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Formato</Label>
                <p className="text-sm text-muted-foreground">{selectedEvento.formato || "-"}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Ubicación</Label>
                <p className="text-sm text-muted-foreground">{selectedEvento.ubicacion || "-"}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Ponentes</Label>
                <p className="text-sm text-muted-foreground">{selectedEvento.ponentes || "-"}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Asistentes Esperados</Label>
                <p className="text-sm text-muted-foreground">{selectedEvento.asistentes_esperados || 0}</p>
              </div>
            </div>
            {selectedEvento.objetivo && (
              <div>
                <Label className="text-sm font-medium">Objetivo</Label>
                <p className="text-sm text-muted-foreground">{selectedEvento.objetivo}</p>
              </div>
            )}
            {selectedEvento.descripcion && (
              <div>
                <Label className="text-sm font-medium">Descripción</Label>
                <p className="text-sm text-muted-foreground">{selectedEvento.descripcion}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <EventInvitesManager 
          eventoId={selectedEvento.id} 
          eventoNombre={selectedEvento.nombre}
        />

        <EventAttendanceManager 
          eventoId={selectedEvento.id} 
          eventoNombre={selectedEvento.nombre}
        />

        <EventSurveysManager 
          eventoId={selectedEvento.id} 
          eventoNombre={selectedEvento.nombre}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Eventos</h1>
          <p className="text-muted-foreground">
            Gestión de eventos del proyecto
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <PermissionButton action="create">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Evento
            </PermissionButton>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Registrar Nuevo Evento</DialogTitle>
              <DialogDescription>
                Completa los datos del evento
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre *</Label>
                  <Input
                    id="nombre"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipo</Label>
                  <CatalogSelect
                    catalogType="event_types"
                    value={formData.tipo}
                    onValueChange={(v) => setFormData({ ...formData, tipo: v as TipoEvento })}
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <EstadoSelector
                  entityType="eventos"
                  value={formData.estado}
                  onChange={(estado) => setFormData({ ...formData, estado })}
                  estadoLabels={Object.fromEntries(estadoLookup) as Record<EstadoEvento, string>}
                />
                <div className="space-y-2">
                  <Label htmlFor="formato">Formato</Label>
                  <Select
                    value={formData.formato}
                    onValueChange={(v) => setFormData({ ...formData, formato: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="presencial">Presencial</SelectItem>
                      <SelectItem value="online">Online</SelectItem>
                      <SelectItem value="hibrido">Híbrido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fecha">Fecha</Label>
                  <Input
                    id="fecha"
                    type="date"
                    value={formData.fecha}
                    onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hora_inicio">Hora de Inicio</Label>
                  <Input
                    id="hora_inicio"
                    type="time"
                    value={formData.hora_inicio}
                    onChange={(e) => setFormData({ ...formData, hora_inicio: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fecha_fin">Fecha Fin</Label>
                  <Input
                    id="fecha_fin"
                    type="date"
                    value={formData.fecha_fin}
                    onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hora_fin">Hora de Fin</Label>
                  <Input
                    id="hora_fin"
                    type="time"
                    value={formData.hora_fin}
                    onChange={(e) => setFormData({ ...formData, hora_fin: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="duracion">Duración (minutos)</Label>
                  <Input
                    id="duracion"
                    type="number"
                    value={formData.duracion_minutos}
                    onChange={(e) => setFormData({ ...formData, duracion_minutos: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="asistentes">Asistentes Esperados</Label>
                  <Input
                    id="asistentes"
                    type="number"
                    value={formData.asistentes_esperados}
                    onChange={(e) => setFormData({ ...formData, asistentes_esperados: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ubicacion">Ubicación o URL</Label>
                <Input
                  id="ubicacion"
                  value={formData.ubicacion}
                  onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ponentes">Ponentes</Label>
                <Input
                  id="ponentes"
                  value={formData.ponentes}
                  onChange={(e) => setFormData({ ...formData, ponentes: e.target.value })}
                  placeholder="Nombres separados por comas"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="objetivo">Objetivo</Label>
                <Textarea
                  id="objetivo"
                  value={formData.objetivo}
                  onChange={(e) => setFormData({ ...formData, objetivo: e.target.value })}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea
                  id="descripcion"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notas_programa">Notas del Programa</Label>
                <Textarea
                  id="notas_programa"
                  value={formData.notas_programa}
                  onChange={(e) => setFormData({ ...formData, notas_programa: e.target.value })}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notas_evidencia">Notas de Evidencia</Label>
                <Textarea
                  id="notas_evidencia"
                  value={formData.notas_evidencia}
                  onChange={(e) => setFormData({ ...formData, notas_evidencia: e.target.value })}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="observaciones">Observaciones</Label>
                <Textarea
                  id="observaciones"
                  value={formData.observaciones}
                  onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                  rows={2}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Guardar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre o ubicación..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={filterTipo} onValueChange={setFilterTipo}>
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                {Array.from(tipoLookup.entries()).map(([code, label]) => (
                  <SelectItem key={code} value={code}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterEstado} onValueChange={setFilterEstado}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                {Array.from(estadoLookup.entries()).map(([code, label]) => (
                  <SelectItem key={code} value={code}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Eventos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Listado de Eventos
          </CardTitle>
          <CardDescription>
            {filteredEventos.length} eventos encontrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredEventos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Calendar className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">No hay eventos registrados</p>
              <p className="text-sm text-muted-foreground">
                Crea el primer evento usando el botón "Nuevo Evento"
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Ubicación</TableHead>
                  <TableHead>Asistentes</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEventos.map((evento) => (
                  <TableRow 
                    key={evento.id} 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setSelectedEvento(evento)}
                  >
                    <TableCell className="font-medium">{evento.nombre}</TableCell>
                    <TableCell>{resolveLabelFromLookup(tipoLookup, evento.tipo)}</TableCell>
                    <TableCell>{evento.fecha ? new Date(evento.fecha).toLocaleDateString() : "-"}</TableCell>
                    <TableCell>{evento.ubicacion || "-"}</TableCell>
                    <TableCell>
                      {evento.asistentes_confirmados || 0} / {evento.asistentes_esperados || 0}
                    </TableCell>
                    <TableCell>
                      <Badge className={estadoColors[evento.estado]}>
                        {resolveLabelFromLookup(estadoLookup, evento.estado)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
