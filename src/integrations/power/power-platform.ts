export type PowerPlatformConnectionConfig = {
  tenantId?: string;
  clientId?: string;
  apiBaseUrl?: string;
};

export type PowerPlatformConnectionStatus = {
  configured: boolean;
  mode: "solution" | "api";
  details: string;
};

export function getPowerPlatformStatus(
  config: PowerPlatformConnectionConfig,
): PowerPlatformConnectionStatus {
  const mode = config.apiBaseUrl ? "api" : "solution";
  const configured =
    mode === "solution"
      ? Boolean(config.tenantId && config.clientId)
      : Boolean(config.tenantId && config.clientId && config.apiBaseUrl);

  return {
    configured,
    mode,
    details: configured
      ? "Configuración detectada desde variables de entorno."
      : mode === "solution"
        ? "Configura tenant y client para habilitar la importación de solución."
        : "Configura tenant, client y base URL para habilitar la conexión.",
  };
}
