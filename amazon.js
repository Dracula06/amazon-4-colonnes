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
  'amazon.it': { flag: '🇮🇹', name: 'Italie', code: 'IT' },
  'amazon.de': { flag: '🇩🇪', name: 'Allemagne', code: 'DE' },
  'amazon.es': { flag: '🇪🇸', name: 'Espagne', code: 'ES' },
  'amazon.co.uk': { flag: '🇬🇧', name: 'Royaume-Uni', code: 'UK' },
  'amazon.fr': { flag: '🇫🇷', name: 'France', code: 'FR' },
  'amazon.com': { flag: '🇺🇸', name: 'États-Unis', code: 'US' },
  'amazon.ca': { flag: '🇨🇦', name: 'Canada', code: 'CA' },
  'amazon.nl': { flag: '🇳🇱', name: 'Pays-Bas', code: 'NL' },
  'amazon.be': { flag: '🇧🇪', name: 'Belgique', code: 'BE' },
  'amazon.com.be': { flag: '🇧🇪', name: 'Belgique', code: 'BE' },
  'amazon.se': { flag: '🇸🇪', name: 'Suède', code: 'SE' },
  'amazon.pl': { flag: '🇵🇱', name: 'Pologne', code: 'PL' }
};

function extractOriginUrl(currentUrl) {
  if (!currentUrl) return null;
  try {
    const u = new URL(currentUrl);
    const keys = ['ar_su', 'redirectUrl', 'redirect_url', 'orig_url', 'originalUrl', 'ar_url', 'destination'];
    let raw = null;
    for (const k of keys) {
      const v = u.searchParams.get(k);
      if (v) {
        raw = v;
        break;
      }
    }
    if (!raw) return null;

    let decoded = raw.trim();
    try { decoded = decodeURIComponent(decoded); } catch {}

    if (/^\/\//.test(decoded)) {
      decoded = 'https:' + decoded;
    } else if (!/^https?:\/\//i.test(decoded)) {
      if (/^(www\.)?amazon\.[a-z.]+/i.test(decoded)) {
        decoded = 'https://' + decoded;
      }
    }

    const origin = new URL(decoded);
    const host = origin.hostname.replace(/^www\./, '').toLowerCase();
    const currentHost = u.hostname.replace(/^www\./, '').toLowerCase();

    if (!host.includes('amazon.') || host === currentHost) return null;

    const cleanParams = new URLSearchParams(origin.searchParams);
    for (const p of ['ar_su', 'ar_srct', 'ar_mt', 'redirectUrl', 'redirect_url', 'orig_url', 'originalUrl']) {
      cleanParams.delete(p);
    }

    cleanParams.set('creatorsDisableRedirect', 'true');

    for (const key of ['tag', 'linkCode', 'ascsubtag', 'th', 'psc', 'smid']) {
      if (!cleanParams.has(key) && u.searchParams.has(key)) {
        cleanParams.set(key, u.searchParams.get(key));
      }
    }

    const cleanPath = origin.pathname.replace(/\/+$/, '') || '/';
    const searchStr = cleanParams.toString();
    const cleanUrl = `${origin.origin}${cleanPath}${searchStr ? '?' + searchStr : ''}`;
    const info = COUNTRY_FLAGS[host] || { flag: '🌐', name: host, code: host.toUpperCase() };
    const asinMatch = (cleanPath + ' ' + u.pathname).match(/(?:dp|gp\/product|gp\/aw\/d|product)\/([A-Z0-9]{10})/i);

    return {
      host,
      rawUrl: decoded,
      cleanUrl,
      flag: info.flag,
      name: info.name,
      countryName: info.name,
      countryCode: info.code,
      tag: cleanParams.get('tag') || null,
      asin: asinMatch ? asinMatch[1] : null
    };
  } catch {
    return null;
  }
}

let originBannerDismissedUrl = '';
let isRedirectingOrigin = false;

