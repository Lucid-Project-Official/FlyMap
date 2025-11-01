# Script complet pour ajouter automatiquement TOUTES les dependances dans settings.gradle et app/build.gradle
# Ce script garantit que TOUS les modules sont compiles automatiquement

$ErrorActionPreference = "Continue"

Write-Host "Configuration complete de TOUTES les dependances..." -ForegroundColor Cyan

# Lire le fichier autolinking.json
$autolinkingFile = "android\build\generated\autolinking\autolinking.json"
if (-not (Test-Path $autolinkingFile)) {
    Write-Host "Generation du fichier autolinking.json..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Force -Path "android\build\generated\autolinking" | Out-Null
    npx react-native config --platform android | Out-File -FilePath $autolinkingFile -Encoding utf8
}

$autolinkingContent = Get-Content $autolinkingFile -Raw | ConvertFrom-Json

# Modifier settings.gradle
Write-Host "Modification de settings.gradle..." -ForegroundColor Yellow
$settingsGradleContent = @"
rootProject.name = 'FlyMap'
include ':app'
includeBuild('../node_modules/@react-native/gradle-plugin')

"@

foreach ($depName in $autolinkingContent.dependencies.PSObject.Properties.Name) {
    $dep = $autolinkingContent.dependencies.$depName
    if ($dep.platforms.android -and $dep.platforms.android.sourceDir) {
        $sourceDir = $dep.platforms.android.sourceDir.Replace('\', '/')
        $moduleName = $depName -replace '[^a-zA-Z0-9]', '_'
        $settingsGradleContent += "include ':$moduleName'`n"
        $settingsGradleContent += "project(':$moduleName').projectDir = new File('$sourceDir')`n"
    }
}

Set-Content -Path "android\settings.gradle" -Value $settingsGradleContent -Encoding utf8
Write-Host "✓ settings.gradle modifie avec tous les modules" -ForegroundColor Green

# Modifier app/build.gradle
Write-Host "Modification de app/build.gradle..." -ForegroundColor Yellow
$buildGradleFile = "android\app\build.gradle"
$buildGradleContent = Get-Content $buildGradleFile -Raw

# Supprimer les dependances deja ajoutees
if ($buildGradleContent -match "// Modules natifs autolinkes automatiquement") {
    $buildGradleContent = $buildGradleContent -replace "(?s)// Modules natifs autolinkes automatiquement.*?(?=})", ""
}

# Ajouter les dependances
$dependenciesToAdd = "`n    // Modules natifs autolinkes automatiquement`n"
foreach ($depName in $autolinkingContent.dependencies.PSObject.Properties.Name) {
    $dep = $autolinkingContent.dependencies.$depName
    if ($dep.platforms.android -and $dep.platforms.android.sourceDir) {
        $moduleName = $depName -replace '[^a-zA-Z0-9]', '_'
        $dependenciesToAdd += "    implementation project(':$moduleName')`n"
    }
}

# Ajouter les dependances avant la fin du bloc dependencies
$buildGradleContent = $buildGradleContent -replace "(}\s*$)", "$dependenciesToAdd`$1"

Set-Content -Path $buildGradleFile -Value $buildGradleContent -Encoding utf8
Write-Host "✓ app/build.gradle modifie avec toutes les dependances" -ForegroundColor Green

Write-Host ""
Write-Host "Configuration complete!" -ForegroundColor Green

