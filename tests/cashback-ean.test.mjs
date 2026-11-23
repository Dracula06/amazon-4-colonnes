import test from 'node:test';
import assert from 'node:assert/strict';

import {
  DEFAULT_CASHBACK_CONFIG,
  DEFAULT_EXTENSIONS_CONFIG,
  parseWanteeedRateFromHtml,
  buildTelegramCashbackLines,
  buildTelegramExtensionsLines,
  buildDiscordCashbackField,
  buildDiscordExtensionsField
} from '../src/library/cashback.js';

import {
  cleanEan,
  buildBarcodeLookupUrl,
  extractEanFromHtml,
  extractEanFromDom
} from '../src/library/ean.js';

import { buildTelegramMessage } from '../src/library/telegram.js';
import { buildDiscordEmbed } from '../src/library/discord.js';

test('parseWanteeedRateFromHtml extrait correctement le taux de cashback Amazon', () => {
  const userSnippet = `
    <h2><span class="w-6 h-5 inline-block">
      <i class="sprite sprite-sm sprite-white-right-pointing-backhand-index"></i>
    </span> Jusqu'à <em>1,5&nbsp;%</em> <em>de</em> <em>cashback</em> chez <em>Amazon</em></h2>
  `;
  assert.equal(parseWanteeedRateFromHtml(userSnippet), '1,5%');

  const curlSnippet = `Jusqu&#39;à <em>1,5 %</em> <em>de</em> <em>cashback</em> chez <em>Amazon</em></h2>`;
  assert.equal(parseWanteeedRateFromHtml(curlSnippet), '1,5%');

  const paragraphSnippet = `<p>Pour faire des économies, achetez sur Amazon et percevez jusqu’à 2,0 % de cashback.</p>`;
  assert.equal(parseWanteeedRateFromHtml(paragraphSnippet), '2,0%');

  assert.equal(parseWanteeedRateFromHtml(''), '1,5%');
  assert.equal(parseWanteeedRateFromHtml(null), '1,5%');
});

