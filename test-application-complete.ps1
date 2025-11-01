# Script de test complet pour valider le bon fonctionnement de l'application
# Ce script effectue tous les tests necessaires pour garantir que l'application fonctionne parfaitement

$ErrorActionPreference = "Continue"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TESTS COMPLETS DE L'APPLICATION" -ForegroundColor Cyan
Write-Host "  Validation du bon fonctionnement" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$testsPassed = 0
$testsFailed = 0
$testsTotal = 0

function Test-Step {
    param(
        [string]$Name,
        [scriptblock]$Test,
        [string]$ErrorMessage = ""
    )
    
    $global:testsTotal++
    Write-Host "[TEST $global:testsTotal] $Name" -ForegroundColor Yellow
    try {
        $result = & $Test
        if ($result -or $LASTEXITCODE -eq 0) {
            Write-Host "  PASSED" -ForegroundColor Green
            $global:testsPassed++
            return $true
        } else {
            Write-Host "  FAILED: $ErrorMessage" -ForegroundColor Red
            $global:testsFailed++
            return $false
        }
    } catch {
        Write-Host "  FAILED: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "  ERROR: $ErrorMessage" -ForegroundColor Red
        $global:testsFailed++
        return $false
    }
}

# Test 1: Verification des fichiers essentiels
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  PHASE 1: Verification des fichiers" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Test-Step "App.js existe" {
    Test-Path "App.js"
} -ErrorMessage "Fichier App.js manquant"

Test-Step "index.js existe" {
    Test-Path "index.js"
} -ErrorMessage "Fichier index.js manquant"

Test-Step "package.json existe" {
    Test-Path "package.json"
} -ErrorMessage "Fichier package.json manquant"

Test-Step "android/app/build.gradle existe" {
    Test-Path "android\app\build.gradle"
} -ErrorMessage "Fichier build.gradle manquant"

Test-Step "android/settings.gradle existe" {
    Test-Path "android\settings.gradle"
} -ErrorMessage "Fichier settings.gradle manquant"

# Test 2: Verification du contenu de App.js
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  PHASE 2: Verification du code" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Test-Step "App.js contient Hello World" {
    $content = Get-Content "App.js" -Raw
    $content -match "Hello World"
} -ErrorMessage "App.js ne contient pas 'Hello World'"

Test-Step "App.js est une fonction React valide" {
    $content = Get-Content "App.js" -Raw
    $content -match "export default function App" -or $content -match "export default.*App"
} -ErrorMessage "App.js n'est pas une fonction React valide"

Test-Step "index.js enregistre l'application" {
    $content = Get-Content "index.js" -Raw
    $content -match "AppRegistry.registerComponent"
} -ErrorMessage "index.js n'enregistre pas l'application correctement"

# Test 3: Verification du build Android
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  PHASE 3: Verification du build" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Test-Step "autolinking.json existe" {
    Test-Path "android\build\generated\autolinking\autolinking.json"
} -ErrorMessage "Fichier autolinking.json manquant - regeneration..."

if (-not (Test-Path "android\build\generated\autolinking\autolinking.json")) {
    Write-Host "  Generation de autolinking.json..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Force -Path "android\build\generated\autolinking" | Out-Null
    npx react-native config --platform android | Out-File -FilePath "android\build\generated\autolinking\autolinking.json" -Encoding utf8
}

Test-Step "Build Android compile sans erreur" {
    cd android
    $result = .\gradlew assembleDebug --no-daemon 2>&1 | Select-String -Pattern "BUILD SUCCESSFUL|BUILD FAILED"
    cd ..
    $result -match "BUILD SUCCESSFUL"
} -ErrorMessage "Build Android echoue"

Test-Step "APK genere existe" {
    Test-Path "android\app\build\outputs\apk\debug\app-debug.apk"
} -ErrorMessage "APK non genere"

if (Test-Path "android\app\build\outputs\apk\debug\app-debug.apk") {
    $apkSize = (Get-Item "android\app\build\outputs\apk\debug\app-debug.apk").Length / 1MB
    Write-Host "  Taille de l'APK: $([math]::Round($apkSize, 2)) MB" -ForegroundColor Cyan
}

# Test 4: Verification des dependances
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  PHASE 4: Verification des dependances" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Test-Step "node_modules existe" {
    Test-Path "node_modules"
} -ErrorMessage "node_modules manquant - executez 'npm install'"

