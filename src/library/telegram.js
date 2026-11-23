/**
 * Module d'intégration Telegram Bot API & Webhook.
 * Permet de formater et d'expédier un message HTML enrichi présentant une fiche produit analysée.
 */

import {
  normalizeDiscountRate,
  cleanReferencePrice,
  computeDiscountRate,
  cleanLogisticsLabel,
  getDiscountDealInfo,
  getReferencePriceInfo
} from './pricing.js';
import { cleanEan, buildBarcodeLookupUrl } from './ean.js';
import { buildTelegramCashbackLines, buildTelegramExtensionsLines } from './cashback.js';

const TELEGRAM_TOKEN_PATTERN = /^\d{6,14}:[A-Za-z0-9_-]{25,55}$/;
const TELEGRAM_CHAT_ID_PATTERN = /^(?:@[a-zA-Z0-9_]{3,32}|-?\d{5,18})$/;

/**
 * Échappe les caractères réservés pour Telegram en mode HTML.
 * @param {string} str
 * @returns {string}
 */
export function escapeTelegramHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Demande la permission d'accès à l'API Telegram si nécessaire.
 * @returns {Promise<boolean>}
 */
export async function allowTelegram() {
  if (typeof chrome !== 'undefined' && chrome.permissions?.request) {
    return chrome.permissions.request({ origins: ['https://api.telegram.org/*'] });
  }
  return true;
}

/**
 * Valide un jeton de bot Telegram (@BotFather).
 * @param {string} token
 * @returns {boolean}
 */
export function isValidTelegramToken(token) {
  return typeof token === 'string' && TELEGRAM_TOKEN_PATTERN.test(token.trim());
}

/**
 * Valide un identifiant de canal, groupe ou utilisateur Telegram.
 * @param {string|number} chatId
 * @returns {boolean}
 */
export function isValidTelegramChatId(chatId) {
  if (typeof chatId === 'number') chatId = String(chatId);
  return typeof chatId === 'string' && TELEGRAM_CHAT_ID_PATTERN.test(chatId.trim());
}

/**
 * Nettoie une URL produit Amazon pour ne conserver que le chemin canonique et le tag d'affiliation.
 * Élimine les paramètres d'état temporaires tels que th=1, psc=1, ref=...
 * @param {string} rawUrl
 * @returns {string}
 */
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
 * Construit le message formaté en HTML pour Telegram.
 * @param {object} info
 * @returns {string} Message au format HTML Telegram
 */
