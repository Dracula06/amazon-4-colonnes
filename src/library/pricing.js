/**
 * Module d'analyse et de formatage des prix, promotions et prix de référence Amazon.
 * Gère les réductions produits neufs (prix conseillé / récent) et occasions vs offre neuve.
 */

/**
 * Extrait une valeur numérique flottante depuis une chaîne de prix multi-devises.
 * Gère les séparateurs décimaux (virgule et point) ainsi que les espaces insécables.
 * @param {string|number} str
 * @returns {number|null}
 */
export function parsePriceNumber(str) {
  if (typeof str === 'number') return Number.isFinite(str) ? str : null;
  if (!str) return null;
  const match = String(str).match(/[\d\s.,\u00a0\u202f]+/);
  if (!match) return null;
  let s = match[0].replace(/[\s\u00a0\u202f]/g, '');
  if (s.includes(',') && s.includes('.')) {
    if (s.lastIndexOf(',') > s.lastIndexOf('.')) {
      s = s.replace(/\./g, '').replace(',', '.');
    } else {
      s = s.replace(/,/g, '');
    }
  } else if (s.includes(',')) {
    s = s.replace(',', '.');
  }
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : null;
}

/**
 * Normalise un taux de réduction au format standard "-XX%".
 * @param {string|number} raw
 * @returns {string|null}
 */
export function normalizeDiscountRate(raw) {
  if (!raw) return null;
  const s = String(raw).replace(/&nbsp;/g, ' ').replace(/\u00a0/g, ' ').trim();
  const m = s.match(/-?\s*(\d+)\s*%/);
  if (m) return `-${m[1]}%`;
  const num = s.match(/\d+/);
  if (num) return `-${num[0]}%`;
  return null;
}

/**
 * Calcule automatiquement le taux de réduction par rapport au prix de référence/neuf :
 * Math.round(((basePrice - currentPrice) / basePrice) * 100)
 * @param {string|number} currentPrice
 * @param {string|number} basePrice
 * @returns {string|null} ex: "-72%"
 */
export function computeDiscountRate(currentPrice, basePrice) {
  const pCur = parsePriceNumber(currentPrice);
  const pBase = parsePriceNumber(basePrice);
  if (pCur && pBase && pBase > pCur) {
    const pct = Math.round(((pBase - pCur) / pBase) * 100);
    return `-${pct}%`;
  }
  return null;
}

/**
 * Nettoie et qualifie un prix de référence (prix conseillé ou le plus bas récent).
 * Format cible : "conseillé 25,00 €" ou "récent 11,99 €" ou "le plus bas récent 11,99 €".
 * @param {string} raw
 * @param {string} [valueFallback]
 * @returns {string|null}
 */
export function cleanReferencePrice(raw, valueFallback) {
  if (!raw && !valueFallback) return null;
  let s = String(raw || '').replace(/&nbsp;/g, ' ').replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();

  // Déjà sous forme "conseillé XX,XX €" ou "récent XX,XX €"
  if (/^conseill[eé]\s+\d/i.test(s)) {
    return s.replace(/^conseill[eé]\s+/i, 'conseillé ').replace(/(\d)\s*([€$£¥])/g, '$1 $2');
  }
  if (/^r[eé]cent\s+\d/i.test(s)) {
    return s.replace(/^r[eé]cent\s+/i, 'récent ').replace(/(\d)\s*([€$£¥])/g, '$1 $2');
  }
  if (/^le\s+plus\s+bas\s+r[eé]cent\s+\d/i.test(s)) {
    return s.replace(/^le\s+plus\s+bas\s+r[eé]cent\s+/i, 'le plus bas récent ').replace(/(\d)\s*([€$£¥])/g, '$1 $2');
  }

  let priceMatch = s.match(/(\d[\d\s.,\u00a0\u202f]*\s*[€$£¥]|\b(?:EUR|GBP|USD)\s*[\d.,]+)/i);
  let priceVal = priceMatch ? priceMatch[0].trim() : (valueFallback ? String(valueFallback).trim() : '');
  priceVal = priceVal.replace(/(\d)\s*([€$£¥])/g, '$1 $2');

  if (!priceVal && s) {
    const num = s.match(/[\d.,]+/);
    if (num) priceVal = num[0].replace('.', ',') + ' €';
  }
  if (!priceVal) return null;

  let label = 'conseillé';
  if (/conseill[eé]|recommand|rrp|uvp|pvpr|recommended/i.test(s)) {
    label = 'conseillé';
  } else if (/plus\s+bas|30\s+derniers|lowest|was|statt|anterior/i.test(s)) {
    label = /plus\s+bas/i.test(s) ? 'le plus bas récent' : 'récent';
  } else if (/r[eé]cent/i.test(s)) {
    label = 'récent';
  } else if (/neuf|new/i.test(s)) {
    label = 'neuf';
  } else {
    const cleaned = s
      .replace(priceVal, '')
      .replace(/^(?:prix|prezzo|precio|price)\s*/i, '')
      .replace(/[:·-]\s*$/, '')
      .trim()
      .toLowerCase();
    if (cleaned) label = cleaned;
  }

  return `${label} ${priceVal}`.trim();
}

