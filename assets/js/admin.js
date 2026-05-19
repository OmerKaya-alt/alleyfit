// ============================================================
// admin.js — Yönetim paneli: login + rezervasyon yönetimi
// ============================================================

import {
  sb, signIn, signOut, getCurrentRole,
  fetchUpcomingBookings, updateBookingStatus,
  formatTimeLabel, buildWhatsAppConfirmLink
} from "./supabase.js";

const DAY_NAMES_LONG = ["Pazar","Pazartesi","Salı","Çarşamba","Perşembe","Cuma","Cumartesi"];
const MONTHS_SHORT   = ["Oca","Şub","Mar","Nis","May","Haz","Tem","Ağu","Eyl","Eki","Kas","Ara"];

const STATUS_LABEL = {
  pending:   "Beklemede",
  confirmed: "Onaylandı",
  cancelled: "İptal",
  no_show:   "Gelmedi",
  completed: "Tamamlandı"
};

// ---------- DOM ----------

const $loginSec   = document.getElementById("login-section");
const $loginCard  = document.getElementById("login-card");
const $loginForm  = document.getElementById("login-form");
const $loginFb    = document.getElementById("login-feedback");
const $loginBtn   = document.getElementById("login-submit");

const $dashSec    = document.getElementById("dashboard-section");
const $dashboard  = document.getElementById("dashboard");
const $roleHint   = document.getElementById("dashboard-role-hint");
const $list       = document.getElementById("bookings-list");
const $listEmpty  = document.getElementById("bookings-empty");
const $listError  = document.getElementById("bookings-error");

const $userArea   = document.getElementById("admin-user-area");
const $userLabel  = document.getElementById("admin-user-label");
const $signoutBtn = document.getElementById("admin-signout");

// ---------- State ----------

let currentRole = null;     // {role, instructor_id} | null
let currentEmail = null;
let activeFilter = "pending";
let cachedBookings = [];

// ---------- Init ----------

document.addEventListener("DOMContentLoaded", async () => {
  bindEvents();
  await renderInitialState();

  sb.auth.onAuthStateChange(async (event) => {
    if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "TOKEN_REFRESHED") {
      await renderInitialState();
    }
  });
});

function bindEvents() {
  $loginForm.addEventListener("submit", onLogin);
  $signoutBtn.addEventListener("click", onSignOut);
  document.getElementById("refresh-btn").addEventListener("click", loadBookings);
  document.querySelectorAll(".admin-filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      activeFilter = btn.getAttribute("data-filter");
      document.querySelectorAll(".admin-filter-btn").forEach(b => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      renderBookings();
    });
  });
}

async function renderInitialState() {
  const { data: { user } } = await sb.auth.getUser();
  if (!user) {
    showLogin();
    return;
  }
  currentEmail = user.email;
  currentRole = await getCurrentRole();

  if (!currentRole) {
    // Login olmuş ama admins tablosunda kaydı yok
    showLogin();
    $loginFb.hidden = false;
    $loginFb.className = "booking-feedback error";
    $loginFb.textContent =
      `${currentEmail} kullanıcısı yönetici listesinde yok. ` +
      `Supabase'te public.admins tablosuna ekleyin.`;
    return;
  }

  showDashboard();
  await loadBookings();
}

function showLogin() {
  $loginSec.hidden = false;
  $loginCard.hidden = false;
  $dashSec.hidden = true;
  $dashboard.hidden = true;
  $userArea.hidden = true;
}

function showDashboard() {
  $loginSec.hidden = true;
  $loginCard.hidden = true;
  $dashSec.hidden = false;
  $dashboard.hidden = false;
  $userArea.hidden = false;
  $userLabel.textContent = currentEmail;
  $roleHint.textContent =
    currentRole.role === "admin"
      ? "Yönetici modunda — tüm rezervasyonları görüyorsun."
      : "Eğitmen modunda — sadece kendi seanslarındaki rezervasyonları görüyorsun.";
}

// ---------- Login / Logout ----------

async function onLogin(e) {
  e.preventDefault();
  $loginFb.hidden = true;
  $loginBtn.disabled = true;
  $loginBtn.textContent = "Giriş yapılıyor…";

  const fd = new FormData($loginForm);
  try {
    await signIn(fd.get("email").trim(), fd.get("password"));
    // onAuthStateChange tetikleyecek
  } catch (err) {
    console.error(err);
    $loginFb.hidden = false;
    $loginFb.className = "booking-feedback error";
    $loginFb.textContent = err.message || "Giriş başarısız.";
    $loginBtn.disabled = false;
    $loginBtn.textContent = "Giriş Yap";
  }
}

async function onSignOut() {
  await signOut();
  currentRole = null;
  currentEmail = null;
  cachedBookings = [];
  showLogin();
}

// ---------- Bookings ----------

async function loadBookings() {
  $listError.hidden = true;
  $list.innerHTML = '<div class="schedule-loading"><p class="paragraph-reg">Yükleniyor…</p></div>';
  $listEmpty.hidden = true;
  try {
    cachedBookings = await fetchUpcomingBookings({ daysAhead: 60 });
    renderBookings();
  } catch (err) {
    console.error(err);
    $listError.hidden = false;
    $list.innerHTML = "";
  }
}

