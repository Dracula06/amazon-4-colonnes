(() => {
  'use strict';

  /**
   * Référentiel des pays Amazon explicitement supportés par l'extension
   * (aligné avec `manifest.json` et `src/library/marketplaces.js`).
   */
  const DEFINED_COUNTRIES = Object.freeze({
    'amazon.fr': Object.freeze({ host: 'amazon.fr', code: 'FR', flag: '🇫🇷', label: 'France', tld: '.fr' }),
    'amazon.co.uk': Object.freeze({ host: 'amazon.co.uk', code: 'UK', flag: '🇬🇧', label: 'Royaume-Uni', tld: '.co.uk' }),
    'amazon.de': Object.freeze({ host: 'amazon.de', code: 'DE', flag: '🇩🇪', label: 'Allemagne', tld: '.de' }),
    'amazon.es': Object.freeze({ host: 'amazon.es', code: 'ES', flag: '🇪🇸', label: 'Espagne', tld: '.es' }),
    'amazon.it': Object.freeze({ host: 'amazon.it', code: 'IT', flag: '🇮🇹', label: 'Italie', tld: '.it' })
  });

  const NOISE_QUERY_PARAMS = new Set([
    'ref', 'ref_', 'qid', 'sr', 'crid', 'sprefix', 'keywords',
    'linkCode', 'linkId', 'ascsubtag', 'camp', 'creative', 'creativeASIN',
    'ar_su', 'ar_srct', 'ar_mt', 'fbclid', 'gclid', 'dchild', 'rnid',
    's', 'sp_csd', 'content-id', 'dib', 'dib_tag', '__mk_fr_FR',
    '__mk_de_DE', '__mk_es_ES', '__mk_it_IT', '__mk_en_GB'
  ]);

  const VARIANT_PARAMS = Object.freeze(['th', 'psc', 'smid']);
  const PLACEHOLDER_MARK = '[RETIRE]';

  function cleanText(value) {
    return String(value || '').replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
  }

  /**
   * Normalise un nom d'hôte ou une URL vers le domaine Amazon sans `www.`.
   * @param {string} hostnameOrUrl
   * @returns {string}
   */
  function normalizeAmazonHost(hostnameOrUrl) {
    const raw = String(hostnameOrUrl || '').trim();
    if (!raw) return '';
    try {
      const parsed = raw.includes('://') ? new URL(raw) : new URL('https://' + raw);
      if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return '';
      return parsed.hostname.replace(/^www\./i, '').toLowerCase();
    } catch {
      return raw.replace(/^www\./i, '').toLowerCase();
    }
  }

  /**
   * Retourne les métadonnées du pays si l'hôte ou l'URL appartient aux 5 pays définis.
   * @param {string} hostnameOrUrl
   * @returns {{ host: string, code: string, flag: string, label: string, tld: string } | null}
   */
  function resolveDefinedCountry(hostnameOrUrl) {
    const host = normalizeAmazonHost(hostnameOrUrl);
    return Object.prototype.hasOwnProperty.call(DEFINED_COUNTRIES, host)
      ? DEFINED_COUNTRIES[host]
      : null;
  }

  /**
   * Extrait l'ASIN (10 caractères alphanumériques) depuis une URL ou un chemin Amazon.
   * @param {string} urlOrPath
   * @returns {string}
   */
  function extractAsin(urlOrPath) {
    const raw = String(urlOrPath || '');
    const match = raw.match(/\/(?:dp|gp\/product|gp\/aw\/d)\/([A-Z0-9]{10})(?:[/?#]|$)/i);
    return match ? match[1].toUpperCase() : '';
  }

  /**
   * Nettoie un identifiant de suivi Amazon Partenaires (tag) en excluant les marqueurs anonymisés.
   * @param {string|null|undefined} rawTag
   * @returns {string}
   */
  function cleanTrackingId(rawTag) {
    const cleaned = cleanText(rawTag);
    if (!cleaned || cleaned === PLACEHOLDER_MARK || cleaned.includes(PLACEHOLDER_MARK)) return '';
    if (!/^[A-Za-z0-9._-]{2,64}$/.test(cleaned)) return '';
    return cleaned;
  }

  function isElementHidden(el) {
    if (!el) return true;
    const cls = el.classList;
    if (cls && (cls.contains('aok-hidden') || cls.contains('amzn-ss-hidden-content'))) {
      return true;
    }
    if (typeof el.closest === 'function' && el.closest('.aok-hidden, .amzn-ss-hidden-content, [hidden]')) {
      return true;
    }
    return false;
  }

  function readDropdownValue(root, selectSelector) {
    if (!root || typeof root.querySelector !== 'function') return '';
    const select = root.querySelector(selectSelector);
    if (select) {
      const directVal = cleanTrackingId(select.value);
      if (directVal) return directVal;

      if (typeof select.querySelectorAll === 'function') {
        const options = [...select.querySelectorAll('option')];
        const selectedOpt = options.find(opt => opt.selected) || options[0];
        const optText = cleanTrackingId(selectedOpt?.value || selectedOpt?.textContent);
        if (optText) return optText;
      }

      const col = typeof select.closest === 'function' ? select.closest('.amzn-ss-store-tag-col') : null;
      const prompt = col?.querySelector?.('.a-dropdown-prompt');
      const promptVal = cleanTrackingId(prompt?.textContent);
      if (promptVal) return promptVal;
    }
    return '';
  }

  /**
   * Extrait les informations Amazon Partenaires (SiteStripe) présentes dans le DOM.
   * Limite : les sélecteurs reposent sur la structure `#nav-AssociateStripe` observée sur
   * les captures UK (`B0CM6K7FHQ`) et ES (`B07SLY4NMK`, `B0GS1TW9G5`) ; les variantes FR/DE/IT
   * restent à confirmer sur captures dédiées.
   * @param {Document|Element} doc
   * @returns {object}
   */
  function extractSiteStripeInfo(doc) {
    const empty = {
      present: false,
      homeUrl: '',
      category: '',
      commissionRate: '',
      storeId: '',
      trackingId: '',
      excludedProduct: false,
      alertVisible: false,
      canTriggerGetLink: false
    };

    if (!doc || typeof doc.querySelector !== 'function') return empty;
    const stripe = doc.querySelector('#nav-AssociateStripe, #amzn-ss-wrap');
    if (!stripe) return empty;

    const homeHref = stripe.querySelector('a.amzn-ss-link-home-page')?.getAttribute?.('href') || '';
    let homeUrl = '';
    try {
      const parsed = new URL(homeHref);
      if (parsed.protocol === 'https:') homeUrl = parsed.href;
    } catch {}

    const catEl = stripe.querySelector('#amzn-ss-category-content');
    const rateEl = stripe.querySelector('#amzn-ss-commission-rate-content');
    const category = catEl && !catEl.classList?.contains('aok-hidden') && !catEl.classList?.contains('amzn-ss-content-unavailable')
      ? cleanText(catEl.textContent)
      : '';
    const commissionRate = rateEl && !rateEl.classList?.contains('aok-hidden') && !rateEl.classList?.contains('amzn-ss-content-unavailable')
      ? cleanText(rateEl.textContent)
      : '';

    const storeId = readDropdownValue(doc, '#amzn-ss-store-id-dropdown-text');
    const trackingId = readDropdownValue(doc, '#amzn-ss-tracking-id-dropdown-text') || storeId;

    const thirdPartyMsg = doc.querySelector('.amzn-ss-popover-third-party-message');
    const excludedProduct = Boolean(
      thirdPartyMsg &&
      !thirdPartyMsg.classList?.contains('amzn-ss-hidden-content') &&
      !thirdPartyMsg.closest?.('.a-popover-preload')
    );

    const alertSlot = stripe.querySelector('#amzn-ss-asin-alert-slot');
    const alertVisible = Boolean(alertSlot && !isElementHidden(alertSlot));

    const canTriggerGetLink = Boolean(
      stripe.querySelector('#amzn-ss-get-link-button, #amzn-ss-text-link')
    );

    return {
      present: true,
      homeUrl,
      category,
      commissionRate,
      storeId,
      trackingId,
      excludedProduct,
      alertVisible,
      canTriggerGetLink
    };
  }

  /**
   * Construit un lien rapide affilié propre pour la page Amazon courante.
   * Limite : produit un lien complet canonique (`?tag=...`) sans appel réseau ;
   * la génération d'un lien court `amzn.to` dépend du service SiteStripe côté Amazon.
   * @param {string} rawUrl
   * @param {{ trackingId?: string, asin?: string, preserveVariantParams?: boolean }} [options]
   * @returns {object}
   */
  function buildQuickAffiliateLink(rawUrl, options = {}) {
    if (!rawUrl) {
      return { ok: false, error: 'URL absente', url: '', asin: '', trackingId: '', hasTag: false, isProductPage: false, country: null };
    }

    let parsed;
    try {
      parsed = new URL(rawUrl);
    } catch {
      return { ok: false, error: 'URL invalide', url: '', asin: '', trackingId: '', hasTag: false, isProductPage: false, country: null };
    }

    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      return { ok: false, error: 'Protocole non supporté', url: '', asin: '', trackingId: '', hasTag: false, isProductPage: false, country: null };
    }

    const country = resolveDefinedCountry(parsed.hostname);
    const trackingId = cleanTrackingId(options.trackingId);
    const asin = cleanText(options.asin).toUpperCase() || extractAsin(parsed.pathname);
    const preserveVariantParams = options.preserveVariantParams !== false;

    const cleanParams = new URLSearchParams();

    if (asin) {
      if (preserveVariantParams) {
        for (const key of VARIANT_PARAMS) {
          const val = parsed.searchParams.get(key);
          if (val) cleanParams.set(key, val);
        }
      }
      if (trackingId) cleanParams.set('tag', trackingId);
      const query = cleanParams.toString();
      const url = `https://www.${country ? country.host : parsed.hostname.replace(/^www\./i, '')}/dp/${asin}${query ? '?' + query : ''}`;
      return {
        ok: true,
        url,
        asin,
        trackingId,
        hasTag: Boolean(trackingId),
        isProductPage: true,
        country
      };
    }

    for (const [key, val] of parsed.searchParams.entries()) {
      if (NOISE_QUERY_PARAMS.has(key)) continue;
      if (key.startsWith('utm_') || key.startsWith('pd_rd_') || key.startsWith('pf_rd_')) continue;
      if (key === 'tag') continue;
      cleanParams.append(key, val);
    }
    if (trackingId) cleanParams.set('tag', trackingId);

    const cleanPath = parsed.pathname.replace(/\/ref=[^/?#]*/i, '') || '/';
    const query = cleanParams.toString();
    const host = country ? `www.${country.host}` : parsed.hostname;
    const url = `https://${host}${cleanPath}${query ? '?' + query : ''}`;

    return {
      ok: true,
      url,
      asin: '',
      trackingId,
      hasTag: Boolean(trackingId),
      isProductPage: false,
      country
    };
  }

  globalThis.ALAffiliate = Object.freeze({
    DEFINED_COUNTRIES,
    normalizeAmazonHost,
    resolveDefinedCountry,
    extractAsin,
    cleanTrackingId,
    extractSiteStripeInfo,
    buildQuickAffiliateLink
  });
})();