/**
 * Nettoie le libellé logistique pour éliminer les répétitions d'expéditeur.
 * Exemple : "Amazon Seconde main · expédié par Amazon" -> "Amazon Seconde main"
 * @param {string} label
 * @param {string} [ship]
 * @returns {string}
 */
export function cleanLogisticsLabel(label, ship) {
  if (!label) return 'Expéditeur non identifié';
  let s = String(label).trim();
  s = s.replace(/\s*·\s*(?:exp[ée]di[ée]\s+par|shipped\s+by|dispatched\s+by|versand\s+durch|enviado\s+por|spedito\s+da)\s+.*$/i, '').trim();
  return s || label;
}

/**
 * Détermine le palier de deal, la couleur et les flammes associées à un taux de réduction.
 * Paliers définis :
 * - 71%+ : ROUGE VIF (#dc2626) avec 3 flammes 🔥🔥🔥 et badge 🔴
 * - 51% à 70% : ORANGE (#ea580c) avec 2 flammes 🔥🔥 et badge 🟠
 * - 1% à 50% : VERT (#16a34a) avec 1 flamme 🔥 et badge 🟢
 * @param {string|number} discountRate
 * @returns {{ percentage: number, rateStr: string, badge: string, flames: string, color: string, tier: 'high'|'medium'|'low', formattedText: string, formattedLineTelegram: string, formattedLineDiscord: string }|null}
 */
export function getDiscountDealInfo(discountRate) {
  if (!discountRate && discountRate !== 0) return null;
  const match = String(discountRate).match(/(\d+)/);
  if (!match) return null;
  const percentage = parseInt(match[1], 10);
  if (percentage <= 0) return null;

  const rateStr = `-${percentage}%`;

  if (percentage >= 71) {
    return {
      percentage,
      rateStr,
      badge: '🔴',
      flames: '🔥🔥🔥',
      color: '#dc2626',
      tier: 'high',
      formattedText: `${rateStr} 🔥🔥🔥`,
      formattedLineTelegram: `🔴 <b>Remise :</b> ${rateStr} 🔥🔥🔥`,
      formattedLineDiscord: `🔴 **Remise :** ${rateStr} 🔥🔥🔥`
    };
  } else if (percentage >= 51) {
    return {
      percentage,
      rateStr,
      badge: '🟠',
      flames: '🔥🔥',
      color: '#ea580c',
      tier: 'medium',
      formattedText: `${rateStr} 🔥🔥`,
      formattedLineTelegram: `🟠 <b>Remise :</b> ${rateStr} 🔥🔥`,
      formattedLineDiscord: `🟠 **Remise :** ${rateStr} 🔥🔥`
    };
  } else {
    return {
      percentage,
      rateStr,
      badge: '🟢',
      flames: '🔥',
      color: '#16a34a',
      tier: 'low',
      formattedText: `${rateStr} 🔥`,
      formattedLineTelegram: `🟢 <b>Remise :</b> ${rateStr} 🔥`,
      formattedLineDiscord: `🟢 **Remise :** ${rateStr} 🔥`
    };
  }
}

