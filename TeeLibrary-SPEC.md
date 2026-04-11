# TeeLibrary — Specifikace projektu

> Osobní marketplace & knihovna webových aplikací od Terezy.
> Tyrkysový design, PWA podpora, kategorie, popisy, ukázky.

---

## 🎯 Cíl projektu

TeeLibrary je osobní „marketplace" — přehledná knihovna webových aplikací, které Tereza vytvořila. Slouží jako centrální rozcestník, kde může rychle otevírat, sdílet a spravovat své appky, rozdělené do kategorií.

---

## 🗂 Struktura souborů (GitHub repozitář)

```
teelibrary/
├── index.html          ← hlavní appka (single-file PWA)
├── manifest.json       ← PWA manifest
├── sw.js               ← Service Worker (offline podpora)
└── icons/
    ├── icon-192.png
    └── icon-512.png
```

---

## 📱 PWA podpora

Appka musí být instalovatelná jako PWA (Progressive Web App) — přidání na plochu telefonu i desktopu.

### manifest.json
```json
{
  "name": "TeeLibrary",
  "short_name": "TeeLibrary",
  "description": "Moje knihovna webových aplikací",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#f0fdfa",
  "theme_color": "#0a7c79",
  "icons": [
    { "src": "icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

### sw.js (Service Worker — základní offline cache)
```javascript
const CACHE = 'teelibrary-v1';
const ASSETS = ['/', '/index.html', '/manifest.json'];

self.addEventListener('install', e =>
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)))
);

self.addEventListener('fetch', e =>
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  )
);
```

### Registrace SW v index.html (přidat před </body>)
```html
<script>
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js');
  }
</script>
```

---

## 🏷 Kategorie

Výchozí kategorie (lze přidávat přes UI):

| Emoji | Název | Popis |
|-------|-------|-------|
| 🧠 | Terapie | Nástroje pro terapeutickou práci |
| 💻 | Aplikace | Obecné webové aplikace |
| 💬 | Komunikace | Komunikační a prezentační nástroje |
| 📦 | Ostatní | Vše ostatní |

**Vlastní kategorie:** Uživatel může přidat novou kategorii přes tlačítko „+ Přidat kategorii" — zadá název a vybere emoji.

---

## 🃏 Karta aplikace (App Card)

Každá appka má:

| Pole | Typ | Povinné | Popis |
|------|-----|---------|-------|
| `name` | string | ✅ | Název aplikace |
| `url` | string | ✅ | URL adresa |
| `category` | string | ✅ | ID kategorie |
| `emoji` | string | ✅ | Ikona (emoji) |
| `description` | string | ✅ | Stručný popis (1–2 věty) |
| `screenshot` | string | ❌ | URL screenshotu / náhledu |
| `tags` | array | ❌ | Štítky pro filtrování |

### UI prvky každé karty:
- 🖼 **Náhledový obrázek** (screenshot nebo placeholder s gradientem)
- 🏷 **Název + emoji ikona**
- 📝 **Stručný popis**
- 🔗 **Tlačítko „Otevřít"** → otevře URL v novém tabu
- 📋 **Tlačítko „Kopírovat odkaz"** → zkopíruje URL do schránky + toast notifikace
- ✏️ **Tlačítko „Upravit"** → inline editace karty
- 🗑 **Tlačítko „Smazat"** → s potvrzením

---

## ➕ Přidání nové appky

Tlačítko **„+ Přidat appku"** otevře modální dialog s formulářem:
1. Název appky
2. URL
3. Kategorie (výběr z existujících)
4. Emoji ikona (picker nebo textové pole)
5. Popis
6. Volitelně: URL screenshotu

Data se ukládají do **Firebase Firestore** — dostupná na všech zařízeních, synchronizovaná v reálném čase.

---

## 🔍 Filtrování & vyhledávání

- **Záložky kategorií** — přepínání mezi kategoriemi
- **Vyhledávací pole** — filtruje appky podle názvu nebo popisu v reálném čase
- **Zobrazení „Vše"** — všechny appky bez filtru

---

## 💾 Datové úložiště — Firebase Firestore

Data se ukládají v **Firebase Firestore** (NoSQL cloud databáze) — díky tomu jsou dostupná na všech zařízeních, nepřijdou při smazání cache a dají se spravovat i přímo ve Firebase konzoli.

### Firebase projekt (nastavení)

1. Jdi na [console.firebase.google.com](https://console.firebase.google.com)
2. Vytvoř nový projekt: `teelibrary`
3. Přidej **Firestore Database** (režim: production nebo test)
4. Přidej **webovou appku** → zkopíruj `firebaseConfig`
5. Pravidla Firestore (pro osobní použití — pouze ty):
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```
> Pokud chceš appku bez přihlášení (jen pro sebe), můžeš dočasně použít `allow read, write: if true;` — ale není to doporučeno pro produkci.

