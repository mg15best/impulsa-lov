# Patrón de Catálogos (Catalog Pattern)

## Introducción

El sistema de catálogos transversales proporciona una forma centralizada y uniforme de gestionar listas de valores controlados (code-label pairs) que se utilizan en toda la aplicación. En lugar de utilizar enums o mapas hardcodeados, los catálogos se almacenan en una tabla de base de datos que permite una gestión flexible y escalable.

## Arquitectura

### Tabla de Base de Datos

La tabla `catalogs` almacena todos los catálogos de la aplicación:

```sql
CREATE TABLE public.catalogs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  catalog_type TEXT NOT NULL,
  code TEXT NOT NULL,
  label TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (catalog_type, code)
);
```

**Campos:**
- `catalog_type`: Tipo de catálogo (ej: 'event_types', 'event_statuses', 'consultation_statuses')
- `code`: Código interno usado en la base de datos (debe coincidir con valores de ENUM existentes)
- `label`: Etiqueta legible mostrada en la UI
- `is_active`: Si está activo y debe mostrarse
- `sort_order`: Orden de visualización

### Índices

```sql
CREATE INDEX idx_catalogs_type ON public.catalogs(catalog_type);
CREATE INDEX idx_catalogs_active ON public.catalogs(catalog_type, is_active) WHERE is_active = true;
CREATE INDEX idx_catalogs_order ON public.catalogs(catalog_type, sort_order);
```

### Políticas RLS

- **Lectura**: Todos los usuarios autenticados pueden leer catálogos activos
- **Escritura**: Solo administradores pueden crear/modificar/eliminar catálogos

## Utilidades y Hooks

### Utilidades de Catálogo (`src/lib/catalogUtils.ts`)

```typescript
// Obtener todas las entradas de un catálogo
await getCatalogEntries('event_types');

// Resolver una etiqueta desde un código
await getCatalogLabel('event_types', 'taller'); // Returns "Taller"

// Obtener múltiples etiquetas de una vez
await getCatalogLabels('event_types', ['taller', 'seminario']);

// Crear un mapa de búsqueda para resolución en memoria
await createCatalogLookup('event_types');
```

### Hooks de React (`src/hooks/useCatalog.ts`)

```typescript
// Hook para cargar catálogo completo (con caché de 5 min)
const { data: entries, isLoading, error } = useCatalog('event_types');

// Hook para resolver una etiqueta desde un código
const { data: label } = useCatalogLabel('event_types', 'taller');

// Hook para crear un mapa de búsqueda optimizado
const { lookup, isLoading } = useCatalogLookup('event_types');
// Luego usa: resolveLabelFromLookup(lookup, code)
```

### Componente CatalogSelect (`src/components/CatalogSelect.tsx`)

Componente reutilizable para selectores de catálogo:

```tsx
<CatalogSelect
  catalogType="event_types"
  value={formData.tipo}
  onValueChange={(v) => setFormData({ ...formData, tipo: v })}
  placeholder="Seleccionar tipo..."
/>
```

## Patrón de Uso

### Paso 1: Crear Entradas de Catálogo

Agregar entradas en la migración o mediante SQL:

```sql
INSERT INTO public.catalogs (catalog_type, code, label, sort_order) VALUES
  ('event_types', 'taller', 'Taller', 1),
  ('event_types', 'seminario', 'Seminario', 2),
  ('event_types', 'networking', 'Networking', 3);
```

### Paso 2: En Componentes React

#### Opción A: Usar CatalogSelect (Recomendado para formularios)

```tsx
import { CatalogSelect } from "@/components/CatalogSelect";

<CatalogSelect
  catalogType="event_types"
  value={formData.tipo}
  onValueChange={(v) => setFormData({ ...formData, tipo: v })}
/>
```

#### Opción B: Usar useCatalogLookup (Recomendado para tablas)

```tsx
import { useCatalogLookup, resolveLabelFromLookup } from "@/hooks/useCatalog";

function EventosTable() {
  // Cargar lookup una vez al inicio
  const { lookup: tipoLookup } = useCatalogLookup('event_types');
  
  return (
    <Table>
      {eventos.map((evento) => (
        <TableRow>
          <TableCell>
            {resolveLabelFromLookup(tipoLookup, evento.tipo)}
          </TableCell>
        </TableRow>
      ))}
    </Table>
  );
}
```

