# Alleyfit

Alleyfit Pilates stüdyosu için statik web sitesi.

## Yapı

```
index.html        → "Stüdyomuz" ana sayfası
assets/
  css/            → base.css, components.css, layout.css
  js/             → main.js (section reveal animasyonu)
pages/            → ileride eklenecek alt sayfalar için (boş)
```

Build adımı yok. `index.html` dosyasını doğrudan tarayıcıda açabilirsin. Fontlar Google Fonts CDN'den, görseller Unsplash URL'leriyle çekiliyor.

## Geliştirme akışı

İşe başlarken:
```powershell
git pull
git status
```

Değişiklik sonrası:
```powershell
git add <dosya>
git commit -m "kısa açıklama"
git push
```

İki kişi aynı dosyada çalışıyorsa **feature branch** kullanın:
```powershell
git checkout -b feature/<isim>
# çalış, commit, push
git push -u origin feature/<isim>
# sonra GitHub üzerinden PR aç
```

## Stil eklerken

- `:root` değişkenlerinden çalış — yeni renk eklemeden önce token tanımla.
- `<style>` veya `style="…"` kullanma; uygun CSS dosyasına ekle.
  - değişken/temel → `base.css`
  - bileşen (buton, kart, vs.) → `components.css`
  - bölüm/yerleşim/responsive → `layout.css`

## Ortak çalışanlar

- **omrkya** — webstudio.tr@gmail.com
- **Mert** — kmsoftwaretech@gmail.com
