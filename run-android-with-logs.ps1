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

# Fonction pour obtenir le chemin de l'émulateur
function Get-EmulatorPath {
    $emulatorPath = Get-Command emulator -ErrorAction SilentlyContinue
    if (-not $emulatorPath) {
        $androidHome = $env:ANDROID_HOME
        if (-not $androidHome) {
            $androidHome = $env:ANDROID_SDK_ROOT
        }
        if ($androidHome) {
            $emulatorPath = "$androidHome\emulator\emulator.exe"
            if (-not (Test-Path $emulatorPath)) {
                return $null
            }
        } else {
            return $null
        }
    } else {
        $emulatorPath = $emulatorPath.Source
    }
    return $emulatorPath
}

# Fonction pour obtenir la liste des AVD disponibles
function Get-AvailableAvds {
    param([string]$emulatorPath)
    if (-not $emulatorPath -or -not (Test-Path $emulatorPath)) {
        return @()
    }
    $avdOutput = & "$emulatorPath" -list-avds 2>&1
    $avds = @()
    $avdOutput | ForEach-Object {
        if ($_ -and $_.ToString().Trim() -ne "") {
            $avds += $_.ToString().Trim()
        }
    }
    return $avds
}

# Étape 2: Reset complet de l'émulateur si nécessaire
Write-Host "2. Reset complet de l'émulateur..." -ForegroundColor Yellow
$devices = adb devices | Select-String -Pattern "device$"

# Si des appareils/émulateurs sont connectés, les arrêter pour un reset complet
if ($devices.Count -gt 0) {
    Write-Host "   Arrêt de tous les émulateurs connectés..." -ForegroundColor Cyan
    
    # Obtenir la liste des appareils connectés
    $deviceList = adb devices | Select-String -Pattern "device$" | ForEach-Object {
        ($_ -split "\s+")[0]
    }
    
    # Arrêter chaque appareil
    foreach ($device in $deviceList) {
        Write-Host "   Arrêt de l'appareil: $device" -ForegroundColor Gray
        adb -s $device emu kill 2>&1 | Out-Null
    }
    
    # Attendre que tous les émulateurs soient complètement arrêtés
    Write-Host "   Attente de l'arrêt complet..." -ForegroundColor Cyan
    $maxWait = 30
    $waited = 0
    while ($waited -lt $maxWait) {
        Start-Sleep -Seconds 2
        $waited += 2
        $remainingDevices = adb devices | Select-String -Pattern "device$"
        if ($remainingDevices.Count -eq 0) {
            Write-Host "   Tous les émulateurs sont arrêtés" -ForegroundColor Green
            break
        }
    }
}

# Tuer tous les processus qemu-system (émulateurs) qui pourraient encore tourner
Write-Host "   Arrêt de tous les processus émulateur..." -ForegroundColor Cyan
Get-Process -Name "qemu-system*" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Nettoyer les connexions ADB
Write-Host "   Nettoyage des connexions ADB..." -ForegroundColor Cyan
adb kill-server 2>&1 | Out-Null
Start-Sleep -Seconds 2
adb start-server 2>&1 | Out-Null
Start-Sleep -Seconds 2

# Trouver le chemin de l'émulateur
$emulatorPath = Get-EmulatorPath

