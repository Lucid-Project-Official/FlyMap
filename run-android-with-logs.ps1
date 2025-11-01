# Script PowerShell pour lancer Android avec logs adb automatiques
# Ce script garantit que TOUTES les dependances sont installees et compilees
# ET lance automatiquement l'emulateur si necessaire

param(
    [switch]$Clean = $false
)

$ErrorActionPreference = "Continue"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Lancement Android COMPLET" -ForegroundColor Cyan
Write-Host "  Configuration automatique + Emulateur + Application" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verifier que ADB est disponible
$adbPath = Get-Command adb -ErrorAction SilentlyContinue
if (-not $adbPath) {
    Write-Host "ERREUR: ADB n'est pas dans le PATH" -ForegroundColor Red
    Write-Host "Assurez-vous que Android SDK Platform Tools est installe" -ForegroundColor Yellow
    exit 1
}

# Configuration complete si demande
if ($Clean) {
    Write-Host "1. Configuration complete du projet..." -ForegroundColor Yellow
    .\setup-complete.ps1
    Write-Host ""
}

# Generer le fichier autolinking.json si necessaire
Write-Host "1. Verification du fichier autolinking.json..." -ForegroundColor Yellow
$autolinkingDir = "android\build\generated\autolinking"
$autolinkingFile = "$autolinkingDir\autolinking.json"

if (-not (Test-Path $autolinkingFile)) {
    Write-Host "   Generation du fichier autolinking.json avec TOUTES les dependances..." -ForegroundColor Cyan
    New-Item -ItemType Directory -Force -Path $autolinkingDir | Out-Null
    npx react-native config --platform android | Out-File -FilePath $autolinkingFile -Encoding utf8
    Write-Host "   Fichier autolinking.json genere" -ForegroundColor Green
} else {
    Write-Host "   Fichier autolinking.json existe deja" -ForegroundColor Green
}
Write-Host ""

# Verifier qu'un appareil/emulateur est connecte
Write-Host "2. Verification d'un appareil Android..." -ForegroundColor Yellow
$devices = adb devices | Select-String -Pattern "device$"

if ($devices.Count -eq 0) {
    Write-Host "   Aucun appareil connecte" -ForegroundColor Yellow
    Write-Host "   Lancement automatique de l'emulateur..." -ForegroundColor Cyan
    Write-Host ""
    
    # Trouver l'emulateur disponible
    $emulatorPath = Get-Command emulator -ErrorAction SilentlyContinue
    if (-not $emulatorPath) {
        # Chercher dans les variables d'environnement communes
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
    } else {
        $emulatorPath = $emulatorPath.Source
    }
    
    if ($emulatorPath -and (Test-Path $emulatorPath)) {
        Write-Host "   Emulateur trouve: $emulatorPath" -ForegroundColor Green
        
        # Lister les AVD disponibles
        $avdOutput = & "$emulatorPath" -list-avds 2>&1
        $avds = @()
        $avdOutput | ForEach-Object {
            if ($_ -and $_.ToString().Trim() -ne "") {
                $avds += $_.ToString().Trim()
            }
        }
        
        if ($avds.Count -gt 0) {
            $firstAvd = $avds[0]
            Write-Host "   Demarrage de l'emulateur: $firstAvd" -ForegroundColor Cyan
            Write-Host "   (Cela peut prendre 30-60 secondes...)" -ForegroundColor Yellow
            Write-Host ""
            
            # Lancer l'emulateur en arriere-plan
            Start-Process -FilePath "$emulatorPath" -ArgumentList "-avd", "$firstAvd" -WindowStyle Normal
            
            # Attendre que l'emulateur soit pret
            Write-Host "   Attente du demarrage de l'emulateur..." -ForegroundColor Cyan
            $maxWait = 120
            $waited = 0
            while ($waited -lt $maxWait) {
                Start-Sleep -Seconds 3
                $waited += 3
                $devices = adb devices | Select-String -Pattern "device$"
                if ($devices.Count -gt 0) {
                    Write-Host "   Emulateur pret apres $waited secondes !" -ForegroundColor Green
                    break
                }
                if ($waited % 15 -eq 0) {
                    Write-Host "   Attente... ($waited/$maxWait secondes)" -ForegroundColor Gray
                }
            }
            
            if ($devices.Count -eq 0) {
                Write-Host "   ERREUR: L'emulateur n'a pas demarre dans les delais" -ForegroundColor Red
                Write-Host "   Veuillez demarrer l'emulateur manuellement et relancer" -ForegroundColor Yellow
                exit 1
            }
        } else {
            Write-Host "   ERREUR: Aucun AVD disponible" -ForegroundColor Red
            Write-Host "   Veuillez creer un AVD avec Android Studio" -ForegroundColor Yellow
            exit 1
        }
    } else {
        Write-Host "   ATTENTION: Emulateur non trouve" -ForegroundColor Yellow
        Write-Host "   Attente de la connexion d'un appareil/emulateur..." -ForegroundColor Cyan
        Write-Host ""
        
        # Attendre qu'un appareil se connecte
        $maxWait = 60
        $waited = 0
        while ($waited -lt $maxWait) {
            Start-Sleep -Seconds 2
            $waited += 2
            $devices = adb devices | Select-String -Pattern "device$"
            if ($devices.Count -gt 0) {
                Write-Host "   Appareil detecte apres $waited secondes !" -ForegroundColor Green
                break
            }
            if ($waited % 10 -eq 0) {
                Write-Host "   Attente... ($waited/$maxWait secondes)" -ForegroundColor Gray
            }
        }
        
        if ($devices.Count -eq 0) {
            Write-Host "   ERREUR: Aucun appareil n'a ete connecte dans les delais" -ForegroundColor Red
            exit 1
        }
    }
} else {
    Write-Host "   Appareil Android detecte" -ForegroundColor Green
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
Set-Content -Path $logcatFile -Value $logcatScriptContent -Encoding utf8

Start-Process powershell -ArgumentList "-NoExit", "-File", "`"$logcatFile`""
Write-Host "   Fenetre de logs ADB ouverte" -ForegroundColor Green
Write-Host ""

# Attendre un peu pour que la fenetre se lance
Start-Sleep -Seconds 2

# Lancer l'application Android avec react-native run-android (gestion automatique complete)
# react-native run-android lance automatiquement Metro bundler et l'application
Write-Host "4. Lancement de l'application Android..." -ForegroundColor Yellow
Write-Host "   (Metro bundler sera lance automatiquement)" -ForegroundColor Cyan
Write-Host "   (Installation, compilation et lancement automatiques)" -ForegroundColor Cyan
Write-Host ""
react-native run-android
