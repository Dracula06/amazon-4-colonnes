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

  try {
    const res = await chrome.tabs.sendMessage(tab.id, { action: 'status' });
    if (!res) throw new Error('Aucune réponse');

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

    currentProductData = {
      asin: p.asin || 'Inconnu',
      title: p.title || 'Produit sans titre',
      price: p.price || null,
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
        <strong>${escapeHtml(log.label || 'Vendeur / expéditeur')}</strong>
      </div>
      <div><strong>Vendeur :</strong> ${escapeHtml(log.seller || 'Non identifié')}</div>
      <div><strong>Expéditeur :</strong> ${escapeHtml(log.ship || 'Non identifié')}</div>
      ${p.asin ? `<div style="margin-top:4px;color:#64748b;font-size:11px;">ASIN : <code>${escapeHtml(p.asin)}</code> · Prix : <strong>${escapeHtml(p.price || '--')}${p.price && /[$€£]/.test(p.price) ? '' : ' ' + escapeHtml(p.currencySymbol || '€')}</strong></div>` : ''}
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