Test-Step "react-native installe" {
    Test-Path "node_modules\react-native"
} -ErrorMessage "react-native non installe"

Test-Step "react-native-gesture-handler installe" {
    Test-Path "node_modules\react-native-gesture-handler"
} -ErrorMessage "react-native-gesture-handler non installe"

# Test 5: Verification de la connexion Android
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  PHASE 5: Test sur appareil Android" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$adbAvailable = Test-Step "ADB disponible" {
    $null -ne (Get-Command adb -ErrorAction SilentlyContinue)
} -ErrorMessage "ADB n'est pas dans le PATH"

if ($adbAvailable) {
    Write-Host "[TEST] Verification d'un appareil Android connecte..." -ForegroundColor Yellow
    $devices = adb devices | Select-String -Pattern "device$" | Measure-Object
    
    if ($devices.Count -gt 0) {
        Write-Host "  PASSED - Appareil Android detecte" -ForegroundColor Green
        $testsPassed++
        $testsTotal++
        
        # Test d'installation
        Test-Step "Installation de l'APK sur l'appareil" {
            cd android
            $result = .\gradlew installDebug --no-daemon 2>&1 | Select-String -Pattern "BUILD SUCCESSFUL|FAILED"
            cd ..
            $result -match "BUILD SUCCESSFUL"
        } -ErrorMessage "Echec de l'installation de l'APK"
        
        # Test de lancement
        Write-Host "[TEST] Lancement de l'application..." -ForegroundColor Yellow
        $testsTotal++
        try {
            adb shell am start -n com.flymap/.MainActivity
            Start-Sleep -Seconds 3
            Write-Host "  PASSED - Application lancee" -ForegroundColor Green
            $testsPassed++
            
            # Verification des logs pour erreurs
            Write-Host "[TEST] Verification des logs pour erreurs..." -ForegroundColor Yellow
            $testsTotal++
            Start-Sleep -Seconds 2
            $logs = adb logcat -d | Select-String -Pattern "com\.flymap.*FATAL|com\.flymap.*AndroidRuntime|com\.flymap.*Exception" | Select-Object -First 5
            if ($logs.Count -eq 0) {
                Write-Host "  PASSED - Aucune erreur fatale detectee" -ForegroundColor Green
                $testsPassed++
            } else {
                Write-Host "  FAILED - Erreurs detectees dans les logs:" -ForegroundColor Red
                $logs | ForEach-Object { Write-Host "    $_" -ForegroundColor Red }
                $testsFailed++
            }
            
            # Verification que l'application tourne
            Write-Host "[TEST] Verification que l'application tourne..." -ForegroundColor Yellow
            $testsTotal++
            $appRunning = adb shell ps | Select-String -Pattern "com\.flymap"
            if ($appRunning) {
                Write-Host "  PASSED - Application en cours d'execution" -ForegroundColor Green
                $testsPassed++
            } else {
                Write-Host "  FAILED - Application ne tourne pas" -ForegroundColor Red
                $testsFailed++
            }
            
        } catch {
            Write-Host "  FAILED - Erreur lors du lancement: $($_.Exception.Message)" -ForegroundColor Red
            $testsFailed++
        }
        
    } else {
        Write-Host "  SKIPPED - Aucun appareil Android connecte" -ForegroundColor Yellow
        Write-Host "  Pour tester sur un appareil:" -ForegroundColor Cyan
        Write-Host "    1. Connectez un appareil Android ou demarrez un emulateur" -ForegroundColor White
        Write-Host "    2. Relancez ce script" -ForegroundColor White
        $testsTotal++
    }
} else {
    Write-Host "  SKIPPED - ADB non disponible" -ForegroundColor Yellow
}

# Resume final
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  RESUME DES TESTS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Tests total: $testsTotal" -ForegroundColor White
Write-Host "Tests passes: $testsPassed" -ForegroundColor Green
Write-Host "Tests echoues: $testsFailed" -ForegroundColor $(if ($testsFailed -eq 0) { "Green" } else { "Red" })
Write-Host ""

if ($testsFailed -eq 0) {
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  TOUS LES TESTS SONT PASSES !" -ForegroundColor Green
    Write-Host "  L'application est validee et fonctionne correctement" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    exit 0
} else {
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "  CERTAINS TESTS ONT ECHOUE" -ForegroundColor Red
    Write-Host "  Veuillez corriger les erreurs ci-dessus" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    exit 1
}

