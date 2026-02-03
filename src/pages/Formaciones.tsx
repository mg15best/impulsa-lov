import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap } from "lucide-react";

export default function Formaciones() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Formaciones</h1>
        <p className="text-muted-foreground">
          Píldoras formativas del proyecto
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Módulo de Formaciones
          </CardTitle>
          <CardDescription>
            Este módulo se implementará en la siguiente fase
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Próximamente: Catálogo de 6 píldoras formativas, sesiones y materiales.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
