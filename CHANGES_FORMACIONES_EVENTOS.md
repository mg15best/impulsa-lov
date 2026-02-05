# Cambios en Formaciones y Eventos

## Resumen
Se han añadido campos nuevos a las tablas `formaciones` y `eventos` según los requisitos especificados, evitando duplicados y mapeando con los campos existentes.

## Tabla: formaciones

### Campos Solicitados vs Implementación

| Campo Solicitado | Campo en BD | Estado | Tipo |
|-----------------|-------------|---------|------|
| Título | `titulo` | ✅ Ya existía | TEXT NOT NULL |
| Tema | `tema` | ✅ Añadido | TEXT |
| Objetivo | `objetivos` | ✅ Ya existía | TEXT |
| Código de modalidad | `modalidad` | ✅ Ya existía | TEXT |
| Fecha y hora de inicio | `fecha_inicio` + `hora_inicio` | ✅ Añadido `hora_inicio` | DATE + TIME |
| Fecha y hora de fin | `fecha_fin` + `hora_fin` | ✅ Añadido `hora_fin` | DATE + TIME |
| Horas | `duracion_horas` | ✅ Ya existía | INTEGER |
| Proveedor | `formador` | ✅ Ya existía | TEXT |
| Notas de materiales | `materiales` | ✅ Ya existía | TEXT |
| Notas de evidencia | `notas_evidencia` | ✅ Añadido | TEXT |

### Nuevos Campos Añadidos
1. **tema** (TEXT) - Tema de la formación
2. **hora_inicio** (TIME) - Hora de inicio de la formación
3. **hora_fin** (TIME) - Hora de fin de la formación
4. **notas_evidencia** (TEXT) - Notas de evidencia de la formación

### Archivos Modificados
- `supabase/migrations/20260205132500_add_formaciones_new_fields.sql` - Migración con los nuevos campos
- `src/integrations/supabase/types.ts` - Tipos actualizados
- `src/pages/Formaciones.tsx` - UI actualizada con los nuevos campos en el formulario

## Tabla: eventos

### Campos Solicitados vs Implementación

| Campo Solicitado | Campo en BD | Estado | Tipo |
|-----------------|-------------|---------|------|
| Código de tipo de evento | `tipo` | ✅ Ya existía | tipo_evento ENUM |
| Título | `nombre` | ✅ Ya existía | TEXT NOT NULL |
| Fecha y hora de inicio | `fecha` + `hora_inicio` | ✅ Ya existían | DATE + TIME |
| Fecha y hora de fin | `fecha_fin` + `hora_fin` | ✅ Añadidos | DATE + TIME |
| Código de formato | `formato` | ✅ Añadido | TEXT |
| Ubicación o URL | `ubicacion` | ✅ Ya existía | TEXT |
| Objetivo | `objetivo` | ✅ Añadido | TEXT |
| Notas del programa | `notas_programa` | ✅ Añadido | TEXT |
| Notas de evidencia | `notas_evidencia` | ✅ Añadido | TEXT |

### Nuevos Campos Añadidos
1. **fecha_fin** (DATE) - Fecha de fin del evento
2. **hora_fin** (TIME) - Hora de fin del evento
3. **formato** (TEXT) - Código de formato (presencial, online, híbrido)
4. **objetivo** (TEXT) - Objetivo del evento
5. **notas_programa** (TEXT) - Notas del programa del evento
6. **notas_evidencia** (TEXT) - Notas de evidencia del evento

### Archivos Modificados
- `supabase/migrations/20260205133000_add_eventos_new_fields.sql` - Migración con los nuevos campos
- `src/integrations/supabase/types.ts` - Tipos actualizados
- `src/pages/Eventos.tsx` - UI actualizada con los nuevos campos en el formulario

## Decisiones de Diseño

### Separación de Fecha y Hora
Se decidió mantener separados los campos de fecha (DATE) y hora (TIME) en lugar de usar TIMESTAMP porque:
- Mayor flexibilidad para eventos que pueden no tener hora definida
- Facilita la búsqueda y filtrado por fecha sin considerar la hora
- Permite capturar solo la fecha en eventos de día completo
- Consistente con el diseño existente de la base de datos

### Formato de Modalidad/Formato
Se utilizó TEXT en lugar de ENUM para los campos `modalidad` (formaciones) y `formato` (eventos) porque:
- Mayor flexibilidad para valores futuros sin necesidad de migraciones
- Simplicidad en la validación desde el frontend
- Valores sugeridos: "presencial", "online", "híbrido"/"hibrida"

### Campos de Notas
Todos los campos de notas (`notas_evidencia`, `notas_programa`, `materiales`, etc.) son de tipo TEXT para permitir:
- Descripciones extensas
- Múltiples líneas de texto
- Formato libre según necesidades del usuario

## Cómo Aplicar las Migraciones

Para aplicar estos cambios en Supabase:

1. Ejecutar las migraciones en orden:
   ```sql
   -- Primero formaciones
   -- /supabase/migrations/20260205132500_add_formaciones_new_fields.sql
   
   -- Luego eventos
   -- /supabase/migrations/20260205133000_add_eventos_new_fields.sql
   ```

2. Los campos se añaden con `ADD COLUMN IF NOT EXISTS` para evitar errores si ya existen

3. Todos los nuevos campos son opcionales (NULL permitido) para no afectar registros existentes

## Interfaz de Usuario

### Formaciones
El formulario ahora incluye:
- Campo "Tema" (nuevo)
- Campos separados para "Hora Inicio" y "Hora Fin" (nuevos)
- Campo "Notas de Materiales" (ya existía, ahora visible en UI)
- Campo "Notas de Evidencia" (nuevo)

### Eventos
El formulario ahora incluye:
- Campo "Estado" (ya existía, ahora visible)
- Campo "Formato" con selector (Presencial/Online/Híbrido) (nuevo)
- Campos separados para "Fecha Fin" y "Hora de Fin" (nuevos)
- Campo "Objetivo" (nuevo)
- Campo "Notas del Programa" (nuevo)
- Campo "Notas de Evidencia" (nuevo)
- Label actualizado de "Ubicación" a "Ubicación o URL" (clarificación)

## Compatibilidad

✅ Los cambios son totalmente compatibles con:
- Registros existentes (todos los campos nuevos permiten NULL)
- Funcionalidad actual (no se modificaron campos existentes)
- Tipos de TypeScript (generados automáticamente)

## Próximos Pasos

1. Aplicar las migraciones en el entorno de Supabase
2. Verificar que los tipos TypeScript se generen correctamente
3. Probar la creación y edición de formaciones y eventos
4. Verificar que los filtros y búsquedas sigan funcionando correctamente
