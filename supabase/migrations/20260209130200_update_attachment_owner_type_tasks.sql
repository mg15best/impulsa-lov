-- PR-T1: Add 'task' to attachment_owner_type enum

-- Add task to the attachment owner types so tasks can have attachments
ALTER TYPE public.attachment_owner_type ADD VALUE IF NOT EXISTS 'task';

COMMENT ON TYPE public.attachment_owner_type IS 'Types of entities that can have attachments, including tasks';
