import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useUserRoles } from "@/hooks/useUserRoles";
import { useDataLoader, useLocalSearch } from "@/hooks/useDataLoader";
import { PermissionButton } from "@/components/PermissionButton";
import { CatalogSelect } from "@/components/CatalogSelect";
import { useCatalogLookup, resolveLabelFromLookup } from "@/hooks/useCatalog";
import { Plus, Search, FileText, Filter, Loader2, Eye, Trash2, Edit } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Report = Database["public"]["Tables"]["reports"]["Row"];
type Empresa = Database["public"]["Tables"]["empresas"]["Row"];

const initialFormData = {
  title: "",
  description: "",
  status_code: "draft",
  report_type_code: "",
  report_date: "",
  content: "",
  conclusions: "",
  recommendations: "",
  company_id: "",
  responsible_user_id: "",
  notes: "",
};

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  in_review: "bg-info/10 text-info",
  approved: "bg-success/10 text-success",
  published: "bg-primary/10 text-primary",
  archived: "bg-muted text-muted-foreground",
};

export default function Informes() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterCompany, setFilterCompany] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [editingReport, setEditingReport] = useState<Report | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const { canWrite } = useUserRoles();

  // Load catalog lookups for labels
  const { lookup: statusLookup } = useCatalogLookup("report_statuses");
  const { lookup: typeLookup } = useCatalogLookup("report_types");

  // Load reports
  const { data: reports, loading, reload } = useDataLoader<Report>(
    "reports",
    (query) => {
      let filteredQuery = query.order("created_at", { ascending: false });
      
      if (filterStatus && filterStatus !== "all") {
        filteredQuery = filteredQuery.eq("status_code", filterStatus);
      }
      if (filterCompany && filterCompany !== "all") {
        filteredQuery = filteredQuery.eq("company_id", filterCompany);
      }
      
      return filteredQuery;
    },
    [filterStatus, filterCompany]
  );

  // Load companies for filter and select
  const { data: empresas } = useDataLoader<Empresa>(
    "empresas",
    (query) => query.order("nombre", { ascending: true }),
    []
  );

  // Use local search hook for filtering
  const filteredReports = useLocalSearch(
    reports,
    searchTerm,
    (report, term) =>
      report.title.toLowerCase().includes(term) ||
      report.description?.toLowerCase().includes(term) ||
      report.content?.toLowerCase().includes(term)
  );

  const [formData, setFormData] = useState(initialFormData);

  const handleViewDetails = (report: Report) => {
    setSelectedReport(report);
    setDetailDialogOpen(true);
  };

  const handleEdit = (report: Report) => {
    setEditingReport(report);
    setFormData({
      title: report.title,
      description: report.description || "",
      status_code: report.status_code,
      report_type_code: report.report_type_code || "",
      report_date: report.report_date || "",
      content: report.content || "",
      conclusions: report.conclusions || "",
      recommendations: report.recommendations || "",
      company_id: report.company_id,
      responsible_user_id: report.responsible_user_id || "",
      notes: report.notes || "",
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!supabase || !confirm("¿Estás seguro de que quieres eliminar este informe?")) return;

    const { error } = await supabase.from("reports").delete().eq("id", id);

    if (error) {
      toast({ title: "Error", description: "No se pudo eliminar el informe", variant: "destructive" });
    } else {
      toast({ title: "Éxito", description: "Informe eliminado correctamente" });
      reload();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !user) return;

    setSaving(true);

    try {
      const reportData = {
        ...formData,
        company_id: formData.company_id || null,
        responsible_user_id: formData.responsible_user_id || null,
        report_type_code: formData.report_type_code || null,
        report_date: formData.report_date || null,
        created_by: editingReport ? undefined : user.id,
      };

      if (editingReport) {
        const { error } = await supabase
          .from("reports")
          .update(reportData)
          .eq("id", editingReport.id);

        if (error) throw error;
        toast({ title: "Éxito", description: "Informe actualizado correctamente" });
      } else {
        const { error } = await supabase.from("reports").insert([reportData]);

        if (error) throw error;
        toast({ title: "Éxito", description: "Informe creado correctamente" });
      }

      setDialogOpen(false);
      setEditingReport(null);
      setFormData(initialFormData);
      reload();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo guardar el informe",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const openNewDialog = () => {
    setEditingReport(null);
    setFormData(initialFormData);
    setDialogOpen(true);
  };

  const getCompanyName = (companyId: string) => {
    const company = empresas?.find((e) => e.id === companyId);
    return company?.nombre || "Sin empresa";
  };

  return (
    <div className="container mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Informes</h1>
          <p className="text-muted-foreground">Gestión de informes por empresa</p>
        </div>
        <PermissionButton onClick={openNewDialog} variant="default">
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Informe
        </PermissionButton>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros y Búsqueda</CardTitle>
          <CardDescription>Busca y filtra informes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar informes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[200px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                {Array.from(statusLookup.entries()).map(([code, label]) => (
                  <SelectItem key={code} value={code}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterCompany} onValueChange={setFilterCompany}>
              <SelectTrigger className="w-[250px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Empresa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las empresas</SelectItem>
                {empresas?.map((empresa) => (
                  <SelectItem key={empresa.id} value={empresa.id}>
                    {empresa.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Informes</CardTitle>
          <CardDescription>
            {filteredReports.length} informe{filteredReports.length !== 1 ? "s" : ""} encontrado{filteredReports.length !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReports.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      No se encontraron informes
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium">{report.title}</TableCell>
                      <TableCell>{getCompanyName(report.company_id)}</TableCell>
                      <TableCell>
                        {report.report_type_code 
                          ? resolveLabelFromLookup(typeLookup, report.report_type_code)
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[report.status_code] || ""}>
                          {resolveLabelFromLookup(statusLookup, report.status_code)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {report.report_date
                          ? format(new Date(report.report_date), "dd/MM/yyyy")
                          : "-"}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewDetails(report)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <PermissionButton
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(report)}
                        >
                          <Edit className="h-4 w-4" />
                        </PermissionButton>
                        <PermissionButton
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(report.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </PermissionButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingReport ? "Editar Informe" : "Nuevo Informe"}
            </DialogTitle>
            <DialogDescription>
              {editingReport
                ? "Actualiza la información del informe"
                : "Crea un nuevo informe para una empresa"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company_id">Empresa *</Label>
              <Select
                value={formData.company_id}
                onValueChange={(v) => setFormData({ ...formData, company_id: v })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar empresa..." />
                </SelectTrigger>
                <SelectContent>
                  {empresas?.map((empresa) => (
                    <SelectItem key={empresa.id} value={empresa.id}>
                      {empresa.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status_code">Estado *</Label>
                <CatalogSelect
                  catalogType="report_statuses"
                  value={formData.status_code}
                  onValueChange={(v) => setFormData({ ...formData, status_code: v })}
                  placeholder="Seleccionar estado..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="report_type_code">Tipo</Label>
                <CatalogSelect
                  catalogType="report_types"
                  value={formData.report_type_code}
                  onValueChange={(v) => setFormData({ ...formData, report_type_code: v })}
                  placeholder="Seleccionar tipo..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="report_date">Fecha del Informe</Label>
              <Input
                id="report_date"
                type="date"
                value={formData.report_date}
                onChange={(e) => setFormData({ ...formData, report_date: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Contenido</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="conclusions">Conclusiones</Label>
              <Textarea
                id="conclusions"
                value={formData.conclusions}
                onChange={(e) => setFormData({ ...formData, conclusions: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="recommendations">Recomendaciones</Label>
              <Textarea
                id="recommendations"
                value={formData.recommendations}
                onChange={(e) => setFormData({ ...formData, recommendations: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notas Adicionales</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={2}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  "Guardar"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedReport?.title}</DialogTitle>
            <DialogDescription>Detalles del informe</DialogDescription>
          </DialogHeader>
          {selectedReport && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Empresa</Label>
                  <p className="font-medium">{getCompanyName(selectedReport.company_id)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Estado</Label>
                  <div>
                    <Badge className={statusColors[selectedReport.status_code] || ""}>
                      {resolveLabelFromLookup(statusLookup, selectedReport.status_code)}
                    </Badge>
                  </div>
                </div>
                {selectedReport.report_type_code && (
                  <div>
                    <Label className="text-muted-foreground">Tipo</Label>
                    <p className="font-medium">
                      {resolveLabelFromLookup(typeLookup, selectedReport.report_type_code)}
                    </p>
                  </div>
                )}
                {selectedReport.report_date && (
                  <div>
                    <Label className="text-muted-foreground">Fecha</Label>
                    <p className="font-medium">
                      {format(new Date(selectedReport.report_date), "dd/MM/yyyy")}
                    </p>
                  </div>
                )}
              </div>

              {selectedReport.description && (
                <div>
                  <Label className="text-muted-foreground">Descripción</Label>
                  <p className="mt-1">{selectedReport.description}</p>
                </div>
              )}

              {selectedReport.content && (
                <div>
                  <Label className="text-muted-foreground">Contenido</Label>
                  <p className="mt-1 whitespace-pre-wrap">{selectedReport.content}</p>
                </div>
              )}

              {selectedReport.conclusions && (
                <div>
                  <Label className="text-muted-foreground">Conclusiones</Label>
                  <p className="mt-1 whitespace-pre-wrap">{selectedReport.conclusions}</p>
                </div>
              )}

              {selectedReport.recommendations && (
                <div>
                  <Label className="text-muted-foreground">Recomendaciones</Label>
                  <p className="mt-1 whitespace-pre-wrap">{selectedReport.recommendations}</p>
                </div>
              )}

              {selectedReport.notes && (
                <div>
                  <Label className="text-muted-foreground">Notas</Label>
                  <p className="mt-1">{selectedReport.notes}</p>
                </div>
              )}

              <div className="text-sm text-muted-foreground">
                Creado el {format(new Date(selectedReport.created_at), "dd/MM/yyyy HH:mm")}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
