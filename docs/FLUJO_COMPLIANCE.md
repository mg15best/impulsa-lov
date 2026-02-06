# Company Compliance Flow Documentation

## Overview

This document describes the implementation of the company compliance feature (PR-F) which allows tracking consent information for companies in the Impulsa LOV system.

## Database Structure

### `company_compliance` Table

The `company_compliance` table maintains a 1:1 relationship with the `empresas` table to store compliance and consent information.

**Schema:**

```sql
CREATE TABLE public.company_compliance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL UNIQUE REFERENCES public.empresas(id) ON DELETE CASCADE,
  data_protection_consent BOOLEAN DEFAULT false,
  data_consent_date DATE,
  image_rights_consent BOOLEAN DEFAULT false,
  image_consent_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);
```

**Key Features:**

1. **1:1 Relationship**: The `company_id` field has a UNIQUE constraint to ensure each company has at most one compliance record
2. **Cascade Delete**: When a company is deleted, its compliance record is automatically deleted
3. **Audit Trail**: Includes `created_by`, `updated_by`, `created_at`, and `updated_at` fields
4. **Auto-update Trigger**: Automatically updates `updated_at` timestamp on modifications

### Indexes

- Primary key on `id`
- Index on `company_id` for faster lookups: `idx_company_compliance_company_id`

## Row Level Security (RLS)

The compliance table uses the same permission model as the `empresas` table:

### Policies

1. **View**: All authenticated users can view compliance data
   ```sql
   CREATE POLICY "Authenticated users can view company compliance"
     ON public.company_compliance FOR SELECT TO authenticated
     USING (true);
   ```

2. **Create**: Users with write permissions (admin or tecnico) who are the creator
   ```sql
   CREATE POLICY "Users with write permissions can create company compliance"
     ON public.company_compliance FOR INSERT TO authenticated
     WITH CHECK (
       auth.uid() = created_by AND
       (public.is_admin(auth.uid()) OR public.has_role(auth.uid(), 'tecnico'))
     );
   ```

3. **Update**: Admin can update any record; tecnico can only update their own
   ```sql
   CREATE POLICY "Users can update company compliance based on role"
     ON public.company_compliance FOR UPDATE TO authenticated
     USING (
       public.is_admin(auth.uid()) OR
       (public.has_role(auth.uid(), 'tecnico') AND created_by = auth.uid())
     );
   ```

4. **Delete**: Only admin can delete compliance records
   ```sql
   CREATE POLICY "Only admin can delete company compliance"
     ON public.company_compliance FOR DELETE TO authenticated
     USING (public.is_admin(auth.uid()));
   ```

## Compliance Fields

### Data Protection Consent

- **Field**: `data_protection_consent` (boolean)
- **Purpose**: Track whether the company has given consent for data protection (GDPR compliance)
- **Related Field**: `data_consent_date` (date) - When the consent was given

### Image Rights Consent

- **Field**: `image_rights_consent` (boolean)
- **Purpose**: Track whether the company has given consent for using their images
- **Related Field**: `image_consent_date` (date) - When the consent was given

## User Interface Integration

### Location

The compliance section is integrated into the company creation form in the Empresas module (`src/pages/Empresas.tsx`).

### Form Section: "Consentimientos"

The compliance fields are presented in a dedicated section titled "Consentimientos" (Consents) with a light background to distinguish it from other sections.

**Layout:**

```
┌─────────────────────────────────────────┐
│ Consentimientos                         │
├─────────────────────────────────────────┤
│ ☐ Consentimiento de Protección de Datos│
│   └─ Fecha de Consentimiento de Datos   │
│                                         │
│ ☐ Consentimiento de Derechos de Imagen │
│   └─ Fecha de Consentimiento de Imagen  │
└─────────────────────────────────────────┘
```

### UI Behavior

1. **Checkbox State**: 
   - Unchecked by default
   - User can check to indicate consent was given

2. **Date Fields**:
   - Disabled when the corresponding checkbox is unchecked
   - Enabled and required when checkbox is checked
   - Visual indicator (*) appears when required
   - Indented to show hierarchical relationship

3. **Validation**:
   - Form validation ensures that when a consent checkbox is checked, the corresponding date must be provided
   - Both checkboxes are optional (user can create a company without any consents)
   - If a checkbox is checked, its corresponding date field is required
   - Validation errors display toast messages to the user

## Data Flow

### Creating a Company with Compliance Data

