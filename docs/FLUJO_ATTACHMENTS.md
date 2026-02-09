# Flujo de Attachments (Adjuntos)

## Resumen
Sistema unificado de gestión de archivos/evidencias basado en un modelo polimórfico que permite adjuntar documentos a cualquier entidad del sistema (empresas, eventos, formaciones, oportunidades, etc.).

## Objetivo
Unificar la gestión de archivos dispersa en múltiples tablas (evidencias.archivo_url, grant_applications.documents_url, etc.) en un único sistema transversal, reutilizable y escalable.

## Arquitectura

### Modelo Polimórfico

```
┌─────────────────────────────────────────────────────────────┐
│                     attachments                              │
├─────────────────────────────────────────────────────────────┤
│ id                 UUID (PK)                                 │
│ owner_type         attachment_owner_type (enum)             │
│ owner_id           UUID (FK polimórfico)                    │
│ file_name          TEXT                                     │
│ file_url           TEXT                                     │
│ file_size          BIGINT                                   │
│ mime_type          TEXT                                     │
│ title              TEXT                                     │
│ description        TEXT                                     │
│ category           attachment_category (enum)               │
│ tags               TEXT[]                                   │
│ is_public          BOOLEAN                                  │
│ created_by         UUID (FK → users)                        │
│ created_at         TIMESTAMP                                │
│ updated_at         TIMESTAMP                                │
└─────────────────────────────────────────────────────────────┘
           │
           │ owner_type + owner_id
           ▼
┌──────────────────────────────────────────────────────────────┐
│  Cualquier Entidad (Empresas, Eventos, Formaciones, etc.)   │
└──────────────────────────────────────────────────────────────┘
```

### Owner Types Permitidos

El enum `attachment_owner_type` define las entidades que pueden tener adjuntos:

1. **empresa** - Empresas
2. **contacto** - Contactos
3. **asesoramiento** - Asesoramientos
4. **evento** - Eventos
5. **formacion** - Formaciones
6. **evidencia** - Evidencias (para compatibilidad)
7. **colaborador** - Colaboradores
8. **activity** - Actividades
9. **action_plan** - Planes de Acción
10. **action_plan_item** - Items de Planes de Acción
11. **report** - Informes
12. **opportunity** - Oportunidades
13. **opportunity_note** - Notas de Oportunidades
14. **grant** - Subvenciones
15. **grant_application** - Solicitudes de Subvenciones
16. **company_compliance** - Compliance de Empresas

### Categorías de Attachments

El enum `attachment_category` clasifica los tipos de archivos:

1. **document** - Documento general
2. **image** - Imagen/Fotografía
3. **video** - Video
4. **certificate** - Certificado
5. **report** - Informe
6. **contract** - Contrato
7. **invoice** - Factura
8. **presentation** - Presentación
9. **other** - Otro

## Características Principales

### 1. Polimorfismo
Un único sistema de attachments sirve a **todas las entidades** del sistema mediante `owner_type` + `owner_id`.

### 2. Metadata Rica
- **Título y descripción** descriptivos
- **Categorización** para organización
- **Tags** para búsqueda mejorada
- **Tamaño y tipo MIME** para gestión
- **Flag público** para control de acceso

### 3. Búsqueda Optimizada
- Índice GIN en `tags` para búsqueda rápida
- Índices en `owner_type`, `owner_id`, `category`
- Funciones helper SQL para consultas comunes

### 4. Seguridad
- **RLS Policies**: 
  - Lectura: Todos los usuarios autenticados con roles
  - Escritura: Solo admin y tecnico
- Audit trail completo (created_by, timestamps)

### 5. Reutilización
- **Componentes React** listos para usar:
  - `<AttachmentsList />` - Muestra lista de adjuntos
  - `<AttachmentUpload />` - Formulario de carga

## Uso en el Código

### Backend (SQL)

#### Consultar Attachments
```sql
-- Obtener todos los attachments de una empresa
SELECT * FROM public.get_attachments('empresa', 'uuid-empresa');

-- Contar attachments de un evento
SELECT public.count_attachments('evento', 'uuid-evento');

-- Consulta directa con filtros
SELECT * FROM public.attachments
WHERE owner_type = 'formacion'
  AND owner_id = 'uuid-formacion'
  AND category = 'certificate'
ORDER BY created_at DESC;

-- Ver estadísticas agregadas
SELECT * FROM public.attachments_with_counts
WHERE owner_type = 'empresa';
```

#### Insertar Attachment
```sql
INSERT INTO public.attachments (
  owner_type,
  owner_id,
  file_name,
  file_url,
  file_size,
  mime_type,
  title,
  description,
  category,
  tags,
  is_public,
  created_by
) VALUES (
  'empresa',
  'uuid-empresa',
  'contrato_2024.pdf',
  'https://storage.example.com/files/contrato_2024.pdf',
  2048576,
  'application/pdf',
  'Contrato de Servicios 2024',
  'Contrato firmado con proveedor principal',
  'contract',
  ARRAY['legal', 'contratos', '2024'],
  false,
  'uuid-usuario'
);
```

