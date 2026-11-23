/**
 * Module d'intégration Discord Webhook.
 * Permet de formater et d'expédier un embed enrichi présentant une fiche produit analysée.
 */

import {
  formatEnrichedPrice,
  cleanLogisticsLabel,
  getDiscountDealInfo,
  getReferencePriceInfo,
  computeDiscountRate
} from './pricing.js';
import { cleanEan, buildBarcodeLookupUrl } from './ean.js';
import { buildDiscordCashbackField, buildDiscordExtensionsField } from './cashback.js';

const DISCORD_WEBHOOK_PATTERN = /^https:\/\/(?:ptb\.|canary\.)?discord(?:app)?\.com\/api\/webhooks\/\d+\/[A-Za-z0-9_-]+$/;

const COLORS = Object.freeze({
  amazon: 0x16836B, // Vert Amazon officiel
  fba: 0x3373AA,    // Bleu Expédié par Amazon
  fbm: 0xD98900,    // Orange Vendeur tiers
  unknown: 0x888888, // Gris neutre
  blocked: 0xDC2626 // Rouge alerte LOCK pays
});

/**
 * Valide si l'URL fournie est un Webhook Discord légitime.
 * @param {string} url
 * @returns {boolean}
 */
export function isValidDiscordWebhook(url) {
  return typeof url === 'string' && DISCORD_WEBHOOK_PATTERN.test(url.trim());
}

