import test from 'node:test';
import assert from 'node:assert/strict';
import { BLOCKS_REGISTRY, DEFAULT_DISPLAY_SETTINGS, generateDisplayCSS } from '../src/display/components-registry.js';

test('BLOCKS_REGISTRY contient les catégories principales avec sélecteurs valides', () => {
  assert.ok(BLOCKS_REGISTRY.ads);
  assert.ok(Array.isArray(BLOCKS_REGISTRY.ads.selectors));
  assert.ok(BLOCKS_REGISTRY.ads.selectors.includes('#sp_detail'));

  assert.ok(BLOCKS_REGISTRY.recommendations);
  assert.ok(BLOCKS_REGISTRY.recommendations.selectors.includes('#sims-consolidated-2_feature_div'));

  assert.ok(BLOCKS_REGISTRY.reviews);
  assert.ok(BLOCKS_REGISTRY.reviews.selectors.includes('#customerReviews'));
});

test('generateDisplayCSS génère le CSS selon les options', () => {
  const cssDefault = generateDisplayCSS(DEFAULT_DISPLAY_SETTINGS);
  assert.ok(cssDefault.includes('#sp_detail'));
  assert.ok(cssDefault.includes('display: none !important;'));
  assert.ok(!cssDefault.includes('#customerReviews'));

  const cssWithReviews = generateDisplayCSS({ hideReviews: true });
  assert.ok(cssWithReviews.includes('#customerReviews'));

  const cssReviewsRevealed = generateDisplayCSS({ hideReviews: true }, { reviewsRevealed: true });
  assert.ok(!cssReviewsRevealed.includes('#customerReviews'));

  const cssNoHide = generateDisplayCSS({ hideAds: false, hideRecommendations: false, hideReviews: false });
  assert.equal(cssNoHide.trim(), '');
});
