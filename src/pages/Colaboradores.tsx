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
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useUserRoles } from "@/hooks/useUserRoles";
import { useDataLoader, useLocalSearch } from "@/hooks/useDataLoader";
import { PermissionButton } from "@/components/PermissionButton";
import { EstadoSelector } from "@/components/EstadoSelector";
import { Plus, Search, Handshake, Filter, Loader2 } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type Colaborador = Database["public"]["Tables"]["colaboradores"]["Row"];
type TipoColaborador = Database["public"]["Enums"]["tipo_colaborador"];
type EstadoColaborador = Database["public"]["Enums"]["estado_colaborador"];

const tipoLabels: Record<TipoColaborador, string> = {
  entidad_publica: "Entidad Pública",
  entidad_privada: "Entidad Privada",
  asociacion: "Asociación",
  universidad: "Universidad",
  centro_investigacion: "Centro de Investigación",
  otro: "Otro",
};

const estadoLabels: Record<EstadoColaborador, string> = {
  activo: "Activo",
  inactivo: "Inactivo",
  pendiente: "Pendiente",
};

const estadoColors: Record<EstadoColaborador, string> = {
  activo: "bg-success/10 text-success",
  inactivo: "bg-muted text-muted-foreground",
  pendiente: "bg-warning/10 text-warning",
};

