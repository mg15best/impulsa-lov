import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plug, Database, ShieldCheck } from "lucide-react";
import { getPowerPlatformStatus } from "@/integrations/power/power-platform";

export default function Integraciones() {
  const powerStatus = getPowerPlatformStatus({
    tenantId: import.meta.env.VITE_POWER_TENANT_ID,
    clientId: import.meta.env.VITE_POWER_CLIENT_ID,
    apiBaseUrl: import.meta.env.VITE_POWER_API_BASE_URL,
  });

  const isLocalMode = import.meta.env.VITE_LOCAL_MODE === "true";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Integraciones</h1>
        <p className="text-muted-foreground">
          Conexiones con Power Apps / Power BI y operación local del sistema
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plug className="h-5 w-5" />
            Power Platform
          </CardTitle>
          <CardDescription>
            Opciones para importar la solución o conectarse vía API.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <p className="text-sm font-medium">Estado de configuración</p>
            <p className="text-sm text-muted-foreground">{powerStatus.details}</p>
            <p className="text-xs text-muted-foreground">
              Modo sugerido: <span className="font-medium">{powerStatus.mode}</span>
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">Siguiente paso</p>
            <p className="text-sm text-muted-foreground">
              Añadir credenciales en .env y definir el flujo OAuth para Power Apps/Power BI.
            </p>
            <p className="text-xs text-muted-foreground">
              Variables: VITE_POWER_TENANT_ID, VITE_POWER_CLIENT_ID, VITE_POWER_API_BASE_URL.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Operación local
          </CardTitle>
          <CardDescription>
            Recomendaciones para mantener la app autosostenida en oficina.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <ul className="list-disc pl-5 text-sm text-muted-foreground">
            <li>Desplegar la app en un servidor local o mini-PC dedicado.</li>
            <li>Respaldos automáticos diarios de la base de datos.</li>
            <li>Definir usuarios administradores (2 personas) con acceso completo.</li>
            <li>Configurar un modo offline parcial si el acceso a la nube falla.</li>
          </ul>
          <p className="text-sm text-muted-foreground">
            Estado actual:{" "}
            <span className="font-medium">
              {isLocalMode ? "Modo local habilitado" : "Modo local desactivado"}
            </span>
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" />
            Seguridad y control
          </CardTitle>
          <CardDescription>
            Buenas prácticas para la operación local.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <ul className="list-disc pl-5 text-sm text-muted-foreground">
            <li>Revisar accesos mensualmente.</li>
            <li>Habilitar MFA para cuentas administrativas.</li>
            <li>Registrar auditoría básica de cambios críticos.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
