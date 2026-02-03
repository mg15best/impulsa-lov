import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Handshake } from "lucide-react";

export default function Colaboradores() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Colaboradores</h1>
        <p className="text-muted-foreground">
          Entidades colaboradoras del proyecto
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Handshake className="h-5 w-5" />
            Módulo de Colaboradores
          </CardTitle>
          <CardDescription>
            Este módulo se implementará en la siguiente fase
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Próximamente: Registro de 8 entidades colaboradoras, convenios y actividades conjuntas.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
