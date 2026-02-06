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
import { Plus, Search, ListChecks, Filter, Loader2, Eye, Trash2, Edit } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";
import { format } from "date-fns";

type ActionPlan = Database["public"]["Tables"]["action_plans"]["Row"];
type ActionPlanItem = Database["public"]["Tables"]["action_plan_items"]["Row"];
type Empresa = Database["public"]["Tables"]["empresas"]["Row"];

const initialPlanFormData = {
  title: "",
  description: "",
  status_code: "draft",
  category_code: "",
  priority_code: "medium",
  start_date: "",
  end_date: "",
  progress: 0,
  company_id: "",
  responsible_user_id: "",
  notes: "",
};

const initialItemFormData = {
  title: "",
  description: "",
  status_code: "pending",
  priority_code: "medium",
  due_date: "",
  assigned_to_id: "",
  notes: "",
};

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  active: "bg-info/10 text-info",
  in_progress: "bg-warning/10 text-warning",
  completed: "bg-success/10 text-success",
  on_hold: "bg-muted text-muted-foreground",
  cancelled: "bg-destructive/10 text-destructive",
  pending: "bg-muted text-muted-foreground",
  blocked: "bg-destructive/10 text-destructive",
};

const priorityColors: Record<string, string> = {
  critical: "bg-destructive/10 text-destructive",
  high: "bg-warning/10 text-warning",
  medium: "bg-info/10 text-info",
  low: "bg-muted text-muted-foreground",
};

