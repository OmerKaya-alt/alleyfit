-- =====================================================================
-- Alleyfit Wellness Studio — Initial schema + seed
-- Supabase SQL Editor → bu dosyanın TAMAMINI yapıştır → RUN
-- =====================================================================

create extension if not exists "uuid-ossp";

-- ---------------------------------------------------------------------
-- 1) Admin email allowlist (RLS politikalarından ÖNCE tanımlı olmalı)
-- ---------------------------------------------------------------------
create table if not exists public.admin_emails (
  email text primary key
);

insert into public.admin_emails (email) values
  ('aleynavrmaz@gmail.com'),
  ('omerfb2144@gmail.com'),
  ('kmsoftwaretech@gmail.com')
on conflict (email) do nothing;

-- ---------------------------------------------------------------------
-- 2) Slot durum enum
-- ---------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'slot_status') then
    create type slot_status as enum (
      'open',
      'group_open',
      'group_full',
      'private',
      'couple',
      'spinning'
    );
  end if;
end$$;

-- ---------------------------------------------------------------------
-- 3) Tablolar
-- ---------------------------------------------------------------------
create table if not exists public.instructors (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  role text not null,
  email text,
  color text default '#c89889',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.classes (
  slug text primary key,
  title_tr text not null,
  title_en text not null,
  duration_min int not null default 50,
  format_tr text,
  format_en text
);

create table if not exists public.slots (
  id uuid primary key default uuid_generate_v4(),
  date date not null,
  time time not null,
  duration_min int not null default 50,
  class_slug text references public.classes(slug),
  instructor_id uuid references public.instructors(id),
  status slot_status not null default 'open',
  capacity int not null default 6,
  booked_count int not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (date, time, instructor_id)
);

create index if not exists slots_date_time_idx on public.slots(date, time);

create table if not exists public.reservations (
  id uuid primary key default uuid_generate_v4(),
  slot_id uuid not null references public.slots(id) on delete cascade,
  member_name text not null,
  member_phone text not null,
  member_email text,
  message text,
  status text not null default 'pending' check (status in ('pending','confirmed','cancelled')),
  created_at timestamptz not null default now(),
  confirmed_at timestamptz
);

create index if not exists reservations_slot_idx on public.reservations(slot_id);
create index if not exists reservations_status_idx on public.reservations(status);

-- ---------------------------------------------------------------------
-- 4) Trigger — rezervasyon onayında slot.booked_count otomatik güncel
-- ---------------------------------------------------------------------
create or replace function public.sync_slot_after_reservation()
returns trigger as $$
declare
  v_count int;
  v_slot record;
begin
  select * into v_slot from public.slots where id = coalesce(new.slot_id, old.slot_id);
  if not found then
    return null;
  end if;

  select count(*) into v_count
  from public.reservations
  where slot_id = v_slot.id and status = 'confirmed';

  update public.slots
  set
    booked_count = v_count,
    status = case
      when v_slot.status in ('private','couple','spinning') then v_slot.status
      when v_count >= v_slot.capacity then 'group_full'::slot_status
      when v_count > 0 then 'group_open'::slot_status
      else v_slot.status
    end,
    updated_at = now()
  where id = v_slot.id;

  return null;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_sync_slot on public.reservations;
create trigger trg_sync_slot
after insert or update or delete on public.reservations
for each row execute function public.sync_slot_after_reservation();

-- ---------------------------------------------------------------------
-- 5) RLS aç
-- ---------------------------------------------------------------------
alter table public.admin_emails enable row level security;
alter table public.instructors enable row level security;
alter table public.classes enable row level security;
alter table public.slots enable row level security;
alter table public.reservations enable row level security;

-- ---------------------------------------------------------------------
-- 6) Policies
-- ---------------------------------------------------------------------

