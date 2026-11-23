let activeTab = null;
let currentProductData = null;

const optFourColumns = document.getElementById('optFourColumns');
const optHideAds = document.getElementById('optHideAds');
const optHideRecs = document.getElementById('optHideRecs');
const optHideReviews = document.getElementById('optHideReviews');
const optAutoRedirect = document.getElementById('optAutoRedirect');
const optShowQuickFrame = document.getElementById('optShowQuickFrame');
const diagContent = document.getElementById('diagContent');
const actionStatus = document.getElementById('actionStatus');
const affiliateSection = document.getElementById('affiliateSection');
const affiliateMeta = document.getElementById('affiliateMeta');
const affiliateUrlInput = document.getElementById('affiliateUrlInput');
const btnCopyAffiliate = document.getElementById('btnCopyAffiliate');
const btnSiteStripe = document.getElementById('btnSiteStripe');

function setStatus(text, isError = false) {
  actionStatus.textContent = text;
  actionStatus.className = isError ? 'status-err' : 'status-ok';
  setTimeout(() => {
    actionStatus.textContent = '';
    actionStatus.className = '';
  }, 4500);
}

// 1. Initialiser les options
chrome.runtime.sendMessage({ action: 'getDisplaySettings' }, res => {
  if (res) {
    optFourColumns.checked = !!res.fourColumns;
    optHideAds.checked = !!res.hideAds;
    optHideRecs.checked = !!res.hideRecommendations;
    optHideReviews.checked = !!res.hideReviews;
    optAutoRedirect.checked = !!res.autoRedirectOrigin;
    optShowQuickFrame.checked = res.showQuickFrame !== false;
  }
});

function saveOptions() {
  const settings = {
    fourColumns: optFourColumns.checked,
    hideAds: optHideAds.checked,
    hideRecommendations: optHideRecs.checked,
    hideReviews: optHideReviews.checked,
    autoRedirectOrigin: optAutoRedirect.checked,
    showQuickFrame: optShowQuickFrame.checked
  };
  chrome.runtime.sendMessage({ action: 'saveDisplaySettings', settings });
}

[optFourColumns, optHideAds, optHideRecs, optHideReviews, optAutoRedirect, optShowQuickFrame].forEach(el => {
  el.addEventListener('change', saveOptions);
});

