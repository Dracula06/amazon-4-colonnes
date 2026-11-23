/**
 * Module d'extraction et de validation des codes-barres EAN / GTIN / UPC sur Amazon.
 * Permet de faire la correspondance avec le service BarcodeLookup.
 */

const BARCODE_REGEX = /\b(\d{8}|\d{12}|\d{13}|\d{14})\b/;

/**
 * Valide et extrait une chaîne de code-barres conforme (8, 12, 13 ou 14 chiffres).
 * @param {string|number} raw
 * @returns {string|null}
 */
export function cleanEan(raw) {
  if (!raw && raw !== 0) return null;
  const s = String(raw).replace(/[\s\u00a0\u202f-]/g, '').trim();
  const m = s.match(BARCODE_REGEX);
  return m ? m[1] : null;
}

/**
 * Génère le lien direct vers BarcodeLookup pour un code-barres donné.
 * @param {string} ean
 * @returns {string|null}
 */
export function buildBarcodeLookupUrl(ean) {
  const valid = cleanEan(ean);
  return valid ? `https://www.barcodelookup.com/${valid}` : null;
}

/**
 * Extrait le code EAN/GTIN/UPC depuis un document DOM Amazon.
 * Parcourt les tableaux de spécifications, les listes à puces de détails,
 * l'éventuel conteneur Keepa et les balises structured data.
 * @param {Document|HTMLElement} [rootDoc]
 * @returns {string|null}
 */
export function extractEanFromDom(rootDoc = (typeof document !== 'undefined' ? document : null)) {
  if (!rootDoc) return null;

  // 1. Tableaux de caractéristiques techniques
  const rows = rootDoc.querySelectorAll?.(
    '#productDetails_techSpec_section_1 tr, #productDetails_techSpec_section_2 tr, #prodDetails tr, .prodDetTable tr, #technicalSpecifications_section_1 tr, .techD tr'
  ) || [];

  for (const tr of rows) {
    const th = tr.querySelector?.('th, .prodDetSectionEntry, td:first-child');
    const td = tr.querySelector?.('td, .prodDetAttrValue, td:last-child');
    const label = th?.textContent || '';
    if (/(?:EAN|GTIN|UPC|ISBN(?:-10|-13)?|Code[- ]barres?|Barcode)/i.test(label)) {
      const val = cleanEan(td?.textContent);
      if (val) return val;
    }
  }

  // 2. Liste à puces de détails (detailBullets)
  const bullets = rootDoc.querySelectorAll?.(
    '#detailBullets_feature_div li, [data-feature-name="detailBullets"] li, #detailBulletsWrapper_feature_div li'
  ) || [];

  for (const li of bullets) {
    const text = li.textContent || '';
    if (/(?:EAN|GTIN|UPC|ISBN(?:-10|-13)?|Code[- ]barres?|Barcode)/i.test(text)) {
      const m = text.match(/(?:EAN|GTIN|UPC|ISBN(?:-10|-13)?|Code[- ]barres?|Barcode)\s*[:·-]?\s*([\d\s-]{8,20})/i);
      if (m) {
        const val = cleanEan(m[1]);
        if (val) return val;
      }
    }
  }

  // 3. Éléments Keepa metadata (surimpression, widget ou extension Keepa dans le DOM)
  const keepaCodes = rootDoc.querySelectorAll?.('.productMeta__code, [data-copy], .productMeta__i > span');
  if (keepaCodes) {
    for (const el of keepaCodes) {
      const label = el.querySelector?.('.productMeta__label')?.textContent || el.textContent || '';
      if (/(?:EAN|GTIN|UPC|ISBN|Barcode|Code[- ]barres?)/i.test(label)) {
        const copyAttr = el.getAttribute?.('data-copy');
        const valAttr = el.querySelector?.('.productMeta__value')?.textContent;
        const val = cleanEan(copyAttr || valAttr || el.textContent);
        if (val) return val;
      }
    }
  }

  // 4. Conteneur Keepa injecté (si Keepa extension active)
  const keepaEl = rootDoc.querySelector?.('#keepaContainer, #keepaTable, .keepa-table, #keepaBox, #keepa');
  if (keepaEl) {
    const kText = keepaEl.textContent || '';
    const km = kText.match(/(?:EAN|GTIN|UPC|ISBN|Barcode|Code-barres)\s*[:·-]?\s*([\d\s-]{8,20})/i);
    if (km) {
      const val = cleanEan(km[1]);
      if (val) return val;
    }
  }

  // 5. Balises Script (JSON-LD ou state data)
  const scripts = rootDoc.querySelectorAll?.('script[type="application/ld+json"], script:not([src])') || [];
  for (const s of scripts) {
    const content = s.textContent || '';
    if (content.length > 50000) continue; // Sécurité performance
    if (/(?:gtin|ean|upc)/i.test(content)) {
      const jm = content.match(/"(?:gtin13|gtin14|gtin8|gtin|ean|upc)"\s*:\s*"([\d\s-]{8,20})"/i)
        || content.match(/(?:ean|gtin)\s*[:=]\s*["']([\d\s-]{8,20})["']/i);
      if (jm) {
        const val = cleanEan(jm[1]);
        if (val) return val;
      }
    }
  }

  return null;
}

/**
 * Extrait l'EAN depuis une chaîne HTML brute (fixtures de tests).
 * @param {string} html
 * @returns {string|null}
 */
export function extractEanFromHtml(html) {
  if (!html) return null;
  const s = String(html);
  // Snippet Keepa (surimpression) : data-copy="8719114322503" associé au label EAN
  const keepaMatch = s.match(/data-copy="([\d\s-]{8,20})"[^>]*>[\s\S]{0,100}?<span[^>]*class="[^"]*productMeta__label[^"]*"[^>]*>\s*EAN/i)
    || s.match(/<span[^>]*class="[^"]*productMeta__label[^"]*"[^>]*>\s*EAN[\s\S]{0,120}?data-copy="([\d\s-]{8,20})"/i);
  if (keepaMatch) {
    const val = cleanEan(keepaMatch[1]);
    if (val) return val;
  }

  const m = s.match(/(?:EAN|GTIN|UPC|ISBN(?:-10|-13)?|Code[- ]barres?|Barcode)[\s\S]{1,100}?([\d\s-]{8,20})/i)
    || s.match(/"(?:gtin13|gtin14|gtin8|gtin|ean|upc)"\s*:\s*"([\d\s-]{8,20})"/i);
  return m ? cleanEan(m[1]) : null;
}
