import { useEffect, useMemo, useState, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X, MessageCircle } from "lucide-react";

import Reveal from "@/components/motion/Reveal";
import { classes as CLASSES } from "@/data/classes";
import { FALLBACK_SLOTS } from "@/data/fallbackSchedule";
import { cn } from "@/lib/utils";
import { useLang } from "@/lib/lang";
import {
  supabase,
  type DbSlot,
  type DbInstructor,
  type SlotStatus,
} from "@/lib/supabase";

const WHATSAPP_NUMBER = "905366711793";

const defaultInstructor: DbInstructor = {
  id: "11111111-1111-1111-1111-111111111111",
  name: "Aleyna Vurmaz",
  role: "Reformer · Mat · Cadillac · Spinning · Prenatal · Özel",
  email: "aleynavrmaz@gmail.com",
  color: "#c89889",
  active: true,
  created_at: "",
};

/* ==================================================================== */
/*  Public Schedule sayfası — Supabase live data + rezervasyon modal     */
/* ==================================================================== */

const DAY_SHORT_TR = ["PAZ", "PZT", "SAL", "ÇAR", "PER", "CUM", "CMT"];
const DAY_SHORT_EN = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

const STATUS_LABEL: Record<SlotStatus, { tr: string; en: string }> = {
  open: { tr: "Boş", en: "Available" },
  group_open: { tr: "Grup · Kontenjan var", en: "Group · Spots left" },
  group_full: { tr: "Grup · Dolu", en: "Group · Full" },
  private: { tr: "Birebir", en: "1:1" },
  couple: { tr: "Couple", en: "Couple" },
  spinning: { tr: "Spinning", en: "Spinning" },
};

function formatDateShort(iso: string) {
  const [, m, d] = iso.split("-");
  if (!m || !d) return iso;
  return `${d}.${m}`;
}
function dayOfWeek(iso: string) {
  return new Date(iso + "T00:00:00").getDay();
}
function formatDateLong(iso: string, lang: "tr" | "en") {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString(lang === "tr" ? "tr-TR" : "en-US", {
    day: "numeric",
    month: "long",
    weekday: "long",
  });
}

function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return (Number.isFinite(hours) ? hours : 0) * 60 + (Number.isFinite(minutes) ? minutes : 0);
}

