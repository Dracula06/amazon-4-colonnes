(()=>{
'use strict';

const C = ALCore;
const R = globalThis.ALReviews;
const L = globalThis.ALShippingLock;
const A = globalThis.ALAffiliate;
const QF = globalThis.ALQuickFrame;
const CSS_BASE = `
#ppd.al-layout {
  display: grid !important;
  gap: 20px !important;
  align-items: start !important;
}
#ppd.al-layout.al-has-4cols {
  grid-template-columns: minmax(0, 1.35fr) minmax(300px, 1fr) minmax(220px, 260px) minmax(220px, 260px) !important;
}
#ppd.al-layout.al-has-3cols {
  grid-template-columns: minmax(0, 1.35fr) minmax(350px, 1.5fr) minmax(240px, 300px) !important;
}
#ppd.al-layout::before, #ppd.al-layout::after { display: none !important; }
#ppd.al-layout > #leftCol, #ppd.al-layout > #centerCol, #ppd.al-layout > #rightCol {
  float: none !important;
  position: static !important;
  inset: auto !important;
  width: auto !important;
  min-width: 0 !important;
  max-width: none !important;
  margin: 0 !important;
  grid-row: 1 !important;
}
#ppd.al-layout > #leftCol { grid-column: 1 !important; }
#ppd.al-layout > #centerCol { grid-column: 2 !important; }
#ppd.al-layout > #rightCol { grid-column: 3 !important; display: block !important; height: auto !important; visibility: visible !important; }
#ppd.al-layout > #al-offers { grid-column: 4 !important; grid-row: 1 !important; min-width: 0; }
#ppd.al-layout > :not(#leftCol):not(#centerCol):not(#rightCol):not(#al-offers) { grid-column: 1 / -1; min-width: 0; }
#al-offers > h2 { font-size: 18px; line-height: 24px; margin: 0 0 12px; }
#rightCol #desktop_buybox { width: 100% !important; max-width: 100% !important; }
#leftCol #imageBlock_feature_div { max-width: 100% !important; }
.al-cart-gap { margin-top: 12px !important; }
#al-badge {
  border: 2px solid #d98900;
  border-radius: 12px;
  background: #fff8e8;
  padding: 12px;
  margin: 14px 0;
  font: 14px/1.4 Arial, system-ui, sans-serif;
  color: #17202a;
  box-sizing: border-box;
  overflow-wrap: anywhere;
}
#al-badge strong { font-size: 24px; display: block; line-height: 1.3; }
#al-badge small { display: block; font-size: 12px; color: #555; margin-top: 4px; }
#al-badge.fba { border-color: #3373aa; background: #eef7ff; }
#al-badge.amazon { border-color: #16836b; background: #effbf6; }
#al-badge.unknown { border-color: #999; background: #f7f7f7; }
#al-badge.shipping-blocked {
  border-color: #dc2626 !important;
  box-shadow: 0 0 0 1px rgba(220, 38, 38, 0.15);
}
#al-badge .al-lock-alert {
  background: #fef2f2;
  border: 1px solid #fca5a5;
  border-radius: 8px;
  padding: 8px 10px;
  margin-bottom: 10px;
  color: #7f1d1d;
}
#al-badge .al-lock-title {
  font-size: 13px;
  font-weight: 700;
  color: #b91c1c;
  display: block;
  line-height: 1.3;
}
#al-badge .al-lock-desc {
  font-size: 12px;
  color: #7f1d1d;
  margin-top: 3px;
  line-height: 1.35;
}
#al-badge .al-lock-quote {
  display: block;
  font-size: 11px;
  color: #991b1b;
  margin-top: 4px;
  font-style: italic;
}

/* Cadre de redirection d'origine (ex: lien amazon.it ouvert sur amazon.fr) */
#al-origin-banner {
  position: fixed !important;
  top: 14px !important;
  right: 18px !important;
  z-index: 9999999 !important;
  background: #ffffff !important;
  border: 2px solid #0284c7 !important;
  border-radius: 10px !important;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18) !important;
  padding: 12px 14px !important;
  font: 13px/1.4 system-ui, -apple-system, sans-serif !important;
  color: #0f172a !important;
  max-width: 320px !important;
  box-sizing: border-box !important;
}
#al-origin-banner .al-header {
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  gap: 8px !important;
  font-weight: 600 !important;
  margin-bottom: 6px !important;
  color: #0369a1 !important;
}
#al-origin-banner .al-close {
  cursor: pointer !important;
  border: none !important;
  background: transparent !important;
  font-size: 16px !important;
  color: #64748b !important;
  line-height: 1 !important;
  padding: 0 4px !important;
}
#al-origin-banner .al-close:hover { color: #0f172a !important; }
#al-origin-banner .al-link {
  display: inline-block !important;
  color: #0284c7 !important;
  text-decoration: underline !important;
  font-weight: 600 !important;
  margin: 6px 0 !important;
  word-break: break-all !important;
}
#al-origin-banner .al-btn {
  margin-top: 6px !important;
  padding: 5px 10px !important;
  font-size: 11px !important;
  font-weight: 600 !important;
  border-radius: 5px !important;
  border: 1px solid #cbd5e1 !important;
  background: #f8fafc !important;
  color: #334155 !important;
  cursor: pointer !important;
  display: inline-flex !important;
  align-items: center !important;
  gap: 4px !important;
}
#al-origin-banner .al-btn:hover { background: #e2e8f0 !important; }
`;

const ADS_SELECTORS = [
  '#sp_detail', '#sp_detail2', '#sp_detail_themis', '#ape_Detail_hero-quick-promo',
  '#ape_Detail_main-bottom-placement', '.ape-placement', '[id^="ape_"]',
  '[data-component-type="sp-sponsored-result"]', '.sp-desktop-dp-sims',
  '#sponsoredProducts2_feature_div', '#amsDetailSkyFeature', '#dp-ads-center-promo_feature_div',
  '.ad-feedback-text', '.s-sponsored-label-info-icon'
];

const RECS_SELECTORS = [
  '#sims-consolidated-1_feature_div', '#sims-consolidated-2_feature_div',
  '#desktop-dp-sims_feature_div', '#desktop-dp-sims-secondary_feature_div',
  '[data-feature-name="desktop-dp-sims"]', '[data-feature-name="desktop-dp-sims-secondary"]',
  '#similarities_feature_div', '#bundleV2_feature_div', '#rhf'
];

const REVIEWS_SELECTORS = R?.REVIEWS_BLOCK_SELECTORS || [
  '#customerReviews', '#reviews-medley-footer', '#ask_feature_div'
];

let settings = {
  fourColumns: true,
  minWidth: 1200,
  hideAds: true,
  hideRecommendations: false,
  hideReviews: false,
  showQuickFrame: true,
  quickFramePos: null
};

let baseStyle = null;
let customStyle = null;
let panel = null;
let timer = null;
let state = 'Initialisation';
let snapshot = {};
let shippingSnapshot = { blocked: false };
let siteStripeSnapshot = { present: false };
let affiliateTags = {};
let reviewsRevealed = false;
let lastReviewsAsin = R ? R.extractAsinFromPath(location.pathname) : '';
const moves = [];
const changes = [];
const gaps = new Set();

function visible(el) {
  if (!el || el.closest('.a-popover-preload, [hidden], .aok-hidden, [aria-hidden="true"]')) return false;
  for (let e = el; e && e !== document.documentElement; e = e.parentElement) {
    const s = getComputedStyle(e);
    if (s.display === 'none' || s.visibility === 'hidden') return false;
  }
  return el.getClientRects().length > 0;
}

const text = e => C.clean(e?.textContent);

function firstVisible(root, selector) {
  return [...root.querySelectorAll(selector)].find(visible);
}

function move(e, to, before = null) {
  if (!e || !to || e === to || e.contains(to) || (e.parentNode === to && !before)) return;
  const marker = document.createComment('al-original');
  e.before(marker);
  moves.push({ e, marker });
  to.insertBefore(e, before);
}

function toggle(e, c, add) {
  if (e.classList.contains(c) !== add) {
    e.classList.toggle(c, add);
    changes.push({ e, c, add });
  }
}

function reset() {
  for (const x of moves.reverse()) {
    if (x.marker.isConnected) x.marker.replaceWith(x.e);
  }
  moves.length = 0;
  for (const x of changes.reverse()) {
    x.e.classList.toggle(x.c, !x.add);
  }
  changes.length = 0;
  for (const e of gaps) e.classList.remove('al-cart-gap');
  gaps.clear();
  document.getElementById('al-badge')?.remove();
  panel?.remove();
  panel = null;
  baseStyle?.remove();
  baseStyle = null;
  snapshot = {};
  shippingSnapshot = { blocked: false };
}

function updateCustomCSS() {
  if (!customStyle) {
    customStyle = document.createElement('style');
    customStyle.id = 'al-custom-display';
    document.head.append(customStyle);
  }

  const rules = [];
  if (settings.hideAds) {
    rules.push(`${ADS_SELECTORS.join(',\n')} { display: none !important; }`);
  }
  if (settings.hideRecommendations) {
    rules.push(`${RECS_SELECTORS.join(',\n')} { display: none !important; }`);
  }
  const hideReviewsNow = R
    ? R.shouldHideReviews(settings, { reviewsRevealed })
    : (settings.hideReviews && !reviewsRevealed);

  if (hideReviewsNow) {
    rules.push(`${REVIEWS_SELECTORS.join(',\n')} { display: none !important; }`);
  }

  if (settings.hideReviews && reviewsRevealed) {
    rules.push(`#al-reviews-banner {
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  gap: 12px !important;
  margin: 12px 0 !important;
  padding: 8px 12px !important;
  border: 1px solid #cbd5e1 !important;
  border-radius: 8px !important;
  background: #f8fafc !important;
  color: #334155 !important;
  font: 12px/1.4 system-ui, -apple-system, sans-serif !important;
}
#al-reviews-rehide {
  cursor: pointer !important;
  padding: 4px 10px !important;
  border-radius: 6px !important;
  border: 1px solid #94a3b8 !important;
  background: #ffffff !important;
  color: #0f172a !important;
  font: 600 12px/1.3 system-ui, -apple-system, sans-serif !important;
}
#al-reviews-rehide:hover { background: #e2e8f0 !important; }`);
  }

  customStyle.textContent = rules.join('\n\n');
}

function renderReviewsBanner() {
  const existing = document.getElementById('al-reviews-banner');
  if (!(settings.hideReviews && reviewsRevealed)) {
    existing?.remove();
    return;
  }

  const container = document.getElementById('customerReviews') || document.getElementById('reviews-medley-footer');
  if (!container) return;
  if (existing && existing.parentElement === container) return;
  existing?.remove();

  const banner = document.createElement('div');
  banner.id = 'al-reviews-banner';

  const label = document.createElement('span');
  label.textContent = '⭐ Avis clients affichés sur demande';

  const btn = document.createElement('button');
  btn.id = 'al-reviews-rehide';
  btn.type = 'button';
  btn.textContent = 'Masquer à nouveau';
  btn.onclick = () => {
    reviewsRevealed = false;
    banner.remove();
    updateCustomCSS();
  };

  banner.append(label, btn);
  container.prepend(banner);
}

function activeDetails() {
  const groups = [...document.querySelectorAll('#ppd .offer-display-features-container')]
    .filter(visible)
    .filter(e => !e.closest('#al-offers'));
  const candidates = [];

  for (const group of groups) {
    const shipEl = firstVisible(group, '[offer-display-feature-name="desktop-fulfiller-info"] .offer-display-feature-text-message');
    const sellerEl = firstVisible(group, '[offer-display-feature-name="desktop-merchant-info"] .offer-display-feature-text-message');
    if (!shipEl && !sellerEl) continue;

    let score = 0;
    const row = group.closest('.a-accordion-active, [aria-expanded="true"], .a-accordion-row-container');
    if (row?.matches('.a-accordion-active, [aria-expanded="true"]')) score += 10;
    if (group.closest('#desktop_buybox')) score += 2;

    candidates.push({
      ship: text(shipEl),
      seller: text(sellerEl),
      source: 'Messages visibles du groupe d’offre actif',
      score
    });
  }

  if (candidates.length) {
    candidates.sort((a, b) => b.score - a.score);
    const best = candidates.filter(e => e.score === candidates[0].score);
    const signatures = new Set(best.map(e => C.shipName(e.ship) + '|' + C.sellerName(e.seller)));
    if (signatures.size === 1) return best[0];
    return { ship: '', seller: '', source: 'Plusieurs groupes visibles contradictoires' };
  }

  const root = document.querySelector('#desktop_buybox') || document.querySelector('#usedOnlyBuybox') || document.querySelector('#usedbuyBox') || document.querySelector('#buybox') || document.querySelector('#ppd');
  if (!root) return { ship: '', seller: '', source: 'Aucune fiche' };

  const merchant = firstVisible(root, '[id="merchant-info"]');
  if (merchant) {
    const t = C.clean(merchant.innerText);
    const comb = C.combined(t);
    if (comb) return { ship: comb.ship, seller: comb.seller, source: 'Texte combiné marchand' };
  }

  const ship = firstVisible(root, '[id*="SSOFpopoverLink"], [id*="ssof"], [id="fulfillerInfoFeature_feature_div"] .offer-display-feature-text-message, [tabular-attribute-name="Expéditeur"] .tabular-buybox-text, [tabular-attribute-name="Ships from"] .tabular-buybox-text, [tabular-attribute-name="Versand"] .tabular-buybox-text, [tabular-attribute-name="Envío"] .tabular-buybox-text, [tabular-attribute-name="Spedizione"] .tabular-buybox-text');
  const seller = firstVisible(root, '[id="sellerProfileTriggerId"], [id="merchantInfoFeature_feature_div"] .offer-display-feature-text-message, [tabular-attribute-name="Vendu par"] .tabular-buybox-text, [tabular-attribute-name="Sold by"] .tabular-buybox-text, [tabular-attribute-name="Verkäufer"] .tabular-buybox-text, [tabular-attribute-name="Vendido por"] .tabular-buybox-text, [tabular-attribute-name="Venduto da"] .tabular-buybox-text');

  return { ship: text(ship), seller: text(seller), source: 'Champs marchands visibles tabulaires/classiques' };
}

const COUNTRY_FLAGS = {
  'amazon.it': { flag: '🇮🇹', name: 'Italie' },
  'amazon.de': { flag: '🇩🇪', name: 'Allemagne' },
  'amazon.es': { flag: '🇪🇸', name: 'Espagne' },
  'amazon.co.uk': { flag: '🇬🇧', name: 'Royaume-Uni' },
  'amazon.fr': { flag: '🇫🇷', name: 'France' },
  'amazon.com': { flag: '🇺🇸', name: 'États-Unis' },
  'amazon.ca': { flag: '🇨🇦', name: 'Canada' },
  'amazon.nl': { flag: '🇳🇱', name: 'Pays-Bas' },
  'amazon.be': { flag: '🇧🇪', name: 'Belgique' }
};

function extractOriginUrl(currentUrl) {
  try {
    const u = new URL(currentUrl);
    const raw = u.searchParams.get('ar_su') || u.searchParams.get('redirectUrl') || u.searchParams.get('orig_url');
    if (!raw) return null;
    let decoded = raw;
    try { decoded = decodeURIComponent(raw); } catch {}
    const origin = new URL(decoded);
    const host = origin.hostname.replace(/^www\./, '').toLowerCase();
    if (!host.startsWith('amazon.')) return null;

    const cleanParams = new URLSearchParams(origin.searchParams);
    cleanParams.delete('ar_su');
    cleanParams.delete('ar_srct');
    cleanParams.delete('ar_mt');

    if (!cleanParams.has('creatorsDisableRedirect')) {
      cleanParams.set('creatorsDisableRedirect', 'true');
    }

    for (const key of ['tag', 'linkCode', 'ascsubtag', 'th', 'psc', 'smid']) {
      if (!cleanParams.has(key) && u.searchParams.has(key)) {
        cleanParams.set(key, u.searchParams.get(key));
      }
    }

    const searchStr = cleanParams.toString();
    const cleanPath = origin.pathname.replace(/\/+$/, '');
    const cleanUrl = `${origin.protocol}//${origin.host}${cleanPath}${searchStr ? '?' + searchStr : ''}`;
    const info = COUNTRY_FLAGS[host] || { flag: '🌐', name: host };
    return { host, cleanUrl, flag: info.flag, name: info.name };
  } catch {
    return null;
  }
}

let originBannerDismissed = false;
function renderOriginBanner() {
  if (originBannerDismissed) return;
  const origin = extractOriginUrl(location.href);
  const existing = document.getElementById('al-origin-banner');
  if (!origin) {
    existing?.remove();
    return;
  }

  // Redirection automatique si activée par l'utilisateur
  if (settings.autoRedirectOrigin) {
    const loopKey = 'al_loop_' + (origin.asin || origin.host);
    const last = sessionStorage.getItem(loopKey);
    const now = Date.now();

    if (last && (now - parseInt(last, 10)) < 8000) {
      // Éviter une boucle infinie de va-et-vient entre les deux boutiques
    } else {
      sessionStorage.setItem(loopKey, String(now));
      try {
        const target = new URL(origin.cleanUrl);
        target.searchParams.set('creatorsDisableRedirect', 'true');
        location.replace(target.href);
      } catch {
        location.replace(origin.cleanUrl);
      }
      return;
    }
  }

  if (existing) return;

  const banner = document.createElement('div');
  banner.id = 'al-origin-banner';

  const header = document.createElement('div');
  header.className = 'al-header';
  header.innerHTML = `<span>${origin.flag} Lien initial : Amazon ${origin.name}</span>`;

  const closeBtn = document.createElement('button');
  closeBtn.className = 'al-close';
  closeBtn.setAttribute('aria-label', 'Fermer');
  closeBtn.textContent = '✕';
  closeBtn.onclick = () => {
    originBannerDismissed = true;
    banner.remove();
  };
  header.append(closeBtn);

  const textDesc = document.createElement('div');
  textDesc.style.fontSize = '12px';
  textDesc.style.color = '#475569';
  textDesc.textContent = 'Votre compte vous a redirigé vers ce site. Vous pouvez consulter la fiche d’origine :';

  const link = document.createElement('a');
  link.className = 'al-link';
  link.href = origin.cleanUrl;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.textContent = `↗ Ouvrir sur ${origin.host}`;

  const copyBtn = document.createElement('button');
  copyBtn.className = 'al-btn';
  copyBtn.textContent = '📋 Copier le lien d’origine';
  copyBtn.onclick = async () => {
    try {
      await navigator.clipboard.writeText(origin.cleanUrl);
      copyBtn.textContent = '✅ Lien copié !';
      setTimeout(() => { copyBtn.textContent = '📋 Copier le lien d’origine'; }, 2000);
    } catch {}
  };

  banner.append(header, textDesc, link, document.createElement('br'), copyBtn);
  const stack = QF?.ensureFloatingStack?.(document);
  (stack || document.body).append(banner);
}

function getCurrentProductSummary() {
  const titleEl = document.querySelector('#productTitle');
  const currencyEl = document.querySelector('.a-price-symbol');
  const asin = A?.extractAsin?.(location.pathname)
    || location.pathname.match(/\/(?:dp|gp\/product)\/([A-Z0-9]{10})/i)?.[1]
    || null;
  return {
    title: text(titleEl),
    asin,
    price: extractProductPrice(),
    currencySymbol: text(currencyEl) || '€',
    url: location.href
  };
}

function renderFloatingQuickFrame() {
  if (!A || !QF) return;
  const country = A.resolveDefinedCountry(location.hostname);
  siteStripeSnapshot = A.extractSiteStripeInfo(document);
  const isProductPage = Boolean(document.querySelector('#productTitle'));
  const product = getCurrentProductSummary();
  const savedTag = country ? (affiliateTags[country.code] || '') : '';

  QF.renderQuickFrame({
    doc: document,
    country,
    siteStripe: siteStripeSnapshot,
    savedTag,
    isProductPage,
    logistics: snapshot,
    shippingRestriction: shippingSnapshot,
    product,
    visible: settings.showQuickFrame !== false,
    position: settings.quickFramePos || null,
    onSavePosition: pos => {
      settings.quickFramePos = pos;
      try {
        chrome.runtime.sendMessage({
          action: 'saveDisplaySettings',
          settings: { quickFramePos: pos }
        });
      } catch {}
    },
    onSaveTag: (countryCode, tagValue) => new Promise(resolve => {
      try {
        chrome.runtime.sendMessage({
          action: 'saveAffiliateTags',
          tags: { [countryCode]: tagValue }
        }, res => {
          if (res?.tags) affiliateTags = res.tags;
          resolve(res || { ok: true });
        });
      } catch (err) {
        resolve({ ok: false, error: err?.message || 'Erreur extension' });
      }
    }),
    onShareDiscord: isProductPage ? (affiliateUrl => new Promise(resolve => {
      try {
        const data = {
          asin: product.asin || 'Inconnu',
          title: product.title || 'Produit sans titre',
          price: product.price || null,
          currencySymbol: product.currencySymbol || '€',
          url: affiliateUrl || product.url,
          kind: snapshot.kind,
          code: snapshot.code,
          label: snapshot.label,
          seller: snapshot.seller,
          ship: snapshot.ship,
          shippingRestriction: shippingSnapshot?.blocked ? shippingSnapshot : null,
          marketplace: country ? country.code : 'FR'
        };
        chrome.runtime.sendMessage({ action: 'sendDiscord', data }, res => {
          resolve(res || { ok: false, error: 'Aucune réponse' });
        });
      } catch (err) {
        resolve({ ok: false, error: err?.message || 'Erreur Discord' });
      }
    })) : null
  });
}

function updateBadge() {
  if (!document.querySelector('#productTitle')) {
    document.getElementById('al-badge')?.remove();
    shippingSnapshot = { blocked: false };
    return;
  }

  const info = activeDetails();
  const result = C.classify(info.ship, info.seller);
  snapshot = { ...result, source: info.source };
  shippingSnapshot = L
    ? L.detectShippingRestriction(document, { hostname: location.hostname, isVisible: visible })
    : { blocked: false };

  let badge = document.getElementById('al-badge');
  if (!badge) {
    badge = document.createElement('section');
    badge.id = 'al-badge';
    badge.setAttribute('aria-label', 'Logistique de l’offre sélectionnée');
  }

  const signature = JSON.stringify({ logistics: snapshot, shipping: shippingSnapshot });
  if (badge.dataset.signature !== signature) {
    badge.dataset.signature = signature;
    badge.className = shippingSnapshot.blocked ? `${result.kind} shipping-blocked` : result.kind;

    const nodes = [];
    if (shippingSnapshot.blocked) {
      const alertBox = document.createElement('div');
      alertBox.className = 'al-lock-alert';

      const lockTitle = document.createElement('span');
      lockTitle.className = 'al-lock-title';
      lockTitle.textContent = `🔒 ${shippingSnapshot.title || 'LOCK pays'}`;

      const lockDesc = document.createElement('div');
      lockDesc.className = 'al-lock-desc';
      lockDesc.textContent = shippingSnapshot.explanation;

      alertBox.append(lockTitle, lockDesc);
      if (shippingSnapshot.detectedMessage) {
        const quote = document.createElement('span');
        quote.className = 'al-lock-quote';
        quote.textContent = `« ${shippingSnapshot.detectedMessage} »`;
        alertBox.append(quote);
      }
      nodes.push(alertBox);
    }

    const code = document.createElement('strong');
    code.textContent = result.code;

    const label = document.createElement('div');
    label.textContent = result.label;

    const seller = document.createElement('small');
    seller.textContent = 'Vendeur : ' + (result.seller || 'non identifié');

    const ship = document.createElement('small');
    ship.textContent = 'Expéditeur : ' + (result.ship || 'non identifié');

    const note = document.createElement('small');
    note.textContent = 'Offre sélectionnée uniquement';

    nodes.push(code, label, seller, ship, note);
    badge.replaceChildren(...nodes);
    badge.title = shippingSnapshot.blocked && shippingSnapshot.source
      ? `${info.source} · ${shippingSnapshot.source}`
      : info.source;
  }

  const primaryBuybox = document.querySelector('#desktop_buybox') || document.querySelector('#usedOnlyBuybox') || document.querySelector('#usedbuyBox') || document.querySelector('#buybox');
  const target = primaryBuybox || panel;
  if (target && badge.parentElement !== target) {
    target.append(badge);
  }
}

function apply() {
  observer.disconnect();
  try {
    const currentAsin = R ? R.extractAsinFromPath(location.pathname) : '';
    if (currentAsin && lastReviewsAsin && currentAsin !== lastReviewsAsin) {
      reviewsRevealed = false;
    }
    if (currentAsin) lastReviewsAsin = currentAsin;

    updateCustomCSS();

    const minWidth = settings.minWidth || 1200;
    const canLayout = settings.fourColumns && innerWidth >= minWidth;

    if (!canLayout) {
      if (panel) reset();
      state = !settings.fourColumns
        ? 'Disposition 4 colonnes désactivée'
        : `Largeur (${innerWidth} px) < seuil minimum (${minWidth} px) : affichage standard`;
    } else {
      if (!baseStyle) {
        baseStyle = document.createElement('style');
        baseStyle.id = 'al-base-style';
        baseStyle.textContent = CSS_BASE;
        document.head.append(baseStyle);
      }

      const p = document.querySelector('#ppd');
      const l = document.querySelector('#leftCol');
      const c = document.querySelector('#centerCol');
      const r = document.querySelector('#rightCol');

      if (p && l && c && r && document.querySelector('#productTitle')) {
        if (!panel) {
          panel = document.createElement('aside');
          panel.id = 'al-offers';
          const h = document.createElement('h2');
          h.textContent = 'Autres offres';
          panel.append(h);
          p.append(panel);
          toggle(p, 'al-layout', true);
          for (const e of [l, c, r]) toggle(e, 'dp-2col', false);
        }

        const buy = document.querySelector('#desktop_buybox');
        if (buy && !r.contains(buy)) move(buy, r, r.firstChild);

        const title = document.querySelector('#productTitle');
        if (l.contains(title)) {
          move(
            title.closest('#title_elements_redesigned_left') ||
            title.closest('#title_row_container') ||
            title.closest('#title_feature_div'),
            c,
            c.firstChild
          );
        }

        let hasOtherOffers = false;
        for (const id of ['olpLinkWidget_feature_div', 'olp_feature_div', 'mbc_feature_div', 'usedBuySection']) {
          const e = document.getElementById(id);
          if (!e || panel.contains(e) || e.contains(buy) || buy?.contains(e) || e.querySelector('input[type="radio"]') || e.closest('.a-accordion, [role="radiogroup"]')) continue;
          move(e, panel);
          hasOtherOffers = true;
        }

        if (hasOtherOffers || panel.children.length > 1) {
          panel.style.display = '';
          toggle(p, 'al-has-4cols', true);
          toggle(p, 'al-has-3cols', false);
          state = 'Quatre colonnes actives';
        } else {
          panel.style.display = 'none';
          toggle(p, 'al-has-3cols', true);
          toggle(p, 'al-has-4cols', false);
          state = 'Trois colonnes actives (espace étendu pour les variantes)';
        }
      } else {
        state = 'Fiche non compatible ou structure modifiée';
      }
    }

    for (const e of document.querySelectorAll('[id="add-to-cart-button"], [id="add-to-cart-button-ubb"]')) {
      const w = e.closest('.a-button');
      if (w && !w.classList.contains('al-cart-gap')) {
        w.classList.add('al-cart-gap');
        gaps.add(w);
      }
    }

    updateBadge();
    renderOriginBanner();
    renderFloatingQuickFrame();
    renderReviewsBanner();
  } catch (e) {
    state = 'Erreur : ' + e.message;
  } finally {
    observer.observe(document.body, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['class', 'style', 'hidden', 'aria-expanded', 'aria-checked', 'aria-selected', 'aria-hidden', 'checked']
    });
  }
}

function schedule() {
  clearTimeout(timer);
  timer = setTimeout(apply, 180);
}

const observer = new MutationObserver(schedule);

// Récupération des préférences via le background script (sécurisé TRUSTED_CONTEXTS)
try {
  chrome.runtime.sendMessage({ action: 'getDisplaySettings' }, res => {
    if (res) {
      settings = { ...settings, ...res };
      apply();
    }
  });
  chrome.runtime.sendMessage({ action: 'getAffiliateTags' }, tags => {
    if (tags) {
      affiliateTags = tags;
      apply();
    }
  });
} catch {}
apply();

function extractProductPrice() {
  const el = document.querySelector('#usedBuySection .offer-price, #corePriceDisplay_desktop_feature_div .a-offscreen, #corePrice_feature_div .a-offscreen, .apexPriceToPay .a-offscreen, #price_inside_buybox, .priceToPay .a-offscreen');
  if (el) {
    const t = text(el);
    if (t) return t.replace(/&nbsp;/g, ' ');
  }
  const whole = document.querySelector('.a-price-whole');
  const fraction = document.querySelector('.a-price-fraction');
  if (whole) {
    const w = text(whole).replace(/[.,]/g, '').trim();
    const f = fraction ? text(fraction).trim() : '00';
    return `${w},${f}`;
  }
  return null;
}

// Écoute des mises à jour émises depuis la popup ou les options
chrome.runtime.onMessage.addListener((m, s, r) => {
  if (m.action === 'displaySettingsChanged') {
    const prevHideReviews = !!settings.hideReviews;
    settings = { ...settings, ...m.settings };
    if (!!settings.hideReviews !== prevHideReviews) {
      reviewsRevealed = false;
    }
    apply();
  }
  if (m.action === 'affiliateTagsChanged') {
    affiliateTags = { ...affiliateTags, ...(m.tags || {}) };
    apply();
  }
  if (m.action === 'triggerSiteStripeShortLink') {
    if (!QF) {
      r({ ok: false, error: 'Module SiteStripe indisponible' });
      return false;
    }
    QF.triggerSiteStripeShortLink(document).then(r).catch(err => r({ ok: false, message: err.message }));
    return true;
  }
  if (m.action === 'status') {
    const product = getCurrentProductSummary();
    const country = A?.resolveDefinedCountry?.(location.hostname) || null;
    siteStripeSnapshot = A ? A.extractSiteStripeInfo(document) : { present: false };
    const savedTag = country ? (affiliateTags[country.code] || '') : '';
    const activeTag = siteStripeSnapshot.trackingId || savedTag || '';
    const quickLink = A
      ? A.buildQuickAffiliateLink(location.href, { trackingId: activeTag, asin: product.asin || '' })
      : null;

    r({
      version: '0.8.0',
      state,
      width: innerWidth,
      settings,
      logistics: snapshot,
      shippingRestriction: shippingSnapshot,
      siteStripe: siteStripeSnapshot,
      affiliate: {
        country,
        savedTag,
        activeTag,
        quickUrl: quickLink?.url || ''
      },
      product,
      originRedirect: extractOriginUrl(location.href)
    });
  }
});

addEventListener('resize', schedule);
document.addEventListener('change', schedule, true);
document.addEventListener('click', event => {
  if (settings.hideReviews && !reviewsRevealed && R) {
    const trigger = R.findReviewsTrigger(event.target, location.href);
    if (trigger) {
      reviewsRevealed = true;
      updateCustomCSS();
      renderReviewsBanner();
      const targetEl = R.resolveReviewsTarget(trigger, document, location.href);
      if (targetEl) {
        requestAnimationFrame(() => {
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
      }
    }
  }
  schedule();
  setTimeout(schedule, 700);
  setTimeout(schedule, 1600);
}, true);

setInterval(() => {
  if (!document.hidden) apply();
}, 2500);

})();
