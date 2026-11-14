import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const affiliateCode = readFileSync(new URL('../src/display/affiliate-link.js', import.meta.url), 'utf8');
new Function('globalThis', affiliateCode)(globalThis);

const quickFrameCode = readFileSync(new URL('../src/display/quick-frame.js', import.meta.url), 'utf8');
new Function('globalThis', quickFrameCode)(globalThis);

const { ALAffiliate, ALQuickFrame } = globalThis;

function makeNode({
  tagName = 'DIV',
  id = '',
  classes = [],
  textContent = '',
  attrs = {},
  value = undefined,
  selected = false,
  children = [],
  parentElement = null
} = {}) {
  const classSet = new Set(classes);
  const node = {
    tagName,
    id,
    textContent,
    value,
    selected,
    children,
    parentElement,
    classList: {
      contains(c) { return classSet.has(c); }
    },
    getAttribute(name) {
      return Object.prototype.hasOwnProperty.call(attrs, name) ? attrs[name] : null;
    },
    matches(selector) {
      return selector.split(',').map(s => s.trim()).some(part => {
        if (part.startsWith('#')) return id === part.slice(1);
        if (part.startsWith('.')) return classSet.has(part.slice(1));
        const tagCls = part.match(/^([a-z0-9]+)\.([a-z0-9_-]+)$/i);
        if (tagCls) return tagName.toLowerCase() === tagCls[1].toLowerCase() && classSet.has(tagCls[2]);
        if (/^[a-z0-9]+$/i.test(part)) return tagName.toLowerCase() === part.toLowerCase();
        return false;
      });
    },
    closest(selector) {
      for (let cur = node; cur; cur = cur.parentElement) {
        if (cur.matches(selector)) return cur;
      }
      return null;
    },
    querySelector(selector) {
      return this.querySelectorAll(selector)[0] || null;
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

function makeDoc(nodes) {
  const root = makeNode({ children: nodes });
  return {
    querySelector(selector) { return root.querySelector(selector); },
    querySelectorAll(selector) { return root.querySelectorAll(selector); }
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

test('resolveDefinedCountry reconnaît exactement les 5 pays définis', () => {
  assert.equal(ALAffiliate.resolveDefinedCountry('www.amazon.fr')?.code, 'FR');
  assert.equal(ALAffiliate.resolveDefinedCountry('https://www.amazon.co.uk/dp/B0CM6K7FHQ')?.code, 'UK');
  assert.equal(ALAffiliate.resolveDefinedCountry('amazon.de')?.code, 'DE');
  assert.equal(ALAffiliate.resolveDefinedCountry('https://www.amazon.es/s?k=clavier')?.code, 'ES');
  assert.equal(ALAffiliate.resolveDefinedCountry('https://www.amazon.it/')?.code, 'IT');

  assert.equal(ALAffiliate.resolveDefinedCountry('https://www.amazon.com/dp/B000000000'), null);
  assert.equal(ALAffiliate.resolveDefinedCountry('https://example.com'), null);
});

test('extractAsin et cleanTrackingId valident proprement ASIN et tags', () => {
  assert.equal(ALAffiliate.extractAsin('/dp/b0cm6k7fhq/ref=sr_1_1'), 'B0CM6K7FHQ');
  assert.equal(ALAffiliate.extractAsin('https://www.amazon.fr/gp/product/B0GCN57MGK?th=1'), 'B0GCN57MGK');
  assert.equal(ALAffiliate.extractAsin('/s?k=tablette'), '');

  assert.equal(ALAffiliate.cleanTrackingId(' monid-21 '), 'monid-21');
  assert.equal(ALAffiliate.cleanTrackingId('[RETIRE]'), '');
  assert.equal(ALAffiliate.cleanTrackingId(''), '');
  assert.equal(ALAffiliate.cleanTrackingId('tag invalide!'), '');
});

test('buildQuickAffiliateLink génère des liens affiliés propres pour fiches produit et autres pages', () => {
  const prod = ALAffiliate.buildQuickAffiliateLink(
    'https://www.amazon.co.uk/DOOGEE-U10-PRO/dp/B0CM6K7FHQ/ref=sr_1_3?qid=12345&sr=8-3&th=1&psc=1',
    { trackingId: 'demo-21' }
  );
  assert.equal(prod.ok, true);
  assert.equal(prod.isProductPage, true);
  assert.equal(prod.asin, 'B0CM6K7FHQ');
  assert.equal(prod.hasTag, true);
  assert.equal(prod.url, 'https://www.amazon.co.uk/dp/B0CM6K7FHQ?th=1&psc=1&tag=demo-21');

  const noTag = ALAffiliate.buildQuickAffiliateLink('https://www.amazon.fr/dp/B0GCN57MGK?qid=999');
  assert.equal(noTag.ok, true);
  assert.equal(noTag.hasTag, false);
  assert.equal(noTag.url, 'https://www.amazon.fr/dp/B0GCN57MGK');

  const search = ALAffiliate.buildQuickAffiliateLink(
    'https://www.amazon.es/s?k=ssd+nvme&crid=XYZ&sprefix=ssd&dib=abc&utm_source=test',
    { trackingId: 'esid-21' }
  );
  assert.equal(search.ok, true);
  assert.equal(search.isProductPage, false);
  assert.equal(search.url, 'https://www.amazon.es/s?k=ssd+nvme&tag=esid-21');

  assert.equal(ALAffiliate.buildQuickAffiliateLink('not-a-url').ok, false);
});

test('extractSiteStripeInfo lit la structure SiteStripe synthétique sans faux positifs', () => {
  const doc = makeDoc([
    makeNode({
      id: 'nav-AssociateStripe',
      children: [
        makeNode({
          id: 'amzn-ss-wrap',
          children: [
            makeNode({
              tagName: 'A',
              classes: ['amzn-ss-link-home-page'],
              attrs: { href: 'https://affiliate-program.amazon.co.uk/home' }
            }),
            makeNode({ id: 'amzn-ss-category-content', textContent: 'Computers' }),
            makeNode({ id: 'amzn-ss-commission-rate-content', textContent: '3.00%' }),
            makeNode({ id: 'amzn-ss-get-link-button', tagName: 'BUTTON', textContent: 'Get Link' }),
            makeNode({
              classes: ['amzn-ss-store-tag-col'],
              children: [
                makeNode({
                  tagName: 'SELECT',
                  id: 'amzn-ss-store-id-dropdown-text',
                  children: [makeNode({ tagName: 'OPTION', textContent: '[RETIRE]' })]
                }),
                makeNode({ classes: ['a-dropdown-prompt'], textContent: 'sample-store-21' })
              ]
            }),
            makeNode({
              classes: ['amzn-ss-store-tag-col'],
              children: [
                makeNode({
                  tagName: 'SELECT',
                  id: 'amzn-ss-tracking-id-dropdown-text',
                  children: [makeNode({ tagName: 'OPTION', textContent: '[RETIRE]' })]
                }),
                makeNode({ classes: ['a-dropdown-prompt'], textContent: 'sample-track-21' })
              ]
            })
          ]
        })
      ]
    })
  ]);

  const info = ALAffiliate.extractSiteStripeInfo(doc);
  assert.equal(info.present, true);
  assert.equal(info.homeUrl, 'https://affiliate-program.amazon.co.uk/home');
  assert.equal(info.category, 'Computers');
  assert.equal(info.commissionRate, '3.00%');
  assert.equal(info.storeId, 'sample-store-21');
  assert.equal(info.trackingId, 'sample-track-21');
  assert.equal(info.canTriggerGetLink, true);
  assert.equal(info.excludedProduct, false);
});

test('Fixtures réelles UK B0CM6K7FHQ et ES B0GS1TW9G5 : présence SiteStripe et extraction cohérente ; absence sur FR B0GCN57MGK', () => {
  const ukHtml = loadCaptureHtml('bibliotheque-pages/UK/B0CM6K7FHQ/2026-11-11T18-14-07-025Z-958c25b6-80db-496f-98b6-9d22d21f1d95');
  assert.ok(ukHtml.includes('id="nav-AssociateStripe"'), 'UK B0CM6K7FHQ doit contenir #nav-AssociateStripe');

  const ukHome = ukHtml.match(/class="amzn-ss-link-home-page"[^>]*href="([^"]+)"/)?.[1] || '';
  const ukCat = ukHtml.match(/id="amzn-ss-category-content"[^>]*>([^<]+)</)?.[1] || '';
  const ukRate = ukHtml.match(/id="amzn-ss-commission-rate-content"[^>]*>([^<]+)</)?.[1] || '';
  const ukPrompt = ukHtml.match(/id="amzn-ss-tracking-id-dropdown-text"[\s\S]*?<span class="a-dropdown-prompt">([^<]+)</)?.[1] || '';

  const ukDoc = makeDoc([
    makeNode({
      id: 'nav-AssociateStripe',
      children: [
        makeNode({ tagName: 'A', classes: ['amzn-ss-link-home-page'], attrs: { href: ukHome } }),
        makeNode({ id: 'amzn-ss-category-content', textContent: ukCat }),
        makeNode({ id: 'amzn-ss-commission-rate-content', textContent: ukRate }),
        makeNode({ id: 'amzn-ss-get-link-button', tagName: 'BUTTON' }),
        makeNode({
          classes: ['amzn-ss-store-tag-col'],
          children: [
            makeNode({ tagName: 'SELECT', id: 'amzn-ss-tracking-id-dropdown-text' }),
            makeNode({ classes: ['a-dropdown-prompt'], textContent: ukPrompt })
          ]
        })
      ]
    })
  ]);

  const ukInfo = ALAffiliate.extractSiteStripeInfo(ukDoc);
  assert.equal(ukInfo.present, true);
  assert.equal(ukInfo.category, 'Computers');
  assert.equal(ukInfo.commissionRate, '3.00%');
  assert.ok(ukInfo.homeUrl.startsWith('https://affiliate-program.amazon.co.uk/'));
  assert.ok(ukInfo.trackingId.length > 0);

  const ukLink = ALAffiliate.buildQuickAffiliateLink('https://www.amazon.co.uk/dp/B0CM6K7FHQ', {
    trackingId: ukInfo.trackingId
  });
  assert.equal(ukLink.ok, true);
  assert.equal(ukLink.url, `https://www.amazon.co.uk/dp/B0CM6K7FHQ?tag=${ukInfo.trackingId}`);

  const esHtml = loadCaptureHtml('bibliotheque-pages/ES/B0GS1TW9G5/2026-11-10T11-30-06-134Z-fb06e99c-0e3c-44ac-93f3-bbd6a2206555');
  assert.ok(esHtml.includes('id="nav-AssociateStripe"'), 'ES B0GS1TW9G5 doit contenir #nav-AssociateStripe');
  assert.ok(esHtml.includes('https://afiliados.amazon.es/home'));

  const frHtml = loadCaptureHtml('bibliotheque-pages/FR/B0GCN57MGK/2026-11-10T14-03-04-032Z-6c9c2041-d5ac-474a-9240-75c0efcd36c1');
  assert.equal(frHtml.includes('id="nav-AssociateStripe"'), false, 'FR B0GCN57MGK ne contient pas SiteStripe');
});

test('ALQuickFrame.clampPosition borne la fenêtre dans les limites de la fenêtre visible', () => {
  assert.deepEqual(ALQuickFrame.clampPosition(-50, -20, 320, 200, 1280, 800), { left: 8, top: 8 });
  assert.deepEqual(ALQuickFrame.clampPosition(2000, 1500, 320, 200, 1280, 800), { left: 952, top: 592 });
  assert.deepEqual(ALQuickFrame.clampPosition(412.6, 150.2, 320, 200, 1280, 800), { left: 413, top: 150 });
});
