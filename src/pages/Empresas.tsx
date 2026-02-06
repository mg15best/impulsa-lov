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
import { Plus, Search, Building2, Filter, Loader2, Users, ClipboardList, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Database } from "@/integrations/supabase/types";

type Empresa = Database["public"]["Tables"]["empresas"]["Row"];
type SectorEmpresa = Database["public"]["Enums"]["sector_empresa"];
type EstadoEmpresa = Database["public"]["Enums"]["estado_empresa"];
type FaseMadurez = Database["public"]["Enums"]["fase_madurez"];

const sectorLabels: Record<SectorEmpresa, string> = {
  tecnologia: "Tecnología",
  industria: "Industria",
  servicios: "Servicios",
  comercio: "Comercio",
  turismo: "Turismo",
  energia: "Energía",
  construccion: "Construcción",
  agroalimentario: "Agroalimentario",
  otro: "Otro",
};

const estadoLabels: Record<EstadoEmpresa, string> = {
  pendiente: "Pendiente",
  en_proceso: "En proceso",
  asesorada: "Asesorada",
  completada: "Completada",
};

const faseLabels: Record<FaseMadurez, string> = {
  idea: "Idea",
  validacion: "Validación",
  crecimiento: "Crecimiento",
  consolidacion: "Consolidación",
};

const estadoColors: Record<EstadoEmpresa, string> = {
  pendiente: "bg-muted text-muted-foreground",
  en_proceso: "bg-warning/10 text-warning",
  asesorada: "bg-info/10 text-info",
  completada: "bg-success/10 text-success",
};

