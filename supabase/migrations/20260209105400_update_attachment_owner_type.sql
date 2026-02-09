-- PR-J: Update attachment_owner_type enum to support materials and dissemination impacts

-- Add new values to the attachment_owner_type enum
ALTER TYPE public.attachment_owner_type ADD VALUE IF NOT EXISTS 'material';
ALTER TYPE public.attachment_owner_type ADD VALUE IF NOT EXISTS 'dissemination_impact';

-- Add comment to document the new attachment owner types
COMMENT ON TYPE public.attachment_owner_type IS 'Types of entities that can own attachments. Updated to include material and dissemination_impact for PR-J.';
