// ============================================================
// program.js — Program sayfası: slot listesi + booking modal
// ============================================================

import {
  fetchSlotsWithBookingCounts,
  createBooking,
  formatTimeLabel, isoDate, startOfWeek, addDays
} from "./supabase.js";

const DAY_NAMES_SHORT = ["Pzt", "Sal", "Çrş", "Prş", "Cum", "Cmt", "Paz"];
const DAY_NAMES_LONG  = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];
const MONTHS_SHORT    = ["Oca","Şub","Mar","Nis","May","Haz","Tem","Ağu","Eyl","Eki","Kas","Ara"];

// ---------- DOM ----------

const $strip   = document.getElementById("schedule-day-strip");
const $days    = document.getElementById("schedule-days");
const $weekLbl = document.getElementById("schedule-week-label");
const $err     = document.getElementById("schedule-error");

const $modal       = document.getElementById("booking-modal");
const $form        = document.getElementById("booking-form");
const $modalTitle  = document.getElementById("booking-modal-title");
const $modalSumry  = document.getElementById("booking-slot-summary");
const $slotIdInput = document.getElementById("booking-slot-id");
const $participantRow = document.getElementById("booking-participant-row");
const $participantInp = document.getElementById("booking-participant-count");
const $feedback    = document.getElementById("booking-feedback");
const $submitBtn   = document.getElementById("booking-submit");

// ---------- State ----------

let currentWeekStart = startOfWeek(new Date());
let activeDayIndex   = clamp(daysBetween(currentWeekStart, new Date()), 0, 6);
let weekSlots        = []; // slots for current week
let weekSlotsByDay   = new Map(); // 0-6 → slot[]

// ---------- Init ----------

document.addEventListener("DOMContentLoaded", () => {
  bindWeekNav();
  bindModal();
  loadWeek();
});

function bindWeekNav() {
  document.querySelectorAll("[data-week-step]").forEach(btn => {
    btn.addEventListener("click", () => {
      const step = parseInt(btn.getAttribute("data-week-step"), 10);
      currentWeekStart = addDays(currentWeekStart, step * 7);
      activeDayIndex = 0;
      loadWeek();
    });
  });
}

function bindModal() {
  $modal.querySelectorAll("[data-modal-close]").forEach(el => {
    el.addEventListener("click", closeModal);
  });
  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && !$modal.hidden) closeModal();
  });
  $form.addEventListener("submit", onSubmitBooking);
}

// ---------- Veri yükleme ----------

async function loadWeek() {
  $err.hidden = true;
  $days.innerHTML = '<div class="schedule-loading"><p class="paragraph-reg">Program yükleniyor…</p></div>';
  $weekLbl.textContent = formatWeekRange(currentWeekStart);

  const from = new Date(currentWeekStart);
  const to   = addDays(currentWeekStart, 7);

  try {
    const slots = await fetchSlotsWithBookingCounts(from.toISOString(), to.toISOString());
    weekSlots = slots;
    weekSlotsByDay = groupByDay(slots, currentWeekStart);
    renderDayStrip();
    renderActiveDay();
  } catch (err) {
    console.error(err);
    $err.hidden = false;
    $days.innerHTML = "";
  }
}

function groupByDay(slots, weekStart) {
  const map = new Map();
  for (let i = 0; i < 7; i++) map.set(i, []);
  slots.forEach(s => {
    const d = new Date(s.starts_at);
    const idx = daysBetween(weekStart, d);
    if (idx >= 0 && idx < 7) map.get(idx).push(s);
  });
  // Saate göre sırala
  for (const arr of map.values()) {
    arr.sort((a, b) => new Date(a.starts_at) - new Date(b.starts_at));
  }
  return map;
}

// ---------- Render ----------