function renderBookings() {
  const filtered = activeFilter === "all"
    ? cachedBookings
    : cachedBookings.filter(b => b.status === activeFilter);

  if (filtered.length === 0) {
    $list.innerHTML = "";
    $listEmpty.hidden = false;
    return;
  }
  $listEmpty.hidden = true;

  // Slot zamanına göre sırala (yaklaşanlar önce)
  filtered.sort((a, b) =>
    new Date(a.slot.starts_at).getTime() - new Date(b.slot.starts_at).getTime()
  );

  $list.innerHTML = filtered.map(renderBookingCard).join("");

  $list.querySelectorAll("[data-action]").forEach(btn => {
    btn.addEventListener("click", () => onAction(btn));
  });
}

function renderBookingCard(b) {
  const dt = new Date(b.slot.starts_at);
  const dayName = DAY_NAMES_LONG[dt.getDay()];
  const dateStr = `${dt.getDate()} ${MONTHS_SHORT[dt.getMonth()]}`;
  const timeStr = formatTimeLabel(dt);
  const serviceName = b.slot.service?.name || "Seans";
  const instructorName = b.slot.instructor?.name || "—";
  const phoneDisplay = b.customer_phone || "—";
  const phoneClean = (b.customer_phone || "").replace(/[^0-9]/g, "");
  const waLink = phoneClean ? `https://wa.me/${phoneClean}` : null;

  const statusKey = b.status;
  const statusCls = `status-pill status-${statusKey}`;
  const statusLabel = STATUS_LABEL[statusKey] || statusKey;

  const actions = [];
  if (statusKey === "pending") {
    actions.push(`<button type="button" class="button-copper" data-action="confirm" data-id="${b.id}">Onayla & WhatsApp</button>`);
    actions.push(`<button type="button" class="button-off-black" data-action="cancel" data-id="${b.id}">İptal</button>`);
  } else if (statusKey === "confirmed") {
    if (waLink) actions.push(`<a class="button-off-black" href="${waLink}" target="_blank" rel="noopener">WhatsApp Aç</a>`);
    actions.push(`<button type="button" class="button-off-black" data-action="complete" data-id="${b.id}">Tamamlandı</button>`);
    actions.push(`<button type="button" class="button-off-black" data-action="no_show" data-id="${b.id}">Gelmedi</button>`);
    actions.push(`<button type="button" class="button-off-black" data-action="cancel" data-id="${b.id}">İptal</button>`);
  } else if (statusKey === "cancelled") {
    actions.push(`<button type="button" class="button-off-black" data-action="reopen" data-id="${b.id}">Yeniden Aç</button>`);
  }

  const notesHtml = b.notes
    ? `<div class="booking-notes"><span class="form-label">Not:</span> ${escapeHtml(b.notes)}</div>`
    : "";

  return `
    <div class="booking-card" data-id="${b.id}">
      <div class="booking-card-header">
        <div>
          <div class="booking-card-when">${dayName} · ${dateStr} · ${timeStr}</div>
          <div class="booking-card-service">${escapeHtml(serviceName)} · ${escapeHtml(instructorName)}</div>
        </div>
        <div class="${statusCls}">${statusLabel}</div>
      </div>

      <div class="booking-card-body">
        <div class="booking-card-row">
          <span class="form-label">Müşteri</span>
          <span>${escapeHtml(b.customer_name)}</span>
        </div>
        <div class="booking-card-row">
          <span class="form-label">Telefon</span>
          <span>
            ${escapeHtml(phoneDisplay)}
            ${waLink ? ` · <a href="${waLink}" target="_blank" rel="noopener">WhatsApp</a>` : ""}
          </span>
        </div>
        ${b.customer_email ? `
        <div class="booking-card-row">
          <span class="form-label">E-posta</span>
          <span><a href="mailto:${escapeHtml(b.customer_email)}">${escapeHtml(b.customer_email)}</a></span>
        </div>` : ""}
        <div class="booking-card-row">
          <span class="form-label">Katılımcı</span>
          <span>${b.participant_count} kişi</span>
        </div>
        ${notesHtml}
      </div>

      <div class="booking-card-actions">${actions.join("")}</div>
    </div>
  `;
}

async function onAction(btn) {
  const id = btn.getAttribute("data-id");
  const action = btn.getAttribute("data-action");
  const booking = cachedBookings.find(b => b.id === id);
  if (!booking) return;

  btn.disabled = true;
  const origText = btn.textContent;
  btn.textContent = "İşleniyor…";

  try {
    if (action === "confirm") {
      const updated = await updateBookingStatus(id, "confirmed");
      // Müşteriye WhatsApp onay mesajı için sekme aç
      const waUrl = buildWhatsAppConfirmLink({ ...booking, ...updated });
      window.open(waUrl, "_blank", "noopener");
      Object.assign(booking, updated);
    } else if (action === "cancel") {
      const reason = prompt("İptal nedeni (opsiyonel):") || null;
      const updated = await updateBookingStatus(id, "cancelled", { cancel_reason: reason });
      Object.assign(booking, updated);
    } else if (action === "complete") {
      const updated = await updateBookingStatus(id, "completed");
      Object.assign(booking, updated);
    } else if (action === "no_show") {
      const updated = await updateBookingStatus(id, "no_show");
      Object.assign(booking, updated);
    } else if (action === "reopen") {
      const updated = await updateBookingStatus(id, "pending", { cancel_reason: null, cancelled_at: null });
      Object.assign(booking, updated);
    }
    renderBookings();
  } catch (err) {
    console.error(err);
    alert("İşlem başarısız: " + (err.message || err));
    btn.disabled = false;
    btn.textContent = origText;
  }
}

// ---------- Util ----------

function escapeHtml(s) {
  return String(s ?? "").replace(/[&<>"']/g, c => (
    { "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]
  ));
}
