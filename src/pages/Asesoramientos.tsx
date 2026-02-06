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
import { Plus, Search, ClipboardList, Loader2, Calendar, Building2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useNavigate, useSearchParams } from "react-router-dom";
import type { Database } from "@/integrations/supabase/types";

type Asesoramiento = Database["public"]["Tables"]["asesoramientos"]["Row"];
type Empresa = Database["public"]["Tables"]["empresas"]["Row"];
type EstadoAsesoramiento = Database["public"]["Enums"]["estado_asesoramiento"];

const estadoLabels: Record<EstadoAsesoramiento, string> = {
  programado: "Programado",
  en_curso: "En curso",
  completado: "Completado",
  cancelado: "Cancelado",
};

const estadoColors: Record<EstadoAsesoramiento, string> = {
  programado: "bg-info/10 text-info",
  en_curso: "bg-warning/10 text-warning",
  completado: "bg-success/10 text-success",
  cancelado: "bg-muted text-muted-foreground",
};

export default function Asesoramientos() {
  const [asesoramientos, setAsesoramientos] = useState<(Asesoramiento & { empresa?: Empresa })[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEstado, setFilterEstado] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { canWrite } = useUserRoles();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [formData, setFormData] = useState({
    empresa_id: "",
    fecha: "",
    hora_inicio: "",
    duracion_minutos: 60,
    tema: "",
    estado: "programado" as EstadoAsesoramiento,
  });

  const fetchData = async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    setLoading(true);

    // Fetch empresas for the dropdown
    const { data: empresasData } = await supabase
      .from("empresas")
      .select("*")
      .order("nombre");
    setEmpresas(empresasData || []);

    // Fetch Asesoramientos with filters
    let query = supabase
      .from("asesoramientos")
      .select("*, empresa:empresas(*)")
      .order("fecha", { ascending: false });

    const empresaIdParam = searchParams.get("empresa_id");
    if (empresaIdParam) {
      query = query.eq("empresa_id", empresaIdParam);
    }
    
    if (filterEstado && filterEstado !== "all") {
      query = query.eq("estado", filterEstado as EstadoAsesoramiento);
    }

    const { data, error } = await query;
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setAsesoramientos(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterEstado]);

  const filteredAsesoramientos = asesoramientos.filter((a) =>
    a.tema?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.empresa?.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !supabase) return;

    setSaving(true);
    const { error } = await supabase.from("asesoramientos").insert({
      empresa_id: formData.empresa_id,
      tecnico_id: user.id,
      fecha: formData.fecha,
      hora_inicio: formData.hora_inicio || null,
      duracion_minutos: formData.duracion_minutos,
      tema: formData.tema,
      estado: formData.estado,
      created_by: user.id,
    });

    if (error) {
      toast({ title: "Error al crear asesoramiento", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Asesoramiento creado", description: "El asesoramiento se ha programado correctamente." });
      setDialogOpen(false);
      setFormData({
        empresa_id: "",
        fecha: "",
        hora_inicio: "",
        duracion_minutos: 60,
        tema: "",
        estado: "programado",
      });
      fetchData();
    }
    setSaving(false);
  };

  if (!supabase) {
    return (
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Asesoramientos</h1>
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
          <h1 className="text-3xl font-bold tracking-tight">Asesoramientos</h1>
          <p className="text-muted-foreground">
            Gestión de sesiones de asesoramiento
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button disabled={!canWrite || empresas.length === 0}>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Asesoramiento
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Programar Asesoramiento</DialogTitle>
              <DialogDescription>
                Crea una nueva sesión de asesoramiento
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="empresa">Empresa *</Label>
                <Select
                  value={formData.empresa_id}
                  onValueChange={(v) => setFormData({ ...formData, empresa_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una empresa" />
                  </SelectTrigger>
                  <SelectContent>
                    {empresas.map((empresa) => (
                      <SelectItem key={empresa.id} value={empresa.id}>
                        {empresa.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fecha">Fecha *</Label>
                  <Input
                    id="fecha"
                    type="date"
                    value={formData.fecha}
                    onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hora">Hora</Label>
                  <Input
                    id="hora"
                    type="time"
                    value={formData.hora_inicio}
                    onChange={(e) => setFormData({ ...formData, hora_inicio: e.target.value })}
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
                    onChange={(e) => setFormData({ ...formData, duracion_minutos: parseInt(e.target.value) })}
                    min={15}
                    step={15}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estado">Estado</Label>
                  <Select
                    value={formData.estado}
                    onValueChange={(v) => setFormData({ ...formData, estado: v as EstadoAsesoramiento })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(estadoLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tema">Tema / Objetivo</Label>
                <Textarea
                  id="tema"
                  value={formData.tema}
                  onChange={(e) => setFormData({ ...formData, tema: e.target.value })}
                  rows={3}
                  placeholder="Describe el tema principal del asesoramiento..."
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={saving || !formData.empresa_id || !formData.fecha}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Programar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          {empresas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
              <Building2 className="h-12 w-12 text-muted-foreground" />
              <div>
                <p className="text-lg font-semibold text-muted-foreground">
                  No hay empresas registradas
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Para programar asesoramientos, primero debes registrar al menos una empresa
                </p>
              </div>
              <Button onClick={() => navigate("/empresas")}>
                <Building2 className="mr-2 h-4 w-4" />
                Ir a Empresas
              </Button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por tema o empresa..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
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
          )}
        </CardContent>
      </Card>

      {/* Tabla */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Listado de Asesoramientos
          </CardTitle>
          <CardDescription>
            {filteredAsesoramientos.length} asesoramientos encontrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredAsesoramientos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Calendar className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">No hay asesoramientos programados</p>
              <p className="text-sm text-muted-foreground">
                Programa el primer asesoramiento usando el botón "Nuevo Asesoramiento"
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Tema</TableHead>
                  <TableHead>Duración</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Informe</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAsesoramientos.map((asesoramiento) => (
                  <TableRow key={asesoramiento.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell>
                      {format(new Date(asesoramiento.fecha), "dd MMM yyyy", { locale: es })}
                      {asesoramiento.hora_inicio && (
                        <span className="ml-2 text-muted-foreground">
                          {asesoramiento.hora_inicio.slice(0, 5)}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      {asesoramiento.empresa?.nombre || "-"}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {asesoramiento.tema || "-"}
                    </TableCell>
                    <TableCell>{asesoramiento.duracion_minutos} min</TableCell>
                    <TableCell>
                      <Badge className={estadoColors[asesoramiento.estado]}>
                        {estadoLabels[asesoramiento.estado]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {asesoramiento.informe_generado ? (
                        <Badge className="bg-success/10 text-success">Generado</Badge>
                      ) : (
                        <Badge variant="outline">Pendiente</Badge>
                      )}
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
