(()=>{
'use strict';

const clean = s => String(s || '').replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();

const SHIP_PREFIX = /^(?:exp[ée]di[ée]\s+(?:depuis|par)|exp[ée]diteur|livr[ée]\s+par|ships?\s+from|dispatched\s+(?:from|by)|fulfilled\s+by|shipped\s+by|versand\s+(?:durch|aus)|versandt\s+von|verschickt\s+von|lieferung\s+durch|env[íi]o\s+desde|enviado\s+(?:por|desde)|spedito\s+da|spedizione\s+da|inviato\s+da)\s*:?\s*/i;

const SELLER_PREFIX = /^(?:vendu\s+par|sold\s+by|verkauft\s+von|verkauf\s+durch|vendido\s+por|venduto\s+da)\s*:?\s*/i;

const shipName = s => clean(s).replace(SHIP_PREFIX, '').replace(/[.,;]+$/, '').trim();

const sellerName = s => clean(s).replace(SELLER_PREFIX, '').replace(/[.,;]+$/, '').trim();

const amazon = s => /^amazon(?:\.(?:fr|de|it|es|co\.uk|com|nl|be|se|pl)|\s+fulfillment|\s+eu(?:\s+.*)?)?$/i.test(clean(s));

const direct = s => amazon(s) || /^amazon\s+(?:seconde\s+main|warehouse|resale|retourenkauf|segunda\s+mano|seconda\s+mano|renewed)(?:\s+deals)?$/i.test(clean(s));

function combined(s) {
  s = clean(s);
  if (!s) return null;

  // 1. Double identité même acteur : Expédié et vendu par X / Shipped and sold by X / etc.
  let m = s.match(/^(?:exp[ée]di[ée]\s+et\s+vendu|vendu\s+et\s+exp[ée]di[ée]|shipped\s+and\s+sold|dispatched\s+(?:from\s+)?and\s+sold|sold\s+(?:by\s+)?and\s+(?:shipped|dispatched)(?:\s+from)?|ships?\s+(?:from\s+)?and\s+sold|sold\s+by\s+and\s+shipped\s+from|verkauf\s+und\s+versand\s+durch|versand\s+und\s+verkauf\s+durch|versand\s+durch\s+und\s+verkauf\s+durch|versandt\s+und\s+verkauft|verkauft\s+und\s+versandt|enviado\s+y\s+vendido\s+por|vendido\s+y\s+enviado\s+por|spedito\s+e\s+venduto\s+da|venduto\s+e\s+spedito\s+da)\s+(?:par|by|durch|von|por|da)?\s*(.+?)[.;]?$/i);
  if (m) {
    const name = m[1].replace(/^(?:par|by|durch|por|da)\s+/i, '').trim();
    return { ship: shipName(name), seller: sellerName(name) };
  }

  // 2. Vendeur d'abord, puis expéditeur
  m = s.match(/^(?:vendu\s+par|sold\s+by|verkauft\s+von|vendido\s+por|venduto\s+da)\s+(.+?)\s+(?:et|and|und|y|e)\s+(?:exp[ée]di[ée]\s+(?:par|depuis)|dispatched\s+(?:from|by)|fulfilled\s+by|shipped\s+by|versandt\s+von|versand\s+durch|verschickt\s+von|enviado\s+(?:por|desde)|spedito\s+da)\s+(.+?)[.;]?$/i);
  if (m) {
    return { seller: sellerName(m[1]), ship: shipName(m[2]) };
  }

  // 3. Expéditeur d'abord, puis vendeur
  m = s.match(/^(?:exp[ée]di[ée]\s+(?:par|depuis)|dispatched\s+(?:from|by)|fulfilled\s+by|shipped\s+by|versandt\s+von|versand\s+durch|verschickt\s+von|enviado\s+(?:por|desde)|spedito\s+da)\s+(.+?)\s+(?:et|and|und|y|e)\s+(?:vendu\s+par|sold\s+by|verkauft\s+von|vendido\s+por|venduto\s+da)\s+(.+?)[.;]?$/i);
  if (m) {
    return { ship: shipName(m[1]), seller: sellerName(m[2]) };
  }

  return null;
}

const INVALID_PLACEHOLDERS = /^(?:voir|choisir|s[ée]lection|indisponible|non\s+identifi|see|choose|select|unavailable|unknown|siehe|w[äa]hlen|auswahl|nicht\s+verf[üu]gbar|unbekannt|ver|elegir|seleccionar|no\s+disponible|desconocido|vedi|scegli|seleziona|non\s+disponibile|sconosciuto)/i;

function classify(rawShip, rawSeller) {
  let ship = shipName(rawShip);
  let seller = sellerName(rawSeller);

  const a = combined(rawSeller);
  const b = combined(rawShip);
  const pair = a || b;

  let conflict = false;
  if (pair) {
    if (ship && !combined(rawShip) && ship.toLocaleLowerCase() !== pair.ship.toLocaleLowerCase()) {
      conflict = true;
    }
    ship = pair.ship;
    seller = pair.seller;
  }

  let kind = 'unknown', code = 'À VÉRIFIER', label = 'Expéditeur non identifié';

  if (conflict) {
    label = 'Informations d’expédition contradictoires';
  } else if (direct(seller) && (!ship || amazon(ship))) {
    kind = 'amazon';
    code = 'AMAZON';
    const isSecondHand = /seconde\s+main|warehouse|resale|retourenkauf|segunda\s+mano|seconda\s+mano|renewed/i.test(seller);
    label = isSecondHand ? 'Amazon Seconde main · expédié par Amazon' : 'Vendu et expédié par Amazon';
    if (!ship) ship = 'Amazon';
  } else if (amazon(ship)) {
    kind = 'fba';
    code = 'FBA';
    label = 'Expédié par Amazon (vendeur tiers)';
  } else if (ship && seller && !INVALID_PLACEHOLDERS.test(ship)) {
    kind = 'fbm';
    code = 'FBM';
    label = 'Expédié hors Amazon (vendeur tiers direct)';
  }

  return { kind, code, label, ship, seller };
}

globalThis.ALCore = { clean, shipName, sellerName, classify, combined, version: '0.4.0-core' };
})();
