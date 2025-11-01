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
if (Test-Path "build") {
    Remove-Item "build" -Recurse -Force -ErrorAction SilentlyContinue
}
if (Test-Path ".gradle") {
    Remove-Item ".gradle" -Recurse -Force -ErrorAction SilentlyContinue
}

# Nettoyer avec Gradle
./gradlew clean --no-daemon

cd ..

Write-Host "3. Nettoyage terminé !" -ForegroundColor Green
Write-Host ""
Write-Host "Maintenant, lancez :" -ForegroundColor Cyan
Write-Host "  1. npm start -- --reset-cache" -ForegroundColor White
Write-Host "  2. Dans un autre terminal : npm run android" -ForegroundColor White

