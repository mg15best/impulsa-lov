import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

export default function Evidencias() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Evidencias</h1>
        <p className="text-muted-foreground">
          Sistema de documentación y justificación
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Módulo de Evidencias
          </CardTitle>
          <CardDescription>
            Este módulo se implementará en la siguiente fase
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Próximamente: Subida de documentos, informes y evidencias para justificación STARS.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
