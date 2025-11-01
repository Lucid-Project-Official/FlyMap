# Script PowerShell pour lancer Android avec logs adb automatiques
# Ce script garantit que TOUTES les dependances sont installees et compilees

param(
    [switch]$Clean = $false
)

$ErrorActionPreference = "Continue"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Lancement Android avec logs ADB" -ForegroundColor Cyan
Write-Host "  Configuration automatique complete" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verifier que ADB est disponible
$adbPath = Get-Command adb -ErrorAction SilentlyContinue
if (-not $adbPath) {
    Write-Host "ERREUR: ADB n'est pas dans le PATH" -ForegroundColor Red
    Write-Host "Assurez-vous que Android SDK Platform Tools est installe" -ForegroundColor Yellow
    exit 1
}

# Verifier qu'un appareil/emulateur est connecte
Write-Host "1. Verification de la connexion Android..." -ForegroundColor Yellow
$devices = adb devices | Select-String -Pattern "device$" | Measure-Object
if ($devices.Count -eq 0) {
    Write-Host "ERREUR: Aucun appareil Android connecte" -ForegroundColor Red
    Write-Host "Demarrez un emulateur ou connectez un appareil physique" -ForegroundColor Yellow
    exit 1
}
Write-Host "   ✓ Appareil Android detecte" -ForegroundColor Green
Write-Host ""

# Configuration complete si demande
if ($Clean) {
    Write-Host "2. Configuration complete du projet..." -ForegroundColor Yellow
    .\setup-complete.ps1
    Write-Host ""
}

# Generer le fichier autolinking.json si necessaire
Write-Host "2. Verification du fichier autolinking.json..." -ForegroundColor Yellow
$autolinkingDir = "android\build\generated\autolinking"
$autolinkingFile = "$autolinkingDir\autolinking.json"

if (-not (Test-Path $autolinkingFile)) {
    Write-Host "   Generation du fichier autolinking.json avec TOUTES les dependances..." -ForegroundColor Cyan
    New-Item -ItemType Directory -Force -Path $autolinkingDir | Out-Null
    npx react-native config --platform android | Out-File -FilePath $autolinkingFile -Encoding utf8
    Write-Host "   ✓ Fichier autolinking.json genere" -ForegroundColor Green
} else {
    Write-Host "   ✓ Fichier autolinking.json existe deja" -ForegroundColor Green
}
Write-Host ""

# Lancer adb logcat dans une nouvelle fenetre PowerShell
Write-Host "3. Lancement des logs ADB dans une nouvelle fenetre..." -ForegroundColor Yellow
$logcatScriptContent = @'
$host.ui.RawUI.WindowTitle = "ADB Logcat - FlyMap"
$host.ui.RawUI.ForegroundColor = "White"
$host.ui.RawUI.BackgroundColor = "Black"
Clear-Host
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Logs ADB - Application FlyMap" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Filtrage des logs pour com.flymap..." -ForegroundColor Yellow
Write-Host "Appuyez sur Ctrl+C pour arreter" -ForegroundColor Gray
Write-Host ""
adb logcat -c
adb logcat | Select-String -Pattern "com\.flymap"
'@

$logcatFile = "$env:TEMP\flymap-logcat.ps1"
Set-Content -Path $logcatFile -Value $logcatScriptContent

Start-Process powershell -ArgumentList "-NoExit", "-File", "`"$logcatFile`""
Write-Host "   ✓ Fenetre de logs ADB ouverte" -ForegroundColor Green
Write-Host ""

# Attendre un peu pour que la fenetre se lance
Start-Sleep -Seconds 2

# Lancer l'application Android
Write-Host "4. Lancement de l'application Android..." -ForegroundColor Yellow
Write-Host ""
npm run android:direct -- --no-packager
