# Flujo de Materiales

## Descripción General

El módulo de **Materiales** permite gestionar recursos, documentos y contenidos que se utilizan en el programa IMPULSA. Los materiales pueden ser asignados a empresas, eventos, formaciones, y ser descargados por usuarios autenticados.

## Tabla de Base de Datos: `materials`

### Campos Principales

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID | Identificador único del material |
| `titulo` | TEXT | Título del material (obligatorio) |
| `descripcion` | TEXT | Descripción detallada del material |
| `tipo` | TEXT | Tipo de material (catálogo: `material_types`) |
| `categoria` | TEXT | Categoría del material (catálogo: `material_categories`) |
| `formato` | TEXT | Formato del archivo (catálogo: `material_formats`) |
| `estado` | ENUM | Estado del material (`draft`, `review`, `published`, `archived`) |
| `empresa_ids` | UUID[] | Array de IDs de empresas relacionadas |
| `evento_ids` | UUID[] | Array de IDs de eventos relacionados |
| `formacion_ids` | UUID[] | Array de IDs de formaciones relacionadas |
| `url_descarga` | TEXT | URL directa de descarga del material |
| `es_descargable` | BOOLEAN | Indica si el material puede descargarse |
| `requiere_autenticacion` | BOOLEAN | Si requiere autenticación para acceder |
| `numero_descargas` | INTEGER | Contador de descargas |
| `fecha_publicacion` | TIMESTAMP | Fecha de publicación del material |
| `tags` | TEXT[] | Etiquetas para búsqueda y clasificación |
| `keywords` | TEXT | Palabras clave para búsqueda |
| `idioma` | TEXT | Código de idioma (ej: 'es', 'en') |
| `version` | TEXT | Versión del material |
| `created_by` | UUID | Usuario creador |
| `created_at` | TIMESTAMP | Fecha de creación |
| `updated_at` | TIMESTAMP | Fecha de última actualización |

### Índices

- `idx_materials_tipo`: Índice en tipo
- `idx_materials_estado`: Índice en estado
- `idx_materials_categoria`: Índice en categoría
- `idx_materials_formato`: Índice en formato
- `idx_materials_tags`: Índice GIN para búsqueda en tags
- `idx_materials_empresa_ids`: Índice GIN para empresas relacionadas
- `idx_materials_evento_ids`: Índice GIN para eventos relacionados
- `idx_materials_formacion_ids`: Índice GIN para formaciones relacionadas

## Catálogos Relacionados

### `material_types` - Tipos de Material

| Código | Etiqueta | Descripción |
|--------|----------|-------------|
| `documento` | Documento | Documentos generales (PDF, Word, etc.) |
| `video` | Vídeo | Contenido en vídeo |
| `presentacion` | Presentación | Presentaciones (PowerPoint, etc.) |
| `template` | Plantilla | Plantillas reutilizables |
| `guia` | Guía | Guías y tutoriales |
| `manual` | Manual | Manuales de usuario o instrucciones |
| `infografia` | Infografía | Infografías educativas |
| `herramienta` | Herramienta | Herramientas interactivas |
| `otro` | Otro | Otros tipos de material |

### `material_categories` - Categorías de Material

| Código | Etiqueta | Descripción |
|--------|----------|-------------|
| `implementacion` | Implementación | Materiales para implementación de proyectos |
| `gestion` | Gestión | Materiales de gestión empresarial |
| `digitalizacion` | Digitalización | Recursos de transformación digital |
| `innovacion` | Innovación | Materiales sobre innovación |
| `sostenibilidad` | Sostenibilidad | Recursos de sostenibilidad |
| `comercializacion` | Comercialización | Materiales de marketing y ventas |
| `financiacion` | Financiación | Recursos sobre financiación |
| `formacion` | Formación | Materiales educativos |
| `legal` | Legal | Documentos legales |
| `otro` | Otro | Otras categorías |

### `material_formats` - Formatos de Material

| Código | Etiqueta | Descripción |
|--------|----------|-------------|
| `pdf` | PDF | Documentos PDF |
| `word` | Word | Documentos Word |
| `excel` | Excel | Hojas de cálculo Excel |
| `powerpoint` | PowerPoint | Presentaciones PowerPoint |
| `video_mp4` | Vídeo (MP4) | Archivos de vídeo MP4 |
| `video_url` | Vídeo (URL) | Enlaces a vídeos externos |
| `html` | Web/HTML | Contenido web/HTML |
| `interactive` | Interactivo | Herramientas interactivas |
| `zip` | Archivo comprimido | Archivos ZIP |
| `otro` | Otro | Otros formatos |

## Estados y Transiciones

### Estados Disponibles

1. **draft** (Borrador)
   - Material en proceso de creación
   - Solo visible para creadores y administradores
   
2. **review** (En revisión)
   - Material esperando aprobación
   - Puede volver a borrador para correcciones
   
3. **published** (Publicado)
   - Material disponible públicamente
   - Se registra `fecha_publicacion` automáticamente
   
4. **archived** (Archivado)
   - Material no activo pero conservado
   - Puede republicarse si es necesario

### Flujo de Transiciones

```
draft → review → published → archived
         ↑         ↓
         └─────────┘
```

**Reglas:**
- `draft` puede ir a `review` o directamente a `published`
- `review` puede volver a `draft` o avanzar a `published`
- `published` solo puede archivarse
- `archived` puede republicarse

## Casos de Uso

### 1. Documento de Diagnóstico Personalizado

