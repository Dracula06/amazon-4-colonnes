# Amazon 4 Columns & Tools

> A Chrome extension (Manifest V3) that helps you buy smarter on Amazon — with a 4-column layout, multilingual seller badges, ad blocking, price history, cashback links, and structured exports to Discord, Telegram, and GitHub.

**Supported marketplaces:** amazon.fr · amazon.de · amazon.es · amazon.it · amazon.co.uk

---

## Features

### 🗂️ 4-Column Layout
Reorganizes Amazon product pages into a denser, side-by-side 4-column grid for faster visual comparison.

### 🏷️ Multilingual Seller Badges
Automatically classifies every product's fulfillment chain in real time:

| Badge | Meaning |
|---|---|
| ✅ `AMAZON` | Shipped **and** sold by Amazon |
| 🟡 `AMAZON / seller` | Sold by third-party, **fulfilled by Amazon** |
| 🔴 `seller` | Sold **and** shipped by third-party seller |
| ⚠️ `TO CHECK` | Contradictory or unrecognized signals |

The classification engine (`core.js`) covers **5 languages** (FR, EN, DE, ES, IT) with multilingual regex patterns and handles all Amazon phrasing variants ("Expédié et vendu par", "Sold and shipped by", "Versand durch Amazon", etc.).

### 🚫 Ad & Recommendation Blocker
Removes sponsored products, cross-sell banners, and recommendation carousels using `declarativeNetRequest` rules — no JavaScript injection, no performance cost.

### 📈 Keepa Price History Integration
Embeds the Keepa price history chart inline on product pages, so you can see the full price trend without switching tabs.

### 💸 Cashback Links
Automatically displays cashback links for Wanteeed, Poulpeo, iGraal, and TopCashback on every product page — configurable in settings.

### 📤 Structured Export (Discord / Telegram / GitHub)
One-click export of a normalized product card including:
- Title, ASIN, EAN, marketplace
- Current price, discount rate, reference price
- Seller & fulfillment classification
- Cashback links

Exports go to Discord webhooks, Telegram bots, or a private GitHub repository — all configured by the user, no server involved.

### 🔗 Affiliate Link & Quick Frame
Strips tracking parameters and generates clean affiliate links. Displays an inline quick-view frame for fast product preview.

---

## Architecture

The extension follows a strict separation of concerns — no monolith:

```
core.js                      ← Seller classification engine (multilingual regex + NLP)
amazon.js                    ← Legacy orchestrator (scheduled for modular refactor)
src/
  display/                   ← UI modules (layout, reviews, shipping lock, Keepa frame, affiliate)
  library/                   ← Business logic (capture, pricing, export, Discord, Telegram, GitHub transport)
  quick-share/               ← Background service worker + share settings
manifest.json                ← MV3 manifest
rules.json                   ← declarativeNetRequest ad-blocking rules
tests/                       ← Unit tests (Node.js test runner, no browser required)
```

> **Design rule:** controllers never contain business logic. Business modules never touch the UI. No remote dependency is executed at runtime.

---

## Privacy & Security

- **No account required**, no login, no data collection
- All settings stored locally in `chrome.storage`
- GitHub tokens are stored in `chrome.storage.local` only — never in the repository, never in synced storage, never in captures
- Captured DOM pages are stored **locally only** and never committed to the repository
- Raw captures (pre-sanitization) are never shared; sanitized exports require user confirmation
- The extension never executes captured HTML within its own origin

---

## Installation (Developer Mode)

1. Clone or download this repository
2. Open `chrome://extensions` (or `brave://extensions`)
3. Enable **Developer mode** (top right)
4. Click **Load unpacked** and select the project folder
5. Navigate to any supported Amazon marketplace — the extension activates automatically

---

## Tests

```bash
node --test tests/
```

Tests run entirely in Node.js on DOM fixtures — no browser, no secrets, no network calls.

---

## Roadmap

- [ ] Refactor `amazon.js` into modular components (with tests)
- [ ] NLP fallback for unrecognized seller phrases (new languages: NL, PL, SE)
- [ ] AI-powered review summary (3-point verdict: pros / cons / verdict)
- [ ] Inflated "reference price" detection using Keepa history
- [ ] Chrome Web Store publication

---

## Contributing

Issues and pull requests are welcome. Please read `AGENTS.md` for contribution rules (modularity, capture safety, test requirements).

---

## License

MIT