function localISODate(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function mergeSlots(primary: DbSlot[], fallback: DbSlot[]) {
  const map = new Map<string, DbSlot>();
  for (const slot of fallback) {
    map.set(`${slot.date} ${slot.time}`, slot);
  }
  for (const slot of primary) {
    map.set(`${slot.date} ${slot.time}`, slot);
  }
  return [...map.values()].sort((a, b) => {
    const byDate = a.date.localeCompare(b.date);
    return byDate !== 0 ? byDate : timeToMinutes(a.time) - timeToMinutes(b.time);
  });
}

/* -------------------------------------------------------------------- */

export default function Schedule() {
  const { t, lang } = useLang();
  const [slots, setSlots] = useState<DbSlot[]>([]);
  const [instructors, setInstructors] = useState<DbInstructor[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDayIdx, setActiveDayIdx] = useState(0);
  const [classFilter, setClassFilter] = useState<string>("");
  const [reserveSlot, setReserveSlot] = useState<DbSlot | null>(null);

  async function loadSlots() {
    if (!supabase) {
      setSlots(FALLBACK_SLOTS);
      return;
    }
    const today = localISODate();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 14);
    const future = localISODate(futureDate);
    const { data } = await supabase
      .from("slots")
      .select("*")
      .gte("date", today)
      .lte("date", future)
      .order("date")
      .order("time");
    const nextSlots = (data as DbSlot[]) ?? [];
    setSlots(nextSlots.length > 0 ? mergeSlots(nextSlots, FALLBACK_SLOTS) : FALLBACK_SLOTS);
  }

  useEffect(() => {
    if (!supabase) {
      setSlots(FALLBACK_SLOTS);
      setLoading(false);
      return;
    }
    let active = true;
    (async () => {
      await loadSlots();
      const { data: i } = await supabase!.from("instructors").select("*").eq("active", true);
      if (!active) return;
      setInstructors((i as DbInstructor[]) ?? []);
      setLoading(false);
    })();

    const ch = supabase
      .channel("public-slots")
      .on("postgres_changes", { event: "*", schema: "public", table: "slots" }, () => {
        void loadSlots();
      })
      .subscribe();

    return () => {
      active = false;
      void supabase!.removeChannel(ch);
    };
  }, []);

  const days = useMemo(() => {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const s of slots) {
      if (!seen.has(s.date)) {
        seen.add(s.date);
        out.push(s.date);
      }
    }
    return out.slice(0, 7);
  }, [slots]);

  const activeDate = days[activeDayIdx];

  const filteredSlots = useMemo(() => {
    if (!activeDate) return [];
    return slots
      .filter((s) => s.date === activeDate)
      .filter((s) => !classFilter || s.class_slug === classFilter)
      .sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time));
  }, [slots, activeDate, classFilter]);

  return (
    <section className="pt-[clamp(120px,16vw,180px)] pb-[var(--pad-y)] bg-background min-h-screen">
      <div className="max-w-site mx-auto px-[var(--pad-x)]">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 pb-10">
          <div>
            <span className="block text-[0.7rem] uppercase tracking-[0.22em] text-vc-accent font-medium">
              {t("schedule.eyebrow")}
            </span>
            <h1 className="font-serif text-[clamp(2.6rem,7vw,6rem)] leading-[1] tracking-[-0.02em] mt-3">
              {t("schedule.title")}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="appearance-none rounded-none border border-foreground/20 bg-background pl-4 pr-10 py-2.5 text-[0.78rem] uppercase tracking-[0.18em] cursor-pointer focus:border-foreground outline-none"
            >
              <option value="">{t("schedule.classType")}</option>
              {CLASSES.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.title[lang]}
                </option>
              ))}
            </select>
            <select
              disabled
              className="appearance-none rounded-none border border-foreground/20 bg-background pl-4 pr-10 py-2.5 text-[0.78rem] uppercase tracking-[0.18em] opacity-60"
            >
              <option>{t("schedule.room")}</option>
            </select>
            {classFilter && (
              <button
                onClick={() => setClassFilter("")}
                className="inline-flex items-center gap-1.5 text-[0.78rem] uppercase tracking-[0.18em] text-foreground/60 hover:text-foreground transition"
              >
                <X strokeWidth={1.5} className="w-3.5 h-3.5" />
                {t("schedule.clear")}
              </button>
            )}
          </div>
        </div>

        {loading && (
          <p className="py-16 text-center text-foreground/50 text-sm uppercase tracking-[0.18em]">
            {lang === "tr" ? "Yükleniyor…" : "Loading…"}
          </p>
        )}

        {!loading && days.length === 0 && (
          <p className="py-16 text-center text-foreground/50 text-sm">
            {lang === "tr"
              ? "Henüz program yayınlanmadı. Yakında burada olacak."
              : "Schedule not published yet. Coming soon."}
          </p>
        )}

        {!loading && days.length > 0 && (
          <>
            <div className="flex items-stretch border-y border-foreground/10">
              <button
                onClick={() => setActiveDayIdx((i) => Math.max(0, i - 1))}
                disabled={activeDayIdx === 0}
                className="shrink-0 px-3 sm:px-4 border-r border-foreground/10 hover:bg-muted disabled:opacity-30 transition"
                aria-label="prev"
              >
                <ChevronLeft strokeWidth={1.5} className="w-4 h-4" />
              </button>
              {/* Mobil: yatay kaydırılır, her gün rahat genişlikte. md+: 7'li grid. */}
              <div className="flex flex-1 overflow-x-auto divide-x divide-foreground/10 [-ms-overflow-style:none] [scrollbar-width:none] md:grid md:grid-cols-7 md:overflow-visible">
                {days.map((d, i) => {
                  const isActive = i === activeDayIdx;
                  const dow = dayOfWeek(d);
                  const labels = lang === "tr" ? DAY_SHORT_TR : DAY_SHORT_EN;
                  return (
                    <button
                      key={d}
                      onClick={() => setActiveDayIdx(i)}
                      className={cn(
                        "flex min-w-[4rem] flex-1 flex-col items-center justify-center gap-1 px-2 py-3.5 transition md:min-w-0",
                        isActive ? "bg-foreground text-background" : "hover:bg-muted",
                      )}
                    >
                      <span className="whitespace-nowrap text-[0.65rem] uppercase tracking-[0.18em] opacity-70">
                        {formatDateShort(d)}
                      </span>
                      <span className="whitespace-nowrap font-serif text-[1.1rem] tracking-[-0.01em]">
                        {labels[dow]}
                      </span>
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => setActiveDayIdx((i) => Math.min(days.length - 1, i + 1))}
                disabled={activeDayIdx === days.length - 1}
                className="shrink-0 px-3 sm:px-4 border-l border-foreground/10 hover:bg-muted disabled:opacity-30 transition"
                aria-label="next"
              >
                <ChevronRight strokeWidth={1.5} className="w-4 h-4" />
              </button>
            </div>

            {activeDate && (
              <div className="flex items-center justify-between bg-muted px-6 py-4 border-b border-foreground/10">
                <span className="font-serif text-[1.05rem] tracking-[-0.01em] capitalize">
                  {formatDateLong(activeDate, lang)}
                </span>
                <button
                  onClick={() => setActiveDayIdx(0)}
                  className="text-[0.78rem] uppercase tracking-[0.18em] text-foreground/60 hover:text-foreground transition"
                >
                  {t("schedule.today")}
                </button>
              </div>
            )}

            <Reveal>
              <AnimatePresence mode="wait">
                <motion.ul
                  key={(activeDate ?? "") + classFilter}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.3 }}
                  className="divide-y divide-foreground/10"
                >
                  {filteredSlots.length === 0 && (
                    <li className="py-16 text-center text-foreground/50 text-[0.95rem]">
                      {t("schedule.noSlots")}
                    </li>
                  )}
                  {filteredSlots.map((s) => (
                    <SlotRow
                      key={s.id}
                      slot={s}
                      instructor={instructors.find((i) => i.id === s.instructor_id) ?? defaultInstructor}
                      onReserve={() => setReserveSlot(s)}
                      lang={lang}
                      tRoom={t("schedule.roomLabel")}
                      tRoomVal={t("schedule.roomValue")}
                    />
                  ))}
                </motion.ul>
              </AnimatePresence>
            </Reveal>
          </>
        )}
      </div>

      {reserveSlot && (
        <ReserveModal
          slot={reserveSlot}
          instructor={instructors.find((i) => i.id === reserveSlot.instructor_id) ?? defaultInstructor}
          onClose={() => setReserveSlot(null)}
          lang={lang}
        />
      )}
    </section>
  );
}

