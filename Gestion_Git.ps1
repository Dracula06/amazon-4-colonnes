param([ValidateSet('Init','Push','Update','Branch','Shell')][string]$Action)
$ErrorActionPreference='Stop'
$Expected='https://github.com/Dracula06/amazon-4-colonnes.git'
function G { param([string[]]$GitArgs) $ErrorActionPreference='Continue'; & git @GitArgs; if($LASTEXITCODE -ne 0){throw ('Git a refuse : git '+($GitArgs -join ' '))} }
function Capture {param([string[]]$GitArgs) $ErrorActionPreference='Continue'; $r=@(& git @GitArgs 2>&1);if($LASTEXITCODE -ne 0){throw ($r -join "`n")};return $r}
function Confirm([string]$Question){return ((Read-Host ($Question+' (O/N)')) -eq 'O')}
function Clean { $s=@(Capture @('status','--porcelain'));if($s.Count){G @('status','--short');throw 'Modifications locales presentes : commit/stash manuel requis. Aucun ecrasement automatique.'} }
function ValidateOrigin {
 $url=(Capture @('remote','get-url','origin')) -join ''
 if($url -notmatch '^(https://github\.com/Dracula06/amazon-4-colonnes(?:\.git)?/?|git@github\.com:Dracula06/amazon-4-colonnes(?:\.git)?)$'){throw ('Origin inattendu : '+$url)}
 $push=(Capture @('remote','get-url','--push','--all','origin'))
 foreach($u in $push){if($u -notmatch '^(https://github\.com/Dracula06/amazon-4-colonnes(?:\.git)?/?|git@github\.com:Dracula06/amazon-4-colonnes(?:\.git)?)$'){throw ('URL push inattendue : '+$u)}}
}
function UpdateBranch([string]$Branch){
 G @('check-ref-format','--branch',$Branch)
 G @('show-ref','--verify','--quiet',('refs/remotes/origin/'+$Branch))
 if(!(Confirm ('Basculer et mettre a jour la branche '+$Branch+' ?'))){return}
 & git show-ref --verify --quiet ('refs/heads/'+$Branch)
 if($LASTEXITCODE -eq 0){G @('switch',$Branch)}elseif($LASTEXITCODE -eq 1){G @('switch','-c',$Branch,'--track',('origin/'+$Branch))}else{throw 'Verification de branche impossible'}
 G @('merge','--ff-only',('origin/'+$Branch))
 $local=(Capture @('rev-parse','HEAD')) -join '';$remote=(Capture @('rev-parse',('origin/'+$Branch))) -join ''
 if($local -ne $remote){throw 'La branche locale contient des commits supplementaires. Aucun reset effectue.'}
 Clean;G @('status','--short','--branch');G @('log','-1','--oneline');Write-Host 'Mise a jour terminee. Rechargez ensuite votre extension dans Chrome/Brave.' -ForegroundColor Green
}
try {
 if(!(Get-Command git -ErrorAction SilentlyContinue)){throw 'Git est absent du PATH. Installez Git for Windows.'}
 $root=$PSScriptRoot
 if(Test-Path -LiteralPath (Join-Path $root '.git')){$repo=$root}elseif(Test-Path -LiteralPath (Join-Path $root 'Repo\.git')){$repo=Join-Path $root 'Repo'}else{$repo=$root}
 Set-Location -LiteralPath $repo
 Write-Host "AMAZON 4 COLONNES - $Action`nDossier : $repo" -ForegroundColor Cyan
 if($Action -eq 'Init'){
  if(!(Test-Path -LiteralPath (Join-Path $repo '.git'))){
   $savedPreference = $ErrorActionPreference
   try {
    $ErrorActionPreference = 'Continue'
    & git rev-parse --show-toplevel 2>$null | Out-Null
    $probeExitCode = $LASTEXITCODE
   } finally {
    $ErrorActionPreference = $savedPreference
   }
   $LASTEXITCODE = $probeExitCode
   if($LASTEXITCODE -eq 0){throw 'Ce dossier appartient deja a un depot parent. Initialisation annulee.'}
   if(!(Test-Path -LiteralPath (Join-Path $repo 'manifest.json'))){throw 'manifest.json introuvable : placez les scripts avec les fichiers de votre extension.'}
   if(!(Confirm ('Initialiser ce dossier et le relier a '+$Expected+' ?'))){return}
   G @('init','-b','main');G @('remote','add','origin',$Expected)
  }else{
   $remotes=Capture @('remote');if($remotes -notcontains 'origin'){if(!(Confirm ('Ajouter origin '+$Expected+' ?'))){return};G @('remote','add','origin',$Expected)}
  }
  ValidateOrigin;G @('fetch','origin');G @('status','--short','--branch')
  Write-Host 'Depot pret. Utilisez Envoyer_vers_GitHub.bat pour le premier commit et le premier push.' -ForegroundColor Green
  return
 }
 if(!(Test-Path -LiteralPath (Join-Path $repo '.git'))){throw 'Depot absent. Lancez Initialiser_GitHub.bat une fois.'}
 $top=(Capture @('rev-parse','--show-toplevel')) -join ''
 if([IO.Path]::GetFullPath($top).TrimEnd('\','/') -ine [IO.Path]::GetFullPath($repo).TrimEnd('\','/')){throw 'Le depot detecte ne correspond pas au dossier attendu.'}
 if($Action -eq 'Shell'){
  $env:AMAZON_EXTENSION_REPO=$repo
  Start-Process powershell.exe -WorkingDirectory $repo -ArgumentList '-NoExit','-Command','Set-Location -LiteralPath $env:AMAZON_EXTENSION_REPO'
  return
 }
 ValidateOrigin
 if($Action -eq 'Update' -or $Action -eq 'Branch'){
  Clean;G @('fetch','--prune','origin')
  $branch='main'
  if($Action -eq 'Branch'){
   $refs=@(Capture @('for-each-ref','--format=%(refname:strip=3)','refs/remotes/origin')) | Where-Object {$_ -ne 'HEAD'}
   if(!$refs.Count){throw 'Aucune branche distante : faites le premier envoi.'}
   for($i=0;$i -lt $refs.Count;$i++){Write-Host ('[{0}] {1}' -f ($i+1),$refs[$i])}
   $choice=Read-Host 'Numero ou nom exact [main], 0 pour annuler'
   if($choice -eq '0'){return}
   if($choice){$n=0;if([int]::TryParse($choice,[ref]$n)){if($n -lt 1 -or $n -gt $refs.Count){throw 'Numero invalide'};$branch=$refs[$n-1]}else{$branch=$choice}}
  }
  UpdateBranch $branch;return
 }
 if($Action -eq 'Push'){
  $branch=(Capture @('symbolic-ref','--short','HEAD')) -join ''
  if($branch -ne 'main'){throw ('Envoi autorise sur main uniquement. Branche actuelle : '+$branch)}
  G @('fetch','origin')
  & git show-ref --verify --quiet refs/remotes/origin/main
  if($LASTEXITCODE -eq 0){
   G @('rev-parse','--verify','HEAD')
   & git merge-base --is-ancestor origin/main HEAD
   if($LASTEXITCODE -ne 0){throw 'main distant contient des commits absents localement : synchronisez avant envoi. Pas de pull automatique sur vos fichiers modifies.'}
  }elseif($LASTEXITCODE -ne 1){throw 'Impossible de verifier origin/main'}
  $staged=@(Capture @('diff','--cached','--name-only'))
  if($staged.Count){throw 'Staging deja present. Verifiez-le et traitez-le manuellement avant de relancer.'}
  G @('status','--short')
  if(!(Confirm 'Preparer tous les changements non ignores pour le commit ?')){return}
  G @('add','-A')
  $paths=@(Capture @('diff','--cached','--name-only'))
  if($paths.Count){
   $bad=@($paths | Where-Object {$_ -match '(^|/)(node_modules|Archives|dist|\.codex|\.codex-remote-attachments)(/|$)|(^|/)\.env($|\.)|\.(pem|p12|pfx|sqlite|sqlite3|har)$|(^|/)(grok\.json|paste\.txt)$'})
   if($bad.Count){Write-Host ($bad -join "`n");throw 'Fichiers sensibles/volumineux suspects prepares : envoi bloque. Ils restent dans le staging pour verification.'}
   G @('diff','--cached','--check');G @('diff','--cached','--stat');G @('diff','--cached','--name-status')
   Write-Host 'Controle de noms seulement : pas une analyse complete des secrets.' -ForegroundColor Yellow
   $message=Read-Host 'Message du commit'
   if([string]::IsNullOrWhiteSpace($message)){throw 'Message obligatoire. Staging conserve.'}
   if(!(Confirm 'Creer le commit puis envoyer sur GitHub ?')){Write-Host 'Annule. Staging conserve.';return}
   G @('commit','-m',$message)
  }else{if(!(Confirm 'Aucun nouveau fichier modifie. Envoyer les commits locaux existants ?')){return}}
  G @('push','-u','origin','main');G @('status','--short','--branch');G @('log','-1','--oneline')
  Write-Host 'Envoi termine.' -ForegroundColor Green
 }
}catch{Write-Host ('ERREUR : '+$_.Exception.Message) -ForegroundColor Red;Write-Host 'Pas de reset --hard, de clean, de stash, ni de push force automatique. Des etapes precedentes peuvent avoir reussi.';exit 1}
