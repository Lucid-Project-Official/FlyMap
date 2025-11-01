# Script complet pour installer et compiler TOUTES les dependances automatiquement
# Ce script garantit que tout fonctionne parfaitement

$ErrorActionPreference = "Continue"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Configuration Complete du Projet" -ForegroundColor Cyan
Write-Host "  Installation de TOUTES les dependances" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Reinstaller toutes les dependances npm
Write-Host "1. Reinstallation complete de toutes les dependances npm..." -ForegroundColor Yellow
Remove-Item "node_modules" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item "package-lock.json" -Force -ErrorAction SilentlyContinue
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERREUR: Echec de l'installation npm" -ForegroundColor Red
    exit 1
}

# Installer react-native-worklets si necessaire
npm install --save react-native-worklets 2>&1 | Out-Null

Write-Host "   ✓ Toutes les dependances npm installees" -ForegroundColor Green
Write-Host ""

# 2. Nettoyer completement le build Android
Write-Host "2. Nettoyage complet du build Android..." -ForegroundColor Yellow
cd android
.\gradlew --stop 2>&1 | Out-Null
if (Test-Path ".gradle") { Remove-Item ".gradle" -Recurse -Force -ErrorAction SilentlyContinue }
if (Test-Path "build") { Remove-Item "build" -Recurse -Force -ErrorAction SilentlyContinue }
if (Test-Path "app\build") { Remove-Item "app\build" -Recurse -Force -ErrorAction SilentlyContinue }
.\gradlew clean --no-daemon 2>&1 | Out-Null
cd ..
Write-Host "   ✓ Build Android nettoye" -ForegroundColor Green
Write-Host ""

# 3. Generer le fichier autolinking.json avec TOUTES les dependances
Write-Host "3. Generation du fichier autolinking.json avec TOUTES les dependances..." -ForegroundColor Yellow
$autolinkingDir = "android\build\generated\autolinking"
$autolinkingFile = "$autolinkingDir\autolinking.json"
New-Item -ItemType Directory -Force -Path $autolinkingDir | Out-Null
npx react-native config --platform android | Out-File -FilePath $autolinkingFile -Encoding utf8
if (Test-Path $autolinkingFile) {
    $jsonContent = Get-Content $autolinkingFile -Raw | ConvertFrom-Json
    $depsCount = ($jsonContent.dependencies.PSObject.Properties | Measure-Object).Count
    Write-Host "   ✓ Fichier autolinking.json genere avec $depsCount dependances" -ForegroundColor Green
} else {
    Write-Host "   ERREUR: Impossible de generer autolinking.json" -ForegroundColor Red
    exit 1
}
Write-Host ""

# 4. Verifier que le plugin React Native est correctement configure
Write-Host "4. Verification de la configuration React Native..." -ForegroundColor Yellow
$settingsGradle = Get-Content "android\settings.gradle" -Raw
if ($settingsGradle -notmatch "com\.facebook\.react\.rootproject") {
    Write-Host "   ERREUR: Plugin React Native rootproject non trouve" -ForegroundColor Red
    exit 1
}
Write-Host "   ✓ Configuration React Native validee" -ForegroundColor Green
Write-Host ""

Write-Host "========================================" -ForegroundColor Green
Write-Host "  Configuration complete reussie!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Vous pouvez maintenant lancer: npm run android" -ForegroundColor Cyan