/**
 * Analyse et structure le prix de référence ou le prix d'origine neuf pour l'affichage multi-lignes.
 * Gère le prix conseillé (Cas 1) et le prix neuf d'origine (Cas 2).
 * @param {object} options
 * @param {string} [options.referencePrice]
 * @param {string} [options.newPrice]
 * @param {string} [options.currencySymbol]
 * @returns {{ label: string, value: string, emoji: string, formattedLineTelegram: string, formattedLineDiscord: string }|null}
 */
export function getReferencePriceInfo({ referencePrice, newPrice, currencySymbol = '€' } = {}) {
  const sym = currencySymbol || '€';

  if (newPrice) {
    const cleanNew = String(newPrice).replace(/&nbsp;/g, ' ').replace(/\u00a0/g, ' ').trim().replace(/(\d)\s*([€$£¥])/g, '$1 $2');
    const newWithSym = /[€$£¥]|\b(?:EUR|GBP|USD)\b/i.test(cleanNew) ? cleanNew : `${cleanNew} ${sym}`;
    const value = `neuf ${newWithSym}`;
    const label = 'Prix d’origine';
    return {
      label,
      value,
      emoji: '🎯',
      formattedLineTelegram: `🎯 <b>${label} :</b> ${value}`,
      formattedLineDiscord: `🎯 **${label} :** ${value}`
    };
  }

  if (referencePrice) {
    const cleaned = cleanReferencePrice(referencePrice);
    if (!cleaned) return null;

    let label = 'Prix conseillé';
    let val = cleaned;

    if (/^conseill[eé]\s+/i.test(cleaned)) {
      label = 'Prix conseillé';
      val = cleaned.replace(/^conseill[eé]\s+/i, '');
    } else if (/^le\s+plus\s+bas\s+r[eé]cent\s+/i.test(cleaned)) {
      label = 'Prix le plus bas récent';
      val = cleaned.replace(/^le\s+plus\s+bas\s+r[eé]cent\s+/i, '');
    } else if (/^r[eé]cent\s+/i.test(cleaned)) {
      label = 'Prix récent';
      val = cleaned.replace(/^r[eé]cent\s+/i, '');
    } else if (/^neuf\s+/i.test(cleaned)) {
      label = 'Prix d’origine';
      val = `neuf ${cleaned.replace(/^neuf\s+/i, '')}`;
    } else {
      label = 'Prix de référence';
    }

    return {
      label,
      value: val,
      emoji: '🎯',
      formattedLineTelegram: `🎯 <b>${label} :</b> ${val}`,
      formattedLineDiscord: `🎯 **${label} :** ${val}`
    };
  }

  return null;
}

/**
 * Formate le prix complet enrichi selon les 3 cas :
 * 1. Neuf avec promotion : "14,25 € (-43% · conseillé 25,00 €)"
 * 2. Occasion avec offre neuve : "16,36 € (Occasion - Comme neuf · -72% vs neuf 58,74 €)"
 * 3. Sans réduction : "XX,XX €" (ou "16,36 € (Occasion - Comme neuf)" si occasion sans prix neuf)
 * @param {object} options
 * @param {string|number} options.price
 * @param {string} [options.condition]
 * @param {string|number} [options.discountRate]
 * @param {string} [options.referencePrice]
 * @param {string} [options.newPrice]
 * @param {string} [options.currencySymbol]
 * @returns {string|null}
 */
