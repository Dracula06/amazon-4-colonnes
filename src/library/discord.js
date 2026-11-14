/**
 * Module d'intégration Discord Webhook.
 * Permet de formater et d'expédier un embed enrichi présentant une fiche produit analysée.
 */

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
  const url = info.url || `https://www.amazon.fr/dp/${asin}`;
  const kind = info.kind || 'unknown';
  const shippingRestriction = info.shippingRestriction && info.shippingRestriction.blocked
    ? info.shippingRestriction
    : null;
  const color = shippingRestriction ? COLORS.blocked : (COLORS[kind] || COLORS.unknown);

  const code = info.code || 'À VÉRIFIER';
  const label = info.label || 'Expéditeur non identifié';
  const price = info.price ? `${info.price} ${info.currencySymbol || '€'}` : 'Non détecté';

  const fields = [
    {
      name: '🏷️ ASIN & Pays',
      value: `\`${asin}\` (${marketplace})`,
      inline: true
    },
    {
      name: '💰 Prix repéré',
      value: price,
      inline: true
    },
    {
      name: '🚚 Logistique',
      value: `**[${code}]** ${label}`,
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
  ];

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
          text: `Amazon Inspector • Extension 4 Colonnes • ${new Date().toISOString().slice(0, 10)}`
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