export function cleanAffiliateUrl(rawUrl) {
  if (!rawUrl) return '';
  try {
    const u = new URL(rawUrl);
    const keepKeys = new Set(['tag', 'smid', 'm']);
    const newParams = new URLSearchParams();
    for (const [k, v] of u.searchParams.entries()) {
      if (keepKeys.has(k.toLowerCase())) {
        newParams.set(k.toLowerCase(), v);
      }
    }
    const cleanPath = u.pathname.replace(/\/ref=[^/?#]*/i, '') || '/';
    const qs = newParams.toString();
    return `${u.origin}${cleanPath}${qs ? '?' + qs : ''}`;
  } catch {
    return rawUrl;
  }
}

/**
 * Construit le payload d'un Embed Discord pour une fiche produit Amazon.
 * @param {object} info
 * @returns {object} Payload JSON prêt pour le webhook Discord
 */
export function buildDiscordEmbed(info = {}) {
  const asin = info.asin || 'ASIN inconnu';
  const marketplace = info.marketplace || 'FR';
  const rawTitle = info.title ? String(info.title).trim() : 'Produit Amazon';
  const title = rawTitle.length > 240 ? rawTitle.slice(0, 237) + '...' : rawTitle;
  const rawUrl = info.url || `https://www.amazon.fr/dp/${asin}`;
  const url = cleanAffiliateUrl(rawUrl);
  const kind = info.kind || 'unknown';
  const shippingRestriction = info.shippingRestriction && info.shippingRestriction.blocked
    ? info.shippingRestriction
    : null;
  const color = shippingRestriction ? COLORS.blocked : (COLORS[kind] || COLORS.unknown);

  const code = info.code || 'À VÉRIFIER';
  const rawLabel = info.label || 'Expéditeur non identifié';
  const cleanLabel = cleanLogisticsLabel(rawLabel, info.ship);

  let baseFormatted = null;
  let cond = info.condition || null;
  let rawPrice = info.price ? String(info.price).trim() : '';
  let discountRate = info.discountRate || null;
  let newPrice = info.newPrice || null;
  let referencePrice = info.referencePrice || null;
  const sym = info.currencySymbol || '€';

  if (rawPrice) {
    const hasSymbol = /[€$£¥]|\b(?:EUR|GBP|USD)\b/i.test(rawPrice);
    baseFormatted = hasSymbol ? rawPrice : `${rawPrice} ${sym}`.trim();
    baseFormatted = baseFormatted.replace(/(\d)\s*([€$£¥])/g, '$1 $2');

    let existingParens = null;
    const pMatch = baseFormatted.match(/\s*\(([^)]+)\)$/);
    if (pMatch) {
      existingParens = pMatch[1].trim();
      baseFormatted = baseFormatted.replace(/\s*\([^)]+\)$/, '').trim();
    }

    if (existingParens) {
      if (existingParens.includes('·')) {
        const parts = existingParens.split('·').map(s => s.trim());
        for (const pt of parts) {
          if (!cond && /occasion|reconditionn|used|seconde/i.test(pt)) {
            cond = pt;
          } else if (!discountRate && /-?\d+\s*%/.test(pt)) {
            discountRate = pt;
          } else if (!newPrice && /vs\s+neuf\s+([\d.,\s]+[€$£¥]?)/i.test(pt)) {
            const m = pt.match(/vs\s+neuf\s+([\d.,\s]+[€$£¥]?)/i);
            if (m) newPrice = m[1].trim();
          } else if (!referencePrice && /conseill[eé]|r[eé]cent|plus\s+bas/i.test(pt)) {
            referencePrice = pt;
          }
        }
      } else {
        if (!cond && /occasion|reconditionn|used|seconde/i.test(existingParens)) {
          cond = existingParens;
        } else if (!cond) {
          cond = existingParens;
        }
      }
    }
  }

  if (!discountRate && baseFormatted && newPrice) {
    discountRate = computeDiscountRate(baseFormatted, newPrice);
  }

  const dealInfo = getDiscountDealInfo(discountRate);
  const refInfo = getReferencePriceInfo({ referencePrice, newPrice, currencySymbol: sym });

  let displayPrice = baseFormatted ? (cond ? `${baseFormatted} (${cond})` : baseFormatted) : (info.price || 'Non détecté');

  const fields = [
    {
      name: '🏷️ ASIN & Pays',
      value: `\`${asin}\` (${marketplace})`,
      inline: true
    }
  ];

  const validEan = cleanEan(info.ean);
  if (validEan) {
    const lookupUrl = buildBarcodeLookupUrl(validEan);
    fields.push({
      name: '🔍 EAN & Code-barres',
      value: `[\`${validEan}\`](${lookupUrl})`,
      inline: true
    });
  }

  fields.push({
    name: '💰 Prix repéré',
    value: displayPrice,
    inline: true
  });

  if (refInfo) {
    fields.push({
      name: `${refInfo.emoji} ${refInfo.label}`,
      value: refInfo.value,
      inline: true
    });
  }

  if (dealInfo) {
    fields.push({
      name: `${dealInfo.badge} Remise`,
      value: `${dealInfo.rateStr} ${dealInfo.flames}`,
      inline: true
    });
  }

  fields.push(
    {
      name: '🚚 Logistique',
      value: `**[${code}]** ${cleanLabel}`,
      inline: false
    },
    {
      name: '🏬 Vendeur',
      value: info.seller ? `\`${info.seller}\`` : 'Non identifié',
      inline: true
    },
    {
      name: '📦 Expéditeur',
      value: info.ship ? `\`${info.ship}\`` : 'Non identifié',
      inline: true
    }
  );

  const cashbackField = buildDiscordCashbackField(info.cashbackConfig);
  if (cashbackField) {
    fields.push(cashbackField);
  }

  const extensionsField = buildDiscordExtensionsField(info.extensionsConfig);
  if (extensionsField) {
    fields.push(extensionsField);
  }

  if (shippingRestriction) {
    const lockTitle = shippingRestriction.title || 'LOCK pays';
    const lockExplanation = shippingRestriction.explanation || 'Livraison impossible vers l’adresse sélectionnée.';
    const lockQuote = shippingRestriction.detectedMessage ? `\n*« ${shippingRestriction.detectedMessage} »*` : '';
    fields.push({
      name: `🔒 ${lockTitle}`,
      value: `${lockExplanation}${lockQuote}`.slice(0, 1024),
      inline: false
    });
  }

  if (typeof info.injectionsCount === 'number' && info.injectionsCount > 0) {
    fields.push({
      name: '🛡️ Composants suspects / Injections',
      value: `${info.injectionsCount} élément(s) externe(s) repéré(s)`,
      inline: false
    });
  }

  return {
    username: 'Amazon 4 Colonnes',
    avatar_url: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg',
    embeds: [
      {
        title: `📦 ${title}`,
        url,
        color,
        fields,
        footer: {
          text: `${new Date().toISOString().slice(0, 10)}`
        }
      }
    ]
  };
}

/**
 * Envoie le payload vers le webhook Discord.
 * @param {string} webhookUrl
 * @param {object} payload
 * @returns {Promise<{ ok: boolean, status: number }>}
 */
export async function sendDiscordWebhook(webhookUrl, payload) {
  if (!isValidDiscordWebhook(webhookUrl)) {
    throw new Error('URL de Webhook Discord invalide');
  }

  const response = await fetch(webhookUrl.trim(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (response.status !== 204 && response.status !== 200) {
    const errorText = await response.text().catch(() => '');
    throw new Error(`Échec de l'envoi Discord (HTTP ${response.status}): ${errorText.slice(0, 200)}`);
  }

  return { ok: true, status: response.status };
}
