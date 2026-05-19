import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase client — Alleyfit Wellness Studio
 *
 * Env değişkenleri `app/.env.local`'da bekleniyor:
 *   VITE_SUPABASE_URL
 *   VITE_SUPABASE_ANON_KEY
 *
 * Env yoksa `supabase` null döner — UI tarafı bunu kontrol edip
 * "Backend bağlı değil" mesajı gösterir veya statik fallback'e düşer.
 */

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const supabaseConfigured = Boolean(url && anonKey);

export const supabase: SupabaseClient | null = supabaseConfigured
  ? createClient(url!, anonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

/** Admin email allowlist — env'den virgülle ayrılmış. */
export const ADMIN_EMAILS = (
  (import.meta.env.VITE_ADMIN_EMAILS as string | undefined) ?? ""
)
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

/* ------------------------------------------------------------------ */
/*  Veri tip imzaları — Supabase tablolarıyla birebir uyumlu           */
/* ------------------------------------------------------------------ */

export type SlotStatus =
  | "open" // boş — herhangi bir ders için rezerve edilebilir
  | "group_open" // grup dersi açık, kontenjan var
  | "group_full" // grup dersi dolu (waitlist)
  | "private" // birebir ders
  | "couple" // 2 kişilik couple ders
  | "spinning"; // spinning grup (12 kişilik salon)

export type DbInstructor = {
  id: string;
  name: string;
  role: string;
  email: string | null;
  color: string | null;
  active: boolean;
  created_at: string;
};

export type DbSlot = {
  id: string;
  date: string; // ISO YYYY-MM-DD
  time: string; // HH:MM
  duration_min: number;
  class_slug: string | null;
  instructor_id: string | null;
  status: SlotStatus;
  capacity: number;
  booked_count: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type DbReservation = {
  id: string;
  slot_id: string;
  member_name: string;
  member_phone: string;
  member_email: string | null;
  message: string | null;
  status: "pending" | "confirmed" | "cancelled";
  created_at: string;
  confirmed_at: string | null;
};
