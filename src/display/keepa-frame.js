(() => {
  if (window.self === window.top) return;

  let currentZoom = 0.9;

  function applyStyles() {
    let style = document.getElementById('al-keepa-frame-style');
    if (!style) {
      style = document.createElement('style');
      style.id = 'al-keepa-frame-style';
      (document.head || document.documentElement).appendChild(style);
    }
    style.textContent = `
      .knav,
      header,
      [role="banner"],
      #loginOverlay,
      #loginOverlayBox {
        display: none !important;
        visibility: hidden !important;
        height: 0 !important;
        min-height: 0 !important;
        margin: 0 !important;
        padding: 0 !important;
        overflow: hidden !important;
      }
      html, body {
        padding-top: 0 !important;
        margin-top: 0 !important;
        zoom: ${currentZoom} !important;
      }
      #content {
        padding-top: 0 !important;
        margin-top: 0 !important;
        top: 0 !important;
      }
    `;
  }

  applyStyles();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyStyles);
  }

  window.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'KEEPA_SET_ZOOM' && typeof event.data.zoom === 'number') {
      currentZoom = Math.max(0.5, Math.min(1.5, event.data.zoom));
      applyStyles();
    }
  });

  // Extraction automatique de l'EAN dans la surimpression Keepa
  let detectedEan = null;

  function findKeepaEan() {
    // 1. Chercher dans les éléments .productMeta__code avec data-copy ou .productMeta__label
    const codes = document.querySelectorAll('.productMeta__code, [data-copy], .productMeta__i > span');
    for (const el of codes) {
      const label = el.querySelector?.('.productMeta__label')?.textContent || el.textContent || '';
      if (/(?:EAN|GTIN|UPC|ISBN|Barcode)/i.test(label)) {
        const copyVal = el.getAttribute?.('data-copy');
        const textVal = el.querySelector?.('.productMeta__value')?.textContent;
        const raw = copyVal || textVal || '';
        const cleaned = raw.replace(/[\s\u00a0\u202f-]/g, '').trim();
        const m = cleaned.match(/\b(\d{8}|\d{12}|\d{13}|\d{14})\b/);
        if (m) return m[1];
      }
    }

    // 2. Chercher dans l'ensemble du DOM Keepa au cas où
    const metaContainer = document.querySelector('.productMeta__i, #productMeta, #productDetails');
    if (metaContainer) {
      const t = metaContainer.textContent || '';
      const m = t.match(/EAN\s*[:·-]?\s*([\d\s-]{8,20})/i);
      if (m) {
        const cleaned = m[1].replace(/[\s\u00a0\u202f-]/g, '').trim();
        const bm = cleaned.match(/\b(\d{8}|\d{12}|\d{13}|\d{14})\b/);
        if (bm) return bm[1];
      }
    }

    return null;
  }

  function checkAndNotifyEan() {
    if (detectedEan) return;
    const ean = findKeepaEan();
    if (ean) {
      detectedEan = ean;
      try {
        window.parent.postMessage({
          type: 'KEEPA_DETECTED_EAN',
          ean,
          url: location.href
        }, '*');
      } catch {}
    }
  }

  try {
    const observer = new MutationObserver(() => {
      checkAndNotifyEan();
      if (detectedEan) observer.disconnect();
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  } catch {}

  const pollInterval = setInterval(() => {
    checkAndNotifyEan();
    if (detectedEan) clearInterval(pollInterval);
  }, 400);
  setTimeout(() => clearInterval(pollInterval), 15000);
})();
