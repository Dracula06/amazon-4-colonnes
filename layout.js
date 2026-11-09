(()=>{
const KEY='amazonFourColumnsEnabled';let enabled=true,timer,busy=false;const moves=[],classes=[],styles=[];let panel=null,css=null,last='';
function move(el,target,before=null){if(!el||!target||el===target||el.contains(target))return;if(el.parentNode===target&&!before)return;const marker=document.createComment('amazon-layout-original');el.before(marker);moves.push({el,marker});target.insertBefore(el,before);}
function mark(el,name){if(el&&!el.classList.contains(name)){el.classList.add(name);classes.push([el,name]);}}
function strip(el,name){if(el?.classList.contains(name)){el.classList.remove(name);classes.push([el,'!'+name]);}}
function restore(){busy=true;observer.disconnect();for(const {el,marker} of moves.reverse()){if(marker.isConnected){marker.replaceWith(el)}}moves.length=0;for(const [el,c]of classes){if(c[0]==='!')el.classList.add(c.slice(1));else el.classList.remove(c)}classes.length=0;panel?.remove();panel=null;css?.remove();css=null;busy=false;observe();}
function apply(){
if(busy)return;const ppd=document.querySelector('#ppd'),left=document.querySelector('#leftCol'),center=document.querySelector('#centerCol'),right=document.querySelector('#rightCol');
if(!enabled||innerWidth<1550){if(panel)restore();last=!enabled?'Désactivée.':'Fenêtre trop étroite : affichage Amazon conservé (minimum 1550 px).';return;}
if(!ppd||!left||!center||!right||!document.querySelector('#productTitle')){last='Aucune fiche compatible détectée.';return;}
if(panel&&!panel.isConnected){restore();}
busy=true;observer.disconnect();
try{
if(!panel){
panel=document.createElement('aside');panel.id='ald-other-offers';panel.setAttribute('aria-label','Autres offres Amazon');const h=document.createElement('h2');h.textContent='Autres offres';panel.append(h);ppd.append(panel);
css=document.createElement('style');css.textContent=`
#ppd.ald-layout{display:grid!important;grid-template-columns:minmax(0,1.35fr) minmax(300px,1fr) 244px 244px!important;gap:20px!important;align-items:start!important;}
#ppd.ald-layout::before,#ppd.ald-layout::after{display:none!important}
#ppd.ald-layout>#leftCol,#ppd.ald-layout>#centerCol,#ppd.ald-layout>#rightCol{float:none!important;position:static!important;inset:auto!important;width:auto!important;min-width:0!important;max-width:none!important;margin:0!important;grid-row:1!important;}
#ppd.ald-layout>#leftCol{grid-column:1!important}#ppd.ald-layout>#centerCol{grid-column:2!important}#ppd.ald-layout>#rightCol{grid-column:3!important;display:block!important;height:auto!important;visibility:visible!important;}
#ppd.ald-layout>#ald-other-offers{grid-column:4!important;grid-row:1!important;min-width:0;}
#ppd.ald-layout> :not(#leftCol):not(#centerCol):not(#rightCol):not(#ald-other-offers){grid-column:1/-1;min-width:0;}
#ald-other-offers>h2{font-size:18px;line-height:24px;margin:0 0 12px}#ald-other-offers>*{max-width:100%;box-sizing:border-box}#ald-other-offers .ald-note{font-size:12px;color:#565959;border:1px solid #ddd;padding:12px;border-radius:8px;}
#rightCol #desktop_buybox{width:100%!important;max-width:100%!important;}#leftCol #imageBlock_feature_div{max-width:100%!important;}#centerCol #title_feature_div{width:auto!important;}
`;document.head.append(css);mark(ppd,'ald-layout');for(const el of [left,center,right])strip(el,'dp-2col');
}
const buy=document.querySelector('#desktop_buybox');if(buy&&!right.contains(buy))move(buy,right,right.firstChild);
// Move the existing title group, never clone controls or prices.
const title=document.querySelector('#productTitle');if(title&&left.contains(title)){let group=title.closest('#title_elements_redesigned_left');if(!group)group=title.closest('#title_row_container')||title.closest('#title_feature_div');if(group)move(group,center,center.firstChild);}
for(const id of ['olpLinkWidget_feature_div','olp_feature_div','mbc_feature_div','usedBuySection']){
 const el=document.getElementById(id);if(!el||panel.contains(el)||el.contains(buy))continue;
 // Never detach an accordion row/radio offer from its enclosing buybox.
 if(buy?.contains(el)||el.querySelector('input[type="radio"]')||el.closest('[role="radiogroup"], .a-accordion'))continue;
 move(el,panel);
}
let note=panel.querySelector('.ald-note');if(panel.children.length===1){if(!note){note=document.createElement('p');note.className='ald-note';note.textContent='Aucun bloc indépendant d’autres vendeurs détecté. Les offres intégrées au cadre d’achat restent en place.';panel.append(note)}}else if(note&&panel.children.length>2)note.remove();
last='Disposition active. Les offres intégrées à un accordéon ne sont pas séparées.';
}catch(e){last='Erreur : '+e.message;}finally{busy=false;observe();}
}
const observer=new MutationObserver(()=>{clearTimeout(timer);timer=setTimeout(apply,700)});
function observe(){observer.observe(document.body,{childList:true,subtree:true})}
chrome.storage.local.get({[KEY]:true}).then(x=>{enabled=x[KEY];apply()});
chrome.storage.onChanged.addListener((changes,area)=>{if(area==='local'&&changes[KEY]){enabled=changes[KEY].newValue;if(!enabled)restore();apply()}});
addEventListener('resize',()=>{clearTimeout(timer);timer=setTimeout(apply,350)});
chrome.runtime.onMessage.addListener((m,s,r)=>{if(m.action==='status')r({message:last,width:innerWidth,active:!!panel})});
})();