/* -------------------------------------------------------------------- */

function SlotRow({
  slot,
  instructor,
  onReserve,
  lang,
  tRoom,
  tRoomVal,
}: {
  slot: DbSlot;
  instructor?: DbInstructor;
  onReserve: () => void;
  lang: "tr" | "en";
  tRoom: string;
  tRoomVal: string;
}) {
  const klass = CLASSES.find((c) => c.slug === slot.class_slug);
  const klassTitle = klass ? klass.title[lang] : "—";

  const isReservable =
    slot.status === "open" ||
    slot.status === "group_open" ||
    slot.status === "spinning";

  const statusLabel = STATUS_LABEL[slot.status][lang];

  return (
    <li className="grid grid-cols-12 gap-3 lg:gap-6 items-center py-6 px-2 lg:px-6 hover:bg-muted/40 transition">
      <div className="col-span-3 lg:col-span-2">
        <span className="font-serif text-[clamp(1.5rem,3vw,2.4rem)] tracking-[-0.01em] leading-none block">
          {slot.time.slice(0, 5)}
        </span>
        <span className="text-[0.65rem] uppercase tracking-[0.22em] text-foreground/50 mt-1 block">
          {slot.duration_min} {lang === "tr" ? "dk" : "min"}
        </span>
      </div>

      <div className="col-span-3 lg:col-span-2 hidden md:block">
        <span className="text-[0.65rem] uppercase tracking-[0.22em] text-foreground/50">
          {tRoom}
        </span>
        <span className="block text-[0.92rem] mt-1">{tRoomVal}</span>
      </div>

      <div className="col-span-9 lg:col-span-5 flex items-center gap-3 lg:gap-4">
        {instructor && (
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center text-[0.78rem] font-semibold shrink-0"
            style={{
              background: (instructor.color ?? "#c89889") + "22",
              color: instructor.color ?? "#c89889",
            }}
          >
            {instructor.name
              .split(" ")
              .map((n) => n[0])
              .slice(0, 2)
              .join("")
              .toUpperCase()}
          </div>
        )}
        <div>
          <span className="block font-medium text-[0.95rem]">
            {instructor?.name ?? (lang === "tr" ? "Eğitmen TBA" : "Instructor TBA")}
          </span>
          <span className="block text-[0.78rem] uppercase tracking-[0.18em] text-foreground/55 mt-0.5">
            {klassTitle} · {statusLabel}
          </span>
        </div>
      </div>

      <div className="col-span-12 lg:col-span-3 flex justify-end">
        <button
          onClick={onReserve}
          disabled={!isReservable}
          className={cn(
            "rounded-none px-6 py-3 text-[0.78rem] uppercase tracking-[0.18em] font-medium border transition w-full lg:w-auto",
            isReservable
              ? "border-foreground text-foreground hover:bg-foreground hover:text-background"
              : "border-foreground/20 text-foreground/40 cursor-not-allowed",
          )}
        >
          {isReservable
            ? lang === "tr"
              ? "REZERVASYON"
              : "RESERVE"
            : lang === "tr"
              ? "DOLU"
              : "FULL"}
        </button>
      </div>
    </li>
  );
}