export default function Empresas() {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSector, setFilterSector] = useState<string>("all");
  const [filterEstado, setFilterEstado] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedEmpresa, setSelectedEmpresa] = useState<Empresa | null>(null);
  const [relatedDialogOpen, setRelatedDialogOpen] = useState(false);
  const [contactosCount, setContactosCount] = useState(0);
  const [asesoramientosCount, setAsesoramientosCount] = useState(0);
  const { toast } = useToast();
  const { user } = useAuth();
  const { canWrite } = useUserRoles();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombre: "",
    nombre_comercial: "",
    cif: "",
    forma_juridica: "",
    sector: "otro" as SectorEmpresa,
    subsector: "",
    fase_madurez: "idea" as FaseMadurez,
    estado: "pendiente" as EstadoEmpresa,
    descripcion: "",
    direccion: "",
    codigo_postal: "",
    municipio: "",
    isla: "",
    telefono: "",
    email: "",
    web: "",
    contacto_principal: "",
    fecha_constitucion: "",
    codigo_origen_lead: "",
    es_caso_exito: false,
  });

  const fetchEmpresas = async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    setLoading(true);
    let query = supabase.from("empresas").select("*").order("created_at", { ascending: false });

    if (filterSector && filterSector !== "all") {
      query = query.eq("sector", filterSector as SectorEmpresa);
    }
    if (filterEstado && filterEstado !== "all") {
      query = query.eq("estado", filterEstado as EstadoEmpresa);
    }

    const { data, error } = await query;
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setEmpresas(data || []);
    }
    setLoading(false);
  };

  const handleViewRelated = async (empresa: Empresa) => {
    if (!supabase) return;
    
    setSelectedEmpresa(empresa);
    
    // Fetch counts for contactos and asesoramientos
    const { count: contactosCount } = await supabase
      .from("contactos")
      .select("*", { count: "exact", head: true })
      .eq("empresa_id", empresa.id);
    
    const { count: asesoramientosCount } = await supabase
      .from("asesoramientos")
      .select("*", { count: "exact", head: true })
      .eq("empresa_id", empresa.id);
    
    setContactosCount(contactosCount || 0);
    setAsesoramientosCount(asesoramientosCount || 0);
    setRelatedDialogOpen(true);
  };

  useEffect(() => {
    fetchEmpresas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterSector, filterEstado]);

  const filteredEmpresas = empresas.filter((empresa) =>
    empresa.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    empresa.cif?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !supabase) return;

    setSaving(true);
    const { error } = await supabase.from("empresas").insert({
      ...formData,
      created_by: user.id,
    });

    if (error) {
      toast({ title: "Error al crear empresa", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Empresa creada", description: "La empresa se ha registrado correctamente." });
      setDialogOpen(false);
      setFormData({
        nombre: "",
        nombre_comercial: "",
        cif: "",
        forma_juridica: "",
        sector: "otro",
        subsector: "",
        fase_madurez: "idea",
        estado: "pendiente",
        descripcion: "",
        direccion: "",
        codigo_postal: "",
        municipio: "",
        isla: "",
        telefono: "",
        email: "",
        web: "",
        contacto_principal: "",
        fecha_constitucion: "",
        codigo_origen_lead: "",
        es_caso_exito: false,
      });
      fetchEmpresas();
    }
    setSaving(false);
  };

  if (!supabase) {
    return (
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Empresas</h1>
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
          <h1 className="text-3xl font-bold tracking-tight">Empresas</h1>
          <p className="text-muted-foreground">
            Gestión de empresas emergentes del proyecto
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button disabled={!canWrite}>
              <Plus className="mr-2 h-4 w-4" />
              Nueva Empresa
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Registrar Nueva Empresa</DialogTitle>
              <DialogDescription>
                Completa los datos de la empresa emergente
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre Legal *</Label>
                  <Input
                    id="nombre"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nombre_comercial">Nombre Comercial</Label>
                  <Input
                    id="nombre_comercial"
                    value={formData.nombre_comercial}
                    onChange={(e) => setFormData({ ...formData, nombre_comercial: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="cif">CIF</Label>
                  <Input
                    id="cif"
                    value={formData.cif}
                    onChange={(e) => setFormData({ ...formData, cif: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="forma_juridica">Forma Jurídica</Label>
                  <Input
                    id="forma_juridica"
                    placeholder="S.L., S.A., Autónomo, etc."
                    value={formData.forma_juridica}
                    onChange={(e) => setFormData({ ...formData, forma_juridica: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="sector">Sector</Label>
                  <Select
                    value={formData.sector}
                    onValueChange={(v) => setFormData({ ...formData, sector: v as SectorEmpresa })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(sectorLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subsector">Subsector</Label>
                  <Input
                    id="subsector"
                    value={formData.subsector}
                    onChange={(e) => setFormData({ ...formData, subsector: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fase">Fase de Madurez</Label>
                  <Select
                    value={formData.fase_madurez}
                    onValueChange={(v) => setFormData({ ...formData, fase_madurez: v as FaseMadurez })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(faseLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fecha_constitucion">Fecha de Constitución</Label>
                  <Input
                    id="fecha_constitucion"
                    type="date"
                    value={formData.fecha_constitucion}
                    onChange={(e) => setFormData({ ...formData, fecha_constitucion: e.target.value })}
                  />
                </div>
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
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="codigo_postal">Código Postal</Label>
                  <Input
                    id="codigo_postal"
                    value={formData.codigo_postal}
                    onChange={(e) => setFormData({ ...formData, codigo_postal: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="municipio">Municipio</Label>
                  <Input
                    id="municipio"
                    value={formData.municipio}
                    onChange={(e) => setFormData({ ...formData, municipio: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="isla">Isla</Label>
                  <Input
                    id="isla"
                    value={formData.isla}
                    onChange={(e) => setFormData({ ...formData, isla: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="web">Sitio Web</Label>
                  <Input
                    id="web"
                    type="url"
                    placeholder="https://..."
                    value={formData.web}
                    onChange={(e) => setFormData({ ...formData, web: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="codigo_origen_lead">Origen del Lead</Label>
                  <Input
                    id="codigo_origen_lead"
                    value={formData.codigo_origen_lead}
                    onChange={(e) => setFormData({ ...formData, codigo_origen_lead: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="contacto_principal">Contacto Principal</Label>
                <Input
                  id="contacto_principal"
                  value={formData.contacto_principal}
                  onChange={(e) => setFormData({ ...formData, contacto_principal: e.target.value })}
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
                  placeholder="Buscar por nombre o CIF..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={filterSector} onValueChange={setFilterSector}>
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Sector" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los sectores</SelectItem>
                {Object.entries(sectorLabels).map(([value, label]) => (
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

      {/* Tabla de Empresas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Listado de Empresas
          </CardTitle>
          <CardDescription>
            {filteredEmpresas.length} empresas encontradas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredEmpresas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Building2 className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">No hay empresas registradas</p>
              <p className="text-sm text-muted-foreground">
                Crea la primera empresa usando el botón "Nueva Empresa"
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>CIF</TableHead>
                  <TableHead>Municipio</TableHead>
                  <TableHead>Sector</TableHead>
                  <TableHead>Fase</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Contacto</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmpresas.map((empresa) => (
                  <TableRow 
                    key={empresa.id} 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleViewRelated(empresa)}
                  >
                    <TableCell className="font-medium">
                      <div>{empresa.nombre}</div>
                      {empresa.nombre_comercial && (
                        <div className="text-xs text-muted-foreground">{empresa.nombre_comercial}</div>
                      )}
                    </TableCell>
                    <TableCell>{empresa.cif || "-"}</TableCell>
                    <TableCell>{empresa.municipio || "-"}</TableCell>
                    <TableCell>
                      <div>{sectorLabels[empresa.sector]}</div>
                      {empresa.subsector && (
                        <div className="text-xs text-muted-foreground">{empresa.subsector}</div>
                      )}
                    </TableCell>
                    <TableCell>{faseLabels[empresa.fase_madurez]}</TableCell>
                    <TableCell>
                      <Badge className={estadoColors[empresa.estado]}>
                        {estadoLabels[empresa.estado]}
                      </Badge>
                    </TableCell>
                    <TableCell>{empresa.contacto_principal || empresa.email || "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog de entidades relacionadas */}
      <Dialog open={relatedDialogOpen} onOpenChange={setRelatedDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Entidades Relacionadas</DialogTitle>
            <DialogDescription>
              {selectedEmpresa?.nombre}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Card className="cursor-pointer hover:bg-muted/50" onClick={() => {
              setRelatedDialogOpen(false);
              navigate(`/contactos`);
              // Note: In a real implementation, we would pass the empresa_id as a URL param
              // For now, users can filter by empresa in the Contactos page
            }}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Users className="h-8 w-8 text-primary" />
                    <div>
                      <p className="font-semibold">Contactos</p>
                      <p className="text-sm text-muted-foreground">
                        {contactosCount} {contactosCount === 1 ? "contacto" : "contactos"}
                      </p>
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="cursor-pointer hover:bg-muted/50" onClick={() => {
              setRelatedDialogOpen(false);
              navigate(`/asesoramientos`);
              // Note: In a real implementation, we would pass the empresa_id as a URL param
            }}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <ClipboardList className="h-8 w-8 text-primary" />
                    <div>
                      <p className="font-semibold">Asesoramientos</p>
                      <p className="text-sm text-muted-foreground">
                        {asesoramientosCount} {asesoramientosCount === 1 ? "asesoramiento" : "asesoramientos"}
                      </p>
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
