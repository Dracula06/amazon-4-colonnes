$ErrorActionPreference = 'Stop'
try {
 $path=Join-Path $PSScriptRoot 'Gestion_Git.ps1'
 if(!(Test-Path -LiteralPath $path)){throw 'Placez ce correctif a cote de Gestion_Git.ps1.'}
 $source=[IO.File]::ReadAllText($path)
 $old="   & git rev-parse --show-toplevel 2>`$null | Out-Null"
 $new=@'
   $savedPreference = $ErrorActionPreference
   try {
    $ErrorActionPreference = 'Continue'
    & git rev-parse --show-toplevel 2>$null | Out-Null
    $probeExitCode = $LASTEXITCODE
   } finally {
    $ErrorActionPreference = $savedPreference
   }
   $LASTEXITCODE = $probeExitCode
'@
 if($source.Contains('$probeExitCode')){Write-Host 'Correctif deja applique.';exit 0}
 if(!$source.Contains($old)){throw 'Version de Gestion_Git.ps1 non reconnue. Aucun fichier modifie. Transmettez ce fichier a votre assistant.'}
 $g='function G { param([string[]]$GitArgs) & git @GitArgs;'
 $gNew="function G { param([string[]]`$GitArgs) `$ErrorActionPreference='Continue'; & git @GitArgs;"
 $cap='function Capture {param([string[]]$GitArgs) $r=@(& git @GitArgs 2>&1);'
 $capNew="function Capture {param([string[]]`$GitArgs) `$ErrorActionPreference='Continue'; `$r=@(& git @GitArgs 2>&1);"
 if(!$source.Contains($g) -or !$source.Contains($cap)){throw 'Fonctions Git non reconnues. Aucun fichier modifie.'}
 $updated=$source.Replace($old,$new).Replace($g,$gNew).Replace($cap,$capNew)
 $tokens=$null;$parseErrors=$null
 [void][System.Management.Automation.Language.Parser]::ParseInput($updated,[ref]$tokens,[ref]$parseErrors)
 if($parseErrors.Count){throw ('Erreur de syntaxe du correctif : '+($parseErrors.Message -join '; '))}
 $backup=$path+'.avant-correctif-'+(Get-Date -Format 'yyyyMMdd-HHmmss-fff')+'.bak'
 Copy-Item -LiteralPath $path -Destination $backup -ErrorAction Stop
 [IO.File]::WriteAllText($path,$updated,(New-Object System.Text.UTF8Encoding($true)))
 Write-Host 'Gestion_Git.ps1 corrige. Une sauvegarde a ete creee.' -ForegroundColor Green
 Write-Host 'Relancez maintenant Initialiser_GitHub.bat.'
} catch {Write-Host ('ERREUR : '+$_.Exception.Message) -ForegroundColor Red;exit 1}
