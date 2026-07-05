import type { DbSlot, SlotStatus } from "@/lib/supabase";

/* ====================================================================
 *  HAFTALIK PROGRAM ŞABLONU — Alleyfit Wellness Studio
 *
 *  Sabit tarih YOK. Şablon haftanın günlerine (Pzt-Paz) göre tanımlı;
 *  Schedule sayfası `generateFallbackSlots()` ile bugünden itibaren
 *  gerçek tarihlere otomatik basar → tarih asla kaymaz.
 *
 *  Kaynak: stüdyonun Apple Notes haftalık defteri.
 *  - İsim yazan slot   → dolu (private / couple / group_full)
 *  - "Grup sınıfı X/.." → group_open (kontenjan var)
 *  - Boş hücre         → open (randevuya açık)
 *  Cumartesi/Pazar veri gelmedi → tüm saatler "open" (randevuya açık).
 *
 *  Bu şablon yalnızca BAŞLANGIÇ görünümüdür; admin paneli (Supabase)
 *  slotları diledikçe günceller, canlı veri şablonun üstüne biner.
 * ================================================================== */

const EPOCH = new Date(0).toISOString();

type Tpl = {
  time: string;
  status: SlotStatus;
  classSlug: string | null;
  capacity: number;
  booked: number;
};

/* Slot kısayolları */
const open = (time: string): Tpl => ({
  time,
  status: "open",
  classSlug: null,
  capacity: 1,
  booked: 0,
});
const priv = (time: string): Tpl => ({
  time,
  status: "private",
  classSlug: "ozel",
  capacity: 1,
  booked: 0,
});
const couple = (time: string): Tpl => ({
  time,
  status: "couple",
  classSlug: "cadillac",
  capacity: 2,
  booked: 0,
});
const groupFull = (time: string): Tpl => ({
  time,
  status: "group_open",
  classSlug: "reformer",
  capacity: 6,
  booked: 0,
});
const groupOpen = (time: string, _booked?: number): Tpl => ({
  time,
  status: "group_open",
  classSlug: "reformer",
  capacity: 6,
  booked: 0,
});
const spinning = (time: string): Tpl => ({
  time,
  status: "spinning",
  classSlug: "spinning",
  capacity: 12,
  booked: 0,
});

/* 06:00 – 23:00 arası tüm saatlerin "open" hali (Cmt/Paz için) */
const allOpen = (): Tpl[] =>
  Array.from({ length: 18 }, (_, i) => open(`${String(i + 6).padStart(2, "0")}:00`));

/* ------------------------------------------------------------------ */
/*  WEEKLY_TEMPLATE — JS getDay() index: 0=Pazar, 1=Pzt … 6=Cumartesi  */
/* ------------------------------------------------------------------ */

export const WEEKLY_TEMPLATE: Record<number, Tpl[]> = {
  // ---- PAZARTESİ ----
  1: [
    open("06:00"), open("07:00"), open("08:00"), open("09:00"),
    groupFull("10:00"), priv("11:00"), groupFull("12:00"), priv("13:00"),
    open("14:00"), couple("15:00"), priv("16:00"), groupOpen("17:00", 8),
    open("18:00"), couple("19:00"), groupFull("20:00"), couple("21:00"),
    couple("22:00"), priv("23:00"),
  ],
  // ---- SALI ----
  2: [
    open("06:00"), open("07:00"), priv("08:00"), open("09:00"),
    couple("10:00"), groupFull("11:00"), couple("12:00"), priv("13:00"),
    open("14:00"), open("15:00"), open("16:00"), priv("17:00"),
    groupOpen("18:00", 8), priv("19:00"), spinning("20:00"), groupFull("21:00"),
    couple("22:00"), open("23:00"),
  ],
  // ---- ÇARŞAMBA ----
  3: [
    open("06:00"), priv("07:00"), open("08:00"), groupFull("09:00"),
    groupOpen("10:00", 3), open("11:00"), open("12:00"), priv("13:00"),
    open("14:00"), groupFull("15:00"), priv("16:00"), priv("17:00"),
    priv("18:00"), groupFull("19:00"), groupFull("20:00"), groupFull("21:00"),
    priv("22:00"), groupFull("23:00"),
  ],
  // ---- PERŞEMBE ----
  4: [
    open("06:00"), open("07:00"), open("08:00"), priv("09:00"),
    groupFull("10:00"), open("11:00"), groupOpen("12:00", 3), priv("13:00"),
    groupFull("14:00"), priv("15:00"), priv("16:00"), groupFull("17:00"),
    spinning("18:00"), groupFull("19:00"), groupFull("20:00"), groupFull("21:00"),
    priv("22:00"), priv("23:00"),
  ],
  // ---- CUMA ----
  5: [
    open("06:00"), open("07:00"), priv("08:00"), groupFull("09:00"),
    groupFull("10:00"), groupOpen("11:00", 4), open("12:00"), priv("13:00"),
    priv("14:00"), groupFull("15:00"), priv("16:00"), groupOpen("17:00", 3),
    groupFull("18:00"), groupFull("19:00"), groupFull("20:00"), groupFull("21:00"),
    open("22:00"), open("23:00"),
  ],
  // ---- CUMARTESİ (veri yok → tümü randevuya açık) ----
  6: allOpen(),
  // ---- PAZAR (veri yok → tümü randevuya açık) ----
  0: allOpen(),
};

/* ------------------------------------------------------------------ */
/*  Yerel tarih (UTC kaymasız)                                         */
/* ------------------------------------------------------------------ */
function localISO(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/* ------------------------------------------------------------------ */
/*  generateFallbackSlots — bugünden itibaren `days` gün üretir         */
/* ------------------------------------------------------------------ */
export function generateFallbackSlots(start: Date = new Date(), days = 7): DbSlot[] {
  const out: DbSlot[] = [];
  const base = new Date(start);
  base.setHours(0, 0, 0, 0);

  for (let i = 0; i < days; i++) {
    const day = new Date(base);
    day.setDate(day.getDate() + i);
    const iso = localISO(day);
    const template = WEEKLY_TEMPLATE[day.getDay()] ?? [];

    for (const tpl of template) {
      out.push({
        id: `tpl-${iso}-${tpl.time}`,
        date: iso,
        time: tpl.time,
        duration_min: tpl.status === "spinning" ? 45 : 50,
        class_slug: tpl.classSlug,
        instructor_id: null,
        status: tpl.status,
        capacity: tpl.capacity,
        booked_count: tpl.booked,
        notes: null,
        created_at: EPOCH,
        updated_at: EPOCH,
      });
    }
  }
  return out;
}

/** Geriye dönük uyum — bugünden itibaren 7 günlük üretilmiş şablon. */
export const FALLBACK_SLOTS: DbSlot[] = generateFallbackSlots();
