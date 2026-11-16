-- =====================================================================
-- Arzi Services — database schema (run ONCE in Supabase → SQL Editor)
--
-- BEFORE running:  Authentication → Users → "Add user" → create
--                  email: admin@gmail.com   password: (choose your own)   (tick "Auto Confirm User")
--                  (this script then marks that user as admin — see the last step)
-- You can re-run this whole script safely; it skips what already exists.
-- =====================================================================

-- ---------- Tables ----------------------------------------------------

create table if not exists public.cities (
  id         uuid primary key default gen_random_uuid(),
  name       text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.masjids (
  id         uuid primary key default gen_random_uuid(),
  city       text not null references public.cities (name) on update cascade on delete cascade,
  name       text not null,
  created_at timestamptz not null default now(),
  unique (city, name)
);

-- The 4 services. Only the editable parts live here (price, unit, limit, description);
-- the namaz lists / duties are defined in the app (src/constants/services.js).
create table if not exists public.services (
  id          text primary key,
  mode        text not null check (mode in ('select', 'package')),
  per_person  boolean not null default false,
  price       integer check (price is null or price >= 0),   -- null = "Rate on request"
  unit        text not null,
  limit_text  text not null,
  description text not null,
  updated_at  timestamptz not null default now()
);

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade
);

create table if not exists public.bookings (
  id           uuid primary key default gen_random_uuid(),
  booking_no   bigint generated always as identity (start with 1001),
  service_id   text not null references public.services (id),
  selected     text[] not null default '{}',
  people       integer check (people between 1 and 10),
  unit_price   integer,
  total        integer,
  name         text not null,
  mobile       text not null,
  city         text not null,
  masjid       text not null,
  booking_date date not null,
  payment      text not null default 'cash' check (payment = 'cash'),
  notes        text not null default '',
  status       text not null default 'Pending' check (status in ('Pending', 'Accepted', 'Rejected')),
  created_at   timestamptz not null default now()
);

create index if not exists bookings_created_at_idx on public.bookings (created_at desc);
create index if not exists masjids_city_idx on public.masjids (city);

-- "Jaipur" and "jaipur" are the same city: block case-only duplicates
-- (if this fails, a duplicate city already exists — remove/merge it first)
create unique index if not exists cities_name_lower_key on public.cities (lower(name));

-- ---------- Admin check -------------------------------------------------

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admin_users where user_id = auth.uid());
$$;

-- ---------- Row Level Security -----------------------------------------

alter table public.cities      enable row level security;
alter table public.masjids     enable row level security;
alter table public.services    enable row level security;
alter table public.bookings    enable row level security;
alter table public.admin_users enable row level security;   -- no policies: only is_admin() reads it

-- Everyone can read cities / masjids / services. Only the admin can change them.
drop policy if exists "cities: read"  on public.cities;
drop policy if exists "cities: admin" on public.cities;
create policy "cities: read"  on public.cities for select using (true);
create policy "cities: admin" on public.cities for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "masjids: read"  on public.masjids;
drop policy if exists "masjids: admin" on public.masjids;
create policy "masjids: read"  on public.masjids for select using (true);
create policy "masjids: admin" on public.masjids for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "services: read"  on public.services;
drop policy if exists "services: admin" on public.services;
create policy "services: read"  on public.services for select using (true);
create policy "services: admin" on public.services for all using (public.is_admin()) with check (public.is_admin());

-- Bookings contain names and phone numbers, so only the admin can read / update them directly.
-- Users create and read THEIR OWN bookings through the two functions below.
drop policy if exists "bookings: admin read"   on public.bookings;
drop policy if exists "bookings: admin update" on public.bookings;
create policy "bookings: admin read"   on public.bookings for select using (public.is_admin());
create policy "bookings: admin update" on public.bookings for update using (public.is_admin()) with check (public.is_admin());

-- ---------- Booking functions (used by the app) -------------------------

