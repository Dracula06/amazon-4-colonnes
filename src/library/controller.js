import {capturePage} from './capture.js';
import {sanitizeCapture} from './sanitize.js';
import {downloadJSON} from './export.js';
import {allowGitHub,uploadCapture} from './github.js';
const $=id=>document.getElementById(id);let raw=null;
const tabId=Number(new URL(location.href).searchParams.get('tab'));
const status=s=>$('status').textContent=s;
function invalidate(){ $('reviewed').checked=false; $('upload').disabled=true; }
$('capture').onclick=async()=>{try{$('capture').disabled=true;raw=await capturePage(tabId);$('raw').disabled=false;$('prepare').disabled=false;$('download').disabled=true;$('preview').value='';invalidate();status('DOM complet capturé en mémoire. Exportez le brut si vous souhaitez le conserver.');}catch(e){status(e.message)}finally{$('capture').disabled=false}};
$('raw').onclick=()=>{if(!raw)return;if(!confirm('Exporter le brut complet sur votre disque ? Il peut contenir des données personnelles et jetons. Ne le publiez pas et gardez-le hors du dépôt Git.'))return;downloadJSON(raw,'amazon-brut-local-'+Date.now()+'.json');};
$('prepare').onclick=()=>{try{const report=sanitizeCapture(raw,$('context').value,$('notes').value);$('preview').value=JSON.stringify(report,null,2);$('download').disabled=false;invalidate();status('Copie filtrée préparée. Relisez ou modifiez tout le JSON avant publication.');}catch(e){status(e.message)}};
$('preview').oninput=invalidate;for(const id of ['notes','context'])$(id).addEventListener('input',()=>{$('preview').value='';$('download').disabled=true;invalidate();status('Contexte modifié : préparez à nouveau la copie.');});
$('reviewed').onchange=()=>{$('upload').disabled=!$('reviewed').checked||!$('preview').value;};
$('download').onclick=()=>{try{downloadJSON(JSON.parse($('preview').value),'amazon-copie-filtree-'+Date.now()+'.json')}catch(e){status('JSON invalide : '+e.message)}};
$('forget').onclick=()=>{$('token').value='';status('Jeton effacé.');};
$('upload').onclick=async()=>{
  if(!$('reviewed').checked)return;
  const exact=$('preview').value;
  let report;try{report=JSON.parse(exact);}catch(e){status('JSON invalide');return;}
  if(!report.metadata||typeof report.html!=='string'||!report.sanitization){status('Structure de rapport invalide');return;}
  if(!confirm('Publier cette copie dans Dracula06/amazon-dom-captures, branche main ? Un nouveau fichier sera créé, sans écraser les captures existantes.'))return;
  try{const permission=await allowGitHub();if(!permission)throw Error('Permission GitHub refusée');$('upload').disabled=true;const result=await uploadCapture(report,$('token').value);status('Envoyé : '+result.path+'\n'+(result.url||'')+'\nAvant une prochaine capture, synchronisez votre dépôt local avec votre BAT.');$('reviewed').checked=false;}catch(e){status(e.message);$('upload').disabled=!$('reviewed').checked;}
};
status('Cette page reste ouverte pour conserver le brut et le jeton uniquement en mémoire. Fermez-la pour les effacer.');
