-- Optimize collections and realtime with check for existing publication membership

-- Create a table for public user profiles if it doesn't exist
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  full_name text,
  updated_at timestamp with time zone,
  
  constraint username_length check (char_length(full_name) >= 3)
);

-- Set up Row Level Security (RLS)
alter table public.profiles enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'profiles' and policyname = 'Public profiles are viewable by everyone.') then
    create policy "Public profiles are viewable by everyone." on public.profiles for select using (true);
  end if;
  
  if not exists (select 1 from pg_policies where tablename = 'profiles' and policyname = 'Users can insert their own profile.') then
    create policy "Users can insert their own profile." on public.profiles for insert with check (auth.uid() = id);
  end if;
  
  if not exists (select 1 from pg_policies where tablename = 'profiles' and policyname = 'Users can update own profile.') then
    create policy "Users can update own profile." on public.profiles for update using (auth.uid() = id);
  end if;
end
$$;

-- Trigger handling
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name')
  on conflict (id) do nothing; -- Prevent error if exists
  return new;
end;
$$ language plpgsql security definer;

-- Recreate trigger to ensure it's up to date
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Backfill existing users
-- (This might fail if run without sufficient privs on auth.users, but we'll try)
do $$
begin
  insert into public.profiles (id, email, full_name)
  select 
    id, 
    email, 
    raw_user_meta_data->>'full_name'
  from auth.users
  on conflict (id) do nothing;
exception when others then
  raise notice 'Could not backfill profiles from auth.users: %', SQLERRM;
end
$$;

-- Create view
create or replace view public.collections_with_user_info as
select
  c.*,
  pr.email as requester_email,
  pr.full_name as requester_name,
  pc.email as collector_email,
  pc.full_name as collector_name
from public.collections c
left join public.profiles pr on c.request_by::uuid = pr.id
left join public.profiles pc on c.collector_assign::uuid = pc.id;

-- Safe Add to Realtime Publication
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'collections'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE collections;
  END IF;
END
$$;