-- Creates a booking. The price is calculated HERE from the services table,
-- so a user can never send a cheaper total.
create or replace function public.create_booking(
  p_service_id   text,
  p_selected     text[],
  p_people       integer,
  p_name         text,
  p_mobile       text,
  p_city         text,
  p_masjid       text,
  p_booking_date date,
  p_notes        text default ''
)
returns public.bookings
language plpgsql
security definer
set search_path = public
as $$
declare
  v_service public.services;
  v_qty     integer;
  v_total   integer;
  v_row     public.bookings;
begin
  select * into v_service from public.services where id = p_service_id;
  if not found then raise exception 'Unknown service'; end if;

  if length(trim(coalesce(p_name, ''))) = 0 then raise exception 'Name is required'; end if;
  if regexp_replace(coalesce(p_mobile, ''), '[\s-]', '', 'g') !~ '^\+?\d{10,13}$' then
    raise exception 'Enter a valid mobile number';
  end if;
  if not exists (select 1 from public.cities where name = p_city) then raise exception 'Unknown city'; end if;
  if length(trim(coalesce(p_masjid, ''))) = 0 then raise exception 'Masjid is required'; end if;
  if p_booking_date is null or p_booking_date < current_date - 1 then
    raise exception 'Booking date cannot be in the past';
  end if;

  if v_service.mode = 'select' then
    v_qty := coalesce(cardinality(p_selected), 0);
    if v_qty < 1 then raise exception 'Select at least one option'; end if;
  elsif v_service.per_person then
    v_qty := coalesce(p_people, 1);
    if v_qty < 1 or v_qty > 10 then raise exception 'Persons must be between 1 and 10'; end if;
  else
    v_qty := 1;
  end if;

  v_total := case when v_service.price is null then null else v_service.price * v_qty end;

  insert into public.bookings (
    service_id, selected, people, unit_price, total,
    name, mobile, city, masjid, booking_date, notes
  ) values (
    p_service_id,
    case when v_service.mode = 'select' then p_selected else '{}' end,
    case when v_service.per_person then v_qty else null end,
    v_service.price, v_total,
    trim(p_name), trim(p_mobile), p_city, trim(p_masjid), p_booking_date, trim(coalesce(p_notes, ''))
  )
  returning * into v_row;

  return v_row;
end;
$$;

-- "My Bookings": the app remembers the ids of the bookings made on that phone
-- and asks for exactly those (ids are random UUIDs, so they cannot be guessed).
create or replace function public.get_my_bookings(p_ids uuid[])
returns setof public.bookings
language sql
stable
security definer
set search_path = public
as $$
  select * from public.bookings where id = any (p_ids) order by created_at desc;
$$;

