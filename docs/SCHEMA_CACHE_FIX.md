# Schema Cache Fix

## Problem

When creating new records for Empresas, Contactos, and Asesoramientos, users encountered the following errors:
- `Error could not find the table 'public.empresas' in the schema cache`
- `Error could not find the table 'public.contactos' in the schema cache`
- `Error could not find the table 'public.asesoramientos' in the schema cache`

## Root Cause

PostgREST (the API layer used by Supabase) maintains a schema cache to improve performance. When new tables are created through migrations, PostgREST's schema cache may not automatically refresh, causing it to be unaware of the newly created tables.

Even though the tables were correctly defined in migration `20260203090236_88afe067-8429-4547-bd89-997360135f3c.sql`, the schema cache was not being updated, resulting in the error when trying to perform INSERT operations.

## Solution

Added `NOTIFY pgrst, 'reload schema'` commands at the end of all migration files to force PostgREST to reload its schema cache:

1. **Initial Migration** (`20260203090236_88afe067-8429-4547-bd89-997360135f3c.sql`): Creates the tables
2. **RBAC Migration** (`20260203162726_role_based_access_control.sql`): Updates RLS policies
3. **Hardened RLS Migration** (`20260203164344_harden_rls_policies.sql`): Further hardens RLS policies

## Technical Details

### The NOTIFY Command
```sql
NOTIFY pgrst, 'reload schema';
```

This PostgreSQL command sends a notification to the `pgrst` channel, instructing PostgREST to reload its schema cache. This ensures that:
- Newly created tables are immediately available for queries
- Schema changes are reflected in the API
- No manual intervention is required

### Why This Works
PostgREST listens to the `pgrst` PostgreSQL notification channel. When it receives a 'reload schema' message, it:
1. Invalidates its current schema cache
2. Queries the database for the latest schema information
3. Rebuilds the cache with the current state of the database

## Verification

After applying these migrations to a Supabase instance:
1. The tables will be created
2. PostgREST will reload its schema cache
3. Insert operations on `empresas`, `contactos`, and `asesoramientos` will work without errors

## References

- [PostgREST Schema Cache Documentation](https://postgrest.org/en/stable/admin.html#schema-cache)
- [Supabase Migration Guide](https://supabase.com/docs/guides/database/migrations)

## Date
February 3, 2026

## Status
✅ Fixed and committed
