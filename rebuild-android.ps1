# Script PowerShell pour nettoyer et rebuilder Android complètement

Write-Host "Nettoyage complet du projet Android..." -ForegroundColor Green

# Nettoyer les caches Metro
Write-Host "1. Nettoyage du cache Metro..." -ForegroundColor Yellow
if (Test-Path "$env:LOCALAPPDATA\Temp\metro-*") {
    Remove-Item "$env:LOCALAPPDATA\Temp\metro-*" -Recurse -Force -ErrorAction SilentlyContinue
}
if (Test-Path "$env:LOCALAPPDATA\Temp\haste-*") {
    Remove-Item "$env:LOCALAPPDATA\Temp\haste-*" -Recurse -Force -ErrorAction SilentlyContinue
}

# Nettoyer le build Android
Write-Host "2. Nettoyage du build Android..." -ForegroundColor Yellow
cd android

# Supprimer les dossiers de build manuellement
if (Test-Path "app\build") {
    Remove-Item "app\build" -Recurse -Force -ErrorAction SilentlyContinue
}
# Ne pas supprimer build/generated/autolinking - nécessaire pour le build
if (Test-Path "build") {
    # Supprimer seulement build sauf build/generated/autolinking
    Get-ChildItem "build" -Exclude "generated" | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
    if (Test-Path "build\generated") {
        Get-ChildItem "build\generated" -Exclude "autolinking" | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
    }
}
if (Test-Path ".gradle") {
    Remove-Item ".gradle" -Recurse -Force -ErrorAction SilentlyContinue
}

# S'assurer que autolinking.json existe
if (-not (Test-Path "build\generated\autolinking")) {
    New-Item -ItemType Directory -Force -Path "build\generated\autolinking" | Out-Null
}
if (-not (Test-Path "build\generated\autolinking\autolinking.json")) {
    Set-Content -Path "build\generated\autolinking\autolinking.json" -Value "[]"
}

# Nettoyer avec Gradle
./gradlew clean --no-daemon

cd ..

Write-Host "3. Nettoyage terminé !" -ForegroundColor Green
Write-Host ""
Write-Host "Maintenant, lancez :" -ForegroundColor Cyan
Write-Host "  1. npm start -- --reset-cache" -ForegroundColor White
Write-Host "  2. Dans un autre terminal : npm run android" -ForegroundColor White