function renderDayStrip() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const html = Array.from({ length: 7 }, (_, i) => {
    const d = addDays(currentWeekStart, i);
    const isToday = sameDay(d, today);
    const isActive = i === activeDayIndex;
    const cls = ["schedule-day-tab"];
    if (isActive) cls.push("w--current");
    if (isToday)  cls.push("is-today");
    return `
      <button type="button" class="${cls.join(" ")}" data-day-idx="${i}" role="tab" aria-selected="${isActive}">
        <span class="schedule-day-name">${DAY_NAMES_SHORT[i]}${isToday ? " ·" : ""}</span>
        <span class="schedule-day-date">${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}</span>
      </button>
    `;
  }).join("");

  $strip.innerHTML = html;
  $strip.querySelectorAll("[data-day-idx]").forEach(btn => {
    btn.addEventListener("click", () => {
      activeDayIndex = parseInt(btn.getAttribute("data-day-idx"), 10);
      renderDayStrip();
      renderActiveDay();
    });
  });
}

function renderActiveDay() {
  const idx = activeDayIndex;
  const dayDate = addDays(currentWeekStart, idx);
  const slots = weekSlotsByDay.get(idx) || [];

  const slotsHtml = slots.length
    ? slots.map(renderSlot).join("")
    : `<p class="paragraph-reg schedule-empty-day">Bu gün için program henüz tanımlı değil.</p>`;

  const todayBadge = sameDay(dayDate, todayMidnight()) ? ` <span class="paragraph-reg" style="color:var(--vc-copper)">· Bugün</span>` : "";

  $days.innerHTML = `
    <div class="schedule-day-panel">
      <h2 class="h2 no-margin">${DAY_NAMES_LONG[idx]} · ${dayDate.getDate()} ${MONTHS_SHORT[dayDate.getMonth()]}${todayBadge}</h2>
      ${slotsHtml}
    </div>
  `;

  $days.querySelectorAll("[data-book-slot]").forEach(btn => {
    btn.addEventListener("click", () => openModal(btn.getAttribute("data-book-slot")));
  });
}

function renderSlot(slot) {
  const dt = new Date(slot.starts_at);
  const timeStr = formatTimeLabel(dt);
  const serviceName = slot.service?.name || "Seans";
  const serviceCode = slot.service?.code || "";
  const capacity = slot.capacity || slot.service?.capacity || 1;
  const isClosed = slot.status !== "open";

  // Görsel sınıf — service code'a göre
  let stateClass = "";
  if (isClosed) {
    stateClass = serviceCode === "grup" || serviceCode === "spinning" ? "is-full" : "is-private";
  } else {
    stateClass = capacity > 1 ? "is-open" : "is-empty";
  }

  const titleSuffix = (serviceCode === "grup" || serviceCode === "spinning") && capacity > 1
    ? ` · ${capacity} kişilik`
    : "";

  const instructorName = slot.instructor?.name || "Alleyfit";
  const inPast = dt < new Date();

  let actionHtml;
  if (inPast) {
    actionHtml = `<span class="slot-status">Geçti</span>`;
  } else if (isClosed) {
    actionHtml = `<span class="slot-status">${stateClass === "is-full" ? "Dolu" : "Rezerve"}</span>`;
  } else {
    const label = stateClass === "is-empty" ? "Talep Et" : "Rezervasyon";
    actionHtml = `<button type="button" class="button-copper" data-book-slot="${slot.id}">${label}</button>`;
  }

  const subline = isClosed
    ? (stateClass === "is-full" ? "Grup seansı" : (serviceCode === "couple" ? "Çift seansı" : "Eğitmen seansta"))
    : (stateClass === "is-empty" ? "Birebir / couple / grup için talep" : `${instructorName} · açık kontenjan`);

  return `
    <div class="schedule-slot ${stateClass}">
      <div class="schedule-slot-time">${timeStr}</div>
      <div class="schedule-slot-info">
        <div class="schedule-slot-class">${escapeHtml(serviceName)}${titleSuffix}</div>
        <div class="schedule-slot-instructor">${escapeHtml(subline)}</div>
      </div>
      ${actionHtml}
    </div>
  `;
}

// ---------- Modal ----------

