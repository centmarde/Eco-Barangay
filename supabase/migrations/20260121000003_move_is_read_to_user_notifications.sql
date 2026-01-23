-- Add is_read column to user_notifications to allow per-user read status
ALTER TABLE user_notifications ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT FALSE;

-- (Optional) Data migration: If we wanted to preserve existing read status, we would do it here.
-- Since the previous schema was flawed (shared read status), we will reset to unread 
-- or we could try to copy from notifications table if we assume 1:1 mapping, 
-- but simpler is safer here.
