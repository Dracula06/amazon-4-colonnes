import test from 'node:test';
import assert from 'node:assert/strict';
import { isValidDiscordWebhook, buildDiscordEmbed } from '../src/library/discord.js';

test('isValidDiscordWebhook valide les URLs de webhooks officielles', () => {
  assert.equal(isValidDiscordWebhook('https://discord.com/api/webhooks/123456789/AbCdEfGhIjKlMnOpQrStUvWxYz'), true);
  assert.equal(isValidDiscordWebhook('https://discordapp.com/api/webhooks/987654321/secret_token-123'), true);
  assert.equal(isValidDiscordWebhook('https://ptb.discord.com/api/webhooks/111/token'), true);

  assert.equal(isValidDiscordWebhook('https://malicious.com/api/webhooks/123/token'), false);
  assert.equal(isValidDiscordWebhook('javascript:alert(1)'), false);
  assert.equal(isValidDiscordWebhook(''), false);
  assert.equal(isValidDiscordWebhook(null), false);
});

test('buildDiscordEmbed produit une structure d embed Discord conforme', () => {
  const embed = buildDiscordEmbed({
    asin: 'B01MTLEKNA',
    title: 'AquaSonic Hydropulseur Dentaire Sans Fil',
    url: 'https://www.amazon.fr/dp/B01MTLEKNA',
    price: '39,99',
    currencySymbol: '€',
    kind: 'amazon',
    code: 'AMAZON',
    label: 'Vendu et expédié par Amazon',
    seller: 'Amazon',
    ship: 'Amazon',
    injectionsCount: 2
  });

  assert.equal(embed.username, 'Amazon 4 Colonnes');
  assert.equal(embed.embeds.length, 1);
  const first = embed.embeds[0];
  assert.ok(first.title.includes('AquaSonic'));
  assert.equal(first.color, 0x16836B);
  assert.equal(first.fields.length, 8);
  assert.equal(first.fields[0].value, '`B01MTLEKNA` (FR)');
  assert.equal(first.fields[1].value, '39,99 €');
  assert.ok(first.fields[2].value.includes('[AMAZON]'));
  const cb = first.fields.find(f => f.name.includes('Cashback'));
  assert.ok(cb);
  assert.ok(cb.value.includes('Wanteeed'));
  assert.ok(cb.value.includes('Poulpeo'));
  assert.ok(cb.value.includes('iGraal'));
  assert.ok(cb.value.includes('TopCashback'));
  const ext = first.fields.find(f => f.name.includes('Extensions'));
  assert.ok(ext);
  assert.ok(ext.value.includes('VintHelp'));
  assert.ok(ext.value.includes('BoostHelp'));
  const inj = first.fields.find(f => f.name.includes('Composants'));
  assert.ok(inj.value.includes('2 élément(s)'));
});

test('buildDiscordEmbed signale le LOCK pays quand la livraison est bloquée', () => {
  const embed = buildDiscordEmbed({
    asin: 'B0CM6K7FHQ',
    marketplace: 'CO.UK',
    title: 'DOOGEE U10 PRO Android 13 Tablet',
    url: 'https://www.amazon.co.uk/dp/B0CM6K7FHQ',
    price: '22.98',
    currencySymbol: '€',
    kind: 'amazon',
    code: 'AMAZON',
    label: 'Amazon Seconde main · expédié par Amazon',
    seller: 'Amazon Resale',
    ship: 'Amazon',
    shippingRestriction: {
      blocked: true,
      title: 'LOCK pays (.co.uk)',
      explanation: 'Livraison impossible vers l’adresse sélectionnée : offre verrouillée sur Amazon Royaume-Uni (.co.uk), impossible de commander sur une adresse FR / hors Royaume-Uni.',
      detectedMessage: 'This item cannot be shipped to your selected delivery location.'
    }
  });

  const first = embed.embeds[0];
  assert.equal(first.color, 0xDC2626);
  const lockField = first.fields.find(f => f.name.includes('LOCK pays (.co.uk)'));
  assert.ok(lockField);
  assert.ok(lockField.value.includes('adresse FR'));
  assert.ok(lockField.value.includes('cannot be shipped'));
});

test('buildDiscordEmbed formate le prix enrichi Cas 1 (promotion & prix conseillé)', () => {
  const embed = buildDiscordEmbed({
    asin: 'B0CZPNWQFX',
    marketplace: 'FR',
    title: 'adidas Chaussure K',
    url: 'https://www.amazon.fr/dp/B0CZPNWQFX',
    price: '14,25 €',
    discountRate: '-43%',
    referencePrice: 'conseillé 25,00 €',
    code: 'AMAZON',
    label: 'Vendu et expédié par Amazon'
  });

  const fields = embed.embeds[0].fields;
  const priceField = fields.find(f => f.name.includes('Prix repéré'));
  assert.ok(priceField);
  assert.equal(priceField.value, '14,25 €');

  const refField = fields.find(f => f.name.includes('Prix conseillé'));
  assert.ok(refField);
  assert.equal(refField.name, '🎯 Prix conseillé');
  assert.equal(refField.value, '25,00 €');

  const dealField = fields.find(f => f.name.includes('Remise'));
  assert.ok(dealField);
  assert.equal(dealField.name, '🟢 Remise');
  assert.equal(dealField.value, '-43% 🔥');
});

test('buildDiscordEmbed formate le prix enrichi Cas 2 (occasion vs offre neuve) et nettoie la logistique', () => {
  const embed = buildDiscordEmbed({
    asin: 'B0DG5BP4K1',
    marketplace: 'FR',
    title: 'Hama Montre connectée GPS',
    url: 'https://www.amazon.fr/dp/B0DG5BP4K1',
    price: '16,36 €',
    condition: 'Occasion - Comme neuf',
    newPrice: '58,74 €',
    code: 'AMAZON',
    label: 'Amazon Seconde main · expédié par Amazon',
    seller: 'Amazon Seconde main',
    ship: 'Amazon'
  });

  const fields = embed.embeds[0].fields;
  const priceField = fields.find(f => f.name.includes('Prix repéré'));
  assert.ok(priceField);
  assert.equal(priceField.value, '16,36 € (Occasion - Comme neuf)');

  const refField = fields.find(f => f.name.includes('Prix d’origine'));
  assert.ok(refField);
  assert.equal(refField.name, '🎯 Prix d’origine');
  assert.equal(refField.value, 'neuf 58,74 €');

  const dealField = fields.find(f => f.name.includes('Remise'));
  assert.ok(dealField);
  assert.equal(dealField.name, '🔴 Remise');
  assert.equal(dealField.value, '-72% 🔥🔥🔥');

  const logField = fields.find(f => f.name.includes('Logistique'));
  assert.ok(logField);
  assert.equal(logField.value, '**[AMAZON]** Amazon Seconde main');
  assert.doesNotMatch(logField.value, /expédié par Amazon/);
});