function openModal(slotId) {
  const slot = weekSlots.find(s => s.id === slotId);
  if (!slot) return;

  const dt = new Date(slot.starts_at);
  const dayIdx = dt.getDay() === 0 ? 6 : dt.getDay() - 1;
  $slotIdInput.value = slot.id;

  $modalTitle.textContent = `${slot.service?.name || "Seans"} · ${DAY_NAMES_LONG[dayIdx]}`;
  $modalSumry.textContent =
    `${dt.getDate()} ${MONTHS_SHORT[dt.getMonth()]} ${dt.getFullYear()} · ` +
    `${formatTimeLabel(dt)} · ${slot.instructor?.name || "Alleyfit"}`;

  // Couple/grup ise katılımcı sayısı seçeneği aç
  const code = slot.service?.code;
  if (code === "couple" || code === "grup" || code === "spinning") {
    $participantRow.hidden = false;
    $participantInp.max = slot.capacity || slot.service?.capacity || 1;
    $participantInp.value = code === "couple" ? 2 : 1;
  } else {
    $participantRow.hidden = true;
    $participantInp.value = 1;
  }

  $feedback.hidden = true;
  $feedback.textContent = "";
  $feedback.className = "booking-feedback";
  $submitBtn.disabled = false;

  $modal.hidden = false;
  $modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  setTimeout(() => document.getElementById("booking-name").focus(), 50);
}

function closeModal() {
  $modal.hidden = true;
  $modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
  $form.reset();
}

async function onSubmitBooking(e) {
  e.preventDefault();
  $feedback.hidden = true;
  $submitBtn.disabled = true;
  $submitBtn.textContent = "Gönderiliyor…";

  const fd = new FormData($form);
  try {
    await createBooking({
      slot_id: fd.get("slot_id"),
      name: fd.get("name").trim(),
      phone: fd.get("phone").trim(),
      email: (fd.get("email") || "").trim() || null,
      participant_count: parseInt(fd.get("participant_count") || "1", 10),
      notes: (fd.get("notes") || "").trim() || null
    });

    $feedback.hidden = false;
    $feedback.className = "booking-feedback success";
    $feedback.textContent = "Talebiniz alındı! En kısa sürede WhatsApp üzerinden geri dönüş yapacağız.";
    $submitBtn.textContent = "Gönderildi";
    setTimeout(closeModal, 2500);
  } catch (err) {
    console.error(err);
    $feedback.hidden = false;
    $feedback.className = "booking-feedback error";
    $feedback.textContent = err.message?.includes("yer kalmadı")
      ? "Bu saatte yer kalmamış görünüyor. Başka bir saat seçer misiniz?"
      : "Talep gönderilemedi. Lütfen bilgileri kontrol edip tekrar deneyin.";
    $submitBtn.disabled = false;
    $submitBtn.textContent = "Talebi Gönder";
  }
}

// ---------- Yardımcılar ----------

function daysBetween(a, b) {
  const ms = b.getTime() - a.getTime();
  return Math.floor(ms / 86400000);
}

function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear()
      && a.getMonth() === b.getMonth()
      && a.getDate() === b.getDate();
}

function todayMidnight() {
  const t = new Date(); t.setHours(0, 0, 0, 0); return t;
}

function clamp(n, lo, hi) {
  return Math.max(lo, Math.min(hi, n));
}

function formatWeekRange(weekStart) {
  const start = weekStart;
  const end = addDays(weekStart, 6);
  const sameMonth = start.getMonth() === end.getMonth();
  if (sameMonth) {
    return `${start.getDate()}–${end.getDate()} ${MONTHS_SHORT[start.getMonth()]} ${end.getFullYear()}`;
  }
  return `${start.getDate()} ${MONTHS_SHORT[start.getMonth()]} – ${end.getDate()} ${MONTHS_SHORT[end.getMonth()]} ${end.getFullYear()}`;
}

function escapeHtml(s) {
  return String(s ?? "").replace(/[&<>"']/g, c => (
    { "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]
  ));
}
