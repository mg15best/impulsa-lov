# Mapeo de Campos Estructurales de Empresas (PR-C)

## Introducción

Este documento describe el mapeo de campos estructurales añadidos a la entidad **Empresas** como parte de PR-C, siguiendo los requisitos de ampliar el modelo de datos sin alterar los flujos ni la UI existente.

## Objetivos de PR-C

1. ✅ Extender el modelo de Empresas con campos adicionales estructurales
2. ✅ Mantener compatibilidad con datos actuales (no romper formularios ni listados)
3. ✅ Integrar campos *_code con catálogos usando resolución de PR-B
4. ✅ No modificar reglas de backend/RLS ni permisos
5. ✅ Documentar mapeo de campos nuevos y uso previsto

## Mapeo de Campos: Requisitos → Implementación

### Campos de Identificación y Legal

| Campo Requerido | Campo en BD | Tipo | Único | Migración | Notas |
|----------------|-------------|------|-------|-----------|-------|
| `legal_name` | `nombre` | TEXT | No | Base | Nombre legal de la empresa (ya existía) |
| `trade_name` | `nombre_comercial` | TEXT | No | 20260205114700 | Nombre comercial de la empresa |
| `tax_id` | `cif` | TEXT | Sí (UNIQUE) | Base | CIF/NIF de identificación fiscal (ya existía) |
| `legal_form` | `forma_juridica` | TEXT | No | 20260205114700 | Forma jurídica, integrado con catálogo `legal_forms` |

**Catálogo asociado: `legal_forms`**
- Códigos: `sl`, `sa`, `autonomo`, `cooperativa`, `asociacion`, `fundacion`, `slp`, `cb`, `slu`, `other`
- Labels: "S.L.", "S.A.", "Autónomo", "Cooperativa", etc.

---

### Campos de Contacto y Presencia Web

| Campo Requerido | Campo en BD | Tipo | Migración | Notas |
|----------------|-------------|------|-----------|-------|
| `website` | `web` | TEXT | Base | URL del sitio web (ya existía) |
| `social_links` | `redes_sociales` | JSONB | 20260205114700 | Enlaces a redes sociales en formato JSON |

**Formato de `redes_sociales`:**
```json
{
  "twitter": "https://twitter.com/empresa",
  "linkedin": "https://linkedin.com/company/empresa",
  "facebook": "https://facebook.com/empresa",
  "instagram": "https://instagram.com/empresa"
}
```

---

### Campos de Ubicación

| Campo Requerido | Campo en BD | Tipo | Migración | Notas |
|----------------|-------------|------|-----------|-------|
| `address` | `direccion` | TEXT | Base | Dirección física completa (ya existía) |
| `postal_code` | `codigo_postal` | TEXT | 20260205114700 | Código postal |
| `municipality` | `municipio` | TEXT | 20260205114700 | Municipio |
| `island` | `isla` | TEXT | 20260205114700 | Isla (Canarias: Tenerife, Gran Canaria, etc.) |

---

### Campos de Clasificación Sectorial

| Campo Requerido | Campo en BD | Tipo | Migración | Notas |
|----------------|-------------|------|-----------|-------|
| `sector_code` | `sector` | ENUM sector_empresa | Base | Código del sector económico (ya existía) |
| `subsector` | `subsector` | TEXT | 20260205114700 | Subsector específico (texto libre) |

**Valores del ENUM `sector_empresa`:**
- `tecnologia`, `industria`, `servicios`, `comercio`, `turismo`, `energia`, `construccion`, `agroalimentario`, `otro`

---

### Campos de Madurez y Estado

| Campo Requerido | Campo en BD | Tipo | Migración | Notas |
|----------------|-------------|------|-----------|-------|
| `incorporation_date` | `fecha_constitucion` | DATE | 20260205114700 | Fecha de constitución de la empresa |
| `is_emergent_status` | `fase_madurez` | ENUM fase_madurez | Base | Fase de madurez/estado emergente (ya existía) |

