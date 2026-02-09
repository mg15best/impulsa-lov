# PR-T2: Testing Guide

## Overview
This guide provides step-by-step instructions to test the task template system and automatic task creation feature.

## Prerequisites
- Database migrations applied
- Access to the impulsa-lov application
- User account with appropriate permissions (admin or tecnico)

## Test Scenarios

### Test 1: Verify Database Schema

#### Objective
Confirm all database objects are created correctly.

#### Steps
1. Connect to the database
2. Check if `task_templates` table exists:
   ```sql
   SELECT * FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name = 'task_templates';
   ```

3. Check if `template_trigger` enum exists:
   ```sql
   SELECT enumlabel FROM pg_enum 
   WHERE enumtypid = 'template_trigger'::regtype 
   ORDER BY enumsortorder;
   ```

4. Verify `tasks` table has `template_id` column:
   ```sql
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'tasks' 
   AND column_name = 'template_id';
   ```

#### Expected Results
- `task_templates` table exists
- `template_trigger` enum has all expected values
- `tasks.template_id` column exists as UUID type

---

### Test 2: Verify Initial Template Data

#### Objective
Confirm the "Diagnóstico inicial" template was created.

#### Steps
1. Query the task_templates table:
   ```sql
   SELECT 
     name,
     trigger,
     title_template,
     default_due_days,
     default_priority,
     is_active
   FROM task_templates
   WHERE name = 'diagnostico_inicial_empresa';
   ```

2. Query the catalogs table for the 'automatica' source:
   ```sql
   SELECT * FROM catalogs 
   WHERE category = 'task_sources' 
   AND code = 'automatica';
   ```

#### Expected Results
- Template exists with:
  - name: 'diagnostico_inicial_empresa'
  - trigger: 'empresa_created'
  - title_template: 'Diagnóstico inicial'
  - default_due_days: 7
  - default_priority: 'high'
  - is_active: true
- Catalog entry exists for 'automatica' source

---

### Test 3: Verify Trigger Function

#### Objective
Confirm the trigger function is properly attached to the empresas table.

#### Steps
1. Check if trigger exists:
   ```sql
   SELECT 
     trigger_name,
     event_manipulation,
     action_timing,
     action_statement
   FROM information_schema.triggers
   WHERE event_object_table = 'empresas'
   AND trigger_name = 'trigger_empresa_created_tasks';
   ```

2. Check if helper functions exist:
   ```sql
   SELECT 
     routine_name,
     routine_type
   FROM information_schema.routines
   WHERE routine_schema = 'public'
   AND routine_name IN ('create_tasks_from_templates', 'handle_empresa_created');
   ```

#### Expected Results
- Trigger 'trigger_empresa_created_tasks' exists on empresas table
- Both helper functions exist

---

### Test 4: Test Automatic Task Creation

#### Objective
Verify that creating a new empresa automatically creates a task.

#### Setup
1. Count existing tasks:
   ```sql
   SELECT COUNT(*) as initial_count FROM tasks WHERE source = 'automatica';
   ```

#### Steps
1. Create a new empresa (via UI or SQL):
   ```sql
   INSERT INTO empresas (
     nombre,
     sector,
     fase_madurez,
     estado,
     created_by
   ) VALUES (
     'Test Company for PR-T2',
     'tecnologia',
     'idea',
     'pendiente',
     auth.uid()
   )
   RETURNING id;
   ```

2. Verify a task was created:
   ```sql
   SELECT 
     t.titulo,
     t.source,
     t.template_id,
     t.entity_type,
     t.entity_id,
     t.prioridad,
     t.estado,
     t.fecha_vencimiento,
     tt.name as template_name
   FROM tasks t
   LEFT JOIN task_templates tt ON t.template_id = tt.id
   WHERE t.entity_id = '<empresa_id_from_step_1>'
   AND t.source = 'automatica';
   ```

