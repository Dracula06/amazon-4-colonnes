/**
 * Registre déclaratif des composants et blocs de pages Amazon.
 * Permet de cibler précisément les éléments à afficher, masquer ou réagencer.
 */

export const BLOCKS_REGISTRY = Object.freeze({
  ads: {
    id: 'ads',
    label: 'Publicités & Produits sponsorisés',
    description: 'Bannières publicitaires, produits sponsorisés et liens commerciaux intégrés.',
    defaultHidden: true,
    selectors: [
      '#sp_detail',
      '#sp_detail2',
      '#sp_detail_themis',
      '#ape_Detail_hero-quick-promo',
      '#ape_Detail_main-bottom-placement',
      '.ape-placement',
      '[id^="ape_"]',
      '[data-component-type="sp-sponsored-result"]',
      '.sp-desktop-dp-sims',
      '#sponsoredProducts2_feature_div',
      '#amsDetailSkyFeature',
      '#dp-ads-center-promo_feature_div',
      '.ad-feedback-text',
      '.s-sponsored-label-info-icon'
    ]
  },
  recommendations: {
    id: 'recommendations',
    label: 'Carrousels de recommandations',
    description: 'Sections « Les clients ont aussi acheté », comparaisons et suggestions de navigation.',
    defaultHidden: false,
    selectors: [
      '#sims-consolidated-1_feature_div',
      '#sims-consolidated-2_feature_div',
      '#desktop-dp-sims_feature_div',
      '#desktop-dp-sims-secondary_feature_div',
      '[data-feature-name="desktop-dp-sims"]',
      '[data-feature-name="desktop-dp-sims-secondary"]',
      '#similarities_feature_div',
      '#bundleV2_feature_div',
      '#rhf'
    ]
  },
  reviews: {
    id: 'reviews',
    label: 'Section avis clients',
    description: 'Bloc des commentaires, évaluations étoilées détaillées et médias clients.',
    defaultHidden: false,
    selectors: [
      '#customerReviews',
      '#reviews-medley-footer',
      '#ask_feature_div'
    ]
  }
});

export const DEFAULT_DISPLAY_SETTINGS = Object.freeze({
  fourColumns: true,
  minWidth: 1200,
  hideAds: true,
  hideRecommendations: false,
  hideReviews: false,
  autoRedirectOrigin: false,
  showQuickFrame: true,
  quickFramePos: null
});

/**
 * Génère les règles CSS correspondant aux préférences d'affichage.
 * Limite : lorsque `reviewsRevealed` vaut true, les sélecteurs d'avis ne sont
 * pas masqués afin de permettre l'affichage à la demande après clic sur un lien d'avis.
 * @param {typeof DEFAULT_DISPLAY_SETTINGS} settings
 * @param {{ reviewsRevealed?: boolean }} [options]
 * @returns {string} Règles CSS à injecter
 */
export function generateDisplayCSS(settings = {}, options = {}) {
  const merged = { ...DEFAULT_DISPLAY_SETTINGS, ...settings };
  const { reviewsRevealed = false } = options;
  const rules = [];

  if (merged.hideAds) {
    rules.push(`${BLOCKS_REGISTRY.ads.selectors.join(',\n')} {\n  display: none !important;\n}`);
  }

  if (merged.hideRecommendations) {
    rules.push(`${BLOCKS_REGISTRY.recommendations.selectors.join(',\n')} {\n  display: none !important;\n}`);
  }

  if (merged.hideReviews && !reviewsRevealed) {
    rules.push(`${BLOCKS_REGISTRY.reviews.selectors.join(',\n')} {\n  display: none !important;\n}`);
  }

  return rules.join('\n\n');
}
