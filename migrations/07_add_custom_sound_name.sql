-- Add custom_sound_name column to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS custom_sound_name TEXT;