export function buildTelegramMessage(info = {}) {
  const asin = info.asin ? escapeTelegramHtml(info.asin) : 'Inconnu';
  const marketplace = info.marketplace ? escapeTelegramHtml(info.marketplace) : 'FR';
  const rawTitle = info.title ? String(info.title).trim() : 'Produit Amazon';
  const title = escapeTelegramHtml(rawTitle.length > 200 ? rawTitle.slice(0, 197) + '...' : rawTitle);
  const rawUrl = info.url || `https://www.amazon.fr/dp/${asin}`;
  const url = cleanAffiliateUrl(rawUrl);
  const safeUrl = escapeTelegramHtml(url);
  const code = info.code ? escapeTelegramHtml(info.code) : 'À VÉRIFIER';
  const rawLabel = info.label ? escapeTelegramHtml(info.label) : 'Expéditeur non identifié';
  const cleanLabel = escapeTelegramHtml(cleanLogisticsLabel(rawLabel, info.ship));
  const seller = info.seller ? escapeTelegramHtml(info.seller) : 'Non identifié';
  const ship = info.ship ? escapeTelegramHtml(info.ship) : 'Non identifié';

  let baseFormatted = null;
  let existingParens = null;
  let cond = info.condition || null;
  let discountRate = info.discountRate || null;
  let newPrice = info.newPrice || null;
  let referencePrice = info.referencePrice || null;
  const sym = info.currencySymbol || '€';

  if (info.price) {
    const rawPrice = String(info.price).trim();
    const hasSymbol = /[€$£¥]|\b(?:EUR|GBP|USD)\b/i.test(rawPrice);
    baseFormatted = hasSymbol ? rawPrice : `${rawPrice} ${sym}`.trim();
    baseFormatted = baseFormatted.replace(/(\d)\s*([€$£¥])/g, '$1 $2');

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

  let priceLine = '💰 <b>Prix :</b> Non détecté';
  if (baseFormatted) {
    const hasEnrichment = Boolean(refInfo || dealInfo);
    if (!hasEnrichment && existingParens && !info.condition) {
      priceLine = `💰 <b>Prix :</b> <b>${escapeTelegramHtml(baseFormatted)} (${escapeTelegramHtml(cond)})</b>`;
    } else if (cond) {
      priceLine = `💰 <b>Prix :</b> <b>${escapeTelegramHtml(baseFormatted)}</b> (${escapeTelegramHtml(cond)})`;
    } else {
      priceLine = `💰 <b>Prix :</b> <b>${escapeTelegramHtml(baseFormatted)}</b>`;
    }
  }

  const validEan = cleanEan(info.ean);

  const lines = [
    `📦 <b><a href="${safeUrl}">${title}</a></b>`,
    '',
    `🏷️ <b>ASIN :</b> <code>${asin}</code> (${marketplace})`
  ];

  if (validEan) {
    const lookupUrl = buildBarcodeLookupUrl(validEan);
    lines.push(`🔍 <b>EAN :</b> <a href="${escapeTelegramHtml(lookupUrl)}"><code>${validEan}</code></a>`);
  }

  lines.push(priceLine);

  if (refInfo) {
    lines.push(refInfo.formattedLineTelegram);
  }

  if (dealInfo) {
    lines.push(dealInfo.formattedLineTelegram);
  }

  lines.push(`🚚 <b>Logistique :</b> [${code}] ${cleanLabel}`);
  lines.push(`🏬 <b>Vendeur :</b> ${seller}`);
  lines.push(`📦 <b>Expéditeur :</b> ${ship}`);

  if (info.shippingRestriction && info.shippingRestriction.blocked) {
    const lockTitle = escapeTelegramHtml(info.shippingRestriction.title || 'LOCK pays');
    const lockExplanation = escapeTelegramHtml(info.shippingRestriction.explanation || 'Livraison restreinte');
    lines.push(`🔒 <b>${lockTitle} :</b> <i>${lockExplanation}</i>`);
  }

  if (typeof info.injectionsCount === 'number' && info.injectionsCount > 0) {
    lines.push(`🛡️ <b>Composants externes :</b> ${info.injectionsCount} repéré(s)`);
  }

  lines.push('');
  lines.push(`🔗 <a href="${safeUrl}"><b>Voir l’offre sur Amazon</b></a>`);

  const cashbackLines = buildTelegramCashbackLines(info.cashbackConfig, escapeTelegramHtml);
  if (cashbackLines.length > 0) {
    lines.push('');
    for (const cbLine of cashbackLines) {
      lines.push(cbLine);
    }
  }

  const extensionLines = buildTelegramExtensionsLines(info.extensionsConfig, escapeTelegramHtml);
  if (extensionLines.length > 0) {
    lines.push('');
    for (const extLine of extensionLines) {
      lines.push(extLine);
    }
  }

  return lines.join('\n');
}

/**
 * Définit une ou plusieurs réactions sur un message Telegram publié.
 * @param {object} options
 * @param {string} options.token
 * @param {string|number} options.chatId
 * @param {number} options.messageId
 * @param {string|string[]} [options.reaction]
 * @returns {Promise<boolean>}
 */
export async function setTelegramReaction({ token, chatId, messageId, reaction = '🔥' }) {
  if (!token || !chatId || !messageId) return false;
  const cleanToken = String(token).trim();
  const cleanChatId = String(chatId).trim();
  const apiUrl = `https://api.telegram.org/bot${cleanToken}/setMessageReaction`;

  const list = Array.isArray(reaction) ? reaction : [reaction];
  const payloadList = list.filter(Boolean).map(emoji => ({ type: 'emoji', emoji }));
  if (payloadList.length === 0) return false;

  try {
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: cleanChatId,
        message_id: messageId,
        reaction: payloadList
      })
    });

    if (!res.ok && payloadList.length > 1) {
      // Si Telegram refuse les réactions multiples pour un bot non-premium, repli sur 1 seule
      const fallbackRes = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: cleanChatId,
          message_id: messageId,
          reaction: [payloadList[0]]
        })
      });
      return fallbackRes.ok;
    }
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Envoie un message vers Telegram via Bot API ou Webhook tiers.
 * @param {object} options
 * @param {string} [options.token]
 * @param {string|number} [options.chatId]
 * @param {string} [options.webhookUrl]
 * @param {string} options.text
 * @param {object} [options.replyMarkup]
 * @param {string|string[]} [options.initialReaction]
 * @returns {Promise<{ ok: boolean, status: number, result?: any }>}
 */
export async function sendTelegramMessage({
  token,
  chatId,
  webhookUrl,
  text,
  replyMarkup,
  initialReaction = ['👍', '🔥', '👎']
}) {
  if (webhookUrl && String(webhookUrl).trim().startsWith('http')) {
    const payload = {
      chat_id: chatId ? String(chatId).trim() : undefined,
      text,
      parse_mode: 'HTML',
      disable_web_page_preview: false
    };
    if (replyMarkup) {
      payload.reply_markup = replyMarkup;
    }
    const res = await fetch(String(webhookUrl).trim(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      throw new Error(`Échec webhook Telegram (HTTP ${res.status}): ${errText.slice(0, 200)}`);
    }
    return { ok: true, status: res.status };
  }

  const cleanToken = String(token || '').trim();
  const cleanChatId = String(chatId || '').trim();

  if (!isValidTelegramToken(cleanToken)) {
    throw new Error('Jeton de Bot Telegram invalide (doit ressembler à 123456789:ABCdefGhIJK...)');
  }
  if (!isValidTelegramChatId(cleanChatId)) {
    throw new Error('Chat ID Telegram invalide (doit être @nom_du_canal ou un identifiant numérique comme -100...)');
  }

  const apiUrl = `https://api.telegram.org/bot${cleanToken}/sendMessage`;
  const payload = {
    chat_id: cleanChatId,
    text,
    parse_mode: 'HTML',
    disable_web_page_preview: false
  };
  if (replyMarkup) {
    payload.reply_markup = replyMarkup;
  }

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const body = await response.json().catch(() => null);

  if (!response.ok || !body?.ok) {
    const desc = body?.description || `HTTP ${response.status}`;
    throw new Error(`Échec de l'envoi Telegram : ${desc}`);
  }

  if (body?.result?.message_id && initialReaction) {
    await setTelegramReaction({
      token: cleanToken,
      chatId: cleanChatId,
      messageId: body.result.message_id,
      reaction: initialReaction
    }).catch(() => {});
  }

  return { ok: true, status: response.status, result: body.result };
}
