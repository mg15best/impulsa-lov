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
import { Plus, Search, Target, Filter, Loader2, Eye, Trash2, Edit, MessageSquare } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";
import { format } from "date-fns";

type Opportunity = Database["public"]["Tables"]["opportunities"]["Row"];
type OpportunityNote = Database["public"]["Tables"]["opportunity_notes"]["Row"];
type Empresa = Database["public"]["Tables"]["empresas"]["Row"];

const initialOpportunityFormData = {
  title: "",
  description: "",
  stage_code: "identification",
  status_code: "open",
  source_code: "",
  estimated_value: "",
  probability: 50,
  expected_close_date: "",
  company_id: "",
  assigned_to_id: "",
  notes: "",
};

const initialNoteFormData = {
  note: "",
};

const stageColors: Record<string, string> = {
  identification: "bg-muted text-muted-foreground",
  qualification: "bg-info/10 text-info",
  proposal: "bg-primary/10 text-primary",
  negotiation: "bg-warning/10 text-warning",
  closing: "bg-warning/20 text-warning",
  closed_won: "bg-success/10 text-success",
  closed_lost: "bg-destructive/10 text-destructive",
};

const statusColors: Record<string, string> = {
  open: "bg-info/10 text-info",
  in_progress: "bg-warning/10 text-warning",
  on_hold: "bg-muted text-muted-foreground",
  won: "bg-success/10 text-success",
  lost: "bg-destructive/10 text-destructive",
  cancelled: "bg-muted text-muted-foreground",
};

