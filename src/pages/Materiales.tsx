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
import { useCatalogLookup, resolveLabelFromLookup } from "@/hooks/useCatalog";
import { CatalogSelect } from "@/components/CatalogSelect";
import { Plus, Search, FolderOpen, Filter, Loader2, Download, Edit, Trash2 } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type Material = Database["public"]["Tables"]["materials"]["Row"];
type MaterialStatus = Database["public"]["Enums"]["material_status"];

const estadoLabels: Record<MaterialStatus, string> = {
  draft: "Borrador",
  review: "En revisión",
  published: "Publicado",
  archived: "Archivado",
};

const estadoColors: Record<MaterialStatus, string> = {
  draft: "bg-muted text-muted-foreground",
  review: "bg-warning/10 text-warning",
  published: "bg-success/10 text-success",
  archived: "bg-destructive/10 text-destructive",
};

export default function Materiales() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTipo, setFilterTipo] = useState<string>("all");
  const [filterEstado, setFilterEstado] = useState<string>("all");
  const [filterCategoria, setFilterCategoria] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { canWrite, isAdmin } = useUserRoles();

  // Load catalog lookups
  const { lookup: tipoLookup } = useCatalogLookup('material_types');
  const { lookup: categoriaLookup } = useCatalogLookup('material_categories');
  const { lookup: formatoLookup } = useCatalogLookup('material_formats');

  // Use the consolidated data loader hook
  const { data: materials, loading, reload } = useDataLoader<Material>(
    "materials",
    (query) => {
      let filteredQuery = query.order("created_at", { ascending: false });
      
      if (filterTipo && filterTipo !== "all") {
        filteredQuery = filteredQuery.eq("tipo", filterTipo);
      }
      if (filterEstado && filterEstado !== "all") {
        filteredQuery = filteredQuery.eq("estado", filterEstado as MaterialStatus);
      }
      if (filterCategoria && filterCategoria !== "all") {
        filteredQuery = filteredQuery.eq("categoria", filterCategoria);
      }
      
      return filteredQuery;
    },
    [filterTipo, filterEstado, filterCategoria]
  );

  // Use local search hook for filtering
  const filteredMaterials = useLocalSearch(
    materials,
    searchTerm,
    (material, term) =>
      material.titulo.toLowerCase().includes(term) ||
      material.descripcion?.toLowerCase().includes(term) ||
      material.keywords?.toLowerCase().includes(term)
  );

  const [formData, setFormData] = useState({
    titulo: "",
    descripcion: "",
    tipo: "",
    categoria: "",
    formato: "",
    estado: "draft" as MaterialStatus,
    url_descarga: "",
    es_descargable: true,
    requiere_autenticacion: true,
    keywords: "",
    idioma: "es",
    version: "",
    tags: [] as string[],
  });

  const resetForm = () => {
    setFormData({
      titulo: "",
      descripcion: "",
      tipo: "",
      categoria: "",
      formato: "",
      estado: "draft",
      url_descarga: "",
      es_descargable: true,
      requiere_autenticacion: true,
      keywords: "",
      idioma: "es",
      version: "",
      tags: [],
    });
    setSelectedMaterial(null);
  };

  const handleEdit = (material: Material) => {
    setSelectedMaterial(material);
    setFormData({
      titulo: material.titulo,
      descripcion: material.descripcion || "",
      tipo: material.tipo,
      categoria: material.categoria || "",
      formato: material.formato || "",
      estado: material.estado,
      url_descarga: material.url_descarga || "",
      es_descargable: material.es_descargable ?? true,
      requiere_autenticacion: material.requiere_autenticacion ?? true,
      keywords: material.keywords || "",
      idioma: material.idioma || "es",
      version: material.version || "",
      tags: material.tags || [],
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
    if (!formData.tipo) {
      toast({ title: "Error", description: "El tipo es obligatorio", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const dataToSave = {
        ...formData,
        fecha_publicacion: formData.estado === "published" 
          ? (selectedMaterial?.fecha_publicacion || new Date().toISOString())
          : selectedMaterial?.fecha_publicacion || null,
      };

      if (selectedMaterial) {
        const { error } = await supabase
          .from("materials")
          .update(dataToSave)
          .eq("id", selectedMaterial.id);

        if (error) throw error;
        toast({ title: "Material actualizado", description: "El material se ha actualizado correctamente." });
      } else {
        const { error } = await supabase
          .from("materials")
          .insert([{ ...dataToSave, created_by: user.id }]);

        if (error) throw error;
        toast({ title: "Material creado", description: "El material se ha creado correctamente." });
      }

      setDialogOpen(false);
      resetForm();
      reload();
    } catch (error) {
      const err = error as Error;
      toast({ 
        title: "Error al guardar material", 
        description: err.message, 
        variant: "destructive" 
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!supabase) return;
    
    if (!confirm("¿Estás seguro de que deseas eliminar este material?")) {
      return;
    }

    try {
      const { error } = await supabase.from("materials").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Material eliminado", description: "El material se ha eliminado correctamente." });
      reload();
    } catch (error) {
      const err = error as Error;
      toast({ 
        title: "Error al eliminar material", 
        description: err.message, 
        variant: "destructive" 
      });
    }
  };

  const handleDownload = async (material: Material) => {
    if (!supabase || !material.url_descarga) return;

    try {
      // Increment download counter
      const { error } = await supabase.rpc('increment_material_downloads', {
        p_material_id: material.id
      });

      if (error) {
        console.error("Error incrementing downloads:", error);
        toast({
          title: "Advertencia",
          description: "No se pudo registrar la descarga, pero puedes continuar.",
          variant: "default"
        });
      }

      // Open download URL
      window.open(material.url_descarga, '_blank');
      
      toast({ 
        title: "Descarga iniciada", 
        description: "El material se está descargando." 
      });
      
      reload();
    } catch (error) {
      const err = error as Error;
      toast({ 
        title: "Error en la descarga", 
        description: err.message, 
        variant: "destructive" 
      });
    }
  };

  if (!supabase) {
    return (
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Materiales</h1>
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
            <FolderOpen className="h-8 w-8" />
            Materiales
          </h1>
          <p className="text-muted-foreground">
            Gestión de recursos y documentos
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
                Nuevo Material
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {selectedMaterial ? "Editar Material" : "Nuevo Material"}
                </DialogTitle>
                <DialogDescription>
                  {selectedMaterial 
                    ? "Modifica los datos del material"
                    : "Completa los datos del nuevo material"}
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
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="tipo">Tipo *</Label>
                      <CatalogSelect
                        catalogType="material_types"
                        value={formData.tipo}
                        onValueChange={(v) => setFormData({ ...formData, tipo: v })}
                        placeholder="Seleccionar tipo..."
                      />
                    </div>

                    <div>
                      <Label htmlFor="categoria">Categoría</Label>
                      <CatalogSelect
                        catalogType="material_categories"
                        value={formData.categoria}
                        onValueChange={(v) => setFormData({ ...formData, categoria: v })}
                        placeholder="Seleccionar categoría..."
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="formato">Formato</Label>
                      <CatalogSelect
                        catalogType="material_formats"
                        value={formData.formato}
                        onValueChange={(v) => setFormData({ ...formData, formato: v })}
                        placeholder="Seleccionar formato..."
                      />
                    </div>

                    <div>
                      <Label htmlFor="estado">Estado</Label>
                      <Select
                        value={formData.estado}
                        onValueChange={(v) => setFormData({ ...formData, estado: v as MaterialStatus })}
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

                  <div>
                    <Label htmlFor="url_descarga">URL de descarga</Label>
                    <Input
                      id="url_descarga"
                      type="url"
                      value={formData.url_descarga}
                      onChange={(e) => setFormData({ ...formData, url_descarga: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="es_descargable"
                        checked={formData.es_descargable}
                        onCheckedChange={(checked) => 
                          setFormData({ ...formData, es_descargable: checked as boolean })
                        }
                      />
                      <Label htmlFor="es_descargable" className="font-normal">
                        Es descargable
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="requiere_autenticacion"
                        checked={formData.requiere_autenticacion}
                        onCheckedChange={(checked) => 
                          setFormData({ ...formData, requiere_autenticacion: checked as boolean })
                        }
                      />
                      <Label htmlFor="requiere_autenticacion" className="font-normal">
                        Requiere autenticación
                      </Label>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="idioma">Idioma</Label>
                      <Input
                        id="idioma"
                        value={formData.idioma}
                        onChange={(e) => setFormData({ ...formData, idioma: e.target.value })}
                        placeholder="es"
                      />
                    </div>

                    <div>
                      <Label htmlFor="version">Versión</Label>
                      <Input
                        id="version"
                        value={formData.version}
                        onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                        placeholder="1.0"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="keywords">Palabras clave</Label>
                    <Input
                      id="keywords"
                      value={formData.keywords}
                      onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                      placeholder="Separadas por comas"
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
                    {selectedMaterial ? "Actualizar" : "Crear"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </PermissionButton>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Listado de Materiales</CardTitle>
              <CardDescription>
                {filteredMaterials.length} material{filteredMaterials.length !== 1 ? 'es' : ''} encontrado{filteredMaterials.length !== 1 ? 's' : ''}
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
                  placeholder="Buscar materiales..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select value={filterTipo} onValueChange={setFilterTipo}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  {Array.from(tipoLookup.entries()).map(([code, label]) => (
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
              <Select value={filterCategoria} onValueChange={setFilterCategoria}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  {Array.from(categoriaLookup.entries()).map(([code, label]) => (
                    <SelectItem key={code} value={code}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Table */}
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredMaterials.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No se encontraron materiales
              </div>
            ) : (
              <div className="border rounded-lg overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Título</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Categoría</TableHead>
                      <TableHead>Formato</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Descargas</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMaterials.map((material) => (
                      <TableRow key={material.id}>
                        <TableCell className="font-medium">
                          <div>
                            <div>{material.titulo}</div>
                            {material.descripcion && (
                              <div className="text-xs text-muted-foreground line-clamp-1">
                                {material.descripcion}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {resolveLabelFromLookup(tipoLookup, material.tipo)}
                        </TableCell>
                        <TableCell>
                          {material.categoria 
                            ? resolveLabelFromLookup(categoriaLookup, material.categoria)
                            : "-"}
                        </TableCell>
                        <TableCell>
                          {material.formato 
                            ? resolveLabelFromLookup(formatoLookup, material.formato)
                            : "-"}
                        </TableCell>
                        <TableCell>
                          <Badge className={estadoColors[material.estado]}>
                            {estadoLabels[material.estado]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {material.numero_descargas || 0}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {material.es_descargable && material.url_descarga && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDownload(material)}
                                title="Descargar"
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            )}
                            {canWrite && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(material)}
                                title="Editar"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            )}
                            {isAdmin && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(material.id)}
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
