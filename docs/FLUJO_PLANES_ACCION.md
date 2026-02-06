# Flujo de Planes de Acción

## Índice
1. [Introducción](#introducción)
2. [Modelo de Datos](#modelo-de-datos)
3. [Flujo de Trabajo](#flujo-de-trabajo)
4. [Permisos y Seguridad](#permisos-y-seguridad)
5. [Uso de la Interfaz](#uso-de-la-interfaz)
6. [Catálogos Utilizados](#catálogos-utilizados)

## Introducción

Los Planes de Acción son una herramienta de gestión que permite a las empresas asesoradas crear y hacer seguimiento de planes estructurados con items específicos. Cada plan está vinculado a una empresa y puede tener múltiples items que representan tareas o acciones concretas.

### Objetivos

- Facilitar la planificación y seguimiento de acciones para empresas
- Proporcionar una estructura jerárquica de planes e items
- Permitir categorización y priorización de planes y tareas
- Hacer seguimiento del progreso de cada plan

## Modelo de Datos

### Tabla: `action_plans`

Tabla principal que almacena los planes de acción.

**Campos principales:**
- `id` (UUID): Identificador único del plan
- `company_id` (UUID): Referencia a la empresa (FK a `empresas`)
- `title` (TEXT): Título del plan (obligatorio)
- `description` (TEXT): Descripción detallada del plan
- `status_code` (TEXT): Estado del plan (desde catálogo `action_plan_statuses`)
- `category_code` (TEXT): Categoría del plan (desde catálogo `action_plan_categories`)
- `priority_code` (TEXT): Prioridad del plan (desde catálogo `priority_levels`)
- `start_date` (DATE): Fecha de inicio
- `end_date` (DATE): Fecha de finalización
- `progress` (INTEGER): Porcentaje de progreso (0-100)
- `responsible_user_id` (UUID): Usuario responsable (FK a `auth.users`)
- `notes` (TEXT): Notas adicionales
- `created_by` (UUID): Usuario que creó el plan
- `created_at` (TIMESTAMP): Fecha de creación
- `updated_at` (TIMESTAMP): Fecha de última actualización

**Relaciones:**
- Pertenece a una empresa (`company_id` -> `empresas.id`)
- Tiene múltiples items (`action_plan_items` con `action_plan_id`)
- Cascada en eliminación: al eliminar un plan, se eliminan todos sus items

**Índices:**
- `idx_action_plans_company`: Índice en `company_id` para búsquedas rápidas por empresa
- `idx_action_plans_status`: Índice en `status_code` para filtros por estado
- `idx_action_plans_responsible`: Índice en `responsible_user_id` para filtros por responsable

### Tabla: `action_plan_items`

Tabla que almacena los items individuales de cada plan de acción.

**Campos principales:**
- `id` (UUID): Identificador único del item
- `action_plan_id` (UUID): Referencia al plan de acción (FK a `action_plans`)
- `title` (TEXT): Título del item (obligatorio)
- `description` (TEXT): Descripción del item
- `status_code` (TEXT): Estado del item (desde catálogo `action_plan_item_statuses`)
- `priority_code` (TEXT): Prioridad del item (desde catálogo `priority_levels`)
- `due_date` (DATE): Fecha límite
- `completed_date` (DATE): Fecha de completado
- `assigned_to_id` (UUID): Usuario asignado (FK a `auth.users`)
- `order_index` (INTEGER): Orden de visualización dentro del plan
- `notes` (TEXT): Notas adicionales
- `created_by` (UUID): Usuario que creó el item
- `created_at` (TIMESTAMP): Fecha de creación
- `updated_at` (TIMESTAMP): Fecha de última actualización

**Relaciones:**
- Pertenece a un plan de acción (`action_plan_id` -> `action_plans.id`)
- Eliminación en cascada: se elimina automáticamente cuando se elimina el plan padre

**Índices:**
- `idx_action_plan_items_plan`: Índice en `action_plan_id` para búsquedas rápidas por plan
- `idx_action_plan_items_status`: Índice en `status_code` para filtros por estado
- `idx_action_plan_items_assigned`: Índice en `assigned_to_id` para filtros por asignado

## Flujo de Trabajo

### 1. Creación de un Plan de Acción

**Pasos:**
1. Usuario con permisos de escritura (`admin` o `tecnico`) accede a "Planes de Acción"
2. Hace clic en "Nuevo Plan"
3. Completa el formulario:
   - Título (obligatorio)
   - Empresa (obligatorio, selección de lista)
   - Descripción
   - Estado (obligatorio, por defecto "draft")
   - Categoría (opcional)
   - Prioridad (por defecto "medium")
   - Fechas de inicio y fin
   - Progreso inicial (por defecto 0%)
   - Notas adicionales
4. Guarda el plan

**Estados iniciales:**
- `status_code`: "draft"
- `priority_code`: "medium"
- `progress`: 0

### 2. Gestión de Items del Plan

**Añadir Items:**
1. Usuario abre el detalle del plan (clic en icono "Ver")
2. En la sección de items, hace clic en "Nuevo Item"
3. Completa el formulario del item:
   - Título (obligatorio)
   - Descripción
   - Estado (obligatorio, por defecto "pending")
   - Prioridad (por defecto "medium")
   - Fecha límite
   - Notas
4. Guarda el item

**Estados de Items:**
- `pending`: Item pendiente de inicio
- `in_progress`: Item en progreso
- `blocked`: Item bloqueado por algún impedimento
- `completed`: Item completado
- `cancelled`: Item cancelado

### 3. Seguimiento y Actualización

**Actualizar Plan:**
1. Usuario hace clic en icono "Editar" del plan
2. Modifica campos necesarios (estado, progreso, fechas, etc.)
3. Guarda cambios

**Progreso:**
- El campo `progress` se actualiza manualmente (0-100%)
- Representa el porcentaje de avance del plan
- Se puede actualizar en función del estado de los items

### 4. Filtrado y Búsqueda

**Filtros disponibles:**
- **Por empresa**: Ver planes de una empresa específica
- **Por estado**: Filtrar por estado del plan (draft, active, in_progress, completed, etc.)
- **Búsqueda de texto**: Buscar en título y descripción

### 5. Eliminación

**Eliminar Plan:**
- Solo usuarios con permisos de escritura
- Requiere confirmación
- Elimina automáticamente todos los items asociados (cascada)

**Eliminar Item:**
- Solo usuarios con permisos de escritura
- Requiere confirmación
- No afecta al plan padre

## Permisos y Seguridad

### Row Level Security (RLS)

Todas las tablas tienen RLS habilitado con las siguientes políticas:

**Lectura (SELECT):**
- Todos los usuarios autenticados con roles asignados pueden ver planes e items
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
- **Barra de búsqueda**: Buscar planes por título o descripción
- **Filtros**: Por estado y por empresa
- **Botón "Nuevo Plan"**: Crear un nuevo plan (solo con permisos de escritura)
- **Tabla de planes**: Lista de todos los planes con:
  - Título
  - Empresa
  - Estado (badge con color)
  - Prioridad (badge con color)
  - Progreso (porcentaje)
  - Fechas de inicio y fin
  - Acciones (Ver, Editar, Eliminar)

### Diálogo de Detalle del Plan

Muestra información completa del plan:
- Datos principales (empresa, estado, prioridad, progreso)
- Descripción completa
- **Sección de Items**:
  - Lista de items con sus estados y prioridades
  - Botón "Nuevo Item" para añadir items
  - Opción de eliminar items individualmente

### Formularios

**Formulario de Plan:**
- Campos organizados en grupos lógicos
- Selects de catálogo para estado, categoría y prioridad
- Selector de empresa (lista de empresas)
- Campos de fecha con input tipo date
- Campo numérico para progreso con validación (0-100)

**Formulario de Item:**
- Diseño simplificado
- Campos esenciales (título, descripción, estado, prioridad)
- Fecha límite opcional
- Notas adicionales

## Catálogos Utilizados

### `action_plan_statuses`

Estados del plan de acción:
- `draft`: Borrador (inicial)
- `active`: Activo
- `in_progress`: En Progreso
- `completed`: Completado
- `on_hold`: En Espera
- `cancelled`: Cancelado

### `action_plan_categories`

Categorías de planes:
- `strategy`: Estrategia
- `operations`: Operaciones
- `marketing`: Marketing
- `sales`: Ventas
- `finance`: Finanzas
- `hr`: Recursos Humanos
- `technology`: Tecnología
- `innovation`: Innovación
- `sustainability`: Sostenibilidad
- `other`: Otro

### `priority_levels`

Niveles de prioridad (compartido entre planes e items):
- `critical`: Crítica
- `high`: Alta
- `medium`: Media (por defecto)
- `low`: Baja

### `action_plan_item_statuses`

Estados de items:
- `pending`: Pendiente (inicial)
- `in_progress`: En Progreso
- `blocked`: Bloqueado
- `completed`: Completado
- `cancelled`: Cancelado

## Códigos de Color

**Estados:**
- `draft`, `pending`, `on_hold`: Gris (muted)
- `active`: Azul (info)
- `in_progress`: Amarillo (warning)
- `completed`: Verde (success)
- `cancelled`, `blocked`: Rojo (destructive)

**Prioridades:**
- `critical`: Rojo (destructive)
- `high`: Amarillo (warning)
- `medium`: Azul (info)
- `low`: Gris (muted)

## Notas Técnicas

### Hooks Utilizados
- `useDataLoader`: Para cargar datos con filtros reactivos
- `useLocalSearch`: Para búsqueda local sin recargar desde BD
- `useUserRoles`: Para verificación de permisos
- `useCatalog`: No se usa directamente, pero `CatalogSelect` lo utiliza internamente

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
- Estado de items cargados del plan seleccionado
- No se usa estado global (Redux, Context) para estos datos

## Extensibilidad

### Añadir Nuevos Estados o Categorías
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
- Planes por empresa
- Progreso general de planes
- Items pendientes por plan
- Planes por categoría o prioridad
- Timeline de planes (usando start_date y end_date)
