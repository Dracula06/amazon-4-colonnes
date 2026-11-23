import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  escapeTelegramHtml,
  cleanAffiliateUrl,
  isValidTelegramToken,
  isValidTelegramChatId,
  buildTelegramMessage,
  sendTelegramMessage
} from '../src/library/telegram.js';

test('escapeTelegramHtml neutralise les balises et caractères spéciaux', () => {
  assert.equal(escapeTelegramHtml('MacBook Pro <M3> & "Accessories"'), 'MacBook Pro &lt;M3&gt; &amp; &quot;Accessories&quot;');
  assert.equal(escapeTelegramHtml(null), '');
});

test('isValidTelegramToken valide la structure du token BotFather', () => {
  assert.equal(isValidTelegramToken('123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ12345678'), true);
  assert.equal(isValidTelegramToken('9876543210:AAFlkwje0923u4lkjsd-09234lkjsdf'), true);
  assert.equal(isValidTelegramToken(''), false);
  assert.equal(isValidTelegramToken('invalid_token'), false);
  assert.equal(isValidTelegramToken('12345:short'), false);
});

test('isValidTelegramChatId valide les identifiants @canal et ID numériques', () => {
  assert.equal(isValidTelegramChatId('@mon_canal_deals'), true);
  assert.equal(isValidTelegramChatId('-1001234567890'), true);
  assert.equal(isValidTelegramChatId('123456789'), true);
  assert.equal(isValidTelegramChatId(123456789), true);
  assert.equal(isValidTelegramChatId(''), false);
  assert.equal(isValidTelegramChatId('@a'), false); // trop court
  assert.equal(isValidTelegramChatId('abc'), false); // pas de @ ni numérique
});

test('buildTelegramMessage formate une fiche produit complète', () => {
  const msg = buildTelegramMessage({
    asin: 'B0DL6KSW78',
    marketplace: 'DE',
    title: 'Apple Magic Mouse - Blanc',
    url: 'https://www.amazon.de/dp/B0DL6KSW78?tag=test-21',
    price: '34,90',
    currencySymbol: '€',
    code: 'AMAZON',
    label: 'Vendu et expédié par Amazon',
    seller: 'Amazon',
    ship: 'Amazon',
    shippingRestriction: {
      blocked: true,
      title: 'LOCK pays',
      explanation: 'Livraison impossible en France'
    }
  });

  assert.match(msg, /Apple Magic Mouse/);
  assert.match(msg, /<code>B0DL6KSW78<\/code>/);
  assert.match(msg, /34,90 €/);
  assert.match(msg, /\[AMAZON\]/);
  assert.match(msg, /LOCK pays/);
  assert.match(msg, /https:\/\/www\.amazon\.de\/dp\/B0DL6KSW78\?tag=test-21/);
});

test('cleanAffiliateUrl nettoie les paramètres superflus et préserve tag', () => {
  assert.equal(
    cleanAffiliateUrl('https://www.amazon.fr/dp/B0DG5BP4K1?th=1&tag=11030fd1-21'),
    'https://www.amazon.fr/dp/B0DG5BP4K1?tag=11030fd1-21'
  );
  assert.equal(
    cleanAffiliateUrl('https://www.amazon.fr/dp/B0DG5BP4K1/ref=dp_olp_ALL_mbc?psc=1&tag=monid-21&pf_rd_r=XYZ'),
    'https://www.amazon.fr/dp/B0DG5BP4K1?tag=monid-21'
  );
  assert.equal(
    cleanAffiliateUrl('https://link.amazon/B04WuMFom'),
    'https://link.amazon/B04WuMFom'
  );
});

test('buildTelegramMessage formate un lien épuré cliquable Voir l offre sur Amazon', () => {
  const msg = buildTelegramMessage({
    asin: 'B0DG5BP4K1',
    marketplace: 'FR',
    title: 'Hama Montre connectée GPS',
    url: 'https://www.amazon.fr/dp/B0DG5BP4K1?th=1&tag=11030fd1-21',
    price: '16,36 €'
  });

  assert.match(msg, /🔗 <a href="https:\/\/www\.amazon\.fr\/dp\/B0DG5BP4K1\?tag=11030fd1-21"><b>Voir l’offre sur Amazon<\/b><\/a>/);
  assert.doesNotMatch(msg, /🔗 <b>Lien :<\/b>/);
  assert.doesNotMatch(msg, /th=1/);
});

test('buildTelegramMessage formate correctement le prix d occasion et évite les doublons de symbole devise', () => {
  const msg = buildTelegramMessage({
    asin: 'B0DG5BP4K1',
    marketplace: 'FR',
    title: 'Hama Montre connectée GPS',
    url: 'https://www.amazon.fr/dp/B0DG5BP4K1',
    price: '16,36 €',
    condition: 'Occasion - Comme neuf',
    currencySymbol: '€',
    seller: 'Amazon Seconde main',
    ship: 'Amazon'
  });

  assert.match(msg, /16,36 €<\/b> \(Occasion - Comme neuf\)/);
  assert.doesNotMatch(msg, /€\s*€/);
  assert.match(msg, /🏬 <b>Vendeur :<\/b> Amazon Seconde main/);
});

