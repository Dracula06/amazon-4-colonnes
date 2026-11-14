import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// Charger core.js dans le contexte global
const coreCode = readFileSync(new URL('../core.js', import.meta.url), 'utf8');
const fn = new Function('globalThis', coreCode);
fn(globalThis);

const { ALCore } = globalThis;

test('ALCore - Support UK / English', () => {
  const fba = ALCore.classify('Dispatched from Amazon', 'Sold by AnkerDirect');
  assert.equal(fba.kind, 'fba');
  assert.equal(fba.ship, 'Amazon');
  assert.equal(fba.seller, 'AnkerDirect');

  const direct = ALCore.classify('', 'Dispatched from and sold by Amazon');
  assert.equal(direct.kind, 'amazon');
  assert.equal(direct.ship, 'Amazon');
  assert.equal(direct.seller, 'Amazon');

  const fbm = ALCore.classify('Ships from AudioStore UK', 'Sold by AudioStore UK');
  assert.equal(fbm.kind, 'fbm');
  assert.equal(fbm.ship, 'AudioStore UK');
  assert.equal(fbm.seller, 'AudioStore UK');
});

test('ALCore - Support DE / Deutsch', () => {
  const fba = ALCore.classify('Versand durch Amazon', 'Verkauft von Spigen DE');
  assert.equal(fba.kind, 'fba');
  assert.equal(fba.ship, 'Amazon');
  assert.equal(fba.seller, 'Spigen DE');

  const direct = ALCore.classify('', 'Verkauf und Versand durch Amazon');
  assert.equal(direct.kind, 'amazon');
  assert.equal(direct.ship, 'Amazon');

  const resale = ALCore.classify('Amazon', 'Amazon Retourenkauf');
  assert.equal(resale.kind, 'amazon');
  assert.match(resale.label, /Seconde main|Retourenkauf/i);
});

test('ALCore - Support ES / Español', () => {
  const fba = ALCore.classify('Enviado por Amazon', 'Vendido por Cecotec');
  assert.equal(fba.kind, 'fba');
  assert.equal(fba.ship, 'Amazon');
  assert.equal(fba.seller, 'Cecotec');

  const direct = ALCore.classify('', 'Enviado y vendido por Amazon');
  assert.equal(direct.kind, 'amazon');
  assert.equal(direct.ship, 'Amazon');

  const secondHand = ALCore.classify('Amazon', 'Amazon Segunda mano');
  assert.equal(secondHand.kind, 'amazon');
});

test('ALCore - Support IT / Italiano', () => {
  const fba = ALCore.classify('Spedito da Amazon', 'Venduto da Brand IT');
  assert.equal(fba.kind, 'fba');
  assert.equal(fba.ship, 'Amazon');
  assert.equal(fba.seller, 'Brand IT');

  const direct = ALCore.classify('', 'Spedito e venduto da Amazon');
  assert.equal(direct.kind, 'amazon');
  assert.equal(direct.ship, 'Amazon');
});

test('ALCore - Support Amazon Seconde main / Reconditionné UBB', () => {
  // Cas B0DW4FVCCL : Vendeur Amazon Seconde main, expéditeur SSOF "expédié par Amazon"
  const ubbFull = ALCore.classify('expédié par Amazon', 'Amazon Seconde main');
  assert.equal(ubbFull.kind, 'amazon');
  assert.equal(ubbFull.code, 'AMAZON');
  assert.equal(ubbFull.label, 'Amazon Seconde main · expédié par Amazon');
  assert.equal(ubbFull.ship, 'Amazon');
  assert.equal(ubbFull.seller, 'Amazon Seconde main');

  // Cas où seul le vendeur est extrait dans le DOM sans champ expéditeur séparé
  const ubbOnlySeller = ALCore.classify('', 'Amazon Seconde main');
  assert.equal(ubbOnlySeller.kind, 'amazon');
  assert.equal(ubbOnlySeller.code, 'AMAZON');
  assert.equal(ubbOnlySeller.label, 'Amazon Seconde main · expédié par Amazon');
  assert.equal(ubbOnlySeller.ship, 'Amazon');
});

test('ALCore - Support Shipped and sold by Amazon (cas réel PILOT)', () => {
  const comb = ALCore.combined('Shipped and sold by Amazon');
  assert.ok(comb);
  assert.equal(comb.ship, 'Amazon');
  assert.equal(comb.seller, 'Amazon');

  const res = ALCore.classify('', 'Shipped and sold by Amazon');
  assert.equal(res.kind, 'amazon');
  assert.equal(res.code, 'AMAZON');
  assert.equal(res.label, 'Vendu et expédié par Amazon');
  assert.equal(res.ship, 'Amazon');
  assert.equal(res.seller, 'Amazon');
});
