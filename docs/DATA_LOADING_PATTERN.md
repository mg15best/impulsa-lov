# Patrón de Carga de Datos Consolidado

## Descripción General

Este documento describe el patrón consolidado de carga de datos implementado para estandarizar la gestión de datos en todas las pantallas principales de la aplicación.

## Problema que Resuelve

Antes de implementar este patrón, cada pantalla duplicaba la siguiente lógica:
- Estados de carga (`loading`, `error`)
- Funciones de fetch personalizadas
- Manejo de errores con toast
- Efectos para recarga cuando cambian filtros
- Lógica de búsqueda local

Esto resultaba en:
- Código repetitivo y difícil de mantener
- Inconsistencias en el manejo de errores
- Mayor probabilidad de bugs

## Solución: Hook `useDataLoader`

Se ha creado un hook reutilizable que consolida toda la lógica común de carga de datos.

### Ubicación
```
src/hooks/useDataLoader.ts
```

### Características

#### 1. Hook `useDataLoader<T>`
Maneja la carga de datos desde Supabase con:
- **Estado de carga**: Indica si los datos están siendo cargados
- **Estado de error**: Captura y muestra errores mediante toast
- **Filtros dinámicos**: Aplica filtros mediante una función customizable
- **Recarga automática**: Se actualiza cuando cambian las dependencias
- **Función reload**: Permite forzar una recarga manual

#### 2. Hook `useLocalSearch<T>`
Maneja la búsqueda local en los datos ya cargados:
- Filtra datos en memoria sin hacer peticiones adicionales
- Búsqueda case-insensitive
- Función de comparación personalizable

## Uso

### Ejemplo Básico

```typescript
import { useDataLoader, useLocalSearch } from "@/hooks/useDataLoader";

// En tu componente
const [searchTerm, setSearchTerm] = useState("");
const [filterEstado, setFilterEstado] = useState<string>("all");

// Cargar datos con filtros
const { data: empresas, loading, reload } = useDataLoader<Empresa>(
  "empresas",
  (query) => {
    let filteredQuery = query.order("created_at", { ascending: false });
    
    if (filterEstado && filterEstado !== "all") {
      filteredQuery = filteredQuery.eq("estado", filterEstado);
    }
    
    return filteredQuery;
  },
  [filterEstado] // Dependencias que disparan recarga
);

// Búsqueda local
const filteredEmpresas = useLocalSearch(
  empresas,
  searchTerm,
  (empresa, term) =>
    empresa.nombre.toLowerCase().includes(term) ||
    empresa.cif?.toLowerCase().includes(term)
);
```

### Ejemplo con Relaciones

```typescript
// Cargar datos con relación a otra tabla
const { data: contactos, loading, reload } = useDataLoader<Contacto & { empresa?: Empresa }>(
  "contactos",
  (query) => {
    let filteredQuery = query.select("*, empresa:empresas(*)").order("nombre");
    
    if (filterEmpresa && filterEmpresa !== "all") {
      filteredQuery = filteredQuery.eq("empresa_id", filterEmpresa);
    }
    
    return filteredQuery;
  },
  [filterEmpresa]
);
```

## Pantallas Implementadas

El patrón ha sido aplicado en las siguientes pantallas:

1. ✅ **Empresas** (`src/pages/Empresas.tsx`)
   - Filtros: sector, estado
   - Búsqueda: nombre, CIF

2. ✅ **Contactos** (`src/pages/Contactos.tsx`)
   - Filtros: empresa
   - Búsqueda: nombre, email, empresa
   - Relación: empresas

3. ✅ **Asesoramientos** (`src/pages/Asesoramientos.tsx`)
   - Filtros: estado, empresa_id (URL param)
   - Búsqueda: tema, empresa
   - Relación: empresas

4. ✅ **Eventos** (`src/pages/Eventos.tsx`)
   - Filtros: tipo, estado
   - Búsqueda: nombre, ubicación

5. ✅ **Formaciones** (`src/pages/Formaciones.tsx`)
   - Filtros: tipo, estado
   - Búsqueda: título, formador

6. ✅ **Evidencias** (`src/pages/Evidencias.tsx`)
   - Filtros: tipo
   - Búsqueda: título, descripción

7. ✅ **Colaboradores** (`src/pages/Colaboradores.tsx`)
   - Filtros: tipo, estado
   - Búsqueda: nombre, descripción

## Beneficios

### Mantenibilidad
- **Código DRY**: Elimina duplicación en ~700 líneas de código
- **Punto único de cambio**: Mejoras al patrón benefician a todas las pantallas
- **Consistencia**: Mismo comportamiento en toda la aplicación

### Rendimiento
- **Recarga inteligente**: Solo se actualiza cuando cambian los filtros
- **Búsqueda eficiente**: Filtrado local sin peticiones adicionales
- **Cancelación automática**: Evita condiciones de carrera

