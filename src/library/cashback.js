/**
 * Module de gestion et de formatage des liens de cashback, de parrainage et d'extensions recommandées.
 * Supporte Wanteeed (taux dynamique ou fixe), Poulpeo, iGraal, TopCashback, ainsi que VintHelp et BoostHelp.
 */

export const DEFAULT_CASHBACK_CONFIG = Object.freeze({
  wanteeedUrl: 'https://wanteeed.com/join/5e2977dce7a94e7186be8e58c6d9141b',
  wanteeedRate: '1,5%',
  poulpeoUrl: 'https://www.poulpeo.com/p/o039ab',
  poulpeoBonus: '5€ offerts au 1er cashback',
  igraalUrl: 'https://fr.igraal.com/parrainage?parrain=bleachcore&utm_medium=raf&utm_source=refer_friend',
  igraalBonus: '3€ offerts',
  topcashbackUrl: 'https://www.topcashback.fr/ref/dracoule',
  topcashbackBonus: 'taux boostés & bonus',
  jokoUrl: '',
  enabled: true
});

export const DEFAULT_EXTENSIONS_CONFIG = Object.freeze({
  vinthelpUrl: 'https://chromewebstore.google.com/detail/vinthelp/kjkbijmnpmphddjhjkilaobilleokmkg',
  vinthelpDesc: 'gestion dressing Vinted',
  boosthelpUrl: 'https://chromewebstore.google.com/detail/boosthelp/flfbfonaffaokkifdnpkgkaiaadcfcin',
  boosthelpDesc: 'boosts de favoris Vinted',
  enabled: true
});

let cachedWanteeedRate = '1,5%';
let lastWanteeedFetch = 0;

/**
 * Extrait le taux de cashback Wanteeed pour Amazon depuis une chaîne HTML.
 * @param {string} html
 * @returns {string} ex: "1,5%"
 */