### Struktura kolekcí ve Firestore

```
Firestore
├── apps/               ← kolekce aplikací
│   ├── {autoId}
│   │   ├── name: "FirstMap"
│   │   ├── url: "https://firstmap-rosy.vercel.app/"
│   │   ├── category: "aplikace"
│   │   ├── emoji: "🗺️"
│   │   ├── description: "Interaktivní mapa..."
│   │   ├── screenshot: null
│   │   ├── tags: []
│   │   └── createdAt: timestamp
│   └── ...
└── categories/         ← kolekce kategorií
    ├── {autoId}
    │   ├── name: "Terapie"
    │   ├── emoji: "🧠"
    │   └── order: 1
    └── ...
```

### Firebase SDK (přidat do index.html)

```html
<!-- Firebase App + Firestore (modular SDK) -->
<script type="module">
  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
  import {
    getFirestore, collection, getDocs, addDoc,
    updateDoc, deleteDoc, doc, onSnapshot
  } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

  const firebaseConfig = {
    apiKey: "ТВОЙ_API_KEY",
    authDomain: "teelibrary.firebaseapp.com",
    projectId: "teelibrary",
    // ... zbytek konfigurace z Firebase konzole
  };

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
</script>
```

### Klíčové Firestore operace

```javascript
// Načíst všechny appky (real-time listener)
onSnapshot(collection(db, 'apps'), (snapshot) => {
  const apps = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  renderApps(apps);
});

// Přidat novou appku
await addDoc(collection(db, 'apps'), {
  name, url, category, emoji, description,
  screenshot: null, tags: [],
  createdAt: new Date()
});

// Upravit appku
await updateDoc(doc(db, 'apps', id), { name, description });

// Smazat appku
await deleteDoc(doc(db, 'apps', id));
```

### Fallback (offline / první spuštění)

Pokud Firebase není dostupný (offline), appka zobrazí data z `localStorage` jako zálohu. Data se synchronizují jakmile je připojení obnoveno.

```javascript
// Lokální cache jako fallback
localStorage.setItem('teeLibrary_cache', JSON.stringify(apps));
```

**Výchozí seed data** (jednorázově nahrát do Firestore při prvním spuštění):

