-- ==========================================================================
-- Alleyfit Pilates — Rezervasyon Sistemi
-- Postgres / Supabase şeması + RLS politikaları + seed verisi
--
-- Kullanım:
--   1) Supabase Dashboard → SQL Editor → New query
--   2) Bu dosyanın TAMAMINI yapıştır
--   3) RUN
--   4) Hata yoksa: admins tablosuna kendi auth.users.id'ini ekleyerek admin ol
--      (SQL'in en altındaki "İLK ADMIN" bloğuna bak)
-- ==========================================================================


-- ---------- EXTENSIONS ----------

create extension if not exists "pgcrypto";


-- ==========================================================================
-- 1) TABLOLAR
-- ==========================================================================

-- Eğitmenler
create table if not exists public.instructors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text unique,
  auth_user_id uuid references auth.users(id) on delete set null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Hizmetler / Ders türleri
create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  capacity int not null default 1,
  description text,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- Zaman dilimleri (slots) — her satır belirli bir tarih+saatteki bir seans
create table if not exists public.slots (
  id uuid primary key default gen_random_uuid(),
  starts_at timestamptz not null,
  duration_min int not null default 60,
  service_id uuid references public.services(id) on delete restrict,
  instructor_id uuid references public.instructors(id) on delete set null,
  capacity int not null default 1,
  status text not null default 'open'
    check (status in ('open','closed','cancelled')),
  notes text,
  created_at timestamptz not null default now()
);

create unique index if not exists uniq_slot_time_instructor
  on public.slots (starts_at, instructor_id);

create index if not exists idx_slots_starts_at
  on public.slots (starts_at);

create index if not exists idx_slots_status
  on public.slots (status);

-- Rezervasyonlar
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  slot_id uuid not null references public.slots(id) on delete cascade,
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  participant_count int not null default 1,
  notes text,
  status text not null default 'pending'
    check (status in ('pending','confirmed','cancelled','no_show','completed')),
  created_at timestamptz not null default now(),
  confirmed_at timestamptz,
  confirmed_by uuid references auth.users(id) on delete set null,
  cancelled_at timestamptz,
  cancel_reason text
);

create index if not exists idx_bookings_slot on public.bookings (slot_id);
create index if not exists idx_bookings_status on public.bookings (status);
create index if not exists idx_bookings_created_at on public.bookings (created_at desc);

-- Roller — admin / instructor
create table if not exists public.admins (
  auth_user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('admin','instructor')),
  instructor_id uuid references public.instructors(id) on delete set null,
  created_at timestamptz not null default now()
);


-- ==========================================================================
-- 2) YARDIMCI FONKSİYONLAR (RLS politikaları için)
-- ==========================================================================

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admins
    where auth_user_id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.is_instructor()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admins
    where auth_user_id = auth.uid() and role = 'instructor'
  );
$$;

create or replace function public.current_instructor_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select instructor_id from public.admins
   where auth_user_id = auth.uid() and role = 'instructor'
   limit 1;
$$;

-- Slot kapasite kontrolü — booking insert sırasında dolu slot'a yazmayı engeller
create or replace function public.check_slot_capacity()
returns trigger
language plpgsql
as $$
declare
  current_count int;
  slot_capacity int;
  slot_status text;
begin
  select capacity, status into slot_capacity, slot_status
    from public.slots where id = new.slot_id;

  if slot_status <> 'open' then
    raise exception 'Bu saat rezervasyona kapalı.';
  end if;

  select coalesce(sum(participant_count), 0) into current_count
    from public.bookings
   where slot_id = new.slot_id
     and status in ('pending','confirmed');

  if current_count + new.participant_count > slot_capacity then
    raise exception 'Bu saatte yer kalmadı (% / % dolu).',
      current_count, slot_capacity;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_check_slot_capacity on public.bookings;
create trigger trg_check_slot_capacity
  before insert on public.bookings
  for each row execute function public.check_slot_capacity();


-- ==========================================================================
-- 3) ROW-LEVEL SECURITY POLİTİKALARI
-- ==========================================================================

alter table public.instructors enable row level security;
alter table public.services    enable row level security;
alter table public.slots       enable row level security;
alter table public.bookings    enable row level security;
alter table public.admins      enable row level security;