export default function Oportunidades() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStage, setFilterStage] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterCompany, setFilterCompany] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [editingOpportunity, setEditingOpportunity] = useState<Opportunity | null>(null);
  const [opportunityNotes, setOpportunityNotes] = useState<OpportunityNote[]>([]);
  const [noteFormData, setNoteFormData] = useState(initialNoteFormData);
  const { toast } = useToast();
  const { user } = useAuth();
  const { canWrite } = useUserRoles();

  // Load catalog lookups for labels
  const { lookup: stageLookup } = useCatalogLookup("opportunity_stages");
  const { lookup: statusLookup } = useCatalogLookup("opportunity_statuses");
  const { lookup: sourceLookup } = useCatalogLookup("lead_sources");

  // Load opportunities
  const { data: opportunities, loading, reload } = useDataLoader<Opportunity>(
    "opportunities",
    (query) => {
      let filteredQuery = query.order("created_at", { ascending: false });
      
      if (filterStage && filterStage !== "all") {
        filteredQuery = filteredQuery.eq("stage_code", filterStage);
      }
      if (filterStatus && filterStatus !== "all") {
        filteredQuery = filteredQuery.eq("status_code", filterStatus);
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

  // Search filtered opportunities
  const filteredOpportunities = useLocalSearch(
    opportunities,
    searchTerm,
    ["title", "description"]
  );

  const [opportunityFormData, setOpportunityFormData] = useState(initialOpportunityFormData);

  const handleInputChange = (field: string, value: string | number) => {
    setOpportunityFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNoteInputChange = (value: string) => {
    setNoteFormData({ note: value });
  };

  const handleSaveOpportunity = async () => {
    if (!opportunityFormData.title || !opportunityFormData.company_id) {
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
        title: opportunityFormData.title,
        description: opportunityFormData.description || null,
        stage_code: opportunityFormData.stage_code,
        status_code: opportunityFormData.status_code,
        source_code: opportunityFormData.source_code || null,
        estimated_value: opportunityFormData.estimated_value ? parseFloat(opportunityFormData.estimated_value) : null,
        probability: opportunityFormData.probability,
        expected_close_date: opportunityFormData.expected_close_date || null,
        company_id: opportunityFormData.company_id,
        assigned_to_id: opportunityFormData.assigned_to_id || null,
        notes: opportunityFormData.notes || null,
        created_by: user?.id,
      };

      if (editingOpportunity) {
        const { error } = await supabase
          .from("opportunities")
          .update(dataToSave)
          .eq("id", editingOpportunity.id);

        if (error) throw error;

        toast({
          title: "Éxito",
          description: "Oportunidad actualizada correctamente",
        });
      } else {
        const { error } = await supabase
          .from("opportunities")
          .insert([dataToSave]);

        if (error) throw error;

        toast({
          title: "Éxito",
          description: "Oportunidad creada correctamente",
        });
      }

      reload();
      setDialogOpen(false);
      setOpportunityFormData(initialOpportunityFormData);
      setEditingOpportunity(null);
    } catch (error) {
      console.error("Error saving opportunity:", error);
      const errorMessage = error instanceof Error ? error.message : "Error al guardar la oportunidad";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteOpportunity = async (id: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta oportunidad?")) return;

    try {
      const { error } = await supabase
        .from("opportunities")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Oportunidad eliminada correctamente",
      });
      reload();
    } catch (error) {
      console.error("Error deleting opportunity:", error);
      const errorMessage = error instanceof Error ? error.message : "Error al eliminar la oportunidad";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleViewOpportunity = async (opportunity: Opportunity) => {
    setSelectedOpportunity(opportunity);
    
    // Load notes for this opportunity
    try {
      const { data: notes, error } = await supabase
        .from("opportunity_notes")
        .select("*")
        .eq("opportunity_id", opportunity.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOpportunityNotes(notes || []);
    } catch (error) {
      console.error("Error loading notes:", error);
      toast({
        title: "Error",
        description: "Error al cargar las notas",
        variant: "destructive",
      });
    }
    
    setDetailDialogOpen(true);
  };

  const handleEditOpportunity = (opportunity: Opportunity) => {
    setEditingOpportunity(opportunity);
    setOpportunityFormData({
      title: opportunity.title,
      description: opportunity.description || "",
      stage_code: opportunity.stage_code,
      status_code: opportunity.status_code,
      source_code: opportunity.source_code || "",
      estimated_value: opportunity.estimated_value?.toString() || "",
      probability: opportunity.probability || 50,
      expected_close_date: opportunity.expected_close_date || "",
      company_id: opportunity.company_id,
      assigned_to_id: opportunity.assigned_to_id || "",
      notes: opportunity.notes || "",
    });
    setDialogOpen(true);
  };

  const handleSaveNote = async () => {
    if (!noteFormData.note || !selectedOpportunity) {
      toast({
        title: "Error",
        description: "La nota no puede estar vacía",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from("opportunity_notes")
        .insert([{
          opportunity_id: selectedOpportunity.id,
          note: noteFormData.note,
          created_by: user?.id,
        }]);

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Nota añadida correctamente",
      });

      // Reload notes
      const { data: notes, error: notesError } = await supabase
        .from("opportunity_notes")
        .select("*")
        .eq("opportunity_id", selectedOpportunity.id)
        .order("created_at", { ascending: false });

      if (notesError) throw notesError;
      setOpportunityNotes(notes || []);

      setNoteDialogOpen(false);
      setNoteFormData(initialNoteFormData);
    } catch (error) {
      console.error("Error saving note:", error);
      const errorMessage = error instanceof Error ? error.message : "Error al guardar la nota";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta nota?")) return;

    try {
      const { error } = await supabase
        .from("opportunity_notes")
        .delete()
        .eq("id", noteId);

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Nota eliminada correctamente",
      });

      // Reload notes
      if (selectedOpportunity) {
        const { data: notes, error: notesError } = await supabase
          .from("opportunity_notes")
          .select("*")
          .eq("opportunity_id", selectedOpportunity.id)
          .order("created_at", { ascending: false });

        if (notesError) throw notesError;
        setOpportunityNotes(notes || []);
      }
    } catch (error) {
      console.error("Error deleting note:", error);
      const errorMessage = error instanceof Error ? error.message : "Error al eliminar la nota";
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
          <h1 className="text-3xl font-bold tracking-tight">Oportunidades</h1>
          <p className="text-muted-foreground">Gestiona el pipeline de oportunidades por empresa</p>
        </div>
        <PermissionButton onClick={() => {
          setEditingOpportunity(null);
          setOpportunityFormData(initialOpportunityFormData);
          setDialogOpen(true);
        }}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Oportunidad
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
                  placeholder="Buscar oportunidades..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Empresa</Label>
              <CatalogSelect
                catalogType="empresas"
                value={filterCompany}
                onValueChange={setFilterCompany}
                placeholder="Todas las empresas"
                allowAll
                customOptions={companies?.map(c => ({ code: c.id, label: c.nombre })) || []}
              />
            </div>
            <div className="space-y-2">
              <Label>Etapa</Label>
              <CatalogSelect
                catalogType="opportunity_stages"
                value={filterStage}
                onValueChange={setFilterStage}
                placeholder="Todas las etapas"
                allowAll
              />
            </div>
            <div className="space-y-2">
              <Label>Estado</Label>
              <CatalogSelect
                catalogType="opportunity_statuses"
                value={filterStatus}
                onValueChange={setFilterStatus}
                placeholder="Todos los estados"
                allowAll
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Opportunities Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Lista de Oportunidades
          </CardTitle>
          <CardDescription>
            {filteredOpportunities?.length || 0} oportunidades encontradas
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
                  <TableHead>Etapa</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Valor Estimado</TableHead>
                  <TableHead>Probabilidad</TableHead>
                  <TableHead>Fecha Esperada</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOpportunities && filteredOpportunities.length > 0 ? (
                  filteredOpportunities.map((opportunity) => (
                    <TableRow key={opportunity.id}>
                      <TableCell className="font-medium">{opportunity.title}</TableCell>
                      <TableCell>{getCompanyName(opportunity.company_id)}</TableCell>
                      <TableCell>
                        <Badge className={stageColors[opportunity.stage_code] || ""}>
                          {resolveLabelFromLookup(stageLookup, opportunity.stage_code)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[opportunity.status_code] || ""}>
                          {resolveLabelFromLookup(statusLookup, opportunity.status_code)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {opportunity.estimated_value
                          ? new Intl.NumberFormat("es-ES", {
                              style: "currency",
                              currency: "EUR",
                            }).format(Number(opportunity.estimated_value))
                          : "-"}
                      </TableCell>
                      <TableCell>{opportunity.probability || 0}%</TableCell>
                      <TableCell>
                        {opportunity.expected_close_date
                          ? format(new Date(opportunity.expected_close_date), "dd/MM/yyyy")
                          : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewOpportunity(opportunity)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <PermissionButton
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditOpportunity(opportunity)}
                          >
                            <Edit className="h-4 w-4" />
                          </PermissionButton>
                          <PermissionButton
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteOpportunity(opportunity.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </PermissionButton>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground">
                      No se encontraron oportunidades
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Opportunity Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingOpportunity ? "Editar Oportunidad" : "Nueva Oportunidad"}
            </DialogTitle>
            <DialogDescription>
              {editingOpportunity
                ? "Modifica los datos de la oportunidad"
                : "Crea una nueva oportunidad en el pipeline"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={opportunityFormData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Nombre de la oportunidad"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company_id">Empresa *</Label>
              <CatalogSelect
                catalogType="empresas"
                value={opportunityFormData.company_id}
                onValueChange={(value) => handleInputChange("company_id", value)}
                placeholder="Selecciona una empresa"
                customOptions={companies?.map(c => ({ code: c.id, label: c.nombre })) || []}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stage_code">Etapa</Label>
                <CatalogSelect
                  catalogType="opportunity_stages"
                  value={opportunityFormData.stage_code}
                  onValueChange={(value) => handleInputChange("stage_code", value)}
                  placeholder="Selecciona una etapa"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status_code">Estado</Label>
                <CatalogSelect
                  catalogType="opportunity_statuses"
                  value={opportunityFormData.status_code}
                  onValueChange={(value) => handleInputChange("status_code", value)}
                  placeholder="Selecciona un estado"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="source_code">Origen</Label>
              <CatalogSelect
                catalogType="lead_sources"
                value={opportunityFormData.source_code}
                onValueChange={(value) => handleInputChange("source_code", value)}
                placeholder="Selecciona un origen"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="estimated_value">Valor Estimado (€)</Label>
                <Input
                  id="estimated_value"
                  type="number"
                  step="0.01"
                  value={opportunityFormData.estimated_value}
                  onChange={(e) => handleInputChange("estimated_value", e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="probability">Probabilidad (%)</Label>
                <Input
                  id="probability"
                  type="number"
                  min="0"
                  max="100"
                  value={opportunityFormData.probability}
                  onChange={(e) => handleInputChange("probability", parseInt(e.target.value) || 0)}
                  placeholder="50"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="expected_close_date">Fecha Esperada de Cierre</Label>
              <Input
                id="expected_close_date"
                type="date"
                value={opportunityFormData.expected_close_date}
                onChange={(e) => handleInputChange("expected_close_date", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={opportunityFormData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Descripción de la oportunidad"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notas</Label>
              <Textarea
                id="notes"
                value={opportunityFormData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                placeholder="Notas adicionales"
                rows={3}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveOpportunity} disabled={saving}>
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
        </DialogContent>
      </Dialog>

      {/* Detail Dialog with Notes */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles de la Oportunidad</DialogTitle>
            <DialogDescription>
              Información completa y notas de seguimiento
            </DialogDescription>
          </DialogHeader>
          {selectedOpportunity && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Título</Label>
                  <p className="font-medium">{selectedOpportunity.title}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Empresa</Label>
                  <p className="font-medium">{getCompanyName(selectedOpportunity.company_id)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Etapa</Label>
                  <Badge className={stageColors[selectedOpportunity.stage_code] || ""}>
                    {resolveLabelFromLookup(stageLookup, selectedOpportunity.stage_code)}
                  </Badge>
                </div>
                <div>
                  <Label className="text-muted-foreground">Estado</Label>
                  <Badge className={statusColors[selectedOpportunity.status_code] || ""}>
                    {resolveLabelFromLookup(statusLookup, selectedOpportunity.status_code)}
                  </Badge>
                </div>
                {selectedOpportunity.source_code && (
                  <div>
                    <Label className="text-muted-foreground">Origen</Label>
                    <p>{resolveLabelFromLookup(sourceLookup, selectedOpportunity.source_code)}</p>
                  </div>
                )}
                {selectedOpportunity.estimated_value && (
                  <div>
                    <Label className="text-muted-foreground">Valor Estimado</Label>
                    <p className="font-medium">
                      {new Intl.NumberFormat("es-ES", {
                        style: "currency",
                        currency: "EUR",
                      }).format(Number(selectedOpportunity.estimated_value))}
                    </p>
                  </div>
                )}
                <div>
                  <Label className="text-muted-foreground">Probabilidad</Label>
                  <p>{selectedOpportunity.probability || 0}%</p>
                </div>
                {selectedOpportunity.expected_close_date && (
                  <div>
                    <Label className="text-muted-foreground">Fecha Esperada de Cierre</Label>
                    <p>{format(new Date(selectedOpportunity.expected_close_date), "dd/MM/yyyy")}</p>
                  </div>
                )}
              </div>
              {selectedOpportunity.description && (
                <div>
                  <Label className="text-muted-foreground">Descripción</Label>
                  <p className="mt-1">{selectedOpportunity.description}</p>
                </div>
              )}
              {selectedOpportunity.notes && (
                <div>
                  <Label className="text-muted-foreground">Notas</Label>
                  <p className="mt-1">{selectedOpportunity.notes}</p>
                </div>
              )}

              {/* Notes Section */}
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Notas de Seguimiento
                  </h3>
                  <PermissionButton
                    size="sm"
                    onClick={() => setNoteDialogOpen(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Añadir Nota
                  </PermissionButton>
                </div>
                <div className="space-y-3">
                  {opportunityNotes.length > 0 ? (
                    opportunityNotes.map((note) => (
                      <Card key={note.id}>
                        <CardContent className="pt-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="text-sm">{note.note}</p>
                              <p className="text-xs text-muted-foreground mt-2">
                                {format(new Date(note.created_at), "dd/MM/yyyy HH:mm")}
                              </p>
                            </div>
                            {canWrite && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteNote(note.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No hay notas de seguimiento
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Note Dialog */}
      <Dialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Añadir Nota</DialogTitle>
            <DialogDescription>
              Añade una nota de seguimiento para esta oportunidad
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="note">Nota</Label>
              <Textarea
                id="note"
                value={noteFormData.note}
                onChange={(e) => handleNoteInputChange(e.target.value)}
                placeholder="Escribe tu nota aquí..."
                rows={4}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setNoteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveNote} disabled={saving}>
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
        </DialogContent>
      </Dialog>
    </div>
  );
}