**Flujo:**
1. Técnico crea material tipo `documento`, categoría `implementacion`
2. Asigna a empresa específica usando `empresa_ids`
3. Pasa a estado `review` para validación
4. Administrador revisa y publica
5. Empresa descarga el documento desde su perfil

**Ejemplo:**
```typescript
{
  titulo: "Diagnóstico Digital - Empresa XYZ",
  tipo: "documento",
  categoria: "digitalizacion",
  formato: "pdf",
  estado: "published",
  empresa_ids: ["uuid-empresa-xyz"],
  es_descargable: true,
  requiere_autenticacion: true
}
```

### 2. Cartel de Evento

**Flujo:**
1. Se crea material tipo `infografia` vinculado a evento
2. Se sube el cartel y se vincula al evento
3. Se publica para difusión
4. Se puede compartir en RRSS

**Ejemplo:**
```typescript
{
  titulo: "Cartel - Taller de Innovación Digital",
  tipo: "infografia",
  categoria: "formacion",
  formato: "pdf",
  estado: "published",
  evento_ids: ["uuid-evento-123"],
  es_descargable: true,
  requiere_autenticacion: false
}
```

### 3. Material de Formación

**Flujo:**
1. Se crean materiales educativos (guías, infografías, vídeos)
2. Se vinculan a formación específica
3. Se publican para participantes
4. Participantes acceden y descargan

**Ejemplo:**
```typescript
{
  titulo: "Guía de Transformación Digital",
  tipo: "guia",
  categoria: "digitalizacion",
  formato: "pdf",
  estado: "published",
  formacion_ids: ["uuid-formacion-456"],
  es_descargable: true,
  tags: ["digital", "transformación", "pymes"]
}
```

## Permisos y Seguridad (RLS)

### Políticas de Row-Level Security

1. **SELECT**: 
   - Materiales `published` visibles para todos los usuarios autenticados
   - Materiales en cualquier estado visibles para usuarios con roles

2. **INSERT**:
   - Solo usuarios `admin` o `tecnico` pueden crear materiales

3. **UPDATE**:
   - Administradores pueden actualizar cualquier material
   - Técnicos solo pueden actualizar sus propios materiales

4. **DELETE**:
   - Solo administradores pueden eliminar materiales

## Funciones Helper

### `increment_material_downloads(p_material_id UUID)`

Incrementa el contador de descargas de un material.

**Uso:**
```sql
SELECT increment_material_downloads('uuid-del-material');
```

### `get_materials_for_entity(p_entity_type TEXT, p_entity_id UUID)`

Obtiene todos los materiales vinculados a una entidad específica.

**Uso:**
```sql
SELECT * FROM get_materials_for_entity('empresa', 'uuid-empresa');
SELECT * FROM get_materials_for_entity('evento', 'uuid-evento');
SELECT * FROM get_materials_for_entity('formacion', 'uuid-formacion');
```

## Integración con Attachments

Los materiales pueden tener archivos adjuntos asociados usando la tabla `attachments`:

```sql
-- Vincular adjunto a material
INSERT INTO attachments (
  owner_type,
  owner_id,
  file_name,
  file_url,
  category
) VALUES (
  'material',
  'uuid-del-material',
  'documento.pdf',
  'https://storage.url/documento.pdf',
  'document'
);
```

## Métricas y Reportes

### Métricas Clave

- Total de materiales publicados
- Materiales más descargados
- Materiales por categoría
- Materiales por formato
- Materiales por empresa/evento/formación

### Consultas Útiles

```sql
-- Materiales más descargados
SELECT titulo, tipo, numero_descargas
FROM materials
WHERE estado = 'published'
ORDER BY numero_descargas DESC
LIMIT 10;

-- Materiales por categoría
SELECT categoria, COUNT(*) as total
FROM materials
WHERE estado = 'published'
GROUP BY categoria;

-- Materiales asignados a empresa
SELECT m.*
FROM materials m
WHERE 'uuid-empresa' = ANY(m.empresa_ids);
```

## UI - Página de Materiales

**Ubicación:** `/materiales`

**Características:**
- Listado con filtros por tipo, estado y categoría
- Búsqueda por título, descripción y palabras clave
- Descarga directa (incrementa contador automáticamente)
- Edición en diálogo modal
- Indicadores visuales de estado con badges
- Contador de descargas por material

**Permisos UI:**
- Ver listado: Todos los usuarios autenticados
- Crear/Editar: Técnicos y administradores
- Eliminar: Solo administradores

## Ejemplos de Integración

### En perfil de Empresa

```typescript
// Obtener materiales de una empresa
const { data: materials } = await supabase.rpc(
  'get_materials_for_entity',
  { p_entity_type: 'empresa', p_entity_id: empresaId }
);
```

### En página de Evento

```typescript
// Obtener materiales de un evento
const { data: materials } = await supabase.rpc(
  'get_materials_for_entity',
  { p_entity_type: 'evento', p_entity_id: eventoId }
);
```

## Mejores Prácticas

1. **Nomenclatura**: Usar títulos descriptivos y únicos
2. **Categorización**: Asignar siempre tipo y categoría apropiados
3. **Tags**: Usar tags para mejorar la búsqueda
4. **Versiones**: Mantener control de versiones cuando sea aplicable
5. **Publicación**: Revisar antes de publicar materiales importantes
6. **Archivado**: Archivar materiales obsoletos en lugar de eliminarlos
7. **URLs**: Usar URLs permanentes y accesibles
8. **Seguridad**: Configurar correctamente `requiere_autenticacion` según el caso