function renderOriginBanner() {
  if (originBannerDismissedUrl === location.href) return;
  const origin = extractOriginUrl(location.href);
  const existing = document.getElementById('al-origin-banner');
  if (!origin) {
    existing?.remove();
    return;
  }

  let loopDetected = false;

  // Redirection automatique si activée par l'utilisateur
  if (settings.autoRedirectOrigin) {
    if (isRedirectingOrigin) return;

    const loopKey = 'al_loop_' + (origin.asin || origin.host);
    const last = sessionStorage.getItem(loopKey);
    const now = Date.now();

    if (last && (now - parseInt(last, 10)) < 8000) {
      loopDetected = true;
    } else {
      sessionStorage.setItem(loopKey, String(now));
      isRedirectingOrigin = true;
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

  if (existing) {
    if (existing.dataset.cleanUrl === origin.cleanUrl) return;
    existing.remove();
  }

  const banner = document.createElement('div');
  banner.id = 'al-origin-banner';
  banner.dataset.cleanUrl = origin.cleanUrl;

  const header = document.createElement('div');
  header.className = 'al-header';
  header.innerHTML = `<span>${loopDetected ? '⚠️ ' : ''}${origin.flag} Lien initial : Amazon ${origin.name}</span>`;

  const closeBtn = document.createElement('button');
  closeBtn.className = 'al-close';
  closeBtn.setAttribute('aria-label', 'Fermer');
  closeBtn.textContent = '✕';
  closeBtn.onclick = () => {
    originBannerDismissedUrl = location.href;
    banner.remove();
  };
  header.append(closeBtn);

  const textDesc = document.createElement('div');
  textDesc.style.fontSize = '12px';
  textDesc.style.color = '#475569';
  textDesc.textContent = loopDetected
    ? 'Redirection automatique suspendue pour éviter une boucle infinie. Fiche d’origine :'
    : 'Votre compte vous a redirigé vers ce site. Vous pouvez consulter la fiche d’origine :';

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
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(origin.cleanUrl);
      } else {
        const ta = document.createElement('textarea');
        ta.value = origin.cleanUrl;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand('copy');
        ta.remove();
      }
      copyBtn.textContent = '✅ Lien copié !';
      setTimeout(() => { copyBtn.textContent = '📋 Copier le lien d’origine'; }, 2000);
    } catch {
      prompt('Copiez ce lien :', origin.cleanUrl);
    }
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
  const priceData = extractProductPrice(snapshot) || {};
  const ean = window._lastDetectedKeepaEan || priceData.ean || extractProductEan(document) || null;
  return {
    title: text(titleEl),
    asin,
    price: priceData.price || null,
    condition: priceData.condition || null,
    discountRate: priceData.discountRate || null,
    referencePrice: priceData.referencePrice || null,
    newPrice: priceData.newPrice || null,
    formattedPrice: priceData.formattedPrice || priceData.price || null,
    ean,
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
    originRedirect: extractOriginUrl(location.href),
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
        const fresh = getCurrentProductSummary();
        const data = {
          asin: fresh.asin || product.asin || 'Inconnu',
          title: fresh.title || product.title || 'Produit sans titre',
          price: fresh.price || product.price || null,
          condition: fresh.condition || product.condition || null,
          discountRate: fresh.discountRate || product.discountRate || null,
          referencePrice: fresh.referencePrice || product.referencePrice || null,
          newPrice: fresh.newPrice || product.newPrice || null,
          formattedPrice: fresh.formattedPrice || product.formattedPrice || null,
          ean: fresh.ean || window._lastDetectedKeepaEan || product.ean || null,
          currencySymbol: fresh.currencySymbol || product.currencySymbol || '€',
          url: affiliateUrl || fresh.url || product.url,
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
    })) : null,
    onShareTelegram: isProductPage ? (affiliateUrl => new Promise(resolve => {
      try {
        const fresh = getCurrentProductSummary();
        const data = {
          asin: fresh.asin || product.asin || 'Inconnu',
          title: fresh.title || product.title || 'Produit sans titre',
          price: fresh.price || product.price || null,
          condition: fresh.condition || product.condition || null,
          discountRate: fresh.discountRate || product.discountRate || null,
          referencePrice: fresh.referencePrice || product.referencePrice || null,
          newPrice: fresh.newPrice || product.newPrice || null,
          formattedPrice: fresh.formattedPrice || product.formattedPrice || null,
          ean: fresh.ean || window._lastDetectedKeepaEan || product.ean || null,
          currencySymbol: fresh.currencySymbol || product.currencySymbol || '€',
          url: affiliateUrl || fresh.url || product.url,
          kind: snapshot.kind,
          code: snapshot.code,
          label: snapshot.label,
          seller: snapshot.seller,
          ship: snapshot.ship,
          shippingRestriction: shippingSnapshot?.blocked ? shippingSnapshot : null,
          marketplace: country ? country.code : 'FR'
        };
        chrome.runtime.sendMessage({ action: 'sendTelegram', data }, res => {
          resolve(res || { ok: false, error: 'Aucune réponse' });
        });
      } catch (err) {
        resolve({ ok: false, error: err?.message || 'Erreur Telegram' });
      }
    })) : null,
    onShareGitHub: () => new Promise(resolve => {
      try {
        chrome.runtime.sendMessage({ action: 'triggerQuickShare' }, res => {
          resolve(res || { ok: false, error: 'Aucune réponse' });
        });
      } catch (err) {
        resolve({ ok: false, error: err?.message || 'Erreur GitHub' });
      }
    }),
    onOpenCollector: () => {
      try {
        chrome.runtime.sendMessage({ action: 'openCollector' });
      } catch {}
    }
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

function parsePriceNumber(str) {
  if (typeof str === 'number') return Number.isFinite(str) ? str : null;
  if (!str) return null;
  const match = String(str).match(/[\d\s.,\u00a0\u202f]+/);
  if (!match) return null;
  let s = match[0].replace(/[\s\u00a0\u202f]/g, '');
  if (s.includes(',') && s.includes('.')) {
    if (s.lastIndexOf(',') > s.lastIndexOf('.')) {
      s = s.replace(/\./g, '').replace(',', '.');
    } else {
      s = s.replace(/,/g, '');
    }
  } else if (s.includes(',')) {
    s = s.replace(',', '.');
  }
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : null;
}

