# MD Editor — Tam Görsel Redesign Planı

> Plan-mode çıktısı. Tarih: 2026-07-27.
> Hedef: Mevcut "default shadcn + warm tint" görünümünü, **AI slop olmayan**, özgün bir editorial-workplace karakterine taşımak.

---

## 1. Mevcut Durum — Neyi Beğenmiyorum

Proje zaten "sıcak, sade, parşömen" çizgisinde. Ama şu anki hâli üç yerde **jenerik shadcn'e kayıyor**:

1. **Settings Drawer** — "icon + section header + 3'lü grid card" şablonu klasik shadcn. `bg-primary/10` rozetleri, `text-primary` vurgular, beyaz-boşluk içinde yüzen icon kutuları. Hissiyat: "ayarlar paneli", "ürünün parçası" değil.
2. **Sidebar** — Search input + icon prefix + "list item = icon + title + dropdown on hover" şablonu. Her editörün aynısı.
3. **Toolbar** — Sıralı ikon + separator. Çalışıyor ama "default" hissediyor.

Ek olarak:

- `prose prose-sm dark:prose-invert` ile custom `.markdown-preview` stilleri **çakışıyor** (ikisi de aynı şeyi yapmaya çalışıyor).
- Sayfa kompozisyonu "header + sidebar + content + drawer" şablonu — yatay, simetrik, tek bir yüksekliğe yapışık.
- Status bilgisi (kayıt durumu, kelime sayısı) header'ın ortasında minik bir `<small>`. Hakkettiği yerde değil.
- Brand kimliği: "MD" yazılı küçük bir badge. Çok generic.
- Türkçe metinler: hızlı yazılmış, ürün sesi tutarsız ("Merhaba — buraya dilediğin gibi markdown yazabilirsin." vs.).

---

## 2. Yön — "Editorial Workspace"

Karar: Mevcut sıcak/sade/parşömen DNA'sını koruyup, **3 katmanlı editorial karakter** ekleyeceğim:

> Bir yüksek-kalite kırtasiyeden çıkmış, Linear'ın disipliniyle yazılmış, yazar odaklı bir iş istasyonu.

### Anti-AI-slop prensipleri (her karar bunlardan geçer):

1. **Renk ekonomisi** — `bg-primary/10` rozetler, `text-primary` vurgular yok. Vurgu sadece (a) aktif durum (b) gerçekten önemli bir eylem (c) linkler için kullanılır.
2. **Asimetri kabul** — Her şeyi merkezlemiyoruz. Sol yoğunluk + sağda ferahlık, başlıklar sola yaslanmış, aralıklar bilinçli.
3. **Tipografi başrolde** — Preview için **gerçek bir serif gövde** (Source Serif 4). Sans başlıklar. Mono kod. Üçü bilinçli kontrast.
4. **Negatif alan cömertliği** — 1.7 satır yüksekliği zaten doğru. Paddingler artırılacak, ayırıcı çizgiler daha ince, hiçbir şey karta yapışmayacak.

### Renk paleti kararı

Mevcut moss/teal accent (oklch 0.55 0.08 175) **kalsın ama rafine olsun** — yeşilin "doğa" hissinden çıkıp "deep teal" hissi versin. Oklch'te chroma 0.08'den **0.12'ye**, hue 175'ten **180'e** kayıyor; doygunluk artıp sıcaklık korunuyor.

Işık modu: **parchment sıcaklığı korunur** (oklch 0.985 0.004 95 — mevcut iyi).
Karanlık mod: **near-black + subtle warm** (oklch 0.165 0.005 80 — mevcut iyi).

Yeni eklenen semantik token'lar:
- `--surface-1`, `--surface-2`, `--surface-3` (3 kademeli yüzey)
- `--rule` (çok ince ayırıcı, ana bordürden %30 daha soft)
- `--ink-primary`, `--ink-secondary`, `--ink-tertiary` (yazı için 3 kademe)
- `--signal-saved`, `--signal-saving`, `--signal-draft` (durum)

### Tipografi kararı

- **Sans (UI)**: Mevcut Geist + Inter bırakılır. Geist daha distinctive (geometric, slightly humanist), UI için iyi.
- **Serif (Preview gövde)**: **Source Serif 4** eklenir. Okuma için tasarlanmış, OpenType ligature'ları var, web'de mükemmel.
- **Mono (Kod)**: Mevcut Fira Code / JetBrains Mono yeterli.

