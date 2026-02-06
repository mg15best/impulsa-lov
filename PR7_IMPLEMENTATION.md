# PR-7: Integración de KPIs con Definiciones Funcionales

## Resumen

Este Pull Request implementa la integración de KPIs del Dashboard con las definiciones funcionales del contrato PR-0, centralizando su definición y documentación en el código.

## Objetivos Cumplidos

✅ **Alinear los KPIs del Dashboard con las definiciones formales del contrato funcional (PR-0)**
- Todos los KPIs del Dashboard ahora están alineados con `docs/DEFINICION_KPIS.md`
- Cada KPI implementa exactamente la fórmula documentada en PR-0

✅ **Documentar en el código el origen, criterio y fórmula de cada KPI**
- Archivo `src/config/kpis.ts`: Definiciones centralizadas con documentación completa
- Archivo `src/hooks/useKPICalculations.ts`: Implementación con comentarios detallados
- Cada query incluye comentarios con: origen (tabla/campo), criterio y fórmula

✅ **Centralizar la definición de KPIs en una estructura común**
- Estructura `KPIDefinition` en `src/config/kpis.ts`
- Array `KPI_DEFINITIONS` con todas las definiciones
- Hook `useKPICalculations` para cálculo centralizado

✅ **Mantener la UI actual sin cambios estéticos**
- No se modificaron estilos, colores ni estructura visual del Dashboard
- La UI se mantiene idéntica, solo se refactorizó el código interno

✅ **No modificar reglas de backend ni permisos**
- No se modificaron migraciones de base de datos
- No se cambiaron políticas RLS
- No se modificaron reglas de permisos

## Cambios Realizados

### 1. Nuevo archivo: `src/config/kpis.ts`

Centraliza todas las definiciones de KPIs con:
- **id**: Identificador único del KPI
- **label**: Etiqueta mostrada en la UI
- **description**: Descripción completa del KPI
- **source**: Fuente de datos (tabla y campos)
- **criteria**: Criterio de contabilización
- **formula**: Fórmula SQL o lógica de cálculo
- **target**: Meta a alcanzar
- **icon**: Componente de icono
- **color**: Color de identificación
- **updateFrequency**: Frecuencia de actualización
- **reference**: Enlace a documentación PR-0

#### KPIs Definidos (8 KPIs Operativos):

1. **Empresas Asesoradas** (Meta: 20)
   - Fuente: `empresas.estado`
   - Criterio: `estado IN ('asesorada', 'completada')`

2. **Informes Generados** (Meta: 15)
   - Fuente: `asesoramientos.informe_generado`
   - Criterio: `informe_generado = true`

3. **Eventos Realizados** (Meta: 2)
   - Fuente: `eventos.estado`
   - Criterio: `estado = 'completado'`

4. **Píldoras Formativas** (Meta: 6)
   - Fuente: `formaciones.tipo, formaciones.estado`
   - Criterio: `tipo = 'pildora_formativa' AND estado = 'completada'`

5. **Entidades Colaboradoras** (Meta: 8)
   - Fuente: `colaboradores.estado, colaboradores.convenio_firmado`
   - Criterio: `estado = 'activo' AND convenio_firmado = true`

6. **Impactos de Difusión** (Meta: 15)
   - Fuente: `evidencias` con JOINs a `eventos` y `formaciones`
   - Criterio: `tipo IN ('fotografia', 'video', 'otro')` relacionado con eventos/formaciones completados

7. **Material de Apoyo** (Meta: 5)
   - Fuente: `evidencias.tipo, evidencias.formacion_id`
   - Criterio: `tipo IN ('documento', 'certificado', 'informe') AND formacion_id IS NOT NULL`

8. **Cuadro de Mando PowerBI** (Meta: 1)
   - Fuente: Variables de entorno
   - Criterio: Todas las variables de PowerBI configuradas

### 2. Nuevo archivo: `src/hooks/useKPICalculations.ts`

Hook personalizado que:
- Implementa el cálculo de todos los KPIs según las definiciones de PR-0
- Documenta cada query con origen, criterio y fórmula
- Retorna array de `KPIValue` con valores calculados y porcentajes
- Maneja estados de carga y errores
- Utiliza las definiciones centralizadas de `src/config/kpis.ts`

#### Implementaciones Especiales:

**KPI 6 - Impactos de Difusión:**
```typescript
// Debido a relaciones opcionales con eventos/formaciones,
// se ejecutan dos queries separadas y se deduplicar los IDs
const evidenciasEventos = // Query para evidencias con eventos
const evidenciasFormaciones = // Query para evidencias con formaciones
const evidenciaIds = new Set([...]) // Deduplicación
```

**KPI 8 - Cuadro de Mando PowerBI:**
```typescript
// Verifica configuración de variables de entorno
const powerBIConfigured = 
  !!import.meta.env.VITE_POWER_TENANT_ID &&
  !!import.meta.env.VITE_POWER_CLIENT_ID &&
  !!import.meta.env.VITE_POWER_API_BASE_URL;
```

### 3. Refactorización: `src/pages/Dashboard.tsx`

