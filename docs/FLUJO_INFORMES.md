# Flujo de Informes

## Índice
1. [Introducción](#introducción)
2. [Modelo de Datos](#modelo-de-datos)
3. [Flujo de Trabajo](#flujo-de-trabajo)
4. [Permisos y Seguridad](#permisos-y-seguridad)
5. [Uso de la Interfaz](#uso-de-la-interfaz)
6. [Catálogos Utilizados](#catálogos-utilizados)

## Introducción

Los Informes son documentos estructurados asociados a empresas que permiten documentar diagnósticos, seguimientos, evaluaciones y otros tipos de reportes. Cada informe está vinculado a una empresa específica y sigue un ciclo de vida con diferentes estados.

### Objetivos

- Facilitar la creación y gestión de informes por empresa
- Proporcionar una estructura clara para documentar diferentes tipos de informes
- Permitir seguimiento del estado de los informes
- Centralizar la información de informes de cada empresa

## Modelo de Datos

### Tabla: `reports`

Tabla principal que almacena los informes.

**Campos principales:**
- `id` (UUID): Identificador único del informe
- `company_id` (UUID): Referencia a la empresa (FK a `empresas`)
- `title` (TEXT): Título del informe (obligatorio)
- `description` (TEXT): Descripción breve del informe
- `status_code` (TEXT): Estado del informe (desde catálogo `report_statuses`)
- `report_type_code` (TEXT): Tipo de informe (desde catálogo `report_types`)
- `report_date` (DATE): Fecha del informe
- `content` (TEXT): Contenido principal del informe
- `conclusions` (TEXT): Conclusiones del informe
- `recommendations` (TEXT): Recomendaciones derivadas del informe
- `responsible_user_id` (UUID): Usuario responsable (FK a `auth.users`)
- `notes` (TEXT): Notas adicionales
- `created_by` (UUID): Usuario que creó el informe
- `created_at` (TIMESTAMP): Fecha de creación
- `updated_at` (TIMESTAMP): Fecha de última actualización

**Relaciones:**
- Pertenece a una empresa (`company_id` -> `empresas.id`)
- Cascada en eliminación: al eliminar una empresa, se eliminan sus informes

**Índices:**
- `idx_reports_company`: Índice en `company_id` para búsquedas rápidas por empresa
- `idx_reports_status`: Índice en `status_code` para filtros por estado
- `idx_reports_type`: Índice en `report_type_code` para filtros por tipo
- `idx_reports_responsible`: Índice en `responsible_user_id` para filtros por responsable
- `idx_reports_date`: Índice en `report_date` para ordenación por fecha

## Flujo de Trabajo

### 1. Creación de un Informe

**Pasos:**
1. Usuario con permisos de escritura (`admin` o `tecnico`) accede a "Informes"
2. Hace clic en "Nuevo Informe"
3. Completa el formulario:
   - Título (obligatorio)
   - Empresa (obligatorio, selección de lista)
   - Estado (obligatorio, por defecto "draft")
   - Tipo de informe (opcional)
   - Fecha del informe (opcional)
   - Descripción (opcional)
   - Contenido (opcional)
   - Conclusiones (opcional)
   - Recomendaciones (opcional)
   - Notas adicionales (opcional)
4. Guarda el informe

**Estados iniciales:**
- `status_code`: "draft"

### 2. Edición de un Informe

**Pasos:**
1. Usuario localiza el informe en la lista
2. Hace clic en el icono "Editar"
3. Modifica los campos necesarios
4. Guarda los cambios

### 3. Visualización de Detalles

**Pasos:**
1. Usuario hace clic en el icono "Ver" (ojo) del informe
2. Se abre un diálogo con todos los detalles del informe:
   - Información básica (empresa, estado, tipo, fecha)
   - Descripción completa
   - Contenido
   - Conclusiones
   - Recomendaciones
   - Notas
   - Fecha de creación

### 4. Filtrado y Búsqueda

**Filtros disponibles:**
- **Por empresa**: Ver informes de una empresa específica
- **Por estado**: Filtrar por estado del informe (draft, in_review, approved, etc.)
- **Búsqueda de texto**: Buscar en título, descripción y contenido

### 5. Eliminación

**Eliminar Informe:**
- Solo usuarios con permisos de escritura
- Requiere confirmación
- Elimina permanentemente el informe

## Permisos y Seguridad

### Row Level Security (RLS)

La tabla `reports` tiene RLS habilitado con las siguientes políticas:

**Lectura (SELECT):**
- Todos los usuarios autenticados con roles asignados pueden ver informes
- Política: Verifica existencia de rol en `user_roles`

**Escritura (INSERT, UPDATE, DELETE):**
- Solo usuarios con roles `admin` o `tecnico` pueden crear, modificar o eliminar
- Política: Verifica que `user_roles.role IN ('admin', 'tecnico')`

### Validación de Permisos en UI

El componente utiliza el hook `useUserRoles()` para verificar permisos:
- `canWrite`: true para admin y tecnico
- `canRead`: true para todos los usuarios autenticados con roles

El componente `PermissionButton` envuelve acciones de escritura y muestra feedback apropiado cuando el usuario no tiene permisos.

## Uso de la Interfaz

### Pantalla Principal

**Componentes:**
- **Barra de búsqueda**: Buscar informes por título, descripción o contenido
- **Filtros**: Por estado y por empresa
- **Botón "Nuevo Informe"**: Crear un nuevo informe (solo con permisos de escritura)
- **Tabla de informes**: Lista de todos los informes con:
  - Título
  - Empresa
  - Tipo
  - Estado (badge con color)
  - Fecha
  - Acciones (Ver, Editar, Eliminar)

### Diálogo de Detalle del Informe

Muestra información completa del informe:
- Datos principales (empresa, estado, tipo, fecha)
- Descripción
- Contenido completo
- Conclusiones
- Recomendaciones
- Notas adicionales
- Fecha de creación

### Formulario de Creación/Edición

**Campos organizados:**
- Información básica: título, empresa
- Clasificación: estado, tipo
- Fecha del informe
- Descripción breve
- Contenido (área de texto amplia)
- Conclusiones (área de texto amplia)
- Recomendaciones (área de texto amplia)
- Notas adicionales

**Validaciones:**
- Título: obligatorio
- Empresa: obligatoria
- Estado: obligatorio
- Otros campos: opcionales

## Catálogos Utilizados

### `report_statuses`

Estados del informe:
- `draft`: Borrador (inicial)
- `in_review`: En Revisión
- `approved`: Aprobado
- `published`: Publicado
- `archived`: Archivado

### `report_types`

Tipos de informes:
- `diagnostic`: Diagnóstico
- `progress`: Seguimiento
- `final`: Final
- `consultation`: Consultoría
- `evaluation`: Evaluación
- `financial`: Financiero
- `technical`: Técnico
- `other`: Otro

## Códigos de Color

**Estados:**
- `draft`, `archived`: Gris (muted)
- `in_review`: Azul (info)
- `approved`: Verde (success)
- `published`: Azul primario (primary)

## Notas Técnicas

### Hooks Utilizados
- `useDataLoader`: Para cargar datos con filtros reactivos
- `useLocalSearch`: Para búsqueda local sin recargar desde BD
- `useUserRoles`: Para verificación de permisos
- `useCatalogLookup`: Para resolución de etiquetas de catálogos

### Componentes Reutilizados
- `CatalogSelect`: Selector desplegable que carga datos de catálogos automáticamente
- `PermissionButton`: Botón que verifica permisos y muestra feedback
- Componentes UI de shadcn/ui: Dialog, Table, Badge, Input, etc.

### Patrón de Carga de Datos
Sigue el patrón establecido en el proyecto:
1. `useDataLoader` con filtros reactivos
2. `useLocalSearch` para búsqueda en memoria
3. Reload manual tras operaciones de escritura

### Gestión de Estado
- Estado local para formularios
- Estado de dialogs (open/close)
- Estado del informe seleccionado para vista de detalle
- No se usa estado global (Redux, Context) para estos datos

## Extensibilidad

### Añadir Nuevos Estados o Tipos
1. Insertar nuevos registros en la tabla `catalogs` con el `catalog_type` apropiado
2. Los selectores los mostrarán automáticamente
3. Actualizar la documentación si es necesario

### Añadir Campos Personalizados
1. Añadir columna en migración SQL
2. Actualizar tipos TypeScript
3. Añadir campo en formulario
4. Actualizar vista de detalle si aplica

### Reportes y Analíticas
Los datos están estructurados para facilitar:
- Informes por empresa
- Informes por tipo
- Timeline de informes (usando report_date)
- Estado de informes por empresa
- Análisis de recomendaciones por tipo de informe

## Referencias

- Migración tabla: `supabase/migrations/20260206132900_create_reports_table.sql`
- Migración catálogos: `supabase/migrations/20260206133000_add_reports_catalogs.sql`
- Componente: `src/pages/Informes.tsx`
- Patrón de catálogos: `docs/CATALOG_PATTERN.md`
- Patrón similar: `docs/FLUJO_PLANES_ACCION.md`
