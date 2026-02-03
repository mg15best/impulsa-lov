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
import { Plus, Search, FileText, Filter, Loader2 } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type Evidencia = Database["public"]["Tables"]["evidencias"]["Row"];
type TipoEvidencia = Database["public"]["Enums"]["tipo_evidencia"];

const tipoLabels: Record<TipoEvidencia, string> = {
  informe: "Informe",
  acta: "Acta",
  fotografia: "Fotografía",
  video: "Video",
  certificado: "Certificado",
  documento: "Documento",
  otro: "Otro",
};

const tipoColors: Record<TipoEvidencia, string> = {
  informe: "bg-info/10 text-info",
  acta: "bg-muted text-muted-foreground",
  fotografia: "bg-warning/10 text-warning",
  video: "bg-warning/10 text-warning",
  certificado: "bg-success/10 text-success",
  documento: "bg-muted text-muted-foreground",
  otro: "bg-muted text-muted-foreground",
};

export default function Evidencias() {
  const [evidencias, setEvidencias] = useState<Evidencia[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTipo, setFilterTipo] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { canWrite } = useUserRoles();

  const [formData, setFormData] = useState({
    titulo: "",
    tipo: "documento" as TipoEvidencia,
    descripcion: "",
    fecha: new Date().toISOString().split("T")[0],
    archivo_url: "",
    archivo_nombre: "",
    observaciones: "",
  });

  const fetchEvidencias = async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    setLoading(true);
    let query = supabase.from("evidencias").select("*").order("fecha", { ascending: false });

    if (filterTipo && filterTipo !== "all") {
      query = query.eq("tipo", filterTipo as TipoEvidencia);
    }

    const { data, error } = await query;
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setEvidencias(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEvidencias();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterTipo]);

  const filteredEvidencias = evidencias.filter((evidencia) =>
    evidencia.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    evidencia.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !supabase) return;

    setSaving(true);
    const { error } = await supabase.from("evidencias").insert({
      ...formData,
      created_by: user.id,
    });

    if (error) {
      toast({ title: "Error al crear evidencia", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Evidencia creada", description: "La evidencia se ha registrado correctamente." });
      setDialogOpen(false);
      setFormData({
        titulo: "",
        tipo: "documento",
        descripcion: "",
        fecha: new Date().toISOString().split("T")[0],
        archivo_url: "",
        archivo_nombre: "",
        observaciones: "",
      });
      fetchEvidencias();
    }
    setSaving(false);
  };

  if (!supabase) {
    return (
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Evidencias</h1>
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
          <h1 className="text-3xl font-bold tracking-tight">Evidencias</h1>
          <p className="text-muted-foreground">
            Sistema de documentación y justificación
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button disabled={!canWrite}>
              <Plus className="mr-2 h-4 w-4" />
              Nueva Evidencia
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Registrar Nueva Evidencia</DialogTitle>
              <DialogDescription>
                Completa los datos de la evidencia
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
                    onValueChange={(v) => setFormData({ ...formData, tipo: v as TipoEvidencia })}
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
                  <Label htmlFor="archivo_nombre">Nombre del Archivo</Label>
                  <Input
                    id="archivo_nombre"
                    value={formData.archivo_nombre}
                    onChange={(e) => setFormData({ ...formData, archivo_nombre: e.target.value })}
                    placeholder="documento.pdf"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="archivo_url">URL del Archivo</Label>
                <Input
                  id="archivo_url"
                  type="url"
                  value={formData.archivo_url}
                  onChange={(e) => setFormData({ ...formData, archivo_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea
                  id="descripcion"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  rows={3}
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
                  placeholder="Buscar por título o descripción..."
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
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Evidencias */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Listado de Evidencias
          </CardTitle>
          <CardDescription>
            {filteredEvidencias.length} evidencias encontradas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredEvidencias.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">No hay evidencias registradas</p>
              <p className="text-sm text-muted-foreground">
                Crea la primera evidencia usando el botón "Nueva Evidencia"
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Archivo</TableHead>
                  <TableHead>Descripción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEvidencias.map((evidencia) => (
                  <TableRow key={evidencia.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell className="font-medium">{evidencia.titulo}</TableCell>
                    <TableCell>
                      <Badge className={tipoColors[evidencia.tipo]}>
                        {tipoLabels[evidencia.tipo]}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(evidencia.fecha).toLocaleDateString()}</TableCell>
                    <TableCell>{evidencia.archivo_nombre || "-"}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {evidencia.descripcion || "-"}
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
