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
import { useCatalogLookup, resolveLabelFromLookup } from "@/hooks/useCatalog";
import { CatalogSelect } from "@/components/CatalogSelect";
import { Plus, Search, TrendingUp, Filter, Loader2, Edit, Trash2, BarChart3 } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type DisseminationImpact = Database["public"]["Tables"]["dissemination_impacts"]["Row"];
type DisseminationStatus = Database["public"]["Enums"]["dissemination_status"];
type DisseminationEntityType = Database["public"]["Enums"]["dissemination_entity_type"];

const estadoLabels: Record<DisseminationStatus, string> = {
  planned: "Planificado",
  active: "Activo",
  completed: "Completado",
  cancelled: "Cancelado",
};

const estadoColors: Record<DisseminationStatus, string> = {
  planned: "bg-muted text-muted-foreground",
  active: "bg-info/10 text-info",
  completed: "bg-success/10 text-success",
  cancelled: "bg-destructive/10 text-destructive",
};

const entityTypeLabels: Record<DisseminationEntityType, string> = {
  empresa: "Empresa",
  evento: "Evento",
  formacion: "Formación",
  material: "Material",
  general: "General",
};

export default function ImpactosDifusion() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCanal, setFilterCanal] = useState<string>("all");
  const [filterEstado, setFilterEstado] = useState<string>("all");
  const [filterEntityType, setFilterEntityType] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedImpact, setSelectedImpact] = useState<DisseminationImpact | null>(null);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { canWrite, isAdmin } = useUserRoles();

  // Load catalog lookups
  const { lookup: canalLookup } = useCatalogLookup('dissemination_channels');
  const { lookup: tipoLookup } = useCatalogLookup('dissemination_types');
  const { lookup: segmentoLookup } = useCatalogLookup('audience_segments');

  // Use the consolidated data loader hook
  const { data: impacts, loading, reload } = useDataLoader<DisseminationImpact>(
    "dissemination_impacts",
    (query) => {
      let filteredQuery = query.order("created_at", { ascending: false });
      
      if (filterCanal && filterCanal !== "all") {
        filteredQuery = filteredQuery.eq("canal", filterCanal);
      }
      if (filterEstado && filterEstado !== "all") {
        filteredQuery = filteredQuery.eq("estado", filterEstado as DisseminationStatus);
      }
      if (filterEntityType && filterEntityType !== "all") {
        filteredQuery = filteredQuery.eq("entity_type", filterEntityType as DisseminationEntityType);
      }
      
      return filteredQuery;
    },
    [filterCanal, filterEstado, filterEntityType]
  );

  // Use local search hook for filtering
  const filteredImpacts = useLocalSearch(
    impacts,
    searchTerm,
    (impact, term) =>
      impact.titulo.toLowerCase().includes(term) ||
      impact.descripcion?.toLowerCase().includes(term) ||
      impact.publico_objetivo?.toLowerCase().includes(term)
  );

  const [formData, setFormData] = useState({
    titulo: "",
    descripcion: "",
    canal: "",
    tipo: "",
    estado: "planned" as DisseminationStatus,
    entity_type: "general" as DisseminationEntityType,
    fecha_inicio: "",
    fecha_fin: "",
    fecha_ejecucion: "",
    alcance: 0,
    visualizaciones: 0,
    descargas: 0,
    interacciones: 0,
    conversiones: 0,
    presupuesto: "",
    coste_real: "",
    publico_objetivo: "",
    segmento: "",
    observaciones: "",
  });

  const resetForm = () => {
    setFormData({
      titulo: "",
      descripcion: "",
      canal: "",
      tipo: "",
      estado: "planned",
      entity_type: "general",
      fecha_inicio: "",
      fecha_fin: "",
      fecha_ejecucion: "",
      alcance: 0,
      visualizaciones: 0,
      descargas: 0,
      interacciones: 0,
      conversiones: 0,
      presupuesto: "",
      coste_real: "",
      publico_objetivo: "",
      segmento: "",
      observaciones: "",
    });
    setSelectedImpact(null);
  };

  const handleEdit = (impact: DisseminationImpact) => {
    setSelectedImpact(impact);
    setFormData({
      titulo: impact.titulo,
      descripcion: impact.descripcion || "",
      canal: impact.canal,
      tipo: impact.tipo || "",
      estado: impact.estado,
      entity_type: impact.entity_type,
      fecha_inicio: impact.fecha_inicio || "",
      fecha_fin: impact.fecha_fin || "",
      fecha_ejecucion: impact.fecha_ejecucion || "",
      alcance: impact.alcance || 0,
      visualizaciones: impact.visualizaciones || 0,
      descargas: impact.descargas || 0,
      interacciones: impact.interacciones || 0,
      conversiones: impact.conversiones || 0,
      presupuesto: impact.presupuesto?.toString() || "",
      coste_real: impact.coste_real?.toString() || "",
      publico_objetivo: impact.publico_objetivo || "",
      segmento: impact.segmento || "",
      observaciones: impact.observaciones || "",
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !supabase) return;

    // Validations
    if (!formData.titulo.trim()) {
      toast({ title: "Error", description: "El título es obligatorio", variant: "destructive" });
      return;
    }
    if (!formData.canal) {
      toast({ title: "Error", description: "El canal es obligatorio", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const dataToSave = {
        titulo: formData.titulo,
        descripcion: formData.descripcion || null,
        canal: formData.canal,
        tipo: formData.tipo || null,
        estado: formData.estado,
        entity_type: formData.entity_type,
        fecha_inicio: formData.fecha_inicio || null,
        fecha_fin: formData.fecha_fin || null,
        fecha_ejecucion: formData.fecha_ejecucion || null,
        alcance: formData.alcance || 0,
        visualizaciones: formData.visualizaciones || 0,
        descargas: formData.descargas || 0,
        interacciones: formData.interacciones || 0,
        conversiones: formData.conversiones || 0,
        presupuesto: formData.presupuesto ? parseFloat(formData.presupuesto) : null,
        coste_real: formData.coste_real ? parseFloat(formData.coste_real) : null,
        publico_objetivo: formData.publico_objetivo || null,
        segmento: formData.segmento || null,
        observaciones: formData.observaciones || null,
      };

      if (selectedImpact) {
        const { error } = await supabase
          .from("dissemination_impacts")
          .update(dataToSave)
          .eq("id", selectedImpact.id);

        if (error) throw error;
        toast({ title: "Impacto actualizado", description: "El impacto de difusión se ha actualizado correctamente." });
      } else {
        const { error } = await supabase
          .from("dissemination_impacts")
          .insert([{ ...dataToSave, created_by: user.id }]);

        if (error) throw error;
        toast({ title: "Impacto creado", description: "El impacto de difusión se ha creado correctamente." });
      }

      setDialogOpen(false);
      resetForm();
      reload();
    } catch (error: any) {
      toast({ 
        title: "Error al guardar impacto", 
        description: error.message, 
        variant: "destructive" 
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!supabase) return;
    
    if (!confirm("¿Estás seguro de que deseas eliminar este impacto de difusión?")) {
      return;
    }

    try {
      const { error } = await supabase.from("dissemination_impacts").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Impacto eliminado", description: "El impacto de difusión se ha eliminado correctamente." });
      reload();
    } catch (error: any) {
      toast({ 
        title: "Error al eliminar impacto", 
        description: error.message, 
        variant: "destructive" 
      });
    }
  };

  // Calculate total metrics
  const totalMetrics = filteredImpacts.reduce((acc, impact) => ({
    alcance: acc.alcance + (impact.alcance || 0),
    visualizaciones: acc.visualizaciones + (impact.visualizaciones || 0),
    descargas: acc.descargas + (impact.descargas || 0),
    interacciones: acc.interacciones + (impact.interacciones || 0),
    conversiones: acc.conversiones + (impact.conversiones || 0),
  }), { alcance: 0, visualizaciones: 0, descargas: 0, interacciones: 0, conversiones: 0 });

  if (!supabase) {
    return (
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Impactos de Difusión</h1>
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
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <TrendingUp className="h-8 w-8" />
            Impactos de Difusión
          </h1>
          <p className="text-muted-foreground">
            Seguimiento de actividades de difusión y sus métricas
          </p>
        </div>
        <PermissionButton action="create">
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Impacto
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {selectedImpact ? "Editar Impacto de Difusión" : "Nuevo Impacto de Difusión"}
                </DialogTitle>
                <DialogDescription>
                  {selectedImpact 
                    ? "Modifica los datos del impacto de difusión"
                    : "Completa los datos del nuevo impacto de difusión"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="titulo">Título *</Label>
                    <Input
                      id="titulo"
                      value={formData.titulo}
                      onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="descripcion">Descripción</Label>
                    <Textarea
                      id="descripcion"
                      value={formData.descripcion}
                      onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                      rows={2}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="canal">Canal *</Label>
                      <CatalogSelect
                        catalogType="dissemination_channels"
                        value={formData.canal}
                        onValueChange={(v) => setFormData({ ...formData, canal: v })}
                        placeholder="Seleccionar canal..."
                      />
                    </div>

                    <div>
                      <Label htmlFor="tipo">Tipo</Label>
                      <CatalogSelect
                        catalogType="dissemination_types"
                        value={formData.tipo}
                        onValueChange={(v) => setFormData({ ...formData, tipo: v })}
                        placeholder="Seleccionar tipo..."
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="estado">Estado</Label>
                      <Select
                        value={formData.estado}
                        onValueChange={(v) => setFormData({ ...formData, estado: v as DisseminationStatus })}
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

                    <div>
                      <Label htmlFor="entity_type">Tipo de entidad</Label>
                      <Select
                        value={formData.entity_type}
                        onValueChange={(v) => setFormData({ ...formData, entity_type: v as DisseminationEntityType })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(entityTypeLabels).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="fecha_inicio">Fecha inicio</Label>
                      <Input
                        id="fecha_inicio"
                        type="date"
                        value={formData.fecha_inicio}
                        onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
                      />
                    </div>

                    <div>
                      <Label htmlFor="fecha_fin">Fecha fin</Label>
                      <Input
                        id="fecha_fin"
                        type="date"
                        value={formData.fecha_fin}
                        onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })}
                      />
                    </div>

                    <div>
                      <Label htmlFor="fecha_ejecucion">Fecha ejecución</Label>
                      <Input
                        id="fecha_ejecucion"
                        type="date"
                        value={formData.fecha_ejecucion}
                        onChange={(e) => setFormData({ ...formData, fecha_ejecucion: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <Label className="text-base font-semibold">Métricas de impacto</Label>
                    <div className="grid grid-cols-3 gap-4 mt-3">
                      <div>
                        <Label htmlFor="alcance">Alcance</Label>
                        <Input
                          id="alcance"
                          type="number"
                          min="0"
                          value={formData.alcance}
                          onChange={(e) => setFormData({ ...formData, alcance: parseInt(e.target.value) || 0 })}
                        />
                      </div>

                      <div>
                        <Label htmlFor="visualizaciones">Visualizaciones</Label>
                        <Input
                          id="visualizaciones"
                          type="number"
                          min="0"
                          value={formData.visualizaciones}
                          onChange={(e) => setFormData({ ...formData, visualizaciones: parseInt(e.target.value) || 0 })}
                        />
                      </div>

                      <div>
                        <Label htmlFor="descargas">Descargas</Label>
                        <Input
                          id="descargas"
                          type="number"
                          min="0"
                          value={formData.descargas}
                          onChange={(e) => setFormData({ ...formData, descargas: parseInt(e.target.value) || 0 })}
                        />
                      </div>

                      <div>
                        <Label htmlFor="interacciones">Interacciones</Label>
                        <Input
                          id="interacciones"
                          type="number"
                          min="0"
                          value={formData.interacciones}
                          onChange={(e) => setFormData({ ...formData, interacciones: parseInt(e.target.value) || 0 })}
                        />
                      </div>

                      <div>
                        <Label htmlFor="conversiones">Conversiones</Label>
                        <Input
                          id="conversiones"
                          type="number"
                          min="0"
                          value={formData.conversiones}
                          onChange={(e) => setFormData({ ...formData, conversiones: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="presupuesto">Presupuesto (€)</Label>
                      <Input
                        id="presupuesto"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.presupuesto}
                        onChange={(e) => setFormData({ ...formData, presupuesto: e.target.value })}
                      />
                    </div>

                    <div>
                      <Label htmlFor="coste_real">Coste real (€)</Label>
                      <Input
                        id="coste_real"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.coste_real}
                        onChange={(e) => setFormData({ ...formData, coste_real: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="publico_objetivo">Público objetivo</Label>
                      <Input
                        id="publico_objetivo"
                        value={formData.publico_objetivo}
                        onChange={(e) => setFormData({ ...formData, publico_objetivo: e.target.value })}
                      />
                    </div>

                    <div>
                      <Label htmlFor="segmento">Segmento</Label>
                      <CatalogSelect
                        catalogType="audience_segments"
                        value={formData.segmento}
                        onValueChange={(v) => setFormData({ ...formData, segmento: v })}
                        placeholder="Seleccionar segmento..."
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="observaciones">Observaciones</Label>
                    <Textarea
                      id="observaciones"
                      value={formData.observaciones}
                      onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                      rows={2}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setDialogOpen(false);
                      resetForm();
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={saving}>
                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {selectedImpact ? "Actualizar" : "Crear"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </PermissionButton>
      </div>

      {/* Metrics Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Alcance Total</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMetrics.alcance.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Visualizaciones</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMetrics.visualizaciones.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Descargas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMetrics.descargas.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Interacciones</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMetrics.interacciones.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Conversiones</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMetrics.conversiones.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Listado de Impactos de Difusión</CardTitle>
              <CardDescription>
                {filteredImpacts.length} impacto{filteredImpacts.length !== 1 ? 's' : ''} encontrado{filteredImpacts.length !== 1 ? 's' : ''}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar impactos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select value={filterCanal} onValueChange={setFilterCanal}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Canal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los canales</SelectItem>
                  {Array.from(canalLookup.entries()).map(([code, label]) => (
                    <SelectItem key={code} value={code}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterEstado} onValueChange={setFilterEstado}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  {Object.entries(estadoLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterEntityType} onValueChange={setFilterEntityType}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Entidad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las entidades</SelectItem>
                  {Object.entries(entityTypeLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Table */}
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredImpacts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No se encontraron impactos de difusión
              </div>
            ) : (
              <div className="border rounded-lg overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Título</TableHead>
                      <TableHead>Canal</TableHead>
                      <TableHead>Tipo Entidad</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Alcance</TableHead>
                      <TableHead className="text-right">Interacciones</TableHead>
                      <TableHead className="text-right">Conversiones</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredImpacts.map((impact) => (
                      <TableRow key={impact.id}>
                        <TableCell className="font-medium">
                          <div>
                            <div>{impact.titulo}</div>
                            {impact.fecha_ejecucion && (
                              <div className="text-xs text-muted-foreground">
                                {new Date(impact.fecha_ejecucion).toLocaleDateString('es-ES')}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {resolveLabelFromLookup(canalLookup, impact.canal)}
                        </TableCell>
                        <TableCell>
                          {entityTypeLabels[impact.entity_type]}
                        </TableCell>
                        <TableCell>
                          <Badge className={estadoColors[impact.estado]}>
                            {estadoLabels[impact.estado]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {(impact.alcance || 0).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          {(impact.interacciones || 0).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          {(impact.conversiones || 0).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {canWrite && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(impact)}
                                title="Editar"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            )}
                            {isAdmin && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(impact.id)}
                                title="Eliminar"
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
