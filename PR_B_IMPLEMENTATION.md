# PR-B: Implementación de Catálogos Transversales

## Resumen

Este PR implementa un sistema de catálogos transversales que centraliza la gestión de listas de valores controlados (code-label pairs) utilizados en toda la aplicación. El sistema reemplaza los mapas hardcodeados con una solución basada en base de datos que es más flexible, mantenible y escalable.

## Objetivos Completados ✅

### 1. Tabla de Catálogos
- ✅ Creada tabla `catalogs` con estructura completa:
  - `id`: UUID primary key
  - `catalog_type`: Tipo de catálogo
  - `code`: Código interno (debe coincidir con ENUMs existentes)
  - `label`: Etiqueta visible en UI
  - `is_active`: Estado activo/inactivo
  - `sort_order`: Orden de visualización
  - `created_at`, `updated_at`: Timestamps
- ✅ Restricción UNIQUE en (catalog_type, code)
- ✅ Índices optimizados para consultas
- ✅ Triggers para updated_at

### 2. Políticas RLS
- ✅ Política de lectura: Todos los usuarios autenticados pueden leer catálogos activos
- ✅ Política de escritura: Solo administradores pueden modificar catálogos
- ✅ No se modifican reglas RLS existentes de otras tablas

### 3. Helpers y Utilidades

#### `src/lib/catalogUtils.ts`
- ✅ `getCatalogEntries()`: Obtener todas las entradas de un catálogo
- ✅ `getCatalogLabel()`: Resolver etiqueta desde código
- ✅ `getCatalogLabels()`: Resolver múltiples etiquetas
- ✅ `createCatalogLookup()`: Crear mapa de búsqueda en memoria

#### `src/hooks/useCatalog.ts`
- ✅ `useCatalog()`: Hook para cargar catálogo completo (con caché de 5 min)
- ✅ `useCatalogLabel()`: Hook para resolver una etiqueta
- ✅ `useCatalogLookup()`: Hook para crear lookup map optimizado
- ✅ `resolveLabelFromLookup()`: Helper para resolver labels del lookup

#### `src/components/CatalogSelect.tsx`
- ✅ Componente reutilizable para selectores de catálogo
- ✅ Carga automática de opciones
- ✅ Manejo de estados de carga y error
- ✅ Integración con UI existente (Select de shadcn/ui)

### 4. Aplicación en Módulos Clave

#### Eventos (`src/pages/Eventos.tsx`)
- ✅ Campo `tipo` ahora usa catálogo `event_types`
- ✅ Campo `estado` ahora usa catálogo `event_statuses`
- ✅ Formulario usa `CatalogSelect` para tipo
- ✅ Filtros actualizados para usar catálogos
- ✅ Tabla muestra labels desde catálogos
- ✅ Mantiene compatibilidad con ENUMs existentes

#### Asesoramientos (`src/pages/Asesoramientos.tsx`)
- ✅ Campo `estado` ahora usa catálogo `consultation_statuses`
- ✅ Formulario actualizado para usar catálogos
- ✅ Filtros actualizados para usar catálogos
- ✅ Tabla muestra labels desde catálogos
- ✅ Mantiene compatibilidad con ENUMs existentes

### 5. Datos Iniciales (Seed)

Catálogos poblados en migración:

#### event_types
- taller → Taller
- seminario → Seminario
- networking → Networking
- conferencia → Conferencia
- presentacion → Presentación
- otro → Otro

#### event_statuses
- planificado → Planificado
- confirmado → Confirmado
- en_curso → En curso
- completado → Completado
- cancelado → Cancelado

#### consultation_statuses
- programado → Programado
- en_curso → En curso
- completado → Completado
- cancelado → Cancelado

### 6. Documentación

- ✅ `docs/CATALOG_PATTERN.md`: Documentación completa del patrón
  - Arquitectura del sistema
  - Utilidades y hooks disponibles
  - Ejemplos de uso
  - Guía para añadir nuevos catálogos
  - Ventajas y consideraciones
- ✅ Comentarios en código explicando funcionalidad
- ✅ JSDoc en todas las funciones públicas

### 7. Testing