export function parseWanteeedRateFromHtml(html) {
  if (!html) return '1,5%';
  const m = String(html).match(/Jusqu(?:&#39;|'|’)?à\s*<em>([^<]+)<\/em>\s*<em>de<\/em>\s*<em>cashback<\/em>/i)
    || String(html).match(/percevez jusqu’à\s*([\d,.]+\s*%)/i);
  if (m) {
    return m[1].replace(/&nbsp;/g, '').replace(/\u00a0/g, '').replace(/\s*%/g, '%').trim();
  }
  return '1,5%';
}

/**
 * Tente de récupérer le taux de cashback en direct sur Wanteeed.
 * Utilise un cache mémoire pour éviter des requêtes excessives.
 * @returns {Promise<string>}
 */
export async function fetchLiveWanteeedRate() {
  const now = Date.now();
  if (now - lastWanteeedFetch < 3600000 && cachedWanteeedRate) {
    return cachedWanteeedRate;
  }
  try {
    const res = await fetch('https://wanteeed.com/fr/codes-promo-amazon.fr');
    if (res.ok) {
      const html = await res.text();
      const rate = parseWanteeedRateFromHtml(html);
      if (rate) {
        cachedWanteeedRate = rate;
        lastWanteeedFetch = now;
        return rate;
      }
    }
  } catch {
    // Repli silencieux sur le taux par défaut en cas d'indisponibilité réseau
  }
  return cachedWanteeedRate || '1,5%';
}

/**
 * Construit les lignes formatées pour Telegram avec liens hypertextes épurés pour le cashback.
 * @param {object} [config]
 * @param {function} [escapeFn]
 * @returns {string[]}
 */
export function buildTelegramCashbackLines(config = {}, escapeFn = s => s) {
  const cfg = { ...DEFAULT_CASHBACK_CONFIG, ...config };
  if (cfg.enabled === false) return [];

  const lines = [];
  if (cfg.wanteeedUrl) {
    const rate = cfg.wanteeedRate || '1,5%';
    lines.push(`💸 <a href="${escapeFn(cfg.wanteeedUrl)}"><b>Wanteeed</b></a> : jusqu’à ${escapeFn(rate)} de cashback`);
  }
  if (cfg.poulpeoUrl) {
    const bonus = cfg.poulpeoBonus || '5€ offerts au 1er cashback';
    lines.push(`🐙 <a href="${escapeFn(cfg.poulpeoUrl)}"><b>Poulpeo</b></a> : ${escapeFn(bonus)}`);
  }
  if (cfg.igraalUrl) {
    const bonus = cfg.igraalBonus || '3€ offerts';
    lines.push(`🛍️ <a href="${escapeFn(cfg.igraalUrl)}"><b>iGraal</b></a> : ${escapeFn(bonus)}`);
  }
  if (cfg.topcashbackUrl) {
    const bonus = cfg.topcashbackBonus || 'taux boostés & bonus';
    lines.push(`💶 <a href="${escapeFn(cfg.topcashbackUrl)}"><b>TopCashback</b></a> : ${escapeFn(bonus)}`);
  }

  return lines;
}

/**
 * Construit les lignes formatées pour Telegram avec liens hypertextes épurés pour les extensions recommandées.
 * @param {object} [config]
 * @param {function} [escapeFn]
 * @returns {string[]}
 */
export function buildTelegramExtensionsLines(config = {}, escapeFn = s => s) {
  const cfg = { ...DEFAULT_EXTENSIONS_CONFIG, ...config };
  if (cfg.enabled === false) return [];

  const lines = [];
  if (cfg.vinthelpUrl) {
    const desc = cfg.vinthelpDesc || 'gestion dressing Vinted';
    lines.push(`👗 <a href="${escapeFn(cfg.vinthelpUrl)}"><b>VintHelp</b></a> : ${escapeFn(desc)}`);
  }
  if (cfg.boosthelpUrl) {
    const desc = cfg.boosthelpDesc || 'boosts de favoris Vinted';
    lines.push(`⚡ <a href="${escapeFn(cfg.boosthelpUrl)}"><b>BoostHelp</b></a> : ${escapeFn(desc)}`);
  }

  return lines;
}

/**
 * Construit le champ embed pour Discord avec liens hypertextes markdown [Texte](url) pour le cashback.
 * @param {object} [config]
 * @returns {object|null}
 */
export function buildDiscordCashbackField(config = {}) {
  const cfg = { ...DEFAULT_CASHBACK_CONFIG, ...config };
  if (cfg.enabled === false) return null;

  const items = [];
  if (cfg.wanteeedUrl) {
    const rate = cfg.wanteeedRate || '1,5%';
    items.push(`• [**Wanteeed**](${cfg.wanteeedUrl}) : jusqu’à ${rate} de cashback`);
  }
  if (cfg.poulpeoUrl) {
    const bonus = cfg.poulpeoBonus || '5€ offerts au 1er cashback';
    items.push(`• [**Poulpeo**](${cfg.poulpeoUrl}) : ${bonus}`);
  }
  if (cfg.igraalUrl) {
    const bonus = cfg.igraalBonus || '3€ offerts';
    items.push(`• [**iGraal**](${cfg.igraalUrl}) : ${bonus}`);
  }
  if (cfg.topcashbackUrl) {
    const bonus = cfg.topcashbackBonus || 'taux boostés & bonus';
    items.push(`• [**TopCashback**](${cfg.topcashbackUrl}) : ${bonus}`);
  }

  if (items.length === 0) return null;

  return {
    name: '💸 Cashback & Parrainages',
    value: items.join('\n'),
    inline: false
  };
}

/**
 * Construit le champ embed pour Discord avec liens hypertextes markdown pour les extensions recommandées.
 * @param {object} [config]
 * @returns {object|null}
 */
export function buildDiscordExtensionsField(config = {}) {
  const cfg = { ...DEFAULT_EXTENSIONS_CONFIG, ...config };
  if (cfg.enabled === false) return null;

  const items = [];
  if (cfg.vinthelpUrl) {
    const desc = cfg.vinthelpDesc || 'gestion dressing Vinted';
    items.push(`• [**VintHelp**](${cfg.vinthelpUrl}) : ${desc}`);
  }
  if (cfg.boosthelpUrl) {
    const desc = cfg.boosthelpDesc || 'boosts de favoris Vinted';
    items.push(`• [**BoostHelp**](${cfg.boosthelpUrl}) : ${desc}`);
  }

  if (items.length === 0) return null;

  return {
    name: '🧩 Extensions recommandées',
    value: items.join('\n'),
    inline: false
  };
}