/* -------------------------------------------------------------------- */

function ReserveModal({
  slot,
  instructor,
  onClose,
  lang,
}: {
  slot: DbSlot;
  instructor?: DbInstructor;
  onClose: () => void;
  lang: "tr" | "en";
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const klass = CLASSES.find((c) => c.slug === slot.class_slug);
  const klassTitle = klass ? klass.title[lang] : "—";

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    // Şablon (fallback) slot id'si "tpl-" ile başlar — DB'de gerçek kaydı yok,
    // Supabase'e yazılamaz. Yalnızca admin panelinden girilen gerçek (UUID)
    // slotlar reservations tablosuna kaydedilir; şablon slotlar WhatsApp'tan gider.
    const isRealSlot = !slot.id.startsWith("tpl-");

    // Pending kaydı sisteme yazmaya çalış. Başarısız olsa bile WhatsApp akışı
    // engellenmez — rezervasyonun gerçek onayı zaten WhatsApp üzerinden yapılıyor,
    // DB kaydı yalnızca admin paneli için bir kolaylık. Hata konsola düşer.
    if (supabase && isRealSlot) {
      const { error: err } = await supabase.from("reservations").insert({
        slot_id: slot.id,
        member_name: name.trim(),
        member_phone: phone.trim(),
        message: message.trim() || null,
        status: "pending",
      });
      if (err) {
        console.error("Rezervasyon kaydı yazılamadı:", err.message, err);
      }
    }

    const whenStr = `${formatDateLong(slot.date, lang)} · ${slot.time.slice(0, 5)}`;
    const lines =
      lang === "tr"
        ? [
            `Merhaba, rezervasyon talebim:`,
            `Tarih: ${whenStr}`,
            `Ders: ${klassTitle}`,
            instructor ? `Eğitmen: ${instructor.name}` : "",
            `Ad: ${name}`,
            `Telefon: ${phone}`,
            message ? `Not: ${message}` : "",
          ]
        : [
            `Hello, my reservation request:`,
            `Date: ${whenStr}`,
            `Class: ${klassTitle}`,
            instructor ? `Instructor: ${instructor.name}` : "",
            `Name: ${name}`,
            `Phone: ${phone}`,
            message ? `Note: ${message}` : "",
          ];
    const text = lines.filter(Boolean).join("\n");
    window.open(
      `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`,
      "_blank",
    );

    setSuccess(true);
    setSubmitting(false);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-background border border-foreground/20 max-w-md w-full p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-6">
          <div>
            <span className="text-[0.7rem] uppercase tracking-[0.22em] text-vc-accent font-semibold">
              {lang === "tr" ? "Rezervasyon" : "Reservation"}
            </span>
            <h3 className="font-serif text-[1.4rem] tracking-[-0.02em] mt-1">{klassTitle}</h3>
            <p className="text-foreground/60 text-sm mt-1">
              {formatDateLong(slot.date, lang)} · {slot.time.slice(0, 5)}
              {instructor ? ` · ${instructor.name}` : ""}
            </p>
          </div>
          <button onClick={onClose} aria-label="close">
            <X strokeWidth={1.5} className="w-5 h-5 text-foreground/60 hover:text-foreground" />
          </button>
        </div>

        {success ? (
          <div className="py-4 text-center">
            <MessageCircle
              strokeWidth={1.5}
              className="w-10 h-10 text-vc-accent mx-auto mb-4"
            />
            <p className="text-foreground font-medium">
              {lang === "tr" ? "Talep alındı!" : "Request received!"}
            </p>
            <p className="text-foreground/70 text-sm mt-2 leading-relaxed">
              {lang === "tr"
                ? "WhatsApp ile mesajı göndererek onay sürecini tamamlayın. Onaylanınca slot doluya geçecek."
                : "Send the WhatsApp message to complete confirmation. The slot becomes full once approved."}
            </p>
            <button
              onClick={onClose}
              className="mt-6 text-[0.78rem] uppercase tracking-[0.18em] text-foreground/60 hover:text-foreground transition"
            >
              {lang === "tr" ? "Kapat" : "Close"}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block">
              <span className="text-[0.7rem] uppercase tracking-[0.22em] text-vc-accent">
                {lang === "tr" ? "AD SOYAD" : "FULL NAME"}
              </span>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-2 w-full bg-transparent border-b border-foreground/30 py-2 focus:border-foreground outline-none transition"
              />
            </label>
            <label className="block">
              <span className="text-[0.7rem] uppercase tracking-[0.22em] text-vc-accent">
                {lang === "tr" ? "TELEFON" : "PHONE"}
              </span>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+90 ..."
                className="mt-2 w-full bg-transparent border-b border-foreground/30 py-2 focus:border-foreground outline-none transition"
              />
            </label>
            <label className="block">
              <span className="text-[0.7rem] uppercase tracking-[0.22em] text-vc-accent">
                {lang === "tr" ? "NOT (opsiyonel)" : "NOTE (optional)"}
              </span>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={2}
                className="mt-2 w-full bg-transparent border-b border-foreground/30 py-2 focus:border-foreground outline-none transition resize-none"
              />
            </label>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 rounded-none bg-foreground text-background px-6 py-4 text-[0.78rem] uppercase tracking-[0.18em] font-medium hover:opacity-90 disabled:opacity-50 transition"
            >
              <MessageCircle strokeWidth={1.5} className="w-4 h-4" />
              {submitting
                ? lang === "tr"
                  ? "Gönderiliyor…"
                  : "Sending…"
                : lang === "tr"
                  ? "Talep Gönder + WhatsApp Aç"
                  : "Send + Open WhatsApp"}
            </button>

            <p className="text-[0.7rem] text-foreground/50 leading-relaxed">
              {lang === "tr"
                ? "Talebin sisteme bekleyen olarak kaydedilir. WhatsApp'tan mesaj gönderdiğinde Aleyna onaylayınca rezervasyon kesinleşir."
                : "Your request is recorded as pending. Once you send the WhatsApp message and Aleyna confirms, the reservation is finalized."}
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------- */

function NotConfiguredMessage({ lang }: { lang: "tr" | "en" }) {
  return (
    <section className="min-h-screen flex items-center justify-center bg-background px-[var(--pad-x)] text-center">
      <div className="max-w-md">
        <span className="text-[0.7rem] uppercase tracking-[0.22em] text-vc-accent font-semibold">
          {lang === "tr" ? "PROGRAM" : "SCHEDULE"}
        </span>
        <p className="font-serif text-[1.4rem] tracking-[-0.01em] mt-4 leading-snug">
          {lang === "tr" ? "Program yakında burada olacak." : "Schedule coming soon."}
        </p>
      </div>
    </section>
  );
}

void NotConfiguredMessage;