// 2. Détecter l'onglet actif et lire le statut de la fiche
async function readTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  activeTab = tab;

  if (!tab || !tab.url || !/amazon\.(fr|de|it|es|co\.uk)/i.test(tab.url)) {
    diagContent.innerHTML = '<em>Ouvrez une page article Amazon pour afficher les contrôles et diagnostics.</em>';
    return;
  }

  let res = null;
  try {
    res = await chrome.tabs.sendMessage(tab.id, { action: 'status' });
  } catch (err) {
    // Si le content script n'est pas encore injecté ou a été déconnecté (ex: rechargement de l'extension)
    try {
      if (chrome.scripting && tab.id) {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: [
            'core.js',
            'src/display/reviews-visibility.js',
            'src/display/shipping-lock.js',
            'src/display/affiliate-link.js',
            'src/display/quick-frame.js',
            'amazon.js'
          ]
        });
        await new Promise(r => setTimeout(r, 120));
        res = await chrome.tabs.sendMessage(tab.id, { action: 'status' });
      }
    } catch (e2) {
      console.warn('Auto-injection content script :', e2);
    }
  }

  // Fallback direct dans la page si toujours aucune réponse de status
  if (!res && chrome.scripting && tab.id) {
    try {
      const direct = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          const tEl = document.querySelector('#productTitle');
          const pEl = document.querySelector('.priceToPay .a-offscreen, .apexPriceToPay .a-offscreen, #price_inside_buybox, #usedPrice, .a-price .a-offscreen, .offer-price');
          const mEl = document.querySelector('#merchant-info');
          const mText = mEl ? mEl.textContent.trim() : '';
          const m = location.pathname.match(/\/(?:dp|gp\/product)\/([A-Z0-9]{10})/i);
          const asin = m ? m[1] : (document.querySelector('[name="ASIN"], #ASIN')?.value || '');
          const saveEl = document.querySelector('.savingsPercentage, .reinventPriceSavingsPercentageMargin');
          const basisEl = document.querySelector('.apex-basisprice-value .a-offscreen, .basisPrice .a-offscreen, .apex-basisprice-offscreen-label');
          const curEl = document.querySelector('.a-price-symbol');
          const eanEl = document.querySelector('.productMeta__code[data-copy], [data-copy]');
          const ean = eanEl?.getAttribute('data-copy') || null;

          return {
            product: {
              asin,
              title: tEl ? tEl.textContent.trim() : '',
              price: pEl ? pEl.textContent.trim() : '',
              formattedPrice: pEl ? pEl.textContent.trim() : '',
              discountRate: saveEl ? saveEl.textContent.trim() : null,
              referencePrice: basisEl ? basisEl.textContent.trim() : null,
              currencySymbol: curEl ? curEl.textContent.trim() : '€',
              ean,
              url: location.href
            },
            logistics: {
              kind: /amazon/i.test(mText) ? 'amazon' : 'unknown',
              code: /amazon/i.test(mText) ? 'AMAZON' : 'À VÉRIFIER',
              label: mText || 'Vendeur Amazon',
              seller: mText,
              ship: mText
            }
          };
        }
      });
      if (direct && direct[0]?.result?.product) {
        res = direct[0].result;
      }
    } catch (e3) {
      console.warn('Fallback direct :', e3);
    }
  }

  try {
    if (!res) throw new Error('Aucune réponse du script Amazon');

    const p = res.product || {};
    const log = res.logistics || {};
    const lock = res.shippingRestriction || null;
    const ss = res.siteStripe || null;
    const aff = res.affiliate || null;
    const kind = log.kind || 'unknown';
    const code = log.code || 'À VÉRIFIER';

    const country = aff?.country || globalThis.ALAffiliate?.resolveDefinedCountry?.(tab.url) || null;
    const quickUrl = aff?.quickUrl || globalThis.ALAffiliate?.buildQuickAffiliateLink?.(tab.url, {
      trackingId: aff?.activeTag || '',
      asin: p.asin || ''
    })?.url || tab.url;

    if (country) {
      affiliateSection.style.display = '';
      const infoBits = [`${country.flag} ${country.code}`];
      if (ss?.present) {
        infoBits.push('SiteStripe actif');
        if (ss.commissionRate) infoBits.push(ss.commissionRate);
        if (ss.category) infoBits.push(ss.category);
      }
      if (aff?.activeTag) {
        infoBits.push(`Tag : ${aff.activeTag}`);
      } else {
        infoBits.push('Aucun tag configuré');
      }
      affiliateMeta.textContent = infoBits.join(' · ');
      affiliateUrlInput.value = quickUrl;
      btnSiteStripe.style.display = ss?.present && ss?.canTriggerGetLink ? '' : 'none';
    }

    if (!p.title && !p.asin) {
      currentProductData = null;
      diagContent.innerHTML = `<em>Page Amazon (${escapeHtml(country?.code || 'Marketplace')}) — ouvrez un article pour le diagnostic vendeur.</em>`;
      return;
    }

    const displayPrice = p.formattedPrice || p.price || '--';

    currentProductData = {
      asin: p.asin || 'Inconnu',
      title: p.title || 'Produit sans titre',
      price: p.price || null,
      condition: p.condition || null,
      discountRate: p.discountRate || null,
      referencePrice: p.referencePrice || null,
      newPrice: p.newPrice || null,
      formattedPrice: p.formattedPrice || null,
      ean: p.ean || null,
      currencySymbol: p.currencySymbol || '€',
      url: quickUrl || p.url || tab.url,
      kind: log.kind,
      code: log.code,
      label: log.label,
      seller: log.seller,
      ship: log.ship,
      shippingRestriction: lock?.blocked ? lock : null,
      marketplace: (tab.url.match(/amazon\.([a-z.]+)/i)?.[1] || 'fr').toUpperCase()
    };

    diagContent.innerHTML = `
      ${lock?.blocked ? `
        <div class="lock-box">
          <strong>🔒 ${escapeHtml(lock.title || 'LOCK pays')}</strong>
          <span>${escapeHtml(lock.explanation)}</span>
          ${lock.detectedMessage ? `<span class="lock-quote">« ${escapeHtml(lock.detectedMessage)} »</span>` : ''}
        </div>
      ` : ''}
      <div style="margin-bottom:6px;">
        <span class="badge-kind badge-${kind}">[${code}]</span>
        <strong>${escapeHtml(cleanLogisticsLabel(log.label) || 'Vendeur / expéditeur')}</strong>
      </div>
      <div><strong>Vendeur :</strong> ${escapeHtml(log.seller || 'Non identifié')}</div>
      <div><strong>Expéditeur :</strong> ${escapeHtml(log.ship || 'Non identifié')}</div>
      ${p.asin ? `
        <div style="margin-top:4px;color:#64748b;font-size:11px;">
          ASIN : <code>${escapeHtml(p.asin)}</code> · Prix : <strong>${escapeHtml(displayPrice)}${displayPrice && /[$€£]/.test(displayPrice) ? '' : ' ' + escapeHtml(p.currencySymbol || '€')}</strong>
          ${getDiscountDealInfo(p.discountRate) ? `<span style="margin-left:6px;background:${getDiscountDealInfo(p.discountRate).color};color:#fff;padding:1px 6px;border-radius:4px;font-weight:700;font-size:10.5px;">${getDiscountDealInfo(p.discountRate).badge} ${getDiscountDealInfo(p.discountRate).rateStr} ${getDiscountDealInfo(p.discountRate).flames}</span>` : ''}
        </div>
      ` : ''}
      ${p.ean ? `
        <div style="margin-top:4px;color:#64748b;font-size:11px;">
          🔍 EAN : <a href="https://www.barcodelookup.com/${escapeHtml(p.ean)}" target="_blank" style="color:#0284c7;font-weight:600;text-decoration:underline;"><code>${escapeHtml(p.ean)}</code> (BarcodeLookup ↗)</a>
        </div>
      ` : ''}
      <div style="margin-top:8px;padding:6px 8px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:6px;font-size:11px;color:#166534;">
        <strong>💸 Cashback & Bons plans :</strong><br>
        • <a href="https://wanteeed.com/join/5e2977dce7a94e7186be8e58c6d9141b" target="_blank" style="color:#15803d;font-weight:600;text-decoration:underline;">Wanteeed (jusqu’à 1,5%)</a>
        · <a href="https://www.poulpeo.com/p/o039ab" target="_blank" style="color:#15803d;font-weight:600;text-decoration:underline;">Poulpeo (+5€)</a>
        · <a href="https://fr.igraal.com/parrainage?parrain=bleachcore&utm_medium=raf&utm_source=refer_friend" target="_blank" style="color:#15803d;font-weight:600;text-decoration:underline;">iGraal (+3€)</a>
        · <a href="https://www.topcashback.fr/ref/dracoule" target="_blank" style="color:#15803d;font-weight:600;text-decoration:underline;">TopCashback</a>
      </div>
      <div style="margin-top:6px;padding:6px 8px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:6px;font-size:11px;color:#1e40af;">
        <strong>🧩 Extensions Chrome recommandées :</strong><br>
        • <a href="https://chromewebstore.google.com/detail/vinthelp/kjkbijmnpmphddjhjkilaobilleokmkg" target="_blank" style="color:#1d4ed8;font-weight:600;text-decoration:underline;">👗 VintHelp (dressing Vinted)</a>
        · <a href="https://chromewebstore.google.com/detail/boosthelp/flfbfonaffaokkifdnpkgkaiaadcfcin" target="_blank" style="color:#1d4ed8;font-weight:600;text-decoration:underline;">⚡ BoostHelp (boosts favoris Vinted)</a>
      </div>
      ${res.originRedirect ? `
        <div style="margin-top:8px;padding:6px 8px;background:#e0f2fe;border:1px solid #7dd3fc;border-radius:6px;font-size:11px;color:#0369a1;">
          <strong>${escapeHtml(res.originRedirect.flag)} Redirigé depuis Amazon ${escapeHtml(res.originRedirect.name)}</strong><br>
          <a href="${escapeHtml(res.originRedirect.cleanUrl)}" target="_blank" style="color:#0284c7;font-weight:600;text-decoration:underline;">↗ Ouvrir la fiche d’origine</a>
        </div>
      ` : ''}
    `;
  } catch (err) {
    diagContent.innerHTML = `
      <em>Fiche non injectée ou page non article.</em><br>
      <small style="color:#64748b">Rechargez l'onglet Amazon si vous venez d'installer l'extension.</small>
    `;
  }
}