-- ---- HERKES (anon dahil) okuyabilir ----

drop policy if exists "public read services" on public.services;
create policy "public read services" on public.services
  for select using (is_active = true);

drop policy if exists "public read instructors" on public.instructors;
create policy "public read instructors" on public.instructors
  for select using (is_active = true);

drop policy if exists "public read slots" on public.slots;
create policy "public read slots" on public.slots
  for select using (true);

-- ---- BOOKING: anon insert (status='pending' zorunlu) ----

drop policy if exists "anyone inserts pending booking" on public.bookings;
create policy "anyone inserts pending booking" on public.bookings
  for insert with check (status = 'pending');

-- ---- BOOKING okuma: admin her şey, instructor sadece kendi slotunu ----

drop policy if exists "admins read all bookings" on public.bookings;
create policy "admins read all bookings" on public.bookings
  for select using (public.is_admin());

drop policy if exists "instructors read own bookings" on public.bookings;
create policy "instructors read own bookings" on public.bookings
  for select using (
    public.is_instructor()
    and exists (
      select 1 from public.slots s
      where s.id = bookings.slot_id
        and s.instructor_id = public.current_instructor_id()
    )
  );

-- ---- BOOKING update: admin + ilgili instructor ----

drop policy if exists "admins update bookings" on public.bookings;
create policy "admins update bookings" on public.bookings
  for update using (public.is_admin());

drop policy if exists "instructors update own bookings" on public.bookings;
create policy "instructors update own bookings" on public.bookings
  for update using (
    public.is_instructor()
    and exists (
      select 1 from public.slots s
      where s.id = bookings.slot_id
        and s.instructor_id = public.current_instructor_id()
    )
  );

-- ---- SLOTS yönetimi: sadece admin (delete/insert/update) ----

drop policy if exists "admins manage slots" on public.slots;
create policy "admins manage slots" on public.slots
  for all using (public.is_admin())
  with check (public.is_admin());

-- ---- SERVICES & INSTRUCTORS yönetimi: sadece admin ----

drop policy if exists "admins manage services" on public.services;
create policy "admins manage services" on public.services
  for all using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "admins manage instructors" on public.instructors;
create policy "admins manage instructors" on public.instructors
  for all using (public.is_admin())
  with check (public.is_admin());

-- ---- ADMINS tablosu: sadece admin okur/yönetir ----

drop policy if exists "admins read admins" on public.admins;
create policy "admins read admins" on public.admins
  for select using (public.is_admin());

drop policy if exists "admins manage admins" on public.admins;
create policy "admins manage admins" on public.admins
  for all using (public.is_admin())
  with check (public.is_admin());

-- Bir kullanıcı kendi admin satırını okuyabilsin (yetki sorgusu için)
drop policy if exists "user reads own admin row" on public.admins;
create policy "user reads own admin row" on public.admins
  for select using (auth_user_id = auth.uid());


-- ==========================================================================
-- 4) SEED VERİSİ
-- ==========================================================================

insert into public.instructors (name, email) values
  ('Ayşenur Kılıçarslan', null),
  ('Aleyna Vurmaz', 'aleynavrmaz@gmail.com')
on conflict (email) do nothing;

insert into public.services (code, name, capacity, description, sort_order) values
  ('birebir',   'Birebir Ders',          1, 'Eğitmenle birebir Pilates seansı', 1),
  ('couple',    'Couple Ders',           2, 'İki kişiyle birlikte özel seans',  2),
  ('grup',      'Grup Ders',             4, 'Küçük grup Pilates seansı',        3),
  ('spinning',  'Spinning',             12, 'Spinning kardiyo seansı',          4),
  ('beslenme',  'Beslenme Danışmanlığı', 1, 'Bireysel beslenme görüşmesi',      5)
on conflict (code) do nothing;


