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
import { Plus, Search, Gift, Filter, Loader2, Eye, Trash2, Edit, FileText } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";
import { format } from "date-fns";

type Grant = Database["public"]["Tables"]["grants"]["Row"];
type GrantApplication = Database["public"]["Tables"]["grant_applications"]["Row"];
type Empresa = Database["public"]["Tables"]["empresas"]["Row"];

const initialGrantFormData = {
  title: "",
  description: "",
  status_code: "draft",
  type_code: "",
  program_code: "",
  priority_code: "medium",
  amount_requested: "",
  amount_awarded: "",
  application_deadline: "",
  decision_date: "",
  grant_period_start: "",
  grant_period_end: "",
  company_id: "",
  responsible_user_id: "",
  notes: "",
};

const initialApplicationFormData = {
  title: "",
  description: "",
  status_code: "draft",
  submitted_date: "",
  review_date: "",
  decision_date: "",
  assigned_to_id: "",
  feedback: "",
  documents_url: "",
  notes: "",
};

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  submitted: "bg-info/10 text-info",
  under_review: "bg-warning/10 text-warning",
  approved: "bg-success/10 text-success",
  rejected: "bg-destructive/10 text-destructive",
  in_progress: "bg-primary/10 text-primary",
  completed: "bg-success/20 text-success",
  cancelled: "bg-muted text-muted-foreground",
};

