/**
 * Détection et extraction de l'URL d'origine lors d'une redirection automatique Amazon
 * (ex: lien amazon.it ouvert avec adresse française qui redirige vers amazon.fr via ar_su=...).
 * Préserve intégralement les tags d'affiliation (tag, linkCode, etc.) pour rémunérer le créateur.
 */

const COUNTRY_FLAGS = Object.freeze({
  'amazon.it': { flag: '🇮🇹', name: 'Italie', code: 'IT' },
  'amazon.de': { flag: '🇩🇪', name: 'Allemagne', code: 'DE' },
  'amazon.es': { flag: '🇪🇸', name: 'Espagne', code: 'ES' },
  'amazon.co.uk': { flag: '🇬🇧', name: 'Royaume-Uni', code: 'UK' },
  'amazon.fr': { flag: '🇫🇷', name: 'France', code: 'FR' },
  'amazon.com': { flag: '🇺🇸', name: 'États-Unis', code: 'US' },
  'amazon.ca': { flag: '🇨🇦', name: 'Canada', code: 'CA' },
  'amazon.nl': { flag: '🇳🇱', name: 'Pays-Bas', code: 'NL' },
  'amazon.be': { flag: '🇧🇪', name: 'Belgique', code: 'BE' },
  'amazon.se': { flag: '🇸🇪', name: 'Suède', code: 'SE' },
  'amazon.pl': { flag: '🇵🇱', name: 'Pologne', code: 'PL' }
});

/**
 * Extrait l'URL Amazon d'origine en conservant les tags d'affiliation et paramètres utiles.
 * @param {string} currentUrl
 * @returns {object|null}
 */
export function extractOriginUrl(currentUrl) {
  if (!currentUrl) return null;
  try {
    const u = new URL(currentUrl);
    const rawOrigin = u.searchParams.get('ar_su') || u.searchParams.get('redirectUrl') || u.searchParams.get('orig_url');
    if (!rawOrigin) return null;

    let decoded = rawOrigin;
    try {
      decoded = decodeURIComponent(rawOrigin);
    } catch {}

    const originUrl = new URL(decoded);
    const host = originUrl.hostname.replace(/^www\./, '').toLowerCase();

    // Vérifier qu'il s'agit bien d'un domaine Amazon valide
    if (!host.startsWith('amazon.')) return null;

    // Conserver tous les paramètres du lien d'origine (notamment tag, linkCode, ascsubtag pour l'affiliation)
    const cleanParams = new URLSearchParams(originUrl.searchParams);

    // Supprimer les paramètres de routage interne de redirection Amazon
    cleanParams.delete('ar_su');
    cleanParams.delete('ar_srct');
    cleanParams.delete('ar_mt');

    // S'assurer de conserver ou d'ajouter creatorsDisableRedirect pour éviter la boucle de redirection
    if (!cleanParams.has('creatorsDisableRedirect')) {
      cleanParams.set('creatorsDisableRedirect', 'true');
    }

    // Récupérer les éventuels tags et variantes présents sur l'URL courante si absents
    for (const key of ['tag', 'linkCode', 'ascsubtag', 'th', 'psc', 'smid']) {
      if (!cleanParams.has(key) && u.searchParams.has(key)) {
        cleanParams.set(key, u.searchParams.get(key));
      }
    }

    const searchStr = cleanParams.toString();
    const cleanPath = originUrl.pathname.replace(/\/+$/, '');
    const cleanUrl = `${originUrl.protocol}//${originUrl.host}${cleanPath}${searchStr ? '?' + searchStr : ''}`;

    const info = COUNTRY_FLAGS[host] || { flag: '🌐', name: host, code: host.toUpperCase() };

    return {
      host,
      rawUrl: decoded,
      cleanUrl,
      flag: info.flag,
      countryName: info.name,
      countryCode: info.code,
      tag: cleanParams.get('tag') || null,
      asin: cleanPath.match(/\/(?:dp|gp\/product)\/([A-Z0-9]{10})/i)?.[1] || null
    };
  } catch {
    return null;
  }
}
