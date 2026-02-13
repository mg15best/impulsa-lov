import { useState } from "react";
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
import { PermissionButton } from "@/components/PermissionButton";
import { Plus, Search, CheckSquare, Filter, Loader2, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import {
  initialTaskFormData,
  taskEntityTypeLabels,
  taskPriorityColors,
  taskPriorityLabels,
  taskStatusColors,
  taskStatusLabels,
} from "@/domains/tasks/constants";
import type { Task, TaskEntityType, TaskPriority, TaskStatus } from "@/domains/tasks/types";
import { buildTaskPayload, createTask, deleteTask, taskToFormData, updateTask } from "@/domains/tasks/taskService";
import { useTasksPageData } from "@/domains/tasks/useTasksPageData";
import { TaskSourceBadge } from "@/domains/tasks/components/TaskSourceBadge";

export default function Tareas() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEstado, setFilterEstado] = useState<string>("all");
  const [filterPrioridad, setFilterPrioridad] = useState<string>("all");
  const [filterEntityType, setFilterEntityType] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
    const { tasks: filteredTasks, tasksLoading: loading, reloadTasks: reload, empresas } = useTasksPageData({
    filterEstado,
    filterPrioridad,
    filterEntityType,
    searchTerm,
  });

  const [formData, setFormData] = useState(initialTaskFormData);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!formData.titulo) {
      toast({
        title: "Error",
        description: "El título es obligatorio",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const payload = buildTaskPayload(formData);

      if (selectedTask) {
        await updateTask(selectedTask.id, payload);

        toast({
          title: "Éxito",
          description: "Tarea actualizada correctamente",
        });
      } else {
        await createTask(payload);

        toast({
          title: "Éxito",
          description: "Tarea creada correctamente",
        });
      }

      setDialogOpen(false);
      setSelectedTask(null);
      setFormData(initialTaskFormData);
      reload();
    } catch (error) {
      console.error("Error saving task:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al guardar la tarea",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (task: Task) => {
    setSelectedTask(task);
    setFormData(taskToFormData(task));
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta tarea?")) {
      return;
    }

    try {
      await deleteTask(id);

      toast({
        title: "Éxito",
        description: "Tarea eliminada correctamente",
      });
      reload();
    } catch (error) {
      console.error("Error deleting task:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al eliminar la tarea",
        variant: "destructive",
      });
    }
  };

  const handleNewTask = () => {
    setSelectedTask(null);
    setFormData(initialTaskFormData);
    setDialogOpen(true);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CheckSquare className="h-5 w-5" />
                Gestión de Tareas
              </CardTitle>
              <CardDescription>
                Administra tareas y asignaciones del sistema
              </CardDescription>
            </div>
            <PermissionButton action="create" entity="tasks" onClick={handleNewTask}>
              <Plus className="h-4 w-4" />
              Nueva tarea
            </PermissionButton>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and filters */}
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar tareas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterEstado} onValueChange={setFilterEstado}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                {Object.entries(taskStatusLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterPrioridad} onValueChange={setFilterPrioridad}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Prioridad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las prioridades</SelectItem>
                {Object.entries(taskPriorityLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterEntityType} onValueChange={setFilterEntityType}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Tipo entidad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las entidades</SelectItem>
                {Object.entries(taskEntityTypeLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tasks table */}
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No se encontraron tareas</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Prioridad</TableHead>
                    <TableHead>Tipo entidad</TableHead>
                    <TableHead>Origen</TableHead>
                    <TableHead>Vencimiento</TableHead>
                    <TableHead>Creada</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTasks.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell className="font-medium">
                        <div>
                          <div>{task.titulo}</div>
                          {task.descripcion && (
                            <div className="text-sm text-muted-foreground line-clamp-1">
                              {task.descripcion}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={taskStatusColors[task.estado]}>
                          {taskStatusLabels[task.estado]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={taskPriorityColors[task.prioridad]}>
                          {taskPriorityLabels[task.prioridad]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {taskEntityTypeLabels[task.entity_type]}
                        </span>
                      </TableCell>
                      <TableCell>
                        <TaskSourceBadge source={task.source} />
                      </TableCell>
                      <TableCell>
                        {task.fecha_vencimiento ? (
                          <span className="text-sm">
                            {format(new Date(task.fecha_vencimiento), "dd/MM/yyyy")}
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(task.created_at), "dd/MM/yyyy")}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <PermissionButton
                            action="edit"
                            entity="tasks"
                            onClick={() => handleEdit(task)}
                            variant="ghost"
                            size="sm"
                          >
                            <Edit className="h-4 w-4" />
                          </PermissionButton>
                          <PermissionButton
                            action="delete"
                            entity="tasks"
                            onClick={() => handleDelete(task.id)}
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
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

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedTask ? "Editar tarea" : "Nueva tarea"}
            </DialogTitle>
            <DialogDescription>
              {selectedTask
                ? "Modifica los datos de la tarea"
                : "Completa los datos para crear una nueva tarea"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Título */}
            <div className="space-y-2">
              <Label htmlFor="titulo">
                Título <span className="text-destructive">*</span>
              </Label>
              <Input
                id="titulo"
                value={formData.titulo}
                onChange={(e) => handleInputChange("titulo", e.target.value)}
                placeholder="Título de la tarea"
              />
            </div>

            {/* Descripción */}
            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                value={formData.descripcion}
                onChange={(e) => handleInputChange("descripcion", e.target.value)}
                placeholder="Descripción detallada de la tarea"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Estado */}
              <div className="space-y-2">
                <Label htmlFor="estado">Estado</Label>
                <Select
                  value={formData.estado}
                  onValueChange={(value) => handleInputChange("estado", value)}
                >
                  <SelectTrigger id="estado">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(taskStatusLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Prioridad */}
              <div className="space-y-2">
                <Label htmlFor="prioridad">Prioridad</Label>
                <Select
                  value={formData.prioridad}
                  onValueChange={(value) => handleInputChange("prioridad", value)}
                >
                  <SelectTrigger id="prioridad">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(taskPriorityLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Tipo de entidad */}
              <div className="space-y-2">
                <Label htmlFor="entity_type">Tipo de entidad</Label>
                <Select
                  value={formData.entity_type}
                  onValueChange={(value) => handleInputChange("entity_type", value)}
                >
                  <SelectTrigger id="entity_type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(taskEntityTypeLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Entity selection (only for empresa initially) */}
              {formData.entity_type === "empresa" && (
                <div className="space-y-2">
                  <Label htmlFor="entity_id">Empresa</Label>
                  <Select
                    value={formData.entity_id}
                    onValueChange={(value) => handleInputChange("entity_id", value)}
                  >
                    <SelectTrigger id="entity_id">
                      <SelectValue placeholder="Selecciona empresa" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Ninguna</SelectItem>
                      {empresas?.map((empresa) => (
                        <SelectItem key={empresa.id} value={empresa.id}>
                          {empresa.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Fecha inicio */}
              <div className="space-y-2">
                <Label htmlFor="fecha_inicio">Fecha inicio</Label>
                <Input
                  id="fecha_inicio"
                  type="date"
                  value={formData.fecha_inicio}
                  onChange={(e) => handleInputChange("fecha_inicio", e.target.value)}
                />
              </div>

              {/* Fecha vencimiento */}
              <div className="space-y-2">
                <Label htmlFor="fecha_vencimiento">Fecha vencimiento</Label>
                <Input
                  id="fecha_vencimiento"
                  type="date"
                  value={formData.fecha_vencimiento}
                  onChange={(e) => handleInputChange("fecha_vencimiento", e.target.value)}
                />
              </div>
            </div>

            {/* Observaciones */}
            <div className="space-y-2">
              <Label htmlFor="observaciones">Observaciones</Label>
              <Textarea
                id="observaciones"
                value={formData.observaciones}
                onChange={(e) => handleInputChange("observaciones", e.target.value)}
                placeholder="Observaciones adicionales"
                rows={2}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setDialogOpen(false);
                setSelectedTask(null);
                setFormData(initialTaskFormData);
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving}>
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
