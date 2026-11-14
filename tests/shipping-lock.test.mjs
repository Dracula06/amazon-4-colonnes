import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const code = readFileSync(new URL('../src/display/shipping-lock.js', import.meta.url), 'utf8');
new Function('globalThis', code)(globalThis);

const { ALShippingLock } = globalThis;

function makeNode({
  id = '',
  classes = [],
  textContent = '',
  style = {},
  attrs = {},
  children = [],
  parentElement = null
} = {}) {
  const classSet = new Set(classes);
  const node = {
    id,
    textContent,
    style,
    parentElement,
    children,
    getAttribute(name) {
      return Object.prototype.hasOwnProperty.call(attrs, name) ? attrs[name] : null;
    },
    matches(selector) {
      return selector.split(',').map(s => s.trim()).some(part => {
        if (part.startsWith('#')) return id === part.slice(1);
        if (part.startsWith('.')) return classSet.has(part.slice(1));
        const prefixMatch = part.match(/^\[id\^="([^"]+)"\]$/);
        if (prefixMatch) return id.startsWith(prefixMatch[1]);
        const attrMatch = part.match(/^\[([a-z-]+)(?:="([^"]*)")?\]$/i);
        if (attrMatch) {
          const val = node.getAttribute(attrMatch[1]);
          return attrMatch[2] === undefined ? val !== null : val === attrMatch[2];
        }
        return false;
      });
    },
    closest(selector) {
      for (let cur = node; cur; cur = cur.parentElement) {
        if (cur.matches(selector)) return cur;
      }
      return null;
    },
    querySelectorAll(selector) {
      const out = [];
      for (const child of children) {
        if (child.matches(selector)) out.push(child);
        out.push(...child.querySelectorAll(selector));
      }
      return out;
    }
  };
  for (const child of children) child.parentElement = node;
  return node;
}

function makeDoc(nodes, hostname = 'www.amazon.co.uk') {
  const root = makeNode({ children: nodes });
  return {
    location: { hostname },
    querySelectorAll(selector) {
      return root.querySelectorAll(selector);
    }
  };
}

function loadCaptureHtml(relCaptureDir) {
  const captureDir = fileURLToPath(new URL(`../${relCaptureDir}`, import.meta.url));
  const parts = readdirSync(captureDir).filter(f => f.startsWith('part-')).sort();
  assert.ok(parts.length > 0, `Fragments introuvables dans ${relCaptureDir}`);
  const rawJson = parts
    .map(file => JSON.parse(readFileSync(join(captureDir, file), 'utf8')).data || '')
    .join('');
  return JSON.parse(rawJson).html || '';
}

test('matchesShippingRestriction détecte les messages multilingues sans faux positifs', () => {
  const positives = [
    'This item cannot be shipped to your selected delivery location. Please choose a different delivery location.',
    'Cet article ne peut pas être expédié à l’adresse de livraison sélectionnée.',
    'Dieser Artikel kann nicht an den ausgewählten Lieferort versendet werden.',
    'Este producto no se puede enviar a la dirección de envío seleccionada.',
    'Questo articolo non può essere spedito al luogo di consegna selezionato.'
  ];
  for (const text of positives) {
    const res = ALShippingLock.matchesShippingRestriction(text);
    assert.equal(res.matched, true, `Devrait matcher : ${text}`);
    assert.ok(res.message.length > 0);
  }

  const negatives = [
    'Sorry, there was a problem. There was an error retrieving your Wish Lists.',
    'Sorry, something went wrong.',
    'FREE delivery Tomorrow, 12 Nov on eligible orders.',
    '[RETIRE]'
  ];
  for (const text of negatives) {
    assert.equal(ALShippingLock.matchesShippingRestriction(text).matched, false, `Ne doit pas matcher : ${text}`);
  }
});

test('buildCountryLockExplanation génère une explication LOCK pays adaptée à la marketplace', () => {
  const uk = ALShippingLock.buildCountryLockExplanation('https://www.amazon.co.uk/dp/B0CM6K7FHQ', 'This item cannot be shipped...');
  assert.equal(uk.blocked, true);
  assert.equal(uk.code, 'LOCK PAYS');
  assert.equal(uk.title, 'LOCK pays (.co.uk)');
  assert.ok(uk.explanation.includes('Royaume-Uni (.co.uk)'));
  assert.ok(uk.explanation.includes('adresse FR'));

  const de = ALShippingLock.buildCountryLockExplanation('www.amazon.de');
  assert.equal(de.title, 'LOCK pays (.de)');
  assert.ok(de.explanation.includes('Allemagne (.de)'));

  const fr = ALShippingLock.buildCountryLockExplanation('amazon.fr');
  assert.equal(fr.title, 'LOCK pays (.fr)');
  assert.ok(fr.explanation.includes('France (.fr)'));
});

test('detectShippingRestriction détecte le message dans la zone livraison visible ou popover, sans faux positif après changement de variante', () => {
  const visibleBlock = makeNode({
    id: 'deliveryBlockMessage',
    children: [
      makeNode({
        classes: ['a-color-error'],
        textContent: 'Cet article ne peut pas être expédié à l’adresse de livraison sélectionnée.'
      })
    ]
  });
  const docVisible = makeDoc([visibleBlock], 'www.amazon.fr');
  const resVisible = ALShippingLock.detectShippingRestriction(docVisible);
  assert.equal(resVisible.blocked, true);
  assert.equal(resVisible.title, 'LOCK pays (.fr)');

  // Popover fermé + bouton d'achat absent => bloqué
  const closedPopover = makeNode({
    id: 'a-popover-2',
    classes: ['a-popover'],
    style: { display: 'none' },
    attrs: { 'aria-hidden': 'true' },
    children: [
      makeNode({
        id: 'a-popover-content-2',
        classes: ['a-popover-content'],
        children: [
          makeNode({
            classes: ['a-color-error'],
            textContent: 'This item cannot be shipped to your selected delivery location. Please choose a different delivery location.'
          })
        ]
      })
    ]
  });
  const docClosedNoButton = makeDoc([closedPopover], 'www.amazon.co.uk');
  const resClosed = ALShippingLock.detectShippingRestriction(docClosedNoButton);
  assert.equal(resClosed.blocked, true);
  assert.equal(resClosed.title, 'LOCK pays (.co.uk)');

  // Popover fermé + bouton d'achat présent (variante changée vers offre livrable) => non bloqué
  const buyBtn = makeNode({ id: 'add-to-cart-button' });
  const docClosedWithButton = makeDoc([closedPopover, buyBtn], 'www.amazon.co.uk');
  const resWithButton = ALShippingLock.detectShippingRestriction(docClosedWithButton);
  assert.equal(resWithButton.blocked, false);

  // Erreur Wishlist dans la buybox => non bloqué
  const wishlistErr = makeNode({
    id: 'desktop_buybox',
    children: [makeNode({ classes: ['a-color-error'], textContent: 'There was an error retrieving your Wish Lists.' })]
  });
  assert.equal(ALShippingLock.detectShippingRestriction(makeDoc([wishlistErr])).blocked, false);
});

test('Fixture réelle UK B0CM6K7FHQ : détection LOCK pays (.co.uk) et absence de faux positif sur FR B0DW4FVCCL / FR B0GCN57MGK', () => {
  const ukHtml = loadCaptureHtml('bibliotheque-pages/UK/B0CM6K7FHQ/2026-11-11T18-14-07-025Z-958c25b6-80db-496f-98b6-9d22d21f1d95');
  assert.equal(/id="add-to-cart-button(?:-ubb)?"/i.test(ukHtml), false, 'Aucun bouton Add to Cart dans UK B0CM6K7FHQ');
  const popMatch = ukHtml.match(/id="a-popover-content-2"[\s\S]*?<span class="a-color-error">\s*([^<]+?)\s*<\/span>/i);
  assert.ok(popMatch, 'Le message d erreur livraison doit être présent dans #a-popover-content-2');

  const ukDoc = makeDoc([
    makeNode({ id: 'deliveryBlockMessage', textContent: '[RETIRE]' }),
    makeNode({
      id: 'a-popover-2',
      classes: ['a-popover'],
      style: { display: 'none' },
      attrs: { 'aria-hidden': 'true' },
      children: [
        makeNode({
          id: 'a-popover-content-2',
          classes: ['a-popover-content'],
          children: [makeNode({ classes: ['a-color-error'], textContent: popMatch[1] })]
        })
      ]
    })
  ], 'www.amazon.co.uk');

  const ukRes = ALShippingLock.detectShippingRestriction(ukDoc);
  assert.equal(ukRes.blocked, true);
  assert.equal(ukRes.code, 'LOCK PAYS');
  assert.equal(ukRes.title, 'LOCK pays (.co.uk)');
  assert.ok(ukRes.detectedMessage.includes('cannot be shipped to your selected delivery location'));

  const frUbbHtml = loadCaptureHtml('bibliotheque-pages/FR/B0DW4FVCCL/2026-11-10T12-34-22-249Z-e32a36f9-162c-430b-bdcb-a682dc263f44');
  assert.equal(ALShippingLock.matchesShippingRestriction(frUbbHtml).matched, false);

  const frNewHtml = loadCaptureHtml('bibliotheque-pages/FR/B0GCN57MGK/2026-11-10T14-03-04-032Z-6c9c2041-d5ac-474a-9240-75c0efcd36c1');
  assert.equal(ALShippingLock.matchesShippingRestriction(frNewHtml).matched, false);
});