-- ==========================================================================
-- 5) İLK ADMIN — ŞU SATIRI ELLE ÇALIŞTIR
-- ==========================================================================
-- Önce Supabase Auth → Users sekmesinden kendine bir e-posta+parola kullanıcı
-- yarat, sonra o kullanıcının id'sini aşağıya yapıştırıp çalıştır:
--
-- insert into public.admins (auth_user_id, role)
-- values ('PASTE_YOUR_AUTH_USER_ID_HERE', 'admin');
--
-- Ömer için aynısı:
-- insert into public.admins (auth_user_id, role)
-- values ('OMERS_AUTH_USER_ID', 'admin');
--
-- Eğitmen rolü (önce Ayşenur/Aleyna için Auth user yarat, sonra):
-- insert into public.admins (auth_user_id, role, instructor_id)
-- values (
--   'INSTRUCTORS_AUTH_USER_ID',
--   'instructor',
--   (select id from public.instructors where name = 'Ayşenur Kılıçarslan')
-- );


-- ==========================================================================
-- 6) ÖRNEK HAFTA SLOT'LARI (test için)
-- ==========================================================================
-- Aşağıdaki blok 11–17 Mayıs 2026 haftası için örnek slot'ları ekler.
-- Üretimde admin paneli üzerinden hafta hafta üretilir.

do $$
declare
  v_aysenur uuid;
  v_aleyna  uuid;
  v_birebir uuid;
  v_couple  uuid;
  v_grup    uuid;
  v_spin    uuid;
