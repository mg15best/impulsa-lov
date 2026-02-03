import { useEffect, useState } from "react";
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
import { Plus, Search, GraduationCap, Filter, Loader2 } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type Formacion = Database["public"]["Tables"]["formaciones"]["Row"];
type TipoFormacion = Database["public"]["Enums"]["tipo_formacion"];
type EstadoFormacion = Database["public"]["Enums"]["estado_formacion"];

const tipoLabels: Record<TipoFormacion, string> = {
  pildora_formativa: "Píldora Formativa",
  curso: "Curso",
  masterclass: "Masterclass",
  webinar: "Webinar",
  otro: "Otro",
};

const estadoLabels: Record<EstadoFormacion, string> = {
  planificada: "Planificada",
  en_curso: "En curso",
  completada: "Completada",
  cancelada: "Cancelada",
};

const estadoColors: Record<EstadoFormacion, string> = {
  planificada: "bg-muted text-muted-foreground",
  en_curso: "bg-warning/10 text-warning",
  completada: "bg-success/10 text-success",
  cancelada: "bg-destructive/10 text-destructive",
};

export default function Formaciones() {
  const [formaciones, setFormaciones] = useState<Formacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTipo, setFilterTipo] = useState<string>("all");
  const [filterEstado, setFilterEstado] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { canWrite } = useUserRoles();

  const [formData, setFormData] = useState({
    titulo: "",
    tipo: "pildora_formativa" as TipoFormacion,
    estado: "planificada" as EstadoFormacion,
    fecha_inicio: "",
    fecha_fin: "",
    duracion_horas: 0,
    formador: "",
    descripcion: "",
    objetivos: "",
    participantes_max: 0,
    modalidad: "",
    ubicacion: "",
    observaciones: "",
  });

  const fetchFormaciones = async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    setLoading(true);
    let query = supabase.from("formaciones").select("*").order("created_at", { ascending: false });

    if (filterTipo && filterTipo !== "all") {
      query = query.eq("tipo", filterTipo as TipoFormacion);
    }
    if (filterEstado && filterEstado !== "all") {
      query = query.eq("estado", filterEstado as EstadoFormacion);
    }

    const { data, error } = await query;
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setFormaciones(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchFormaciones();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterTipo, filterEstado]);

  const filteredFormaciones = formaciones.filter((formacion) =>
    formacion.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    formacion.formador?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !supabase) return;

    setSaving(true);
    const { error } = await supabase.from("formaciones").insert({
      ...formData,
      created_by: user.id,
    });

    if (error) {
      toast({ title: "Error al crear formación", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Formación creada", description: "La formación se ha registrado correctamente." });
      setDialogOpen(false);
      setFormData({
        titulo: "",
        tipo: "pildora_formativa",
        estado: "planificada",
        fecha_inicio: "",
        fecha_fin: "",
        duracion_horas: 0,
        formador: "",
        descripcion: "",
        objetivos: "",
        participantes_max: 0,
        modalidad: "",
        ubicacion: "",
        observaciones: "",
      });
      fetchFormaciones();
    }
    setSaving(false);
  };

  if (!supabase) {
    return (
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Formaciones</h1>
        <p className="text-muted-foreground">
          Configura Supabase para habilitar esta vista.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Formaciones</h1>
          <p className="text-muted-foreground">
            Píldoras formativas del proyecto
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button disabled={!canWrite}>
              <Plus className="mr-2 h-4 w-4" />
              Nueva Formación
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Registrar Nueva Formación</DialogTitle>
              <DialogDescription>
                Completa los datos de la formación
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="titulo">Título *</Label>
                  <Input
                    id="titulo"
                    value={formData.titulo}
                    onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipo</Label>
                  <Select
                    value={formData.tipo}
                    onValueChange={(v) => setFormData({ ...formData, tipo: v as TipoFormacion })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(tipoLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fecha_inicio">Fecha Inicio</Label>
                  <Input
                    id="fecha_inicio"
                    type="date"
                    value={formData.fecha_inicio}
                    onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fecha_fin">Fecha Fin</Label>
                  <Input
                    id="fecha_fin"
                    type="date"
                    value={formData.fecha_fin}
                    onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="duracion">Duración (horas)</Label>
                  <Input
                    id="duracion"
                    type="number"
                    value={formData.duracion_horas}
                    onChange={(e) => setFormData({ ...formData, duracion_horas: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="participantes_max">Participantes Máx.</Label>
                  <Input
                    id="participantes_max"
                    type="number"
                    value={formData.participantes_max}
                    onChange={(e) => setFormData({ ...formData, participantes_max: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="formador">Formador</Label>
                  <Input
                    id="formador"
                    value={formData.formador}
                    onChange={(e) => setFormData({ ...formData, formador: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="modalidad">Modalidad</Label>
                  <Select
                    value={formData.modalidad}
                    onValueChange={(v) => setFormData({ ...formData, modalidad: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="presencial">Presencial</SelectItem>
                      <SelectItem value="online">Online</SelectItem>
                      <SelectItem value="hibrida">Híbrida</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ubicacion">Ubicación</Label>
                <Input
                  id="ubicacion"
                  value={formData.ubicacion}
                  onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })}
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
                <Label htmlFor="objetivos">Objetivos</Label>
                <Textarea
                  id="objetivos"
                  value={formData.objetivos}
                  onChange={(e) => setFormData({ ...formData, objetivos: e.target.value })}
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
                  placeholder="Buscar por título o formador..."
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
                {Object.entries(tipoLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
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
                {Object.entries(estadoLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Formaciones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Listado de Formaciones
          </CardTitle>
          <CardDescription>
            {filteredFormaciones.length} formaciones encontradas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredFormaciones.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <GraduationCap className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">No hay formaciones registradas</p>
              <p className="text-sm text-muted-foreground">
                Crea la primera formación usando el botón "Nueva Formación"
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Fecha Inicio</TableHead>
                  <TableHead>Duración</TableHead>
                  <TableHead>Participantes</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFormaciones.map((formacion) => (
                  <TableRow key={formacion.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell className="font-medium">{formacion.titulo}</TableCell>
                    <TableCell>{tipoLabels[formacion.tipo]}</TableCell>
                    <TableCell>
                      {formacion.fecha_inicio ? new Date(formacion.fecha_inicio).toLocaleDateString() : "-"}
                    </TableCell>
                    <TableCell>{formacion.duracion_horas || 0}h</TableCell>
                    <TableCell>
                      {formacion.participantes_inscritos || 0} / {formacion.participantes_max || 0}
                    </TableCell>
                    <TableCell>
                      <Badge className={estadoColors[formacion.estado]}>
                        {estadoLabels[formacion.estado]}
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
