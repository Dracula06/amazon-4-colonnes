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
  assert.equal(first.fields.length, 6);
  assert.equal(first.fields[0].value, '`B01MTLEKNA` (FR)');
  assert.equal(first.fields[1].value, '39,99 €');
  assert.ok(first.fields[2].value.includes('[AMAZON]'));
  assert.ok(first.fields[5].value.includes('2 élément(s)'));
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