### Frontend (React/TypeScript)

#### Importar Componentes
```typescript
import { AttachmentsList, AttachmentUpload } from "@/components/attachments";
```

#### Mostrar Lista de Attachments
```typescript
// En cualquier componente de detalle
<AttachmentsList
  ownerType="empresa"
  ownerId={empresaId}
  title="Documentos de la Empresa"
  description="Contratos, certificados y otros documentos"
/>
```

#### Ejemplo de Integración Completa
```typescript
import { AttachmentsList } from "@/components/attachments";

export default function EmpresaDetail({ empresaId }: { empresaId: string }) {
  return (
    <div className="space-y-6">
      {/* Información de la empresa */}
      <Card>
        <CardHeader>
          <CardTitle>Detalles de la Empresa</CardTitle>
        </CardHeader>
        <CardContent>
          {/* ... campos de la empresa ... */}
        </CardContent>
      </Card>

      {/* Lista de archivos adjuntos */}
      <AttachmentsList
        ownerType="empresa"
        ownerId={empresaId}
        title="Documentos"
        description="Contratos, certificados y documentación legal"
        allowedCategories={['document', 'contract', 'certificate']}
      />
    </div>
  );
}
```

#### Uso con Diferentes Entidades
```typescript
// Para eventos
<AttachmentsList
  ownerType="evento"
  ownerId={eventoId}
  title="Fotografías y Evidencias"
  allowedCategories={['image', 'video', 'certificate']}
/>

// Para formaciones
<AttachmentsList
  ownerType="formacion"
  ownerId={formacionId}
  title="Material Didáctico"
  allowedCategories={['document', 'presentation', 'video']}
/>

// Para oportunidades
<AttachmentsList
  ownerType="opportunity"
  ownerId={opportunityId}
  title="Propuestas y Documentación"
  allowedCategories={['document', 'presentation']}
/>
```

## Funciones Helper SQL

### get_attachments()
```sql
-- Definición
CREATE FUNCTION public.get_attachments(
  p_owner_type attachment_owner_type,
  p_owner_id UUID
) RETURNS SETOF public.attachments

-- Uso
SELECT * FROM public.get_attachments('empresa', 'uuid-here');
```

### count_attachments()
```sql
-- Definición
CREATE FUNCTION public.count_attachments(
  p_owner_type attachment_owner_type,
  p_owner_id UUID
) RETURNS BIGINT

-- Uso
SELECT public.count_attachments('evento', 'uuid-here') as total_archivos;
```

## Índices de Performance

1. **idx_attachments_owner** - Búsqueda por owner_type + owner_id (principal)
2. **idx_attachments_owner_type** - Estadísticas por tipo
3. **idx_attachments_category** - Filtrado por categoría
4. **idx_attachments_created_by** - Auditoría por usuario
5. **idx_attachments_created_at** - Ordenamiento temporal
6. **idx_attachments_tags** - Búsqueda full-text en tags (GIN)

## Migración Gradual

### Estrategia
1. **No eliminar** tabla `evidencias` ni campos existentes
2. **Migración progresiva** módulo por módulo
3. **Coexistencia temporal** de ambos sistemas
4. **Unificación gradual** cuando todos los módulos usen attachments

### Ejemplo de Migración
```typescript
// Antiguo (evidencias)
const evidencia = {
  archivo_url: "https://...",
  archivo_nombre: "documento.pdf"
};

// Nuevo (attachments) - mismo resultado, más flexible
const attachment = {
  owner_type: "evidencia",
  owner_id: evidenciaId,
  file_name: "documento.pdf",
  file_url: "https://...",
  category: "document"
};
```

## Casos de Uso

### Caso 1: Empresa con Múltiples Documentos
```typescript
// Una empresa puede tener:
// - Contratos (category: contract)
// - Certificados (category: certificate)
// - Facturas (category: invoice)
// - Informes (category: report)

<AttachmentsList
  ownerType="empresa"
  ownerId={empresaId}
/>
```

### Caso 2: Evento con Evidencias Visuales
```typescript
// Un evento puede tener:
// - Fotografías del evento (category: image)
// - Videos de presentaciones (category: video)
// - Certificados de asistencia (category: certificate)

<AttachmentsList
  ownerType="evento"
  ownerId={eventoId}
  allowedCategories={['image', 'video', 'certificate']}
/>
```

### Caso 3: Formación con Material Didáctico
```typescript
// Una formación puede tener:
// - Presentaciones (category: presentation)
// - Documentos de apoyo (category: document)
// - Videos explicativos (category: video)

<AttachmentsList
  ownerType="formacion"
  ownerId={formacionId}
  title="Material Didáctico"
/>
```