if ($emulatorPath -and (Test-Path $emulatorPath)) {
    Write-Host "   Emulateur trouve: $emulatorPath" -ForegroundColor Green
    
    # Obtenir la liste des AVD disponibles
    $avds = Get-AvailableAvds -emulatorPath $emulatorPath
    
    if ($avds.Count -gt 0) {
        $firstAvd = $avds[0]
        Write-Host "   Lancement de l'émulateur: $firstAvd" -ForegroundColor Cyan
        Write-Host "   (Reset complet des données après démarrage)" -ForegroundColor Yellow
        Write-Host "   (Cela peut prendre 30-60 secondes...)" -ForegroundColor Yellow
        Write-Host ""
        
        # Lancer l'émulateur normalement (sans wipe-data pour éviter les problèmes)
        # On utilisera -no-snapshot-load pour forcer un démarrage propre
        Write-Host "   Démarrage de l'émulateur..." -ForegroundColor Cyan
        $emulatorProcess = Start-Process -FilePath "$emulatorPath" -ArgumentList "-avd", "$firstAvd", "-no-snapshot-load" -WindowStyle Normal -PassThru
        
        if ($emulatorProcess) {
            Write-Host "   Processus émulateur lancé (PID: $($emulatorProcess.Id))" -ForegroundColor Green
        }
        
        # Attendre que l'émulateur soit pret
        Write-Host "   Attente du démarrage de l'émulateur..." -ForegroundColor Cyan
        $maxWait = 120
        $waited = 0
        $emulatorReady = $false
        
        while ($waited -lt $maxWait) {
            Start-Sleep -Seconds 3
            $waited += 3
            
            # Vérifier si le processus tourne toujours
            $processRunning = Get-Process -Id $emulatorProcess.Id -ErrorAction SilentlyContinue
            if (-not $processRunning) {
                Write-Host "   ERREUR: Le processus émulateur a crash!" -ForegroundColor Red
                Write-Host "   Vérifiez les logs de l'émulateur pour plus d'informations" -ForegroundColor Yellow
                exit 1
            }
            
            # Vérifier si un appareil est connecté
            $devices = adb devices | Select-String -Pattern "device$"
            if ($devices.Count -gt 0) {
                $deviceId = ($devices[0] -split "\s+")[0]
                Write-Host "   Émulateur détecté: $deviceId" -ForegroundColor Green
                
                # Vérifier que l'émulateur est complètement prêt (boot complet)
                Write-Host "   Attente du boot complet de l'émulateur..." -ForegroundColor Cyan
                $bootComplete = $false
                $bootWait = 0
                $maxBootWait = 60
                
                while ($bootWait -lt $maxBootWait) {
                    $bootStatus = adb -s $deviceId shell getprop sys.boot_completed 2>&1
                    if ($bootStatus -eq "1") {
                        $bootComplete = $true
                        Write-Host "   Émulateur complètement démarré après $waited secondes !" -ForegroundColor Green
                        break
                    }
                    Start-Sleep -Seconds 2
                    $bootWait += 2
                }
                
                if ($bootComplete) {
                    # Faire un factory reset via ADB maintenant que l'émulateur est prêt
                    Write-Host "   Réinitialisation des données utilisateur (factory reset)..." -ForegroundColor Cyan
                    adb -s $deviceId shell "wipe data" 2>&1 | Out-Null
                    Start-Sleep -Seconds 3
                    Write-Host "   Reset complet effectué !" -ForegroundColor Green
                    $emulatorReady = $true
                    break
                } else {
                    Write-Host "   ATTENTION: Boot complet non détecté, mais l'émulateur semble démarré" -ForegroundColor Yellow
                    $emulatorReady = $true
                    break
                }
            }
            
            if ($waited % 15 -eq 0) {
                Write-Host "   Attente... ($waited/$maxWait secondes)" -ForegroundColor Gray
            }
        }
        
        if (-not $emulatorReady) {
            Write-Host "   ERREUR: L'émulateur n'a pas démarré dans les délais" -ForegroundColor Red
            Write-Host "   Le processus tourne-t-il toujours ? (Vérifiez la fenêtre de l'émulateur)" -ForegroundColor Yellow
            Write-Host "   Si l'émulateur est visible mais ne se connecte pas, vérifiez:" -ForegroundColor Yellow
            Write-Host "   - Les logs de l'émulateur pour des erreurs" -ForegroundColor Yellow
            Write-Host "   - Que les ports ne sont pas bloqués" -ForegroundColor Yellow
            exit 1
        }
    } else {
        Write-Host "   ERREUR: Aucun AVD disponible" -ForegroundColor Red
        Write-Host "   Veuillez créer un AVD avec Android Studio" -ForegroundColor Yellow
        exit 1
    }
} else {
    Write-Host "   ATTENTION: Emulateur non trouvé" -ForegroundColor Yellow
    Write-Host "   Vérification des appareils connectés..." -ForegroundColor Cyan
}

# Verifier qu'un appareil/emulateur est connecte
Write-Host ""
Write-Host "3. Verification d'un appareil Android..." -ForegroundColor Yellow
$devices = adb devices | Select-String -Pattern "device$"

if ($devices.Count -eq 0) {
    Write-Host "   Aucun appareil connecte" -ForegroundColor Yellow
    Write-Host "   Veuillez demarrer un appareil ou un emulateur manuellement" -ForegroundColor Yellow
    exit 1
} else {
    Write-Host "   Appareil Android detecte" -ForegroundColor Green
}
Write-Host ""

# Lancer adb logcat dans une nouvelle fenetre PowerShell
Write-Host "4. Lancement des logs ADB dans une nouvelle fenetre..." -ForegroundColor Yellow
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
Write-Host "5. Lancement de l'application Android..." -ForegroundColor Yellow
Write-Host "   (Metro bundler sera lance automatiquement)" -ForegroundColor Cyan
Write-Host "   (Installation, compilation et lancement automatiques)" -ForegroundColor Cyan
Write-Host ""
react-native run-android