```javascript
const DEFAULT_APPS = [
  {
    id: '1',
    name: 'FirstMap',
    url: 'https://firstmap-rosy.vercel.app/',
    category: 'aplikace',
    emoji: '🗺️',
    description: 'Interaktivní mapa pro vizualizaci dat.',
    screenshot: null,
    tags: []
  },
  {
    id: '2',
    name: 'Terka Pro',
    url: 'https://terka-pro.vercel.app/',
    category: 'aplikace',
    emoji: '✨',
    description: 'Profesionální nástroj pro každodenní práci.',
    screenshot: null,
    tags: []
  },
  {
    id: '3',
    name: 'Digiterapie Studio',
    url: 'https://digistudio-eta.vercel.app/',
    category: 'terapie',
    emoji: '🧠',
    description: 'AI Creative Tools for Therapists — kreativní nástroje pro terapeuty.',
    screenshot: null,
    tags: ['AI', 'terapie']
  },
  {
    id: '4',
    name: 'Gabina Pro',
    url: 'https://gabina-pro.vercel.app/',
    category: 'komunikace',
    emoji: '💜',
    description: 'Profesionální komunikační nástroj.',
    screenshot: null,
    tags: []
  },
  {
    id: '5',
    name: 'Erasmus+ Göteborg 2026',
    url: 'https://erasmus-goteborg.vercel.app/',
    category: 'ostatni',
    emoji: '🌍',
    description: 'Projektová stránka pro Erasmus+ výjezd do Göteborgu 2026.',
    screenshot: null,
    tags: ['Erasmus', 'projekt']
  }
];

const DEFAULT_CATEGORIES = [
  { id: 'terapie',     name: 'Terapie',     emoji: '🧠' },
  { id: 'aplikace',    name: 'Aplikace',    emoji: '💻' },
  { id: 'komunikace',  name: 'Komunikace',  emoji: '💬' },
  { id: 'ostatni',     name: 'Ostatní',     emoji: '📦' }
];
```

---

## 🎨 Design

### Barevná paleta (CSS proměnné)
```css
--teal-deep:   #0a7c79;
--teal-mid:    #14b8a6;
--teal-light:  #5eead4;
--teal-pale:   #ccfbf1;
--teal-glow:   #0d9488;
--bg:          #f0fdfa;
--card-bg:     #ffffff;
--text:        #134e4a;
--text-soft:   #5f9ea0;
```

### Fonty
- **Display / nadpisy:** Playfair Display (serif, Google Fonts)
- **UI / tělo:** DM Sans (sans-serif, Google Fonts)

### Klíčové UI prvky
- Zaoblené karty se stínem (`border-radius: 20px`)
- Hover animace (lehký `translateY(-4px)`)
- Fade-up animace při načtení (staggered delay)
- Toast notifikace pro „Zkopírováno!"
- Plovoucí logo s `float` animací
- Průhledné dekorativní radiální gradienty na pozadí

---

## 🔔 Navrhovaná vylepšení (do budoucna)

| Nápad | Popis |
|-------|-------|
| ⭐ Oblíbené | Hvězdičky pro označení top appek |
| 📊 Statistiky | Kolikrát jsem appku otevřela |
| 🌙 Dark mode | Přepínač tmavého režimu |
| 🔗 Sdílení | Vygenerovat veřejný link na celou knihovnu |
| 📤 Export/Import | Záloha dat jako JSON soubor |
| 🖼 Screenshot auto-fetch | Automatický náhled stránky přes API |
| 🔔 Novinky | Poznámka „nové" u naposledy přidaných appek |

---

## 🚀 Nasazení

1. GitHub repozitář: `teelibrary` (public)
2. Soubor: **`index.html`** (povinný název pro Vercel)
3. Vercel: připojit GitHub repo → auto-deploy při každém commitu
4. URL: `teelibrary.vercel.app` (nebo vlastní doména)

---

## ✏️ Jak přidat novou appku (workflow)

**Varianta A — přes UI (doporučeno):**
Otevřít TeeLibrary → kliknout „+ Přidat appku" → vyplnit formulář → Uložit.
Data se okamžitě uloží do **Firebase Firestore** a jsou dostupná na všech zařízeních (mobil, desktop, kdekoli).

**Varianta B — přes Firebase konzoli:**
Jít na [console.firebase.google.com](https://console.firebase.google.com) → Firestore → kolekce `apps` → přidat dokument ručně.

**Varianta C — přes kód (změna struktury/designu):**
Napsat Claudovi → dostanu upravený `index.html` → nahrát na GitHub → Vercel auto-deploy.
*(Vhodné jen pro změny v designu nebo struktuře, ne pro přidávání dat)*

---

*Poslední aktualizace specifikace: duben 2026*
