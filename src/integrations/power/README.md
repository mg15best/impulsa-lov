# Power Platform (Power Apps / Power BI)

Este módulo prepara la base para conectar la app con Power Apps y Power BI.

## Opciones soportadas
- **Importar como solución** en Power Apps (usando componentes web o APIs expuestas desde esta app).
- **Conexión por API** (por ejemplo, consumir un API de Power Apps/Power BI o publicar endpoints desde esta app).

## Configuración mínima (API)
Definir en el archivo `.env`:

```
VITE_POWER_TENANT_ID="..."
VITE_POWER_CLIENT_ID="..."
VITE_POWER_API_BASE_URL="https://..."
```

## Estado
El módulo actual expone `getPowerPlatformStatus` para verificar si la configuración existe.

Se recomienda completar con:
- autenticación OAuth (MSAL o similar)
- endpoints dedicados para exportar datos a Power BI
- validación de permisos y auditoría
