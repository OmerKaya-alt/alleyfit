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

export type DbTemplateReservation = {
  id: string;
  template_slot_id: string;
  member_name: string;
  member_phone: string | null;
  created_at: string;
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
  const [dbAdminEmails, setDbAdminEmails] = useState<string[]>([]);
  const [checking, setChecking] = useState(true);
  const [tab, setTab] = useState<Tab>("schedule");

  // Auth oturumunu kontrol et
  useEffect(() => {
    if (!supabase) {
      setChecking(false);
      return;
    }
    let active = true;

    // Safety timeout to force-disable checking state if queries hang
    const safetyTimeout = setTimeout(() => {
      if (active) {
        console.warn("Admin auth check timed out, forcing render");
        setChecking(false);
      }
    }, 3000);

    async function checkAuth() {
      try {
        // 1) Session
        const { data } = await supabase!.auth.getSession();
        const currentEmail = data.session?.user.email?.toLowerCase() ?? null;

        // 2) Fetch dynamic admin emails from DB
        const { data: dbAdmins } = await supabase!
          .from("admin_emails")
          .select("email");

        if (!active) return;

        const emailsList = (dbAdmins as { email: string }[])?.map((a) => a.email.toLowerCase()) ?? [];
        setDbAdminEmails(emailsList);
        setEmail(currentEmail);
      } catch (err) {
        console.error("Auth check error:", err);
      } finally {
        if (active) {
          clearTimeout(safetyTimeout);
          setChecking(false);
        }
      }
    }

    void checkAuth();

    const { data: sub } = supabase.auth.onAuthStateChange(async (_e, session) => {
      try {
        const currentEmail = session?.user.email?.toLowerCase() ?? null;
        const { data: dbAdmins } = await supabase!
          .from("admin_emails")
          .select("email");
        const emailsList = (dbAdmins as { email: string }[])?.map((a) => a.email.toLowerCase()) ?? [];

        if (active) {
          setDbAdminEmails(emailsList);
          setEmail(currentEmail);
        }
      } catch (err) {
        console.error("Auth state change error:", err);
      }
    });

    return () => {
      active = false;
      clearTimeout(safetyTimeout);
      sub.subscription.unsubscribe();
    };
  }, []);

  if (!supabaseConfigured) {
    return <BackendNotConfigured />;
  }
  if (checking) {
    return <FullScreenMessage text="Yükleniyor…" />;
  }

  const isAuthorized = email && (ADMIN_EMAILS.includes(email) || dbAdminEmails.includes(email));

  if (!email || !isAuthorized) {
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
          <div className="flex items-center gap-3 overflow-x-auto max-w-full pb-2 scrollbar-none whitespace-nowrap -mx-4 px-4 lg:mx-0 lg:px-0">
            <TabButton current={tab} setTab={setTab} value="schedule" label="Program" />
            <TabButton current={tab} setTab={setTab} value="reservations" label="Rezervasyonlar" />
            <TabButton current={tab} setTab={setTab} value="instructors" label="Eğitmenler" />
            <TabButton current={tab} setTab={setTab} value="template" label="Şablon Düzenle" />
            <button
              onClick={() => supabase?.auth.signOut()}
              className="ml-2 text-[0.7rem] uppercase tracking-[0.22em] text-foreground/50 hover:text-foreground transition flex-shrink-0"
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
/*  Helper — Promise Timeout                                             */
/* -------------------------------------------------------------------- */
function withTimeout<T>(promise: Promise<T>, ms = 6000): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("ZAMAN_ASIMI")), ms);
    promise
      .then((res) => {
        clearTimeout(timer);
        resolve(res);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

/* -------------------------------------------------------------------- */
/*  Auth — login screen                                                  */
/* -------------------------------------------------------------------- */

function LoginScreen({
  unauthorizedEmail,
}: {
  unauthorizedEmail: string | null;
}) {
  const [emailInput, setEmailInput] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [linkSent, setLinkSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** E-posta alanı geçerli mi? */
  function validEmail(): string | null {
    const trimmed = emailInput.trim().toLowerCase();
    if (!trimmed) {
      setError("Lütfen e-posta adresinizi girin.");
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
    try {
      const { error: err } = await withTimeout(
        supabase.auth.signInWithPassword({
          email: trimmed,
          password,
        }),
        6000
      );
      if (err) {
        setError("E-posta veya şifre hatalı.");
      }
    } catch (err: any) {
      console.error("Login attempt failed:", err);
      if (err.message === "ZAMAN_ASIMI") {
        setError("Giriş isteği zaman aşımına uğradı. Lütfen internet bağlantınızı, VPN veya reklam engelleyicinizi kontrol edin.");
      } else {
        setError("Giriş yapılamadı. Lütfen bilgilerinizi ve internetinizi kontrol edin.");
      }
    } finally {
      setLoading(false);
    }
  }

  // Magic-link — e-posta ile giriş bağlantısı (yedek yöntem).
  async function handleMagicLink() {
    setError(null);
    if (!supabase) return;
    const trimmed = validEmail();
    if (!trimmed) return;
    setLoading(true);
    try {
      const { error: err } = await withTimeout(
        supabase.auth.signInWithOtp({
          email: trimmed,
          options: { emailRedirectTo: window.location.origin + "/admin" },
        }),
        6000
      );
      if (err) {
        setError(err.message);
        return;
      }
      setLinkSent(true);
    } catch (err: any) {
      console.error("Magic link attempt failed:", err);
      if (err.message === "ZAMAN_ASIMI") {
        setError("Bağlantı isteği zaman aşımına uğradı. Güvenlik duvarınızı veya internetinizi kontrol edin.");
      } else {
        setError("Bağlantı gönderilemedi. Lütfen internetinizi kontrol edin.");
      }
    } finally {
      setLoading(false);
    }
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
          <div className="mt-6 p-4 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-md flex flex-col gap-3">
            <p>“{unauthorizedEmail}” hesabı admin yetkisine sahip değil.</p>
            <button
              onClick={async () => {
                if (supabase) {
                  await supabase.auth.signOut();
                  window.location.reload();
                }
              }}
              className="text-xs uppercase tracking-wider font-semibold underline text-left hover:text-destructive/80 transition"
            >
              Farklı bir hesapla giriş yap / Çıkış Yap
            </button>
          </div>
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
  const [activeDayIdx, setActiveDayIdx] = useState<number>(() => {
    const day = new Date().getDay();
    return day === 0 ? 6 : day - 1; // 0 (Mon) to 6 (Sun)
  });

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
        const { data: insertedSlots, error } = await supabase
          .from("slots")
          .insert(slotsToInsert)
          .select();

        if (error) {
          alert("Şablon yüklenirken hata oluştu: " + error.message);
        } else {
          // Kalıcı şablon katılımcılarını kopyala
          const { data: tplReservations } = await supabase
            .from("template_reservations")
            .select("*");

          if (insertedSlots && tplReservations && tplReservations.length > 0) {
            const reservationsToInsert = [];
            for (const slot of insertedSlots) {
              const dateObj = new Date(slot.date + "T00:00:00");
              const dayOfWeek = dateObj.getDay();

              // Bu slotun dayOfWeek ve saatine uyan template slotunu bul
              const matchingTplSlot = tplSlots.find(
                (ts) => ts.day_of_week === dayOfWeek && ts.time.startsWith(slot.time.slice(0, 5))
              );

              if (matchingTplSlot) {
                const matchingTplRes = tplReservations.filter(
                  (tr) => tr.template_slot_id === matchingTplSlot.id
                );

                for (const tplRes of matchingTplRes) {
                  reservationsToInsert.push({
                    slot_id: slot.id,
                    member_name: tplRes.member_name,
                    member_phone: tplRes.member_phone,
                    status: "confirmed",
                    confirmed_at: new Date().toISOString(),
                  });
                }
              }
            }

            if (reservationsToInsert.length > 0) {
              await supabase.from("reservations").insert(reservationsToInsert);
            }
          }

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
      <div className="flex items-center justify-between mb-6 gap-2">
        <button
          onClick={() => setWeekStart((d) => addDays(d, -7))}
          className="text-[0.65rem] sm:text-[0.78rem] uppercase tracking-[0.1em] sm:tracking-[0.18em] text-foreground/60 hover:text-foreground transition flex-shrink-0"
        >
          ← <span className="hidden xs:inline">Önceki Hafta</span><span className="inline xs:hidden">Önceki</span>
        </button>
        <span className="font-serif text-[0.95rem] xs:text-[1.1rem] sm:text-[1.4rem] tracking-[-0.01em] whitespace-nowrap text-center px-1">
          {formatDateTR(days[0])} — {formatDateTR(days[6])}
        </span>
        <button
          onClick={() => setWeekStart((d) => addDays(d, 7))}
          className="text-[0.65rem] sm:text-[0.78rem] uppercase tracking-[0.1em] sm:tracking-[0.18em] text-foreground/60 hover:text-foreground transition flex-shrink-0"
        >
          <span className="hidden xs:inline">Sonraki Hafta</span><span className="inline xs:hidden">Sonraki</span> →
        </button>
      </div>

      {/* Hızlı Eylemler */}
      <div className="flex justify-end mb-4">
        <button
          onClick={populateFromTemplate}
          disabled={populating}
          className="rounded-none border border-foreground/20 text-foreground/75 px-3 py-1.5 sm:px-4 sm:py-2 text-[0.62rem] sm:text-[0.7rem] uppercase tracking-[0.12em] sm:tracking-[0.18em] hover:border-foreground hover:text-foreground disabled:opacity-50 transition"
        >
          {populating ? "Şablon Uygulanıyor..." : "Şablondan Haftayı Doldur"}
        </button>
      </div>

      {/* Masaüstü Görünüm (md:block) */}
      <div className="hidden md:block overflow-x-auto">
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

      {/* Mobil Görünüm (md:hidden) */}
      <div className="block md:hidden space-y-4">
        {/* Gün Seçici */}
        <div className="flex items-stretch border border-foreground/10 bg-background mb-4">
          {days.map((d, i) => {
            const isActive = i === activeDayIdx;
            const dayIdx = d.getDay();
            const dateISO = isoDate(d);
            return (
              <button
                key={dateISO}
                onClick={() => setActiveDayIdx(i)}
                className={cn(
                  "flex-1 flex flex-col items-center justify-center py-3 px-1 transition text-center border-r border-foreground/10 last:border-r-0",
                  isActive ? "bg-foreground text-background" : "hover:bg-muted"
                )}
              >
                <span className="text-[0.58rem] uppercase tracking-[0.1em] opacity-70">
                  {DAY_SHORT[dayIdx]}
                </span>
                <span className="font-serif text-[1rem] mt-0.5">{d.getDate()}</span>
              </button>
            );
          })}
        </div>

        {/* Seçili Günün Slot Listesi */}
        <div className="space-y-3">
          {HOURS.map((hour) => {
            const dateISO = isoDate(days[activeDayIdx]);
            const slot = findSlot(dateISO, hour);
            return (
              <div key={hour} className="flex items-center gap-3 bg-background border border-foreground/10 p-3">
                <div className="font-mono text-[0.8rem] font-medium text-foreground/70 w-12 flex-shrink-0">
                  {hour}
                </div>
                <div className="flex-1">
                  {slot ? (
                    <button
                      onClick={() => setEditing(slot)}
                      className={cn(
                        "w-full text-left p-3 transition hover:opacity-90 flex items-center justify-between gap-2 border",
                        SLOT_STATUS_BG[slot.status]
                      )}
                    >
                      <div>
                        <div className="text-[0.62rem] uppercase tracking-[0.12em] font-semibold opacity-80">
                          {SLOT_STATUS_LABEL[slot.status]}
                        </div>
                        {slot.class_slug && (
                          <div className="text-[0.8rem] font-serif tracking-tight mt-0.5">
                            {classes.find((c) => c.slug === slot.class_slug)?.title_tr ?? slot.class_slug}
                          </div>
                        )}
                        {slot.notes && (
                          <div className="text-[0.65rem] text-foreground/60 italic mt-0.5 line-clamp-1">
                            {slot.notes}
                          </div>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        {slot.capacity > 1 && (
                          <span className="text-[0.7rem] bg-foreground/10 px-2 py-0.5 font-medium">
                            {slot.booked_count} / {slot.capacity}
                          </span>
                        )}
                      </div>
                    </button>
                  ) : (
                    <button
                      onClick={() => setCreating({ date: dateISO, time: hour })}
                      className="w-full text-left p-3 text-[0.7rem] uppercase tracking-[0.15em] border border-dashed border-foreground/20 text-foreground/40 hover:bg-muted hover:text-foreground transition text-center"
                    >
                      + Slot Ekle
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
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
          onRefreshWeek={() => {
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
          onRefreshWeek={() => {
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
  onRefreshWeek,
}: {
  slot?: DbSlot;
  newSlotDateTime?: { date: string; time: string };
  instructors: DbInstructor[];
  classes: { slug: string; title_tr: string }[];
  onClose: () => void;
  onSaved: () => void;
  onRefreshWeek?: () => void;
}) {
  const isNew = !slot;

  const defaultCapacity = (st: SlotStatus) => {
    if (st === "private" || st === "open") return 1;
    if (st === "couple") return 2;
    if (st === "spinning") return 12;
    return 6; // group_open, group_full
  };

  const [status, setStatus] = useState<SlotStatus>(slot?.status ?? "open");
  const [classSlug, setClassSlug] = useState<string>(slot?.class_slug ?? "");
  const [instructorId, setInstructorId] = useState<string>(
    slot?.instructor_id ?? instructors[0]?.id ?? "",
  );
  const [capacity, setCapacity] = useState<number>(slot?.capacity ?? defaultCapacity(slot?.status ?? "open"));
  const [notes, setNotes] = useState<string>(slot?.notes ?? "");
  const [saving, setSaving] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringWeeks, setRecurringWeeks] = useState(4);

  // Automatically update capacity if it's a new slot and status changes
  useEffect(() => {
    if (isNew) {
      setCapacity(defaultCapacity(status));
    }
  }, [status, isNew]);

  // Rezervasyon listesi states
  const [reservations, setReservations] = useState<DbReservation[]>([]);
  const [loadingRes, setLoadingRes] = useState(false);
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberPhone, setNewMemberPhone] = useState("");

  async function loadReservations() {
    if (!supabase || !slot?.id) return;
    setLoadingRes(true);
    const { data } = await supabase
      .from("reservations")
      .select("*")
      .eq("slot_id", slot.id)
      .order("created_at");
    setReservations((data as DbReservation[]) ?? []);
    setLoadingRes(false);
  }

  useEffect(() => {
    if (slot?.id) {
      void loadReservations();
    }
  }, [slot]);



  async function approveReservation(resId: string) {
    if (!supabase) return;
    const { error } = await supabase
      .from("reservations")
      .update({ status: "confirmed", confirmed_at: new Date().toISOString() })
      .eq("id", resId);
    if (error) {
      alert("Rezervasyon onaylanırken hata oluştu: " + error.message);
    } else {
      void loadReservations();
      if (onRefreshWeek) onRefreshWeek();
      else onSaved();
    }
  }

  async function cancelReservation(resId: string) {
    if (!supabase) return;
    if (!confirm("Bu rezervasyonu silmek istediğinize emin misiniz?")) return;
    const { error } = await supabase.from("reservations").delete().eq("id", resId);
    if (error) {
      alert("Rezervasyon silinirken hata oluştu: " + error.message);
    } else {
      void loadReservations();
      if (onRefreshWeek) onRefreshWeek();
      else onSaved();
    }
  }

  async function addReservation() {
    if (!supabase || !slot?.id) return;
    const { error } = await supabase.from("reservations").insert({
      slot_id: slot.id,
      member_name: newMemberName.trim(),
      member_phone: newMemberPhone.trim() || null,
      status: "confirmed",
      confirmed_at: new Date().toISOString(),
    });
    if (error) {
      alert("Katılımcı eklenirken hata oluştu: " + error.message);
    } else {
      setNewMemberName("");
      setNewMemberPhone("");
      void loadReservations();
      if (onRefreshWeek) onRefreshWeek();
      else onSaved();
    }
  }

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

        // Bu dersi kalıcı haftalık şablona (template_slots) da otomatik olarak kaydet
        const baseDateObj = new Date(newSlotDateTime.date + "T00:00:00");
        const dayOfWeek = baseDateObj.getDay();
        await supabase.from("template_slots").upsert({
          day_of_week: dayOfWeek,
          time: newSlotDateTime.time,
          duration_min: 50,
          class_slug: classSlug || null,
          instructor_id: instructorId || null,
          status,
          capacity,
          notes: notes || null,
        }, {
          onConflict: "day_of_week,time,instructor_id"
        });
      } else {
        await supabase.from("slots").insert({
          ...payload,
          date: newSlotDateTime.date,
          time: newSlotDateTime.time,
          duration_min: 50,
        });
      }
    } else if (slot) {
      if (isRecurring) {
        // 1) Mevcut slotu güncelle
        await supabase.from("slots").update(payload).eq("id", slot.id);

        // 2) Sonraki N-1 hafta için yeni slotlar ekle
        const slotsToInsert = [];
        for (let i = 1; i < recurringWeeks; i++) {
          const dateObj = new Date(slot.date + "T00:00:00");
          const nextDateObj = addDays(dateObj, i * 7);
          slotsToInsert.push({
            ...payload,
            date: isoDate(nextDateObj),
            time: slot.time,
            duration_min: 50,
          });
        }
        await supabase.from("slots").insert(slotsToInsert);

        // 3) Kalıcı haftalık şablona da kaydet
        const baseDateObj = new Date(slot.date + "T00:00:00");
        const dayOfWeek = baseDateObj.getDay();
        await supabase.from("template_slots").upsert({
          day_of_week: dayOfWeek,
          time: slot.time,
          duration_min: 50,
          class_slug: classSlug || null,
          instructor_id: instructorId || null,
          status,
          capacity,
          notes: notes || null,
        }, {
          onConflict: "day_of_week,time,instructor_id"
        });
      } else {
        await supabase.from("slots").update(payload).eq("id", slot.id);
      }
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
        className="bg-background border border-foreground/20 max-w-md w-full p-8 max-h-[85vh] overflow-y-auto overscroll-contain"
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
                <option key={k} value={k} className="bg-background text-foreground">
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
              <option value="" className="bg-background text-foreground">(yok)</option>
              {classes.map((c) => (
                <option key={c.slug} value={c.slug} className="bg-background text-foreground">
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
                <option key={i.id} value={i.id} className="bg-background text-foreground">
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
                    <option key={num} value={num} className="bg-background text-foreground">
                      {num} Hafta
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>
        </div>

        {/* Katılımcılar Listesi ve Yönetimi */}
        {slot && (
          <div className="mt-6 pt-6 border-t border-foreground/10 space-y-4">
            <h4 className="font-serif text-[1.1rem] tracking-[-0.01em]">Katılımcılar ({reservations.length}/{capacity})</h4>
            
            {loadingRes ? (
              <p className="text-[0.7rem] text-foreground/50">Yükleniyor...</p>
            ) : reservations.length === 0 ? (
              <p className="text-[0.7rem] text-foreground/40 italic">Bu derse henüz kayıtlı katılımcı yok.</p>
            ) : (
              <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                {reservations.map((res) => (
                  <div key={res.id} className="flex items-center justify-between bg-foreground/5 p-2 text-[0.7rem] border border-foreground/10">
                    <div>
                      <span className="font-medium text-foreground">{res.member_name}</span>
                      {res.member_phone && <span className="text-foreground/50 ml-1">({res.member_phone})</span>}
                      <span className={cn(
                        "ml-2 px-1 text-[0.55rem] uppercase tracking-[0.1em]",
                        res.status === "confirmed" ? "bg-green-500/10 text-green-600" : "bg-yellow-500/10 text-yellow-600"
                      )}>
                        {res.status === "confirmed" ? "Onaylı" : "Bekliyor"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {res.status === "pending" && (
                        <button
                          onClick={() => approveReservation(res.id)}
                          className="text-[0.65rem] text-green-600 uppercase tracking-[0.1em] hover:underline"
                        >
                          Onayla
                        </button>
                      )}
                      <button
                        onClick={() => cancelReservation(res.id)}
                        className="text-[0.65rem] text-destructive uppercase tracking-[0.1em] hover:underline"
                      >
                        Sil
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Manuel Katılımcı Ekleme Formu */}
            <div className="bg-foreground/5 p-3 space-y-2 border border-foreground/10">
              <span className="text-[0.65rem] uppercase tracking-[0.15em] text-vc-accent font-semibold">Katılımcı Ekle</span>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Adı Soyadı"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  className="w-full bg-background border border-foreground/20 px-2 py-1 text-[0.7rem] outline-none"
                />
                <input
                  type="text"
                  placeholder="Telefon"
                  value={newMemberPhone}
                  onChange={(e) => setNewMemberPhone(e.target.value)}
                  className="w-full bg-background border border-foreground/20 px-2 py-1 text-[0.7rem] outline-none"
                />
              </div>
              <button
                onClick={addReservation}
                disabled={!newMemberName.trim()}
                className="w-full bg-foreground text-background py-1.5 text-[0.65rem] uppercase tracking-[0.15em] hover:opacity-90 disabled:opacity-50 transition"
              >
                Derse Kaydet
              </button>
            </div>
          </div>
        )}

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
  const [activeDayIdx, setActiveDayIdx] = useState(0);

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

      {/* Masaüstü Görünüm (md:block) */}
      <div className="hidden md:block overflow-x-auto">
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

      {/* Mobil Görünüm (md:hidden) */}
      <div className="block md:hidden space-y-4">
        {/* Gün Seçici */}
        <div className="flex items-stretch border border-foreground/10 bg-background mb-4">
          {DAYS.map((d, i) => {
            const isActive = i === activeDayIdx;
            return (
              <button
                key={d.val}
                onClick={() => setActiveDayIdx(i)}
                className={cn(
                  "flex-1 flex flex-col items-center justify-center py-3 px-1 transition text-center border-r border-foreground/10 last:border-r-0",
                  isActive ? "bg-foreground text-background" : "hover:bg-muted"
                )}
              >
                <span className="text-[0.58rem] uppercase tracking-[0.1em] opacity-70">
                  {d.label.slice(0, 3)}
                </span>
              </button>
            );
          })}
        </div>

        {/* Seçili Günün Şablon Listesi */}
        <div className="space-y-3">
          {HOURS.map((hour) => {
            const currentDay = DAYS[activeDayIdx];
            const tplSlot = findTemplateSlot(currentDay.val, hour);
            return (
              <div key={hour} className="flex items-center gap-3 bg-background border border-foreground/10 p-3">
                <div className="font-mono text-[0.8rem] font-medium text-foreground/70 w-12 flex-shrink-0">
                  {hour}
                </div>
                <div className="flex-1">
                  {tplSlot ? (
                    <button
                      onClick={() => setEditing(tplSlot)}
                      className={cn(
                        "w-full text-left p-3 transition hover:opacity-90 flex items-center justify-between gap-2 border",
                        SLOT_STATUS_BG[tplSlot.status]
                      )}
                    >
                      <div>
                        <div className="text-[0.62rem] uppercase tracking-[0.12em] font-semibold opacity-80">
                          {SLOT_STATUS_LABEL[tplSlot.status]}
                        </div>
                        {tplSlot.class_slug && (
                          <div className="text-[0.8rem] font-serif tracking-tight mt-0.5">
                            {classes.find((c) => c.slug === tplSlot.class_slug)?.title_tr ?? tplSlot.class_slug}
                          </div>
                        )}
                        {tplSlot.notes && (
                          <div className="text-[0.65rem] text-foreground/60 italic mt-0.5 line-clamp-1">
                            {tplSlot.notes}
                          </div>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        {tplSlot.capacity > 1 && (
                          <span className="text-[0.7rem] bg-foreground/10 px-2 py-0.5 font-medium">
                            Kapasite: {tplSlot.capacity}
                          </span>
                        )}
                      </div>
                    </button>
                  ) : (
                    <button
                      onClick={() => setCreating({ dayOfWeek: currentDay.val, time: hour })}
                      className="w-full text-left p-3 text-[0.7rem] uppercase tracking-[0.15em] border border-dashed border-foreground/20 text-foreground/40 hover:bg-muted hover:text-foreground transition text-center"
                    >
                      + Şablon Ekle
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
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

  const defaultCapacity = (st: SlotStatus) => {
    if (st === "private" || st === "open") return 1;
    if (st === "couple") return 2;
    if (st === "spinning") return 12;
    return 6; // group_open, group_full
  };

  const [status, setStatus] = useState<SlotStatus>(slot?.status ?? "open");
  const [classSlug, setClassSlug] = useState<string>(slot?.class_slug ?? "");
  const [instructorId, setInstructorId] = useState<string>(
    slot?.instructor_id ?? instructors[0]?.id ?? "",
  );
  const [capacity, setCapacity] = useState<number>(slot?.capacity ?? defaultCapacity(slot?.status ?? "open"));
  const [notes, setNotes] = useState<string>(slot?.notes ?? "");
  const [saving, setSaving] = useState(false);

  // Automatically update capacity if it's a new slot and status changes
  useEffect(() => {
    if (isNew) {
      setCapacity(defaultCapacity(status));
    }
  }, [status, isNew]);

  // Kalıcı Şablon Katılımcıları states
  const [reservations, setReservations] = useState<DbTemplateReservation[]>([]);
  const [loadingRes, setLoadingRes] = useState(false);
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberPhone, setNewMemberPhone] = useState("");

  const DAYS_LABEL = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];

  async function loadReservations() {
    if (!supabase || !slot?.id) return;
    setLoadingRes(true);
    const { data } = await supabase
      .from("template_reservations")
      .select("*")
      .eq("template_slot_id", slot.id)
      .order("created_at");
    setReservations((data as DbTemplateReservation[]) ?? []);
    setLoadingRes(false);
  }

  useEffect(() => {
    if (slot?.id) {
      void loadReservations();
    }
  }, [slot]);



  async function removeReservation(resId: string) {
    if (!supabase) return;
    if (!confirm("Bu kalıcı katılımcıyı şablondan silmek istediğinize emin misiniz?")) return;
    const { error } = await supabase.from("template_reservations").delete().eq("id", resId);
    if (error) {
      alert("Hata: " + error.message);
    } else {
      void loadReservations();
    }
  }

  async function addReservation() {
    if (!supabase || !slot?.id) return;
    const { error } = await supabase.from("template_reservations").insert({
      template_slot_id: slot.id,
      member_name: newMemberName.trim(),
      member_phone: newMemberPhone.trim() || null,
    });
    if (error) {
      alert("Hata: " + error.message);
    } else {
      setNewMemberName("");
      setNewMemberPhone("");
      void loadReservations();
    }
  }

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
        className="bg-background border border-foreground/20 max-w-md w-full p-8 max-h-[85vh] overflow-y-auto overscroll-contain"
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
                <option key={k} value={k} className="bg-background text-foreground">
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
              <option value="" className="bg-background text-foreground">(yok)</option>
              {classes.map((c) => (
                <option key={c.slug} value={c.slug} className="bg-background text-foreground">
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
                <option key={i.id} value={i.id} className="bg-background text-foreground">
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

        {/* Şablon Katılımcıları Listesi ve Yönetimi */}
        {slot && (
          <div className="mt-6 pt-6 border-t border-foreground/10 space-y-4">
            <h4 className="font-serif text-[1.1rem] tracking-[-0.01em]">Kalıcı Katılımcılar ({reservations.length})</h4>
            <p className="text-[0.62rem] text-foreground/50 mt-1">
              Buraya eklediğiniz kişiler, bu şablondan her hafta doldurulduğunda otomatik olarak derse kayıt edilir.
            </p>
            
            {loadingRes ? (
              <p className="text-[0.7rem] text-foreground/50">Yükleniyor...</p>
            ) : reservations.length === 0 ? (
              <p className="text-[0.7rem] text-foreground/40 italic">Bu şablon dersinde henüz kalıcı katılımcı yok.</p>
            ) : (
              <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                {reservations.map((res) => (
                  <div key={res.id} className="flex items-center justify-between bg-foreground/5 p-2 text-[0.7rem] border border-foreground/10">
                    <div>
                      <span className="font-medium text-foreground">{res.member_name}</span>
                      {res.member_phone && <span className="text-foreground/50 ml-1">({res.member_phone})</span>}
                    </div>
                    <button
                      onClick={() => removeReservation(res.id)}
                      className="text-[0.65rem] text-destructive uppercase tracking-[0.1em] hover:underline"
                    >
                      Sil
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Manuel Kalıcı Katılımcı Ekleme Formu */}
            <div className="bg-foreground/5 p-3 space-y-2 border border-foreground/10">
              <span className="text-[0.65rem] uppercase tracking-[0.15em] text-vc-accent font-semibold">Kalıcı Katılımcı Ekle</span>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Adı Soyadı"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  className="w-full bg-background border border-foreground/20 px-2 py-1 text-[0.7rem] outline-none"
                />
                <input
                  type="text"
                  placeholder="Telefon"
                  value={newMemberPhone}
                  onChange={(e) => setNewMemberPhone(e.target.value)}
                  className="w-full bg-background border border-foreground/20 px-2 py-1 text-[0.7rem] outline-none"
                />
              </div>
              <button
                onClick={addReservation}
                disabled={!newMemberName.trim()}
                className="w-full bg-foreground text-background py-1.5 text-[0.65rem] uppercase tracking-[0.15em] hover:opacity-90 disabled:opacity-50 transition"
              >
                Şablona Kaydet
              </button>
            </div>
          </div>
        )}

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
        "px-4 py-2 text-[0.7rem] uppercase tracking-[0.22em] border transition flex-shrink-0 whitespace-nowrap",
        active
          ? "border-foreground bg-foreground text-background"
          : "border-foreground/20 text-foreground/60 hover:border-foreground",
      )}
    >
      {label}
    </button>
  );
}