-- "Cancel booking": the user deletes their own booking (by its random id). Only while it is
-- still Pending — once the admin accepted or rejected it, it stays on record.
-- Returns true if a booking was deleted.
create or replace function public.cancel_booking(p_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_deleted integer;
begin
  delete from public.bookings where id = p_id and status = 'Pending';
  get diagnostics v_deleted = row_count;
  return v_deleted > 0;
end;
$$;

grant execute on function public.cancel_booking(uuid)                                           to anon, authenticated;
grant execute on function public.is_admin()                                                  to anon, authenticated;
grant execute on function public.get_my_bookings(uuid[])                                        to anon, authenticated;
grant execute on function public.create_booking(text, text[], integer, text, text, text, text, date, text)
                                                                                                to anon, authenticated;

-- ---------- Starting data -----------------------------------------------

insert into public.services (id, mode, per_person, price, unit, limit_text, description) values
  ('imam',     'select',  false, 1000, 'per namaz',        'For 1 Day / 1 Namaz only', 'Imam for Nikah, Janaza Namaz, Dua, Taraweeh, Juma and daily Namaz.'),
  ('moazzin',  'select',  false,  700, 'per namaz',        'For 1 Day / 1 Namaz only', 'Azan and Namaz for Fajr, Zuhar, Asar, Maghrib and Isha.'),
  ('khadim',   'package', true,   500, 'per person / day', 'For 1 Day only',           'Complete Masjid duty for the day.'),
  ('cleaning', 'package', true,  null, 'per person / day', 'For 1 Day only',           'Latrine, Bathroom and Gusalkhana safai.')
on conflict (id) do nothing;

insert into public.cities (name) values
  ('Agra'), ('Ahmedabad'), ('Aligarh'), ('Bengaluru'), ('Bhopal'), ('Bijnor'), ('Chandigarh'),
  ('Chennai'), ('Delhi'), ('Faridabad'), ('Ghaziabad'), ('Gurugram'), ('Hyderabad'), ('Jaipur'),
  ('Kolkata'), ('Lucknow'), ('Meerut'), ('Moradabad'), ('Mumbai'), ('Muzaffarnagar'), ('Noorpur'),
  ('Palwal'), ('Pirthala'), ('Saharanpur')
on conflict (name) do nothing;

insert into public.masjids (city, name) values
  ('Delhi', 'Jama Masjid Delhi'),
  ('Delhi', 'Fatehpuri Masjid'),
  ('Delhi', 'Hazrat Nizamuddin Dargah Masjid'),
  ('Delhi', 'Moti Masjid, Lal Qila'),
  ('Delhi', 'Masjid Mubarak Begum, Hauz Qazi'),
  ('Delhi', 'Shahi Masjid, Mehrauli'),
  ('Delhi', 'Masjid Bawali, Nizamuddin'),
  ('Delhi', 'Masjid e Jahan Numa'),
  ('Delhi', 'Jama Masjid, Okhla'),
  ('Delhi', 'Masjid Abul Fazal Enclave, Jamia Nagar')
on conflict (city, name) do nothing;

-- ---------- Make admin@gmail.com the admin ------------------------------
-- Works only if you already created that user (see top). If it inserts 0 rows,
-- create the user and run just this statement again.
insert into public.admin_users (user_id)
select id from auth.users where email = 'admin@gmail.com'
on conflict do nothing;

-- =====================================================================
-- Accounts: Imam and Masjid Representative (sign up / login with Supabase Auth)
--
-- * Everyone logs in with Supabase Auth (email + password).
-- * The ADMIN is listed in `admin_users` (see above) and is never created by sign up.
-- * An Imam / Masjid signs up from the app. The app sends the details as sign-up
--   metadata and the trigger below creates their row in `profiles`.
-- * The role comes from the database (`is_admin()` / `profiles.role`), never from the app.
--
-- TIP: Supabase → Authentication → Providers → Email → turn OFF "Confirm email" if
-- new accounts should be able to log in straight after signing up.
-- =====================================================================

create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  role        text not null check (role in ('imam', 'masjid')),
  full_name   text not null check (length(trim(full_name)) > 0),
  mobile      text not null check (mobile ~ '^[6-9][0-9]{9}$'),   -- 10 digits, shown as +91
  email       text not null,
  city        text not null references public.cities (name) on update cascade,
  imam_type   text,                                                -- Imam only
  masjid_name text,                                                -- Masjid only
  photo_url   text,
  created_at  timestamptz not null default now(),
  check (
    (role = 'imam'   and imam_type   is not null and masjid_name is null) or
    (role = 'masjid' and masjid_name is not null and imam_type   is null)
  )
);

create index if not exists profiles_role_idx on public.profiles (role);

alter table public.profiles enable row level security;

-- A person reads and edits only their own profile (the admin may read all).
-- There is NO insert policy: profiles are created only by the sign-up trigger below.
drop policy if exists "profiles: read own or admin" on public.profiles;
drop policy if exists "profiles: update own"        on public.profiles;
create policy "profiles: read own or admin" on public.profiles
  for select using (id = auth.uid() or public.is_admin());
create policy "profiles: update own" on public.profiles
  for update using (id = auth.uid())
  with check (id = auth.uid() and role = (select p.role from public.profiles p where p.id = auth.uid()));