`font-family` zinciri:
- `--font-display`: Geist Sans (başlıklar)
- `--font-body`: Source Serif 4 (preview)
- `--font-ui`: Geist Sans (kontroller)
- `--font-mono`: Geist Mono (kod)

---

## 3. Kompozisyon — Yeni Shell

Eski "header + sidebar + content" yerine **4 zonlu asimetrik grid**:

```
┌─────────────────────────────────────────────────────────────┐
│  TOP BAR (44px): brand · doc title (editable) · actions    │  ← minimal, hairlines
├──────────────┬──────────────────────────────────────────────┤
│              │  EDITOR (write)            │  PREVIEW        │
│  RAY (260px) ├────────────────────────────┤  (gerekirse)    │
│  • search    │                            │                 │
│  • doc list  │  markdown-textarea         │  prose          │
│  • + new     │                            │                 │
│              ├────────────────────────────┴─────────────────┤
│              │  TOOLBAR (40px)                              │
├──────────────┴──────────────────────────────────────────────┤
│  STATUS BAR (28px): words · reading time · saved · theme    │  ← yeni, ince
└─────────────────────────────────────────────────────────────┘
```

**Kritik değişiklikler:**

- **Top bar** artık "header'ın yarısı" kadar. Belge başlığı **inline editable** (şu an header'ın ortasında minik bir input). Burada başlık h1 gibi büyük, font-display, tıkla-yaz-hızlıca.
- **Status bar** YENİ — her zaman görünür, ince, tıklamayla küçük işlevler (tema değiştirme, font büyütme).
- **Toolbar** stage'in altına taşınır (iA Writer / Ulysses tarzı). Editör alanının hemen altında, içerik akışını kesmez.
- **Ray (sidebar)** "yeni belge" butonu altta değil **search'ün sağında**, ikon yerine **"+ Yeni"** yazısı.
- **Settings** drawer DEĞİL — sağdan kayan **inline panel** (push layout, %320 genişlik, content'i daraltır; obskure etmez). Overlay backdrop YOK.
- **Preview** "right" / "bottom" / "split" yerine daha basit: **toggle on/off** + **side** (right/bottom). Sadece 2 seçenek.
- **Mobile**: Drawer + write/preview tabs aynen kalır, kompozisyon değişmez.

---

## 4. Bileşen bazlı değişiklik listesi

### 4.1 `globals.css` — Token'lar ve base
- Yeni OKLCH token'lar (yukarıdaki liste)
- `--rule` ve 3-kademeli yüzey için custom utilities
- `.markdown-textarea` artık **prose ile çakışmaz**; `prose prose-sm dark:prose-invert` markdown-preview'dan kaldırılır, sadece custom prose stilleri kalır.
- Focus ring rengi accent'tan bağımsız, `--ring` ile aynı ama daha kontrollü.
- Selection rengi accent'ın %12'si (oklch alpha).
- `prefers-reduced-motion` zaten var, korunur.

### 4.2 `layout.tsx` — Fontlar
- Source Serif 4 eklenir (`--font-serif`)
- Geist Mono zaten var, Mono yerine onu varsayılan yap.
- `lang="tr"` kalır.
- `metadata` description'ı kısa, sahici.

### 4.3 `page.tsx` — Kompozisyon yeniden yazımı
- Inline JSX yerine **bileşen kompozisyonu** (`<TopBar/>` + `<Ray/>` + `<Stage/>` + `<StatusBar/>`).
- Mevcut CSS sınıfları (`.app-shell`, `.command-bar`, `.document-heading` vb.) kaldırılır, Tailwind grid ile yapılır.
- Tek sayfa render; state mantığı korunur.

### 4.4 `AppHeader` → `TopBar`
- Yeniden adlandırılır. Davranış: brand mark (sol) · breadcrumb (mark › doc title) · sağda: tema toggle, preview toggle (eye/eye-off), settings aç.
- 44px yükseklik, hairline border-bottom.
- **Brand**: "MD" yazılı badge yerine **özel bir monogram** (12px × 12px kare, 2px stroke, geometrik). Inline SVG.

### 4.5 `EditorSidebar` → `Ray`
- Yeni liste item tasarımı: 3 satır — başlık (font-medium) · ilk satır preview (text-xs, muted, truncate) · meta (güncellenme zamanı + kelime sayısı, text-2xs, daha da muted).
- Aktif item: 1px sol border accent + bg değil. **Yalnızca sol border**, çok ince.
- "Yeni belge" search'ün sağında: "+ Yeni" metin + tuval.
- Search input: sadece yazı + esc tuvalı, prefix ikonu yok. Yerlilik.
- Pinned belgeler (yıldız ikonu) — opsiyonel, scope dahilinde.
- **Empty state** yeniden: "Henüz hiçbir şey yok" + yardımcı metin + **somut adım** (klavye kısayolu ipucu).

### 4.6 `MarkdownEditor`
- Prose stilleriyle çakışma çözülür.
- **Line numbers** (settings.showLineNumbers true ise) gerçek bir sol gutter — `display:grid; grid-template-columns: 3rem 1fr;` ile yapılır, soft border-right.
- **Active line highlight** — cursor satırı `bg-muted/30` ile çok hafif vurgulanır (CSS only via `caret-color` magic trick; yeni değil ama korunur).
- **Focus mode** (settings'ten veya `Cmd+Shift+F`) — aktif paragraf tam opaklık, diğerleri `opacity:0.4`. `Cmd+Shift+F` toggle. Yeni state, ufak.
- Placeholder: sıcak, "Bir şey yaz…  ⌘B kalın yapar" gibi, yardımcı.

### 4.7 `MarkdownToolbar` → `StageToolbar`
- Stage'in **altına** taşınır.
- Gruplar: Metin (B/I/S) · Başlık (H1/H2/H3) · Liste (•/1./☐) · Blok (> / ``` / hr / tablo) · Link (🔗/🖼).
- **Divider'lar** 1px dikey çizgi değil, **6px gap** ile. Sadece 1 tane her grup arası, çok ince.
- **Overflow menü**: ekran küçülünce son grup "+" overflow'a düşer. Shadcn DropdownMenu.
- **Bubble menu** (bonus): seçim yapınca yüzen mini menü (iA Writer tarzı) — Quick win, MVP'de scope dışı, sonraya not düşülür.

### 4.8 `MarkdownPreview`
- `prose prose-sm dark:prose-invert` kaldırılır, sadece `.markdown-preview` kalır.
- **Source Serif 4** body, Geist Sans başlıklar.
- **Blockquote**: sol border 2px accent, italic, font-serif.
- **Kod blokları**: monospace, soft background, 1px border, **language label** sağ üstte (varsa) — bunun için basit bir rehype eklentisi.
- **Tablolar**: zebra stripe (`:nth-child(even)` `bg-muted/40`) + daha yumuşak border, sol kolon font-medium.
- **HR**: 1px muted, opsiyonel ortada ◆ diamond dekorasyonu (editorial vibe).
- **Heading anchor**: hover'da `#` link görünür (bonus, sonraya).

### 4.9 `SettingsDrawer` → `SettingsPanel`
- Sağdan push panel (drawer değil).
- 320px genişlik, content'i daraltır, overlay YOK.
- **Sections**: Tek bir scroll container, sticky section header'lar (h3 + small line).
- **Theme picker**: 3 yatay pill (`☀ Aydınlık · ☾ Karanlık · ⊙ Sistem`).
- **Font picker**: 2x2 grid yerine tek satır horizontal scroll; her item preview (font-family ile gerçek render); aktif item sol border accent.
- **Slider'lar**: ince track, sade thumb, değer sağda küçük mono. Track'te tick yok.
- **Switch**: iOS tarzı değil, daha nötr — accent rengi yerine `--ink` vurgu.

### 4.10 Status Bar (YENİ)
- 28px yükseklik, hafif `bg-surface-2`, hairline border-top.
- Sol: kelime · karakter · satır · **okuma süresi** (200 wpm).
- Orta: kayıt durumu — `Saved · az önce` küçük dot + metin; `Saving…` spinner; `Unsaved` vurgu.
- Sağ: tema toggle (☀/☾/⊙ döngüsel) · font büyüt/küçült (A−/A+) · preview toggle (eye/eye-off).

### 4.11 Yeni: `EmptyState` bileşeni
- Tek bir yeniden kullanılabilir empty state — sakin, tek ikon, başlık + yardım + 1-2 CTA veya kısayol.

### 4.12 Yeni: Brand mark
- "MD" badge yerine özel bir monogram (12×12px inline SVG, geometrik "M" + "D" iç içe).
- Tüm uygulamada tutarlı.

---

## 5. Davranış / mikro-etkileşim değişiklikleri

- **Debounced auto-save** (500ms) — mevcut 30s kaba, çok yavaş. `settings.autoSaveInterval` zaten var, default 30s kalsın ama UI'da "son kayıt 5sn önce" gösterimi olsun.
- **Pinned documents** — 5dk iş, scope'a alınabilir.
- **Reading time** — `Math.ceil(words / 200)` dakika.
- **"Saved locally" feedback** — yazı bırakınca 300ms sonra "Saved" → 2s sonra "Saved · az önce" (kullanıcı durumu görsün).
- **Keyboard shortcuts** ekranda görünür olsun:
  - `Cmd+B/I/K` → toolbar tooltip
  - `Cmd+Shift+F` → focus mode
  - `Cmd+\` → ray toggle
  - `Cmd+,` → settings
  - `Cmd+Shift+P` → preview toggle

---

## 6. Kapsam dışı (bu PR'da değil)

- Bubble menu (selection toolbar) — sonraki sprint
- Heading anchor linkleri
- Sürükle-bırak belge sıralama
- Tag/folder organizasyonu
- Multi-cursor / CodeMirror geçişi (textarea MVP için yeterli)
- Yapay zekâ entegrasyonu (örn. AI rewrite)

---

## 7. Sıralı uygulama adımları

1. `globals.css` — yeni token'lar, prose/plugin çakışması çözümü, custom utilities.
2. `layout.tsx` — Source Serif 4 ekle.
3. `lib/editor-utils.ts` — `readingTime()`, `formatSavedAgo()`, `slugify()` yardımcıları.
4. `hooks/use-keyboard-shortcut.ts` — yeni, kısayol yönetimi.
5. `components/brand-mark.tsx` — yeni monogram bileşeni.
6. `components/status-bar.tsx` — yeni.
7. `components/empty-state.tsx` — yeni.
8. `app/page.tsx` — yeni kompozisyon (TopBar / Ray / Stage / StatusBar).
9. `components/editor/top-bar.tsx` — header'ın yeniden yazımı.
10. `components/editor/ray.tsx` — sidebar'ın yeniden yazımı.
11. `components/editor/stage-toolbar.tsx` — toolbar'ın yeniden yazımı + overflow.
12. `components/editor/markdown-editor.tsx` — line numbers + focus mode.
13. `components/editor/markdown-preview.tsx` — prose/plugin kaldır, serif body, refined block.
14. `components/editor/settings-panel.tsx` — drawer → push panel.
15. Keyboard shortcuts ve focus mode state.
16. `npm run lint` + `npm test` + `npm run build` doğrula.

---

## 8. Doğrulama (Acceptance Bar)

- `npm run lint` → 0 error, 0 warning.
- `npm test` → tüm testler geçer (testler yoksa veya güncellenmesi gerekirse güncelle).
- `npm run build` → başarılı, route bundle boyutu makul.
- Manuel: light + dark temada 1) yeni belge oluştur, 2) markdown yaz, 3) preview toggle, 4) settings aç-kapa, 5) focus mode, 6) tema değiştir, 7) mobile drawer + tabs.
- **AI-slop kontrolü**: hiçbir bileşende `bg-primary/10`, `text-primary` highlight (link hariç), 3'lü grid icon card pattern'i olmamalı.

---

## 9. Tahmini süre

- Aşama 1–6 (token + helper + mini bileşen): ~30 dk
- Aşama 7–9 (kompozisyon): ~30 dk
- Aşama 10–15 (bileşen rewrite): ~60 dk
- Aşama 16 (doğrulama): ~15 dk

Toplam ~2–2.5 saat aktif çalışma. Main thread'de, blocking değil, istersen paralel ilerleyebilirim.