export default function PlanesAccion() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterCompany, setFilterCompany] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<ActionPlan | null>(null);
  const [editingPlan, setEditingPlan] = useState<ActionPlan | null>(null);
  const [planItems, setPlanItems] = useState<ActionPlanItem[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();
  const { canWrite } = useUserRoles();

  // Load action plans
  const { data: actionPlans, loading, reload } = useDataLoader<ActionPlan>(
    "action_plans",
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
  const filteredPlans = useLocalSearch(
    actionPlans,
    searchTerm,
    (plan, term) =>
      plan.title.toLowerCase().includes(term) ||
      plan.description?.toLowerCase().includes(term)
  );

  const [planFormData, setPlanFormData] = useState(initialPlanFormData);
  const [itemFormData, setItemFormData] = useState(initialItemFormData);

  const handleViewDetails = async (plan: ActionPlan) => {
    if (!supabase) return;
    
    setSelectedPlan(plan);
    
    // Fetch items for this plan
    const { data, error } = await supabase
      .from("action_plan_items")
      .select("*")
      .eq("action_plan_id", plan.id)
      .order("order_index", { ascending: true });
    
    if (error) {
      toast({ title: "Error", description: "No se pudo obtener los items del plan", variant: "destructive" });
      setPlanItems([]);
    } else {
      setPlanItems(data || []);
    }
    
    setDetailDialogOpen(true);
  };

  const handleEditPlan = (plan: ActionPlan) => {
    setEditingPlan(plan);
    setPlanFormData({
      title: plan.title,
      description: plan.description || "",
      status_code: plan.status_code,
      category_code: plan.category_code || "",
      priority_code: plan.priority_code || "medium",
      start_date: plan.start_date || "",
      end_date: plan.end_date || "",
      progress: plan.progress || 0,
      company_id: plan.company_id,
      responsible_user_id: plan.responsible_user_id || "",
      notes: plan.notes || "",
    });
    setDialogOpen(true);
  };

  const handleSubmitPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !supabase) return;

    setSaving(true);
    
    const planData = {
      ...planFormData,
      progress: Number(planFormData.progress),
      responsible_user_id: planFormData.responsible_user_id || null,
    };

    if (editingPlan) {
      // Update existing plan
      const { error } = await supabase
        .from("action_plans")
        .update(planData)
        .eq("id", editingPlan.id);

      if (error) {
        toast({ title: "Error al actualizar plan", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Plan actualizado", description: "El plan de acción se ha actualizado correctamente." });
        setDialogOpen(false);
        setEditingPlan(null);
        setPlanFormData(initialPlanFormData);
        reload();
      }
    } else {
      // Create new plan
      const { error } = await supabase.from("action_plans").insert({
        ...planData,
        created_by: user.id,
      });

      if (error) {
        toast({ title: "Error al crear plan", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Plan creado", description: "El plan de acción se ha creado correctamente." });
        setDialogOpen(false);
        setPlanFormData(initialPlanFormData);
        reload();
      }
    }
    setSaving(false);
  };

  const handleDeletePlan = async (planId: string) => {
    if (!supabase || !confirm("¿Estás seguro de que deseas eliminar este plan de acción?")) return;

    const { error } = await supabase
      .from("action_plans")
      .delete()
      .eq("id", planId);

    if (error) {
      toast({ title: "Error al eliminar plan", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Plan eliminado", description: "El plan de acción se ha eliminado correctamente." });
      reload();
    }
  };

  const handleSubmitItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !supabase || !selectedPlan) return;

    setSaving(true);
    
    const itemData = {
      ...itemFormData,
      action_plan_id: selectedPlan.id,
      assigned_to_id: itemFormData.assigned_to_id || null,
      order_index: planItems.length,
      created_by: user.id,
    };

    const { error } = await supabase.from("action_plan_items").insert(itemData);

    if (error) {
      toast({ title: "Error al crear item", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Item creado", description: "El item se ha creado correctamente." });
      setItemDialogOpen(false);
      setItemFormData(initialItemFormData);
      // Refresh items
      handleViewDetails(selectedPlan);
    }
    setSaving(false);
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!supabase || !selectedPlan || !confirm("¿Estás seguro de que deseas eliminar este item?")) return;

    const { error } = await supabase
      .from("action_plan_items")
      .delete()
      .eq("id", itemId);

    if (error) {
      toast({ title: "Error al eliminar item", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Item eliminado", description: "El item se ha eliminado correctamente." });
      // Refresh items
      handleViewDetails(selectedPlan);
    }
  };

  const getCompanyName = (companyId: string) => {
    const company = empresas?.find(e => e.id === companyId);
    return company?.nombre || "N/A";
  };

  if (!supabase) {
    return (
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Planes de Acción</h1>
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
          <h1 className="text-3xl font-bold tracking-tight">Planes de Acción</h1>
          <p className="text-muted-foreground">
            Gestión de planes de acción y sus items asociados
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setEditingPlan(null);
            setPlanFormData(initialPlanFormData);
          }
        }}>
          <DialogTrigger asChild>
            <PermissionButton action="create">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Plan
            </PermissionButton>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{editingPlan ? "Editar Plan de Acción" : "Crear Nuevo Plan de Acción"}</DialogTitle>
              <DialogDescription>
                Completa los datos del plan de acción
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmitPlan} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={planFormData.title}
                  onChange={(e) => setPlanFormData({ ...planFormData, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company_id">Empresa *</Label>
                <select
                  id="company_id"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  value={planFormData.company_id}
                  onChange={(e) => setPlanFormData({ ...planFormData, company_id: e.target.value })}
                  required
                >
                  <option value="">Seleccionar empresa...</option>
                  {empresas?.map((empresa) => (
                    <option key={empresa.id} value={empresa.id}>
                      {empresa.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={planFormData.description}
                  onChange={(e) => setPlanFormData({ ...planFormData, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="status_code">Estado *</Label>
                  <CatalogSelect
                    catalogType="action_plan_statuses"
                    value={planFormData.status_code}
                    onValueChange={(value) => setPlanFormData({ ...planFormData, status_code: value })}
                    placeholder="Seleccionar estado..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category_code">Categoría</Label>
                  <CatalogSelect
                    catalogType="action_plan_categories"
                    value={planFormData.category_code}
                    onValueChange={(value) => setPlanFormData({ ...planFormData, category_code: value })}
                    placeholder="Seleccionar categoría..."
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="priority_code">Prioridad</Label>
                  <CatalogSelect
                    catalogType="priority_levels"
                    value={planFormData.priority_code}
                    onValueChange={(value) => setPlanFormData({ ...planFormData, priority_code: value })}
                    placeholder="Seleccionar prioridad..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="progress">Progreso (%)</Label>
                  <Input
                    id="progress"
                    type="number"
                    min="0"
                    max="100"
                    value={planFormData.progress}
                    onChange={(e) => setPlanFormData({ ...planFormData, progress: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Fecha Inicio</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={planFormData.start_date}
                    onChange={(e) => setPlanFormData({ ...planFormData, start_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_date">Fecha Fin</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={planFormData.end_date}
                    onChange={(e) => setPlanFormData({ ...planFormData, end_date: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notas</Label>
                <Textarea
                  id="notes"
                  value={planFormData.notes}
                  onChange={(e) => setPlanFormData({ ...planFormData, notes: e.target.value })}
                  rows={2}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => {
                  setDialogOpen(false);
                  setEditingPlan(null);
                  setPlanFormData(initialPlanFormData);
                }}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingPlan ? "Actualizar" : "Crear"} Plan
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ListChecks className="h-5 w-5" />
            Lista de Planes de Acción
          </CardTitle>
          <CardDescription>
            {filteredPlans.length} plan(es) registrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar planes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
                className="pl-8"
              />
            </div>
            <div className="flex gap-2">
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm sm:w-[180px]"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">Todos los estados</option>
                <option value="draft">Borrador</option>
                <option value="active">Activo</option>
                <option value="in_progress">En Progreso</option>
                <option value="completed">Completado</option>
                <option value="on_hold">En Espera</option>
                <option value="cancelled">Cancelado</option>
              </select>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm sm:w-[200px]"
                value={filterCompany}
                onChange={(e) => setFilterCompany(e.target.value)}
              >
                <option value="all">Todas las empresas</option>
                {empresas?.map((empresa) => (
                  <option key={empresa.id} value={empresa.id}>
                    {empresa.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredPlans.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No se encontraron planes de acción
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Prioridad</TableHead>
                    <TableHead>Progreso</TableHead>
                    <TableHead>Fecha Inicio</TableHead>
                    <TableHead>Fecha Fin</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPlans.map((plan) => (
                    <TableRow key={plan.id}>
                      <TableCell className="font-medium">{plan.title}</TableCell>
                      <TableCell>{getCompanyName(plan.company_id)}</TableCell>
                      <TableCell>
                        <Badge className={statusColors[plan.status_code] || ""}>
                          {plan.status_code}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={priorityColors[plan.priority_code || "medium"] || ""}>
                          {plan.priority_code || "medium"}
                        </Badge>
                      </TableCell>
                      <TableCell>{plan.progress}%</TableCell>
                      <TableCell>
                        {plan.start_date ? format(new Date(plan.start_date), "dd/MM/yyyy") : "-"}
                      </TableCell>
                      <TableCell>
                        {plan.end_date ? format(new Date(plan.end_date), "dd/MM/yyyy") : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetails(plan)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <PermissionButton
                            action="edit"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditPlan(plan)}
                          >
                            <Edit className="h-4 w-4" />
                          </PermissionButton>
                          <PermissionButton
                            action="delete"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeletePlan(plan.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </PermissionButton>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog with Items */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Detalles del Plan de Acción</DialogTitle>
            <DialogDescription>
              {selectedPlan?.title}
            </DialogDescription>
          </DialogHeader>
          {selectedPlan && (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label className="text-muted-foreground">Empresa</Label>
                  <p className="font-medium">{getCompanyName(selectedPlan.company_id)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Estado</Label>
                  <div className="mt-1">
                    <Badge className={statusColors[selectedPlan.status_code] || ""}>
                      {selectedPlan.status_code}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Prioridad</Label>
                  <div className="mt-1">
                    <Badge className={priorityColors[selectedPlan.priority_code || "medium"] || ""}>
                      {selectedPlan.priority_code || "medium"}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Progreso</Label>
                  <p className="font-medium">{selectedPlan.progress}%</p>
                </div>
              </div>
              {selectedPlan.description && (
                <div>
                  <Label className="text-muted-foreground">Descripción</Label>
                  <p className="mt-1">{selectedPlan.description}</p>
                </div>
              )}
              
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Items del Plan</h3>
                  <Dialog open={itemDialogOpen} onOpenChange={setItemDialogOpen}>
                    <DialogTrigger asChild>
                      <PermissionButton action="create" size="sm">
                        <Plus className="mr-2 h-4 w-4" />
                        Nuevo Item
                      </PermissionButton>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                      <DialogHeader>
                        <DialogTitle>Crear Nuevo Item</DialogTitle>
                        <DialogDescription>
                          Añadir un nuevo item al plan de acción
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleSubmitItem} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="item_title">Título *</Label>
                          <Input
                            id="item_title"
                            value={itemFormData.title}
                            onChange={(e) => setItemFormData({ ...itemFormData, title: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="item_description">Descripción</Label>
                          <Textarea
                            id="item_description"
                            value={itemFormData.description}
                            onChange={(e) => setItemFormData({ ...itemFormData, description: e.target.value })}
                            rows={3}
                          />
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="item_status">Estado *</Label>
                            <CatalogSelect
                              catalogType="action_plan_item_statuses"
                              value={itemFormData.status_code}
                              onValueChange={(value) => setItemFormData({ ...itemFormData, status_code: value })}
                              placeholder="Seleccionar estado..."
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="item_priority">Prioridad</Label>
                            <CatalogSelect
                              catalogType="priority_levels"
                              value={itemFormData.priority_code}
                              onValueChange={(value) => setItemFormData({ ...itemFormData, priority_code: value })}
                              placeholder="Seleccionar prioridad..."
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="item_due_date">Fecha Límite</Label>
                          <Input
                            id="item_due_date"
                            type="date"
                            value={itemFormData.due_date}
                            onChange={(e) => setItemFormData({ ...itemFormData, due_date: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="item_notes">Notas</Label>
                          <Textarea
                            id="item_notes"
                            value={itemFormData.notes}
                            onChange={(e) => setItemFormData({ ...itemFormData, notes: e.target.value })}
                            rows={2}
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button type="button" variant="outline" onClick={() => {
                            setItemDialogOpen(false);
                            setItemFormData(initialItemFormData);
                          }}>
                            Cancelar
                          </Button>
                          <Button type="submit" disabled={saving}>
                            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Crear Item
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
                
                {planItems.length === 0 ? (
                  <div className="py-4 text-center text-muted-foreground">
                    No hay items en este plan
                  </div>
                ) : (
                  <div className="space-y-2">
                    {planItems.map((item) => (
                      <Card key={item.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium">{item.title}</h4>
                                <Badge className={statusColors[item.status_code] || ""} variant="outline">
                                  {item.status_code}
                                </Badge>
                                <Badge className={priorityColors[item.priority_code || "medium"] || ""} variant="outline">
                                  {item.priority_code || "medium"}
                                </Badge>
                              </div>
                              {item.description && (
                                <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                              )}
                              {item.due_date && (
                                <p className="mt-1 text-xs text-muted-foreground">
                                  Fecha límite: {format(new Date(item.due_date), "dd/MM/yyyy")}
                                </p>
                              )}
                            </div>
                            <PermissionButton
                              action="delete"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteItem(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </PermissionButton>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