-- admin_emails — sadece authenticated kullanıcılar kendi e-postaları görebilsin (login için lookup'a izin)
drop policy if exists "auth read admin emails" on public.admin_emails;
create policy "auth read admin emails"
on public.admin_emails for select to authenticated using (true);

-- Public READ — site ziyaretçileri okuyabilir
drop policy if exists "public read instructors" on public.instructors;
create policy "public read instructors" on public.instructors for select to anon, authenticated using (true);

drop policy if exists "public read classes" on public.classes;
create policy "public read classes" on public.classes for select to anon, authenticated using (true);

drop policy if exists "public read slots" on public.slots;
create policy "public read slots" on public.slots for select to anon, authenticated using (true);

-- Public INSERT reservation (pending olarak)
drop policy if exists "public insert reservation" on public.reservations;
create policy "public insert reservation"
on public.reservations for insert to anon, authenticated
with check (status = 'pending');

-- Admin tam yetki — login user'ın e-postası admin_emails'te olmalı
drop policy if exists "admin manage instructors" on public.instructors;
create policy "admin manage instructors"
on public.instructors for all to authenticated
using (auth.jwt() ->> 'email' in (select email from public.admin_emails))
with check (auth.jwt() ->> 'email' in (select email from public.admin_emails));

drop policy if exists "admin manage classes" on public.classes;
create policy "admin manage classes"
on public.classes for all to authenticated
using (auth.jwt() ->> 'email' in (select email from public.admin_emails))
with check (auth.jwt() ->> 'email' in (select email from public.admin_emails));

drop policy if exists "admin manage slots" on public.slots;
create policy "admin manage slots"
on public.slots for all to authenticated
using (auth.jwt() ->> 'email' in (select email from public.admin_emails))
with check (auth.jwt() ->> 'email' in (select email from public.admin_emails));

drop policy if exists "admin manage reservations" on public.reservations;
create policy "admin manage reservations"
on public.reservations for all to authenticated
using (auth.jwt() ->> 'email' in (select email from public.admin_emails))
with check (auth.jwt() ->> 'email' in (select email from public.admin_emails));

-- ---------------------------------------------------------------------
-- 7) SEED DATA — Ders türleri
-- ---------------------------------------------------------------------
insert into public.classes (slug, title_tr, title_en, duration_min, format_tr, format_en) values
  ('reformer', 'Reformer', 'Reformer', 50, 'Grup · max 6 kişi', 'Group · max 6 people'),
  ('mat',      'Mat Pilates', 'Mat Pilates', 50, 'Grup · max 6 kişi', 'Group · max 6 people'),
  ('cadillac', 'Cadillac', 'Cadillac', 50, 'Birebir & 2 kişilik özel oda', '1:1 & 2-person private room'),
  ('spinning', 'Spinning', 'Spinning', 45, 'Grup · 12 kişilik özel salon', 'Group · 12-person private studio'),
  ('prenatal', 'Prenatal', 'Prenatal', 50, 'Kişiye özel · küçük grup', 'Personalized · small group'),
  ('ozel',     'Özel Seans', 'Private Session', 60, 'Birebir özel seans', '1:1 private session'),
  ('beslenme', 'Beslenme Danışmanlığı', 'Nutrition Counseling', 45, 'Birebir görüşme', '1:1 consultation')
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------
-- 8) SEED DATA — Eğitmenler
-- ---------------------------------------------------------------------
insert into public.instructors (id, name, role, email, color, active) values
  ('11111111-1111-1111-1111-111111111111', 'Aleyna Vurmaz', 'Reformer · Mat · Cadillac · Spinning · Prenatal · Özel', 'aleynavrmaz@gmail.com', '#c89889', true),
  ('22222222-2222-2222-2222-222222222222', 'Ayşenur Kılıçarslan', 'Beslenme Danışmanı', null, '#a87568', true)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------
