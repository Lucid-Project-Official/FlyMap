# Script pour capturer les logs Metro et React Native
Write-Host "Capture des logs Metro/React Native..." -ForegroundColor Green
Write-Host "Appuyez sur Ctrl+C pour arrêter" -ForegroundColor Yellow
Write-Host ""

# Vérifier si Metro est en cours d'exécution
$metroPort = 8081
$metroRunning = Test-NetConnection -ComputerName localhost -Port $metroPort -InformationLevel Quiet -WarningAction SilentlyContinue

if ($metroRunning) {
    Write-Host "Metro Bundler détecté sur le port $metroPort" -ForegroundColor Green
    Write-Host "Les logs Metro apparaîtront dans le terminal où Metro est lancé." -ForegroundColor Cyan
} else {
    Write-Host "Metro Bundler n'est pas détecté. Lancez d'abord: npm start" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== LOGS ANDROID ===" -ForegroundColor Green
Write-Host "Filtrage des logs pour FlyMap et erreurs critiques..." -ForegroundColor Cyan
Write-Host ""

# Capture des logs Android pour l'app FlyMap
if (Get-Command adb -ErrorAction SilentlyContinue) {
    adb logcat -c
    adb logcat | Select-String -Pattern 'FlyMap|AuthService|MapScreen|ErrorBoundary|AndroidRuntime|FATAL|ReactNativeJS'
} else {
    $adbPath = "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe"
    if (Test-Path $adbPath) {
        & $adbPath logcat -c
        & $adbPath logcat | Select-String -Pattern 'FlyMap|AuthService|MapScreen|ErrorBoundary|AndroidRuntime|FATAL|ReactNativeJS'
    } else {
        Write-Host "ADB non trouvé. Assurez-vous que Android SDK est installé." -ForegroundColor Red
    }
}

