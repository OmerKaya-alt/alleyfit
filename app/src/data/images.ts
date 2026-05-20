// Görsel kataloğu — Feminine pilates / ballet / sanatsal kadın estetik.
// Erkek/manzara/berber tarzı YASAK.
//
// NOT: Marilyn Monroe vintage fotoğrafları local olarak gelince
//   app/public/photos/marilyn-1.jpg  → shoulder-stand
//   app/public/photos/marilyn-2.jpg  → boat / V-sit
//   app/public/photos/marilyn-3.jpg  → forward-fold
// MARILYN sabiti üzerinden tek noktadan bağlanır. Şu an dosyalar yok →
// Unsplash fallback aktif. Dosyalar geldiğinde aşağıdaki yorum satırı
// yorumdan çıkarılarak Marilyn referansları aktive edilir.

const u = (id: string, w = 2000, q = 85) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=${q}`;

// Marilyn local — kullanıcı dosyaları yerleştirince aktif olacak
// const MARILYN = {
//   shoulderStand: "/photos/marilyn-1.jpg",
//   boatPose: "/photos/marilyn-2.jpg",
//   forwardFold: "/photos/marilyn-3.jpg",
// };

const ID = {
  womanYoga: "1518611012118-696072aa579a",
  reformerEquipment: "1571902943202-507ec2618e8f",
  pilatesMat: "1599447421416-3414500d18a5",
  womanStretch: "1518310383802-640c2de311b2",
  yogaPoseFlow: "1591291621164-2c6367723315",
  womanFitness: "1545389336-cf090694435e",
  yogaWomanLight: "1607962837359-5e7e89f86776",
  pilatesStudio: "1593810451137-6dc3b4f5fb8f",
  pilatesReformer: "1583454110551-21f2fa2afe61",
  womanFlow: "1574680096145-d05b474e2155",
  balletStudio: "1535525153412-5a42439a210d",
  balletPose: "1518657060488-9b6ea7a89bbe",
  yogaSerene: "1554244933-d876deb6b2ff",
  womanCalm: "1599901860904-17e6ed7083a0",
  yogaMatPose: "1593164842264-854604db2260",
  trainerA: "1494790108377-be9c29b29330",
  trainerB: "1438761681033-6461ffad8d80",
  trainerC: "1487412720507-e7ab37603c6f",
  trainerD: "1544005313-94ddf0286df2",
};

export const images = {
  hero: {
    studio: u(ID.womanYoga),
    reformer: u(ID.reformerEquipment),
    matWide: u(ID.pilatesMat),
    barreWide: u(ID.womanStretch),
    classesWide: u(ID.yogaPoseFlow),
    aboutWide: u(ID.womanYoga),
    contactWide: u(ID.pilatesMat),
    corporateWide: u(ID.womanStretch),
    scheduleWide: u(ID.yogaPoseFlow),
  },
  cinematic: [
    u(ID.womanStretch),
    u(ID.balletPose),
    u(ID.yogaPoseFlow),
    u(ID.yogaWomanLight),
  ],
  portrait: {
    reformer: u(ID.reformerEquipment, 1200),
    mat: u(ID.pilatesMat, 1200),
    barre: u(ID.balletStudio, 1200),
    prenatal: u(ID.womanCalm, 1200),
    private: u(ID.womanStretch, 1200),
    studio1: u(ID.pilatesStudio, 1200),
    studio2: "/photos/story.svg",
    standards: u(ID.womanYoga, 1200),
  },
  square: {
    detail1: u(ID.yogaMatPose, 800),
    detail2: u(ID.womanFitness, 800),
    detail3: u(ID.womanFlow, 800),
  },
  strip: {
    aboutTour: u(ID.balletStudio),
    studioTour: u(ID.pilatesStudio),
  },
  trainers: [
    u(ID.trainerA, 1200),
    u(ID.trainerB, 1200),
    u(ID.trainerC, 1200),
    u(ID.trainerD, 1200),
  ],
};