## Búsqueda y Filtrado

### Por Tags
```sql
-- Buscar attachments con tag específico
SELECT * FROM public.attachments
WHERE 'contrato' = ANY(tags);

-- Buscar attachments con múltiples tags
SELECT * FROM public.attachments
WHERE tags @> ARRAY['legal', '2024'];
```

### Por Categoría y Período
```sql
SELECT * FROM public.attachments
WHERE category = 'certificate'
  AND created_at >= '2024-01-01'
  AND created_at < '2025-01-01'
ORDER BY created_at DESC;
```

### Búsqueda Compleja
```sql
-- Todos los certificados de empresas creados este año
SELECT a.*, e.nombre as empresa_nombre
FROM public.attachments a
JOIN public.empresas e ON a.owner_id = e.id
WHERE a.owner_type = 'empresa'
  AND a.category = 'certificate'
  AND EXTRACT(YEAR FROM a.created_at) = 2024;
```

## Vistas y Agregaciones

### attachments_with_counts
Vista que muestra estadísticas por propietario:
```sql
SELECT * FROM public.attachments_with_counts
WHERE owner_type = 'empresa'
ORDER BY attachment_count DESC;

-- Resultado:
-- owner_type | owner_id | attachment_count | total_size | last_attachment_date
-- empresa    | uuid-1   | 15              | 25600000   | 2024-02-09
-- empresa    | uuid-2   | 8               | 12400000   | 2024-02-08
```

## Seguridad y Permisos

### RLS Policies
- **SELECT**: Todos los usuarios autenticados con roles
- **INSERT**: Solo admin y tecnico
- **UPDATE**: Solo admin y tecnico
- **DELETE**: Solo admin y tecnico

### Control de Acceso
```typescript
// Los componentes ya incluyen control de permisos
const { canWrite } = useUserRoles();

// El botón de subida solo se muestra si canWrite es true
{canWrite && <Button>Adjuntar Archivo</Button>}
```

## Mejores Prácticas

### 1. Categorización Consistente
- Usar categorías apropiadas para cada tipo de archivo
- Documentos legales → `contract`
- Evidencias visuales → `image` o `video`
- Informes oficiales → `report`

### 2. Tags Descriptivos
- Usar tags para mejorar búsqueda
- Incluir año, tipo, proyecto, etc.
- Ejemplo: `['2024', 'financiero', 'Q1']`

### 3. Títulos Descriptivos
- Siempre incluir título además del file_name
- El título debe ser legible y descriptivo
- Ejemplo: "Contrato de Servicios 2024" vs "contrato_v3_final_2.pdf"

### 4. Metadata Completa
- Incluir description para contexto
- Especificar mime_type para validación
- Registrar file_size para control de espacio

## Extensibilidad

### Añadir Nuevos Owner Types
```sql
-- En una migración futura
ALTER TYPE attachment_owner_type ADD VALUE 'nuevo_modulo';
```

### Añadir Nuevas Categorías
```sql
-- En una migración futura
ALTER TYPE attachment_category ADD VALUE 'nueva_categoria';
```

## Troubleshooting

### No se muestran los attachments
1. Verificar que `owner_type` y `owner_id` son correctos
2. Comprobar permisos RLS del usuario
3. Revisar console del navegador para errores

### Error al subir archivo
1. Verificar que user tiene rol admin o tecnico
2. Comprobar que file_name y file_url no estén vacíos
3. Verificar conectividad con Supabase

### Performance lenta
1. Asegurar que los índices existen
2. Usar funciones helper en lugar de queries complejas
3. Considerar paginación para listas grandes

## Roadmap Futuro

### Fase 1 (Actual)
- ✅ Tabla attachments creada
- ✅ Componentes React básicos
- ✅ Integración en documentación

### Fase 2 (Próximo)
- [ ] Hook personalizado `useAttachments`
- [ ] Integración con Supabase Storage
- [ ] Drag & drop para upload
- [ ] Preview de imágenes/PDFs

### Fase 3 (Futuro)
- [ ] Versioning de archivos
- [ ] Compresión automática
- [ ] Generación de thumbnails
- [ ] Búsqueda full-text en contenido

## Conclusión

El sistema de attachments proporciona:
- ✅ **Unificación** de gestión de archivos
- ✅ **Flexibilidad** con modelo polimórfico
- ✅ **Reutilización** con componentes listos
- ✅ **Escalabilidad** para cualquier módulo futuro
- ✅ **Seguridad** con RLS y permisos
- ✅ **Performance** con índices optimizados

Este sistema reemplaza gradualmente el enfoque disperso de `archivo_url` en múltiples tablas, proporcionando una solución unificada y mantenible.