-- Creates the profile when a new user signs up. Only 'imam' and 'masjid' are accepted,
-- so nobody can sign up as an admin. A user without a role (e.g. the admin you create
-- by hand in the dashboard) simply gets no profile.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  v_role text  := v_meta ->> 'role';
begin
  if v_role is null then
    return new;
  end if;
  if v_role not in ('imam', 'masjid') then
    raise exception 'Invalid role';
  end if;

  insert into public.profiles (id, role, full_name, mobile, email, city, imam_type, masjid_name)
  values (
    new.id,
    v_role,
    trim(coalesce(v_meta ->> 'full_name', '')),
    trim(coalesce(v_meta ->> 'mobile', '')),
    new.email,
    trim(coalesce(v_meta ->> 'city', '')),
    case when v_role = 'imam'   then nullif(trim(coalesce(v_meta ->> 'imam_type', '')), '')   end,
    case when v_role = 'masjid' then nullif(trim(coalesce(v_meta ->> 'masjid_name', '')), '') end
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- Profile photos (Storage) -----------------------------------
-- Public bucket (photos are shown to everyone), but a user can only add / change /
-- delete files inside their OWN folder: avatars/<user id>/...

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

drop policy if exists "avatars: public read" on storage.objects;
drop policy if exists "avatars: own insert"  on storage.objects;
drop policy if exists "avatars: own update"  on storage.objects;
drop policy if exists "avatars: own delete"  on storage.objects;

create policy "avatars: public read" on storage.objects
  for select using (bucket_id = 'avatars');
create policy "avatars: own insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "avatars: own update" on storage.objects
  for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "avatars: own delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

-- =====================================================================
-- Booking requests for Imams and Masjid Representatives
--
-- * A MASJID sees every booking made for ITS Masjid (same city + Masjid name) and can
--   accept / reject the ones still Pending.
-- * An IMAM sees the open (Pending) Imam / Moazzin requests of ITS city, plus the ones they
--   accepted or declined. Accepting assigns the booking to that Imam (first Imam wins);
--   rejecting only hides it for that Imam (other Imams can still accept it).
-- * Nobody reads the `bookings` table directly (only the admin can): everything goes through
--   the two functions below, which check the caller's role and what they are allowed to see.
--   An Imam only gets the customer's mobile number AFTER accepting the booking.
-- =====================================================================

alter table public.bookings
  add column if not exists accepted_by uuid references auth.users (id) on delete set null;

create table if not exists public.booking_declines (
  booking_id uuid not null references public.bookings (id) on delete cascade,
  user_id    uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (booking_id, user_id)
);
alter table public.booking_declines enable row level security;   -- no policies: only the functions below use it

-- The requests the logged-in Imam / Masjid is allowed to see.
create or replace function public.get_my_requests()
returns table (
  id           uuid,
  booking_no   bigint,
  service_id   text,
  selected     text[],
  people       integer,
  unit_price   integer,
  total        integer,
  name         text,
  mobile       text,
  city         text,
  masjid       text,
  booking_date date,
  payment      text,
  notes        text,
  status       text,
  created_at   timestamptz,
  accepted_by  uuid
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_profile public.profiles;
begin
  select * into v_profile from public.profiles where profiles.id = auth.uid();
  if not found then
    return;
  end if;

  if v_profile.role = 'masjid' then
    return query
      select b.id, b.booking_no, b.service_id, b.selected, b.people, b.unit_price, b.total,
             b.name, b.mobile, b.city, b.masjid, b.booking_date, b.payment, b.notes,
             b.status, b.created_at, b.accepted_by
      from public.bookings b
      where b.city = v_profile.city
        and lower(trim(b.masjid)) = lower(trim(v_profile.masjid_name))
      order by b.created_at desc;

  elsif v_profile.role = 'imam' then
    return query
      select b.id, b.booking_no, b.service_id, b.selected, b.people, b.unit_price, b.total,
             b.name,
             case when b.accepted_by = auth.uid() then b.mobile else '' end,   -- mobile only after accepting
             b.city, b.masjid, b.booking_date, b.payment, b.notes,
             case when exists (select 1 from public.booking_declines d
                               where d.booking_id = b.id and d.user_id = auth.uid())
                  then 'Rejected' else b.status end,                            -- "Rejected" = declined by me
             b.created_at, b.accepted_by
      from public.bookings b
      where b.service_id in ('imam', 'moazzin')
        and b.city = v_profile.city
        and (
          b.status = 'Pending'
          or b.accepted_by = auth.uid()
          or exists (select 1 from public.booking_declines d
                     where d.booking_id = b.id and d.user_id = auth.uid())
        )
      order by b.created_at desc;
  end if;
end;
$$;

-- Accept or reject a request. p_action: 'accept' | 'reject'. Only Pending requests, only ones
-- this person is allowed to see.
create or replace function public.respond_to_request(p_id uuid, p_action text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile public.profiles;
  v_booking public.bookings;
begin
  if p_action not in ('accept', 'reject') then
    raise exception 'Invalid action';
  end if;

  select * into v_profile from public.profiles where profiles.id = auth.uid();
  if not found then
    raise exception 'Not allowed';
  end if;

  select * into v_booking from public.bookings where bookings.id = p_id for update;
  if not found then
    raise exception 'Booking not found';
  end if;
  if v_booking.status <> 'Pending' then
    raise exception 'This request has already been answered';
  end if;

  if v_profile.role = 'masjid' then
    if v_booking.city <> v_profile.city
       or lower(trim(v_booking.masjid)) <> lower(trim(v_profile.masjid_name)) then
      raise exception 'Not allowed';
    end if;
    update public.bookings
       set status      = case when p_action = 'accept' then 'Accepted' else 'Rejected' end,
           accepted_by = case when p_action = 'accept' then auth.uid() else null end
     where bookings.id = p_id;

  elsif v_profile.role = 'imam' then
    if v_booking.service_id not in ('imam', 'moazzin') or v_booking.city <> v_profile.city then
      raise exception 'Not allowed';
    end if;
    if p_action = 'accept' then
      update public.bookings set status = 'Accepted', accepted_by = auth.uid() where bookings.id = p_id;
    else
      insert into public.booking_declines (booking_id, user_id) values (p_id, auth.uid())
      on conflict do nothing;
    end if;

  else
    raise exception 'Not allowed';
  end if;
end;
$$;

-- Only logged-in people may call these (the checks above also need a profile).
revoke all on function public.get_my_requests()                 from public, anon;
revoke all on function public.respond_to_request(uuid, text)    from public, anon;
grant execute on function public.get_my_requests()              to authenticated;
grant execute on function public.respond_to_request(uuid, text) to authenticated;


-- =====================================================================
-- Imam languages and fees (used by the Home filters)
-- =====================================================================

alter table public.profiles
  add column if not exists languages text[] not null default '{}',
  add column if not exists fee       integer check (fee is null or fee between 0 and 999999);   -- Imam only, per day in rupees

alter table public.profiles drop constraint if exists profiles_languages_check;
alter table public.profiles
  add constraint profiles_languages_check check (languages <@ array['Urdu', 'Hindi']::text[]);

-- Same sign-up trigger as above, now also saving languages and fee for an Imam.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  v_role text  := v_meta ->> 'role';
begin
  if v_role is null then
    return new;
  end if;
  if v_role not in ('imam', 'masjid') then
    raise exception 'Invalid role';
  end if;

  insert into public.profiles (id, role, full_name, mobile, email, city, imam_type, masjid_name, languages, fee)
  values (
    new.id,
    v_role,
    trim(coalesce(v_meta ->> 'full_name', '')),
    trim(coalesce(v_meta ->> 'mobile', '')),
    new.email,
    trim(coalesce(v_meta ->> 'city', '')),
    case when v_role = 'imam'   then nullif(trim(coalesce(v_meta ->> 'imam_type', '')), '')   end,
    case when v_role = 'masjid' then nullif(trim(coalesce(v_meta ->> 'masjid_name', '')), '') end,
    case when v_role = 'imam' and jsonb_typeof(v_meta -> 'languages') = 'array'
         then array(select jsonb_array_elements_text(v_meta -> 'languages'))
         else '{}'::text[] end,
    case when v_role = 'imam' and (v_meta ->> 'fee') ~ '^[0-9]{1,6}$'
         then (v_meta ->> 'fee')::integer end
  );
  return new;
end;
$$;

-- =====================================================================
-- Admin approval for Imams and Masjid Representatives
--
-- * A new sign-up starts as 'pending'. It can log in, but sees only a "waiting for approval"
--   screen, is NOT listed on Home and cannot see or answer booking requests.
-- * The admin approves or rejects it from the admin panel (set_approval below).
-- * Accounts that already existed when this was added are marked 'approved'.
-- =====================================================================

alter table public.profiles
  add column if not exists approval_status text not null default 'approved'
  check (approval_status in ('pending', 'approved', 'rejected'));

-- From now on every NEW account starts as pending (existing rows stay approved).
alter table public.profiles alter column approval_status set default 'pending';

create index if not exists profiles_approval_idx on public.profiles (approval_status);

-- A person may edit their own profile but never their role or their approval status.
drop policy if exists "profiles: update own" on public.profiles;
create policy "profiles: update own" on public.profiles
  for update using (id = auth.uid())
  with check (
    id = auth.uid()
    and role            = (select p.role            from public.profiles p where p.id = auth.uid())
    and approval_status = (select p.approval_status from public.profiles p where p.id = auth.uid())
  );

-- Admin only: approve / reject (or put back to pending) one account.
create or replace function public.set_approval(p_id uuid, p_status text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Not allowed';
  end if;
  if p_status not in ('pending', 'approved', 'rejected') then
    raise exception 'Invalid status';
  end if;

  update public.profiles set approval_status = p_status where profiles.id = p_id;
  if not found then
    raise exception 'Account not found';
  end if;
end;
$$;

revoke all on function public.set_approval(uuid, text) from public, anon;
grant execute on function public.set_approval(uuid, text) to authenticated;

-- Booking requests: the same two functions as above, now only for approved accounts.
create or replace function public.get_my_requests()
returns table (
  id           uuid,
  booking_no   bigint,
  service_id   text,
  selected     text[],
  people       integer,
  unit_price   integer,
  total        integer,
  name         text,
  mobile       text,
  city         text,
  masjid       text,
  booking_date date,
  payment      text,
  notes        text,
  status       text,
  created_at   timestamptz,
  accepted_by  uuid
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_profile public.profiles;
begin
  select * into v_profile from public.profiles where profiles.id = auth.uid();
  if not found or v_profile.approval_status <> 'approved' then
    return;
  end if;

  if v_profile.role = 'masjid' then
    return query
      select b.id, b.booking_no, b.service_id, b.selected, b.people, b.unit_price, b.total,
             b.name, b.mobile, b.city, b.masjid, b.booking_date, b.payment, b.notes,
             b.status, b.created_at, b.accepted_by
      from public.bookings b
      where b.city = v_profile.city
        and lower(trim(b.masjid)) = lower(trim(v_profile.masjid_name))
      order by b.created_at desc;

  elsif v_profile.role = 'imam' then
    return query
      select b.id, b.booking_no, b.service_id, b.selected, b.people, b.unit_price, b.total,
             b.name,
             case when b.accepted_by = auth.uid() then b.mobile else '' end,   -- mobile only after accepting
             b.city, b.masjid, b.booking_date, b.payment, b.notes,
             case when exists (select 1 from public.booking_declines d
                               where d.booking_id = b.id and d.user_id = auth.uid())
                  then 'Rejected' else b.status end,                            -- "Rejected" = declined by me
             b.created_at, b.accepted_by
      from public.bookings b
      where b.service_id in ('imam', 'moazzin')
        and b.city = v_profile.city
        and (
          b.status = 'Pending'
          or b.accepted_by = auth.uid()
          or exists (select 1 from public.booking_declines d
                     where d.booking_id = b.id and d.user_id = auth.uid())
        )
      order by b.created_at desc;
  end if;
end;
$$;

create or replace function public.respond_to_request(p_id uuid, p_action text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile public.profiles;
  v_booking public.bookings;
begin
  if p_action not in ('accept', 'reject') then
    raise exception 'Invalid action';
  end if;

  select * into v_profile from public.profiles where profiles.id = auth.uid();
  if not found or v_profile.approval_status <> 'approved' then
    raise exception 'Not allowed';
  end if;

  select * into v_booking from public.bookings where bookings.id = p_id for update;
  if not found then
    raise exception 'Booking not found';
  end if;
  if v_booking.status <> 'Pending' then
    raise exception 'This request has already been answered';
  end if;

  if v_profile.role = 'masjid' then
    if v_booking.city <> v_profile.city
       or lower(trim(v_booking.masjid)) <> lower(trim(v_profile.masjid_name)) then
      raise exception 'Not allowed';
    end if;
    update public.bookings
       set status      = case when p_action = 'accept' then 'Accepted' else 'Rejected' end,
           accepted_by = case when p_action = 'accept' then auth.uid() else null end
     where bookings.id = p_id;

  elsif v_profile.role = 'imam' then
    if v_booking.service_id not in ('imam', 'moazzin') or v_booking.city <> v_profile.city then
      raise exception 'Not allowed';
    end if;
    if p_action = 'accept' then
      update public.bookings set status = 'Accepted', accepted_by = auth.uid() where bookings.id = p_id;
    else
      insert into public.booking_declines (booking_id, user_id) values (p_id, auth.uid())
      on conflict do nothing;
    end if;

  else
    raise exception 'Not allowed';
  end if;
end;
$$;

-- =====================================================================
-- Registration fields
--
-- IMAM:   full name, mobile, city + area, experience (Janaza Namaz, Juma, Nikah ...), photo, fees,
--         languages, email, password.
-- MASJID: Masjid name, city, address / location, contact person, contact mobile, photo,
--         opening and closing time, email, password.
-- (imam_type is no longer asked; fee is: "Fees per day" is an Imam field and a Home filter.)
-- =====================================================================

alter table public.profiles
  add column if not exists address      text,                                  -- Masjid address / Imam area
  add column if not exists experience   text[] not null default '{}',          -- Imam: the namaz / occasions
  add column if not exists opening_time text check (opening_time is null or opening_time ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'),
  add column if not exists closing_time text check (closing_time is null or closing_time ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$');

-- The old rule said an Imam must have imam_type. Remove it (whatever its name is) and
-- replace it with the new rule: a Masjid needs its name. (Its address and timing are checked
-- when it signs up, in the trigger below, so Masjid accounts made earlier are not affected.)
do $$
declare
  c record;
begin
  for c in
    select conname from pg_constraint
    where conrelid = 'public.profiles'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) like '%imam_type%'
  loop
    execute format('alter table public.profiles drop constraint %I', c.conname);
  end loop;
end;
$$;

alter table public.profiles drop constraint if exists profiles_role_fields_check;
alter table public.profiles
  add constraint profiles_role_fields_check check (
    (role = 'imam' and masjid_name is null) or
    (role = 'masjid' and masjid_name is not null)
  );

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  v_role text  := v_meta ->> 'role';
begin
  if v_role is null then
    return new;
  end if;
  if v_role not in ('imam', 'masjid') then
    raise exception 'Invalid role';
  end if;
  if v_role = 'masjid' and (
       nullif(trim(coalesce(v_meta ->> 'address', '')), '') is null
    or not coalesce((v_meta ->> 'opening_time') ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$', false)
    or not coalesce((v_meta ->> 'closing_time') ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$', false)
  ) then
    raise exception 'Masjid address and timing are required';
  end if;

  insert into public.profiles (
    id, role, full_name, mobile, email, city, masjid_name, address,
    languages, experience, fee, opening_time, closing_time
  )
  values (
    new.id,
    v_role,
    trim(coalesce(v_meta ->> 'full_name', '')),
    trim(coalesce(v_meta ->> 'mobile', '')),
    new.email,
    trim(coalesce(v_meta ->> 'city', '')),
    case when v_role = 'masjid' then nullif(trim(coalesce(v_meta ->> 'masjid_name', '')), '') end,
    -- Imam: the area (optional). Masjid: the address.
    nullif(trim(coalesce(case when v_role = 'imam' then v_meta ->> 'area' else v_meta ->> 'address' end, '')), ''),
    case when v_role = 'imam' and jsonb_typeof(v_meta -> 'languages') = 'array'
         then array(select jsonb_array_elements_text(v_meta -> 'languages'))
         else '{}'::text[] end,
    case when v_role = 'imam' and jsonb_typeof(v_meta -> 'experience') = 'array'
         then array(select jsonb_array_elements_text(v_meta -> 'experience'))
         else '{}'::text[] end,
    -- Imam: fees per day in rupees
    case when v_role = 'imam' and (v_meta ->> 'fee') ~ '^[0-9]{1,6}$'
         then (v_meta ->> 'fee')::integer end,
    case when v_role = 'masjid' and (v_meta ->> 'opening_time') ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'
         then v_meta ->> 'opening_time' end,
    case when v_role = 'masjid' and (v_meta ->> 'closing_time') ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'
         then v_meta ->> 'closing_time' end
  );
  return new;
end;
$$;

-- =====================================================================
-- Public directory: the Imams and Masjids shown on the Home screen
--
-- `profiles` holds private details (mobile, email), so it is NOT readable by everyone.
-- This function returns only the safe, public columns of APPROVED accounts, even to people
-- who are not logged in. (A function is used instead of a view, because a view skips the
-- row level security and shows up as "UNRESTRICTED" in the Supabase table editor.)
-- =====================================================================

-- The old view is no longer used.
drop view if exists public.public_profiles;

-- The first version had no fee filter: remove it so only the new one exists.
drop function if exists public.get_directory(text, text, text, text);

create or replace function public.get_directory(
  p_role       text,
  p_city       text    default '',
  p_experience text    default '',
  p_language   text    default '',
  p_min_fee    integer default null,
  p_max_fee    integer default null
)
returns table (
  id           uuid,
  role         text,
  full_name    text,
  city         text,
  masjid_name  text,
  address      text,
  photo_url    text,
  languages    text[],
  experience   text[],
  fee          integer,
  opening_time text,
  closing_time text,
  created_at   timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select p.id, p.role, p.full_name, p.city, p.masjid_name, p.address, p.photo_url,
         p.languages, p.experience, p.fee, p.opening_time, p.closing_time, p.created_at
  from public.profiles p
  where p.approval_status = 'approved'
    and p.role = p_role
    and (coalesce(p_city, '') = '' or p.city = p_city)
    -- experience / language / fee filters only apply to Imams
    and (coalesce(p_experience, '') = '' or p.role <> 'imam' or p_experience = any (p.experience))
    and (coalesce(p_language, '')   = '' or p.role <> 'imam' or p_language   = any (p.languages))
    and (p_min_fee is null or p.role <> 'imam' or p.fee >= p_min_fee)
    and (p_max_fee is null or p.role <> 'imam' or p.fee <= p_max_fee)
  order by p.created_at desc;
$$;

revoke all on function public.get_directory(text, text, text, text, integer, integer) from public;
grant execute on function public.get_directory(text, text, text, text, integer, integer) to anon, authenticated;
