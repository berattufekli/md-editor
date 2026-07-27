# MD Editor Modern Yenileme Uygulama Planı

> **For Hermes:** Bu planı görev görev uygula; her davranış değişikliğini test, lint, build ve tarayıcı doğrulamasıyla kanıtla.

**Goal:** MD Editor’ü veri kaybına karşı güvenli, klavye odaklı, erişilebilir, mobil uyumlu ve modern-minimal bir yazma alanına dönüştürmek.

**Architecture:** Mevcut Next.js 16 App Router ve yerel-first localStorage yaklaşımı korunacak. Büyük `page.tsx` sorumlulukları saf doküman/markdown yardımcılarına ve odaklı editör bileşenlerine ayrılacak; arayüz “Command / Inspect” yüzeyi olarak yeniden kurgulanacak. Tasarım dili sıcak nötr açık tema ile hassas, koyu modda luminance katmanlı yüzeyler; tek vurgu rengi; düşük radius; ince sınırlar ve tipografi temelli hiyerarşi kullanacak.

**Tech Stack:** Next.js 16.2, React 19, TypeScript 5, Tailwind CSS 4, Base UI/shadcn primitives, react-markdown, Vitest + Testing Library.

---

## Kabul Kriterleri

- Masaüstünde doküman rayı + odaklı editör + canlı önizleme dengeli çalışır.
- Mobilde sidebar/dokümanlar bir sheet/drawer üzerinden erişilir; editör/önizleme sekmeli kullanılır.
- Doküman oluşturma, seçme, yeniden adlandırma, silme, arama, import ve export çalışır.
- İçerik ve ayarlar localStorage’da güvenli biçimde kalır; tarih alanları hydrate edilir.
- Başlık doğrudan üst barda düzenlenebilir; kaydedilme durumu ve kelime/karakter bilgisi görünür.
- Toolbar komutları seçime doğru markdown uygular ve klavye kısayolları çalışır.
- Light/dark/system tema, editör fontu, boyutu, satır yüksekliği, wrap/spellcheck ve preview seçenekleri çalışır.
- Erişilebilir isimler, görünür focus, 44px mobil hedefler, reduced-motion ve semantic kontroller bulunur.
- `npm test`, `npm run lint`, `npm run build` başarılıdır; Playwright ile masaüstü ve mobil smoke testleri geçer.

## Task 1: Test zemini ve saf editör yardımcıları

**Files:**
- Modify: `package.json`
- Create: `src/lib/editor-utils.ts`
- Create: `src/lib/editor-utils.test.ts`

**Steps:**
1. Vitest test scriptini ve test bağımlılığını ekle.
2. Doküman oluşturma/hydration, kelime istatistiği, güvenli dosya adı ve markdown seçim dönüştürme testlerini önce yazıp RED durumunu doğrula.
3. Minimum yardımcı fonksiyonları yazıp GREEN durumunu doğrula.
4. Saf yardımcıları UI içinden kullan.

## Task 2: Tasarım tokenları ve temel kabuk

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/app/layout.tsx`
- Modify: `src/app/page.tsx`
- Modify: `src/components/ui/button.tsx`
- Modify: `src/components/ui/input.tsx`

**Steps:**
1. Sıcak nötr light ve hassas near-black dark token seti oluştur.
2. Border, radius, focus, surface, typography ve motion kurallarını konsolide et.
3. Üst uygulama barı, sidebar rayı ve çalışma alanı kompozisyonunu kur.
4. Mevcut “ikon yığını” görünümünü bağlama duyarlı birincil/ikincil aksiyonlara indir.

## Task 3: Doküman çalışma alanı

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/components/editor/editor-sidebar.tsx`
- Modify: `src/hooks/use-local-storage.ts`
- Modify: `src/types/editor.ts`

**Steps:**
1. Doküman başlangıç/hydration ve aktif doküman seçim akışını deterministik yap.
2. Inline başlık düzenleme, arama, yeni doküman ve güvenli silme akışını iyileştir.
3. Kaydetme durumu, güncelleme zamanı ve belge istatistiklerini görünür kıl.
4. Import/export hata ve dosya adı kenar durumlarını ele al.

## Task 4: Yazma ve önizleme deneyimi

**Files:**
- Modify: `src/components/editor/markdown-editor.tsx`
- Modify: `src/components/editor/markdown-toolbar.tsx`
- Modify: `src/components/editor/markdown-preview.tsx`
- Modify: `src/app/page.tsx`

**Steps:**
1. Editor textarea’yı okuma genişliği, padding, caret, selection ve line-number davranışıyla yenile.
2. Toolbar’ı hiyerarşik, yatay kaydırılabilir ve erişilebilir yap.
3. Markdown selection komutlarını güvenilir yardımcı üzerinden çalıştır.
4. Preview’u editorial prose, kod blokları, tablolar, checkbox ve boş durumlarıyla yenile.
5. Desktop split ve mobile Write/Preview sekme akışını uygula.

## Task 5: Ayarlar, tema ve responsive davranış

**Files:**
- Modify: `src/components/editor/settings-drawer.tsx`
- Modify: `src/components/providers/theme-provider.tsx`
- Modify: `src/components/providers/font-provider.tsx`
- Modify: `src/app/page.tsx`

**Steps:**
1. Ayarlar drawer’ını semantic dialog ve düzgün focus/escape davranışıyla toparla.
2. Tema durumunu ayarlarla senkron tut; lint hook uyarısını gider.
3. Mobil doküman drawer’ı ve responsive toolbar/header davranışını tamamla.
4. `prefers-reduced-motion` ve 44px touch target denetimi yap.

## Task 6: Doğrulama, dokümantasyon ve teslim

**Files:**
- Modify: `README.md`
- Replace: `public/screenshot.png`
- Potentially create: `scripts/smoke.mjs`

**Steps:**
1. Tüm testleri, ESLint’i, TypeScript/Next production build’i çalıştır.
2. Yerel sunucuda Playwright ile oluşturma, başlık düzenleme, yazma, preview, tema ve mobil drawer akışlarını test et.
3. 1440×900 ve 390×844 ekran görüntülerini incele; console hatalarını kontrol et.
4. Slop denetimini puanla; kompozisyonel hata varsa düzelt ve yeniden doğrula.
5. README özelliklerini, komutları ve güncel ekran görüntüsünü güncelle.
6. Bağımsız kod incelemesi gerçekleştir; kritik bulguları düzelt.
7. Repo-local Git kimliğini `Berat Tüfekli <berattufekli@users.noreply.github.com>` olarak ayarla; aktif `gh` hesabının `berattufekli` olduğunu doğrula.
8. Conventional commit oluştur, `origin/main`’e push et ve remote SHA’yı doğrula.

## Riskler ve Kararlar

- **Veri göçü:** Var olan localStorage key’leri korunacak; ISO string tarihler okunurken hydrate edilecek.
- **Raw HTML:** `rehype-raw` mevcut içeriğin HTML çalıştırmasına izin verebilir. Yerel uygulama olsa da güvenlik incelemesinde değerlendirilip gerekirse kaldırılacak/sanitize edilecek.
- **Tek textarea:** Karmaşık bir code editor bağımlılığı eklenmeyecek; hız ve sadelik için native textarea korunacak.
- **Canlı dağıtım:** İstenen teslim push’tur. Mevcut README canlı URL’si 404 dönüyor; push sonrası Vercel otomatik dağıtım durumu ayrıca kontrol edilecek, ancak kullanıcı deploy istemediği için manuel production deploy varsayılmayacak.
