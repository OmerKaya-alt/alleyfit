import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

export type Lang = "tr" | "en";

/* ------------------------------------------------------------------ */
/*  i18n dictionary — TR / EN tam çeviri.                              */
/*  data dosyaları (classes, trainers, reviews) kendi i18n alanlarına  */
/*  sahip; bu dictionary sayfa içeriklerini ve UI metinlerini kapsar.  */
/* ------------------------------------------------------------------ */

const dict = {
  tr: {
    // Nav
    "nav.about": "Hakkımızda",
    "nav.classes": "Dersler",
    "nav.studio": "Stüdyo",
    "nav.program": "Randevu",
    "nav.corporate": "Kurumsal",
    "nav.reviews": "Yorumlar",
    "nav.contact": "Rezervasyon / İletişim",
    "cta.reserve": "REZERVASYON",

    // Studio hero + sections
    "studio.eyebrow": "ALLEYFIT PILATES · ŞİLE",
    "studio.title": "Pilatesin En İyi Hali",
    "studio.subtitle":
      "Şile'de modern Pilates stüdyosu — her seviyede, her bedende, her gün.",
    "studio.cta1": "REZERVASYON",
    "studio.cta2": "DERSLERİMİZ",
    "studio.split1.eyebrow": "REFORMER",
    "studio.split1.title": "Yay direnci, kararlı kontrol.",
    "studio.split1.body":
      "Reformer ekipmanın yaylı direnciyle bütün gövdeyi tek bir akışta çalıştıran modern Pilates'in en disiplinli formu.",
    "studio.split1.cta": "DETAY",
    "studio.split2.eyebrow": "MAT PILATES",
    "studio.split2.title": "Yere temas, içe dönüş.",
    "studio.split2.body":
      "Tek bir mat üzerinde, kendi ağırlığınızla omurgayı yeniden hizalayan klasik temel pratik.",
    "studio.split2.cta": "DETAY",
    "studio.stats.member": "Aktif Üye",
    "studio.stats.discipline": "Disiplin",
    "studio.stats.daily": "Günlük Seans",
    "studio.stats.room": "Salon",
    "studio.steps.1.title": "Rezervasyon",
    "studio.steps.1.body": "WhatsApp veya online formla seans ayır.",
    "studio.steps.2.title": "İlk Görüşme",
    "studio.steps.2.body":
      "Bedensel hedeflerini ve geçmişini birlikte değerlendiririz.",
    "studio.steps.3.title": "Tanışma Seansı",
    "studio.steps.3.body": "Stüdyo turu ve eğitmenle hareket alıştırması.",
    "studio.steps.4.title": "Program",
    "studio.steps.4.body": "Sana özel haftalık ders takvimi belirleriz.",
    "studio.steps.5.title": "Devam",
    "studio.steps.5.body":
      "Düzenli seanslarla bedeninle yeniden tanışırsın.",
    "studio.quote.text":
      "Wellness is not a trend; it's a timeless investment in yourself. Make it a lifestyle.",
    "studio.quote.author": "Alleyfit Wellness Studio",
    "studio.standards.title": "Stüdyomuzda her detay özenle düşünüldü.",
    "studio.standards.bullet1":
      "Grup Reformer dersleri: en fazla 6 kişi — her bedene yer",
    "studio.standards.bullet2":
      "Birebir & 2 kişilik özel oda: Cadillac, Barrel, Chair, Reformer",
    "studio.standards.bullet3": "Spinning sınıfı: 12 kişilik özel salon",
    "studio.standards.bullet4":
      "Sertifikalı eğitmen — yıllarca pilates deneyimi",
    "studio.standards.bullet5":
      "Hijyen protokolü ve kişisel havlu servisi",
    "studio.info.1.title": "Üyelik Paketleri",
    "studio.info.1.body":
      "Aylık, üç aylık ve yıllık paketlerle esnek seçenekler.",
    "studio.info.2.title": "Şirket Wellness",
    "studio.info.2.body":
      "Kurumsal pilates programlarıyla ekibinizi hareket ettirin.",
    "studio.info.3.title": "Hediye Çekleri",
    "studio.info.3.body":
      "Sevdikleriniz için Pilates hediye çeki — fiziksel veya dijital.",
    "studio.banner.title": "İlk seansını planla.",
    "studio.banner.cta": "REZERVASYON YAP",

    // Classes
    "classes.eyebrow": "DERSLERİMİZ",
    "classes.title": "Disiplinlerimiz",
    "classes.subtitle":
      "Reformer'dan Cadillac'a, Spinning'den Prenatal'a — her bedenin bir karşılığı var.",
    "classes.cta": "PROGRAMI GÖR",
    "classes.split.cta": "REZERVASYON",
    "classes.quote.text":
      "Tek bir doğru yoktur. Her bedenin kendine özgü bir cevabı vardır.",
    "classes.quote.author": "Alleyfit",
    "classes.banner.title": "Bir sonraki seansını planla.",
    "classes.banner.cta": "PROGRAMA GİT",

    // About
    "about.eyebrow": "HAKKIMIZDA",
    "about.title": "Hareket Bir Hikaye",
    "about.subtitle":
      "Şile'de küçük bir stüdyo — kişiye özel yaklaşım, tek eğitmenin disiplini.",
    "about.cta": "EĞİTMEN",
    "about.story.eyebrow": "HİKAYEMİZ",
    "about.story.title": "Şile'de, Pilates'i yeniden tanımladık.",
    "about.story.body":
      "Küçük bir reformer salonundan başlayarak bugün üç ayrı salonda buluştuğumuz topluluğa — tek değişmeyen şey bedenle kurduğumuz sade ilişki.",
    "about.story.cta": "DERSLERİMİZ",
    "about.philosophy.eyebrow": "FELSEFEMİZ",
    "about.philosophy.title": "Az kelime. Çok hareket.",
    "about.philosophy.body":
      "Pilates bizim için bir performans değil — bedenle yeniden tanışma alanı. Kibar bakış, kararlı disiplin, sürdürülebilir değişim.",
    "about.trainer.eyebrowPrefix": "EĞİTMEN",
    "about.trainer.cta": "REZERVASYON",
    "about.quote.text":
      "Pilates başkasıyla yarışmak değil — kendinle hizalanmaktır.",
    "about.quote.author": "Alleyfit",
    "about.standards.title": "Çalışma standartlarımız.",
    "about.banner.title": "İlk seansını planla.",
    "about.banner.cta": "PROGRAMA GİT",

    // Schedule
    "schedule.eyebrow": "PROGRAM",
    "schedule.title": "Şile",
    "schedule.today": "BUGÜN",
    "schedule.classType": "DERS TÜRÜ",
    "schedule.room": "SALON · ŞİLE",
    "schedule.roomLabel": "SALON",
    "schedule.roomValue": "Şile · A",
    "schedule.clear": "HEPSİNİ TEMİZLE",
    "schedule.reserve": "RESERVE",
    "schedule.waitlist": "JOIN WAITLIST",
    "schedule.noSlots": "Bu seçimde seans yok.",

    // Contact
    "contact.eyebrow": "İLETİŞİM",
    "contact.title": "Bize Yaz",
    "contact.subtitle": "Şile'de, kapımız her gün açık.",
    "contact.cta": "WHATSAPP",
    "contact.reach.eyebrow": "BİZE ULAŞ",
    "contact.reach.title": "Tek mesaj uzaklıkta.",
    "contact.address": "ADRES",
    "contact.addressLine1": "Çavuş Mah. Üsküdar Cd. 204C BLOK",
    "contact.addressLine2": "34980 Şile / İstanbul",
    "contact.phone": "TELEFON",
    "contact.email": "E-POSTA",
    "contact.whatsapp": "WHATSAPP İLE YAZ",
    "contact.form.eyebrow": "MESAJ BIRAK",
    "contact.form.title": "İlk seansı planlayalım.",
    "contact.form.lead": "Birkaç saat içinde sana döneriz.",
    "contact.form.name": "AD",
    "contact.form.email": "E-POSTA",
    "contact.form.message": "MESAJ",
    "contact.form.send": "GÖNDER",

    // Corporate
    "corporate.eyebrow": "KURUMSAL",
    "corporate.title": "Birlikte Hareket",
    "corporate.subtitle":
      "Şirketlere özel wellness programları, ekip seansları ve yıllık paketler.",
    "corporate.cta": "TEKLİF AL",
    "corporate.cards.1.title": "Şirket Wellness",
    "corporate.cards.1.body":
      "Haftalık grup pilatesi — ofise yakın saat dilimleri.",
    "corporate.cards.2.title": "Ekip Seansları",
    "corporate.cards.2.body":
      "10–20 kişilik takım blokları, mobil eğitmen seçeneği.",
    "corporate.cards.3.title": "Özel Paketler",
    "corporate.cards.3.body":
      "Yıllık çalışan paketleri, raporlama ve esnek katılım.",
    "corporate.steps.eyebrow": "SÜREÇ",
    "corporate.steps.title": "Dört adımda başlangıç.",
    "corporate.steps.1.title": "Talep",
    "corporate.steps.1.body":
      "Form veya WhatsApp ile başlangıç görüşmesi.",
    "corporate.steps.2.title": "Görüşme",
    "corporate.steps.2.body":
      "Ekip ihtiyaçlarına göre özel ders haritası.",
    "corporate.steps.3.title": "Plan",
    "corporate.steps.3.body": "Saatler, eğitmen kadrosu, ödeme planı.",
    "corporate.steps.4.title": "Başlangıç",
    "corporate.steps.4.body":
      "İlk seans, raporlama, geri bildirim akışı.",
    "corporate.steps.5.title": "Devam",
    "corporate.steps.5.body":
      "Aylık değerlendirme ve takvim revizyonları.",
    "corporate.logos.eyebrow": "BİZİMLE ÇALIŞANLAR",
    "corporate.logos.label": "LOGO",
    "corporate.quote.text":
      "Hareket eden ekip, ayakta kalan şirkettir.",
    "corporate.quote.author": "Alleyfit",
    "corporate.banner.title":
      "Bir cumartesi sabahı tanışalım.",
    "corporate.banner.cta": "İLETİŞİM",

    // Reviews
    "reviews.eyebrow": "YORUMLAR",
    "reviews.title": "Müşterilerimiz Anlatıyor",
    "reviews.subtitle":
      "Alleyfit Wellness Studio ailesinin samimi sözleriyle — Google üzerinden doğrulanmış yorumlar.",
    "reviews.cta": "GOOGLE'DA GÖR",
    "reviews.stats.rating": "Google Puanı",
    "reviews.stats.count": "Toplam Yorum",
    "reviews.stats.satisfaction": "Memnuniyet",
    "reviews.section.eyebrow": "YORUM AKIŞI",
    "reviews.section.title":
      "Stüdyomuza emanet ettiğiniz her seansın değeri.",
    "reviews.viewAll": "GOOGLE'DA TÜM YORUMLARI GÖR",
    "reviews.banner.title": "Sen de Alleyfit ailesine katıl.",
    "reviews.banner.cta": "REZERVASYON YAP",

    // Footer
    "footer.studio": "STÜDYO",
    "footer.program": "PROGRAM",
    "footer.contact": "İLETİŞİM",
    "footer.newsletter": "BÜLTENE KAYIT OL",
    "footer.newsletterH3":
      "Yeni dönem programları, kampanyalar ve duyurular doğrudan e-postanızda.",
    "footer.subscribe": "KAYIT OL",
    "footer.subscribeNote": "KVKK aydınlatma metnine onay vermiş olursunuz.",
    "footer.copyright": "©2026 ALLEYFIT PILATES · İSTANBUL",
    "footer.kvkk": "KVKK",
    "footer.cookies": "Çerez Politikası",
    "footer.terms": "Kullanım Şartları",
  },
  en: {
    // Nav
    "nav.about": "About",
    "nav.classes": "Classes",
    "nav.studio": "Studio",
    "nav.program": "Appointment",
    "nav.corporate": "Corporate",
    "nav.reviews": "Reviews",
    "nav.contact": "Reservation / Contact",
    "cta.reserve": "BOOK NOW",

    // Studio
    "studio.eyebrow": "ALLEYFIT PILATES · ŞİLE",
    "studio.title": "Pilates At Its Best",
    "studio.subtitle":
      "Modern pilates studio in Şile — at every level, for every body, every day.",
    "studio.cta1": "BOOK A SESSION",
    "studio.cta2": "OUR CLASSES",
    "studio.split1.eyebrow": "REFORMER",
    "studio.split1.title": "Spring resistance, steady control.",
    "studio.split1.body":
      "The most disciplined form of modern Pilates — engaging the whole body in a single fluid flow on the reformer.",
    "studio.split1.cta": "DETAILS",
    "studio.split2.eyebrow": "MAT PILATES",
    "studio.split2.title": "Touch the ground, turn inward.",
    "studio.split2.body":
      "Classic foundational practice on a single mat, realigning the spine with your own body weight.",
    "studio.split2.cta": "DETAILS",
    "studio.stats.member": "Active Members",
    "studio.stats.discipline": "Disciplines",
    "studio.stats.daily": "Daily Sessions",
    "studio.stats.room": "Studios",
    "studio.steps.1.title": "Reservation",
    "studio.steps.1.body": "Book a session via WhatsApp or the online form.",
    "studio.steps.2.title": "First Conversation",
    "studio.steps.2.body":
      "We discuss your physical goals and history together.",
    "studio.steps.3.title": "Intro Session",
    "studio.steps.3.body":
      "A studio tour and movement intro with your instructor.",
    "studio.steps.4.title": "Program",
    "studio.steps.4.body": "We design a weekly class plan tailored to you.",
    "studio.steps.5.title": "Continue",
    "studio.steps.5.body":
      "Reconnect with your body through consistent sessions.",
    "studio.quote.text":
      "Wellness is not a trend; it's a timeless investment in yourself. Make it a lifestyle.",
    "studio.quote.author": "Alleyfit Wellness Studio",
    "studio.standards.title":
      "Every detail in our studio is considered with care.",
    "studio.standards.bullet1":
      "Group reformer classes: max 6 people — room for every body",
    "studio.standards.bullet2":
      "1:1 & 2-person private room: Cadillac, Barrel, Chair, Reformer",
    "studio.standards.bullet3": "Spinning studio: dedicated 12-person room",
    "studio.standards.bullet4":
      "Certified instructor — years of pilates experience",
    "studio.standards.bullet5":
      "Hygiene protocol and personal towel service",
    "studio.info.1.title": "Membership Packages",
    "studio.info.1.body":
      "Monthly, quarterly and yearly packages with flexible options.",
    "studio.info.2.title": "Corporate Wellness",
    "studio.info.2.body":
      "Move your team with tailored corporate pilates programs.",
    "studio.info.3.title": "Gift Cards",
    "studio.info.3.body":
      "Pilates gift card for your loved ones — physical or digital.",
    "studio.banner.title": "Plan your first session.",
    "studio.banner.cta": "BOOK A SESSION",

    // Classes
    "classes.eyebrow": "OUR CLASSES",
    "classes.title": "Our Disciplines",
    "classes.subtitle":
      "From Reformer to Cadillac, Spinning to Prenatal — there is a place for every body.",
    "classes.cta": "VIEW SCHEDULE",
    "classes.split.cta": "BOOK NOW",
    "classes.quote.text":
      "There is no single right way. Every body has its own answer.",
    "classes.quote.author": "Alleyfit",
    "classes.banner.title": "Plan your next session.",
    "classes.banner.cta": "GO TO SCHEDULE",

    // About
    "about.eyebrow": "ABOUT US",
    "about.title": "Movement Is A Story",
    "about.subtitle":
      "A small studio in Şile — a personal approach, the discipline of a single instructor.",
    "about.cta": "INSTRUCTOR",
    "about.story.eyebrow": "OUR STORY",
    "about.story.title": "We redefined Pilates in Şile.",
    "about.story.body":
      "From a small reformer room to the community we welcome across three rooms today — the only constant is the simple relationship we build with the body.",
    "about.story.cta": "OUR CLASSES",
    "about.philosophy.eyebrow": "OUR PHILOSOPHY",
    "about.philosophy.title": "Few words. Much movement.",
    "about.philosophy.body":
      "Pilates is not a performance for us — it is a space to rediscover the body. Kind gaze, steady discipline, sustainable change.",
    "about.trainer.eyebrowPrefix": "INSTRUCTOR",
    "about.trainer.cta": "BOOK NOW",
    "about.quote.text":
      "Pilates is not about competing with others — it is about aligning with yourself.",
    "about.quote.author": "Alleyfit",
    "about.standards.title": "Our working standards.",
    "about.banner.title": "Plan your first session.",
    "about.banner.cta": "GO TO SCHEDULE",

    // Schedule
    "schedule.eyebrow": "SCHEDULE",
    "schedule.title": "Şile",
    "schedule.today": "TODAY",
    "schedule.classType": "CLASS",
    "schedule.room": "ROOM · ŞİLE",
    "schedule.roomLabel": "ROOM",
    "schedule.roomValue": "Şile · A",
    "schedule.clear": "CLEAR ALL",
    "schedule.reserve": "RESERVE",
    "schedule.waitlist": "JOIN WAITLIST",
    "schedule.noSlots": "No sessions in this selection.",

    // Contact
    "contact.eyebrow": "CONTACT",
    "contact.title": "Write To Us",
    "contact.subtitle": "In Şile, our doors are open every day.",
    "contact.cta": "WHATSAPP",
    "contact.reach.eyebrow": "REACH US",
    "contact.reach.title": "A single message away.",
    "contact.address": "ADDRESS",
    "contact.addressLine1": "Çavuş Mah. Üsküdar Cd. 204C BLOK",
    "contact.addressLine2": "34980 Şile / İstanbul",
    "contact.phone": "PHONE",
    "contact.email": "EMAIL",
    "contact.whatsapp": "WRITE ON WHATSAPP",
    "contact.form.eyebrow": "LEAVE A MESSAGE",
    "contact.form.title": "Let's plan the first session.",
    "contact.form.lead": "We'll get back to you within a few hours.",
    "contact.form.name": "NAME",
    "contact.form.email": "EMAIL",
    "contact.form.message": "MESSAGE",
    "contact.form.send": "SEND",

    // Corporate
    "corporate.eyebrow": "CORPORATE",
    "corporate.title": "Move Together",
    "corporate.subtitle":
      "Tailored wellness programs, team sessions and annual packages for companies.",
    "corporate.cta": "GET A QUOTE",
    "corporate.cards.1.title": "Corporate Wellness",
    "corporate.cards.1.body":
      "Weekly group pilates — time slots close to the office.",
    "corporate.cards.2.title": "Team Sessions",
    "corporate.cards.2.body":
      "Team blocks of 10–20 people, mobile instructor option.",
    "corporate.cards.3.title": "Custom Packages",
    "corporate.cards.3.body":
      "Annual employee packages, reporting and flexible attendance.",
    "corporate.steps.eyebrow": "PROCESS",
    "corporate.steps.title": "Start in four steps.",
    "corporate.steps.1.title": "Request",
    "corporate.steps.1.body":
      "Initial conversation via the form or WhatsApp.",
    "corporate.steps.2.title": "Consultation",
    "corporate.steps.2.body":
      "Tailored class map based on team needs.",
    "corporate.steps.3.title": "Plan",
    "corporate.steps.3.body": "Times, instructor team, payment plan.",
    "corporate.steps.4.title": "Kickoff",
    "corporate.steps.4.body":
      "First session, reporting, feedback flow.",
    "corporate.steps.5.title": "Continue",
    "corporate.steps.5.body":
      "Monthly evaluations and schedule revisions.",
    "corporate.logos.eyebrow": "WORKING WITH US",
    "corporate.logos.label": "LOGO",
    "corporate.quote.text":
      "A team in motion is a company that stands.",
    "corporate.quote.author": "Alleyfit",
    "corporate.banner.title": "Let's meet one Saturday morning.",
    "corporate.banner.cta": "CONTACT US",

    // Reviews
    "reviews.eyebrow": "REVIEWS",
    "reviews.title": "Our Members Speak",
    "reviews.subtitle":
      "Honest words from the Alleyfit Wellness Studio family — reviews verified via Google.",
    "reviews.cta": "SEE ON GOOGLE",
    "reviews.stats.rating": "Google Rating",
    "reviews.stats.count": "Total Reviews",
    "reviews.stats.satisfaction": "Satisfaction",
    "reviews.section.eyebrow": "REVIEW FLOW",
    "reviews.section.title":
      "The value of every session entrusted to our studio.",
    "reviews.viewAll": "SEE ALL REVIEWS ON GOOGLE",
    "reviews.banner.title": "Join the Alleyfit family.",
    "reviews.banner.cta": "BOOK A SESSION",

    // Footer
    "footer.studio": "STUDIO",
    "footer.program": "PROGRAM",
    "footer.contact": "CONTACT",
    "footer.newsletter": "JOIN THE NEWSLETTER",
    "footer.newsletterH3":
      "New programs, special offers and announcements straight to your inbox.",
    "footer.subscribe": "SUBSCRIBE",
    "footer.subscribeNote":
      "By submitting, you accept our privacy notice.",
    "footer.copyright": "©2026 ALLEYFIT PILATES · ISTANBUL",
    "footer.kvkk": "Privacy",
    "footer.cookies": "Cookie Policy",
    "footer.terms": "Terms of Use",
  },
} as const;

export type DictKey = keyof typeof dict.tr;

type LangContextValue = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: DictKey) => string;
};

const LangContext = createContext<LangContextValue | null>(null);

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("tr");
  const t = (key: DictKey) => dict[lang][key] ?? key;
  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang(): LangContextValue {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used inside <LangProvider>");
  return ctx;
}
