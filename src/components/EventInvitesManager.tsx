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
import { Plus, Mail, Loader2, CheckCircle, XCircle } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type EventInvite = Database["public"]["Tables"]["event_invites"]["Row"];
type InviteStatus = Database["public"]["Enums"]["invite_status"];

interface EventInvitesManagerProps {
  eventoId: string;
  eventoNombre: string;
}

const statusColors: Record<InviteStatus, string> = {
  pending: "bg-muted text-muted-foreground",
  sent: "bg-info/10 text-info",
  accepted: "bg-success/10 text-success",
  declined: "bg-destructive/10 text-destructive",
};

export function EventInvitesManager({ eventoId, eventoNombre }: EventInvitesManagerProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { lookup: statusLookup } = useCatalogLookup('invite_statuses');

  const { data: invites, loading, reload } = useDataLoader<EventInvite>(
    "event_invites",
    (query) => query.eq("evento_id", eventoId).order("created_at", { ascending: false }),
    [eventoId]
  );

  const [formData, setFormData] = useState({
    invitee_name: "",
    invitee_email: "",
    invitee_phone: "",
    invitee_position: "",
    status: "pending" as InviteStatus,
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !supabase) return;

    setSaving(true);
    const { error } = await supabase.from("event_invites").insert({
      evento_id: eventoId,
      ...formData,
      created_by: user.id,
    });

    if (error) {
      toast({ 
        title: "Error al crear invitación", 
        description: error.message, 
        variant: "destructive" 
      });
    } else {
      toast({ 
        title: "Invitación creada", 
        description: "La invitación se ha creado correctamente." 
      });
      setDialogOpen(false);
      setFormData({
        invitee_name: "",
        invitee_email: "",
        invitee_phone: "",
        invitee_position: "",
        status: "pending",
        notes: "",
      });
      reload();
    }
    setSaving(false);
  };

  const handleUpdateStatus = async (inviteId: string, newStatus: InviteStatus) => {
    if (!supabase) return;

    const updates: { 
      status: InviteStatus; 
      sent_date?: string; 
      response_date?: string; 
    } = { status: newStatus };
    if (newStatus === 'sent' && !invites.find(i => i.id === inviteId)?.sent_date) {
      updates.sent_date = new Date().toISOString();
    }
    if (newStatus === 'accepted' || newStatus === 'declined') {
      updates.response_date = new Date().toISOString();
    }

    const { error } = await supabase
      .from("event_invites")
      .update(updates)
      .eq("id", inviteId);

    if (error) {
      toast({ 
        title: "Error al actualizar estado", 
        description: error.message, 
        variant: "destructive" 
      });
    } else {
      toast({ 
        title: "Estado actualizado", 
        description: "El estado de la invitación se ha actualizado correctamente." 
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
              <Mail className="h-5 w-5" />
              Invitaciones - {eventoNombre}
            </CardTitle>
            <CardDescription>
              {invites.length} invitaciones enviadas
            </CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <PermissionButton action="create" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Añadir Invitación
              </PermissionButton>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Nueva Invitación</DialogTitle>
                <DialogDescription>
                  Crear una nueva invitación para el evento
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="invitee_name">Nombre *</Label>
                  <Input
                    id="invitee_name"
                    value={formData.invitee_name}
                    onChange={(e) => setFormData({ ...formData, invitee_name: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="invitee_email">Email</Label>
                    <Input
                      id="invitee_email"
                      type="email"
                      value={formData.invitee_email}
                      onChange={(e) => setFormData({ ...formData, invitee_email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="invitee_phone">Teléfono</Label>
                    <Input
                      id="invitee_phone"
                      value={formData.invitee_phone}
                      onChange={(e) => setFormData({ ...formData, invitee_phone: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="invitee_position">Cargo</Label>
                    <Input
                      id="invitee_position"
                      value={formData.invitee_position}
                      onChange={(e) => setFormData({ ...formData, invitee_position: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Estado</Label>
                    <CatalogSelect
                      catalogType="invite_statuses"
                      value={formData.status}
                      onValueChange={(v) => setFormData({ ...formData, status: v as InviteStatus })}
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
        ) : invites.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Mail className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">No hay invitaciones creadas</p>
            <p className="text-sm text-muted-foreground">
              Añade la primera invitación usando el botón "Añadir Invitación"
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
              {invites.map((invite) => (
                <TableRow key={invite.id}>
                  <TableCell className="font-medium">{invite.invitee_name}</TableCell>
                  <TableCell>{invite.invitee_email || "-"}</TableCell>
                  <TableCell>{invite.invitee_position || "-"}</TableCell>
                  <TableCell>
                    <Badge className={statusColors[invite.status]}>
                      {resolveLabelFromLookup(statusLookup, invite.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {invite.status === 'pending' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleUpdateStatus(invite.id, 'sent')}
                          title="Marcar como enviada"
                        >
                          <Mail className="h-4 w-4 text-info" />
                        </Button>
                      )}
                      {invite.status === 'sent' && (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleUpdateStatus(invite.id, 'accepted')}
                            title="Marcar como aceptada"
                          >
                            <CheckCircle className="h-4 w-4 text-success" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleUpdateStatus(invite.id, 'declined')}
                            title="Marcar como rechazada"
                          >
                            <XCircle className="h-4 w-4 text-destructive" />
                          </Button>
                        </>
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
