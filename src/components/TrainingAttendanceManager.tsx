import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";
import { useDataLoader } from "@/hooks/useDataLoader";
import { useCatalogLookup, resolveLabelFromLookup } from "@/hooks/useCatalog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CatalogSelect } from "@/components/CatalogSelect";
import { PermissionButton } from "@/components/PermissionButton";
import { Plus, Users, Loader2, CheckCircle, XCircle } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type TrainingAttendance = Database["public"]["Tables"]["training_attendance"]["Row"];
type AttendanceStatus = Database["public"]["Enums"]["attendance_status"];

interface TrainingAttendanceManagerProps {
  formacionId: string;
  formacionTitulo: string;
}

const statusColors: Record<AttendanceStatus, string> = {
  registered: "bg-muted text-muted-foreground",
  confirmed: "bg-info/10 text-info",
  attended: "bg-success/10 text-success",
  no_show: "bg-warning/10 text-warning",
  cancelled: "bg-destructive/10 text-destructive",
};

export function TrainingAttendanceManager({ formacionId, formacionTitulo }: TrainingAttendanceManagerProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { lookup: statusLookup } = useCatalogLookup('attendance_statuses');

  const { data: attendances, loading, reload } = useDataLoader<TrainingAttendance>(
    "training_attendance",
    (query) => query.eq("formacion_id", formacionId).order("created_at", { ascending: false }),
    [formacionId]
  );

  const [formData, setFormData] = useState({
    attendee_name: "",
    attendee_email: "",
    attendee_phone: "",
    attendee_position: "",
    status: "registered" as AttendanceStatus,
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !supabase) return;

    setSaving(true);
    const { error } = await supabase.from("training_attendance").insert({
      formacion_id: formacionId,
      ...formData,
      created_by: user.id,
    });

    if (error) {
      toast({ 
        title: "Error al registrar asistente", 
        description: error.message, 
        variant: "destructive" 
      });
    } else {
      toast({ 
        title: "Asistente registrado", 
        description: "El asistente se ha registrado correctamente." 
      });
      setDialogOpen(false);
      setFormData({
        attendee_name: "",
        attendee_email: "",
        attendee_phone: "",
        attendee_position: "",
        status: "registered",
        notes: "",
      });
      reload();
    }
    setSaving(false);
  };

  const handleUpdateStatus = async (attendanceId: string, newStatus: AttendanceStatus) => {
    if (!supabase) return;

    const { error } = await supabase
      .from("training_attendance")
      .update({ 
        status: newStatus,
        attendance_date: newStatus === 'attended' ? new Date().toISOString() : null
      })
      .eq("id", attendanceId);

    if (error) {
      toast({ 
        title: "Error al actualizar estado", 
        description: error.message, 
        variant: "destructive" 
      });
    } else {
      toast({ 
        title: "Estado actualizado", 
        description: "El estado del asistente se ha actualizado correctamente." 
      });
      reload();
    }
  };

  if (!supabase) return null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Asistencia - {formacionTitulo}
            </CardTitle>
            <CardDescription>
              {attendances.length} asistentes registrados
            </CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <PermissionButton action="create" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Añadir Asistente
              </PermissionButton>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Registrar Asistente</DialogTitle>
                <DialogDescription>
                  Añadir un nuevo asistente a la formación
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="attendee_name">Nombre *</Label>
                  <Input
                    id="attendee_name"
                    value={formData.attendee_name}
                    onChange={(e) => setFormData({ ...formData, attendee_name: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="attendee_email">Email</Label>
                    <Input
                      id="attendee_email"
                      type="email"
                      value={formData.attendee_email}
                      onChange={(e) => setFormData({ ...formData, attendee_email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="attendee_phone">Teléfono</Label>
                    <Input
                      id="attendee_phone"
                      value={formData.attendee_phone}
                      onChange={(e) => setFormData({ ...formData, attendee_phone: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="attendee_position">Cargo</Label>
                    <Input
                      id="attendee_position"
                      value={formData.attendee_position}
                      onChange={(e) => setFormData({ ...formData, attendee_position: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Estado</Label>
                    <CatalogSelect
                      catalogType="attendance_statuses"
                      value={formData.status}
                      onValueChange={(v) => setFormData({ ...formData, status: v as AttendanceStatus })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notas</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : attendances.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Users className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">No hay asistentes registrados</p>
            <p className="text-sm text-muted-foreground">
              Añade el primer asistente usando el botón "Añadir Asistente"
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Cargo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attendances.map((attendance) => (
                <TableRow key={attendance.id}>
                  <TableCell className="font-medium">{attendance.attendee_name}</TableCell>
                  <TableCell>{attendance.attendee_email || "-"}</TableCell>
                  <TableCell>{attendance.attendee_position || "-"}</TableCell>
                  <TableCell>
                    <Badge className={statusColors[attendance.status]}>
                      {resolveLabelFromLookup(statusLookup, attendance.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {attendance.status !== 'attended' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleUpdateStatus(attendance.id, 'attended')}
                          title="Marcar como asistido"
                        >
                          <CheckCircle className="h-4 w-4 text-success" />
                        </Button>
                      )}
                      {attendance.status !== 'no_show' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleUpdateStatus(attendance.id, 'no_show')}
                          title="Marcar como no asistido"
                        >
                          <XCircle className="h-4 w-4 text-warning" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