#### Opción C: Usar useCatalog para filtros

```tsx
import { useCatalog } from "@/hooks/useCatalog";

function EventFilter() {
  const { data: tipos } = useCatalog('event_types');
  
  return (
    <Select>
      {tipos?.map((tipo) => (
        <SelectItem key={tipo.code} value={tipo.code}>
          {tipo.label}
        </SelectItem>
      ))}
    </Select>
  );
}
```

## Ejemplo Completo: Eventos

Ver `/src/pages/Eventos.tsx` para un ejemplo completo de integración:

1. **Importar hooks**:
```tsx
import { useCatalogLookup, resolveLabelFromLookup } from "@/hooks/useCatalog";
import { CatalogSelect } from "@/components/CatalogSelect";
```

2. **Cargar lookups**:
```tsx
const { lookup: tipoLookup } = useCatalogLookup('event_types');
const { lookup: estadoLookup } = useCatalogLookup('event_statuses');
```

3. **Usar en formularios**:
```tsx
<CatalogSelect
  catalogType="event_types"
  value={formData.tipo}
  onValueChange={(v) => setFormData({ ...formData, tipo: v })}
/>
```

4. **Usar en tablas**:
```tsx
<TableCell>{resolveLabelFromLookup(tipoLookup, evento.tipo)}</TableCell>
```

5. **Usar en filtros**:
```tsx
<Select value={filterTipo} onValueChange={setFilterTipo}>
  <SelectContent>
    <SelectItem value="all">Todos los tipos</SelectItem>
    {Array.from(tipoLookup.entries()).map(([code, label]) => (
      <SelectItem key={code} value={code}>{label}</SelectItem>
    ))}
  </SelectContent>
</Select>
```

## Catálogos Implementados

### event_types
Tipos de eventos (taller, seminario, networking, conferencia, presentacion, otro)

### event_statuses
Estados de eventos (planificado, confirmado, en_curso, completado, cancelado)

### consultation_statuses
Estados de asesoramientos (programado, en_curso, completado, cancelado)

## Añadir Nuevos Catálogos

### Paso 1: Crear Migración

Crear archivo en `supabase/migrations/`:

```sql
INSERT INTO public.catalogs (catalog_type, code, label, sort_order) VALUES
  ('nuevo_catalogo', 'valor1', 'Etiqueta 1', 1),
  ('nuevo_catalogo', 'valor2', 'Etiqueta 2', 2);
```

### Paso 2: Usar en la Aplicación

```tsx
// En tu componente
const { lookup } = useCatalogLookup('nuevo_catalogo');

// O usar CatalogSelect
<CatalogSelect catalogType="nuevo_catalogo" ... />
```

## Ventajas del Patrón

1. **Centralización**: Un único lugar para gestionar todos los catálogos
2. **Flexibilidad**: Añadir/modificar valores sin cambiar código
3. **Multiidioma**: Posibilidad de agregar múltiples idiomas (label_es, label_en)
4. **Mantenibilidad**: Los admins pueden gestionar catálogos sin deployments
5. **Consistencia**: Evita discrepancias entre código y UI
6. **Performance**: Caché de 5 minutos reduce llamadas a BD
7. **Escalabilidad**: Fácil añadir nuevos tipos de catálogo

## Consideraciones

- **Compatibilidad con ENUMs**: Los códigos deben coincidir con valores de ENUM existentes en la BD
- **Caché**: Los datos se cachean 5 minutos, cambios no son inmediatos
- **Fallback**: Si no se encuentra una etiqueta, se muestra el código como fallback
- **RLS**: Los catálogos heredan las políticas RLS existentes

## Referencias

- Migración: `supabase/migrations/20260206120000_create_catalogs_table.sql`
- Utilidades: `src/lib/catalogUtils.ts`
- Hooks: `src/hooks/useCatalog.ts`
- Componente: `src/components/CatalogSelect.tsx`
- Ejemplo: `src/pages/Eventos.tsx`, `src/pages/Asesoramientos.tsx`
- Inventario: `docs/INVENTARIO_CATALOGOS.md`