function cleanLogisticsLabel(label) {
  if (!label) return 'Expéditeur non identifié';
  let s = String(label).trim();
  s = s.replace(/\s*·\s*(?:exp[ée]di[ée]\s+par|shipped\s+by|dispatched\s+by|versand\s+durch|enviado\s+por|spedito\s+da)\s+.*$/i, '').trim();
  return s || label;
}

function getDiscountDealInfo(discountRate) {
  if (!discountRate && discountRate !== 0) return null;
  const match = String(discountRate).match(/(\d+)/);
  if (!match) return null;
  const percentage = parseInt(match[1], 10);
  if (percentage <= 0) return null;
  const rateStr = `-${percentage}%`;
  if (percentage >= 71) {
    return { percentage, rateStr, badge: '🔴', flames: '🔥🔥🔥', color: '#dc2626' };
  } else if (percentage >= 51) {
    return { percentage, rateStr, badge: '🟠', flames: '🔥🔥', color: '#ea580c' };
  } else {
    return { percentage, rateStr, badge: '🟢', flames: '🔥', color: '#16a34a' };
  }
}

function escapeHtml(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

readTab();

// 3. Actions
btnCopyAffiliate.onclick = async () => {
  const targetUrl = affiliateUrlInput.value.trim();
  if (!targetUrl) return;
  try {
    await navigator.clipboard.writeText(targetUrl);
    setStatus('✅ Lien rapide copié !');
  } catch {
    affiliateUrlInput.select();
    setStatus('❌ Copie refusée, utilisez Ctrl+C', true);
  }
};

btnSiteStripe.onclick = async () => {
  if (!activeTab?.id) return;
  setStatus('Ouverture SiteStripe…');
  try {
    const res = await chrome.tabs.sendMessage(activeTab.id, { action: 'triggerSiteStripeShortLink' });
    setStatus(res?.ok ? '✅ ' + res.message : 'ℹ️ ' + (res?.message || 'Vérifiez la page Amazon'), !res?.ok);
  } catch {
    setStatus('❌ Impossible de contacter SiteStripe sur cet onglet', true);
  }
};

document.getElementById('btnDiscord').onclick = async () => {
  if (!currentProductData) {
    setStatus('Aucune fiche produit détectée', true);
    return;
  }
  setStatus('Envoi vers Discord…');
  chrome.runtime.sendMessage({ action: 'sendDiscord', data: currentProductData }, res => {
    if (res?.ok) {
      setStatus('✅ Partagé sur Discord avec succès !');
    } else {
      setStatus('❌ ' + (res?.error || 'Échec d’envoi'), true);
    }
  });
};

if (document.getElementById('btnTelegram')) {
  document.getElementById('btnTelegram').onclick = async () => {
    if (!currentProductData) {
      setStatus('Aucune fiche produit détectée', true);
      return;
    }
    setStatus('Envoi vers Telegram…');
    chrome.runtime.sendMessage({ action: 'sendTelegram', data: currentProductData }, res => {
      if (res?.ok) {
        setStatus('✅ Partagé sur Telegram avec succès !');
      } else {
        setStatus('❌ ' + (res?.error || 'Échec d’envoi'), true);
      }
    });
  };
}

document.getElementById('btnGitHub').onclick = () => {
  if (!activeTab?.id) return;
  setStatus('Lancement du partage GitHub…');
  chrome.runtime.sendMessage({ action: 'triggerQuickShare', tabId: activeTab.id }, res => {
    if (res?.ok) {
      setStatus('✅ Capture envoyée vers GitHub !');
    } else {
      setStatus('❌ ' + (res?.error || 'Erreur GitHub'), true);
    }
  });
};

document.getElementById('btnCollector').onclick = () => {
  const url = activeTab?.id ? `collector.html?tab=${activeTab.id}` : 'collector.html';
  chrome.tabs.create({ url: chrome.runtime.getURL(url) });
};

document.getElementById('linkReload').onclick = e => {
  e.preventDefault();
  if (activeTab?.id) {
    chrome.tabs.reload(activeTab.id);
    window.close();
  }
};
