# 📚 TeeLibrary

> Osobní marketplace & knihovna webových aplikací od Terezy.
> Tyrkysový design, PWA podpora, kategorie, popisy, ukázky.

---

## ✨ Co to umí

- **Veřejná knihovna** — každý, kdo otevře URL, vidí tvé aplikace (read-only)
- **Admin režim** — ty jako jediná můžeš přidávat / upravovat / mazat (přes Google přihlášení)
- **Real-time sync** — Firebase Firestore, data dostupná všude
- **PWA** — instalovatelné na mobil i desktop, funguje offline
- **Kategorie** — výchozí 4 + vlastní přes UI
- **Vyhledávání** — v reálném čase podle názvu, popisu, tagů
- **Kopírování odkazu** — jedním klikem, s toast notifikací

---

## 🚀 Kompletní setup (krok po kroku)

Projdi si tyhle 3 fáze. Celé to zabere cca 20–30 minut.

### ⚙️ FÁZE 1 — Firebase (8 minut)

#### 1.1 Vytvoř Firebase projekt

1. Jdi na [console.firebase.google.com](https://console.firebase.google.com)
2. Klikni **„Add project"** → pojmenuj `teelibrary` → **Continue**
3. Google Analytics: **vypni** (nepotřebuješ) → **Create project**

#### 1.2 Přidej webovou aplikaci

1. V dashboardu klikni na ikonu **`</>`** („Add app" → Web)
2. App nickname: `teelibrary` → **Register app**
3. Zobrazí se ti `firebaseConfig` — **zkopíruj si ho**, budeš ho za chvíli vkládat
4. Klikni **„Continue to console"**

#### 1.3 Zapni Firestore Database

1. V levém menu → **Build** → **Firestore Database**
2. **Create database**
3. Location: `eur3 (europe-west)` — nejbližší server
4. Start in **production mode** → **Enable**

#### 1.4 Zapni Google Authentication

1. V levém menu → **Build** → **Authentication**
2. **Get started**
3. Záložka **Sign-in method** → **Google** → **Enable**
4. Project public-facing name: `TeeLibrary`
5. Support email: tvůj email → **Save**

#### 1.5 Nastav Firestore Security Rules

1. **Firestore Database** → záložka **Rules**
2. Smaž obsah a vlož tohle (⚠️ **DOPLŇ SVŮJ EMAIL** místo `tvuj@gmail.com`):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper: je přihlášený uživatel admin?
    function isAdmin() {
      return request.auth != null
        && request.auth.token.email == 'tvuj@gmail.com';
    }

    // Aplikace: kdokoli může číst, jen admin může psát
    match /apps/{appId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // Kategorie: stejně
    match /categories/{catId} {
      allow read: if true;
      allow write: if isAdmin();
    }
  }
}
```

3. **Publish**

> 💡 **Tip:** Pokud chceš mít víc adminů, rozšiř podmínku:
> `return request.auth.token.email in ['tvuj@gmail.com', 'kolegyne@gmail.com'];`

---

### ⚙️ FÁZE 2 — Kód (3 minuty)

#### 2.1 Doplň Firebase config do `index.html`

Otevři [index.html](index.html) a najdi sekci (cca řádek 620):

```js
const firebaseConfig = {
  apiKey:            'REPLACE_WITH_YOUR_API_KEY',
  ...
};

const ADMIN_EMAIL = 'REPLACE_WITH_YOUR_EMAIL@gmail.com';
```

- **`firebaseConfig`** — nahraď hodnotami, které jsi zkopírovala v kroku 1.2
- **`ADMIN_EMAIL`** — sem napiš stejný email, který jsi dala do Firestore Rules

#### 2.2 Vytvoř PWA ikony

Do složky [icons/](icons/) nahraj dva soubory:

- `icon-192.png` (192×192 px)
- `icon-512.png` (512×512 px)

**Kde je vyrobit zdarma:**
- [favicon.io](https://favicon.io/) — z textu, emoji nebo obrázku
- [realfavicongenerator.net](https://realfavicongenerator.net/) — detailnější
- Canva → export jako PNG ve správné velikosti

**Tip:** Udělej tyrkysové pozadí (`#0a7c79`) + bílé písmeno „T" nebo 📚 emoji.

---

### ⚙️ FÁZE 3 — Nasazení (10 minut)

#### 3.1 GitHub

1. Jdi na [github.com/new](https://github.com/new)
2. Repository name: `teelibrary`
3. **Public** → **Create repository**
4. Na svém počítači v této složce spusť:

```bash
git init
git add .
git commit -m "Initial commit: TeeLibrary"
git branch -M main
git remote add origin https://github.com/TVOJE-USERNAME/teelibrary.git
git push -u origin main
```

#### 3.2 Vercel (auto-deploy z GitHubu)

1. Jdi na [vercel.com](https://vercel.com) → přihlas se přes GitHub
2. **Add New** → **Project**
3. Import `teelibrary` repo
4. Framework Preset: **Other** (Vercel detekuje statickou stránku)
5. **Deploy**
6. Za ~30 vteřin dostaneš URL: `teelibrary.vercel.app` nebo podobnou

#### 3.3 Přidej Vercel doménu do Firebase Auth

⚠️ **Důležité** — bez tohoto kroku ti nebude fungovat přihlášení.

1. Zkopíruj si Vercel URL (např. `teelibrary.vercel.app`)
2. Firebase konzole → **Authentication** → **Settings** → **Authorized domains**
3. **Add domain** → vlož `teelibrary.vercel.app`
4. Save

#### 3.4 První spuštění

1. Otevři svou Vercel URL
2. Klikni **„Přihlásit"** → vyber svůj Google účet
3. Pokud jsi zadala správný `ADMIN_EMAIL`, uvidíš nahoře badge **„✦ admin"**
4. Protože je databáze prázdná, appka automaticky nahraje 5 výchozích aplikací (seed)
5. Klikni na ➕ **„Přidat appku"** a přidej další!

---

## 🔄 Jak dál přidávat appky

**A) Přes UI (doporučeno)**
Otevři TeeLibrary → přihlas se → **„+ Přidat appku"** → vyplň → **Uložit**.
Změny se okamžitě synchronizují na všech zařízeních.

**B) Přes Firebase konzoli**
[console.firebase.google.com](https://console.firebase.google.com) → Firestore → kolekce `apps` → Add document.

**C) Přes kód**
Pokud potřebuješ změnit design nebo strukturu — uprav [index.html](index.html) → `git push` → Vercel automaticky nasadí.

---

## 📁 Struktura projektu

```
teelibrary/
├── index.html          ← hlavní appka (single-file PWA)
├── manifest.json       ← PWA manifest
├── sw.js               ← Service Worker (offline podpora)
├── icons/
│   ├── icon-192.png    ← ⚠️ musíš dodat
│   └── icon-512.png    ← ⚠️ musíš dodat
├── README.md           ← tenhle návod
└── TeeLibrary-SPEC.md  ← původní specifikace
```

---

## 🎨 Design

**Barvy:**
- `--teal-deep: #0a7c79` — hlavní tmavě tyrkysová
- `--teal-mid: #14b8a6` — střední
- `--teal-light: #5eead4` — světlá
- `--teal-pale: #ccfbf1` — nejsvětlejší
- `--bg: #f0fdfa` — pozadí

**Fonty:** Playfair Display (nadpisy) + DM Sans (UI) — Google Fonts

---

## 🐛 Troubleshooting

**„Missing or insufficient permissions" při ukládání**
→ Zkontroluj, že v Firestore Rules máš správný email a že jsi přihlášena stejným Google účtem.

**Přihlášení vyhodí „unauthorized-domain"**
→ Přidej svou Vercel URL do Firebase Auth → Authorized domains (krok 3.3).

**Seed nefunguje**
→ Seed proběhne jen při prvním přihlášení jako admin. Pokud jsi nepřihlášená, databáze zůstane prázdná — Firestore Rules zápis bez adminu zablokují.

**„Přidat appku" tlačítko není vidět**
→ Jsi admin? Musíš být přihlášena emailem, který jsi zadala jako `ADMIN_EMAIL` v `index.html` + ve Firestore Rules.

**Změny se neukazují / stará verze se načítá**
→ Hard refresh: `Ctrl+Shift+R` (Win) nebo `Cmd+Shift+R` (Mac). Service Worker cachuje HTML, ale při novém deployi se aktualizuje automaticky.

---

## 🔮 Nápady do budoucna

- ⭐ Oblíbené appky (hvězdičky)
- 📊 Statistiky otevření
- 🌙 Dark mode
- 🔗 Sdílení veřejného linku na konkrétní kategorii
- 📤 Export / import knihovny jako JSON
- 🖼 Automatický screenshot přes API
- 🔔 Badge „nové" u naposledy přidaných

---

*TeeLibrary — vytvořila Tereza ✨*