### Experiencia de Usuario
- **Manejo consistente de errores**: Notificaciones uniformes
- **Estados de carga claros**: Feedback visual coherente
- **Filtros reactivos**: Respuesta inmediata a cambios

## Parámetros del Hook

### `useDataLoader<T>`

```typescript
useDataLoader<T>(
  tableName: string,           // Nombre de la tabla en Supabase
  applyFilters?: (query) => query,  // Función para aplicar filtros
  dependencies?: any[]         // Array de dependencias para recarga
)
```

**Retorna:**
```typescript
{
  data: T[],         // Datos cargados
  loading: boolean,  // Estado de carga
  error: string | null,  // Mensaje de error (si existe)
  reload: () => void     // Función para forzar recarga
}
```

### `useLocalSearch<T>`

```typescript
useLocalSearch<T>(
  data: T[],                           // Datos a filtrar
  searchTerm: string,                  // Término de búsqueda
  searchFields: (item, term) => boolean  // Función de comparación
)
```

**Retorna:**
```typescript
T[]  // Array filtrado
```

## Mejores Prácticas

### 1. Definir Filtros Claramente
```typescript
// ✅ BIEN: Filtros claros y concisos
const { data } = useDataLoader("empresas", (query) => {
  let q = query.order("created_at", { ascending: false });
  if (filterSector !== "all") q = q.eq("sector", filterSector);
  return q;
}, [filterSector]);

// ❌ MAL: Lógica compleja en el filtro
const { data } = useDataLoader("empresas", (query) => {
  // Demasiada lógica aquí
  if (complexCondition) {
    // ...mucha lógica
  }
  return query;
}, [dep1, dep2, dep3]);
```

### 2. Dependencias Mínimas
```typescript
// ✅ BIEN: Solo las dependencias necesarias
const { data } = useDataLoader("empresas", applyFilters, [filterSector, filterEstado]);

// ❌ MAL: Dependencias innecesarias
const { data } = useDataLoader("empresas", applyFilters, [
  filterSector, filterEstado, dialogOpen, formData, searchTerm
]);
```

### 3. Búsqueda Eficiente
```typescript
// ✅ BIEN: Búsqueda simple y clara
const filtered = useLocalSearch(
  data,
  searchTerm,
  (item, term) => item.nombre.toLowerCase().includes(term)
);

// ✅ BIEN: Múltiples campos
const filtered = useLocalSearch(
  data,
  searchTerm,
  (item, term) => 
    item.nombre.toLowerCase().includes(term) ||
    item.email?.toLowerCase().includes(term)
);
```

### 4. Manejo de Relaciones
```typescript
// ✅ BIEN: Incluir relaciones en el select
const { data } = useDataLoader(
  "contactos",
  (query) => query.select("*, empresa:empresas(*)"),
  []
);

// Tipar correctamente
type ContactoWithEmpresa = Contacto & { empresa?: Empresa };
const { data } = useDataLoader<ContactoWithEmpresa>(...);
```

## Permisos y Seguridad

El patrón respeta la lógica actual de permisos:
- Los filtros de Supabase RLS se aplican automáticamente
- No se requiere lógica adicional de permisos en el hook
- Las consultas respetan los roles de usuario configurados

## Migración de Código Existente

Para migrar una pantalla al nuevo patrón:

1. **Importar los hooks**
```typescript
import { useDataLoader, useLocalSearch } from "@/hooks/useDataLoader";
```

2. **Reemplazar estado y fetch**
```typescript
// ANTES
const [data, setData] = useState([]);
const [loading, setLoading] = useState(true);
const fetchData = async () => { /* ... */ };

// DESPUÉS
const { data, loading, reload } = useDataLoader("tabla", applyFilters, [deps]);
```

3. **Reemplazar búsqueda**
```typescript
// ANTES
const filtered = data.filter(item => 
  item.nombre.toLowerCase().includes(searchTerm.toLowerCase())
);

// DESPUÉS
const filtered = useLocalSearch(data, searchTerm, (item, term) =>
  item.nombre.toLowerCase().includes(term)
);
```

4. **Actualizar llamadas a reload**
```typescript
// ANTES
fetchData();

// DESPUÉS
reload();
```

## Limitaciones Conocidas

1. **Solo para Supabase**: El hook está diseñado específicamente para Supabase
2. **Filtros simples**: Para lógica de filtrado muy compleja, considerar un hook especializado
3. **Sin paginación**: Actualmente no incluye soporte para paginación (cargas todas las filas)

## Evolución Futura

Posibles mejoras a considerar:

- [ ] Soporte para paginación
- [ ] Caché de resultados
- [ ] Soporte para optimistic updates
- [ ] Cancelación de peticiones en progreso
- [ ] Debouncing automático de búsquedas
- [ ] Soporte para mutaciones (crear, actualizar, eliminar)

## Soporte

Para dudas o problemas con el patrón:
1. Revisar ejemplos en las pantallas ya implementadas
2. Consultar este documento
3. Revisar el código fuente del hook en `src/hooks/useDataLoader.ts`