**Cambios realizados:**
- Eliminada definición local de KPIs (ahora usa definiciones centralizadas)
- Reemplazadas queries inline por hook `useKPICalculations`
- Añadidos comentarios de documentación
- Simplificado código (de ~90 líneas a ~65 líneas de lógica)
- Mantenida UI exactamente igual (sin cambios visuales)

**Antes:**
```typescript
const [kpis, setKpis] = useState<KPI[]>([...]) // 8 definiciones inline
// Queries inline mezcladas con lógica de stats
setKpis(prev => prev.map(...)) // Actualización manual
```

**Después:**
```typescript
const { kpiValues } = useKPICalculations() // Hook centralizado
// Queries de stats separadas de KPIs
// Uso directo de kpiValues del hook
```

## Estructura de Archivos

```
src/
├── config/
│   └── kpis.ts              # Definiciones centralizadas de KPIs
├── hooks/
│   └── useKPICalculations.ts # Hook para cálculo de KPIs
└── pages/
    └── Dashboard.tsx         # Dashboard refactorizado
```

## Beneficios de la Implementación

### 1. **Trazabilidad Completa**
Cada KPI tiene documentado:
- De dónde vienen los datos (tabla, campos)
- Qué criterios se aplican (condiciones WHERE)
- Cómo se calcula (fórmula SQL/lógica)
- Dónde está documentado formalmente (referencia a PR-0)

### 2. **Mantenibilidad**
- Cambios en KPIs se hacen en un solo lugar (`src/config/kpis.ts`)
- Fácil añadir nuevos KPIs siguiendo la estructura existente
- Documentación y código están sincronizados

### 3. **Reutilización**
- Hook `useKPICalculations` puede usarse en otros componentes
- Definiciones en `kpis.ts` pueden importarse donde se necesiten
- Fácil exportar KPIs a otros formatos (API, PowerBI, etc.)

### 4. **Alineación con PR-0**
- Cada KPI tiene referencia directa a su documentación en PR-0
- Fórmulas implementadas coinciden exactamente con las documentadas
- Criterios y fuentes de datos son consistentes

### 5. **Sin Regresión**
- UI mantiene apariencia exacta
- No hay cambios en backend o permisos
- Compatibilidad total con código existente

## Validación

### Build
```bash
npm run build
✓ built in 3.88s
```

### Linter
```bash
npm run lint
✖ 8 problems (0 errors, 8 warnings)
# Solo advertencias preexistentes, no errores nuevos
```

### TypeScript
- No errores de compilación
- Tipos correctamente definidos para `KPIDefinition` y `KPIValue`
- Importaciones correctas

## Referencias

### Documentación PR-0
- **Contrato Funcional**: `docs/README.md`
- **Definición de KPIs**: `docs/DEFINICION_KPIS.md`
- **Modelo de Dominio**: `docs/MODELO_DOMINIO.md`

### Archivos Modificados/Creados
1. `src/config/kpis.ts` - **NUEVO**: Definiciones centralizadas
2. `src/hooks/useKPICalculations.ts` - **NUEVO**: Cálculo de KPIs
3. `src/pages/Dashboard.tsx` - **MODIFICADO**: Refactorizado para usar definiciones centralizadas

### Código de Ejemplo

Para usar los KPIs centralizados en otro componente:

```typescript
import { useKPICalculations } from "@/hooks/useKPICalculations";
import { KPI_DEFINITIONS, getKPIDefinition } from "@/config/kpis";

function MiComponente() {
  const { kpiValues, isLoading, error } = useKPICalculations();
  
  // Obtener un KPI específico
  const empresasKPI = kpiValues.find(kpi => kpi.id === "empresas_asesoradas");
  
  // Obtener definición de un KPI
  const definition = getKPIDefinition("empresas_asesoradas");
  console.log(definition.formula); // SQL query
  
  return (
    <div>
      {kpiValues.map(kpi => (
        <div key={kpi.id}>
          {kpi.label}: {kpi.value} / {kpi.target}
        </div>
      ))}
    </div>
  );
}
```

## Próximos Pasos Sugeridos (Fuera del Alcance de PR-7)

1. **Caché de KPIs**: Implementar caché con actualización periódica
2. **Histórico**: Tabla para almacenar valores históricos de KPIs
3. **API de KPIs**: Endpoint para exportar KPIs a PowerBI u otros sistemas
4. **KPIs Estratégicos**: Implementar los KPIs estratégicos documentados en PR-0
5. **KPIs de Impacto**: Implementar los KPIs de impacto documentados en PR-0
6. **Alertas**: Sistema de notificaciones cuando KPI < 50% de meta
7. **Exportación**: Funcionalidad para exportar KPIs a Excel/CSV

## Conclusión

PR-7 cumple exitosamente todos los objetivos:
- ✅ Alineación con definiciones formales de PR-0
- ✅ Documentación completa en código
- ✅ Centralización de definiciones
- ✅ UI sin cambios estéticos
- ✅ Sin modificaciones en backend/permisos

El código es más mantenible, trazable y alineado con el contrato funcional PR-0.