function normalizeDiscountRate(raw) {
  if (!raw) return null;
  const s = String(raw).replace(/&nbsp;/g, ' ').replace(/\u00a0/g, ' ').trim();
  const m = s.match(/-?\s*(\d+)\s*%/);
  if (m) return `-${m[1]}%`;
  const num = s.match(/\d+/);
  if (num) return `-${num[0]}%`;
  return null;
}

function computeDiscountRate(currentPrice, basePrice) {
  const pCur = parsePriceNumber(currentPrice);
  const pBase = parsePriceNumber(basePrice);
  if (pCur && pBase && pBase > pCur) {
    const pct = Math.round(((pBase - pCur) / pBase) * 100);
    return `-${pct}%`;
  }
  return null;
}

function cleanEan(raw) {
  if (!raw && raw !== 0) return null;
  const s = String(raw).replace(/[\s\u00a0\u202f-]/g, '').trim();
  const m = s.match(/\b(\d{8}|\d{12}|\d{13}|\d{14})\b/);
  return m ? m[1] : null;
}

function buildBarcodeLookupUrl(ean) {
  const valid = cleanEan(ean);
  return valid ? `https://www.barcodelookup.com/${valid}` : null;
}

function extractProductEan(rootDoc = (typeof document !== 'undefined' ? document : null)) {
  if (!rootDoc) return null;

  const rows = rootDoc.querySelectorAll?.(
    '#productDetails_techSpec_section_1 tr, #productDetails_techSpec_section_2 tr, #prodDetails tr, .prodDetTable tr, #technicalSpecifications_section_1 tr, .techD tr'
  ) || [];

  for (const tr of rows) {
    const th = tr.querySelector?.('th, .prodDetSectionEntry, td:first-child');
    const td = tr.querySelector?.('td, .prodDetAttrValue, td:last-child');
    const label = th?.textContent || '';
    if (/(?:EAN|GTIN|UPC|ISBN(?:-10|-13)?|Code[- ]barres?|Barcode)/i.test(label)) {
      const val = cleanEan(td?.textContent);
      if (val) return val;
    }
  }

  const bullets = rootDoc.querySelectorAll?.(
    '#detailBullets_feature_div li, [data-feature-name="detailBullets"] li, #detailBulletsWrapper_feature_div li'
  ) || [];

  for (const li of bullets) {
    const text = li.textContent || '';
    if (/(?:EAN|GTIN|UPC|ISBN(?:-10|-13)?|Code[- ]barres?|Barcode)/i.test(text)) {
      const m = text.match(/(?:EAN|GTIN|UPC|ISBN(?:-10|-13)?|Code[- ]barres?|Barcode)\s*[:·-]?\s*([\d\s-]{8,20})/i);
      if (m) {
        const val = cleanEan(m[1]);
        if (val) return val;
      }
    }
  }

  // 3. Éléments Keepa metadata (surimpression, widget ou extension Keepa dans le DOM)
  const keepaCodes = rootDoc.querySelectorAll?.('.productMeta__code, [data-copy], .productMeta__i > span');
  if (keepaCodes) {
    for (const el of keepaCodes) {
      const label = el.querySelector?.('.productMeta__label')?.textContent || el.textContent || '';
      if (/(?:EAN|GTIN|UPC|ISBN|Barcode|Code[- ]barres?)/i.test(label)) {
        const copyAttr = el.getAttribute?.('data-copy');
        const valAttr = el.querySelector?.('.productMeta__value')?.textContent;
        const val = cleanEan(copyAttr || valAttr || el.textContent);
        if (val) return val;
      }
    }
  }

  // 4. Conteneur Keepa injecté (si Keepa extension active)
  const keepaEl = rootDoc.querySelector?.('#keepaContainer, #keepaTable, .keepa-table, #keepaBox, #keepa');
  if (keepaEl) {
    const kText = keepaEl.textContent || '';
    const km = kText.match(/(?:EAN|GTIN|UPC|ISBN|Barcode|Code-barres)\s*[:·-]?\s*([\d\s-]{8,20})/i);
    if (km) {
      const val = cleanEan(km[1]);
      if (val) return val;
    }
  }

  // 5. Balises Script (JSON-LD ou state data)
  const scripts = rootDoc.querySelectorAll?.('script[type="application/ld+json"], script:not([src])') || [];
  for (const s of scripts) {
    const content = s.textContent || '';
    if (content.length > 50000) continue;
    if (/(?:gtin|ean|upc)/i.test(content)) {
      const jm = content.match(/"(?:gtin13|gtin14|gtin8|gtin|ean|upc)"\s*:\s*"([\d\s-]{8,20})"/i)
        || content.match(/(?:ean|gtin)\s*[:=]\s*["']([\d\s-]{8,20})["']/i);
      if (jm) {
        const val = cleanEan(jm[1]);
        if (val) return val;
      }
    }
  }

  return null;
}

function cleanReferencePrice(raw, valueFallback) {
  if (!raw && !valueFallback) return null;
  let s = String(raw || '').replace(/&nbsp;/g, ' ').replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();

  if (/^conseill[eé]\s+\d/i.test(s)) {
    return s.replace(/^conseill[eé]\s+/i, 'conseillé ').replace(/(\d)\s*([€$£¥])/g, '$1 $2');
  }
  if (/^r[eé]cent\s+\d/i.test(s)) {
    return s.replace(/^r[eé]cent\s+/i, 'récent ').replace(/(\d)\s*([€$£¥])/g, '$1 $2');
  }
  if (/^le\s+plus\s+bas\s+r[eé]cent\s+\d/i.test(s)) {
    return s.replace(/^le\s+plus\s+bas\s+r[eé]cent\s+/i, 'le plus bas récent ').replace(/(\d)\s*([€$£¥])/g, '$1 $2');
  }

  let priceMatch = s.match(/(\d[\d\s.,\u00a0\u202f]*\s*[€$£¥]|\b(?:EUR|GBP|USD)\s*[\d.,]+)/i);
  let priceVal = priceMatch ? priceMatch[0].trim() : (valueFallback ? String(valueFallback).trim() : '');
  priceVal = priceVal.replace(/(\d)\s*([€$£¥])/g, '$1 $2');

  if (!priceVal && s) {
    const num = s.match(/[\d.,]+/);
    if (num) priceVal = num[0].replace('.', ',') + ' €';
  }
  if (!priceVal) return null;

  let label = 'conseillé';
  if (/conseill[eé]|recommand|rrp|uvp|pvpr|recommended/i.test(s)) {
    label = 'conseillé';
  } else if (/plus\s+bas|30\s+derniers|lowest|was|statt|anterior/i.test(s)) {
    label = /plus\s+bas/i.test(s) ? 'le plus bas récent' : 'récent';
  } else if (/r[eé]cent/i.test(s)) {
    label = 'récent';
  } else if (/neuf|new/i.test(s)) {
    label = 'neuf';
  } else {
    const cleaned = s
      .replace(priceVal, '')
      .replace(/^(?:prix|prezzo|precio|price)\s*/i, '')
      .replace(/[:·-]\s*$/, '')
      .trim()
      .toLowerCase();
    if (cleaned) label = cleaned;
  }

  return `${label} ${priceVal}`.trim();
}

function cleanLogisticsLabel(label, ship) {
  if (!label) return 'Expéditeur non identifié';
  let s = String(label).trim();
  s = s.replace(/\s*·\s*(?:exp[ée]di[ée]\s+par|shipped\s+by|dispatched\s+by|versand\s+durch|enviado\s+por|spedito\s+da)\s+.*$/i, '').trim();
  return s || label;
}

function getDiscountDealInfo(discountRate) {
  if (!discountRate && discountRate !== 0) return null;
  const match = String(discountRate).match(/(\d+)/);
  if (!match) return null;
  const percentage = parseInt(match[1], 10);
  if (percentage <= 0) return null;

  const rateStr = `-${percentage}%`;

  if (percentage >= 71) {
    return {
      percentage,
      rateStr,
      badge: '🔴',
      flames: '🔥🔥🔥',
      color: '#dc2626',
      tier: 'high',
      formattedText: `${rateStr} 🔥🔥🔥`,
      formattedLineTelegram: `🔴 <b>Remise :</b> ${rateStr} 🔥🔥🔥`,
      formattedLineDiscord: `🔴 **Remise :** ${rateStr} 🔥🔥🔥`
    };
  } else if (percentage >= 51) {
    return {
      percentage,
      rateStr,
      badge: '🟠',
      flames: '🔥🔥',
      color: '#ea580c',
      tier: 'medium',
      formattedText: `${rateStr} 🔥🔥`,
      formattedLineTelegram: `🟠 <b>Remise :</b> ${rateStr} 🔥🔥`,
      formattedLineDiscord: `🟠 **Remise :** ${rateStr} 🔥🔥`
    };
  } else {
    return {
      percentage,
      rateStr,
      badge: '🟢',
      flames: '🔥',
      color: '#16a34a',
      tier: 'low',
      formattedText: `${rateStr} 🔥`,
      formattedLineTelegram: `🟢 <b>Remise :</b> ${rateStr} 🔥`,
      formattedLineDiscord: `🟢 **Remise :** ${rateStr} 🔥`
    };
  }
}

function getReferencePriceInfo({ referencePrice, newPrice, currencySymbol = '€' } = {}) {
  const sym = currencySymbol || '€';

  if (newPrice) {
    const cleanNew = String(newPrice).replace(/&nbsp;/g, ' ').replace(/\u00a0/g, ' ').trim().replace(/(\d)\s*([€$£¥])/g, '$1 $2');
    const newWithSym = /[€$£¥]|\b(?:EUR|GBP|USD)\b/i.test(cleanNew) ? cleanNew : `${cleanNew} ${sym}`;
    const value = `neuf ${newWithSym}`;
    const label = 'Prix d’origine';
    return {
      label,
      value,
      emoji: '🎯',
      formattedLineTelegram: `🎯 <b>${label} :</b> ${value}`,
      formattedLineDiscord: `🎯 **${label} :** ${value}`
    };
  }

  if (referencePrice) {
    const cleaned = cleanReferencePrice(referencePrice);
    if (!cleaned) return null;

    let label = 'Prix conseillé';
    let val = cleaned;

    if (/^conseill[eé]\s+/i.test(cleaned)) {
      label = 'Prix conseillé';
      val = cleaned.replace(/^conseill[eé]\s+/i, '');
    } else if (/^le\s+plus\s+bas\s+r[eé]cent\s+/i.test(cleaned)) {
      label = 'Prix le plus bas récent';
      val = cleaned.replace(/^le\s+plus\s+bas\s+r[eé]cent\s+/i, '');
    } else if (/^r[eé]cent\s+/i.test(cleaned)) {
      label = 'Prix récent';
      val = cleaned.replace(/^r[eé]cent\s+/i, '');
    } else if (/^neuf\s+/i.test(cleaned)) {
      label = 'Prix d’origine';
      val = `neuf ${cleaned.replace(/^neuf\s+/i, '')}`;
    } else {
      label = 'Prix de référence';
    }

    return {
      label,
      value: val,
      emoji: '🎯',
      formattedLineTelegram: `🎯 <b>${label} :</b> ${val}`,
      formattedLineDiscord: `🎯 **${label} :** ${val}`
    };
  }

  return null;
}

function formatEnrichedPrice({ price, condition, discountRate, referencePrice, newPrice, currencySymbol = '€' } = {}) {
  if (!price) return null;
  const rawPrice = String(price).trim();
  const hasSymbol = /[€$£¥]|\b(?:EUR|GBP|USD)\b/i.test(rawPrice);
  const sym = currencySymbol || '€';
  let baseFormatted = hasSymbol ? rawPrice : `${rawPrice} ${sym}`.trim();
  baseFormatted = baseFormatted.replace(/(\d)\s*([€$£¥])/g, '$1 $2');

  let existingParens = null;
  const pMatch = baseFormatted.match(/\s*\(([^)]+)\)$/);
  if (pMatch) {
    existingParens = pMatch[1];
    baseFormatted = baseFormatted.replace(/\s*\([^)]+\)$/, '').trim();
  }

  const parts = [];
  const cond = condition || (existingParens && /occasion|reconditionn|used|seconde/i.test(existingParens) ? existingParens : null);

  if (newPrice) {
    if (cond) parts.push(cond);
    let rate = normalizeDiscountRate(discountRate);
    if (!rate) {
      rate = computeDiscountRate(baseFormatted, newPrice);
    }
    const cleanNew = String(newPrice).replace(/&nbsp;/g, ' ').replace(/\u00a0/g, ' ').trim().replace(/(\d)\s*([€$£¥])/g, '$1 $2');
    const newWithSym = /[€$£¥]|\b(?:EUR|GBP|USD)\b/i.test(cleanNew) ? cleanNew : `${cleanNew} ${sym}`;
    if (rate) {
      parts.push(`${rate} vs neuf ${newWithSym}`);
    } else {
      parts.push(`vs neuf ${newWithSym}`);
    }
  } else {
    if (cond) parts.push(cond);
    const rate = normalizeDiscountRate(discountRate);
    if (rate) parts.push(rate);
    const ref = cleanReferencePrice(referencePrice);
    if (ref) parts.push(ref);
  }

  if (parts.length === 0 && existingParens) {
    parts.push(existingParens);
  }

  if (parts.length > 0) {
    return `${baseFormatted} (${parts.join(' · ')})`;
  }
  return baseFormatted;
}

