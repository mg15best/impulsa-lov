# Impulsa LOV

Aplicación Vite + React + Supabase para la gestión de asesoramientos, contactos y empresas.

## Requisitos
- Node.js 18+
- npm

## Configuración
1. Instala dependencias:
   ```sh
   npm install
   ```
2. Crea el archivo `.env` (ver ejemplo abajo).
3. Ejecuta el entorno local:
   ```sh
   npm run dev
   ```

### Variables de entorno
Copia `.env.example` a `.env` y completa los valores.

```
VITE_SUPABASE_URL="https://<project>.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="..."
VITE_SUPABASE_ENABLED="true"
VITE_LOCAL_MODE="false"

# Power Platform (opcional)
VITE_POWER_TENANT_ID="..."
VITE_POWER_CLIENT_ID="..."
VITE_POWER_API_BASE_URL="https://..."
```

## Power Apps / Power BI
La app incluye un módulo de integración en `src/integrations/power/` con una página de estado en **Configuración → Integraciones**.

- Se puede conectar por **API** (recomendado para sincronización y reporting).
- También puede importarse como **solución** en Power Apps mediante endpoints o componentes web.

## Scripts
- `npm run dev`
- `npm run build`
- `npm run lint`
- `npm run test`
- `./scripts/unify-with-main.sh [main] [merge|rebase]` detecta ramas locales divergentes (ahead/behind) y las actualiza con `main`.
