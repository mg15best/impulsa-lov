# Runbook: despliegue seguro para resiliencia de esquema (PR-4)

## Objetivo
Asegurar que despliegues con cambios de esquema no rompan altas en frontend por caché desactualizada de PostgREST.

## Cuándo usar este runbook
- Después de aplicar migraciones que crean/alteran tablas o columnas usadas por formularios de alta.
- Cuando aparezcan errores de tipo:
  - `Could not find the '<columna>' column of '<tabla>'`
  - `could not find the table '<schema.tabla>' in the schema cache`

## Pre-requisitos
- Acceso al proyecto Supabase (SQL Editor o CLI).
- Rama con migraciones aplicables en orden.
- Build del frontend lista para desplegar.

## Secuencia de despliegue recomendada

1. **Aplicar migraciones de base de datos**
   - CLI: `supabase db push`
   - O SQL Editor ejecutando migraciones pendientes.

2. **Recargar schema cache de PostgREST**
   Ejecutar:
   ```sql
   NOTIFY pgrst, 'reload schema';
   ```

3. **Desplegar frontend**
   - Publicar build que consuma las nuevas columnas/catálogos.

4. **Validar smoke crítico (manual)**
   - Alta de Empresa.
   - Alta de Contacto asociado.
   - Alta de Asesoramiento asociado.
   - Alta de Evento/Formación/Colaborador.

## Checklist post-despliegue
- [ ] No aparecen errores de schema cache en toasts ni consola.
- [ ] Las nuevas altas persisten y se listan correctamente.
- [ ] No hay errores de permisos inesperados (RLS) en Network.

## Diagnóstico rápido si falla

1. **Reforzar recarga de caché**
   ```sql
   NOTIFY pgrst, 'reload schema';
   ```

2. **Verificar existencia de tabla/columna**
   ```sql
   SELECT table_name, column_name
   FROM information_schema.columns
   WHERE table_schema='public'
     AND table_name IN ('empresas','contactos','asesoramientos','eventos','formaciones','colaboradores');
   ```

3. **Verificar migraciones aplicadas**
   ```sql
   SELECT *
   FROM supabase_migrations.schema_migrations
   ORDER BY version DESC
   LIMIT 20;
   ```

4. **Si persiste**
   - Reiniciar proyecto Supabase (último recurso operacional).
   - Reintentar smoke tests.

## Rollback operativo
- Si frontend nuevo falla y no puede mitigarse rápido:
  1. Rollback del frontend a versión previa estable.
  2. Mantener base de datos (evitar rollback destructivo).
  3. Revisar compatibilidad de payload/frontend con columnas disponibles.

## Notas
- El fallback de inserción en frontend mitiga incidentes transitorios, pero **no sustituye**
  una sincronización correcta entre migraciones y despliegue.
