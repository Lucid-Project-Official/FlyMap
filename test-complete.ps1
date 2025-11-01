# Script de test complet avec une seule commande
# Teste tout: build, emulateur, installation, lancement

$ErrorActionPreference = "Continue"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TEST COMPLET - UNE SEULE COMMANDE" -ForegroundColor Cyan
Write-Host "  Build + Emulateur + Installation + Lancement" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "1. Verification de l'environnement..." -ForegroundColor Yellow

# Verifier ADB
$adbPath = Get-Command adb -ErrorAction SilentlyContinue
if (-not $adbPath) {
    Write-Host "  ERREUR: ADB non disponible" -ForegroundColor Red
    exit 1
}
Write-Host "  OK - ADB disponible" -ForegroundColor Green

# Verifier emulator
$emulatorPath = Get-Command emulator -ErrorAction SilentlyContinue
if (-not $emulatorPath) {
    $androidHome = $env:ANDROID_HOME
    if (-not $androidHome) {
        $androidHome = $env:ANDROID_SDK_ROOT
    }
    if ($androidHome) {
        $emulatorPath = "$androidHome\emulator\emulator.exe"
        if (-not (Test-Path $emulatorPath)) {
            $emulatorPath = $null
        }
    }
}

if ($emulatorPath) {
    if ($emulatorPath -is [System.Management.Automation.CommandInfo]) {
        $emulatorPath = $emulatorPath.Source
    }
    Write-Host "  OK - Emulateur disponible: $emulatorPath" -ForegroundColor Green
    
    # Lister AVDs
    $avdOutput = & "$emulatorPath" -list-avds 2>&1 | Out-String
    $avds = $avdOutput -split "`r?`n" | Where-Object { $_ -match '\S' }
    if ($avds.Count -gt 0) {
        Write-Host "  OK - $($avds.Count) AVD(s) disponible(s)" -ForegroundColor Green
    } else {
        Write-Host "  ATTENTION - Aucun AVD configure" -ForegroundColor Yellow
    }
} else {
    Write-Host "  ATTENTION - Emulateur non trouve" -ForegroundColor Yellow
}
Write-Host ""

Write-Host "2. Test du build..." -ForegroundColor Yellow
cd android
$buildResult = .\gradlew assembleDebug --no-daemon 2>&1 | Select-String -Pattern "BUILD SUCCESSFUL|BUILD FAILED"
cd ..

if ($buildResult -match "BUILD SUCCESSFUL") {
    Write-Host "  OK - Build reussi" -ForegroundColor Green
} else {
    Write-Host "  ERREUR - Build echoue" -ForegroundColor Red
    exit 1
}
Write-Host ""

Write-Host "3. Lancement avec npm run android..." -ForegroundColor Yellow
Write-Host "  (Ceci va lancer l'emulateur, Metro et l'application)" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Appuyez sur Ctrl+C pour arreter" -ForegroundColor Gray
Write-Host ""

# Lancer le script complet
npm run android