#### Expected Results
- One new task created
- Task properties:
  - titulo: 'Diagnóstico inicial'
  - source: 'automatica'
  - template_id: (matches the diagnostico_inicial_empresa template)
  - entity_type: 'empresa'
  - entity_id: (matches the new empresa's id)
  - prioridad: 'high'
  - estado: 'pending'
  - fecha_vencimiento: (7 days from creation date)
  - template_name: 'diagnostico_inicial_empresa'

---

### Test 5: Test Task Editability

#### Objective
Confirm that automatically created tasks can be edited.

#### Steps
1. Get the task created in Test 4
2. Try to update the task:
   ```sql
   UPDATE tasks
   SET 
     titulo = 'Diagnóstico inicial - Actualizado',
     descripcion = 'Esta tarea fue editada después de su creación automática',
     prioridad = 'urgent'
   WHERE id = '<task_id_from_test_4>';
   ```

3. Verify the update:
   ```sql
   SELECT titulo, descripcion, prioridad, updated_at
   FROM tasks
   WHERE id = '<task_id_from_test_4>';
   ```

#### Expected Results
- Update succeeds without errors
- Task fields are updated as expected
- updated_at timestamp is updated

---

### Test 6: Test RLS Policies (Admin)

#### Objective
Verify admin permissions on task_templates.

#### Steps (as admin user)
1. Try to insert a new template:
   ```sql
   INSERT INTO task_templates (
     name,
     trigger,
     title_template,
     default_due_days,
     is_active
   ) VALUES (
     'test_template_admin',
     'empresa_created',
     'Test Template',
     5,
     false
   );
   ```

2. Try to update the template:
   ```sql
   UPDATE task_templates
   SET default_due_days = 10
   WHERE name = 'test_template_admin';
   ```

3. Try to delete the template:
   ```sql
   DELETE FROM task_templates
   WHERE name = 'test_template_admin';
   ```

#### Expected Results
- All operations succeed for admin users
- No RLS violations

---

### Test 7: Test RLS Policies (Tecnico)

#### Objective
Verify that non-admin users cannot modify templates.

#### Steps (as tecnico user)
1. Try to select templates (should work):
   ```sql
   SELECT * FROM task_templates;
   ```

2. Try to insert a template (should fail):
   ```sql
   INSERT INTO task_templates (
     name,
     trigger,
     title_template,
     is_active
   ) VALUES (
     'test_template_tecnico',
     'empresa_created',
     'Test Template',
     false
   );
   ```

3. Try to update a template (should fail):
   ```sql
   UPDATE task_templates
   SET is_active = false
   WHERE name = 'diagnostico_inicial_empresa';
   ```

#### Expected Results
- SELECT works (templates are viewable)
- INSERT fails with permission error
- UPDATE fails with permission error

---

### Test 8: Test Template Deactivation

#### Objective
Verify that deactivating a template stops automatic task creation.

#### Steps
1. Deactivate the template:
   ```sql
   UPDATE task_templates
   SET is_active = false
   WHERE name = 'diagnostico_inicial_empresa';
   ```

2. Create a new empresa:
   ```sql
   INSERT INTO empresas (
     nombre,
     sector,
     fase_madurez,
     estado,
     created_by
   ) VALUES (
     'Test Company - No Auto Task',
     'servicios',
     'validacion',
     'pendiente',
     auth.uid()
   )
   RETURNING id;
   ```

3. Check if task was created:
   ```sql
   SELECT COUNT(*) FROM tasks
   WHERE entity_id = '<empresa_id_from_step_2>'
   AND source = 'automatica';
   ```

4. Reactivate the template:
   ```sql
   UPDATE task_templates
   SET is_active = true
   WHERE name = 'diagnostico_inicial_empresa';
   ```

#### Expected Results
- After deactivation: No automatic task created
- Template can be reactivated
- Future empresa creations will create tasks again

---

### Test 9: Test Manual Task Creation (Regression)

#### Objective
Confirm that manual task creation still works correctly.

#### Steps
1. Create a task manually:
   ```sql
   INSERT INTO tasks (
     titulo,
     descripcion,
     source,
     entity_type,
     entity_id,
     created_by
   ) VALUES (
     'Tarea Manual de Prueba',
     'Esta es una tarea creada manualmente',
     'manual',
     'general',
     NULL,
     auth.uid()
   );
   ```

2. Verify the task was created:
   ```sql
   SELECT 
     titulo,
     source,
     template_id
   FROM tasks
   WHERE titulo = 'Tarea Manual de Prueba';
   ```

#### Expected Results
- Manual task creation works
- source is 'manual'
- template_id is NULL

---

### Test 10: Integration Test (Full Flow)

#### Objective
Test the complete flow from empresa creation to task visibility in UI.

#### Steps
1. Login to the application as a tecnico
2. Navigate to Empresas page
3. Create a new empresa with:
   - Name: "Empresa Prueba Automática"
   - Sector: Any
   - Phase: Any
   - Estado: Any
4. Submit the form
5. Navigate to Tareas page
6. Filter by entity_type = "empresa"
7. Look for the automatic task

#### Expected Results
- Empresa created successfully
- Redirect/confirmation shown
- Tareas page shows a new task:
  - Title: "Diagnóstico inicial"
  - Linked to the new empresa
  - Source: automatica (if visible in UI)
  - Estado: Pendiente
  - Priority: Alta
  - Due date: 7 days from today
- Task can be clicked and edited
- All changes save successfully

---

## Performance Tests

### Test P1: Verify Indexes

#### Objective
Confirm all necessary indexes are created.

#### Steps
```sql
SELECT 
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename IN ('tasks', 'task_templates')
ORDER BY tablename, indexname;
```

#### Expected Results
Indexes should include:
- `idx_task_templates_trigger`
- `idx_task_templates_is_active`
- `idx_task_templates_name`
- `idx_tasks_template_id`
- All existing task indexes

---

### Test P2: Trigger Performance

#### Objective
Measure performance impact of automatic task creation.

#### Steps
1. Time empresa creation without trigger (baseline - if possible)
2. Time empresa creation with trigger
3. Compare results

```sql
EXPLAIN ANALYZE
INSERT INTO empresas (nombre, sector, fase_madurez, estado, created_by)
VALUES ('Performance Test', 'tecnologia', 'idea', 'pendiente', auth.uid());
```

#### Expected Results
- Trigger execution should add minimal overhead (< 100ms)
- No table locks or blocking

---

## Cleanup

After testing, clean up test data:

```sql
-- Delete test tasks
DELETE FROM tasks 
WHERE titulo LIKE '%Test%' 
OR titulo LIKE '%Prueba%';

-- Delete test empresas
DELETE FROM empresas 
WHERE nombre LIKE '%Test%' 
OR nombre LIKE '%Prueba%';

-- Delete test templates (if any)
DELETE FROM task_templates 
WHERE name LIKE '%test%';
```

---

## Troubleshooting

### Issue: No task created automatically

**Possible causes:**
1. Template is not active (`is_active = false`)
2. Trigger is not properly attached
3. RLS policy preventing creation

**Debug steps:**
```sql
-- Check template status
SELECT name, is_active FROM task_templates 
WHERE trigger = 'empresa_created';

-- Check if trigger fired (check updated_at on empresa)
SELECT id, nombre, created_at FROM empresas 
ORDER BY created_at DESC LIMIT 5;

-- Check for errors in function execution
-- Look for PostgreSQL logs
```

### Issue: RLS policy errors

**Possible causes:**
1. User doesn't have required role
2. Missing user_roles entry

**Debug steps:**
```sql
-- Check user roles
SELECT * FROM user_roles WHERE user_id = auth.uid();

-- Verify RLS policies
SELECT * FROM pg_policies WHERE tablename = 'task_templates';
```

### Issue: Task created but template_id is NULL

**Possible causes:**
1. Foreign key constraint issue
2. Template was deleted

**Debug steps:**
```sql
-- Check if template exists
SELECT id, name FROM task_templates 
WHERE name = 'diagnostico_inicial_empresa';

-- Check tasks without template_id
SELECT id, titulo, source FROM tasks 
WHERE source = 'automatica' AND template_id IS NULL;
```

---

## Success Criteria

All tests should pass with the following outcomes:
- ✅ Database schema correct
- ✅ Initial data loaded
- ✅ Triggers properly attached
- ✅ Automatic task creation works
- ✅ Tasks are editable
- ✅ RLS policies enforced correctly
- ✅ Template activation/deactivation works
- ✅ Manual tasks unaffected
- ✅ UI shows tasks correctly
- ✅ Performance acceptable

## Reporting Issues

If any test fails, report with:
1. Test number and name
2. Steps to reproduce
3. Expected vs actual results
4. Database logs (if available)
5. Screenshots (for UI tests)
