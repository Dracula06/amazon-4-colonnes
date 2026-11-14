import test from 'node:test';
import assert from 'node:assert/strict';
import { extractOriginUrl } from '../src/display/redirect-origin.js';

test('extractOriginUrl préserve le tag d affiliation et linkCode pour la rémunération', () => {
  const urlFournie = 'https://www.amazon.fr/dp/B0HMWQ9VL5?ar_srct=T1&tag=rx-it-21&linkCode=gt2&creatorsDisableRedirect=true&ar_su=https%3A%2F%2Fwww.amazon.it%2Fdp%2FB0HMWQ9VL5%2F%3Ftag%3Drx-it-21%26creatorsDisableRedirect%3Dtrue&ar_mt=DIRECT&th=1';

  const res = extractOriginUrl(urlFournie);
  assert.ok(res);
  assert.equal(res.host, 'amazon.it');
  assert.equal(res.countryCode, 'IT');
  assert.equal(res.flag, '🇮🇹');
  assert.equal(res.asin, 'B0HMWQ9VL5');
  assert.equal(res.tag, 'rx-it-21');

  // L'URL propre doit contenir le tag partenaire, le linkCode et creatorsDisableRedirect
  assert.ok(res.cleanUrl.includes('tag=rx-it-21'), 'Le tag affilié doit être présent');
  assert.ok(res.cleanUrl.includes('linkCode=gt2'), 'Le linkCode affilié doit être présent');
  assert.ok(res.cleanUrl.includes('creatorsDisableRedirect=true'), 'Le paramètre anti-redirection doit être présent');
  assert.ok(res.cleanUrl.includes('th=1'), 'La variante du produit doit être présente');
});

test('extractOriginUrl ignore les URLs sans redirection', () => {
  const simpleUrl = 'https://www.amazon.fr/dp/B01MTLEKNA';
  assert.equal(extractOriginUrl(simpleUrl), null);
});

test('extractOriginUrl rejette les URLs malveillantes ou non Amazon', () => {
  const fakeUrl = 'https://www.amazon.fr/dp/B01MTLEKNA?ar_su=https%3A%2F%2Fevil-site.com%2Fsteal';
  assert.equal(extractOriginUrl(fakeUrl), null);
});