**Valores del ENUM `fase_madurez`:**
- `idea` - Fase de idea
- `validacion` - Fase de validación
- `crecimiento` - Fase de crecimiento
- `consolidacion` - Fase de consolidación

---

### Campos de Pipeline y Seguimiento

| Campo Requerido | Campo en BD | Tipo | Catálogo | Migración | Notas |
|----------------|-------------|------|----------|-----------|-------|
| `pipeline_status_code` | `codigo_estado_pipeline` | TEXT | `pipeline_statuses` | 20260205114700 | Estado en el pipeline de ventas |
| `lead_source_code` | `codigo_origen_lead` | TEXT | `lead_sources` | 20260205114700 | Origen del lead |
| `assigned_to` | `tecnico_asignado_id` | UUID (FK) | - | Base | Usuario técnico asignado (ya existía) |

**Catálogo `pipeline_statuses`:**
- Códigos: `lead`, `qualified`, `proposal`, `negotiation`, `won`, `lost`
- Labels: "Lead", "Cualificado", "Propuesta", "Negociación", "Ganado", "Perdido"

**Catálogo `lead_sources`:**
- Códigos: `web`, `referral`, `event`, `partner`, `direct`, `campaign`, `social_media`, `other`
- Labels: "Sitio Web", "Referido", "Evento", "Socio/Partner", "Contacto Directo", "Campaña", "Redes Sociales", "Otro"

---

### Campos de Diagnóstico

| Campo Requerido | Campo en BD | Tipo | Migración | Notas |
|----------------|-------------|------|-----------|-------|
| `diagnosis_form_url` | `url_formulario_diagnostico` | TEXT | 20260205114700 | URL del formulario de diagnóstico |
| `diagnosis_received_date` | `fecha_recepcion_diagnostico` | DATE | 20260205114700 | Fecha de recepción del diagnóstico |
| `diagnosis_summary` | `resumen_diagnostico` | TEXT | 20260205114700 | Resumen del diagnóstico realizado |

---

### Campos de Proyecto y Cierre

| Campo Requerido | Campo en BD | Tipo | Catálogo | Migración | Notas |
|----------------|-------------|------|----------|-----------|-------|
| `start_date` | `fecha_inicio` | DATE | - | 20260205114700 | Fecha de inicio del proyecto/asesoramiento |
| `end_date` | `fecha_finalizacion` | DATE | - | 20260205114700 | Fecha de finalización del proyecto |
| `close_reason_code` | `codigo_motivo_cierre` | TEXT | `close_reasons` | 20260205114700 | Código del motivo de cierre |
| `success_case_flag` | `es_caso_exito` | BOOLEAN | - | 20260205114700 | Indicador de caso de éxito (default: false) |

**Catálogo `close_reasons`:**
- Códigos: `completed`, `not_interested`, `no_budget`, `no_fit`, `duplicate`, `no_response`, `timing`, `other`
- Labels: "Completado con éxito", "No interesado", "Sin presupuesto", "No se ajusta al perfil", "Duplicado", "Sin respuesta", "Timing incorrecto", "Otro motivo"

---

## Integración con Catálogos (PR-B)

### Catálogos Utilizados

Los siguientes catálogos fueron creados en la migración `20260206125000_add_empresas_catalogs.sql`:

1. **`legal_forms`** - Formas jurídicas
2. **`pipeline_statuses`** - Estados del pipeline de ventas
3. **`lead_sources`** - Orígenes de leads
4. **`close_reasons`** - Motivos de cierre

### Uso en UI

Los campos que utilizan catálogos emplean el componente `<CatalogSelect>` de PR-B:

```tsx
<CatalogSelect
  catalogType="pipeline_statuses"
  value={formData.codigo_estado_pipeline}
  onValueChange={(v) => setFormData({ ...formData, codigo_estado_pipeline: v })}
  placeholder="Seleccionar estado"
/>
```

### Resolución de Labels

Para mostrar las etiquetas legibles en tablas y vistas:

