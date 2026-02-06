import { useState, useEffect } from "react";
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
import { Plus, Search, FileText, Filter, Loader2, AlertCircle } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type Evidencia = Database["public"]["Tables"]["evidencias"]["Row"];
type TipoEvidencia = Database["public"]["Enums"]["tipo_evidencia"];
type Empresa = Database["public"]["Tables"]["empresas"]["Row"];
type Evento = Database["public"]["Tables"]["eventos"]["Row"];
type Formacion = Database["public"]["Tables"]["formaciones"]["Row"];
type Asesoramiento = Database["public"]["Tables"]["asesoramientos"]["Row"];

type EvidenciaWithRelations = Evidencia & {
  empresa?: { nombre: string } | null;
  evento?: { nombre: string } | null;
  formacion?: { titulo: string } | null;
  asesoramiento?: { tema: string | null } | null;
};

type AsesoramientoWithEmpresa = Asesoramiento & {
  empresa?: { nombre: string } | null;
};

// Helper to convert empty strings to null
const toNullIfEmpty = (value: string): string | null => {
  return value === "" ? null : value;
};

// Helper function to get origin display text
const getOrigenDisplay = (evidencia: EvidenciaWithRelations): string => {
  const origenes: string[] = [];
  
  if (evidencia.empresa) {
    origenes.push(evidencia.empresa.nombre);
  }
  if (evidencia.evento) {
    origenes.push(`Evento: ${evidencia.evento.nombre}`);
  }
  if (evidencia.formacion) {
    origenes.push(`Formación: ${evidencia.formacion.titulo}`);
  }
  if (evidencia.asesoramiento) {
    origenes.push(`Asesoramiento: ${evidencia.asesoramiento.tema || "Sin tema"}`);
  }
  
  return origenes.length > 0 ? origenes.join(", ") : "Sin origen vinculado";
};

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
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTipo, setFilterTipo] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [formaciones, setFormaciones] = useState<Formacion[]>([]);
  const [asesoramientos, setAsesoramientos] = useState<AsesoramientoWithEmpresa[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const { canWrite } = useUserRoles();

  // Use the consolidated data loader hook with relations
  const { data: evidencias, loading, reload } = useDataLoader<EvidenciaWithRelations>(
    "evidencias",
    (query) => {
      let filteredQuery = query
        .select("*, empresa:empresas(nombre), evento:eventos(nombre), formacion:formaciones(titulo), asesoramiento:asesoramientos(tema)")
        .order("fecha", { ascending: false });
      
      if (filterTipo && filterTipo !== "all") {
        filteredQuery = filteredQuery.eq("tipo", filterTipo as TipoEvidencia);
      }
      
      return filteredQuery;
    },
    [filterTipo]
  );

  // Load related entities for selectors
  useEffect(() => {
    const loadRelatedEntities = async () => {
      if (!supabase) return;

      const [empresasResult, eventosResult, formacionesResult, asesoramientosResult] = await Promise.all([
        supabase.from("empresas").select("id, nombre").order("nombre"),
        supabase.from("eventos").select("id, nombre").order("nombre"),
        supabase.from("formaciones").select("id, titulo").order("titulo"),
        supabase.from("asesoramientos").select("id, tema, fecha, empresa:empresas(nombre)").order("fecha", { ascending: false }),
      ]);

      if (empresasResult.data) setEmpresas(empresasResult.data);
      if (eventosResult.data) setEventos(eventosResult.data);
      if (formacionesResult.data) setFormaciones(formacionesResult.data);
      if (asesoramientosResult.data) setAsesoramientos(asesoramientosResult.data);
    };

    loadRelatedEntities();
  }, []);

  // Use local search hook for filtering
  const filteredEvidencias = useLocalSearch(
    evidencias,
    searchTerm,
    (evidencia, term) =>
      evidencia.titulo.toLowerCase().includes(term) ||
      evidencia.descripcion?.toLowerCase().includes(term)
  );

  const [formData, setFormData] = useState({
    titulo: "",
    tipo: "documento" as TipoEvidencia,
    descripcion: "",
    fecha: new Date().toISOString().split("T")[0],
    archivo_url: "",
    archivo_nombre: "",
    observaciones: "",
    empresa_id: "",
    evento_id: "",
    formacion_id: "",
    asesoramiento_id: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !supabase) return;

    // Validation: at least one relationship must be selected
    const hasRelationship = formData.empresa_id || formData.evento_id || formData.formacion_id || formData.asesoramiento_id;
    
    if (!hasRelationship) {
      setValidationError("Debe vincular la evidencia al menos a una entidad (empresa, evento, formación o asesoramiento)");
      return;
    }

    setValidationError(null);
    setSaving(true);
    
    // Prepare data - convert empty strings to null for foreign keys
    const dataToInsert = {
      titulo: formData.titulo,
      tipo: formData.tipo,
      descripcion: toNullIfEmpty(formData.descripcion),
      fecha: formData.fecha,
      archivo_url: toNullIfEmpty(formData.archivo_url),
      archivo_nombre: toNullIfEmpty(formData.archivo_nombre),
      observaciones: toNullIfEmpty(formData.observaciones),
      empresa_id: toNullIfEmpty(formData.empresa_id),
      evento_id: toNullIfEmpty(formData.evento_id),
      formacion_id: toNullIfEmpty(formData.formacion_id),
      asesoramiento_id: toNullIfEmpty(formData.asesoramiento_id),
      created_by: user.id,
    };

    const { error } = await supabase.from("evidencias").insert(dataToInsert);

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
        empresa_id: "",
        evento_id: "",
        formacion_id: "",
        asesoramiento_id: "",
      });
      setValidationError(null);
      reload();
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
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setValidationError(null);
          }
        }}>
          <DialogTrigger asChild>
            <PermissionButton action="create">
              <Plus className="mr-2 h-4 w-4" />
              Nueva Evidencia
            </PermissionButton>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Registrar Nueva Evidencia</DialogTitle>
              <DialogDescription>
                Completa los datos de la evidencia
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {validationError && (
                <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  <p>{validationError}</p>
                </div>
              )}
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
              
              {/* Origin/Relationship Section */}
              <div className="space-y-4 rounded-md border p-4">
                <div className="space-y-2">
                  <Label className="text-base font-semibold">Vinculación de la Evidencia *</Label>
                  <p className="text-sm text-muted-foreground">
                    Seleccione al menos una entidad a la que esté vinculada esta evidencia
                  </p>
                </div>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="empresa_id">Empresa</Label>
                    <Select
                      value={formData.empresa_id}
                      onValueChange={(v) => setFormData({ ...formData, empresa_id: v })}
                    >
                      <SelectTrigger id="empresa_id">
                        <SelectValue placeholder="Seleccionar empresa..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Sin empresa</SelectItem>
                        {empresas.map((empresa) => (
                          <SelectItem key={empresa.id} value={empresa.id}>
                            {empresa.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="evento_id">Evento</Label>
                    <Select
                      value={formData.evento_id}
                      onValueChange={(v) => setFormData({ ...formData, evento_id: v })}
                    >
                      <SelectTrigger id="evento_id">
                        <SelectValue placeholder="Seleccionar evento..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Sin evento</SelectItem>
                        {eventos.map((evento) => (
                          <SelectItem key={evento.id} value={evento.id}>
                            {evento.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="formacion_id">Formación</Label>
                    <Select
                      value={formData.formacion_id}
                      onValueChange={(v) => setFormData({ ...formData, formacion_id: v })}
                    >
                      <SelectTrigger id="formacion_id">
                        <SelectValue placeholder="Seleccionar formación..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Sin formación</SelectItem>
                        {formaciones.map((formacion) => (
                          <SelectItem key={formacion.id} value={formacion.id}>
                            {formacion.titulo}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="asesoramiento_id">Asesoramiento</Label>
                    <Select
                      value={formData.asesoramiento_id}
                      onValueChange={(v) => setFormData({ ...formData, asesoramiento_id: v })}
                    >
                      <SelectTrigger id="asesoramiento_id">
                        <SelectValue placeholder="Seleccionar asesoramiento..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Sin asesoramiento</SelectItem>
                        {asesoramientos.map((asesoramiento) => (
                          <SelectItem key={asesoramiento.id} value={asesoramiento.id}>
                            {asesoramiento.tema || "Sin tema"} ({asesoramiento.empresa?.nombre || "Sin empresa"})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
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
                  <TableHead>Origen</TableHead>
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
                    <TableCell className="max-w-xs">
                      <span className="text-sm">{getOrigenDisplay(evidencia)}</span>
                    </TableCell>
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
