document.getElementById('library').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({active:true,currentWindow:true});
  if (!tab?.id || !/^https:\/\/www\.amazon\.fr\//.test(tab.url || '')) {
    document.getElementById('status').textContent = 'Ouvrez une page Amazon.fr.'; return;
  }
  await chrome.tabs.create({url:chrome.runtime.getURL('collector.html')+'?tab='+tab.id});
});
