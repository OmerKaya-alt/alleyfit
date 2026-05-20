// Görsel kataloğu — Feminine pilates / yoga / sanatsal kadın estetiği.
// Erkek / ağırlık salonu / manzara / berber tarzı görsel YASAK.
//
// Buradaki tüm Unsplash ID'leri canlı (200) ve içerik olarak doğrulanmıştır.
// Yeni ID eklerken önce görseli kontrol et — ölü link veya uygunsuz içerik ekleme.
//
// Gerçek stüdyo/eğitmen fotoğrafları geldiğinde app/public/photos/ altına
// konup ilgili alan buradan o dosyaya bağlanabilir.

const u = (id: string, w = 2000, q = 85) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=${q}`;

const ID = {
  womanYoga: "1518611012118-696072aa579a", // grup pilates, pembe matlar
  pilatesMat: "1599447421416-3414500d18a5", // mat pilates, tekli
  womanStretch: "1518310383802-640c2de311b2", // grup fitness, hafif ağırlık
  womanFitness: "1545389336-cf090694435e", // ağaç pozu, dış mekân
  womanCalm: "1599901860904-17e6ed7083a0", // siyah-beyaz pilates
  yogaPoseFlow: "1591291621164-2c6367723315", // pembe mat + ekipman düzeni
  yogaMatPose: "1593164842264-854604db2260", // aydınlık stüdyo, pilates
  yogaSerene: "1554244933-d876deb6b2ff", // meditasyon, sakin
  balletStudio: "1535525153412-5a42439a210d", // dans, hareket
};

export const images = {
  hero: {
    studio: u(ID.womanYoga),
    reformer: u(ID.womanFitness),
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
    u(ID.yogaMatPose),
    u(ID.yogaPoseFlow),
    u(ID.womanFitness),
  ],
  portrait: {
    reformer: u(ID.womanFitness, 1200),
    mat: u(ID.pilatesMat, 1200),
    barre: u(ID.balletStudio, 1200),
    prenatal: u(ID.womanCalm, 1200),
    private: u(ID.womanStretch, 1200),
    studio1: u(ID.yogaMatPose, 1200),
    studio2: u(ID.yogaSerene, 1200),
    standards: u(ID.womanYoga, 1200),
  },
  square: {
    detail1: u(ID.yogaMatPose, 800),
    detail2: u(ID.womanCalm, 800),
    detail3: u(ID.yogaSerene, 800),
  },
  strip: {
    aboutTour: u(ID.balletStudio),
    studioTour: u(ID.yogaMatPose),
  },
};
