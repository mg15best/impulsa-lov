# Testing the Schema Cache Fix

## What Was Fixed
Fixed the "could not find the table in the schema cache" errors that occurred when creating new records for:
- Empresas (Companies)
- Contactos (Contacts)
- Asesoramientos (Consultations)

## How to Apply the Fix

### Option 1: Using Supabase CLI (Recommended)
If you have Supabase CLI installed and configured:

```bash
# Navigate to the project directory
cd /path/to/impulsa-lov

# Push the migrations to your Supabase instance
supabase db push
```

### Option 2: Using Supabase Dashboard
If you prefer to use the web interface:

1. Log in to your Supabase Dashboard at https://app.supabase.com
2. Select your project (`vxjjfnbbzyjfexzyqubp`)
3. Navigate to **SQL Editor** in the left sidebar
4. Run the migrations in order:
   - First: `20260203090236_88afe067-8429-4547-bd89-997360135f3c.sql`
   - Second: `20260203162726_role_based_access_control.sql`
   - Third: `20260203164344_harden_rls_policies.sql`

Note: If these migrations have already been applied, you may need to reset your database or manually execute just the `NOTIFY pgrst, 'reload schema';` command.

### Option 3: Manual Schema Cache Reload
If the migrations were already applied and you just need to reload the schema cache:

```sql
-- Run this in the Supabase SQL Editor
NOTIFY pgrst, 'reload schema';
```

## How to Test the Fix

### Prerequisites
1. Have a user account in your Supabase instance
2. The user should have either `admin` or `tecnico` role
3. Access to the application UI

### Test Steps

#### Test 1: Create a New Empresa (Company)
1. Log in to the application
2. Navigate to the "Empresas" page
3. Click the "Nueva Empresa" button
4. Fill in the required fields:
   - Nombre (Name): Test Company
   - CIF: 12345678A
   - Sector: Select any sector
   - Fase de madurez: Select any phase
5. Click "Guardar" or "Save"
6. **Expected Result**: The empresa should be created without any "schema cache" errors
7. **Success Indicator**: You should see a success toast message and the new empresa in the list

#### Test 2: Create a New Contacto (Contact)
1. While logged in, navigate to the "Contactos" page
2. Click the "Nuevo Contacto" button
3. Fill in the required fields:
   - Nombre (Name): Test Contact
   - Empresa: Select an empresa from the dropdown
   - Email: test@example.com
4. Click "Guardar" or "Save"
5. **Expected Result**: The contacto should be created without any "schema cache" errors
6. **Success Indicator**: You should see a success toast message and the new contacto in the list

#### Test 3: Create a New Asesoramiento (Consultation)
1. While logged in, navigate to the "Asesoramientos" page
2. Click the "Nuevo Asesoramiento" button
3. Fill in the required fields:
   - Empresa: Select an empresa from the dropdown
   - Fecha: Select a date
   - Tema: Test consultation topic
4. Click "Guardar" or "Save"
5. **Expected Result**: The asesoramiento should be created without any "schema cache" errors
6. **Success Indicator**: You should see a success toast message and the new asesoramiento in the list

## Troubleshooting

### Error Still Occurs
If you still see the schema cache error:

1. **Verify Migration Applied**: Check if the migrations were successfully applied
   ```sql
   SELECT * FROM supabase_migrations.schema_migrations 
   ORDER BY version DESC LIMIT 3;
   ```

2. **Manual Schema Reload**: Execute the schema reload command manually
   ```sql
   NOTIFY pgrst, 'reload schema';
   ```

3. **Check PostgREST Version**: Ensure your Supabase instance is using a recent version of PostgREST

4. **Restart Required**: In some cases, you may need to restart your Supabase project (rare)

### Permission Denied Errors
If you get permission denied errors:

1. Check that your user has the correct role (`admin` or `tecnico`)
   ```sql
   SELECT * FROM public.user_roles WHERE user_id = auth.uid();
   ```

2. If your user doesn't have a role, an admin can assign one:
   ```sql
   INSERT INTO public.user_roles (user_id, role)
   VALUES ('<your-user-uuid>', 'tecnico');
   ```

### Tables Not Found
If the error says tables are not found (not schema cache):

1. Verify tables exist:
   ```sql
   SELECT tablename FROM pg_tables 
   WHERE schemaname = 'public' 
   AND tablename IN ('empresas', 'contactos', 'asesoramientos');
   ```

2. If tables don't exist, you need to run the initial migration first

## Expected Behavior After Fix

✅ Create operations work without errors  
✅ No "schema cache" error messages  
✅ New records appear immediately in the list  
✅ Success toast notifications are shown  
✅ No need to refresh the page to see new records  

## Need Help?

If you continue to experience issues after following these steps:
1. Check the browser console for any JavaScript errors
2. Check the Network tab in browser DevTools for API errors
3. Verify your `.env` configuration has correct Supabase credentials
4. Ensure your Supabase instance is running and accessible

## Additional Resources

- [Supabase Migrations Documentation](https://supabase.com/docs/guides/database/migrations)
- [PostgREST Schema Cache Documentation](https://postgrest.org/en/stable/admin.html#schema-cache)
- Project Documentation: `docs/SCHEMA_CACHE_FIX.md`
- RBAC Implementation: `RBAC_IMPLEMENTATION.md`
