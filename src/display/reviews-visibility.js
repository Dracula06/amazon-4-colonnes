(() => {
  'use strict';

  /**
   * Sélecteurs CSS des sections d'avis clients et questions masquées par défaut
   * lorsque l'option `hideReviews` est active.
   */
  const REVIEWS_BLOCK_SELECTORS = Object.freeze([
    '#customerReviews',
    '#reviews-medley-footer',
    '#ask_feature_div'
  ]);

  /**
   * Identifiants cibles connus des sections d'avis sur les fiches Amazon.
   */
  const REVIEWS_TARGET_IDS = Object.freeze([
    'averageCustomerReviewsAnchor',
    'customerReviews',
    'customer-reviews_feature_div',
    'customerReviews_feature_div',
    'reviewsMedley',
    'reviews-medley-footer'
  ]);

  const REVIEWS_TARGET_HASHES = new Set(REVIEWS_TARGET_IDS.map(id => '#' + id));

  /**
   * Sélecteurs des liens / boutons déclenchant l'affichage des avis.
   * Limite : `#acrPopover` (ouverture du mini-popover d'étoiles) n'est pas inclus
   * directement afin de préserver l'ouverture du popover sans saut de page ;
   * le lien « Voir les avis » (`#acrPopoverLink`) à l'intérieur du popover est couvert.
   */
  const REVIEWS_TRIGGER_SELECTOR = [
    '#acrCustomerReviewLink',
    '#acrPopoverLink',
    '#nav-assist-skip-to-reviews',
    '.btfSubNavDesktopCustomerReviewsTab',
    '#pqv-reviews',
    'a[href*="#averageCustomerReviewsAnchor"]',
    'a[href*="#customerReviews"]',
    'a[href*="#customer-reviews_feature_div"]',
    'a[href*="#customerReviews_feature_div"]',
    'a[href*="#reviewsMedley"]',
    '[data-target="#customerReviews"]',
    '[data-target="#customer-reviews_feature_div"]'
  ].join(', ');

  const EXPLICIT_TRIGGER_SELECTOR = [
    '#acrCustomerReviewLink',
    '#acrPopoverLink',
    '#nav-assist-skip-to-reviews',
    '.btfSubNavDesktopCustomerReviewsTab',
    '#pqv-reviews'
  ].join(', ');

  /**
   * Extrait le hash d'un lien ou sélecteur cible (`#id`) en tenant compte des URL absolues.
   * @param {string|null|undefined} rawRef
   * @param {string} baseUrl
   * @returns {string}
   */
  function extractTargetHash(rawRef, baseUrl) {
    if (!rawRef) return '';
    const trimmed = String(rawRef).trim();
    if (trimmed.startsWith('#')) return trimmed;
    try {
      const parsed = new URL(trimmed, baseUrl || 'https://www.amazon.fr/');
      if (baseUrl) {
        const base = new URL(baseUrl);
        if (parsed.origin !== base.origin) return '';
      }
      return parsed.hash || '';
    } catch {
      return '';
    }
  }

  /**
   * Détermine si l'élément cliqué correspond à un déclencheur d'accès aux avis clients.
   * Limite : repose sur les sélecteurs et ancres observés sur les marketplaces EU ;
   * un lien externe vers `/product-reviews/` sans ancre interne navigue déjà hors fiche.
   * @param {Element|Node|null} eventTarget
   * @param {string} [baseUrl]
   * @returns {Element|null}
   */
  function findReviewsTrigger(eventTarget, baseUrl = 'https://www.amazon.fr/') {
    if (!eventTarget) return null;
    const element = typeof eventTarget.closest === 'function'
      ? eventTarget
      : eventTarget.parentElement;
    if (!element || typeof element.closest !== 'function') return null;

    const trigger = element.closest(REVIEWS_TRIGGER_SELECTOR);
    if (!trigger) return null;

    if (typeof trigger.matches === 'function' && trigger.matches(EXPLICIT_TRIGGER_SELECTOR)) {
      return trigger;
    }

    const dataTarget = trigger.getAttribute?.('data-target') || '';
    if (REVIEWS_TARGET_HASHES.has(dataTarget)) return trigger;

    const hrefHash = extractTargetHash(trigger.getAttribute?.('href'), baseUrl);
    if (REVIEWS_TARGET_HASHES.has(hrefHash)) return trigger;

    return null;
  }

  /**
   * Résout l'élément DOM vers lequel faire défiler la page lorsque les avis sont révélés.
   * @param {Element|null} trigger
   * @param {Document} doc
   * @param {string} [baseUrl]
   * @returns {Element|null}
   */
  function resolveReviewsTarget(trigger, doc, baseUrl = 'https://www.amazon.fr/') {
    if (!doc || typeof doc.getElementById !== 'function') return null;

    const candidateHashes = [];
    if (trigger && typeof trigger.getAttribute === 'function') {
      const hrefHash = extractTargetHash(trigger.getAttribute('href'), baseUrl);
      if (REVIEWS_TARGET_HASHES.has(hrefHash)) candidateHashes.push(hrefHash.slice(1));
      const dataTarget = trigger.getAttribute('data-target') || '';
      if (REVIEWS_TARGET_HASHES.has(dataTarget)) candidateHashes.push(dataTarget.slice(1));
    }

    for (const id of [...candidateHashes, ...REVIEWS_TARGET_IDS]) {
      const el = doc.getElementById(id);
      if (el) return el;
    }
    return null;
  }

  /**
   * Indique si les blocs d'avis doivent être masqués selon les préférences et l'état courant.
   * @param {{ hideReviews?: boolean }} [settings]
   * @param {{ reviewsRevealed?: boolean }} [state]
   * @returns {boolean}
   */
  function shouldHideReviews(settings = {}, state = {}) {
    return Boolean(settings?.hideReviews && !state?.reviewsRevealed);
  }

  /**
   * Extrait l'ASIN courant depuis un chemin URL Amazon (`/dp/ASIN` ou `/gp/product/ASIN`).
   * @param {string} pathname
   * @returns {string}
   */
  function extractAsinFromPath(pathname) {
    return String(pathname || '').match(/\/(?:dp|gp\/product)\/([A-Z0-9]{10})/i)?.[1] || '';
  }

  globalThis.ALReviews = Object.freeze({
    REVIEWS_BLOCK_SELECTORS,
    REVIEWS_TARGET_IDS,
    REVIEWS_TRIGGER_SELECTOR,
    findReviewsTrigger,
    resolveReviewsTarget,
    shouldHideReviews,
    extractAsinFromPath
  });
})();