```tsx
import { useCatalogLookup, resolveLabelFromLookup } from '@/hooks/useCatalog';

const { lookup } = useCatalogLookup('pipeline_statuses');
<td>{resolveLabelFromLookup(lookup, empresa.codigo_estado_pipeline)}</td>
```

---

## Ubicación de los Campos en la UI

### Formulario de Creación/Edición

Los campos se organizan en dos secciones:

#### **Campos Básicos** (Siempre visibles)
- Nombre Legal, Nombre Comercial
- CIF, Forma Jurídica (con catálogo)
- Sector, Subsector
- Fase de Madurez, Fecha de Constitución
- Email, Teléfono
- Dirección, Código Postal, Municipio, Isla
- Sitio Web, Origen del Lead (con catálogo)
- Contacto Principal
- Descripción

#### **Campos Avanzados** (Sección colapsable "Campos Avanzados (Opcional)")
- Estado Pipeline (con catálogo)
- Fecha de Inicio, Fecha de Finalización
- Motivo de Cierre (con catálogo)
- URL Formulario Diagnóstico, Fecha Recepción Diagnóstico
- Resumen Diagnóstico
- Checkbox "Marcar como Caso de Éxito"

### Tabla de Listado

La tabla muestra solo los campos esenciales:
- Nombre (con nombre comercial como subtítulo si existe)
- CIF
- Municipio
- Sector (con subsector como subtítulo si existe)
- Fase de Madurez
- Estado
- Contacto

**Nota:** Los campos avanzados no se muestran en la tabla para mantener simplicidad y compatibilidad.

---

## Migraciones Aplicadas

### 1. Base Schema (20260203090236)

Creó la tabla `empresas` con campos básicos:
- `nombre`, `cif`, `sector`, `fase_madurez`, `estado`
- `direccion`, `telefono`, `email`, `web`, `contacto_principal`
- `tecnico_asignado_id`, `descripcion`

### 2. Nuevos Campos (20260205114700)

Agregó 17 campos adicionales:
- `nombre_comercial`, `forma_juridica`, `redes_sociales`
- `codigo_postal`, `municipio`, `isla`, `subsector`
- `fecha_constitucion`, `codigo_estado_pipeline`, `codigo_origen_lead`
- `url_formulario_diagnostico`, `fecha_recepcion_diagnostico`, `resumen_diagnostico`
- `fecha_inicio`, `fecha_finalizacion`, `codigo_motivo_cierre`
- `es_caso_exito`

### 3. Catálogos (20260206125000)

Creó entradas en la tabla `catalogs` para:
- `legal_forms` (10 entradas)
- `pipeline_statuses` (6 entradas)
- `lead_sources` (8 entradas)
- `close_reasons` (8 entradas)

---

## Compatibilidad y Retrocompatibilidad

### ✅ Mantiene Compatibilidad

1. **Listados:** La tabla de empresas sigue mostrando los mismos campos básicos
2. **Búsquedas:** La búsqueda por nombre y CIF no se ve afectada
3. **Filtros:** Los filtros por sector y estado siguen funcionando
4. **RLS Policies:** No se modificaron las políticas de seguridad existentes
5. **Campos Opcionales:** Todos los nuevos campos son opcionales (nullable)

### 🔧 Cambios en UI

1. **Formulario de creación:** Se añadió una sección colapsable "Campos Avanzados (Opcional)"
2. **Catálogos:** Los campos `forma_juridica` y `codigo_origen_lead` ahora usan selectores en lugar de texto libre
3. **Sin cambios estéticos:** Se mantiene el diseño existente usando los mismos componentes de UI

---

## Uso Previsto de los Nuevos Campos

### Campos de Identificación Legal
- **Uso:** Identificación formal de la empresa para contratos y documentación oficial
- **Quién lo usa:** Equipo administrativo y legal
- **Cuándo:** Al formalizar la relación con la empresa

### Campos de Pipeline
- **Uso:** Seguimiento del proceso de captación y cualificación de leads
- **Quién lo usa:** Equipo comercial y técnicos asignados
- **Cuándo:** Durante todo el ciclo de vida del lead/empresa

