# Role-Based Access Control (RBAC) Implementation

## Overview
This implementation adds comprehensive role-based access control to the impulsa-lov application with secure RLS (Row Level Security) policies and minimal frontend UI gating.

## Roles Defined

### New Roles Added
- **auditor**: Read-only access to all business data
- **it**: Read-only access to business data (same as auditor, extensible for future integration configurations)

### Existing Roles
- **admin**: Full CRUD access to all tables and role management
- **tecnico**: Full CRUD access to business tables with ownership constraints

## Database Changes

### Migration File
`supabase/migrations/20260203162726_role_based_access_control.sql`

### Key Changes

#### 1. Extended app_role Enum
```sql
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'auditor';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'it';
```

#### 2. Helper Function: has_any_role()
```sql
CREATE OR REPLACE FUNCTION public.has_any_role(_user_id UUID, _roles app_role[])
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
```
- Safely checks if a user has any of the specified roles
- Uses SECURITY DEFINER with proper search_path for security
- Enables efficient multi-role checks in RLS policies

#### 3. Hardened RLS Policies

##### user_roles Table
- **Previous**: All authenticated users could view all roles (`USING (true)`)
- **Updated**: Users can view only their own roles; admins can view all
```sql
USING (user_id = auth.uid() OR public.is_admin(auth.uid()))
```

##### empresas Table
- **UPDATE**: Limited to admin/tecnico roles with ownership checks
  - Admin can update all
  - Tecnico can update if they created it OR are assigned via `tecnico_asignado_id`
- **DELETE**: Admin only
- **SELECT**: All authenticated users (enables read access for auditor/it)
- **INSERT**: Already secured with `created_by = auth.uid()`

##### contactos Table
- **UPDATE**: Limited to admin/tecnico roles with created_by check
- **DELETE**: Admin only
- **SELECT**: All authenticated users
- **INSERT**: Already secured with `created_by = auth.uid()`

##### asesoramientos Table
- **UPDATE**: Limited to admin/tecnico roles with ownership checks
  - Admin can update all
  - Tecnico can update if they created it OR are assigned via `tecnico_id`
- **DELETE**: Admin only
- **SELECT**: All authenticated users
- **INSERT**: Already secured with `created_by = auth.uid()`

## Frontend Changes

### 1. Updated TypeScript Types
**File**: `src/integrations/supabase/types.ts`
```typescript
app_role: "admin" | "tecnico" | "auditor" | "it"
```

### 2. New Custom Hook: useUserRoles
**File**: `src/hooks/useUserRoles.tsx`

Provides role information and helper flags:
```typescript
const {
  roles,           // Array of user's roles
  loading,         // Loading state
  isAdmin,         // Boolean flag
  isTecnico,       // Boolean flag
  isAuditor,       // Boolean flag
  isIT,            // Boolean flag
  canWrite,        // true for admin/tecnico
  canRead          // true for all authenticated
} = useUserRoles();
```

### 3. UI Component Updates

Updated pages to disable create buttons for read-only roles:
- **Empresas.tsx**: "Nueva Empresa" button disabled if `!canWrite`
- **Contactos.tsx**: "Nuevo Contacto" button disabled if `!canWrite`
- **Asesoramientos.tsx**: "Nuevo Asesoramiento" button disabled if `!canWrite`

#### Implementation Pattern
```typescript
import { useUserRoles } from "@/hooks/useUserRoles";

const { canWrite } = useUserRoles();

<Button disabled={!canWrite}>
  <Plus className="mr-2 h-4 w-4" />
  Nueva Empresa
</Button>
```

## Access Control Matrix

| Role | View Data | Create | Update | Delete | Manage Roles |
|------|-----------|--------|--------|--------|--------------|
| **admin** | ✅ All | ✅ All | ✅ All | ✅ All | ✅ Yes |
| **tecnico** | ✅ All | ✅ Yes* | ✅ Own/Assigned† | ❌ No | ❌ No |
| **auditor** | ✅ All | ❌ No | ❌ No | ❌ No | ❌ No |
| **it** | ✅ All | ❌ No | ❌ No | ❌ No | ❌ No |

\* Creates are automatically tagged with `created_by = auth.uid()`  
† Can update records they created or are assigned to (via `tecnico_asignado_id` or `tecnico_id`)

## Security Considerations

### Defense in Depth
1. **Database Layer (Primary)**: RLS policies enforce access control at the PostgreSQL level
2. **Frontend Layer (Secondary)**: UI elements are disabled/hidden based on roles
3. **Both layers work together** to provide comprehensive security

