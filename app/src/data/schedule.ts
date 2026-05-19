export type Slot = {
  day: "Pazartesi" | "Salı" | "Çarşamba" | "Perşembe" | "Cuma" | "Cumartesi" | "Pazar";
  date: string;
  time: string;
  duration: string;
  classSlug: "reformer" | "mat" | "barre" | "prenatal" | "ozel";
  instructor: string;
  status: "open" | "waitlist";
};

export const schedule: Slot[] = [
  // Cumartesi — 9 Mayıs 2026
  { day: "Cumartesi", date: "2026-05-09", time: "07:00", duration: "50 dk", classSlug: "mat",      instructor: "Aleyna",   status: "open" },
  { day: "Cumartesi", date: "2026-05-09", time: "08:30", duration: "50 dk", classSlug: "reformer", instructor: "Aleyna",   status: "waitlist" },
  { day: "Cumartesi", date: "2026-05-09", time: "10:00", duration: "45 dk", classSlug: "barre",    instructor: "Aleyna",  status: "open" },
  { day: "Cumartesi", date: "2026-05-09", time: "12:00", duration: "50 dk", classSlug: "prenatal", instructor: "Aleyna",   status: "open" },
  { day: "Cumartesi", date: "2026-05-09", time: "17:30", duration: "50 dk", classSlug: "reformer", instructor: "Aleyna",  status: "waitlist" },
  { day: "Cumartesi", date: "2026-05-09", time: "18:30", duration: "50 dk", classSlug: "mat",      instructor: "Aleyna",  status: "open" },
  { day: "Cumartesi", date: "2026-05-09", time: "19:30", duration: "50 dk", classSlug: "reformer", instructor: "Aleyna",   status: "open" },
  { day: "Cumartesi", date: "2026-05-09", time: "20:30", duration: "60 dk", classSlug: "ozel",     instructor: "Aleyna",  status: "waitlist" },

  // Pazar — 10 Mayıs 2026
  { day: "Pazar", date: "2026-05-10", time: "07:00", duration: "50 dk", classSlug: "mat",      instructor: "Aleyna",   status: "open" },
  { day: "Pazar", date: "2026-05-10", time: "08:30", duration: "50 dk", classSlug: "reformer", instructor: "Aleyna",  status: "open" },
  { day: "Pazar", date: "2026-05-10", time: "10:00", duration: "50 dk", classSlug: "prenatal", instructor: "Aleyna",   status: "open" },
  { day: "Pazar", date: "2026-05-10", time: "12:00", duration: "45 dk", classSlug: "barre",    instructor: "Aleyna",  status: "waitlist" },
  { day: "Pazar", date: "2026-05-10", time: "17:30", duration: "50 dk", classSlug: "reformer", instructor: "Aleyna",   status: "open" },
  { day: "Pazar", date: "2026-05-10", time: "18:30", duration: "50 dk", classSlug: "mat",      instructor: "Aleyna",   status: "open" },
  { day: "Pazar", date: "2026-05-10", time: "19:30", duration: "50 dk", classSlug: "reformer", instructor: "Aleyna",  status: "waitlist" },
  { day: "Pazar", date: "2026-05-10", time: "20:30", duration: "50 dk", classSlug: "mat",      instructor: "Aleyna",  status: "open" },

  // Pazartesi — 11 Mayıs 2026
  { day: "Pazartesi", date: "2026-05-11", time: "07:00", duration: "50 dk", classSlug: "reformer", instructor: "Aleyna",   status: "open" },
  { day: "Pazartesi", date: "2026-05-11", time: "08:30", duration: "50 dk", classSlug: "mat",      instructor: "Aleyna",  status: "open" },
  { day: "Pazartesi", date: "2026-05-11", time: "10:00", duration: "50 dk", classSlug: "prenatal", instructor: "Aleyna",   status: "open" },
  { day: "Pazartesi", date: "2026-05-11", time: "12:00", duration: "50 dk", classSlug: "reformer", instructor: "Aleyna",  status: "waitlist" },
  { day: "Pazartesi", date: "2026-05-11", time: "17:30", duration: "45 dk", classSlug: "barre",    instructor: "Aleyna",  status: "open" },
  { day: "Pazartesi", date: "2026-05-11", time: "18:30", duration: "50 dk", classSlug: "reformer", instructor: "Aleyna",   status: "open" },
  { day: "Pazartesi", date: "2026-05-11", time: "19:30", duration: "50 dk", classSlug: "mat",      instructor: "Aleyna",   status: "open" },
  { day: "Pazartesi", date: "2026-05-11", time: "20:30", duration: "60 dk", classSlug: "ozel",     instructor: "Aleyna",  status: "open" },

  // Salı — 12 Mayıs 2026
  { day: "Salı", date: "2026-05-12", time: "07:00", duration: "50 dk", classSlug: "mat",      instructor: "Aleyna",   status: "open" },
  { day: "Salı", date: "2026-05-12", time: "08:30", duration: "50 dk", classSlug: "reformer", instructor: "Aleyna",  status: "open" },
  { day: "Salı", date: "2026-05-12", time: "10:00", duration: "50 dk", classSlug: "prenatal", instructor: "Aleyna",   status: "open" },
  { day: "Salı", date: "2026-05-12", time: "12:00", duration: "50 dk", classSlug: "reformer", instructor: "Aleyna",   status: "open" },
  { day: "Salı", date: "2026-05-12", time: "17:30", duration: "45 dk", classSlug: "barre",    instructor: "Aleyna",  status: "waitlist" },
  { day: "Salı", date: "2026-05-12", time: "18:30", duration: "50 dk", classSlug: "mat",      instructor: "Aleyna",  status: "open" },
  { day: "Salı", date: "2026-05-12", time: "19:30", duration: "50 dk", classSlug: "reformer", instructor: "Aleyna",  status: "waitlist" },
  { day: "Salı", date: "2026-05-12", time: "20:30", duration: "50 dk", classSlug: "mat",      instructor: "Aleyna",   status: "open" },

  // Çarşamba — 13 Mayıs 2026
  { day: "Çarşamba", date: "2026-05-13", time: "07:00", duration: "50 dk", classSlug: "reformer", instructor: "Aleyna",   status: "open" },
  { day: "Çarşamba", date: "2026-05-13", time: "08:30", duration: "50 dk", classSlug: "mat",      instructor: "Aleyna",  status: "open" },
  { day: "Çarşamba", date: "2026-05-13", time: "10:00", duration: "50 dk", classSlug: "prenatal", instructor: "Aleyna",   status: "open" },
  { day: "Çarşamba", date: "2026-05-13", time: "12:00", duration: "45 dk", classSlug: "barre",    instructor: "Aleyna",  status: "open" },
  { day: "Çarşamba", date: "2026-05-13", time: "17:30", duration: "50 dk", classSlug: "reformer", instructor: "Aleyna",  status: "open" },
  { day: "Çarşamba", date: "2026-05-13", time: "18:30", duration: "50 dk", classSlug: "mat",      instructor: "Aleyna",   status: "open" },
  { day: "Çarşamba", date: "2026-05-13", time: "19:30", duration: "60 dk", classSlug: "ozel",     instructor: "Aleyna",  status: "waitlist" },
  { day: "Çarşamba", date: "2026-05-13", time: "20:30", duration: "50 dk", classSlug: "reformer", instructor: "Aleyna",   status: "open" },

  // Perşembe — 14 Mayıs 2026
  { day: "Perşembe", date: "2026-05-14", time: "07:00", duration: "50 dk", classSlug: "mat",      instructor: "Aleyna",   status: "open" },
  { day: "Perşembe", date: "2026-05-14", time: "08:30", duration: "50 dk", classSlug: "reformer", instructor: "Aleyna",  status: "open" },
  { day: "Perşembe", date: "2026-05-14", time: "10:00", duration: "50 dk", classSlug: "prenatal", instructor: "Aleyna",   status: "open" },
  { day: "Perşembe", date: "2026-05-14", time: "12:00", duration: "50 dk", classSlug: "reformer", instructor: "Aleyna",   status: "waitlist" },
  { day: "Perşembe", date: "2026-05-14", time: "17:30", duration: "45 dk", classSlug: "barre",    instructor: "Aleyna",  status: "open" },
  { day: "Perşembe", date: "2026-05-14", time: "18:30", duration: "50 dk", classSlug: "mat",      instructor: "Aleyna",  status: "open" },
  { day: "Perşembe", date: "2026-05-14", time: "19:30", duration: "50 dk", classSlug: "reformer", instructor: "Aleyna",  status: "open" },
  { day: "Perşembe", date: "2026-05-14", time: "20:30", duration: "50 dk", classSlug: "mat",      instructor: "Aleyna",   status: "open" },

  // Cuma — 15 Mayıs 2026
  { day: "Cuma", date: "2026-05-15", time: "07:00", duration: "50 dk", classSlug: "reformer", instructor: "Aleyna",   status: "open" },
  { day: "Cuma", date: "2026-05-15", time: "08:30", duration: "50 dk", classSlug: "mat",      instructor: "Aleyna",  status: "open" },
  { day: "Cuma", date: "2026-05-15", time: "10:00", duration: "50 dk", classSlug: "prenatal", instructor: "Aleyna",   status: "open" },
  { day: "Cuma", date: "2026-05-15", time: "12:00", duration: "50 dk", classSlug: "reformer", instructor: "Aleyna",  status: "waitlist" },
  { day: "Cuma", date: "2026-05-15", time: "17:30", duration: "45 dk", classSlug: "barre",    instructor: "Aleyna",  status: "open" },
  { day: "Cuma", date: "2026-05-15", time: "18:30", duration: "50 dk", classSlug: "mat",      instructor: "Aleyna",   status: "waitlist" },
  { day: "Cuma", date: "2026-05-15", time: "19:30", duration: "60 dk", classSlug: "ozel",     instructor: "Aleyna",  status: "open" },
  { day: "Cuma", date: "2026-05-15", time: "20:30", duration: "50 dk", classSlug: "reformer", instructor: "Aleyna",   status: "open" },
];
