import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import {
  supabase,
  supabaseConfigured,
  ADMIN_EMAILS,
  type DbInstructor,
  type DbSlot,
  type DbReservation,
  type SlotStatus,
} from "@/lib/supabase";
import { cn } from "@/lib/utils";

/* ==================================================================== */
/*  Alleyfit Admin Panel                                                  */
/*  Tek sayfa: login → tabs (Program · Rezervasyonlar · Eğitmenler)      */
/* ==================================================================== */

type Tab = "schedule" | "reservations" | "instructors" | "template";

export type DbTemplateSlot = {
  id: string;
  day_of_week: number;
  time: string;
  duration_min: number;
  class_slug: string | null;
  instructor_id: string | null;
  status: SlotStatus;
  capacity: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

const SLOT_STATUS_LABEL: Record<SlotStatus, string> = {
  open: "Boş",
  group_open: "Grup (kontenjan var)",
  group_full: "Grup (dolu)",
  private: "Birebir",
  couple: "Couple",
  spinning: "Spinning",
};

const SLOT_STATUS_BG: Record<SlotStatus, string> = {
  open: "bg-background border border-vc-accent/40 text-foreground",
  group_open: "bg-vc-accent/15 text-vc-accent border border-vc-accent",
  group_full: "bg-foreground text-background",
  private: "bg-secondary border border-foreground/30 text-foreground",
  couple: "bg-secondary border border-foreground/30 text-foreground italic",
  spinning: "bg-vc-accent text-background",
};

/* -------------------------------------------------------------------- */

export default function Admin() {
  const [email, setEmail] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const [tab, setTab] = useState<Tab>("schedule");

  // Auth oturumunu kontrol et
  useEffect(() => {
    if (!supabase) {
      setChecking(false);
      return;
    }
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setEmail(data.session?.user.email?.toLowerCase() ?? null);
      setChecking(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setEmail(session?.user.email?.toLowerCase() ?? null);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  if (!supabaseConfigured) {
    return <BackendNotConfigured />;
  }
  if (checking) {
    return <FullScreenMessage text="Yükleniyor…" />;
  }
  if (!email || !ADMIN_EMAILS.includes(email)) {
    return <LoginScreen unauthorizedEmail={email} />;
  }

  return (
    <section className="min-h-screen bg-background pt-28 pb-24">
      <div className="max-w-site mx-auto px-[var(--pad-x)]">
        <header className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 pb-10 border-b border-foreground/10">
          <div>
            <span className="text-[0.7rem] uppercase tracking-[0.22em] text-vc-accent font-semibold">
              ADMİN PANELİ
            </span>
            <h1 className="font-serif text-[clamp(2rem,5vw,4rem)] tracking-[-0.02em] mt-2">
              Alleyfit Wellness Studio
            </h1>
            <p className="text-foreground/60 text-sm mt-1">{email}</p>
          </div>
          <div className="flex items-center gap-3">
            <TabButton current={tab} setTab={setTab} value="schedule" label="Program" />
            <TabButton current={tab} setTab={setTab} value="reservations" label="Rezervasyonlar" />
            <TabButton current={tab} setTab={setTab} value="instructors" label="Eğitmenler" />
            <TabButton current={tab} setTab={setTab} value="template" label="Şablon Düzenle" />
            <button
              onClick={() => supabase?.auth.signOut()}
              className="ml-2 text-[0.7rem] uppercase tracking-[0.22em] text-foreground/50 hover:text-foreground transition"
            >
              Çıkış
            </button>
          </div>
        </header>

        <main className="pt-10">
          {tab === "schedule" && <ScheduleTab />}
          {tab === "reservations" && <ReservationsTab />}
          {tab === "instructors" && <InstructorsTab />}
          {tab === "template" && <TemplateTab />}
        </main>

        <div className="mt-16 text-[0.7rem] uppercase tracking-[0.22em] text-foreground/40">
          <Link to="/" className="hover:text-foreground transition">← Anasayfaya dön</Link>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------- */
/*  Auth — magic link login                                              */
/* -------------------------------------------------------------------- */

function LoginScreen({ unauthorizedEmail }: { unauthorizedEmail: string | null }) {
  const [emailInput, setEmailInput] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [linkSent, setLinkSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** E-posta admin listesinde mi? Değilse hata yazıp null döner. */
  function validEmail(): string | null {
    const trimmed = emailInput.trim().toLowerCase();
    if (!ADMIN_EMAILS.includes(trimmed)) {
      setError("Bu e-posta admin listesinde yok.");
      return null;
    }
    return trimmed;
  }

  // Şifreyle giriş — anında, e-posta gönderilmez.
  async function handlePasswordLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLinkSent(false);
    if (!supabase) return;
    const trimmed = validEmail();
    if (!trimmed) return;
    setLoading(true);
    const { error: err } = await supabase.auth.signInWithPassword({
      email: trimmed,
      password,
    });
    setLoading(false);
    if (err) {
      setError("E-posta veya şifre hatalı.");
      return;
    }
    // Başarılı → onAuthStateChange panel açar.
  }

  // Magic-link — e-posta ile giriş bağlantısı (yedek yöntem).
  async function handleMagicLink() {
    setError(null);
    if (!supabase) return;
    const trimmed = validEmail();
    if (!trimmed) return;
    setLoading(true);
    const { error: err } = await supabase.auth.signInWithOtp({
      email: trimmed,
      options: { emailRedirectTo: window.location.origin + "/admin" },
    });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    setLinkSent(true);
  }

  return (
    <section className="min-h-screen flex flex-col items-center justify-center bg-background px-[var(--pad-x)]">
      <div className="max-w-md w-full">
        <span className="text-[0.7rem] uppercase tracking-[0.22em] text-vc-accent font-semibold">
          ADMİN GİRİŞ
        </span>
        <h1 className="font-serif text-[clamp(2rem,5vw,3.5rem)] tracking-[-0.02em] mt-3">
          Yönetim paneline gir.
        </h1>
        <p className="text-foreground/60 mt-4">
          E-posta ve şifrenle giriş yap. Şifren yoksa e-posta ile giriş bağlantısı alabilirsin.
        </p>

        {unauthorizedEmail ? (
          <p className="mt-6 text-sm text-destructive">
            “{unauthorizedEmail}” hesabı admin listesinde değil. Doğru hesapla giriş yap.
          </p>
        ) : null}

        <form onSubmit={handlePasswordLogin} className="mt-8 space-y-4">
          <label className="block">
            <span className="text-[0.7rem] uppercase tracking-[0.22em] text-vc-accent">E-POSTA</span>
            <input
              type="email"
              required
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="aleynavrmaz@gmail.com"
              className="mt-2 w-full bg-transparent border-b border-foreground/30 py-3 focus:border-foreground outline-none transition"
            />
          </label>
          <label className="block">
            <span className="text-[0.7rem] uppercase tracking-[0.22em] text-vc-accent">ŞİFRE</span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-2 w-full bg-transparent border-b border-foreground/30 py-3 focus:border-foreground outline-none transition"
            />
          </label>

          {error && <p className="text-sm text-destructive">{error}</p>}
          {linkSent && (
            <p className="text-sm text-vc-accent">
              Giriş bağlantısı e-postana gönderildi. Bağlantıya bu cihazdan tıkla.
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-none bg-foreground text-background px-7 py-4 text-[0.78rem] uppercase tracking-[0.18em] font-medium hover:opacity-90 disabled:opacity-50 transition"
          >
            {loading ? "Lütfen bekle…" : "Giriş Yap"}
          </button>
        </form>

        <div className="mt-6 flex items-center gap-3 text-foreground/30">
          <span className="h-px flex-1 bg-border" />
          <span className="text-[0.62rem] uppercase tracking-[0.22em]">veya</span>
          <span className="h-px flex-1 bg-border" />
        </div>

        <button
          type="button"
          onClick={handleMagicLink}
          disabled={loading}
          className="mt-6 w-full rounded-none border border-foreground/30 px-7 py-4 text-[0.78rem] uppercase tracking-[0.18em] font-medium hover:border-foreground disabled:opacity-50 transition"
        >
          E-posta ile giriş bağlantısı gönder
        </button>

        <p className="mt-10 text-[0.7rem] uppercase tracking-[0.22em] text-foreground/40">
          <Link to="/" className="hover:text-foreground transition">← Anasayfaya dön</Link>
        </p>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------- */
/*  Tab 1 — Program (haftalık grid + slot edit)                          */
/* -------------------------------------------------------------------- */

function ScheduleTab() {
  const [weekStart, setWeekStart] = useState<Date>(() => startOfWeek(new Date()));
  const [slots, setSlots] = useState<DbSlot[]>([]);
  const [instructors, setInstructors] = useState<DbInstructor[]>([]);
  const [classes, setClasses] = useState<{ slug: string; title_tr: string }[]>([]);
  const [editing, setEditing] = useState<DbSlot | null>(null);
  const [creating, setCreating] = useState<{ date: string; time: string } | null>(null);
  const [populating, setPopulating] = useState(false);

  async function populateFromTemplate() {
    if (!supabase) return;
    if (
      !confirm(
        "Bu işlem seçili haftadaki boş saatleri veritabanı şablonuyla dolduracaktır. Emin misiniz?"
      )
    )
      return;

    setPopulating(true);
    try {
      // Şablon slotlarını veritabanından çek
      const { data: tplSlots, error: tplError } = await supabase
        .from("template_slots")
        .select("*");
      if (tplError) {
        alert("Haftalık şablon veritabanından çekilemedi: " + tplError.message);
        return;
      }
      if (!tplSlots || tplSlots.length === 0) {
        alert("Şablon veritabanı boş! Lütfen önce 'Şablon Düzenle' sekmesinden şablon oluşturun.");
        return;
      }

      const slotsToInsert = [];
      const defaultInstructorId = "11111111-1111-1111-1111-111111111111"; // Aleyna Vurmaz ID

      for (const day of days) {
        const iso = isoDate(day);
        const dayIdx = day.getDay();
        const dayTemplates = tplSlots.filter((ts) => ts.day_of_week === dayIdx);

        for (const tpl of dayTemplates) {
          const exists = findSlot(iso, tpl.time);
          if (!exists) {
            slotsToInsert.push({
              date: iso,
              time: tpl.time,
              duration_min: tpl.duration_min,
              class_slug: tpl.class_slug,
              instructor_id: tpl.instructor_id || defaultInstructorId,
              status: tpl.status,
              capacity: tpl.capacity,
              booked_count: 0,
              notes: tpl.notes,
            });
          }
        }
      }

      if (slotsToInsert.length > 0) {
        const { error } = await supabase.from("slots").insert(slotsToInsert);
        if (error) {
          alert("Şablon yüklenirken hata oluştu: " + error.message);
        } else {
          alert(`${slotsToInsert.length} adet slot başarıyla oluşturuldu.`);
          void loadWeek();
        }
      } else {
        alert("Bu haftadaki tüm slotlar zaten tanımlı.");
      }
    } catch (err: any) {
      alert("Hata: " + err.message);
    } finally {
      setPopulating(false);
    }
  }

  const HOURS = Array.from({ length: 18 }, (_, i) => String(i + 6).padStart(2, "0") + ":00");
  const days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      return d;
    });
  }, [weekStart]);

  async function loadWeek() {
    if (!supabase) return;
    const firstISO = isoDate(days[0]);
    const lastISO = isoDate(days[6]);
    const { data: s } = await supabase
      .from("slots")
      .select("*")
      .gte("date", firstISO)
      .lte("date", lastISO)
      .order("date")
      .order("time");
    setSlots((s as DbSlot[]) ?? []);
    const { data: i } = await supabase.from("instructors").select("*").eq("active", true);
    setInstructors((i as DbInstructor[]) ?? []);
    const { data: c } = await supabase.from("classes").select("slug,title_tr").order("title_tr");
    setClasses((c as { slug: string; title_tr: string }[]) ?? []);
  }

  useEffect(() => {
    void loadWeek();
    // Realtime subscription — başka admin değiştirirse anında güncelle
    if (!supabase) return;
    const channel = supabase
      .channel("admin-slots")
      .on("postgres_changes", { event: "*", schema: "public", table: "slots" }, () => void loadWeek())
      .subscribe();
    return () => {
      void supabase?.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekStart]);

  function findSlot(date: string, time: string) {
    return slots.find((s) => s.date === date && s.time.startsWith(time));
  }

  return (
    <div>
      {/* Hafta navigatörü */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => setWeekStart((d) => addDays(d, -7))}
          className="text-[0.78rem] uppercase tracking-[0.18em] text-foreground/60 hover:text-foreground transition"
        >
          ← Önceki Hafta
        </button>
        <span className="font-serif text-[1.4rem] tracking-[-0.01em]">
          {formatDateTR(days[0])} — {formatDateTR(days[6])}
        </span>
        <button
          onClick={() => setWeekStart((d) => addDays(d, 7))}
          className="text-[0.78rem] uppercase tracking-[0.18em] text-foreground/60 hover:text-foreground transition"
        >
          Sonraki Hafta →
        </button>
      </div>

      {/* Hızlı Eylemler */}
      <div className="flex justify-end mb-4">
        <button
          onClick={populateFromTemplate}
          disabled={populating}
          className="rounded-none border border-foreground/20 text-foreground/75 px-4 py-2 text-[0.7rem] uppercase tracking-[0.18em] hover:border-foreground hover:text-foreground disabled:opacity-50 transition"
        >
          {populating ? "Şablon Uygulanıyor..." : "Şablondan Haftayı Doldur"}
        </button>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr>
              <th className="sticky left-0 bg-background border border-foreground/10 px-2 py-2 text-[0.65rem] uppercase tracking-[0.18em] text-foreground/50 w-16">
                Saat
              </th>
              {days.map((d) => (
                <th key={d.toISOString()} className="border border-foreground/10 px-2 py-2 text-center">
                  <div className="text-[0.65rem] uppercase tracking-[0.18em] text-foreground/50">
                    {DAY_SHORT[d.getDay()]}
                  </div>
                  <div className="font-serif text-[1rem] mt-1">{d.getDate()}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {HOURS.map((hour) => (
              <tr key={hour}>
                <td className="sticky left-0 bg-background border border-foreground/10 px-2 py-2 font-mono text-[0.7rem]">
                  {hour}
                </td>
                {days.map((d) => {
                  const dateISO = isoDate(d);
                  const slot = findSlot(dateISO, hour);
                  return (
                    <td key={dateISO + hour} className="border border-foreground/10 p-1 align-top">
                      {slot ? (
                        <button
                          onClick={() => setEditing(slot)}
                          className={cn(
                            "w-full text-left px-2 py-1.5 transition hover:opacity-80",
                            SLOT_STATUS_BG[slot.status],
                          )}
                          title={SLOT_STATUS_LABEL[slot.status]}
                        >
                          <div className="text-[0.62rem] uppercase tracking-[0.12em] opacity-80">
                            {SLOT_STATUS_LABEL[slot.status]}
                          </div>
                          {slot.class_slug && (
                            <div className="text-[0.7rem] font-medium mt-0.5">
                              {classes.find((c) => c.slug === slot.class_slug)?.title_tr ?? slot.class_slug}
                            </div>
                          )}
                          {slot.capacity > 1 && (
                            <div className="text-[0.62rem] opacity-70 mt-0.5">
                              {slot.booked_count}/{slot.capacity}
                            </div>
                          )}
                        </button>
                      ) : (
                        <button
                          onClick={() => setCreating({ date: dateISO, time: hour })}
                          className="w-full text-left px-2 py-1.5 text-foreground/30 hover:bg-muted hover:text-foreground transition"
                        >
                          + Slot
                        </button>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modallar */}
      {editing && (
        <SlotEditModal
          slot={editing}
          instructors={instructors}
          classes={classes}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            void loadWeek();
          }}
        />
      )}
      {creating && (
        <SlotEditModal
          newSlotDateTime={creating}
          instructors={instructors}
          classes={classes}
          onClose={() => setCreating(null)}
          onSaved={() => {
            setCreating(null);
            void loadWeek();
          }}
        />
      )}
    </div>
  );
}

/* Slot edit / create modal */
function SlotEditModal({
  slot,
  newSlotDateTime,
  instructors,
  classes,
  onClose,
  onSaved,
}: {
  slot?: DbSlot;
  newSlotDateTime?: { date: string; time: string };
  instructors: DbInstructor[];
  classes: { slug: string; title_tr: string }[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const isNew = !slot;
  const [status, setStatus] = useState<SlotStatus>(slot?.status ?? "open");
  const [classSlug, setClassSlug] = useState<string>(slot?.class_slug ?? "");
  const [instructorId, setInstructorId] = useState<string>(
    slot?.instructor_id ?? instructors[0]?.id ?? "",
  );
  const [capacity, setCapacity] = useState<number>(slot?.capacity ?? 12);
  const [notes, setNotes] = useState<string>(slot?.notes ?? "");
  const [saving, setSaving] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringWeeks, setRecurringWeeks] = useState(4);

  async function save() {
    if (!supabase) return;
    setSaving(true);
    const payload = {
      status,
      class_slug: classSlug || null,
      instructor_id: instructorId || null,
      capacity,
      notes: notes || null,
    };
    if (isNew && newSlotDateTime) {
      if (isRecurring) {
        const slotsToInsert = [];
        for (let i = 0; i < recurringWeeks; i++) {
          const dateObj = new Date(newSlotDateTime.date + "T00:00:00");
          const nextDateObj = addDays(dateObj, i * 7);
          slotsToInsert.push({
            ...payload,
            date: isoDate(nextDateObj),
            time: newSlotDateTime.time,
            duration_min: 50,
          });
        }
        await supabase.from("slots").insert(slotsToInsert);
      } else {
        await supabase.from("slots").insert({
          ...payload,
          date: newSlotDateTime.date,
          time: newSlotDateTime.time,
          duration_min: 50,
        });
      }
    } else if (slot) {
      await supabase.from("slots").update(payload).eq("id", slot.id);
    }
    setSaving(false);
    onSaved();
  }

  async function remove() {
    if (!supabase || !slot) return;
    if (!confirm("Bu slot silinsin mi?")) return;
    await supabase.from("slots").delete().eq("id", slot.id);
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4" onClick={onClose}>
      <div
        className="bg-background border border-foreground/20 max-w-md w-full p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-serif text-[1.4rem] tracking-[-0.02em]">
          {isNew ? "Yeni Slot" : "Slot Düzenle"}
        </h3>
        <p className="text-foreground/60 text-sm mt-1">
          {slot?.date ?? newSlotDateTime?.date} · {slot?.time?.slice(0, 5) ?? newSlotDateTime?.time}
        </p>

        <div className="mt-6 space-y-4">
          <label className="block">
            <span className="text-[0.7rem] uppercase tracking-[0.22em] text-vc-accent">DURUM</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as SlotStatus)}
              className="mt-2 w-full bg-transparent border-b border-foreground/30 py-2 outline-none"
            >
              {Object.entries(SLOT_STATUS_LABEL).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-[0.7rem] uppercase tracking-[0.22em] text-vc-accent">DERS TÜRÜ</span>
            <select
              value={classSlug}
              onChange={(e) => setClassSlug(e.target.value)}
              className="mt-2 w-full bg-transparent border-b border-foreground/30 py-2 outline-none"
            >
              <option value="">(yok)</option>
              {classes.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.title_tr}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-[0.7rem] uppercase tracking-[0.22em] text-vc-accent">EĞİTMEN</span>
            <select
              value={instructorId}
              onChange={(e) => setInstructorId(e.target.value)}
              className="mt-2 w-full bg-transparent border-b border-foreground/30 py-2 outline-none"
            >
              {instructors.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-[0.7rem] uppercase tracking-[0.22em] text-vc-accent">KAPASİTE</span>
            <input
              type="number"
              min={1}
              max={20}
              value={capacity}
              onChange={(e) => setCapacity(Number(e.target.value))}
              className="mt-2 w-full bg-transparent border-b border-foreground/30 py-2 outline-none"
            />
          </label>

          <label className="block">
            <span className="text-[0.7rem] uppercase tracking-[0.22em] text-vc-accent">NOT (opsiyonel)</span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="mt-2 w-full bg-transparent border-b border-foreground/30 py-2 outline-none resize-none"
            />
          </label>

          {isNew && (
            <div className="space-y-4 pt-4 border-t border-foreground/10">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                  className="rounded-none border-foreground/30 text-foreground focus:ring-0 w-4 h-4 cursor-pointer"
                />
                <span className="text-[0.7rem] uppercase tracking-[0.22em] text-vc-accent select-none cursor-pointer">
                  Yinele (Her hafta tekrar et)
                </span>
              </label>

              {isRecurring && (
                <label className="block">
                  <span className="text-[0.7rem] uppercase tracking-[0.22em] text-vc-accent">
                    Tekrar Sayısı (Hafta)
                  </span>
                  <select
                    value={recurringWeeks}
                    onChange={(e) => setRecurringWeeks(Number(e.target.value))}
                    className="mt-2 w-full bg-transparent border-b border-foreground/30 py-2 outline-none"
                  >
                    {[2, 3, 4, 6, 8, 12].map((num) => (
                      <option key={num} value={num}>
                        {num} Hafta
                      </option>
                    ))}
                  </select>
                </label>
              )}
            </div>
          )}
        </div>

        <div className="mt-8 flex items-center justify-between gap-3">
          <button
            onClick={save}
            disabled={saving}
            className="rounded-none bg-foreground text-background px-6 py-3 text-[0.78rem] uppercase tracking-[0.18em] font-medium hover:opacity-90 disabled:opacity-50 transition"
          >
            {saving ? "Kaydediliyor…" : "Kaydet"}
          </button>
          <div className="flex items-center gap-3">
            {!isNew && (
              <button
                onClick={remove}
                className="text-[0.78rem] uppercase tracking-[0.18em] text-destructive hover:opacity-80 transition"
              >
                Sil
              </button>
            )}
            <button
              onClick={onClose}
              className="text-[0.78rem] uppercase tracking-[0.18em] text-foreground/60 hover:text-foreground transition"
            >
              İptal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------- */
/*  Tab 4 — Şablon Düzenle                                               */
/* -------------------------------------------------------------------- */

function TemplateTab() {
  const [slots, setSlots] = useState<DbTemplateSlot[]>([]);
  const [instructors, setInstructors] = useState<DbInstructor[]>([]);
  const [classes, setClasses] = useState<{ slug: string; title_tr: string }[]>([]);
  const [editing, setEditing] = useState<DbTemplateSlot | null>(null);
  const [creating, setCreating] = useState<{ dayOfWeek: number; time: string } | null>(null);

  const HOURS = Array.from({ length: 18 }, (_, i) => String(i + 6).padStart(2, "0") + ":00");
  const DAYS = [
    { label: "Pazartesi", val: 1 },
    { label: "Salı", val: 2 },
    { label: "Çarşamba", val: 3 },
    { label: "Perşembe", val: 4 },
    { label: "Cuma", val: 5 },
    { label: "Cumartesi", val: 6 },
    { label: "Pazar", val: 0 },
  ];

  async function loadTemplate() {
    if (!supabase) return;
    const { data: s } = await supabase
      .from("template_slots")
      .select("*")
      .order("day_of_week")
      .order("time");
    setSlots((s as DbTemplateSlot[]) ?? []);
    const { data: i } = await supabase.from("instructors").select("*").eq("active", true);
    setInstructors((i as DbInstructor[]) ?? []);
    const { data: c } = await supabase.from("classes").select("slug,title_tr").order("title_tr");
    setClasses((c as { slug: string; title_tr: string }[]) ?? []);
  }

  useEffect(() => {
    void loadTemplate();
    if (!supabase) return;
    const channel = supabase
      .channel("admin-template-slots")
      .on("postgres_changes", { event: "*", schema: "public", table: "template_slots" }, () => void loadTemplate())
      .subscribe();
    return () => {
      void supabase?.removeChannel(channel);
    };
  }, []);

  function findTemplateSlot(dayOfWeek: number, time: string) {
    return slots.find((s) => s.day_of_week === dayOfWeek && s.time.startsWith(time));
  }

  return (
    <div>
      <div className="mb-6">
        <h3 className="font-serif text-[1.4rem] tracking-[-0.01em]">Haftalık Randevu Şablonu</h3>
        <p className="text-foreground/60 text-xs mt-1">
          Burada tanımladığınız ders planı, program sayfasında \"Şablondan Haftayı Doldur\" dediğinizde otomatik olarak kopyalanır.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr>
              <th className="sticky left-0 bg-background border border-foreground/10 px-2 py-2 text-[0.65rem] uppercase tracking-[0.18em] text-foreground/50 w-16">
                Saat
              </th>
              {DAYS.map((d) => (
                <th key={d.val} className="border border-foreground/10 px-2 py-2 text-center">
                  <div className="text-[0.65rem] uppercase tracking-[0.18em] text-foreground/50">
                    {d.label}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {HOURS.map((hour) => (
              <tr key={hour}>
                <td className="sticky left-0 bg-background border border-foreground/10 px-2 py-2 font-mono text-[0.7rem]">
                  {hour}
                </td>
                {DAYS.map((d) => {
                  const tplSlot = findTemplateSlot(d.val, hour);
                  return (
                    <td key={d.val + hour} className="border border-foreground/10 p-1 align-top w-28">
                      {tplSlot ? (
                        <button
                          onClick={() => setEditing(tplSlot)}
                          className={cn(
                            "w-full text-left px-2 py-1.5 transition hover:opacity-80",
                            SLOT_STATUS_BG[tplSlot.status],
                          )}
                          title={SLOT_STATUS_LABEL[tplSlot.status]}
                        >
                          <div className="text-[0.62rem] uppercase tracking-[0.12em] opacity-80">
                            {SLOT_STATUS_LABEL[tplSlot.status]}
                          </div>
                          {tplSlot.class_slug && (
                            <div className="text-[0.7rem] font-medium mt-0.5">
                              {classes.find((c) => c.slug === tplSlot.class_slug)?.title_tr ?? tplSlot.class_slug}
                            </div>
                          )}
                          {tplSlot.capacity > 1 && (
                            <div className="text-[0.62rem] opacity-70 mt-0.5">
                              Kapasite: {tplSlot.capacity}
                            </div>
                          )}
                        </button>
                      ) : (
                        <button
                          onClick={() => setCreating({ dayOfWeek: d.val, time: hour })}
                          className="w-full text-left px-2 py-1.5 text-foreground/30 hover:bg-muted hover:text-foreground transition"
                        >
                          + Şablon
                        </button>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <EditTemplateSlotModal
          slot={editing}
          instructors={instructors}
          classes={classes}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            void loadTemplate();
          }}
        />
      )}

      {creating && (
        <EditTemplateSlotModal
          newSlotDateTime={creating}
          instructors={instructors}
          classes={classes}
          onClose={() => setCreating(null)}
          onSaved={() => {
            setCreating(null);
            void loadTemplate();
          }}
        />
      )}
    </div>
  );
}

function EditTemplateSlotModal({
  slot,
  newSlotDateTime,
  instructors,
  classes,
  onClose,
  onSaved,
}: {
  slot?: DbTemplateSlot;
  newSlotDateTime?: { dayOfWeek: number; time: string };
  instructors: DbInstructor[];
  classes: { slug: string; title_tr: string }[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const isNew = !slot;
  const [status, setStatus] = useState<SlotStatus>(slot?.status ?? "open");
  const [classSlug, setClassSlug] = useState<string>(slot?.class_slug ?? "");
  const [instructorId, setInstructorId] = useState<string>(
    slot?.instructor_id ?? instructors[0]?.id ?? "",
  );
  const [capacity, setCapacity] = useState<number>(slot?.capacity ?? 6);
  const [notes, setNotes] = useState<string>(slot?.notes ?? "");
  const [saving, setSaving] = useState(false);

  const DAYS_LABEL = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];

  async function save() {
    if (!supabase) return;
    setSaving(true);
    const payload = {
      status,
      class_slug: classSlug || null,
      instructor_id: instructorId || null,
      capacity,
      notes: notes || null,
    };
    if (isNew && newSlotDateTime) {
      await supabase.from("template_slots").insert({
        ...payload,
        day_of_week: newSlotDateTime.dayOfWeek,
        time: newSlotDateTime.time,
        duration_min: 50,
      });
    } else if (slot) {
      await supabase.from("template_slots").update(payload).eq("id", slot.id);
    }
    setSaving(false);
    onSaved();
  }

  async function remove() {
    if (!supabase || !slot) return;
    if (!confirm("Bu şablon slotu silinsin mi?")) return;
    await supabase.from("template_slots").delete().eq("id", slot.id);
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4" onClick={onClose}>
      <div
        className="bg-background border border-foreground/20 max-w-md w-full p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-serif text-[1.4rem] tracking-[-0.02em]">
          {isNew ? "Yeni Şablon Slotu" : "Şablon Slotu Düzenle"}
        </h3>
        <p className="text-foreground/60 text-sm mt-1">
          {slot ? DAYS_LABEL[slot.day_of_week] : DAYS_LABEL[newSlotDateTime?.dayOfWeek ?? 0]} · {slot?.time?.slice(0, 5) ?? newSlotDateTime?.time}
        </p>

        <div className="mt-6 space-y-4">
          <label className="block">
            <span className="text-[0.7rem] uppercase tracking-[0.22em] text-vc-accent">DURUM</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as SlotStatus)}
              className="mt-2 w-full bg-transparent border-b border-foreground/30 py-2 outline-none"
            >
              {Object.entries(SLOT_STATUS_LABEL).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-[0.7rem] uppercase tracking-[0.22em] text-vc-accent">DERS TÜRÜ</span>
            <select
              value={classSlug}
              onChange={(e) => setClassSlug(e.target.value)}
              className="mt-2 w-full bg-transparent border-b border-foreground/30 py-2 outline-none"
            >
              <option value="">(yok)</option>
              {classes.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.title_tr}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-[0.7rem] uppercase tracking-[0.22em] text-vc-accent">EĞİTMEN</span>
            <select
              value={instructorId}
              onChange={(e) => setInstructorId(e.target.value)}
              className="mt-2 w-full bg-transparent border-b border-foreground/30 py-2 outline-none"
            >
              {instructors.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-[0.7rem] uppercase tracking-[0.22em] text-vc-accent">KAPASİTE</span>
            <input
              type="number"
              min={1}
              max={20}
              value={capacity}
              onChange={(e) => setCapacity(Number(e.target.value))}
              className="mt-2 w-full bg-transparent border-b border-foreground/30 py-2 outline-none"
            />
          </label>

          <label className="block">
            <span className="text-[0.7rem] uppercase tracking-[0.22em] text-vc-accent">NOT (opsiyonel)</span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="mt-2 w-full bg-transparent border-b border-foreground/30 py-2 outline-none resize-none"
            />
          </label>
        </div>

        <div className="mt-8 flex items-center justify-between gap-3">
          <button
            onClick={save}
            disabled={saving}
            className="rounded-none bg-foreground text-background px-6 py-3 text-[0.78rem] uppercase tracking-[0.18em] font-medium hover:opacity-90 disabled:opacity-50 transition"
          >
            {saving ? "Kaydediliyor…" : "Kaydet"}
          </button>
          <div className="flex items-center gap-3">
            {!isNew && (
              <button
                onClick={remove}
                className="text-[0.78rem] uppercase tracking-[0.18em] text-destructive hover:opacity-80 transition"
              >
                Sil
              </button>
            )}
            <button
              onClick={onClose}
              className="text-[0.78rem] uppercase tracking-[0.18em] text-foreground/60 hover:text-foreground transition"
            >
              İptal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------- */
/*  Tab 2 — Rezervasyonlar (pending + history)                           */
/* -------------------------------------------------------------------- */

type ResRow = DbReservation & { slot: DbSlot | null };

function ReservationsTab() {
  const [filter, setFilter] = useState<"pending" | "confirmed" | "all">("pending");
  const [rows, setRows] = useState<ResRow[]>([]);

  async function load() {
    if (!supabase) return;
    let q = supabase
      .from("reservations")
      .select("*, slot:slots(*)")
      .order("created_at", { ascending: false });
    if (filter !== "all") q = q.eq("status", filter);
    const { data } = await q;
    setRows((data as ResRow[]) ?? []);
  }

  useEffect(() => {
    void load();
    if (!supabase) return;
    const ch = supabase
      .channel("admin-res")
      .on("postgres_changes", { event: "*", schema: "public", table: "reservations" }, () => void load())
      .subscribe();
    return () => {
      void supabase?.removeChannel(ch);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  async function setStatus(id: string, status: "confirmed" | "cancelled") {
    if (!supabase) return;
    await supabase
      .from("reservations")
      .update({ status, confirmed_at: status === "confirmed" ? new Date().toISOString() : null })
      .eq("id", id);
    void load();
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        {(["pending", "confirmed", "all"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-4 py-2 text-[0.7rem] uppercase tracking-[0.22em] border",
              filter === f
                ? "border-foreground bg-foreground text-background"
                : "border-foreground/20 text-foreground/60 hover:border-foreground",
            )}
          >
            {f === "pending" ? "Bekleyen" : f === "confirmed" ? "Onaylı" : "Tümü"}
          </button>
        ))}
      </div>

      <div className="divide-y divide-foreground/10 border-y border-foreground/10">
        {rows.length === 0 ? (
          <p className="py-12 text-center text-foreground/50 text-sm">Kayıt yok.</p>
        ) : (
          rows.map((r) => (
            <div key={r.id} className="grid grid-cols-12 gap-3 py-4 items-center">
              <div className="col-span-3">
                <div className="font-medium">{r.member_name}</div>
                <div className="text-[0.7rem] text-foreground/50 mt-0.5">{r.member_phone}</div>
              </div>
              <div className="col-span-3 text-[0.85rem]">
                {r.slot?.date} · {r.slot?.time?.slice(0, 5)}
              </div>
              <div className="col-span-3 text-[0.85rem] text-foreground/70">{r.message || "—"}</div>
              <div className="col-span-3 flex items-center justify-end gap-2">
                {r.status === "pending" && (
                  <>
                    <button
                      onClick={() => setStatus(r.id, "confirmed")}
                      className="rounded-none bg-foreground text-background px-4 py-2 text-[0.7rem] uppercase tracking-[0.18em] hover:opacity-90 transition"
                    >
                      Onayla
                    </button>
                    <button
                      onClick={() => setStatus(r.id, "cancelled")}
                      className="text-[0.7rem] uppercase tracking-[0.18em] text-foreground/50 hover:text-destructive transition"
                    >
                      İptal
                    </button>
                  </>
                )}
                {r.status === "confirmed" && (
                  <span className="text-[0.7rem] uppercase tracking-[0.18em] text-vc-accent">Onaylı</span>
                )}
                {r.status === "cancelled" && (
                  <span className="text-[0.7rem] uppercase tracking-[0.18em] text-foreground/40">İptal</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------- */
/*  Tab 3 — Eğitmenler                                                   */
/* -------------------------------------------------------------------- */

function InstructorsTab() {
  const [list, setList] = useState<DbInstructor[]>([]);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");

  async function load() {
    if (!supabase) return;
    const { data } = await supabase.from("instructors").select("*").order("name");
    setList((data as DbInstructor[]) ?? []);
  }

  useEffect(() => {
    void load();
  }, []);

  async function add() {
    if (!supabase || !name.trim()) return;
    await supabase.from("instructors").insert({ name: name.trim(), role: role.trim() });
    setName("");
    setRole("");
    void load();
  }

  async function toggle(id: string, active: boolean) {
    if (!supabase) return;
    await supabase.from("instructors").update({ active }).eq("id", id);
    void load();
  }

  return (
    <div className="max-w-2xl">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8 items-end">
        <label className="block">
          <span className="text-[0.7rem] uppercase tracking-[0.22em] text-vc-accent">AD</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-2 w-full bg-transparent border-b border-foreground/30 py-2 outline-none"
          />
        </label>
        <label className="block">
          <span className="text-[0.7rem] uppercase tracking-[0.22em] text-vc-accent">UZMANLIK</span>
          <input
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="mt-2 w-full bg-transparent border-b border-foreground/30 py-2 outline-none"
          />
        </label>
        <button
          onClick={add}
          className="rounded-none bg-foreground text-background px-4 py-3 text-[0.78rem] uppercase tracking-[0.18em] hover:opacity-90 transition"
        >
          Ekle
        </button>
      </div>

      <div className="divide-y divide-foreground/10 border-y border-foreground/10">
        {list.map((i) => (
          <div key={i.id} className="flex items-center justify-between py-4">
            <div>
              <div className="font-medium">{i.name}</div>
              <div className="text-[0.7rem] text-foreground/50 mt-0.5">{i.role}</div>
            </div>
            <button
              onClick={() => toggle(i.id, !i.active)}
              className={cn(
                "text-[0.7rem] uppercase tracking-[0.18em] px-3 py-1.5 border transition",
                i.active
                  ? "border-vc-accent text-vc-accent"
                  : "border-foreground/30 text-foreground/40",
              )}
            >
              {i.active ? "Aktif" : "Pasif"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------- */
/*  Yardımcılar                                                          */
/* -------------------------------------------------------------------- */

const DAY_SHORT = ["PAZ", "PZT", "SAL", "ÇAR", "PER", "CUM", "CMT"];

function startOfWeek(d: Date) {
  const r = new Date(d);
  const day = r.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  r.setDate(r.getDate() + diff);
  r.setHours(0, 0, 0, 0);
  return r;
}
function addDays(d: Date, n: number) {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}
function isoDate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function formatDateTR(d: Date) {
  return d.toLocaleDateString("tr-TR", { day: "numeric", month: "long" });
}

function BackendNotConfigured() {
  return (
    <FullScreenMessage
      text="Supabase bağlantısı kurulmamış. app/.env.local dosyasına VITE_SUPABASE_URL ve VITE_SUPABASE_ANON_KEY ekle."
    />
  );
}

function FullScreenMessage({ text }: { text: string }) {
  return (
    <section className="min-h-screen flex items-center justify-center bg-background px-[var(--pad-x)] text-center">
      <div className="max-w-md">
        <span className="text-[0.7rem] uppercase tracking-[0.22em] text-vc-accent font-semibold">
          ADMİN
        </span>
        <p className="font-serif text-[1.4rem] tracking-[-0.01em] mt-4 leading-snug">{text}</p>
        <Link
          to="/"
          className="mt-8 inline-block text-[0.7rem] uppercase tracking-[0.22em] text-foreground/50 hover:text-foreground"
        >
          ← Anasayfaya dön
        </Link>
      </div>
    </section>
  );
}

function TabButton({
  current,
  setTab,
  value,
  label,
}: {
  current: Tab;
  setTab: (t: Tab) => void;
  value: Tab;
  label: string;
}) {
  const active = current === value;
  return (
    <button
      onClick={() => setTab(value)}
      className={cn(
        "px-4 py-2 text-[0.7rem] uppercase tracking-[0.22em] border transition",
        active
          ? "border-foreground bg-foreground text-background"
          : "border-foreground/20 text-foreground/60 hover:border-foreground",
      )}
    >
      {label}
    </button>
  );
}
