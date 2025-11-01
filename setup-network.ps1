# Script pour configurer la connexion réseau entre Metro et l'émulateur Android

Write-Host "Configuration de la connexion Metro-Emulateur..." -ForegroundColor Green

# Vérifier si adb est disponible
if (-not (Get-Command adb -ErrorAction SilentlyContinue)) {
    $adbPath = "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe"
    if (Test-Path $adbPath) {
        $env:Path += ";$env:LOCALAPPDATA\Android\Sdk\platform-tools"
        Write-Host "ADB ajouté au PATH pour cette session" -ForegroundColor Yellow
    } else {
        Write-Host "Erreur: ADB non trouvé. Assurez-vous que Android SDK est installé." -ForegroundColor Red
        exit 1
    }
}

# Attendre que l'émulateur soit connecté
Write-Host "Attente de la connexion de l'émulateur..." -ForegroundColor Yellow
$maxAttempts = 30
$attempt = 0
$deviceFound = $false

while ($attempt -lt $maxAttempts -and -not $deviceFound) {
    Start-Sleep -Seconds 1
    $devices = adb devices
    if ($devices -match "device\s*$") {
        $deviceFound = $true
        Write-Host "Emulateur connecté!" -ForegroundColor Green
    } else {
        $attempt++
        Write-Host "Tentative $attempt/$maxAttempts..." -ForegroundColor Gray
    }
}

if (-not $deviceFound) {
    Write-Host "Aucun appareil connecté. Assurez-vous que l'émulateur est démarré." -ForegroundColor Red
    Write-Host "Pour démarrer l'émulateur: emulator -avd Medium_Phone_API_36.1" -ForegroundColor Yellow
    exit 1
}

# Configurer le reverse TCP
Write-Host "Configuration du reverse TCP (port 8081)..." -ForegroundColor Yellow
adb reverse tcp:8081 tcp:8081

if ($LASTEXITCODE -eq 0) {
    Write-Host "Reverse TCP configuré avec succès!" -ForegroundColor Green
} else {
    Write-Host "Erreur lors de la configuration du reverse TCP." -ForegroundColor Red
    exit 1
}

# Récupérer l'adresse IP
$ip = (ipconfig | Select-String -Pattern "IPv4" | Select-Object -First 1).ToString().Split(':')[1].Trim()
Write-Host "" -ForegroundColor Green
Write-Host "Configuration terminée!" -ForegroundColor Green
Write-Host "Adresse IP: $ip" -ForegroundColor Cyan
Write-Host "" -ForegroundColor Green
Write-Host "Pour démarrer Metro avec cette IP:" -ForegroundColor Yellow
Write-Host "  npm run start:network" -ForegroundColor White
Write-Host "" -ForegroundColor Green
Write-Host "Ou dans un nouveau terminal:" -ForegroundColor Yellow
Write-Host "  npm start -- --reset-cache --host $ip" -ForegroundColor White

