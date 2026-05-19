# Alleyfit Rezervasyon Sistemi — Kurulum

Bu dosya, sıfırdan Supabase'e bağlanıp rezervasyon sistemini ayağa kaldırma adımlarını anlatır.

## 1. Supabase projesi aç

1. https://supabase.com → **Sign Up** (GitHub ile veya e-posta)
2. **New Project**
   - Name: `alleyfit-rezervasyon`
   - Database password: güçlü bir parola seç ve sakla (recovery için lazım)
   - Region: `Frankfurt (eu-central-1)` (Türkiye'ye en yakın free region)
   - Pricing plan: **Free**
3. Proje hazır olunca **Project Settings → API** sayfasına git
4. İki değeri kopyala:
   - `Project URL` — örn. `https://abcdefgh.supabase.co`
   - `anon public` key — `eyJ...` ile başlayan uzun bir token

## 2. Veritabanı şemasını yükle

1. Supabase Dashboard → **SQL Editor** → **New query**
2. `database/schema.sql` dosyasının **tamamını** yapıştır
3. **Run** (sağ üst)
4. Hata yoksa şu mesajı görmelisin: `Success. No rows returned.`

Bu adım şu tabloları yarattı:
- `instructors`, `services`, `slots`, `bookings`, `admins`
- RLS politikaları
- 11–12 Mayıs 2026 için örnek slot verisi
- Ayşenur ve Aleyna eğitmen kayıtları
- Birebir/Couple/Grup/Spinning/Beslenme hizmet kayıtları

## 3. Admin kullanıcısı oluştur

### 3a. Auth user yarat
1. Supabase Dashboard → **Authentication → Users** → **Add user → Create new user**
2. E-posta + parola gir (örn. `kmsoftwaretech@gmail.com` + güçlü parola)
3. **Auto Confirm User** ✓ işaretle (e-posta doğrulamayı atlamak için)
4. **Create user**
5. Yarattığın kullanıcının **UID**'sini kopyala (User ID sütunu, `uuid` formatında)

### 3b. Admin rolü ver
SQL Editor'da yeni query:

```sql
-- Mert
insert into public.admins (auth_user_id, role)
values ('UID_BURAYA_YAPISTIR', 'admin');

-- Ömer için aynısı (önce Auth → Users → Add user, sonra)
insert into public.admins (auth_user_id, role)
values ('OMER_UID_BURAYA', 'admin');
```

### 3c. Eğitmen rolü ver (opsiyonel)
Ayşenur ve Aleyna kendi seanslarını görsün istiyorsan:

```sql
-- Önce Auth → Users → Add user ile Ayşenur'a hesap aç
insert into public.admins (auth_user_id, role, instructor_id)
values (
  'AYSENUR_UID',
  'instructor',
  (select id from public.instructors where name = 'Ayşenur Kılıçarslan')
);

-- Aleyna için
insert into public.admins (auth_user_id, role, instructor_id)
values (
  'ALEYNA_UID',
  'instructor',
  (select id from public.instructors where name = 'Aleyna Vurmaz')
);
```

## 4. Frontend'i Supabase'e bağla

`assets/js/supabase.js` dosyasını aç ve en üstteki iki sabiti güncelle:

```js
const SUPABASE_URL      = "https://abcdefgh.supabase.co";          // 1. adımdaki Project URL
const SUPABASE_ANON_KEY = "eyJhbGciOiJI...";                       // 1. adımdaki anon public key
```

**Önemli:** Bu değerler herkese açık (`anon public` zaten frontend için). Gerçek güvenlik RLS politikalarında — `service_role` anahtarını **asla** frontend'e koyma.

## 5. Test et

### Müşteri akışı (anonim):
1. `pages/program.html` aç
2. Aktif gün otomatik açılmalı, slot'lar görünmeli
3. **"Talep Et"** veya **"Rezervasyon"** butonuna bas
4. Modal açılır → ad, telefon gir → **Talebi Gönder**
5. Başarı mesajı görmelisin

### Admin akışı:
1. `pages/admin.html` aç
2. 3a'da yarattığın e-posta + parola ile giriş yap
3. Dashboard → **Bekleyenler** filtresinde yeni rezervasyonu görmelisin
4. **Onayla & WhatsApp** butonu → durum `confirmed` olur, yeni sekmede müşterinin WhatsApp'ı prefilled mesajla açılır

## 6. Yeni hafta slot'larını üretme

Şimdilik şu SQL bloğu ile manuel: (her hafta admin panelinde otomatikleştirme yapılana kadar)

```sql
do $$
declare
  v_aysenur uuid := (select id from public.instructors where name='Ayşenur Kılıçarslan');
  v_aleyna  uuid := (select id from public.instructors where name='Aleyna Vurmaz');
  v_birebir uuid := (select id from public.services where code='birebir');
  v_grup    uuid := (select id from public.services where code='grup');
  -- ... vb.
  v_week_start date := '2026-05-18';  -- HAFTA BAŞI BURAYA
begin
  -- 7 gün × 18 saat = manuel yazılır, ya da PL/pgSQL döngü kullan
  -- (Gelecekte admin paneli üzerinden otomatikleşecek)
end$$;
```

## Sıkça sorulanlar

**Q: Müşteri rezervasyon yapıyor ama admin panelinde göremiyorum?**
A: 3b adımındaki INSERT'i atladın mı? Auth user'ı `admins` tablosuna eklemen lazım.

**Q: "Bu saatte yer kalmadı" hatası alıyor müşteri ama slot açık görünüyor?**
A: Slot kapasitesi dolmuş demektir. `slots.status = 'open'` + `slots.capacity > toplam_booking_kişi` kontrolü trigger ile yapılıyor.

**Q: Eğitmen başka eğitmenin rezervasyonlarını görebilir mi?**
A: Hayır. RLS politikası gereği `instructor` rolü sadece kendi `instructor_id`'sine bağlı `slots`'taki `bookings`'leri görür.

**Q: Maliyet ne kadar olur?**
A: Free tier sınırları:
- 500 MB database
- 50.000 monthly active users
- 5 GB bandwidth/ay
- Günde 10–30 rezervasyon × ~1 KB = yılda <1 MB. Tier dolmaz.

**Q: E-posta bildirimi yok mu?**
A: MVP'de yok. İstenirse Resend.com (free tier: 100 mail/gün) entegrasyonu Supabase Edge Function ile eklenir — sonraki faz.
