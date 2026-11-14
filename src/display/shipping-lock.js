(() => {
  'use strict';

  /**
   * Référentiel des marketplaces Amazon supportées pour expliquer le verrouillage géographique (« LOCK pays »).
   */
  const MARKETPLACE_COUNTRIES = Object.freeze({
    'amazon.fr': { tld: '.fr', label: 'France', code: 'FR' },
    'amazon.co.uk': { tld: '.co.uk', label: 'Royaume-Uni', code: 'UK' },
    'amazon.de': { tld: '.de', label: 'Allemagne', code: 'DE' },
    'amazon.es': { tld: '.es', label: 'Espagne', code: 'ES' },
    'amazon.it': { tld: '.it', label: 'Italie', code: 'IT' },
    'amazon.nl': { tld: '.nl', label: 'Pays-Bas', code: 'NL' },
    'amazon.be': { tld: '.be', label: 'Belgique', code: 'BE' },
    'amazon.se': { tld: '.se', label: 'Suède', code: 'SE' },
    'amazon.pl': { tld: '.pl', label: 'Pologne', code: 'PL' },
    'amazon.com': { tld: '.com', label: 'États-Unis', code: 'US' },
    'amazon.ca': { tld: '.ca', label: 'Canada', code: 'CA' }
  });

  /**
   * Motifs multilingues des messages Amazon indiquant un blocage de livraison vers l'adresse sélectionnée.
   * Limite : seul le message UK/EN (« This item cannot be shipped to your selected delivery location... »)
   * est prouvé sur une capture réelle versionnée (`UK/B0CM6K7FHQ`) ; les formulations FR/DE/ES/IT
   * reposent sur les variantes connues et restent à confirmer par captures dédiées.
   */
  const SHIPPING_RESTRICTION_PATTERNS = Object.freeze([
    /\bthis item cannot be shipped to your selected delivery location\b/i,
    /\bcannot be (?:shipped|dispatched|delivered) to your selected delivery (?:location|address)\b/i,
    /\bdoes not ship to your selected delivery (?:location|address)\b/i,
    /\bcet article ne peut pas [êe]tre (?:exp[ée]di[ée]|livr[ée]) [àa] l['’]adresse de livraison s[ée]lectionn[ée]e\b/i,
    /\bne peut pas [êe]tre (?:exp[ée]di[ée]|livr[ée]) (?:[àa]|vers) (?:votre|l['’])adresse (?:de livraison )?s[ée]lectionn[ée]e\b/i,
    /\bne peut pas [êe]tre (?:exp[ée]di[ée]|livr[ée]) [àa] cette adresse\b/i,
    /\bdieser artikel kann nicht an den ausgew[äa]hlten lieferort versendet werden\b/i,
    /\bkann nicht an (?:den|die) ausgew[äa]hlte[nr]? (?:lieferort|lieferadresse) (?:versendet|geliefert) werden\b/i,
    /\beste producto no se puede enviar a la direcci[óo]n de env[íi]o seleccionada\b/i,
    /\bno se puede enviar a la (?:direcci[óo]n|ubicaci[óo]n) de entrega seleccionada\b/i,
    /\bquesto articolo non pu[òo] essere spedito al luogo di consegna selezionato\b/i,
    /\bnon pu[òo] essere (?:spedito|consegnato) (?:al luogo|all['’]indirizzo) di consegna selezionato\b/i
  ]);

  const DELIVERY_CONTAINERS = Object.freeze([
    '#deliveryBlockMessage',
    '#usedDeliveryBlockContainer',
    '#mir-layout-DELIVERY_BLOCK',
    '#deliveryBlock_feature_div',
    '#desktop_buybox',
    '#usedOnlyBuybox',
    '#usedbuyBox',
    '#buybox'
  ]);

  const BUY_BUTTON_SELECTOR = '#add-to-cart-button, #add-to-cart-button-ubb, #buy-now-button';
  const POPOVER_CONTENT_SELECTOR = '.a-popover-content, [id^="a-popover-content-"]';
  const ERROR_CHILD_SELECTOR = '.a-color-error, .a-alert-content';

  function cleanText(value) {
    return String(value || '').replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
  }

  /**
   * Normalise un nom d'hôte ou une URL vers le domaine Amazon sans `www.`.
   * @param {string} hostnameOrUrl
   * @returns {string}
   */
  function normalizeHostname(hostnameOrUrl) {
    const raw = String(hostnameOrUrl || '').trim();
    if (!raw) return '';
    try {
      const parsed = raw.includes('://') ? new URL(raw) : new URL('https://' + raw);
      return parsed.hostname.replace(/^www\./i, '').toLowerCase();
    } catch {
      return raw.replace(/^www\./i, '').toLowerCase();
    }
  }

  /**
   * Résout les métadonnées pays d'un domaine Amazon.
   * @param {string} hostnameOrUrl
   * @returns {{ host: string, tld: string, label: string, code: string }}
   */
  function resolveMarketplaceInfo(hostnameOrUrl) {
    const host = normalizeHostname(hostnameOrUrl);
    const known = MARKETPLACE_COUNTRIES[host];
    if (known) return { host, ...known };
    const tld = host.startsWith('amazon.') ? host.slice('amazon'.length) : (host || '');
    return {
      host,
      tld,
      label: host || 'ce pays',
      code: tld.replace(/^\./, '').toUpperCase() || 'PAYS'
    };
  }

  /**
   * Vérifie si un texte correspond à une erreur Amazon de livraison impossible vers l'adresse choisie.
   * @param {string} rawText
   * @returns {{ matched: boolean, message: string }}
   */
  function matchesShippingRestriction(rawText) {
    const text = cleanText(rawText);
    if (!text) return { matched: false, message: '' };
    const matched = SHIPPING_RESTRICTION_PATTERNS.some(re => re.test(text));
    if (!matched) return { matched: false, message: '' };
    const message = text.length > 220 ? text.slice(0, 217) + '...' : text;
    return { matched: true, message };
  }

  /**
   * Construit l'explication « LOCK pays » adaptée au site Amazon consulté.
   * @param {string} hostnameOrUrl
   * @param {string} [detectedMessage]
   * @returns {object}
   */
  function buildCountryLockExplanation(hostnameOrUrl, detectedMessage = '') {
    const info = resolveMarketplaceInfo(hostnameOrUrl);
    const tldLabel = info.tld || info.host || 'ce site';
    const explanation = info.code === 'FR'
      ? `Livraison impossible vers l’adresse sélectionnée : offre verrouillée sur Amazon ${info.label} (${tldLabel}), impossible de commander vers l’adresse choisie.`
      : `Livraison impossible vers l’adresse sélectionnée : offre verrouillée sur Amazon ${info.label} (${tldLabel}), impossible de commander sur une adresse FR / hors ${info.label}.`;

    return {
      blocked: true,
      code: 'LOCK PAYS',
      marketplaceTld: tldLabel,
      countryLabel: info.label,
      countryCode: info.code,
      title: `LOCK pays (${tldLabel})`,
      explanation,
      detectedMessage: cleanText(detectedMessage)
    };
  }

  function defaultIsVisible(el) {
    if (!el) return false;
    if (typeof el.closest === 'function' && el.closest('.a-popover-preload, [hidden], .aok-hidden, [aria-hidden="true"]')) {
      return false;
    }
    for (let cur = el; cur; cur = cur.parentElement) {
      if (cur.style && cur.style.display === 'none') return false;
      if (cur.style && cur.style.visibility === 'hidden') return false;
    }
    return true;
  }

  function findMatchingTextInElement(el) {
    if (!el) return null;
    if (typeof el.querySelectorAll === 'function') {
      for (const child of el.querySelectorAll(ERROR_CHILD_SELECTOR)) {
        const res = matchesShippingRestriction(child.textContent);
        if (res.matched) return res.message;
      }
    }
    const selfRes = matchesShippingRestriction(el.textContent);
    return selfRes.matched ? selfRes.message : null;
  }

  function notBlockedResult() {
    return {
      blocked: false,
      code: '',
      marketplaceTld: '',
      countryLabel: '',
      countryCode: '',
      title: '',
      explanation: '',
      detectedMessage: '',
      source: ''
    };
  }

  /**
   * Détecte si la fiche produit courante indique que l'article ne peut pas être expédié
   * vers l'adresse de livraison sélectionnée (« LOCK pays »).
   *
   * Limites documentées :
   * - Repose sur les messages textuels connus d'Amazon dans la zone livraison / buybox ou ses popovers.
   * - Une pop-in fermée (`display: none`) n'est retenue en repli que si aucun bouton d'achat/panier
   *   n'est visible, afin d'éviter un faux positif après changement de variante vers une offre livrable.
   *
   * @param {Document|Element} doc
   * @param {{ hostname?: string, url?: string, isVisible?: (el: Element) => boolean }} [options]
   * @returns {object}
   */
  function detectShippingRestriction(doc, options = {}) {
    if (!doc || typeof doc.querySelectorAll !== 'function') {
      return notBlockedResult();
    }

    const hostRef = options.hostname || options.url || doc.location?.hostname || '';
    const isVisible = typeof options.isVisible === 'function' ? options.isVisible : defaultIsVisible;

    // 1. Vérifier d'abord les zones de livraison et la boîte d'achat visibles
    for (const selector of DELIVERY_CONTAINERS) {
      for (const container of doc.querySelectorAll(selector)) {
        if (!isVisible(container)) continue;
        const matchedMsg = findMatchingTextInElement(container);
        if (matchedMsg) {
          return {
            ...buildCountryLockExplanation(hostRef, matchedMsg),
            source: `Message visible (${selector})`
          };
        }
      }
    }

    // 2. Vérifier les popovers d'erreur visibles (ex. #a-popover-content-2)
    const popovers = [...doc.querySelectorAll(POPOVER_CONTENT_SELECTOR)];
    for (const pop of popovers) {
      if (!isVisible(pop)) continue;
      const matchedMsg = findMatchingTextInElement(pop);
      if (matchedMsg) {
        return {
          ...buildCountryLockExplanation(hostRef, matchedMsg),
          source: 'Popover d’erreur livraison visible'
        };
      }
    }

    // 3. Repli pour popover fermé/préchargé si aucun bouton d'achat visible n'est présent
    // (ex. capture UK/B0CM6K7FHQ où #deliveryBlockMessage est anonymisé et .a-button-stack vide)
    const hasVisibleBuyButton = [...doc.querySelectorAll(BUY_BUTTON_SELECTOR)].some(isVisible);
    if (!hasVisibleBuyButton) {
      for (const pop of popovers) {
        if (typeof pop.closest === 'function' && pop.closest('.a-popover-preload')) continue;
        const matchedMsg = findMatchingTextInElement(pop);
        if (matchedMsg) {
          return {
            ...buildCountryLockExplanation(hostRef, matchedMsg),
            source: 'Popover livraison bloqué (sans bouton d’achat)'
          };
        }
      }
    }

    return notBlockedResult();
  }

  globalThis.ALShippingLock = Object.freeze({
    MARKETPLACE_COUNTRIES,
    SHIPPING_RESTRICTION_PATTERNS,
    normalizeHostname,
    resolveMarketplaceInfo,
    matchesShippingRestriction,
    buildCountryLockExplanation,
    detectShippingRestriction
  });
})();
