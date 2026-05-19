// Alleyfit Wellness Studio — Google yorumları (placeholder content)
// Gerçek API entegrasyonu sonradan eklenebilir; şimdilik statik kart grid'i.

export type Review = {
  name: string;
  initials: string;
  rating: 1 | 2 | 3 | 4 | 5;
  text: string;
  daysAgo: string;
};

export const reviews: Review[] = [
  {
    name: "Zeynep Yıldız",
    initials: "ZY",
    rating: 5,
    text: "Şile'nin en huzurlu pilates stüdyosu. Reformer dersleri inanılmaz, Ayşe Hanım'ın anlatımı çok sabırlı ve dikkatli. Her seans sonunda kendimi yenilenmiş hissediyorum.",
    daysAgo: "2 hafta önce",
  },
  {
    name: "Selin Aktaş",
    initials: "SA",
    rating: 5,
    text: "Ekipmanlar yepyeni, salonlar tertemiz. Atmosfer çok şık ve dingin. Stüdyonun ilk günüm gibi hissettiğim her dersten sonra hâlâ aynı keyfi alıyorum.",
    daysAgo: "1 ay önce",
  },
  {
    name: "Burcu Demir",
    initials: "BD",
    rating: 5,
    text: "Hamilelik döneminde prenatal sınıfı için Ece Hanım'a geliyorum. Hem güvenli hem rahatlatıcı bir akış. Özellikle bekleyiş döneminde olan herkese içtenlikle tavsiye ederim.",
    daysAgo: "3 hafta önce",
  },
  {
    name: "Aslı Kaya",
    initials: "AK",
    rating: 5,
    text: "Özel seans paketi aldım, Selin Hanım hedeflerime çok hızlı yöneltti. Spor salonlarından beklediğimi bulamadım, burada formuma gerçek anlamda kavuştum.",
    daysAgo: "5 gün önce",
  },
  {
    name: "Defne Şahin",
    initials: "DŞ",
    rating: 5,
    text: "Mat pilatesleri günün stresini alıyor. Cadillac üzerinde çalışmak çok özel bir deneyim — stüdyonun her detayı incelikle düşünülmüş.",
    daysAgo: "1 hafta önce",
  },
  {
    name: "Mert Özkan",
    initials: "MÖ",
    rating: 4,
    text: "Çok kaliteli bir stüdyo, eğitmenler son derece profesyonel. Erken sabah seansları biraz daha çeşitlense mükemmel olurdu. Yine de gönül rahatlığıyla tavsiye ederim.",
    daysAgo: "2 ay önce",
  },
];

export const reviewStats = {
  rating: "4.9",
  count: "180+",
  satisfactionPercent: "98",
};

export const GOOGLE_REVIEWS_URL =
  "https://www.google.com/maps/search/Alleyfit+Wellness+Studio+%C5%9Eile";