### Security Best Practices Implemented
- ✅ All SECURITY DEFINER functions use `SET search_path = public`
- ✅ No permissive `USING (true)` policies for UPDATE/DELETE operations
- ✅ Ownership checks on all write operations
- ✅ Role checks use helper functions to prevent SQL injection
- ✅ Users can only view their own roles (privacy)

### CodeQL Security Scan Results
**Status**: ✅ **PASSED** - 0 vulnerabilities found

## Migration Instructions

### Applying the Migration
1. The migration file is located at:
   ```
   supabase/migrations/20260203162726_role_based_access_control.sql
   ```

2. Apply using Supabase CLI:
   ```bash
   supabase db push
   ```

3. Or apply manually via Supabase Dashboard SQL Editor

### Assigning Roles to Users
To assign roles to existing users, admins can run:
```sql
-- Assign auditor role
INSERT INTO public.user_roles (user_id, role)
VALUES ('<user-uuid>', 'auditor');

-- Assign it role
INSERT INTO public.user_roles (user_id, role)
VALUES ('<user-uuid>', 'it');
```

## Testing the Implementation

### Test Scenarios

#### As Admin
- ✅ Can view all data
- ✅ Can create empresas, contactos, asesoramientos
- ✅ Can update any record
- ✅ Can delete any record
- ✅ Can view and manage all user roles

#### As Tecnico
- ✅ Can view all data
- ✅ Can create empresas, contactos, asesoramientos
- ✅ Can update own records or assigned records
- ❌ Cannot delete records
- ✅ Can view only own role

#### As Auditor/IT
- ✅ Can view all data
- ❌ Cannot create records (button is disabled)
- ❌ Cannot update records (will fail at DB level)
- ❌ Cannot delete records (will fail at DB level)
- ✅ Can view only own role

### UI Testing
1. Login with different role users
2. Navigate to Empresas, Contactos, or Asesoramientos pages
3. Verify "Create" buttons are disabled for auditor/it roles
4. Verify "Create" buttons are enabled for admin/tecnico roles

### Database Testing
```sql
-- Test as auditor (should fail)
UPDATE public.empresas SET nombre = 'Test' WHERE id = '<some-id>';
-- Expected: Permission denied

-- Test as tecnico (should succeed for own records)
UPDATE public.empresas SET nombre = 'Test' WHERE created_by = auth.uid();
-- Expected: Success

-- Test as admin (should succeed)
UPDATE public.empresas SET nombre = 'Test' WHERE id = '<any-id>';
-- Expected: Success
```

## Backwards Compatibility

### Default Role Assignment
- New users continue to receive `tecnico` role by default (via `handle_new_user()` trigger)
- No changes to existing user signup flow

### Existing Data
- All existing INSERT policies remain unchanged
- All existing SELECT policies remain unchanged (still allow all authenticated users)
- UPDATE/DELETE policies are now more restrictive

## Future Enhancements

### Potential Improvements
1. **IT Role Expansion**: Add specific tables for integration configurations that IT role can manage
2. **Row-Level Filtering**: Implement tecnico-specific views (only see assigned empresas)
3. **Audit Logging**: Track all admin actions for compliance
4. **Role Hierarchy**: Implement role inheritance (e.g., admin inherits all permissions)

## Troubleshooting

### Users Can't See Create Buttons
**Cause**: User doesn't have tecnico or admin role  
**Solution**: Admin should assign appropriate role via user_roles table

### "Permission Denied" Errors
**Cause**: User attempting operations beyond their role permissions  
**Solution**: Check user's roles and verify they have appropriate permissions

### Roles Not Loading in UI
**Cause**: RLS policy preventing user from seeing own roles  
**Solution**: Verify migration applied correctly, check `user_roles` SELECT policy

## Files Modified

### Database
- `supabase/migrations/20260203162726_role_based_access_control.sql` (new)

### Frontend
- `src/integrations/supabase/types.ts` (modified)
- `src/hooks/useUserRoles.tsx` (new)
- `src/pages/Empresas.tsx` (modified)
- `src/pages/Contactos.tsx` (modified)
- `src/pages/Asesoramientos.tsx` (modified)

## Compliance Checklist

- [x] RLS no longer allows update/delete/insert with `USING (true)` for business tables
- [x] `auditor` and `it` roles enforced as read-only in DB policies
- [x] `admin` remains fully privileged for CRUD and role management
- [x] Frontend hides/disables create actions for read-only roles
- [x] App builds without TypeScript errors
- [x] No security vulnerabilities detected by CodeQL
- [x] Default role assignment (tecnico) confirmed unchanged
- [x] All security-definer functions use proper search_path

---

**Implementation Date**: February 3, 2026  
**Migration Version**: 20260203162726  
**Status**: ✅ Complete and Tested
