// Alleyfit Wellness Studio — Google yorumları (Gerçek Google Yorumları)

export type Review = {
  name: string;
  initials: string;
  rating: 1 | 2 | 3 | 4 | 5;
  text: string;
  daysAgo: string;
};

export const reviews: Review[] = [
  {
    name: "Feyza Kayahan",
    initials: "FK",
    rating: 5,
    text: "Aleyna hocamız da mekanın kendisi de çok sıcak ve çok güzel gerçekten. Keyif alarak derslerimize gidiyoruz ve şekilleniyoruz. Gitmek isteyenlere gönül rahatlığıyla tavsiye edilir :)",
    daysAgo: "7 ay önce",
  },
  {
    name: "Funda Karaosman",
    initials: "FK",
    rating: 5,
    text: "Aleyna hocam çok profesyonel ve disiplinli. Gerçekten işe yarar bir pilates deneyimi istiyorsanız kesinlikle Şile’de tek adres. Sizi sürekli daha iyisini yapmaya zorlayarak geliştirmeye özen gösteriyor. Spinning dersleri ile de kilo verme sürecime destek oldu. Emeği geçen herkese çok teşekkürler, aile ortamı gibi sıcacık bir stüdyo.",
    daysAgo: "1 ay önce",
  },
  {
    name: "Elif Kaya",
    initials: "EK",
    rating: 5,
    text: "Ben 6 kişilik grup dersi alıyorum. Bireysel ilgilenmesi, hareketi doğru yapıp yapmama konusunda yönlendirmesi çok kıymetli üstelik keyifli ders süreci geçiriyoruz. Sırt ve bacak ağrılarıma ayrıca çok iyi geldi, çok beğendim.",
    daysAgo: "2 ay önce",
  },
  {
    name: "Yiğit Mertol Kayabaşı",
    initials: "YK",
    rating: 5,
    text: "İstanbul'da gittiğim stüdyolar arasında Aleyna açık ara en iyisi. Çok metodolojik, sistemli ilerliyor. Bel fıtığı hastasıyım, 3 ay gibi bir sürede ağrılarım çok azaldı ve postürüm çok düzeldi. Çok teşekkürler!",
    daysAgo: "8 ay önce",
  },
  {
    name: "Berivan Ersöz",
    initials: "BE",
    rating: 5,
    text: "Şile'de böyle bir imkanın sunulması efsane olmuş. Çok nezih bir yer. Hocanın ilgisi ve alakası muhteşem. Şile'de spor deneyimim oldu ama asla bu kadar hevesle başlamamıştım. Sağlıklı ve fit vücut isteyen herkese tavsiye ederim.",
    daysAgo: "6 ay önce",
  },
  {
    name: "Yaren K",
    initials: "YK",
    rating: 5,
    text: "Neredeyse 1 senedir birebir ders alıyorum. İnanılmaz memnunum, postürüm düzeldi, daha dik duruyorum. Sırt kaslarım gelişti, boyun ağrılarımı çok iyi toparladık. Aleyna dünya tatlısı bir insan, işinde çok çok başarılı...",
    daysAgo: "6 ay önce",
  },
  {
    name: "Büşra Nur Tekin",
    initials: "BT",
    rating: 5,
    text: "Kesinlikle benzersiz bir pilates deneyimi yaşamak için uğramanız gereken bir salon. Çok tecrübeli bir eğitmenle çalışıyorsunuz. Bel fıtığı ameliyatım sonrası tüm endişelerimi 2-3 derste yok etmeyi başardı. Pilates buysa benim daha önce yaptıklarım neydi dedirtiyor.",
    daysAgo: "1 yıl önce",
  },
  {
    name: "Lale İbek",
    initials: "Lİ",
    rating: 5,
    text: "İnanılmaz pozitif, motive etme konusunda muhteşem Aleyna hocam. Çok ilgili. Benim gibi spor sevmeyen biri bile 2 aydır düzenli geliyorsa bu tamamen hocamızın başarısı. Kısa sürede harika sonuçlar aldım.",
    daysAgo: "11 ay önce",
  },
  {
    name: "Yasemin Neyim",
    initials: "YN",
    rating: 5,
    text: "Pilatese başlamadan önce hiç bu kadar keyifle devam edeceğimi düşünmezdim fakat Aleyna Hocamızın tatlılığı ve profesyonelliği sayesinde haftanın her günü dersim olsa koşa koşa gider oldum. İyi ki Alleyfitle tanışmışız.",
    daysAgo: "1 yıl önce",
  },
  {
    name: "Melek Çolak Atmaca",
    initials: "MA",
    rating: 5,
    text: "Pilates salonunun temizliği ve düzeni gerçekten harika; içeri girer girmez kendimi çok rahat hissediyorum. Eğitmenimiz hem ilgili hem de motive edici, hareketleri doğru yapmam için her zaman dikkatle yönlendiriyor.",
    daysAgo: "7 ay önce",
  },
  {
    name: "Mustafa Şahin",
    initials: "MŞ",
    rating: 5,
    text: "Şile merkezde, ulaşımın gayet kolay olduğu bir stüdyo. İç mekan tasarımı çok başarılı; ışıklandırma ve spor aletleri dahi uyumlu. Ortopedik olarak şüpheyle başladığım süreçte tüm soru işaretlerim kalktı. Aleyna Hanım'a çok teşekkürler.",
    daysAgo: "2 yıl önce",
  },
  {
    name: "Ceren Alev",
    initials: "CA",
    rating: 5,
    text: "Derslerde çok motive edici ve sabırlı. Hareketleri doğru yapmam için tek tek ilgileniyor. Pilatesi bana sevdirdiği için çok teşekkür ederim. 😊",
    daysAgo: "9 ay önce",
  },
];

export const reviewStats = {
  rating: "5.0",
  count: "70+",
  satisfactionPercent: "100",
};

export const GOOGLE_REVIEWS_URL =
  "https://www.google.com/search?q=Alleyfit+Wellness+Studio+Yorumlar";
