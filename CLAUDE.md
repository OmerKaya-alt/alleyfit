# Proje bağlamı

**Alleyfit Pilates** stüdyosu için statik HTML web sitesi.

## Yapı

```
index.html              → "Stüdyomuz" sayfası (tek sayfa, root)
assets/
  css/
    base.css            → reset, design tokens (renk + tipografi değişkenleri), tipografi yardımcıları
    components.css      → nav, lang bar, butonlar, ticker, footer parçaları, vb.
    layout.css          → hero, split, stats, fv, quote, stds, info, footer + responsive
  js/
    main.js             → IntersectionObserver ile section reveal animasyonu
pages/                  → ileride eklenecek alt sayfalar (about, classes, schedule…) için boş klasör
```

`<title>`: **"Stüdyomuz — Alleyfit Pilates"**.

Build adımı **yok** — saf HTML + CSS + JS. Google Fonts CDN'den çekiliyor (Cormorant Garamond, Barlow Condensed, Inter). Görseller Unsplash URL'leri; yerel görsel yok.

## CSS organizasyonu

CSS üç dosyaya ayrıldı:
- **base.css** → `:root` değişkenleri, reset, `body`, `.eye`, `h2.ttl`, `.bp` gibi tipografi temelleri
- **components.css** → tekrar kullanılan UI parçaları (nav, lang-bar, butonlar, ticker, scroll-hint, snum, footer kolonları, newsletter formu)
- **layout.css** → sayfa bölümleri (hero, stats, split, fv, quote, stds, info, footer wrapper) + tüm `@media` kuralları

Yeni stil eklerken: değişken/temel ise `base.css`, parça ise `components.css`, bölüm/yerleşim ise `layout.css`. Inline `style="…"` kullanma; gerekirse `components.css`'e küçük bir utility class ekle (`.nl-desc` gibi).

Renk paleti `:root` değişkenleri ile yönetiliyor — Vibecycle ilhamlı derin midnight zemin + krem (`--cream`) açık ton, sıcak amber/karamel altın (`--gold`) ve bakır-turuncu CTA (`--red`) vurguları, ek `--vc-*` tonları (amber/copper/midnight). Yeni renk gerekiyorsa önce token tanımla.

## Ortak çalışma

İki kişi aynı `main` branch'inde çalışıyor: **Mert** (kmsoftwaretech@gmail.com) ve **omrkya** (webstudio.tr@gmail.com). Repo: github.com/omrkya/aleyfit. Conflict riskini azaltmak için her seansa `git pull` ile başla; büyük değişikliklerde feature branch + PR akışı öner.

## Dil & ton

Mert Türkçe iletişim kuruyor. Yanıtlar Türkçe olmalı; `commit`, `branch`, `PR` gibi yaygın git terimleri İngilizce kalabilir.
