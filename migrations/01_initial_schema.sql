-- Create a table for public profiles
create table public.profiles (
  id uuid not null references auth.users on delete cascade,
  email text,
  display_name text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),

  primary key (id)
);

alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone." on public.profiles
  for select using (true);

create policy "Users can insert their own profile." on public.profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on public.profiles
  for update using (auth.uid() = id);

-- Function to handle new user signup
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, display_name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to call the function on new user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Create table for categories
create table public.categories (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    name text not null,
    color text default '#000000',
    created_at timestamptz default now()
);

alter table public.categories enable row level security;

create policy "Users can view their own categories" on public.categories
    for select using (auth.uid() = user_id);

create policy "Users can insert their own categories" on public.categories
    for insert with check (auth.uid() = user_id);

create policy "Users can update their own categories" on public.categories
    for update using (auth.uid() = user_id);

create policy "Users can delete their own categories" on public.categories
    for delete using (auth.uid() = user_id);


-- Create table for reminders
create table public.reminders (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    title text not null,
    description text,
    due_date timestamptz,
    is_completed boolean default false,
    category_id uuid references public.categories(id) on delete set null,
    priority text check (priority in ('low', 'medium', 'high', 'none')) default 'none',
    repeat_rule jsonb,
    audio_url text,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

alter table public.reminders enable row level security;

create policy "Users can view their own reminders" on public.reminders
    for select using (auth.uid() = user_id);

create policy "Users can insert their own reminders" on public.reminders
    for insert with check (auth.uid() = user_id);

create policy "Users can update their own reminders" on public.reminders
    for update using (auth.uid() = user_id);

create policy "Users can delete their own reminders" on public.reminders
    for delete using (auth.uid() = user_id);

-- Storage bucket for audio
insert into storage.buckets (id, name, public) 
values ('audio-attachments', 'audio-attachments', false)
on conflict (id) do nothing;

create policy "Give users access to own folder 1ok22a_0" on storage.objects
  for select to authenticated using (bucket_id = 'audio-attachments' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Give users access to own folder 1ok22a_1" on storage.objects
  for insert to authenticated with check (bucket_id = 'audio-attachments' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Give users access to own folder 1ok22a_2" on storage.objects
  for update to authenticated using (bucket_id = 'audio-attachments' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Give users access to own folder 1ok22a_3" on storage.objects
  for delete to authenticated using (bucket_id = 'audio-attachments' and (storage.foldername(name))[1] = auth.uid()::text);
