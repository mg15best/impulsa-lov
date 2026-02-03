import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Plug } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";

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
          <div className="rounded-md border p-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Plug className="h-4 w-4" />
              Integraciones
            </div>
            <p className="text-sm text-muted-foreground">
              Conecta Power Apps y Power BI en la página de integraciones.
            </p>
            <Link className="text-sm text-primary underline-offset-4 hover:underline" to="/integraciones">
              Abrir integraciones
            </Link>
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