### Campos de Diagnóstico
- **Uso:** Gestión del proceso de diagnóstico empresarial
- **Quién lo usa:** Técnicos asignados
- **Cuándo:** Durante la fase de evaluación y diagnóstico

### Campos de Proyecto
- **Uso:** Control de fechas y resultados de proyectos/asesoramientos
- **Quién lo usa:** Gestores de proyecto y KPIs
- **Cuándo:** Durante y al finalizar proyectos

### Campos de Ubicación Detallada
- **Uso:** Análisis geográfico, filtros por zona, reportes territoriales
- **Quién lo usa:** Analistas de datos y gestores territoriales
- **Cuándo:** Para reportes y análisis de distribución geográfica

---

## Validaciones y Reglas de Negocio

### Campos Únicos
- **`cif`:** UNIQUE constraint en base de datos (previene duplicados)

### Campos Requeridos
- **`nombre`:** NOT NULL (nombre legal obligatorio)
- **`sector`:** NOT NULL con default 'otro'
- **`fase_madurez`:** NOT NULL con default 'idea'
- **`estado`:** NOT NULL con default 'pendiente'

### Campos Opcionales
- Todos los nuevos campos de PR-C son opcionales (nullable/default)
- No se requiere completarlos en el formulario de creación
- Pueden completarse posteriormente en edición

### Validaciones de Formato
- **URLs (`web`, `url_formulario_diagnostico`):** type="url" en inputs
- **Emails:** type="email" en input
- **Fechas:** type="date" con formato YYYY-MM-DD
- **JSONB (`redes_sociales`):** Debe ser JSON válido

---

## Próximos Pasos y Extensibilidad

### Catálogos Futuros Potenciales

Según el inventario de catálogos (docs/INVENTARIO_CATALOGOS.md), podrían añadirse:

1. **`canary_islands`** - Catálogo de islas en lugar de texto libre
2. **`municipalities`** - Catálogo de municipios por isla
3. **`company_sectors`** - Migrar el ENUM sector_empresa a catálogo
4. **`maturity_phases`** - Migrar el ENUM fase_madurez a catálogo

### Mejoras en UI

1. **Detalle expandido:** Crear una vista de detalle de empresa que muestre todos los campos
2. **Historial de cambios:** Tracking de cambios en campos críticos
3. **Validaciones avanzadas:** Validación de CIF con formato español
4. **Autocompletado:** Municipios e islas desde catálogos

### Integraciones

1. **API externa:** Validación de CIF con registros oficiales
2. **Geolocalización:** Auto-rellenar municipio/isla desde código postal
3. **Enriquecimiento:** Auto-rellenar datos desde web/redes sociales

---

## Referencias

- **Migración base:** `/supabase/migrations/20260203090236_88afe067-8429-4547-bd89-997360135f3c.sql`
- **Migración nuevos campos:** `/supabase/migrations/20260205114700_add_empresas_new_fields.sql`
- **Migración catálogos:** `/supabase/migrations/20260206125000_add_empresas_catalogs.sql`
- **Componente UI:** `/src/pages/Empresas.tsx`
- **Patrón de catálogos:** `/docs/CATALOG_PATTERN.md`
- **Inventario de catálogos:** `/docs/INVENTARIO_CATALOGOS.md`

---

## Resumen de Cumplimiento

| Requisito | Estado | Notas |
|-----------|--------|-------|
| Extender modelo con campos estructurales | ✅ Completado | 24 campos totales (7 base + 17 nuevos) |
| Mantener compatibilidad | ✅ Completado | Sin cambios en listados ni flujos existentes |
| Integrar *_code con catálogos | ✅ Completado | 4 catálogos nuevos con resolución PR-B |
| No modificar RLS ni permisos | ✅ Completado | Políticas sin cambios |
| Documentar mapeo de campos | ✅ Completado | Este documento |

---

**Fecha de creación:** 2026-02-06  
**Autor:** Sistema de gestión PR-C  
**Versión:** 1.0