export default function Colaboradores() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTipo, setFilterTipo] = useState<string>("all");
  const [filterEstado, setFilterEstado] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { canWrite } = useUserRoles();

  // Use the consolidated data loader hook
  const { data: colaboradores, loading, reload } = useDataLoader<Colaborador>(
    "colaboradores",
    (query) => {
      let filteredQuery = query.order("created_at", { ascending: false });
      
      if (filterTipo && filterTipo !== "all") {
        filteredQuery = filteredQuery.eq("tipo", filterTipo as TipoColaborador);
      }
      if (filterEstado && filterEstado !== "all") {
        filteredQuery = filteredQuery.eq("estado", filterEstado as EstadoColaborador);
      }
      
      return filteredQuery;
    },
    [filterTipo, filterEstado]
  );

  // Use local search hook for filtering
  const filteredColaboradores = useLocalSearch(
    colaboradores,
    searchTerm,
    (colaborador, term) =>
      colaborador.nombre.toLowerCase().includes(term) ||
      colaborador.descripcion?.toLowerCase().includes(term)
  );

  const [formData, setFormData] = useState({
    nombre: "",
    tipo: "otro" as TipoColaborador,
    estado: "pendiente" as EstadoColaborador,
    cif: "",
    descripcion: "",
    direccion: "",
    telefono: "",
    email: "",
    web: "",
    contacto_principal: "",
    cargo_contacto: "",
    email_contacto: "",
    telefono_contacto: "",
    fecha_inicio_colaboracion: "",
    ambito_colaboracion: "",
    convenio_firmado: false,
    observaciones: "",
    codigo_alcance: "",
    sectores_interes: [] as string[],
    tipos_apoyo: [] as string[],
    codigo_rango_ticket: "",
    requisitos_habituales: "",
    asignado_a: null as string | null,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !supabase) return;

    setSaving(true);
    const { error } = await supabase.from("colaboradores").insert({
      ...formData,
      created_by: user.id,
    });

    if (error) {
      toast({ title: "Error al crear colaborador", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Colaborador creado", description: "El colaborador se ha registrado correctamente." });
      setDialogOpen(false);
      setFormData({
        nombre: "",
        tipo: "otro",
        estado: "pendiente",
        cif: "",
        descripcion: "",
        direccion: "",
        telefono: "",
        email: "",
        web: "",
        contacto_principal: "",
        cargo_contacto: "",
        email_contacto: "",
        telefono_contacto: "",
        fecha_inicio_colaboracion: "",
        ambito_colaboracion: "",
        convenio_firmado: false,
        observaciones: "",
        codigo_alcance: "",
        sectores_interes: [],
        tipos_apoyo: [],
        codigo_rango_ticket: "",
        requisitos_habituales: "",
        asignado_a: null,
      });
      reload();
    }
    setSaving(false);
  };

  if (!supabase) {
    return (
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Colaboradores</h1>
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
          <h1 className="text-3xl font-bold tracking-tight">Colaboradores</h1>
          <p className="text-muted-foreground">
            Entidades colaboradoras del proyecto
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <PermissionButton action="create">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Colaborador
            </PermissionButton>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Registrar Nuevo Colaborador</DialogTitle>
              <DialogDescription>
                Completa los datos de la entidad colaboradora
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
                  <Label htmlFor="cif">CIF</Label>
                  <Input
                    id="cif"
                    value={formData.cif}
                    onChange={(e) => setFormData({ ...formData, cif: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipo</Label>
                  <Select
                    value={formData.tipo}
                    onValueChange={(v) => setFormData({ ...formData, tipo: v as TipoColaborador })}
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
                <EstadoSelector
                  entityType="colaboradores"
                  value={formData.estado}
                  onChange={(estado) => setFormData({ ...formData, estado })}
                  estadoLabels={estadoLabels}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input
                    id="telefono"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="direccion">Dirección</Label>
                <Input
                  id="direccion"
                  value={formData.direccion}
                  onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="web">Sitio Web</Label>
                <Input
                  id="web"
                  type="url"
                  value={formData.web}
                  onChange={(e) => setFormData({ ...formData, web: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contacto_principal">Contacto Principal</Label>
                <Input
                  id="contacto_principal"
                  value={formData.contacto_principal}
                  onChange={(e) => setFormData({ ...formData, contacto_principal: e.target.value })}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="cargo_contacto">Cargo del Contacto</Label>
                  <Input
                    id="cargo_contacto"
                    value={formData.cargo_contacto}
                    onChange={(e) => setFormData({ ...formData, cargo_contacto: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email_contacto">Email del Contacto</Label>
                  <Input
                    id="email_contacto"
                    type="email"
                    value={formData.email_contacto}
                    onChange={(e) => setFormData({ ...formData, email_contacto: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fecha_inicio">Fecha Inicio Colaboración</Label>
                  <Input
                    id="fecha_inicio"
                    type="date"
                    value={formData.fecha_inicio_colaboracion}
                    onChange={(e) => setFormData({ ...formData, fecha_inicio_colaboracion: e.target.value })}
                  />
                </div>
                <div className="flex items-center space-x-2 pt-8">
                  <Checkbox
                    id="convenio_firmado"
                    checked={formData.convenio_firmado}
                    onCheckedChange={(checked) => setFormData({ ...formData, convenio_firmado: Boolean(checked) })}
                  />
                  <Label htmlFor="convenio_firmado" className="cursor-pointer">
                    Convenio Firmado
                  </Label>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ambito">Ámbito de Colaboración</Label>
                <Textarea
                  id="ambito"
                  value={formData.ambito_colaboracion}
                  onChange={(e) => setFormData({ ...formData, ambito_colaboracion: e.target.value })}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="codigo_alcance">Código de Alcance</Label>
                <Input
                  id="codigo_alcance"
                  value={formData.codigo_alcance}
                  onChange={(e) => setFormData({ ...formData, codigo_alcance: e.target.value })}
                  placeholder="Ej: local, regional, nacional"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sectores_interes">Sectores de Interés</Label>
                <Input
                  id="sectores_interes"
                  value={formData.sectores_interes.join(', ')}
                  onChange={(e) => setFormData({ ...formData, sectores_interes: e.target.value.split(',').map(s => s.trim()).filter(s => s) })}
                  placeholder="Separados por comas"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tipos_apoyo">Tipos de Apoyo</Label>
                <Input
                  id="tipos_apoyo"
                  value={formData.tipos_apoyo.join(', ')}
                  onChange={(e) => setFormData({ ...formData, tipos_apoyo: e.target.value.split(',').map(s => s.trim()).filter(s => s) })}
                  placeholder="Ej: financiero, técnico, formativo"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="codigo_rango_ticket">Código de Rango de Ticket</Label>
                <Input
                  id="codigo_rango_ticket"
                  value={formData.codigo_rango_ticket}
                  onChange={(e) => setFormData({ ...formData, codigo_rango_ticket: e.target.value })}
                  placeholder="Ej: bajo, medio, alto"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="requisitos">Requisitos Habituales</Label>
                <Textarea
                  id="requisitos"
                  value={formData.requisitos_habituales}
                  onChange={(e) => setFormData({ ...formData, requisitos_habituales: e.target.value })}
                  rows={2}
                  placeholder="Requisitos o condiciones habituales"
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
                  placeholder="Buscar por nombre o descripción..."
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

      {/* Tabla de Colaboradores */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Handshake className="h-5 w-5" />
            Listado de Colaboradores
          </CardTitle>
          <CardDescription>
            {filteredColaboradores.length} colaboradores encontrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredColaboradores.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Handshake className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">No hay colaboradores registrados</p>
              <p className="text-sm text-muted-foreground">
                Crea el primer colaborador usando el botón "Nuevo Colaborador"
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Alcance</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Convenio</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredColaboradores.map((colaborador) => (
                  <TableRow key={colaborador.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell className="font-medium">{colaborador.nombre}</TableCell>
                    <TableCell>{tipoLabels[colaborador.tipo]}</TableCell>
                    <TableCell>
                      {colaborador.codigo_alcance || "-"}
                    </TableCell>
                    <TableCell>
                      {colaborador.contacto_principal || colaborador.email || "-"}
                    </TableCell>
                    <TableCell>
                      {colaborador.convenio_firmado ? (
                        <Badge className="bg-success/10 text-success">Firmado</Badge>
                      ) : (
                        <Badge className="bg-muted text-muted-foreground">Pendiente</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={estadoColors[colaborador.estado]}>
                        {estadoLabels[colaborador.estado]}
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
