document.getElementById('library').addEventListener('click', async () => {
  const {marketplaceOf}=await import(chrome.runtime.getURL('src/library/marketplaces.js'));
  const [tab]=await chrome.tabs.query({active:true,currentWindow:true});
  if(!tab?.id||!marketplaceOf(tab.url||'')){document.getElementById('status').textContent='Ouvrez Amazon FR, ES, IT, UK ou DE.';return;}
  await chrome.tabs.create({url:chrome.runtime.getURL('collector.html')+'?tab='+tab.id});
});