export function formatEnrichedPrice({ price, condition, discountRate, referencePrice, newPrice, currencySymbol = '€' } = {}) {
  if (!price) return null;
  const rawPrice = String(price).trim();
  const hasSymbol = /[€$£¥]|\b(?:EUR|GBP|USD)\b/i.test(rawPrice);
  const sym = currencySymbol || '€';
  let baseFormatted = hasSymbol ? rawPrice : `${rawPrice} ${sym}`.trim();
  baseFormatted = baseFormatted.replace(/(\d)\s*([€$£¥])/g, '$1 $2');

  // Si baseFormatted se termine déjà par des parenthèses
  let existingParens = null;
  const pMatch = baseFormatted.match(/\s*\(([^)]+)\)$/);
  if (pMatch) {
    existingParens = pMatch[1];
    baseFormatted = baseFormatted.replace(/\s*\([^)]+\)$/, '').trim();
  }

  const parts = [];

  // 1. Condition (ex: Occasion - Comme neuf)
  const cond = condition || (existingParens && /occasion|reconditionn|used|seconde/i.test(existingParens) ? existingParens : null);

  // 2. Cas 2 : Offre d'occasion avec comparaison neuf
  if (newPrice) {
    if (cond) parts.push(cond);
    let rate = normalizeDiscountRate(discountRate);
    if (!rate) {
      rate = computeDiscountRate(baseFormatted, newPrice);
    }
    const cleanNew = String(newPrice).replace(/&nbsp;/g, ' ').replace(/\u00a0/g, ' ').trim().replace(/(\d)\s*([€$£¥])/g, '$1 $2');
    const newWithSym = /[€$£¥]|\b(?:EUR|GBP|USD)\b/i.test(cleanNew) ? cleanNew : `${cleanNew} ${sym}`;
    if (rate) {
      parts.push(`${rate} vs neuf ${newWithSym}`);
    } else {
      parts.push(`vs neuf ${newWithSym}`);
    }
  } else {
    // 3. Cas 1 : Produit neuf (ou sans newPrice) avec promotion / prix de référence
    if (cond) parts.push(cond);
    const rate = normalizeDiscountRate(discountRate);
    if (rate) parts.push(rate);
    const ref = cleanReferencePrice(referencePrice);
    if (ref) parts.push(ref);
  }

  // Repli sur parenthèses existantes si aucun enrichissement spécifique
  if (parts.length === 0 && existingParens) {
    parts.push(existingParens);
  }

  if (parts.length > 0) {
    return `${baseFormatted} (${parts.join(' · ')})`;
  }
  return baseFormatted;
}

/**
 * Extrait les détails de prix depuis une chaîne HTML brute (fixtures ou tests).
 * @param {string} html
 * @param {object} [sellerSnapshot]
 * @returns {{ price: string|null, condition: string|null, discountRate: string|null, referencePrice: string|null, newPrice: string|null, formattedPrice: string|null }}
 */
