-- Storage Setup Migration

-- 1. Create the storage bucket 'audio-attachments' and make it public
insert into storage.buckets (id, name, public)
values ('audio-attachments', 'audio-attachments', true)
on conflict (id) do update set public = true;

-- 2. Enable RLS on objects (should be enabled by default, but good to ensure)
-- alter table storage.objects enable row level security;

-- 3. Policies

-- Policy: Allow public read access to files in the bucket
-- (Since we are storing public URLs, we need this or the bucket being public handles it? 
-- Even if bucket is public, RLS on objects can restrict access. 
-- For public buckets, usually we allow select for everyone or authenticated?)
-- If we want strictly private, we'd use signed URLs. 
-- For now, we allow anyone with the link to view (standard for public buckets).
create policy "Public Access to Audio"
  on storage.objects for select
  using ( bucket_id = 'audio-attachments' );

-- Policy: Allow authenticated users to upload files to their own folder
-- Folder structure: user_id/filename
create policy "Users can upload their own audio"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'audio-attachments' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy: Allow authenticated users to update their own files
create policy "Users can update their own audio"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'audio-attachments' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy: Allow authenticated users to delete their own files
create policy "Users can delete their own audio"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'audio-attachments' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );
