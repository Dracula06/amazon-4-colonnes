import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const code = readFileSync(new URL('../src/display/reviews-visibility.js', import.meta.url), 'utf8');
new Function('globalThis', code)(globalThis);

const { ALReviews } = globalThis;

function makeMockElement({ id = '', classes = [], attrs = {}, tagName = 'DIV', parent = null } = {}) {
  const classSet = new Set(classes);
  const el = {
    id,
    tagName: tagName.toUpperCase(),
    parentElement: parent,
    getAttribute(name) {
      if (name === 'id') return id || null;
      if (name === 'class') return [...classSet].join(' ') || null;
      return Object.prototype.hasOwnProperty.call(attrs, name) ? attrs[name] : null;
    },
    matches(selector) {
      return selector.split(',').map(s => s.trim()).some(part => {
        if (part.startsWith('#')) return id === part.slice(1);
        if (part.startsWith('.')) return classSet.has(part.slice(1));
        const hrefMatch = part.match(/^a\[href\*="([^"]+)"\]$/);
        if (hrefMatch) {
          return el.tagName === 'A' && String(attrs.href || '').includes(hrefMatch[1]);
        }
        const dataMatch = part.match(/^\[data-target="([^"]+)"\]$/);
        if (dataMatch) {
          return attrs['data-target'] === dataMatch[1];
        }
        return false;
      });
    },
    closest(selector) {
      for (let cur = el; cur; cur = cur.parentElement) {
        if (cur.matches(selector)) return cur;
      }
      return null;
    }
  };
  return el;
}

test('shouldHideReviews masque uniquement si hideReviews=true et non révélé', () => {
  assert.equal(ALReviews.shouldHideReviews({ hideReviews: false }, { reviewsRevealed: false }), false);
  assert.equal(ALReviews.shouldHideReviews({ hideReviews: true }, { reviewsRevealed: false }), true);
  assert.equal(ALReviews.shouldHideReviews({ hideReviews: true }, { reviewsRevealed: true }), false);
});

test('findReviewsTrigger détecte le clic sur le compteur d avis à côté de l article', () => {
  const link = makeMockElement({
    id: 'acrCustomerReviewLink',
    tagName: 'a',
    classes: ['a-link-normal'],
    attrs: { href: '#averageCustomerReviewsAnchor' }
  });
  const countSpan = makeMockElement({
    id: 'acrCustomerReviewText',
    tagName: 'span',
    parent: link
  });
  const textNode = { parentElement: countSpan };

  assert.equal(ALReviews.findReviewsTrigger(countSpan, 'https://www.amazon.fr/dp/B0GCN57MGK'), link);
  assert.equal(ALReviews.findReviewsTrigger(textNode, 'https://www.amazon.fr/dp/B0GCN57MGK'), link);
});

test('findReviewsTrigger détecte les liens popover, PQV et sous-navigation sans capturer les étoiles popover ni les autres liens', () => {
  const popoverLink = makeMockElement({
    id: 'acrPopoverLink',
    tagName: 'a',
    attrs: { href: '#customerReviews' }
  });
  assert.equal(ALReviews.findReviewsTrigger(popoverLink), popoverLink);

  const pqvLink = makeMockElement({
    id: 'pqv-reviews',
    tagName: 'a',
    attrs: { href: 'https://www.amazon.fr/dp/B0GCN57MGK/', 'data-target': '#customer-reviews_feature_div' }
  });
  assert.equal(ALReviews.findReviewsTrigger(pqvLink), pqvLink);

  const subNavTab = makeMockElement({
    tagName: 'a',
    classes: ['a-link-normal', 'btfSubNavDesktopCustomerReviewsTab'],
    attrs: { href: '#' }
  });
  assert.equal(ALReviews.findReviewsTrigger(subNavTab), subNavTab);

  const starsTrigger = makeMockElement({
    tagName: 'a',
    classes: ['a-popover-trigger'],
    attrs: { href: 'javascript:void(0)', role: 'button' }
  });
  assert.equal(ALReviews.findReviewsTrigger(starsTrigger), null);

  const bylineLink = makeMockElement({
    id: 'bylineInfo',
    tagName: 'a',
    attrs: { href: 'https://www.amazon.fr/stores/Vexilar' }
  });
  assert.equal(ALReviews.findReviewsTrigger(bylineLink), null);

  const externalFakeLink = makeMockElement({
    tagName: 'a',
    attrs: { href: 'https://evil.example/#customerReviews' }
  });
  assert.equal(ALReviews.findReviewsTrigger(externalFakeLink, 'https://www.amazon.fr/dp/B0GCN57MGK'), null);
});