export function extractPriceFromHtml(html, sellerSnapshot = {}) {
  let foundPrice = null;
  let condition = null;
  let discountRate = null;
  let referencePrice = null;
  let newPrice = null;

  const isSecondHand = (sellerSnapshot?.seller && /seconde\s+main|warehouse|reconditionn|used|occasion|retourenkauf|segunda\s+mano|seconda\s+mano/i.test(sellerSnapshot.seller))
    || /id=\\?["']add-to-cart-button-ubb\\?["']|id=\\?["']usedOnlyBuybox\\?["']|id=\\?["']usedbuyBox\\?["']|data-csa-c-slot-id=\\?["']usedAccordionRow\\?["']/i.test(html);

  const usedAccordionActive = /data-csa-c-slot-id=\\?["']usedAccordionRow\\?["'][^>]*aria-expanded=\\?["']true\\?["']/i.test(html)
    || /id=\\?["']usedAccordionRow\\?["'][^>]*aria-expanded=\\?["']true\\?["']/i.test(html);

  if (isSecondHand || usedAccordionActive) {
    const condMatch = html.match(/id=\\?["']usedAccordionCaption_feature_div\\?["'][\s\S]*?<span class=\\?["']a-text-bold\\?["']>([^<]+)<\/span>/i)
      || html.match(/data-hook=\\?["']item-condition-badge\\?["'][^>]*>([^<]+)</i);
    if (condMatch) {
      condition = condMatch[1].replace(/&nbsp;/g, ' ').replace(/\u00a0/g, ' ').trim();
    }
    if (!condition) condition = 'Occasion';

    const usedPriceMatch = html.match(/data-csa-c-slot-id=\\?["']usedAccordionRow\\?["'][\s\S]*?data-csa-c-price-to-pay=\\?["']([^"'\\]+)\\?["']/i)
      || html.match(/id=\\?["']usedPrice\\?["'][^>]*>([^<]+)</i)
      || html.match(/data-csa-c-slot-id=\\?["']usedAccordionRow\\?["'][\s\S]*?class=\\?["'][^"']*a-offscreen[^"']*\\?["']>([^<]+)</i);
    if (usedPriceMatch) {
      const val = usedPriceMatch[1].replace(/&nbsp;/g, ' ').replace(/\u00a0/g, ' ').trim();
      foundPrice = /^[\d.]+$/.test(val) ? val.replace('.', ',') + ' €' : val;
    }

    const newPriceMatch = html.match(/(?:data-csa-c-slot-id=\\?["']newAccordionRow[^"']*\\?["']|id=\\?["']newAccordionRow[^"']*\\?["'])[\s\S]*?data-csa-c-price-to-pay=\\?["']([^"'\\]+)\\?["']/i)
      || html.match(/data-csa-c-buying-option-type=\\?["']NEW\\?["'][^>]*data-csa-c-price-to-pay=\\?["']([^"'\\]+)\\?["']/i)
      || html.match(/(?:data-csa-c-slot-id=\\?["']newAccordionRow[^"']*\\?["']|id=\\?["']newAccordionRow[^"']*\\?["'])[\s\S]*?class=\\?["'][^"']*a-offscreen[^"']*\\?["']>([^<]+)</i);
    if (newPriceMatch) {
      const val = newPriceMatch[1].replace(/&nbsp;/g, ' ').replace(/\u00a0/g, ' ').trim();
      newPrice = /^[\d.]+$/.test(val) ? val.replace('.', ',') + ' €' : val;
    }

    if (foundPrice && newPrice) {
      discountRate = computeDiscountRate(foundPrice, newPrice);
    }
  } else {
    const priceToPayMatch = html.match(/data-csa-c-painter=\\?["']apex-dp-price\\?["'][^>]*data-csa-c-price-to-pay=\\?["']([^"'\\]+)\\?["']/i)
      || html.match(/data-csa-c-price-to-pay=\\?["']([^"'\\]+)\\?["']/i)
      || html.match(/class=\\?["'][^"']*priceToPay[^"']*\\?["'][\s\S]*?<span class=\\?["']a-offscreen\\?["']>([^<]+)<\/span>/i);
    if (priceToPayMatch) {
      const val = priceToPayMatch[1].replace(/&nbsp;/g, ' ').replace(/\u00a0/g, ' ').trim();
      foundPrice = /^[\d.]+$/.test(val) ? val.replace('.', ',') + ' €' : val;
    }

    const savingsMatch = html.match(/class=\\?["'][^"']*savingsPercentage[^"']*\\?["'][^>]*>([^<]+)<\/span>/i);
    if (savingsMatch) {
      discountRate = normalizeDiscountRate(savingsMatch[1]);
    }

    const basisOffMatch = html.match(/class=\\?["'][^"']*apex-basisprice-offscreen-label[^"']*\\?["'][^>]*>([^<]+)<\/span>/i);
    if (basisOffMatch) {
      referencePrice = cleanReferencePrice(basisOffMatch[1]);
    } else {
      const basisValMatch = html.match(/class=\\?["'][^"']*apex-basisprice-value[^"']*\\?["'][\s\S]*?<span class=\\?["']a-offscreen\\?["']>([^<]+)<\/span>/i);
      const basisLblMatch = html.match(/class=\\?["'][^"']*apex-basisprice-label[^"']*\\?["'][^>]*>([^<]+)<\/span>/i);
      if (basisValMatch) {
        referencePrice = cleanReferencePrice(basisLblMatch ? basisLblMatch[1] : null, basisValMatch[1]);
      }
    }
  }

  if (foundPrice) foundPrice = foundPrice.replace(/(\d)\s*([€$£¥])/g, '$1 $2');
  if (newPrice) newPrice = newPrice.replace(/(\d)\s*([€$£¥])/g, '$1 $2');

  const formattedPrice = formatEnrichedPrice({
    price: foundPrice,
    condition,
    discountRate,
    referencePrice,
    newPrice
  });

  return {
    price: foundPrice,
    condition: condition || null,
    discountRate: discountRate || null,
    referencePrice: referencePrice || null,
    newPrice: newPrice || null,
    formattedPrice
  };
}
