import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";

export default function Eventos() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Eventos</h1>
        <p className="text-muted-foreground">
          Gestión de eventos del proyecto
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Módulo de Eventos
          </CardTitle>
          <CardDescription>
            Este módulo se implementará en la siguiente fase
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Próximamente: Gestión de eventos con invitaciones, asistencia y evidencias.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