begin
  select id into v_aysenur from public.instructors where name='Ayşenur Kılıçarslan';
  select id into v_aleyna  from public.instructors where name='Aleyna Vurmaz';
  select id into v_birebir from public.services where code='birebir';
  select id into v_couple  from public.services where code='couple';
  select id into v_grup    from public.services where code='grup';
  select id into v_spin    from public.services where code='spinning';

  -- Pazartesi 11 Mayıs 2026 — gerçek veri
  insert into public.slots (starts_at, service_id, instructor_id, capacity, status) values
    ('2026-05-11 06:00+03', v_birebir, v_aysenur, 1, 'open'),
    ('2026-05-11 07:00+03', v_birebir, v_aysenur, 1, 'open'),
    ('2026-05-11 08:00+03', v_birebir, v_aysenur, 1, 'open'),
    ('2026-05-11 09:00+03', v_birebir, v_aysenur, 1, 'open'),
    ('2026-05-11 10:00+03', v_grup,    v_aysenur, 4, 'closed'),
    ('2026-05-11 11:00+03', v_birebir, v_aysenur, 1, 'closed'),
    ('2026-05-11 12:00+03', v_grup,    v_aysenur, 4, 'closed'),
    ('2026-05-11 13:00+03', v_birebir, v_aysenur, 1, 'closed'),
    ('2026-05-11 14:00+03', v_birebir, v_aysenur, 1, 'open'),
    ('2026-05-11 15:00+03', v_couple,  v_aysenur, 2, 'closed'),
    ('2026-05-11 16:00+03', v_birebir, v_aysenur, 1, 'closed'),
    ('2026-05-11 17:00+03', v_grup,    v_aysenur, 4, 'open'),
    ('2026-05-11 18:00+03', v_birebir, v_aysenur, 1, 'open'),
    ('2026-05-11 19:00+03', v_couple,  v_aleyna,  2, 'closed'),
    ('2026-05-11 20:00+03', v_grup,    v_aleyna,  4, 'closed'),
    ('2026-05-11 21:00+03', v_couple,  v_aleyna,  2, 'closed'),
    ('2026-05-11 22:00+03', v_couple,  v_aleyna,  2, 'closed'),
    ('2026-05-11 23:00+03', v_birebir, v_aleyna,  1, 'closed')
  on conflict do nothing;

  -- Salı 12 Mayıs 2026 — gerçek veri
  insert into public.slots (starts_at, service_id, instructor_id, capacity, status) values
    ('2026-05-12 06:00+03', v_birebir, v_aysenur, 1, 'open'),
    ('2026-05-12 07:00+03', v_birebir, v_aysenur, 1, 'open'),
    ('2026-05-12 08:00+03', v_birebir, v_aysenur, 1, 'closed'),
    ('2026-05-12 09:00+03', v_birebir, v_aysenur, 1, 'open'),
    ('2026-05-12 10:00+03', v_couple,  v_aysenur, 2, 'closed'),
    ('2026-05-12 11:00+03', v_grup,    v_aysenur, 4, 'closed'),
    ('2026-05-12 12:00+03', v_couple,  v_aysenur, 2, 'closed'),
    ('2026-05-12 13:00+03', v_birebir, v_aysenur, 1, 'closed'),
    ('2026-05-12 14:00+03', v_birebir, v_aysenur, 1, 'open'),
    ('2026-05-12 15:00+03', v_birebir, v_aysenur, 1, 'open'),
    ('2026-05-12 16:00+03', v_birebir, v_aysenur, 1, 'open'),
    ('2026-05-12 17:00+03', v_birebir, v_aleyna,  1, 'closed'),
    ('2026-05-12 18:00+03', v_grup,    v_aleyna,  4, 'open'),
    ('2026-05-12 19:00+03', v_birebir, v_aleyna,  1, 'closed'),
    ('2026-05-12 20:00+03', v_spin,    v_aleyna, 12, 'open'),
    ('2026-05-12 21:00+03', v_grup,    v_aleyna,  4, 'closed'),
    ('2026-05-12 22:00+03', v_couple,  v_aleyna,  2, 'closed'),
    ('2026-05-12 23:00+03', v_birebir, v_aleyna,  1, 'open')
  on conflict do nothing;

  -- Cuma 15 Mayıs 2026 â€” ekran gÃ¶rÃ¼ntÃ¼sÃ¼
  insert into public.slots (starts_at, service_id, instructor_id, capacity, status, notes) values
    ('2026-05-15 14:00+03', v_birebir, v_aleyna, 1, 'closed', 'SÃ¼eda bayraktar (birebir ders) / Ceyda Mutlu 15 MayÄ±s'),
    ('2026-05-15 15:00+03', v_couple,  v_aleyna, 2, 'closed', 'Nisa ve TuÄŸba 15 MayÄ±s'),
    ('2026-05-15 16:00+03', v_birebir, v_aleyna, 1, 'closed', 'BegÃ¼m 15 MayÄ±s'),
    ('2026-05-15 17:00+03', v_grup,    v_aleyna, 6, 'closed', 'Grup sÄ±nÄ±fÄ± 3/6 Â· 24'),
    ('2026-05-15 18:00+03', v_grup,    v_aleyna, 6, 'closed', 'Grup dersi'),
    ('2026-05-15 19:00+03', v_grup,    v_aleyna, 6, 'closed', 'BÃ¼ÅŸra ve Sultan (grup dersi) / 8 MayÄ±s yok'),
    ('2026-05-15 20:00+03', v_grup,    v_aleyna, 6, 'closed', 'Ã‡aÄŸla, Beyza, Berfu (grup dersi)'),
    ('2026-05-15 21:00+03', v_grup,    v_aleyna, 6, 'closed', 'Burak ve Ezgi (grup dersi)'),
    ('2026-05-15 22:00+03', null,      v_aleyna, 6, 'open',   null),
    ('2026-05-15 23:00+03', null,      v_aleyna, 6, 'open',   null)
  on conflict do nothing;

  -- Cumartesi 16 MayÄ±s 2026 â€” ekran gÃ¶rÃ¼ntÃ¼sÃ¼
  insert into public.slots (starts_at, service_id, instructor_id, capacity, status, notes) values
    ('2026-05-16 07:00+03', v_birebir, v_aleyna, 1, 'closed', 'Funda Mavice 18 Nisan'),
    ('2026-05-16 08:00+03', v_birebir, v_aleyna, 1, 'closed', 'Mert KoÃ§ak 18 Nisan'),
    ('2026-05-16 09:00+03', v_couple,  v_aleyna, 2, 'closed', 'Hacer ve GÃ¼lÅŸah 16 MayÄ±s'),
    ('2026-05-16 10:00+03', v_birebir, v_aleyna, 1, 'closed', 'Ã–zge Ã‡elik YÄ±lmaz 23 MayÄ±s'),
    ('2026-05-16 11:00+03', v_birebir, v_aleyna, 1, 'closed', 'Burcu Åahin (birebir ders) / Hacer ve GÃ¼lÅŸah 16 MayÄ±s'),
    ('2026-05-16 12:00+03', v_grup,    v_aleyna, 6, 'closed', 'Ezgi ve Burak (grup dersi) / Melike ve Åenay 2 MayÄ±s'),
    ('2026-05-16 13:00+03', v_birebir, v_aleyna, 1, 'closed', 'Filiz DinÃ§ (birebir ders)'),
    ('2026-05-16 14:00+03', v_birebir, v_aleyna, 1, 'closed', 'Åerife Ergin (birebir ders)'),
    ('2026-05-16 15:00+03', v_birebir, v_aleyna, 1, 'closed', 'Arda Ayvaz (birebir ders) / 16 MayÄ±s akÅŸamÄ±'),
    ('2026-05-16 16:00+03', v_couple,  v_aleyna, 2, 'closed', 'BÃ¼ÅŸra ve Sultan 16 MayÄ±s'),
    ('2026-05-16 17:00+03', v_birebir, v_aleyna, 1, 'closed', 'SÃ¼eda Bayraktar (birebir ders)'),
    ('2026-05-16 18:00+03', v_birebir, v_aleyna, 1, 'closed', 'Nur Balkan (birebir ders)'),
    ('2026-05-16 19:00+03', v_grup,    v_aleyna, 6, 'closed', 'GÃ¼lÅŸah ve Hacer (grup ders) / Melike ve Åenay 23 MayÄ±s'),
    ('2026-05-16 20:00+03', v_spin,    v_aleyna, 12, 'closed', 'Spinning class'),
    ('2026-05-16 21:00+03', v_couple,  v_aleyna, 2, 'closed', 'Berfu Haza ve Ã‡aÄŸla 2 MayÄ±s'),
    ('2026-05-16 22:00+03', v_birebir, v_aleyna, 1, 'closed', 'GÃ¶kselin Belel YaÅŸar 18 Nisan'),
    ('2026-05-16 23:00+03', null,      v_aleyna, 6, 'open',   null)
  on conflict do nothing;

  -- PerÅŸembe 21 MayÄ±s 2026 â€” ekran gÃ¶rÃ¼ntÃ¼sÃ¼
  insert into public.slots (starts_at, service_id, instructor_id, capacity, status, notes) values
    ('2026-05-21 14:00+03', v_grup,    v_aleyna, 6, 'closed', 'Naz ve TuÄŸba (grup dersi) / 21 MayÄ±s yok'),
    ('2026-05-21 15:00+03', v_birebir, v_aleyna, 1, 'closed', 'Ceyda Mutlu 21 MayÄ±s'),
    ('2026-05-21 16:00+03', v_birebir, v_aleyna, 1, 'closed', 'BegÃ¼m FazlioÄŸlu (birebir ders)'),
    ('2026-05-21 17:00+03', v_grup,    v_aleyna, 6, 'closed', 'Melek ve Neslihan (grup ders) / 18 Haziran yok'),
    ('2026-05-21 18:00+03', v_spin,    v_aleyna, 12, 'closed', 'Spinning class'),
    ('2026-05-21 19:00+03', v_grup,    v_aleyna, 6, 'closed', 'Umut ve Burcu (grup ders) / Duygu Akay 21 MayÄ±s'),
    ('2026-05-21 20:00+03', v_grup,    v_aleyna, 6, 'closed', 'Grup sÄ±nÄ±fÄ± 6/6'),
    ('2026-05-21 21:00+03', v_grup,    v_aleyna, 6, 'closed', 'Grup sÄ±nÄ±fÄ± 6/6'),
    ('2026-05-21 22:00+03', v_birebir, v_aleyna, 1, 'closed', 'Melike ve Åenay (birebir ders) / Hacer ve GÃ¼lÅŸah 14 MayÄ±s / Sena ve Buket 21 MayÄ±s'),
    ('2026-05-21 23:00+03', v_birebir, v_aleyna, 1, 'closed', 'Funda Mavice (birebir ders)'),
    ('2026-05-21 00:00+03', v_couple,  v_aleyna, 2, 'closed', '14 MayÄ±s Buket ve Sena')
  on conflict do nothing;
end$$;


-- ==========================================================================
-- HAZIR. Şimdi:
--   1) Auth → Users sekmesinden admin kullanıcısı yarat
--   2) 5. bölümdeki insert satırını çalıştır
--   3) admin@.../admin.html sayfasından giriş yap
-- ==========================================================================
