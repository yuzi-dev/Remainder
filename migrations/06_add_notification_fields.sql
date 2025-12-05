-- Add notified column to reminders to track notification status
ALTER TABLE public.reminders 
ADD COLUMN IF NOT EXISTS notified BOOLEAN DEFAULT false;

-- Add notification_sound column to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS notification_sound TEXT DEFAULT 'default';

-- Create storage bucket for notification sounds
INSERT INTO storage.buckets (id, name, public) 
VALUES ('notification-sounds', 'notification-sounds', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for notification-sounds
CREATE POLICY "Notification sounds are viewable by everyone" ON storage.objects
  FOR SELECT USING (bucket_id = 'notification-sounds');

CREATE POLICY "Users can upload their own notification sounds" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'notification-sounds' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can update their own notification sounds" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'notification-sounds' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete their own notification sounds" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'notification-sounds' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );
