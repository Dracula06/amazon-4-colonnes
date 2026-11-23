import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  parsePriceNumber,
  normalizeDiscountRate,
  cleanReferencePrice,
  computeDiscountRate,
  formatEnrichedPrice,
  extractPriceFromHtml,
  cleanLogisticsLabel,
  getDiscountDealInfo,
  getReferencePriceInfo
} from '../src/library/pricing.js';

import { buildTelegramMessage } from '../src/library/telegram.js';
import { buildDiscordEmbed } from '../src/library/discord.js';

function loadFixtureHtml(relPath) {
  const fixtureDir = fileURLToPath(new URL(`../${relPath}`, import.meta.url));
  const subdirs = readdirSync(fixtureDir).filter(f => !f.endsWith('.json') && !f.endsWith('.txt'));
  const targetDir = subdirs.length > 0 ? join(fixtureDir, subdirs[0]) : fixtureDir;
  const files = readdirSync(targetDir).filter(f => f.startsWith('part-')).sort();
  let html = '';
  for (const f of files) {
    const c = JSON.parse(readFileSync(join(targetDir, f), 'utf8'));
    html += c.data || '';
  }
  return html;
}

test('parsePriceNumber extrait correctement les montants numériques', () => {
  assert.equal(parsePriceNumber('14,25 €'), 14.25);
  assert.equal(parsePriceNumber('16,36 €'), 16.36);
  assert.equal(parsePriceNumber('58,74 €'), 58.74);
  assert.equal(parsePriceNumber('1 039,90 €'), 1039.9);
  assert.equal(parsePriceNumber('1 039,90 €'), 1039.9); // espace insécable étroit
  assert.equal(parsePriceNumber('£22.98'), 22.98);
  assert.equal(parsePriceNumber('25.0'), 25.0);
  assert.equal(parsePriceNumber(14.25), 14.25);
  assert.equal(parsePriceNumber(''), null);
  assert.equal(parsePriceNumber(null), null);
});

test('normalizeDiscountRate normalise les formats de réduction officiels', () => {
  assert.equal(normalizeDiscountRate('-43 %'), '-43%');
  assert.equal(normalizeDiscountRate('-43&nbsp;%'), '-43%');
  assert.equal(normalizeDiscountRate('-43%'), '-43%');
  assert.equal(normalizeDiscountRate('43%'), '-43%');
  assert.equal(normalizeDiscountRate('43'), '-43%');
  assert.equal(normalizeDiscountRate(null), null);
});

test('cleanReferencePrice nettoie et qualifie le prix de référence', () => {
  assert.equal(cleanReferencePrice('Prix conseillé : 25,00 €'), 'conseillé 25,00 €');
  assert.equal(cleanReferencePrice('Prix conseillé : 25,00&nbsp;€'), 'conseillé 25,00 €');
  assert.equal(cleanReferencePrice('conseillé 25,00 €'), 'conseillé 25,00 €');
  assert.equal(cleanReferencePrice('Prix le plus bas des 30 derniers jours : 11,99 €'), 'le plus bas récent 11,99 €');
  assert.equal(cleanReferencePrice('Prix le plus bas récent : 20,00 €'), 'le plus bas récent 20,00 €');
  assert.equal(cleanReferencePrice('Prix récent : 15,00 €'), 'récent 15,00 €');
  assert.equal(cleanReferencePrice('Recommended Price: €8.75'), 'conseillé 8,75 €');
  assert.equal(cleanReferencePrice(null), null);
});

test('computeDiscountRate calcule le pourcentage de réduction automatique', () => {
  // Cas 2 : ((58.74 - 16.36) / 58.74) * 100 = 72%
  assert.equal(computeDiscountRate('16,36 €', '58,74 €'), '-72%');
  assert.equal(computeDiscountRate('14.25', '25.0'), '-43%');
  assert.equal(computeDiscountRate('25,00 €', '25,00 €'), null);
  assert.equal(computeDiscountRate('30,00 €', '20,00 €'), null);
});

test('getDiscountDealInfo classe correctement les paliers de réduction et flammes', () => {
  // 1% à 50% : VERT (#16a34a), 1 flamme 🔥, badge 🟢
  const low = getDiscountDealInfo('-43%');
  assert.equal(low.percentage, 43);
  assert.equal(low.rateStr, '-43%');
  assert.equal(low.badge, '🟢');
  assert.equal(low.flames, '🔥');
  assert.equal(low.color, '#16a34a');
  assert.equal(low.tier, 'low');
  assert.equal(low.formattedLineTelegram, '🟢 <b>Remise :</b> -43% 🔥');
  assert.equal(low.formattedLineDiscord, '🟢 **Remise :** -43% 🔥');

  // Limite 50%
  assert.equal(getDiscountDealInfo('50%').tier, 'low');
  assert.equal(getDiscountDealInfo('50%').badge, '🟢');
  assert.equal(getDiscountDealInfo('50%').flames, '🔥');

  // 51% à 70% : ORANGE (#ea580c), 2 flammes 🔥🔥, badge 🟠
  const med = getDiscountDealInfo('-63%');
  assert.equal(med.percentage, 63);
  assert.equal(med.badge, '🟠');
  assert.equal(med.flames, '🔥🔥');
  assert.equal(med.color, '#ea580c');
  assert.equal(med.tier, 'medium');
  assert.equal(med.formattedLineTelegram, '🟠 <b>Remise :</b> -63% 🔥🔥');
  assert.equal(med.formattedLineDiscord, '🟠 **Remise :** -63% 🔥🔥');

  // Limites 51% et 70%
  assert.equal(getDiscountDealInfo('51%').tier, 'medium');
  assert.equal(getDiscountDealInfo('70%').tier, 'medium');

  // 71%+ : ROUGE VIF (#dc2626), 3 flammes 🔥🔥🔥, badge 🔴
  const high = getDiscountDealInfo('-72%');
  assert.equal(high.percentage, 72);
  assert.equal(high.badge, '🔴');
  assert.equal(high.flames, '🔥🔥🔥');
  assert.equal(high.color, '#dc2626');
  assert.equal(high.tier, 'high');
  assert.equal(high.formattedLineTelegram, '🔴 <b>Remise :</b> -72% 🔥🔥🔥');
  assert.equal(high.formattedLineDiscord, '🔴 **Remise :** -72% 🔥🔥🔥');

  // 0% ou valeur absente
  assert.equal(getDiscountDealInfo('0%'), null);
  assert.equal(getDiscountDealInfo(null), null);
});

test('getReferencePriceInfo structure le prix de référence et le prix d origine neuf', () => {
  // Cas 1 : Prix conseillé
  const ref1 = getReferencePriceInfo({ referencePrice: 'conseillé 25,00 €' });
  assert.equal(ref1.label, 'Prix conseillé');
  assert.equal(ref1.value, '25,00 €');
  assert.equal(ref1.emoji, '🎯');
  assert.equal(ref1.formattedLineTelegram, '🎯 <b>Prix conseillé :</b> 25,00 €');
  assert.equal(ref1.formattedLineDiscord, '🎯 **Prix conseillé :** 25,00 €');

  // Prix récent
  const refRecent = getReferencePriceInfo({ referencePrice: 'Prix récent : 15,00 €' });
  assert.equal(refRecent.label, 'Prix récent');
  assert.equal(refRecent.value, '15,00 €');

  // Prix le plus bas récent
  const refLowest = getReferencePriceInfo({ referencePrice: 'Prix le plus bas récent : 20,00 €' });
  assert.equal(refLowest.label, 'Prix le plus bas récent');
  assert.equal(refLowest.value, '20,00 €');

  // Cas 2 : Prix neuf d origine
  const ref2 = getReferencePriceInfo({ newPrice: '58,74 €' });
  assert.equal(ref2.label, 'Prix d’origine');
  assert.equal(ref2.value, 'neuf 58,74 €');
  assert.equal(ref2.emoji, '🎯');
  assert.equal(ref2.formattedLineTelegram, '🎯 <b>Prix d’origine :</b> neuf 58,74 €');
  assert.equal(ref2.formattedLineDiscord, '🎯 **Prix d’origine :** neuf 58,74 €');

  // Aucun
  assert.equal(getReferencePriceInfo({}), null);
});

test('cleanLogisticsLabel supprime les répétitions d expéditeur', () => {
  assert.equal(
    cleanLogisticsLabel('Amazon Seconde main · expédié par Amazon', 'Amazon'),
    'Amazon Seconde main'
  );
  assert.equal(
    cleanLogisticsLabel('Amazon Warehouse · Dispatched by Amazon', 'Amazon'),
    'Amazon Warehouse'
  );
  assert.equal(
    cleanLogisticsLabel('Amazon Warehouse · versand durch Amazon', 'Amazon'),
    'Amazon Warehouse'
  );
  assert.equal(
    cleanLogisticsLabel('Vendu et expédié par Amazon', 'Amazon'),
    'Vendu et expédié par Amazon'
  );
  assert.equal(
    cleanLogisticsLabel('Expédié par Amazon (vendeur tiers)', 'Amazon'),
    'Expédié par Amazon (vendeur tiers)'
  );
  assert.equal(cleanLogisticsLabel(null), 'Expéditeur non identifié');
});

test('formatEnrichedPrice gère les 3 cas spécifiés', () => {
  // Cas 1 : Produit neuf avec promotion / prix conseillé
  assert.equal(
    formatEnrichedPrice({
      price: '14,25 €',
      discountRate: '-43%',
      referencePrice: 'conseillé 25,00 €'
    }),
    '14,25 € (-43% · conseillé 25,00 €)'
  );

  // Cas 2 : Offre d occasion avec offre neuve
  assert.equal(
    formatEnrichedPrice({
      price: '16,36 €',
      condition: 'Occasion - Comme neuf',
      newPrice: '58,74 €'
    }),
    '16,36 € (Occasion - Comme neuf · -72% vs neuf 58,74 €)'
  );

  // Cas 3 : Produit sans réduction
  assert.equal(
    formatEnrichedPrice({
      price: '25,00 €'
    }),
    '25,00 €'
  );

  // Cas 3 bis : Occasion sans prix neuf
  assert.equal(
    formatEnrichedPrice({
      price: '16,36 €',
      condition: 'Occasion - Très bon état'
    }),
    '16,36 € (Occasion - Très bon état)'
  );
});

test('Fixture réelle FR B0CZPNWQFX (Cas 1) : extraction prix, réduction officielle et prix conseillé', () => {
  const html = loadFixtureHtml('bibliotheque-pages/FR/B0CZPNWQFX');
  const details = extractPriceFromHtml(html);

  assert.equal(details.price, '14,25 €');
  assert.equal(details.discountRate, '-43%');
  assert.equal(details.referencePrice, 'conseillé 25,00 €');
  assert.equal(details.newPrice, null);
  assert.equal(details.formattedPrice, '14,25 € (-43% · conseillé 25,00 €)');

  // Formatage Telegram
  const tgMsg = buildTelegramMessage({
    asin: 'B0CZPNWQFX',
    marketplace: 'FR',
    title: 'Produit Neuf Promo',
    url: 'https://www.amazon.fr/dp/B0CZPNWQFX',
    price: details.price,
    discountRate: details.discountRate,
    referencePrice: details.referencePrice
  });

  assert.match(tgMsg, /💰 <b>Prix :<\/b> <b>14,25 €<\/b>/);
  assert.match(tgMsg, /🎯 <b>Prix conseillé :<\/b> 25,00 €/);
  assert.match(tgMsg, /🟢 <b>Remise :<\/b> -43% 🔥/);

  // Formatage Discord
  const discordEmbed = buildDiscordEmbed({
    asin: 'B0CZPNWQFX',
    marketplace: 'FR',
    title: 'Produit Neuf Promo',
    url: 'https://www.amazon.fr/dp/B0CZPNWQFX',
    price: details.price,
    discountRate: details.discountRate,
    referencePrice: details.referencePrice
  });

  const fields = discordEmbed.embeds[0].fields;
  const priceField = fields.find(f => f.name.includes('Prix repéré'));
  assert.equal(priceField.value, '14,25 €');
  const refField = fields.find(f => f.name.includes('Prix conseillé'));
  assert.equal(refField.name, '🎯 Prix conseillé');
  assert.equal(refField.value, '25,00 €');
  const dealField = fields.find(f => f.name.includes('Remise'));
  assert.equal(dealField.name, '🟢 Remise');
  assert.equal(dealField.value, '-43% 🔥');
});