- ✅ Tests unitarios para tipos de catálogos
- ✅ Validación de códigos coincidentes con ENUMs
- ✅ Build exitoso sin errores
- ✅ Lint exitoso (sin nuevos warnings)
- ✅ Todos los tests existentes pasan

## Cambios Realizados

### Archivos Nuevos
1. `supabase/migrations/20260206120000_create_catalogs_table.sql` - Migración BD
2. `src/lib/catalogUtils.ts` - Utilidades de catálogo
3. `src/hooks/useCatalog.ts` - React hooks
4. `src/components/CatalogSelect.tsx` - Componente reutilizable
5. `docs/CATALOG_PATTERN.md` - Documentación del patrón
6. `src/test/catalogUtils.test.ts` - Tests unitarios

### Archivos Modificados
1. `src/pages/Eventos.tsx` - Integración de catálogos
2. `src/pages/Asesoramientos.tsx` - Integración de catálogos

## Compatibilidad

- ✅ **100% compatible con código existente**: Los códigos en catálogos coinciden exactamente con valores de ENUMs
- ✅ **No rompe funcionalidad actual**: Todos los tests pasan
- ✅ **No modifica RLS existente**: Solo añade políticas para tabla catalogs
- ✅ **No cambia UI**: Las etiquetas mostradas son las mismas que antes

## Patrón de Uso

### En Formularios
```tsx
<CatalogSelect
  catalogType="event_types"
  value={formData.tipo}
  onValueChange={(v) => setFormData({ ...formData, tipo: v })}
/>
```

### En Tablas
```tsx
const { lookup } = useCatalogLookup('event_types');
// ...
<TableCell>{resolveLabelFromLookup(lookup, evento.tipo)}</TableCell>
```

### En Filtros
```tsx
const { data: tipos } = useCatalog('event_types');
// ...
{tipos?.map(tipo => (
  <SelectItem key={tipo.code} value={tipo.code}>{tipo.label}</SelectItem>
))}
```

## Ventajas del Sistema

1. **Centralización**: Un único lugar para gestionar todos los catálogos
2. **Flexibilidad**: Añadir/modificar valores sin cambiar código
3. **Escalabilidad**: Fácil añadir nuevos tipos de catálogo
4. **Mantenibilidad**: Admins pueden gestionar catálogos sin deployments
5. **Performance**: Caché de 5 minutos reduce llamadas a BD
6. **Multiidioma**: Base para soportar múltiples idiomas en el futuro
7. **Consistencia**: Evita discrepancias entre código y UI

## Próximos Pasos Sugeridos

1. Migrar más catálogos del INVENTARIO_CATALOGOS.md:
   - company_sectors
   - maturity_phases
   - company_statuses
   - training_types
   - training_statuses
   - etc.

2. Crear panel de administración de catálogos (opcional)

3. Añadir soporte multiidioma (label_es, label_en)

4. Considerar migración gradual de ENUMs a catálogos

## Notas de Implementación

- **Sin cambios en UI**: Las etiquetas son exactamente las mismas que antes
- **Sin cambios en permisos**: Solo se añadieron políticas para tabla catalogs
- **Caché de 5 minutos**: Los cambios en catálogos pueden tardar hasta 5 min en reflejarse
- **Fallback automático**: Si no se encuentra una etiqueta, se muestra el código
- **TypeScript**: Tipos completos para todas las utilidades

## Validación

```bash
# Build exitoso
npm run build
✓ built in 3.85s

# Lint exitoso
npm run lint
✖ 8 problems (0 errors, 8 warnings) # Warnings pre-existentes

# Tests exitosos
npm run test
Test Files  4 passed (4)
Tests  16 passed (16)
```

## Migración Requerida

Para activar este sistema en el entorno, ejecutar:
```bash
supabase db push
# o aplicar manualmente:
# supabase/migrations/20260206120000_create_catalogs_table.sql
```

## Referencias

- Documentación: `docs/CATALOG_PATTERN.md`
- Inventario completo: `docs/INVENTARIO_CATALOGOS.md`
- Ejemplos: `src/pages/Eventos.tsx`, `src/pages/Asesoramientos.tsx`