test('buildTelegramMessage gère proprement un prix contenant déjà l état sans doublon', () => {
  const msg = buildTelegramMessage({
    asin: 'B0DG5BP4K1',
    marketplace: 'FR',
    title: 'Hama Montre connectée GPS',
    url: 'https://www.amazon.fr/dp/B0DG5BP4K1',
    price: '16,36 € (Occasion - Comme neuf)',
    currencySymbol: '€',
    seller: 'Amazon Seconde main',
    ship: 'Amazon'
  });

  assert.match(msg, /💰 <b>Prix :<\/b> <b>16,36 € \(Occasion - Comme neuf\)<\/b>/);
  assert.doesNotMatch(msg, /\(Occasion - Comme neuf\)\s*\(Occasion - Comme neuf\)/);
  assert.doesNotMatch(msg, /Prix :<\/b>[^(]*\(Amazon Seconde main\)/);
});

test('Fixture FR B0DG5BP4K1 : détection de l accordéon Occasion - Comme neuf et formatage Telegram', () => {
  const fixtureDir = fileURLToPath(new URL('../bibliotheque-pages/FR/B0DG5BP4K1/2026-11-23T16-36-41-833Z-0b1dea5f-b892-4c30-83f6-e06d17084b9d', import.meta.url));
  const files = readdirSync(fixtureDir).filter(f => f.startsWith('part-')).sort();
  let html = '';
  for (const f of files) {
    const c = JSON.parse(readFileSync(join(fixtureDir, f), 'utf8'));
    html += c.data || '';
  }

  const match = html.match(/data-csa-c-slot-id=\\?["']usedAccordionRow\\?["'][^>]*aria-expanded=\\?["']true\\?["'][\s\S]*?<div id=\\?["']usedAccordionCaption_feature_div\\?["'][\s\S]*?<span class=\\?["']a-text-bold\\?["']>([^<]+)<\/span>/i);
  assert.ok(match, 'Le bloc accordéon Occasion - Comme neuf doit être actif avec aria-expanded="true"');
  assert.equal(match[1].trim(), 'Occasion - Comme neuf');

  const msg = buildTelegramMessage({
    asin: 'B0DG5BP4K1',
    marketplace: 'FR',
    title: 'Hama Montre connectée GPS',
    url: 'https://www.amazon.fr/dp/B0DG5BP4K1',
    price: '16,36 € (' + match[1].trim() + ')',
    seller: 'Amazon Seconde main',
    ship: 'Amazon'
  });

  assert.match(msg, /💰 <b>Prix :<\/b> <b>16,36 € \(Occasion - Comme neuf\)<\/b>/);
  assert.match(msg, /🏬 <b>Vendeur :<\/b> Amazon Seconde main/);
  assert.doesNotMatch(msg, /Prix :<\/b>[^(]*\(Amazon Seconde main\)/);
});

test('buildTelegramMessage formate le prix enrichi Cas 1 (promotion & prix conseillé)', () => {
  const msg = buildTelegramMessage({
    asin: 'B0CZPNWQFX',
    marketplace: 'FR',
    title: 'adidas Chaussure K',
    url: 'https://www.amazon.fr/dp/B0CZPNWQFX',
    price: '14,25 €',
    discountRate: '-43%',
    referencePrice: 'conseillé 25,00 €'
  });

  assert.match(msg, /💰 <b>Prix :<\/b> <b>14,25 €<\/b>/);
  assert.match(msg, /🎯 <b>Prix conseillé :<\/b> 25,00 €/);
  assert.match(msg, /🟢 <b>Remise :<\/b> -43% 🔥/);
});

test('buildTelegramMessage formate le prix enrichi Cas 2 (occasion vs offre neuve) et nettoie la logistique', () => {
  const msg = buildTelegramMessage({
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

  assert.match(msg, /💰 <b>Prix :<\/b> <b>16,36 €<\/b> \(Occasion - Comme neuf\)/);
  assert.match(msg, /🎯 <b>Prix d’origine :<\/b> neuf 58,74 €/);
  assert.match(msg, /🔴 <b>Remise :<\/b> -72% 🔥🔥🔥/);
  assert.match(msg, /🚚 <b>Logistique :<\/b> \[AMAZON\] Amazon Seconde main/);
  assert.doesNotMatch(msg, /expédié par Amazon\n/);
});

test('sendTelegramMessage valide les paramètres avant fetch', async () => {
  await assert.rejects(
    () => sendTelegramMessage({ token: 'bad', chatId: '123', text: 'hello' }),
    /Jeton de Bot Telegram invalide/
  );
  await assert.rejects(
    () => sendTelegramMessage({ token: '123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ12345678', chatId: 'bad', text: 'hello' }),
    /Chat ID Telegram invalide/
  );
});