test('buildTelegramCashbackLines formate Wanteeed, Poulpeo, iGraal et TopCashback en liens hypertextes sans URL brutes', () => {
  const lines = buildTelegramCashbackLines();
  assert.equal(lines.length, 4);

  // Wanteeed
  assert.match(lines[0], /<a href="https:\/\/wanteeed\.com\/join\/5e2977dce7a94e7186be8e58c6d9141b"><b>Wanteeed<\/b><\/a> : jusqu’à 1,5% de cashback/);

  // Poulpeo
  assert.match(lines[1], /<a href="https:\/\/www\.poulpeo\.com\/p\/o039ab"><b>Poulpeo<\/b><\/a> : 5€ offerts au 1er cashback/);

  // iGraal
  assert.match(lines[2], /<a href="https:\/\/fr\.igraal\.com\/parrainage\?parrain=bleachcore&(?:amp;)?utm_medium=raf&(?:amp;)?utm_source=refer_friend"><b>iGraal<\/b><\/a> : 3€ offerts/);

  // TopCashback
  assert.match(lines[3], /<a href="https:\/\/www\.topcashback\.fr\/ref\/dracoule"><b>TopCashback<\/b><\/a>/);

  // Vérifie l'absence d'URL brute apparente hors balise <a href="...">
  for (const line of lines) {
    const stripped = line.replace(/<a\s+href="[^"]*">/gi, '').replace(/<\/a>/gi, '');
    assert.doesNotMatch(stripped, /https?:\/\//);
  }
});

test('buildTelegramExtensionsLines formate VintHelp et BoostHelp en liens hypertextes épurés', () => {
  const lines = buildTelegramExtensionsLines();
  assert.equal(lines.length, 2);

  // VintHelp
  assert.match(lines[0], /<a href="https:\/\/chromewebstore\.google\.com\/detail\/vinthelp\/kjkbijmnpmphddjhjkilaobilleokmkg"><b>VintHelp<\/b><\/a> : gestion dressing Vinted/);

  // BoostHelp
  assert.match(lines[1], /<a href="https:\/\/chromewebstore\.google\.com\/detail\/boosthelp\/flfbfonaffaokkifdnpkgkaiaadcfcin"><b>BoostHelp<\/b><\/a> : boosts de favoris Vinted/);

  for (const line of lines) {
    const stripped = line.replace(/<a\s+href="[^"]*">/gi, '').replace(/<\/a>/gi, '');
    assert.doesNotMatch(stripped, /https?:\/\//);
  }
});

test('buildDiscordCashbackField produit un champ structuré avec markdown hyperlinks dont TopCashback', () => {
  const field = buildDiscordCashbackField();
  assert.ok(field);
  assert.equal(field.name, '💸 Cashback & Parrainages');
  assert.match(field.value, /\[\*\*Wanteeed\*\*\]\(https:\/\/wanteeed\.com\/join\/5e2977dce7a94e7186be8e58c6d9141b\)/);
  assert.match(field.value, /\[\*\*Poulpeo\*\*\]\(https:\/\/www\.poulpeo\.com\/p\/o039ab\)/);
  assert.match(field.value, /\[\*\*iGraal\*\*\]\(https:\/\/fr\.igraal\.com\/parrainage\?parrain=bleachcore/);
  assert.match(field.value, /\[\*\*TopCashback\*\*\]\(https:\/\/www\.topcashback\.fr\/ref\/dracoule\)/);
  assert.equal(field.inline, false);
});

test('buildDiscordExtensionsField produit un champ structuré avec les extensions recommandées', () => {
  const field = buildDiscordExtensionsField();
  assert.ok(field);
  assert.equal(field.name, '🧩 Extensions recommandées');
  assert.match(field.value, /\[\*\*VintHelp\*\*\]\(https:\/\/chromewebstore\.google\.com\/detail\/vinthelp\/kjkbijmnpmphddjhjkilaobilleokmkg\) : gestion dressing Vinted/);
  assert.match(field.value, /\[\*\*BoostHelp\*\*\]\(https:\/\/chromewebstore\.google\.com\/detail\/boosthelp\/flfbfonaffaokkifdnpkgkaiaadcfcin\) : boosts de favoris Vinted/);
  assert.equal(field.inline, false);
});

test('cleanEan valide les formats 8, 12, 13 et 14 chiffres et nettoie les séparateurs', () => {
  // Cas utilisateur Calvin Klein B077BCXB6H
  assert.equal(cleanEan('8719114322510'), '8719114322510');
  assert.equal(cleanEan('8719-114-322510'), '8719114322510');
  assert.equal(cleanEan('8719 114 322510'), '8719114322510');
  assert.equal(cleanEan('8719114322510 '), '8719114322510');

  // Autres formats valides
  assert.equal(cleanEan('12345678'), '12345678');       // EAN-8
  assert.equal(cleanEan('012345678905'), '012345678905'); // UPC-A
  assert.equal(cleanEan('00012345678905'), '00012345678905'); // GTIN-14

  // Invalides
  assert.equal(cleanEan(''), null);
  assert.equal(cleanEan(null), null);
  assert.equal(cleanEan('abc'), null);
  assert.equal(cleanEan('12345'), null);
});

test('buildBarcodeLookupUrl génère le lien exact demandé pour l EAN', () => {
  assert.equal(
    buildBarcodeLookupUrl('8719114322510'),
    'https://www.barcodelookup.com/8719114322510'
  );
  assert.equal(buildBarcodeLookupUrl(null), null);
});

test('extractEanFromHtml extrait l EAN depuis différentes structures HTML', () => {
  // Table de détails techniques
  const htmlTable = `
    <table id="productDetails_techSpec_section_1">
      <tr><th>EAN</th><td>8719114322510</td></tr>
    </table>
  `;
  assert.equal(extractEanFromHtml(htmlTable), '8719114322510');

  // Liste à puces de détails
  const htmlBullets = `
    <div id="detailBullets_feature_div">
      <li><span>Code-barres : 8719114322510</span></li>
    </div>
  `;
  assert.equal(extractEanFromHtml(htmlBullets), '8719114322510');

  // JSON-LD
  const htmlJson = `<script type="application/ld+json">{"@context":"https://schema.org","@type":"Product","gtin13":"8719114322510"}</script>`;
  assert.equal(extractEanFromHtml(htmlJson), '8719114322510');

  // Livre avec ISBN-13
  const htmlIsbn = `
    <div id="detailBullets_feature_div">
      <li><span class="a-list-item"><span class="a-text-bold">ISBN-13 : </span><span>978-2070360024</span></span></li>
    </div>
  `;
  assert.equal(extractEanFromHtml(htmlIsbn), '9782070360024');

  // Snippet Keepa réel fourni par l'utilisateur (Calvin Klein B077BCXB6H)
  const keepaSnippet = `<span class="productMeta__i"><span class="productMeta__code" role="button" tabindex="0" data-copy="B077BCXB6H" title="Copier"><span><span class="productMeta__label">ASIN </span><span class="productMeta__value">B077BCXB6H</span></span><i class="icon icon-files-o" aria-hidden="true"></i></span><span class="productMeta__code" role="button" tabindex="0" data-copy="8719114322503" title="Copier"><span><span class="productMeta__label">EAN </span><span class="productMeta__value">8719114322503</span></span><i class="icon icon-files-o" aria-hidden="true"></i></span></span>`;
  assert.equal(extractEanFromHtml(keepaSnippet), '8719114322503');
});

test('extractEanFromDom extrait l EAN depuis un élément DOM de Keepa (surimpression ou widget)', () => {
  const mockDoc = {
    querySelectorAll(selector) {
      if (selector.includes('.productMeta__code')) {
        return [
          {
            querySelector(sel) {
              if (sel === '.productMeta__label') return { textContent: 'ASIN ' };
              if (sel === '.productMeta__value') return { textContent: 'B077BCXB6H' };
              return null;
            },
            getAttribute(attr) {
              if (attr === 'data-copy') return 'B077BCXB6H';
              return null;
            },
            textContent: 'ASIN B077BCXB6H'
          },
          {
            querySelector(sel) {
              if (sel === '.productMeta__label') return { textContent: 'EAN ' };
              if (sel === '.productMeta__value') return { textContent: '8719114322503' };
              return null;
            },
            getAttribute(attr) {
              if (attr === 'data-copy') return '8719114322503';
              return null;
            },
            textContent: 'EAN 8719114322503'
          }
        ];
      }
      return [];
    },
    querySelector() { return null; }
  };
  assert.equal(extractEanFromDom(mockDoc), '8719114322503');
});

test('extractEanFromDom extrait l EAN depuis le conteneur Keepa #keepaContainer', () => {
  const mockDoc = {
    querySelectorAll() { return []; },
    querySelector(sel) {
      if (sel.includes('#keepaContainer')) {
        return { textContent: 'Keepa details EAN: 8719114322503 New: €19.90' };
      }
      return null;
    }
  };
  assert.equal(extractEanFromDom(mockDoc), '8719114322503');
});

test('buildTelegramMessage intègre EAN BarcodeLookup, Cashback et supprime le footer', () => {
  const msg = buildTelegramMessage({
    asin: 'B077BCXB6H',
    marketplace: 'FR',
    title: 'Calvin Klein Caleçon Homme',
    url: 'https://www.amazon.fr/dp/B077BCXB6H',
    price: '29,90 €',
    ean: '8719114322510',
    code: 'AMAZON',
    label: 'Vendu et expédié par Amazon',
    seller: 'Amazon',
    ship: 'Amazon'
  });

  // 1. Suppression du footer demandé
  assert.doesNotMatch(msg, /Amazon Inspector • Extension 4 Colonnes/i);

  // 2. Lien EAN BarcodeLookup
  assert.match(msg, /🔍 <b>EAN :<\/b> <a href="https:\/\/www\.barcodelookup\.com\/8719114322510"><code>8719114322510<\/code><\/a>/);

  // 3. Liens de cashback
  assert.match(msg, /Wanteeed/);
  assert.match(msg, /Poulpeo/);
  assert.match(msg, /iGraal/);
  assert.match(msg, /TopCashback/);
  assert.match(msg, /5€ offerts/);
  assert.match(msg, /3€ offerts/);

  // 4. Extensions recommandées
  assert.match(msg, /VintHelp/);
  assert.match(msg, /BoostHelp/);
  assert.match(msg, /gestion dressing Vinted/);
  assert.match(msg, /boosts de favoris Vinted/);

  // 5. Séparation nette des blocs
  assert.match(msg, /Voir l’offre sur Amazon<\/b><\/a>\n\n💸/);
  assert.match(msg, /TopCashback<\/b><\/a>[^\n]*\n\n👗/);
});

test('buildDiscordEmbed intègre le champ EAN, le champ Cashback et les Extensions, sans le footer inspector', () => {
  const embed = buildDiscordEmbed({
    asin: 'B077BCXB6H',
    marketplace: 'FR',
    title: 'Calvin Klein Caleçon Homme',
    url: 'https://www.amazon.fr/dp/B077BCXB6H',
    price: '29,90 €',
    ean: '8719114322510',
    code: 'AMAZON',
    label: 'Vendu et expédié par Amazon'
  });

  const fields = embed.embeds[0].fields;

  // EAN
  const eanField = fields.find(f => f.name.includes('EAN'));
  assert.ok(eanField);
  assert.equal(eanField.value, '[`8719114322510`](https://www.barcodelookup.com/8719114322510)');

  // Cashback
  const cbField = fields.find(f => f.name.includes('Cashback'));
  assert.ok(cbField);
  assert.ok(cbField.value.includes('Wanteeed'));
  assert.ok(cbField.value.includes('Poulpeo'));
  assert.ok(cbField.value.includes('iGraal'));
  assert.ok(cbField.value.includes('TopCashback'));

  // Extensions
  const extField = fields.find(f => f.name.includes('Extensions'));
  assert.ok(extField);
  assert.ok(extField.value.includes('VintHelp'));
  assert.ok(extField.value.includes('BoostHelp'));

  // Footer vérifié sans Amazon Inspector
  assert.doesNotMatch(embed.embeds[0].footer.text, /Amazon Inspector/i);
});
