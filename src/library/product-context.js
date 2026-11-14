export function extractProductContext(report){
 const doc=new DOMParser().parseFromString(report.html,'text/html');const ppd=doc.querySelector('#ppd');
 const text=e=>(e?.textContent||'').replace(/\s+/g,' ').trim();
 const hidden=e=>!!e?.closest('[hidden],.aok-hidden,.a-hidden,.a-popover-preload,[aria-hidden="true"]')||/display\s*:\s*none|visibility\s*:\s*hidden/i.test(e?.getAttribute('style')||'');
 const ad=e=>!!e.closest('iframe,.ape-placement,[id^="ape_"],[data-component-type="sp-sponsored-result"]');
 const rows=[];
 for(const el of doc.querySelectorAll('#corePriceDisplay_desktop_feature_div [data-csa-c-price-to-pay],#corePrice_feature_div [data-csa-c-price-to-pay]')){
  if(ad(el)||!ppd?.contains(el))continue;
  const own=el.closest('[data-csa-c-asin]')?.getAttribute('data-csa-c-asin');if(own&&own!==report.metadata.asin)continue;
  rows.push({asin:report.metadata.asin,source:'price-block-structured',buyingOption:el.getAttribute('data-csa-c-buying-option-type'),price:el.getAttribute('data-csa-c-price-to-pay'),shipping:el.getAttribute('data-csa-c-shipping-charge'),reference:el.getAttribute('data-csa-c-strike-through-price'),referenceLabel:text(el.querySelector('.apex-basisprice-label')||el.parentElement?.querySelector('.apex-basisprice-label')).slice(0,100),currencySymbol:text(el.querySelector('.a-price-symbol')),explicitlyHidden:hidden(el),activeOfferConfirmed:false});
 }
 const merchants=[];
 for(const el of doc.querySelectorAll('#ppd .offer-display-features-container,#ppd [id="merchant-info"],#ppd [id*="usedBuyBox"],#ppd [id*="usedOnlyBuybox"],#ppd [id="usedBuySection"]')){
  if(ad(el))continue;const ship=el.querySelector('[offer-display-feature-name="desktop-fulfiller-info"] .offer-display-feature-text-message, [id*="SSOFpopoverLink"]');const seller=el.querySelector('[offer-display-feature-name="desktop-merchant-info"] .offer-display-feature-text-message, [id="sellerProfileTriggerId"]');
  const shipText=text(ship),sellerText=text(seller);if(!shipText&&!sellerText&&!text(el))continue;
  merchants.push({asin:report.metadata.asin,source:el.id==='merchant-info'?'merchant-info':(el.id?.includes('used')?'used-buybox':'offer-display-features-container'),slot:el.closest('[data-csa-c-slot-id]')?.getAttribute('data-csa-c-slot-id')||null,shipMessage:shipText.slice(0,180),sellerMessage:sellerText.slice(0,180),combinedMessage:el.id==='merchant-info'?text(el).slice(0,240):null,explicitlyHidden:hidden(el),activeOfferConfirmed:false});
 }
 const imports=[...doc.querySelectorAll('#ppd [id*="globalStoreBadgePopover"],#ppd [id="amazonGlobal_feature_div"]')].filter(e=>!ad(e)&&text(e)).map(e=>({source:e.id,text:text(e).slice(0,350),explicitlyHidden:hidden(e),activeOfferConfirmed:false}));
 const financing=[...doc.querySelectorAll('#ppd [id^="comparison-table-total-amount-"],#ppd [id^="comparison-table-interest-amount-"]')].filter(e=>!ad(e)&&text(e)).map(e=>({source:e.id,text:text(e).slice(0,100),explicitlyHidden:hidden(e),eligibilityConfirmed:false}));
 return {version:1,asin:report.metadata.asin,prices:rows.slice(0,12),merchantCandidates:merchants.slice(0,12),importSignals:imports.slice(0,6),financing:financing.slice(0,12),counts:{prices:rows.length,merchants:merchants.length,imports:imports.length,financing:financing.length},limits:['Candidats du produit principal uniquement, pas une offre active certifiée','Visibilité repérée par attributs/classes, pas calcul CSS complet','Le masquage des ancêtres par style peut échapper à cette première détection','Prix conseillé différent d’un historique de prix ; montants observés pas une garantie de commande','Financement présent dans le DOM ne prouve pas éligibilité','Résumés bornés ; détails conservés dans les fragments']};
}