test('Fixture réelle FR B0DG5BP4K1 (Cas 2) : extraction occasion, offre neuve et réduction calculée', () => {
  const html = loadFixtureHtml('bibliotheque-pages/FR/B0DG5BP4K1');
  const details = extractPriceFromHtml(html, { seller: 'Amazon Seconde main' });

  assert.equal(details.price, '16,36 €');
  assert.equal(details.condition, 'Occasion - Comme neuf');
  assert.equal(details.newPrice, '58,74 €');
  assert.equal(details.discountRate, '-72%');
  assert.equal(details.formattedPrice, '16,36 € (Occasion - Comme neuf · -72% vs neuf 58,74 €)');

  // Formatage Telegram
  const tgMsg = buildTelegramMessage({
    asin: 'B0DG5BP4K1',
    marketplace: 'FR',
    title: 'Hama Montre connectée GPS',
    url: 'https://www.amazon.fr/dp/B0DG5BP4K1',
    price: details.price,
    condition: details.condition,
    newPrice: details.newPrice,
    code: 'AMAZON',
    label: 'Amazon Seconde main · expédié par Amazon',
    seller: 'Amazon Seconde main',
    ship: 'Amazon'
  });

  assert.match(tgMsg, /💰 <b>Prix :<\/b> <b>16,36 €<\/b> \(Occasion - Comme neuf\)/);
  assert.match(tgMsg, /🎯 <b>Prix d’origine :<\/b> neuf 58,74 €/);
  assert.match(tgMsg, /🔴 <b>Remise :<\/b> -72% 🔥🔥🔥/);
  assert.match(tgMsg, /🚚 <b>Logistique :<\/b> \[AMAZON\] Amazon Seconde main/);
  assert.doesNotMatch(tgMsg, /expédié par Amazon\n/);

  // Formatage Discord
  const discordEmbed = buildDiscordEmbed({
    asin: 'B0DG5BP4K1',
    marketplace: 'FR',
    title: 'Hama Montre connectée GPS',
    url: 'https://www.amazon.fr/dp/B0DG5BP4K1',
    price: details.price,
    condition: details.condition,
    newPrice: details.newPrice,
    code: 'AMAZON',
    label: 'Amazon Seconde main · expédié par Amazon',
    seller: 'Amazon Seconde main',
    ship: 'Amazon'
  });

  const fields2 = discordEmbed.embeds[0].fields;
  const priceField2 = fields2.find(f => f.name.includes('Prix repéré'));
  assert.equal(priceField2.value, '16,36 € (Occasion - Comme neuf)');
  const refField2 = fields2.find(f => f.name.includes('Prix d’origine'));
  assert.equal(refField2.name, '🎯 Prix d’origine');
  assert.equal(refField2.value, 'neuf 58,74 €');
  const dealField2 = fields2.find(f => f.name.includes('Remise'));
  assert.equal(dealField2.name, '🔴 Remise');
  assert.equal(dealField2.value, '-72% 🔥🔥🔥');
  const logField2 = fields2.find(f => f.name.includes('Logistique'));
  assert.equal(logField2.value, '**[AMAZON]** Amazon Seconde main');
  assert.doesNotMatch(logField2.value, /expédié par Amazon/);
});

test('Cas 3 : Produit sans réduction conserve le format épuré', () => {
  const tgMsg = buildTelegramMessage({
    asin: 'B01MTLEKNA',
    marketplace: 'FR',
    title: 'Produit standard',
    url: 'https://www.amazon.fr/dp/B01MTLEKNA',
    price: '29,99 €'
  });
  assert.match(tgMsg, /💰 <b>Prix :<\/b> <b>29,99 €<\/b>/);
  assert.match(tgMsg, /💰 <b>Prix :<\/b> <b>29,99 €<\/b>(?:\n|$)/);

  const discordEmbed = buildDiscordEmbed({
    asin: 'B01MTLEKNA',
    marketplace: 'FR',
    title: 'Produit standard',
    url: 'https://www.amazon.fr/dp/B01MTLEKNA',
    price: '29,99 €'
  });
  const priceField = discordEmbed.embeds[0].fields.find(f => f.name.includes('Prix'));
  assert.equal(priceField.value, '29,99 €');
});