export default function Grants() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterCompany, setFilterCompany] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [applicationDialogOpen, setApplicationDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedGrant, setSelectedGrant] = useState<Grant | null>(null);
  const [editingGrant, setEditingGrant] = useState<Grant | null>(null);
  const [grantApplications, setGrantApplications] = useState<GrantApplication[]>([]);
  const [applicationFormData, setApplicationFormData] = useState(initialApplicationFormData);
  const { toast } = useToast();
  const { user } = useAuth();
  const { canWrite } = useUserRoles();

  // Load catalog lookups for labels
  const { lookup: statusLookup } = useCatalogLookup("grant_statuses");
  const { lookup: typeLookup } = useCatalogLookup("grant_types");
  const { lookup: programLookup } = useCatalogLookup("grant_programs");
  const { lookup: priorityLookup } = useCatalogLookup("priority_levels");
  const { lookup: applicationStatusLookup } = useCatalogLookup("grant_application_statuses");

  // Load grants
  const { data: grants, loading, reload } = useDataLoader<Grant>(
    "grants",
    (query) => {
      let filteredQuery = query.order("created_at", { ascending: false });
      
      if (filterStatus && filterStatus !== "all") {
        filteredQuery = filteredQuery.eq("status_code", filterStatus);
      }
      if (filterType && filterType !== "all") {
        filteredQuery = filteredQuery.eq("type_code", filterType);
      }
      if (filterCompany && filterCompany !== "all") {
        filteredQuery = filteredQuery.eq("company_id", filterCompany);
      }
      
      return filteredQuery;
    }
  );

  // Load companies for dropdown
  const { data: companies } = useDataLoader<Empresa>("empresas", (query) =>
    query.select("id, nombre").order("nombre")
  );

  // Search filtered grants
  const filteredGrants = useLocalSearch(
    grants,
    searchTerm,
    ["title", "description"]
  );

  const [grantFormData, setGrantFormData] = useState(initialGrantFormData);

  const handleInputChange = (field: string, value: string | number) => {
    setGrantFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleApplicationInputChange = (field: string, value: string) => {
    setApplicationFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveGrant = async () => {
    if (!grantFormData.title || !grantFormData.company_id) {
      toast({
        title: "Error",
        description: "El título y la empresa son obligatorios",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const dataToSave = {
        title: grantFormData.title,
        description: grantFormData.description || null,
        status_code: grantFormData.status_code,
        type_code: grantFormData.type_code || null,
        program_code: grantFormData.program_code || null,
        priority_code: grantFormData.priority_code,
        amount_requested: grantFormData.amount_requested ? parseFloat(grantFormData.amount_requested) : null,
        amount_awarded: grantFormData.amount_awarded ? parseFloat(grantFormData.amount_awarded) : null,
        application_deadline: grantFormData.application_deadline || null,
        decision_date: grantFormData.decision_date || null,
        grant_period_start: grantFormData.grant_period_start || null,
        grant_period_end: grantFormData.grant_period_end || null,
        company_id: grantFormData.company_id,
        responsible_user_id: grantFormData.responsible_user_id || null,
        notes: grantFormData.notes || null,
        created_by: user?.id,
      };

      if (editingGrant) {
        const { error } = await supabase
          .from("grants")
          .update(dataToSave)
          .eq("id", editingGrant.id);

        if (error) throw error;

        toast({
          title: "Éxito",
          description: "Subvención actualizada correctamente",
        });
      } else {
        const { error } = await supabase
          .from("grants")
          .insert([dataToSave]);

        if (error) throw error;

        toast({
          title: "Éxito",
          description: "Subvención creada correctamente",
        });
      }

      reload();
      setDialogOpen(false);
      setGrantFormData(initialGrantFormData);
      setEditingGrant(null);
    } catch (error) {
      console.error("Error saving grant:", error);
      const errorMessage = error instanceof Error ? error.message : "Error al guardar la subvención";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteGrant = async (id: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta subvención?")) return;

    try {
      const { error } = await supabase
        .from("grants")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Subvención eliminada correctamente",
      });
      reload();
    } catch (error) {
      console.error("Error deleting grant:", error);
      const errorMessage = error instanceof Error ? error.message : "Error al eliminar la subvención";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleViewGrant = async (grant: Grant) => {
    setSelectedGrant(grant);
    
    // Load applications for this grant
    try {
      const { data: applications, error } = await supabase
        .from("grant_applications")
        .select("*")
        .eq("grant_id", grant.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setGrantApplications(applications || []);
    } catch (error) {
      console.error("Error loading applications:", error);
      toast({
        title: "Error",
        description: "Error al cargar las solicitudes",
        variant: "destructive",
      });
    }
    
    setDetailDialogOpen(true);
  };

  const handleEditGrant = (grant: Grant) => {
    setEditingGrant(grant);
    setGrantFormData({
      title: grant.title,
      description: grant.description || "",
      status_code: grant.status_code,
      type_code: grant.type_code || "",
      program_code: grant.program_code || "",
      priority_code: grant.priority_code || "medium",
      amount_requested: grant.amount_requested?.toString() || "",
      amount_awarded: grant.amount_awarded?.toString() || "",
      application_deadline: grant.application_deadline || "",
      decision_date: grant.decision_date || "",
      grant_period_start: grant.grant_period_start || "",
      grant_period_end: grant.grant_period_end || "",
      company_id: grant.company_id,
      responsible_user_id: grant.responsible_user_id || "",
      notes: grant.notes || "",
    });
    setDialogOpen(true);
  };

  const handleSaveApplication = async () => {
    if (!applicationFormData.title || !selectedGrant) {
      toast({
        title: "Error",
        description: "El título es obligatorio",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from("grant_applications")
        .insert([{
          grant_id: selectedGrant.id,
          title: applicationFormData.title,
          description: applicationFormData.description || null,
          status_code: applicationFormData.status_code,
          submitted_date: applicationFormData.submitted_date || null,
          review_date: applicationFormData.review_date || null,
          decision_date: applicationFormData.decision_date || null,
          assigned_to_id: applicationFormData.assigned_to_id || null,
          feedback: applicationFormData.feedback || null,
          documents_url: applicationFormData.documents_url || null,
          notes: applicationFormData.notes || null,
          created_by: user?.id,
        }]);

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Solicitud añadida correctamente",
      });

      // Reload applications
      const { data: applications, error: appsError } = await supabase
        .from("grant_applications")
        .select("*")
        .eq("grant_id", selectedGrant.id)
        .order("created_at", { ascending: false });

      if (appsError) throw appsError;
      setGrantApplications(applications || []);

      setApplicationDialogOpen(false);
      setApplicationFormData(initialApplicationFormData);
    } catch (error) {
      console.error("Error saving application:", error);
      const errorMessage = error instanceof Error ? error.message : "Error al guardar la solicitud";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteApplication = async (applicationId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta solicitud?")) return;

    try {
      const { error } = await supabase
        .from("grant_applications")
        .delete()
        .eq("id", applicationId);

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Solicitud eliminada correctamente",
      });

      // Reload applications
      if (selectedGrant) {
        const { data: applications, error: appsError } = await supabase
          .from("grant_applications")
          .select("*")
          .eq("grant_id", selectedGrant.id)
          .order("created_at", { ascending: false });

        if (appsError) throw appsError;
        setGrantApplications(applications || []);
      }
    } catch (error) {
      console.error("Error deleting application:", error);
      const errorMessage = error instanceof Error ? error.message : "Error al eliminar la solicitud";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const getCompanyName = (companyId: string) => {
    const company = companies?.find((c) => c.id === companyId);
    return company?.nombre || "Sin empresa";
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Subvenciones</h1>
          <p className="text-muted-foreground">Gestiona las subvenciones y solicitudes por empresa</p>
        </div>
        <PermissionButton onClick={() => {
          setEditingGrant(null);
          setGrantFormData(initialGrantFormData);
          setDialogOpen(true);
        }}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Subvención
        </PermissionButton>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Buscar</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar subvenciones..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Estado</Label>
              <CatalogSelect
                catalogType="grant_statuses"
                value={filterStatus}
                onChange={setFilterStatus}
                placeholder="Todos los estados"
                allowAll
              />
            </div>
            <div className="space-y-2">
              <Label>Tipo</Label>
              <CatalogSelect
                catalogType="grant_types"
                value={filterType}
                onChange={setFilterType}
                placeholder="Todos los tipos"
                allowAll
              />
            </div>
            <div className="space-y-2">
              <Label>Empresa</Label>
              <CatalogSelect
                catalogType="empresas"
                value={filterCompany}
                onChange={setFilterCompany}
                placeholder="Todas las empresas"
                allowAll
                customOptions={companies?.map(c => ({ value: c.id, label: c.nombre })) || []}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grants List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Lista de Subvenciones
            {filteredGrants && <span className="text-muted-foreground">({filteredGrants.length})</span>}
          </CardTitle>
          <CardDescription>
            Gestiona y da seguimiento a las subvenciones de las empresas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredGrants && filteredGrants.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Programa</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Monto Solicitado</TableHead>
                  <TableHead>Monto Aprobado</TableHead>
                  <TableHead>Fecha Límite</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredGrants.map((grant) => (
                  <TableRow key={grant.id}>
                    <TableCell className="font-medium">{grant.title}</TableCell>
                    <TableCell>{getCompanyName(grant.company_id)}</TableCell>
                    <TableCell>
                      {grant.type_code ? resolveLabelFromLookup(typeLookup, grant.type_code) : "-"}
                    </TableCell>
                    <TableCell>
                      {grant.program_code ? resolveLabelFromLookup(programLookup, grant.program_code) : "-"}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[grant.status_code] || ""}>
                        {resolveLabelFromLookup(statusLookup, grant.status_code)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {grant.amount_requested ? `€${grant.amount_requested.toLocaleString()}` : "-"}
                    </TableCell>
                    <TableCell>
                      {grant.amount_awarded ? `€${grant.amount_awarded.toLocaleString()}` : "-"}
                    </TableCell>
                    <TableCell>
                      {grant.application_deadline ? format(new Date(grant.application_deadline), "dd/MM/yyyy") : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewGrant(grant)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {canWrite && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditGrant(grant)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteGrant(grant.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No se encontraron subvenciones
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Grant Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingGrant ? "Editar Subvención" : "Nueva Subvención"}</DialogTitle>
            <DialogDescription>
              Completa los detalles de la subvención
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={grantFormData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Nombre de la subvención"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Empresa *</Label>
              <CatalogSelect
                catalogType="empresas"
                value={grantFormData.company_id}
                onChange={(value) => handleInputChange("company_id", value)}
                placeholder="Seleccionar empresa"
                customOptions={companies?.map(c => ({ value: c.id, label: c.nombre })) || []}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Estado</Label>
                <CatalogSelect
                  catalogType="grant_statuses"
                  value={grantFormData.status_code}
                  onChange={(value) => handleInputChange("status_code", value)}
                  placeholder="Seleccionar estado"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Prioridad</Label>
                <CatalogSelect
                  catalogType="priority_levels"
                  value={grantFormData.priority_code}
                  onChange={(value) => handleInputChange("priority_code", value)}
                  placeholder="Seleccionar prioridad"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Tipo</Label>
                <CatalogSelect
                  catalogType="grant_types"
                  value={grantFormData.type_code}
                  onChange={(value) => handleInputChange("type_code", value)}
                  placeholder="Seleccionar tipo"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="program">Programa</Label>
                <CatalogSelect
                  catalogType="grant_programs"
                  value={grantFormData.program_code}
                  onChange={(value) => handleInputChange("program_code", value)}
                  placeholder="Seleccionar programa"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount_requested">Monto Solicitado (€)</Label>
                <Input
                  id="amount_requested"
                  type="number"
                  step="0.01"
                  value={grantFormData.amount_requested}
                  onChange={(e) => handleInputChange("amount_requested", e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount_awarded">Monto Aprobado (€)</Label>
                <Input
                  id="amount_awarded"
                  type="number"
                  step="0.01"
                  value={grantFormData.amount_awarded}
                  onChange={(e) => handleInputChange("amount_awarded", e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="application_deadline">Fecha Límite</Label>
                <Input
                  id="application_deadline"
                  type="date"
                  value={grantFormData.application_deadline}
                  onChange={(e) => handleInputChange("application_deadline", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="decision_date">Fecha de Decisión</Label>
                <Input
                  id="decision_date"
                  type="date"
                  value={grantFormData.decision_date}
                  onChange={(e) => handleInputChange("decision_date", e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="grant_period_start">Inicio del Período</Label>
                <Input
                  id="grant_period_start"
                  type="date"
                  value={grantFormData.grant_period_start}
                  onChange={(e) => handleInputChange("grant_period_start", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="grant_period_end">Fin del Período</Label>
                <Input
                  id="grant_period_end"
                  type="date"
                  value={grantFormData.grant_period_end}
                  onChange={(e) => handleInputChange("grant_period_end", e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={grantFormData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Descripción de la subvención"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notas</Label>
              <Textarea
                id="notes"
                value={grantFormData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                placeholder="Notas adicionales"
                rows={2}
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveGrant} disabled={saving}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {editingGrant ? "Actualizar" : "Crear"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Grant Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5" />
              {selectedGrant?.title}
            </DialogTitle>
            <DialogDescription>
              Detalles de la subvención y solicitudes asociadas
            </DialogDescription>
          </DialogHeader>
          {selectedGrant && (
            <div className="space-y-6">
              {/* Grant Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Empresa</Label>
                  <p className="font-medium">{getCompanyName(selectedGrant.company_id)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Estado</Label>
                  <div className="mt-1">
                    <Badge className={statusColors[selectedGrant.status_code] || ""}>
                      {resolveLabelFromLookup(statusLookup, selectedGrant.status_code)}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Tipo</Label>
                  <p className="font-medium">
                    {selectedGrant.type_code ? resolveLabelFromLookup(typeLookup, selectedGrant.type_code) : "-"}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Programa</Label>
                  <p className="font-medium">
                    {selectedGrant.program_code ? resolveLabelFromLookup(programLookup, selectedGrant.program_code) : "-"}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Monto Solicitado</Label>
                  <p className="font-medium">
                    {selectedGrant.amount_requested ? `€${selectedGrant.amount_requested.toLocaleString()}` : "-"}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Monto Aprobado</Label>
                  <p className="font-medium">
                    {selectedGrant.amount_awarded ? `€${selectedGrant.amount_awarded.toLocaleString()}` : "-"}
                  </p>
                </div>
                {selectedGrant.application_deadline && (
                  <div>
                    <Label className="text-muted-foreground">Fecha Límite</Label>
                    <p className="font-medium">{format(new Date(selectedGrant.application_deadline), "dd/MM/yyyy")}</p>
                  </div>
                )}
                {selectedGrant.decision_date && (
                  <div>
                    <Label className="text-muted-foreground">Fecha de Decisión</Label>
                    <p className="font-medium">{format(new Date(selectedGrant.decision_date), "dd/MM/yyyy")}</p>
                  </div>
                )}
              </div>
              {selectedGrant.description && (
                <div>
                  <Label className="text-muted-foreground">Descripción</Label>
                  <p className="mt-1">{selectedGrant.description}</p>
                </div>
              )}

              {/* Applications Section */}
              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Solicitudes ({grantApplications.length})
                  </h3>
                  {canWrite && (
                    <Button
                      size="sm"
                      onClick={() => setApplicationDialogOpen(true)}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Nueva Solicitud
                    </Button>
                  )}
                </div>
                {grantApplications.length > 0 ? (
                  <div className="space-y-3">
                    {grantApplications.map((app) => (
                      <Card key={app.id}>
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between">
                            <div className="space-y-2 flex-1">
                              <div className="flex items-center gap-2">
                                <p className="font-medium">{app.title}</p>
                                <Badge className={statusColors[app.status_code] || ""}>
                                  {resolveLabelFromLookup(applicationStatusLookup, app.status_code)}
                                </Badge>
                              </div>
                              {app.description && (
                                <p className="text-sm text-muted-foreground">{app.description}</p>
                              )}
                              <div className="flex gap-4 text-xs text-muted-foreground">
                                {app.submitted_date && (
                                  <span>Enviada: {format(new Date(app.submitted_date), "dd/MM/yyyy")}</span>
                                )}
                                {app.decision_date && (
                                  <span>Decisión: {format(new Date(app.decision_date), "dd/MM/yyyy")}</span>
                                )}
                              </div>
                              {app.feedback && (
                                <div className="mt-2 p-2 bg-muted rounded text-sm">
                                  <Label className="text-xs text-muted-foreground">Feedback:</Label>
                                  <p className="mt-1">{app.feedback}</p>
                                </div>
                              )}
                            </div>
                            {canWrite && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteApplication(app.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    No hay solicitudes para esta subvención
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Application Dialog */}
      <Dialog open={applicationDialogOpen} onOpenChange={setApplicationDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nueva Solicitud</DialogTitle>
            <DialogDescription>
              Añade una nueva solicitud a esta subvención
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="app_title">Título *</Label>
              <Input
                id="app_title"
                value={applicationFormData.title}
                onChange={(e) => handleApplicationInputChange("title", e.target.value)}
                placeholder="Nombre de la solicitud"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="app_status">Estado</Label>
              <CatalogSelect
                catalogType="grant_application_statuses"
                value={applicationFormData.status_code}
                onChange={(value) => handleApplicationInputChange("status_code", value)}
                placeholder="Seleccionar estado"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="submitted_date">Fecha de Envío</Label>
                <Input
                  id="submitted_date"
                  type="date"
                  value={applicationFormData.submitted_date}
                  onChange={(e) => handleApplicationInputChange("submitted_date", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="review_date">Fecha de Revisión</Label>
                <Input
                  id="review_date"
                  type="date"
                  value={applicationFormData.review_date}
                  onChange={(e) => handleApplicationInputChange("review_date", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="app_decision_date">Fecha de Decisión</Label>
                <Input
                  id="app_decision_date"
                  type="date"
                  value={applicationFormData.decision_date}
                  onChange={(e) => handleApplicationInputChange("decision_date", e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="documents_url">URL de Documentos</Label>
              <Input
                id="documents_url"
                value={applicationFormData.documents_url}
                onChange={(e) => handleApplicationInputChange("documents_url", e.target.value)}
                placeholder="https://..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="app_description">Descripción</Label>
              <Textarea
                id="app_description"
                value={applicationFormData.description}
                onChange={(e) => handleApplicationInputChange("description", e.target.value)}
                placeholder="Descripción de la solicitud"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="feedback">Feedback</Label>
              <Textarea
                id="feedback"
                value={applicationFormData.feedback}
                onChange={(e) => handleApplicationInputChange("feedback", e.target.value)}
                placeholder="Comentarios o feedback"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="app_notes">Notas</Label>
              <Textarea
                id="app_notes"
                value={applicationFormData.notes}
                onChange={(e) => handleApplicationInputChange("notes", e.target.value)}
                placeholder="Notas adicionales"
                rows={2}
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setApplicationDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveApplication} disabled={saving}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Crear
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
