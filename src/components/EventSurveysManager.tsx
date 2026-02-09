import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";
import { useDataLoader } from "@/hooks/useDataLoader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PermissionButton } from "@/components/PermissionButton";
import { Plus, ClipboardList, Loader2, Star } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type EventSurvey = Database["public"]["Tables"]["event_surveys"]["Row"];

interface EventSurveysManagerProps {
  eventoId: string;
  eventoNombre: string;
}

export function EventSurveysManager({ eventoId, eventoNombre }: EventSurveysManagerProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const { data: surveys, loading, reload } = useDataLoader<EventSurvey>(
    "event_surveys",
    (query) => query.eq("evento_id", eventoId).order("created_at", { ascending: false }),
    [eventoId]
  );

  const [formData, setFormData] = useState({
    respondent_name: "",
    respondent_email: "",
    satisfaction_rating: 0,
    content_rating: 0,
    organization_rating: 0,
    usefulness_rating: 0,
    highlights: "",
    improvements: "",
    impact_description: "",
    follow_up_interest: false,
    follow_up_notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !supabase) return;

    setSaving(true);
    const { error } = await supabase.from("event_surveys").insert({
      evento_id: eventoId,
      ...formData,
      status: "published",
      submitted_at: new Date().toISOString(),
      created_by: user.id,
    });

    if (error) {
      toast({ 
        title: "Error al guardar encuesta", 
        description: error.message, 
        variant: "destructive" 
      });
    } else {
      toast({ 
        title: "Encuesta guardada", 
        description: "La encuesta se ha guardado correctamente." 
      });
      setDialogOpen(false);
      setFormData({
        respondent_name: "",
        respondent_email: "",
        satisfaction_rating: 0,
        content_rating: 0,
        organization_rating: 0,
        usefulness_rating: 0,
        highlights: "",
        improvements: "",
        impact_description: "",
        follow_up_interest: false,
        follow_up_notes: "",
      });
      reload();
    }
    setSaving(false);
  };

  const RatingInput = ({ 
    label, 
    value, 
    onChange 
  }: { 
    label: string; 
    value: number; 
    onChange: (value: number) => void;
  }) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((rating) => (
          <Button
            key={rating}
            type="button"
            variant={value >= rating ? "default" : "outline"}
            size="sm"
            onClick={() => onChange(rating)}
            className="w-10 h-10 p-0"
          >
            <Star className={`h-4 w-4 ${value >= rating ? "fill-current" : ""}`} />
          </Button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        {value === 0 ? "No valorado" : `${value} de 5 estrellas`}
      </p>
    </div>
  );

  const getAverageRating = () => {
    if (surveys.length === 0) return 0;
    const total = surveys.reduce((sum, s) => {
      const avg = ((s.satisfaction_rating || 0) + (s.content_rating || 0) + 
                   (s.organization_rating || 0) + (s.usefulness_rating || 0)) / 4;
      return sum + avg;
    }, 0);
    return (total / surveys.length).toFixed(1);
  };

  if (!supabase) return null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              Encuestas de Impacto - {eventoNombre}
            </CardTitle>
            <CardDescription>
              {surveys.length} encuestas completadas
              {surveys.length > 0 && ` · Valoración media: ${getAverageRating()} ⭐`}
            </CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <PermissionButton action="create" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Nueva Encuesta
              </PermissionButton>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Encuesta de Impacto</DialogTitle>
                <DialogDescription>
                  Completar encuesta de satisfacción del evento
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="respondent_name">Nombre del Encuestado</Label>
                    <Input
                      id="respondent_name"
                      value={formData.respondent_name}
                      onChange={(e) => setFormData({ ...formData, respondent_name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="respondent_email">Email</Label>
                    <Input
                      id="respondent_email"
                      type="email"
                      value={formData.respondent_email}
                      onChange={(e) => setFormData({ ...formData, respondent_email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-4 border-t pt-4">
                  <h4 className="font-medium">Valoraciones</h4>
                  <RatingInput
                    label="Satisfacción General"
                    value={formData.satisfaction_rating}
                    onChange={(v) => setFormData({ ...formData, satisfaction_rating: v })}
                  />
                  <RatingInput
                    label="Calidad del Contenido"
                    value={formData.content_rating}
                    onChange={(v) => setFormData({ ...formData, content_rating: v })}
                  />
                  <RatingInput
                    label="Organización"
                    value={formData.organization_rating}
                    onChange={(v) => setFormData({ ...formData, organization_rating: v })}
                  />
                  <RatingInput
                    label="Utilidad"
                    value={formData.usefulness_rating}
                    onChange={(v) => setFormData({ ...formData, usefulness_rating: v })}
                  />
                </div>

                <div className="space-y-4 border-t pt-4">
                  <h4 className="font-medium">Comentarios</h4>
                  <div className="space-y-2">
                    <Label htmlFor="highlights">Aspectos Destacados</Label>
                    <Textarea
                      id="highlights"
                      value={formData.highlights}
                      onChange={(e) => setFormData({ ...formData, highlights: e.target.value })}
                      rows={2}
                      placeholder="¿Qué te ha parecido más valioso del evento?"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="improvements">Mejoras Sugeridas</Label>
                    <Textarea
                      id="improvements"
                      value={formData.improvements}
                      onChange={(e) => setFormData({ ...formData, improvements: e.target.value })}
                      rows={2}
                      placeholder="¿Qué se podría mejorar?"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="impact_description">Impacto Esperado</Label>
                    <Textarea
                      id="impact_description"
                      value={formData.impact_description}
                      onChange={(e) => setFormData({ ...formData, impact_description: e.target.value })}
                      rows={2}
                      placeholder="¿Cómo aplicarás lo aprendido?"
                    />
                  </div>
                </div>

                <div className="space-y-4 border-t pt-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="follow_up_interest"
                      checked={formData.follow_up_interest}
                      onChange={(e) => setFormData({ ...formData, follow_up_interest: e.target.checked })}
                      className="rounded"
                    />
                    <Label htmlFor="follow_up_interest" className="cursor-pointer">
                      Me interesa un seguimiento posterior
                    </Label>
                  </div>
                  {formData.follow_up_interest && (
                    <div className="space-y-2">
                      <Label htmlFor="follow_up_notes">Notas de Seguimiento</Label>
                      <Textarea
                        id="follow_up_notes"
                        value={formData.follow_up_notes}
                        onChange={(e) => setFormData({ ...formData, follow_up_notes: e.target.value })}
                        rows={2}
                      />
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={saving}>
                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Guardar Encuesta
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
        ) : surveys.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <ClipboardList className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">No hay encuestas completadas</p>
            <p className="text-sm text-muted-foreground">
              Añade la primera encuesta usando el botón "Nueva Encuesta"
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Encuestado</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Satisfacción</TableHead>
                <TableHead>Contenido</TableHead>
                <TableHead>Organización</TableHead>
                <TableHead>Utilidad</TableHead>
                <TableHead>Seguimiento</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {surveys.map((survey) => (
                <TableRow key={survey.id}>
                  <TableCell className="font-medium">{survey.respondent_name || "Anónimo"}</TableCell>
                  <TableCell>{survey.respondent_email || "-"}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {survey.satisfaction_rating || 0}/5 ⭐
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {survey.content_rating || 0}/5 ⭐
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {survey.organization_rating || 0}/5 ⭐
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {survey.usefulness_rating || 0}/5 ⭐
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {survey.follow_up_interest ? (
                      <Badge className="bg-info/10 text-info">Sí</Badge>
                    ) : (
                      <span className="text-muted-foreground">No</span>
                    )}
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