const CONDITION_REGEX = /(?:(?:d['’]\s*occasion|occasion|segunda\s+mano|usato|gebraucht|used|reconditionn[eé]|reacondicionado|ricondizionato|renewed)\s*[-–:·]?\s*(?:comme\s+neuf|tr[eè]s\s+bon\s+[eé]tat|bon\s+[eé]tat|acceptable|like\s+new|very\s+good|good|wie\s+neu|sehr\s+gut|gut|akzeptabel|como\s+nuevo|muy\s+bueno|bueno|ottime\s+condizioni|buone\s+condizioni)?|(?:comme\s+neuf|tr[eè]s\s+bon\s+[eé]tat|bon\s+[eé]tat|like\s+new|very\s+good|wie\s+neu|sehr\s+gut|como\s+nuevo|muy\s+bueno|ottime\s+condizioni))/i;

function normalizeCondition(raw) {
  if (!raw) return null;
  let s = String(raw).trim();
  s = s.replace(/^(?:[ée]tat|condition|zustand|estado)\s*:\s*/i, '');
  s = s.replace(/\s*[-–:·]\s*/g, ' - ');
  s = s.replace(/^d['’]\s*occasion/i, 'Occasion');
  if (/^occasion\s*-\s*comme\s+neuf/i.test(s)) return 'Occasion - Comme neuf';
  if (/^occasion\s*-\s*tr[eè]s\s+bon\s+[eé]tat/i.test(s)) return 'Occasion - Très bon état';
  if (/^occasion\s*-\s*bon\s+[eé]tat/i.test(s)) return 'Occasion - Bon état';
  if (/^occasion\s*-\s*acceptable/i.test(s)) return 'Occasion - Acceptable';
  if (/^reconditionn[eé]\s*-\s*comme\s+neuf/i.test(s)) return 'Reconditionné - Comme neuf';
  if (/^reconditionn[eé]\s*-\s*tr[eè]s\s+bon\s+[eé]tat/i.test(s)) return 'Reconditionné - Très bon état';
  if (/^reconditionn[eé]\s*-\s*bon\s+[eé]tat/i.test(s)) return 'Reconditionné - Bon état';
  if (/^reconditionn[eé]\b/i.test(s)) return 'Reconditionné';
  if (/^comme\s+neuf/i.test(s)) return 'Occasion - Comme neuf';
  if (/^tr[eè]s\s+bon\s+[eé]tat/i.test(s)) return 'Occasion - Très bon état';
  if (/^bon\s+[eé]tat/i.test(s)) return 'Occasion - Bon état';
  if (/^acceptable/i.test(s)) return 'Occasion - Acceptable';
  return s;
}

function findConditionIn(root) {
  if (!root) return null;
  const candidates = root.querySelectorAll(
    '[data-hook="item-condition-badge"], #usedAccordionCaption_feature_div, [id*="AccordionCaption" i], ' +
    '#caption_feature_div, .accordion-caption, [id*="caption" i], #usedCondition, [id*="condition" i], [class*="condition" i], ' +
    '.a-text-bold, strong, b, h5, h4, h3, .accordion-row-title, .a-accordion-row-title, .a-expander-header'
  );
  for (const el of candidates) {
    const t = text(el);
    if (t) {
      const m = t.match(CONDITION_REGEX);
      if (m) return normalizeCondition(m[0]);
    }
  }
  return null;
}

function extractProductPrice(sellerSnapshot, rootDoc = (typeof document !== 'undefined' ? document : null)) {
  if (!rootDoc) return null;
  let foundPrice = null;
  let condition = null;
  let discountRate = null;
  let referencePrice = null;
  let newPrice = null;

  // 1. Chercher d'abord dans l'offre active du Buybox (accordéon moderne, radio ou swatch sélectionné)
  const activeRadio = rootDoc.querySelector(
    '#desktop_buybox input[type="radio"]:checked, #buybox input[type="radio"]:checked, ' +
    '#desktop_buybox [role="radio"][aria-checked="true"], #buybox [role="radio"][aria-checked="true"], ' +
    '#desktop_buybox button[aria-checked="true"], #buybox button[aria-checked="true"], ' +
    '#desktop_buybox .a-button-selected button, #buybox .a-button-selected button'
  );

  const activeAccordionHeader = rootDoc.querySelector(
    '#desktop_buybox .a-accordion-row[aria-expanded="true"], #desktop_buybox .accordion-header[aria-expanded="true"], ' +
    '#desktop_buybox [data-action="a-accordion"][aria-expanded="true"], ' +
    '#desktop_buybox .a-icon-radio-active, #buybox .a-icon-radio-active, ' +
    '#desktop_buybox .accordion-row-active, #desktop_buybox .a-accordion-active, #desktop_buybox [class*="selected" i], ' +
    '#buybox .accordion-row-active, #buybox .a-accordion-active'
  );

  const activeBox = (activeRadio?.closest?.(
    'li, .a-box, .a-accordion-row, .accordion-row, [data-csa-c-slot-id], [id*="AccordionRow" i], [id*="buyBox" i], [id*="Buybox" i], [data-csa-c-buying-option-type], #usedBuySection, #usedOnlyBuybox'
  )) || (activeAccordionHeader?.closest?.(
    'li, .a-accordion-row-container, .a-box, .a-accordion-row, .accordion-row, [data-csa-c-slot-id], [id*="AccordionRow" i], [id*="buyBox" i], [id*="Buybox" i]'
  )) || activeAccordionHeader;

  if (activeBox) {
    const pEl = activeBox.querySelector(
      '.priceToPay .a-offscreen, .apexPriceToPay .a-offscreen, #price_inside_buybox, #usedPrice, .offer-price, .a-price .a-offscreen, .a-color-price, .apex-pricetopay-value .a-offscreen, [data-csa-c-price-to-pay]'
    );
    if (pEl) {
      if (typeof pEl.getAttribute === 'function' && pEl.getAttribute('data-csa-c-price-to-pay')) {
        const val = pEl.getAttribute('data-csa-c-price-to-pay');
        if (val) foundPrice = val.replace('.', ',') + ' €';
      }
      if (!foundPrice) {
        const t = text(pEl);
        if (t) foundPrice = t.replace(/&nbsp;/g, ' ').replace(/\u00a0/g, ' ').trim();
      }
    }
    condition = findConditionIn(activeBox);
    if (!condition && activeBox.parentElement) {
      condition = findConditionIn(activeBox.parentElement);
    }
  }

  // 2. Si le vendeur détecté est Seconde main / Occasion / Reconditionné ou si UBB est actif
  const isSecondHand = (sellerSnapshot?.seller && /seconde\s+main|warehouse|reconditionn|used|occasion|retourenkauf|segunda\s+mano|seconda\s+mano/i.test(sellerSnapshot.seller))
    || Boolean(rootDoc.querySelector('#add-to-cart-button-ubb, #usedOnlyBuybox, #usedbuyBox, [data-csa-c-slot-id="usedAccordionRow"]'));

  if (isSecondHand) {
    if (!foundPrice) {
      const usedEl = rootDoc.querySelector(
        '#usedPrice, [data-csa-c-slot-id="usedAccordionRow"] .a-price .a-offscreen, #usedBuyBox .a-price .a-offscreen, #usedAccordionRow .a-price .a-offscreen, #usedBuySection .offer-price, [id*="used"] .a-price .a-offscreen, [id*="used"] .offer-price'
      );
      if (usedEl) {
        const t = text(usedEl);
        if (t) foundPrice = t.replace(/&nbsp;/g, ' ').replace(/\u00a0/g, ' ').trim();
      }
    }
    if (!condition) {
      const usedScope = rootDoc.querySelectorAll(
        '#usedAccordionRow, [data-csa-c-slot-id="usedAccordionRow"], #usedAccordionCaption_feature_div, #used_buybox_desktop, #usedBuySection, #usedbuyBox, #usedOnlyBuybox, #aod-offer-heading, #olpLinkWidget_feature_div'
      );
      for (const scope of usedScope) {
        condition = findConditionIn(scope);
        if (condition) break;
      }
    }
    if (!condition) {
      condition = findConditionIn(rootDoc.querySelector('#desktop_buybox, #buybox'));
    }
    if (!condition) {
      condition = /reconditionn|renewed/i.test(sellerSnapshot?.seller || '') ? 'Reconditionné' : 'Occasion';
    }

    // Cas 2 : Récupérer le prix de l'offre neuve
    const newEl = rootDoc.querySelector(
      '#newAccordionRow [data-csa-c-price-to-pay], [data-csa-c-slot-id*="newAccordionRow"] [data-csa-c-price-to-pay], ' +
      '[data-csa-c-buying-option-type="NEW"][data-csa-c-price-to-pay], ' +
      '#newAccordionRow .a-price .a-offscreen, [data-csa-c-slot-id*="newAccordionRow"] .a-price .a-offscreen, ' +
      '#corePriceDisplay_desktop_feature_div [data-csa-c-buying-option-type="NEW"][data-csa-c-price-to-pay], ' +
      '#corePrice_desktop [data-csa-c-buying-option-type="NEW"][data-csa-c-price-to-pay], ' +
      '#corePriceDisplay_desktop_feature_div [data-csa-c-price-to-pay]'
    );
    if (newEl) {
      if (typeof newEl.getAttribute === 'function' && newEl.getAttribute('data-csa-c-price-to-pay')) {
        const val = newEl.getAttribute('data-csa-c-price-to-pay');
        if (val) newPrice = val.replace('.', ',') + ' €';
      }
      if (!newPrice) {
        const t = text(newEl);
        if (t) newPrice = t.replace(/&nbsp;/g, ' ').replace(/\u00a0/g, ' ').trim();
      }
    }
    if (!newPrice) {
      const newOff = rootDoc.querySelector('#newAccordionRow .a-price .a-offscreen, [data-csa-c-slot-id*="newAccordionRow"] .a-price .a-offscreen');
      if (newOff) {
        const t = text(newOff);
        if (t) newPrice = t.replace(/&nbsp;/g, ' ').replace(/\u00a0/g, ' ').trim();
      }
    }
    if (foundPrice && newPrice) {
      discountRate = computeDiscountRate(foundPrice, newPrice);
    }
  }

  // 3. Repli sur le prix central à payer (priceToPay a priorité sur corePriceDisplay global)
  if (!foundPrice) {
    const el = rootDoc.querySelector(
      '.priceToPay .a-offscreen, .apexPriceToPay .a-offscreen, #price_inside_buybox, #usedBuySection .offer-price, #corePriceDisplay_desktop_feature_div .priceToPay .a-offscreen, #corePrice_desktop .priceToPay .a-offscreen, #corePriceDisplay_desktop_feature_div .a-offscreen, #corePrice_feature_div .a-offscreen'
    );
    if (el) {
      const t = text(el);
      if (t) foundPrice = t.replace(/&nbsp;/g, ' ').replace(/\u00a0/g, ' ').trim();
    }
  }

  // 4. Repli ultime sur entiers et fractions
  if (!foundPrice) {
    const whole = rootDoc.querySelector('.a-price-whole');
    const fraction = rootDoc.querySelector('.a-price-fraction');
    if (whole) {
      const w = text(whole).replace(/[.,]/g, '').trim();
      const f = fraction ? text(fraction).trim() : '00';
      foundPrice = `${w},${f}`;
    }
  }

  if (!foundPrice) return null;

  // Normaliser l'espacement du symbole monétaire (ex: "16,36€" -> "16,36 €")
  foundPrice = foundPrice.replace(/(\d)\s*([€$£¥])/g, '$1 $2');
  if (newPrice) newPrice = newPrice.replace(/(\d)\s*([€$£¥])/g, '$1 $2');

  // Cas 1 : Si ce n'est pas une offre d'occasion, extraire la réduction officielle et le prix de référence
  if (!isSecondHand) {
    const saveEl = rootDoc.querySelector('.savingsPercentage, .reinventPriceSavingsPercentageMargin');
    if (saveEl) {
      discountRate = normalizeDiscountRate(text(saveEl));
    }
    if (!discountRate) {
      const saveAttr = rootDoc.querySelector('[data-csa-c-savings-percentage]');
      if (saveAttr && typeof saveAttr.getAttribute === 'function') {
        discountRate = normalizeDiscountRate(saveAttr.getAttribute('data-csa-c-savings-percentage'));
      }
    }

    const basisOff = rootDoc.querySelector('.apex-basisprice-offscreen-label');
    if (basisOff) {
      referencePrice = cleanReferencePrice(text(basisOff));
    } else {
      const basisVal = rootDoc.querySelector('.apex-basisprice-value .a-offscreen, .apex-basisprice-value, .basisPrice .a-offscreen');
      const basisLbl = rootDoc.querySelector('.apex-basisprice-label, .basisPrice');
      if (basisVal) {
        referencePrice = cleanReferencePrice(basisLbl ? text(basisLbl) : null, text(basisVal));
      }
    }
    if (!referencePrice) {
      const strikeEl = rootDoc.querySelector('[data-csa-c-strike-through-price]');
      if (strikeEl && typeof strikeEl.getAttribute === 'function') {
        const sVal = strikeEl.getAttribute('data-csa-c-strike-through-price');
        if (sVal) referencePrice = cleanReferencePrice(sVal.replace('.', ',') + ' €');
      }
    }
  }

  const formattedPrice = formatEnrichedPrice({
    price: foundPrice,
    condition,
    discountRate,
    referencePrice,
    newPrice
  });

  const ean = extractProductEan(rootDoc);

  return {
    price: foundPrice,
    condition: condition || null,
    discountRate: discountRate || null,
    referencePrice: referencePrice || null,
    newPrice: newPrice || null,
    formattedPrice,
    ean: ean || null,
    toString() {
      return this.formattedPrice || this.price || '';
    }
  };
}

globalThis.ALPricing = {
  parsePriceNumber,
  normalizeDiscountRate,
  cleanReferencePrice,
  computeDiscountRate,
  formatEnrichedPrice,
  cleanLogisticsLabel,
  getDiscountDealInfo,
  getReferencePriceInfo,
  cleanEan,
  buildBarcodeLookupUrl,
  extractProductEan,
  extractProductPrice
};

// Écoute des mises à jour émises depuis la popup ou les options
chrome.runtime.onMessage.addListener((m, s, r) => {
  try {
    if (m.action === 'displaySettingsChanged') {
      const prevHideReviews = !!settings.hideReviews;
      settings = { ...settings, ...m.settings };
      if (!!settings.hideReviews !== prevHideReviews) {
        reviewsRevealed = false;
      }
      apply();
      r({ ok: true });
      return;
    }
    if (m.action === 'affiliateTagsChanged') {
      affiliateTags = { ...affiliateTags, ...(m.tags || {}) };
      apply();
      r({ ok: true });
      return;
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
        ? A.buildQuickAffiliateLink(location.href, { trackingId: activeTag, asin: product?.asin || '' })
        : null;

      r({
        version: '0.9.0',
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
      return;
    }
  } catch (err) {
    console.error('Erreur onMessage amazon.js :', err);
    try { r({ ok: false, error: err?.message || 'Erreur interne content script' }); } catch {}
  }
});

// Écoute de l'EAN détecté depuis l'iframe Keepa (surimpression ou widget)
window.addEventListener('message', event => {
  if (event?.data && event.data.type === 'KEEPA_DETECTED_EAN' && event.data.ean) {
    const detected = cleanEan(event.data.ean);
    if (detected && detected !== window._lastDetectedKeepaEan) {
      window._lastDetectedKeepaEan = detected;
      if (typeof renderFloatingQuickFrame === 'function') {
        renderFloatingQuickFrame();
      }
    }
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
