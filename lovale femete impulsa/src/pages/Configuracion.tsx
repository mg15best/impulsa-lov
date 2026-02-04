import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function Configuracion() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
        <p className="text-muted-foreground">
          Ajustes del sistema
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuración del Sistema
          </CardTitle>
          <CardDescription>
            Gestión de usuarios y roles
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium">Usuario actual</p>
            <p className="text-muted-foreground">{user?.email}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">
              La gestión avanzada de roles y usuarios estará disponible próximamente.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