-- 9) SEED DATA — Pazartesi 18 Mayıs 2026
-- ---------------------------------------------------------------------
insert into public.slots (date, time, duration_min, class_slug, instructor_id, status, capacity, booked_count) values
  ('2026-05-18', '06:00', 50, null,       '11111111-1111-1111-1111-111111111111', 'open',        6, 0),
  ('2026-05-18', '07:00', 50, null,       '11111111-1111-1111-1111-111111111111', 'open',        6, 0),
  ('2026-05-18', '08:00', 50, null,       '11111111-1111-1111-1111-111111111111', 'open',        6, 0),
  ('2026-05-18', '09:00', 50, null,       '11111111-1111-1111-1111-111111111111', 'open',        6, 0),
  ('2026-05-18', '10:00', 50, 'reformer', '11111111-1111-1111-1111-111111111111', 'group_full',  6, 6),
  ('2026-05-18', '11:00', 50, 'ozel',     '11111111-1111-1111-1111-111111111111', 'private',     1, 1),
  ('2026-05-18', '12:00', 50, 'reformer', '11111111-1111-1111-1111-111111111111', 'group_full',  6, 6),
  ('2026-05-18', '13:00', 50, 'ozel',     '11111111-1111-1111-1111-111111111111', 'private',     1, 1),
  ('2026-05-18', '14:00', 50, null,       '11111111-1111-1111-1111-111111111111', 'open',        6, 0),
  ('2026-05-18', '15:00', 50, 'cadillac', '11111111-1111-1111-1111-111111111111', 'couple',      2, 2),
  ('2026-05-18', '16:00', 50, 'ozel',     '11111111-1111-1111-1111-111111111111', 'private',     1, 1),
  ('2026-05-18', '17:00', 50, 'reformer', '11111111-1111-1111-1111-111111111111', 'group_open',  6, 2),
  ('2026-05-18', '18:00', 50, null,       '11111111-1111-1111-1111-111111111111', 'open',        6, 0),
  ('2026-05-18', '19:00', 50, 'cadillac', '11111111-1111-1111-1111-111111111111', 'couple',      2, 2),
  ('2026-05-18', '20:00', 50, 'reformer', '11111111-1111-1111-1111-111111111111', 'group_full',  6, 6),
  ('2026-05-18', '21:00', 50, 'cadillac', '11111111-1111-1111-1111-111111111111', 'couple',      2, 2),
  ('2026-05-18', '22:00', 50, 'cadillac', '11111111-1111-1111-1111-111111111111', 'couple',      2, 2),
  ('2026-05-18', '23:00', 50, 'ozel',     '11111111-1111-1111-1111-111111111111', 'private',     1, 1)
on conflict (date, time, instructor_id) do nothing;

-- ---------------------------------------------------------------------
-- 10) SEED DATA — Salı 19 Mayıs 2026
-- ---------------------------------------------------------------------
insert into public.slots (date, time, duration_min, class_slug, instructor_id, status, capacity, booked_count) values
  ('2026-05-19', '06:00', 50, null,       '11111111-1111-1111-1111-111111111111', 'open',        6, 0),
  ('2026-05-19', '07:00', 50, null,       '11111111-1111-1111-1111-111111111111', 'open',        6, 0),
  ('2026-05-19', '08:00', 50, 'ozel',     '11111111-1111-1111-1111-111111111111', 'private',     1, 1),
  ('2026-05-19', '09:00', 50, null,       '11111111-1111-1111-1111-111111111111', 'open',        6, 0),
  ('2026-05-19', '10:00', 50, 'cadillac', '11111111-1111-1111-1111-111111111111', 'couple',      2, 2),
  ('2026-05-19', '11:00', 50, 'reformer', '11111111-1111-1111-1111-111111111111', 'group_full',  6, 6),
  ('2026-05-19', '12:00', 50, 'cadillac', '11111111-1111-1111-1111-111111111111', 'couple',      2, 2),
  ('2026-05-19', '13:00', 50, 'ozel',     '11111111-1111-1111-1111-111111111111', 'private',     1, 1),
  ('2026-05-19', '14:00', 50, null,       '11111111-1111-1111-1111-111111111111', 'open',        6, 0),
  ('2026-05-19', '15:00', 50, null,       '11111111-1111-1111-1111-111111111111', 'open',        6, 0),
  ('2026-05-19', '16:00', 50, null,       '11111111-1111-1111-1111-111111111111', 'open',        6, 0),
  ('2026-05-19', '17:00', 50, 'ozel',     '11111111-1111-1111-1111-111111111111', 'private',     1, 1),
  ('2026-05-19', '18:00', 50, 'reformer', '11111111-1111-1111-1111-111111111111', 'group_open',  6, 2),
  ('2026-05-19', '19:00', 50, 'ozel',     '11111111-1111-1111-1111-111111111111', 'private',     1, 1),
  ('2026-05-19', '20:00', 45, 'spinning', '11111111-1111-1111-1111-111111111111', 'spinning',   12, 0),
  ('2026-05-19', '21:00', 50, 'reformer', '11111111-1111-1111-1111-111111111111', 'group_full',  6, 6),
  ('2026-05-19', '22:00', 50, 'cadillac', '11111111-1111-1111-1111-111111111111', 'couple',      2, 2),
  ('2026-05-19', '23:00', 50, null,       '11111111-1111-1111-1111-111111111111', 'open',        6, 0)
on conflict (date, time, instructor_id) do nothing;

-- =====================================================================
-- END
-- =====================================================================
