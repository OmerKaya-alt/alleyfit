// ============================================================
// supabase.js — Alleyfit Pilates rezervasyon sistemi client'ı
//
// KURULUM:
//   1) Supabase Dashboard → Settings → API
//   2) "Project URL" değerini SUPABASE_URL'e yapıştır
//   3) "anon public" key'i SUPABASE_ANON_KEY'e yapıştır
//   4) Aynı klasördeki diğer JS dosyaları bu modülü kullanır
// ============================================================

const SUPABASE_URL      = "https://YOUR-PROJECT-REF.supabase.co";
const SUPABASE_ANON_KEY = "PASTE-YOUR-ANON-KEY-HERE";

// Supabase SDK'sı pages/*.html içinde CDN'den yükleniyor.
// Bu modül `window.supabase` global'i hazır olduğunda çalışmalı.
function makeClient() {
  if (!window.supabase || typeof window.supabase.createClient !== "function") {
    throw new Error(
      "Supabase SDK yüklenmedi. HTML <head>'ine şunu ekle:\n" +
      '<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>'
    );
  }
  if (SUPABASE_URL.includes("YOUR-PROJECT-REF") || SUPABASE_ANON_KEY.includes("PASTE")) {
    console.warn("[Alleyfit] Supabase URL/key dolduralanmamış — assets/js/supabase.js düzenlenmeli.");
  }
  return window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: true, autoRefreshToken: true }
  });
}

const sb = makeClient();

// ---------- Yardımcılar ----------

function formatTimeLabel(date) {
  return date.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
}

function formatDateLabel(date) {
  return date.toLocaleDateString("tr-TR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric"
  });
}

function isoDate(date) {
  return date.toISOString().slice(0, 10);
}

function startOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay(); // 0=Pazar
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

// ---------- API ----------

// Verilen iki tarih arasındaki slotları + her slotun mevcut booking sayısını döner
async function fetchSlotsWithBookingCounts(fromISO, toISO) {
  const { data: slots, error } = await sb
    .from("slots")
    .select(`
      id, starts_at, duration_min, capacity, status, notes,
      service:services(id, code, name, capacity),
      instructor:instructors(id, name)
    `)
    .gte("starts_at", fromISO)
    .lt("starts_at", toISO)
    .order("starts_at", { ascending: true });

  if (error) throw error;
  if (!slots || slots.length === 0) return [];

  // Pending+confirmed sayılarını ayrı sorgu ile topla (anon RLS bookings okuyamaz,
  // ama kapasite gösterimi için booking aggregate'lerine erişmek için
  // get_slot_occupancy RPC'sini çağırıyoruz — schema.sql'de tanımlı değil,
  // bunun yerine slots.status alanını kapasiteyi kapatmak için kullanıyoruz)
  // MVP: status='open' ise rezervasyona açık, 'closed' ise dolu/kapalı say.
  return slots;
}

// Yeni rezervasyon talebi (anon kullanıcı)
async function createBooking({ slot_id, name, phone, email, participant_count, notes }) {
  const payload = {
    slot_id,
    customer_name: name,
    customer_phone: phone,
    customer_email: email || null,
    participant_count: participant_count || 1,
    notes: notes || null,
    status: "pending"
  };
  const { data, error } = await sb.from("bookings").insert(payload).select().single();
  if (error) throw error;
  return data;
}

// Admin/instructor: bekleyen + yaklaşan rezervasyonlar
async function fetchUpcomingBookings({ daysAhead = 30 } = {}) {
  const fromISO = new Date().toISOString();
  const toISO   = new Date(Date.now() + daysAhead * 86400000).toISOString();

  const { data, error } = await sb
    .from("bookings")
    .select(`
      id, status, customer_name, customer_phone, customer_email,
      participant_count, notes, created_at, confirmed_at, cancelled_at, cancel_reason,
      slot:slots(
        id, starts_at, duration_min, capacity, status,
        service:services(id, code, name),
        instructor:instructors(id, name)
      )
    `)
    .order("created_at", { ascending: false });

  if (error) throw error;
  if (!data) return [];

  return data
    .filter(b => b.slot && new Date(b.slot.starts_at) >= new Date(fromISO))
    .filter(b => new Date(b.slot.starts_at) <= new Date(toISO));
}

// Admin/instructor: rezervasyon durumunu güncelle
async function updateBookingStatus(bookingId, newStatus, extra = {}) {
  const patch = { status: newStatus, ...extra };
  if (newStatus === "confirmed") {
    patch.confirmed_at = new Date().toISOString();
    const { data: { user } } = await sb.auth.getUser();
    if (user) patch.confirmed_by = user.id;
  }
  if (newStatus === "cancelled") {
    patch.cancelled_at = new Date().toISOString();
  }
  const { data, error } = await sb
    .from("bookings").update(patch).eq("id", bookingId).select().single();
  if (error) throw error;
  return data;
}

// Auth — admin/instructor girişi
async function signIn(email, password) {
  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

async function signOut() {
  await sb.auth.signOut();
}

async function getCurrentRole() {
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return null;
  const { data, error } = await sb
    .from("admins")
    .select("role, instructor_id")
    .eq("auth_user_id", user.id)
    .maybeSingle();
  if (error) return null;
  return data;
}

// Müşteriye gönderilecek WhatsApp onay mesajı linkini hazırla
function buildWhatsAppConfirmLink(booking) {
  const slot = booking.slot;
  const dt = new Date(slot.starts_at);
  const dateStr = formatDateLabel(dt);
  const timeStr = formatTimeLabel(dt);
  const serviceName = slot.service?.name || "seans";
  const msg =
    `Merhaba ${booking.customer_name}, Alleyfit Pilates rezervasyon talebiniz onaylandı.\n` +
    `${dateStr} · ${timeStr} · ${serviceName}\n` +
    `Stüdyoda görüşmek üzere!`;
  const phone = (booking.customer_phone || "").replace(/[^0-9]/g, "");
  return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
}

export {
  sb,
  // helpers
  formatTimeLabel, formatDateLabel, isoDate, startOfWeek, addDays,
  // public API
  fetchSlotsWithBookingCounts, createBooking,
  // admin API
  fetchUpcomingBookings, updateBookingStatus,
  // auth
  signIn, signOut, getCurrentRole,
  // utils
  buildWhatsAppConfirmLink
};