test('resolveReviewsTarget résout l ancre cible avec repli sur #customerReviews', () => {
  const anchorEl = { id: 'averageCustomerReviewsAnchor' };
  const reviewsEl = { id: 'customerReviews' };
  const docWithAnchor = {
    getElementById(id) {
      if (id === 'averageCustomerReviewsAnchor') return anchorEl;
      if (id === 'customerReviews') return reviewsEl;
      return null;
    }
  };
  const docWithoutAnchor = {
    getElementById(id) {
      return id === 'customerReviews' ? reviewsEl : null;
    }
  };

  const trigger = makeMockElement({
    id: 'acrCustomerReviewLink',
    tagName: 'a',
    attrs: { href: '#averageCustomerReviewsAnchor' }
  });

  assert.equal(ALReviews.resolveReviewsTarget(trigger, docWithAnchor), anchorEl);
  assert.equal(ALReviews.resolveReviewsTarget(trigger, docWithoutAnchor), reviewsEl);
});

test('extractAsinFromPath extrait l ASIN sans faux positif', () => {
  assert.equal(ALReviews.extractAsinFromPath('/Vexilar-Aspirateur/dp/B0GCN57MGK/ref=sr_1_1'), 'B0GCN57MGK');
  assert.equal(ALReviews.extractAsinFromPath('/gp/product/B0DW4FVCCL'), 'B0DW4FVCCL');
  assert.equal(ALReviews.extractAsinFromPath('/s?k=aspirateur'), '');
});

test('Fixture réelle FR B0GCN57MGK : présence des liens et ancres avis compatibles', () => {
  const captureDir = fileURLToPath(new URL('../bibliotheque-pages/FR/B0GCN57MGK/2026-11-10T14-03-04-032Z-6c9c2041-d5ac-474a-9240-75c0efcd36c1', import.meta.url));
  const parts = readdirSync(captureDir).filter(f => f.startsWith('part-')).sort();
  assert.ok(parts.length > 0, 'Les fragments de la fixture B0GCN57MGK doivent exister');

  const rawJson = parts
    .map(file => {
      const parsedPart = JSON.parse(readFileSync(join(captureDir, file), 'utf8'));
      return parsedPart.chunk || parsedPart.content || parsedPart.data || '';
    })
    .join('');
  const payload = JSON.parse(rawJson);
  const html = payload.html || '';

  const acrMatch = html.match(/<a[^>]*id="acrCustomerReviewLink"[^>]*href="([^"]+)"[^>]*>/i);
  assert.ok(acrMatch, '#acrCustomerReviewLink doit être présent dans B0GCN57MGK');
  assert.equal(acrMatch[1], '#averageCustomerReviewsAnchor');

  assert.ok(html.includes('id="averageCustomerReviewsAnchor"'), '#averageCustomerReviewsAnchor doit exister dans B0GCN57MGK');
  assert.ok(html.includes('id="customerReviews"'), '#customerReviews doit exister dans B0GCN57MGK');

  const trigger = makeMockElement({
    id: 'acrCustomerReviewLink',
    tagName: 'a',
    attrs: { href: acrMatch[1] }
  });
  assert.equal(ALReviews.findReviewsTrigger(trigger, 'https://www.amazon.fr/dp/B0GCN57MGK'), trigger);
});