1. User fills out the company form including the "Consentimientos" section
2. On form submission:
   a. Form validates that required dates are provided when consent checkboxes are checked
   b. Company data is inserted into `empresas` table
   c. If successful, compliance data is inserted into `company_compliance` table with the new company's ID
   d. If compliance insert fails, the company record is automatically deleted (rollback) to maintain data consistency
3. Success/error toast messages are displayed to the user

**Code Flow:**

```typescript
// 1. Validate compliance fields
if (data_protection_consent && !data_consent_date) {
  // Show validation error
  return;
}
if (image_rights_consent && !image_consent_date) {
  // Show validation error
  return;
}

// 2. Separate compliance fields from company data
const {
  data_protection_consent,
  data_consent_date,
  image_rights_consent,
  image_consent_date,
  ...companyData
} = formData;

// 3. Insert company
const { data: newCompany, error: companyError } = await supabase
  .from("empresas")
  .insert({ ...companyData, created_by: user.id })
  .select()
  .single();

// 4. Insert compliance record
const { error: complianceError } = await supabase
  .from("company_compliance")
  .insert({
    company_id: newCompany.id,
    data_protection_consent,
    data_consent_date: data_consent_date || null,
    image_rights_consent,
    image_consent_date: image_consent_date || null,
    created_by: user.id,
  });

// 5. Rollback if compliance creation fails
if (complianceError) {
  await supabase.from("empresas").delete().eq("id", newCompany.id);
  // Show error message
  return;
}
```

### Error Handling

- **Validation Fails**: User sees validation error message, form stays open, no data is saved
- **Company Creation Fails**: User sees error message, form stays open, no data is saved
- **Compliance Creation Fails**: Company is automatically deleted (rollback), user sees error message, form stays open
- This approach ensures company data is not lost due to compliance record failures

## TypeScript Types

The compliance table is defined in the Supabase types file (`src/integrations/supabase/types.ts`):

```typescript
company_compliance: {
  Row: {
    id: string
    company_id: string
    data_protection_consent: boolean | null
    data_consent_date: string | null
    image_rights_consent: boolean | null
    image_consent_date: string | null
    created_at: string
    updated_at: string
    created_by: string | null
    updated_by: string | null
  }
  Insert: {
    id?: string
    company_id: string
    data_protection_consent?: boolean | null
    data_consent_date?: string | null
    image_rights_consent?: boolean | null
    image_consent_date?: string | null
    created_at?: string
    updated_at?: string
    created_by?: string | null
    updated_by?: string | null
  }
  Update: {
    // ... (same optional fields as Insert)
  }
  Relationships: [
    {
      foreignKeyName: "company_compliance_company_id_fkey"
      columns: ["company_id"]
      isOneToOne: true
      referencedRelation: "empresas"
      referencedColumns: ["id"]
    }
  ]
}
```

## Future Enhancements

### Edit Functionality

Currently, the Empresas module only supports creating companies. When edit functionality is added, it should:

1. Load existing compliance data when opening a company for editing
2. Update compliance record when saving company changes
3. Create a compliance record if one doesn't exist for an existing company
4. Track `updated_by` field for audit purposes

### Additional Compliance Fields

Consider adding:
- `marketing_consent` - Consent for marketing communications
- `third_party_sharing_consent` - Consent for sharing data with third parties
- `consent_withdrawal_date` - Date when consent was withdrawn
- `consent_notes` - Free text field for additional consent details

### Reporting

Potential compliance reports:
- Companies with missing consents
- Consents expiring soon (if expiration dates are added)
- Consent history and audit trail

## Migration File

**Location**: `supabase/migrations/20260206135826_create_company_compliance_table.sql`

**Applied**: This migration should be applied to the database before deploying the frontend changes.

## Testing Checklist

- [ ] Create a new company with all compliance fields checked and dates filled
- [ ] Create a new company with no compliance fields checked
- [ ] Create a new company with only data protection consent
- [ ] Create a new company with only image rights consent
- [ ] Verify RLS policies work correctly for different user roles
- [ ] Test that compliance record is deleted when company is deleted
- [ ] Verify date fields are properly disabled/enabled based on checkbox state

## Related Documentation

- [Empresas Field Mapping](./EMPRESAS_FIELD_MAPPING.md)
- [RBAC Implementation](../RBAC_IMPLEMENTATION.md)
- [Database Schema](./MAPEO_ENTIDADES.md)
