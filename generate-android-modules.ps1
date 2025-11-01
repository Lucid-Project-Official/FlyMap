# Script pour generer automatiquement l'inclusion de TOUS les modules dans settings.gradle
# Ce script garantit que TOUTES les dependances sont compilees automatiquement

$ErrorActionPreference = "Continue"

Write-Host "Generation de l'inclusion de TOUS les modules dans settings.gradle..." -ForegroundColor Cyan

# Lire le fichier autolinking.json
$autolinkingFile = "android\build\generated\autolinking\autolinking.json"
if (-not (Test-Path $autolinkingFile)) {
    Write-Host "Generation du fichier autolinking.json..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Force -Path "android\build\generated\autolinking" | Out-Null
    npx react-native config --platform android | Out-File -FilePath $autolinkingFile -Encoding utf8
}

$autolinkingContent = Get-Content $autolinkingFile -Raw | ConvertFrom-Json

# Generer les includes pour settings.gradle
$includes = @"
rootProject.name = 'FlyMap'
include ':app'
includeBuild('../node_modules/@react-native/gradle-plugin')

"@

$moduleIncludes = ""
foreach ($depName in $autolinkingContent.dependencies.PSObject.Properties.Name) {
    $dep = $autolinkingContent.dependencies.$depName
    if ($dep.platforms.android -and $dep.platforms.android.sourceDir) {
        $sourceDir = $dep.platforms.android.sourceDir
        $moduleName = $depName -replace '[^a-zA-Z0-9]', '_'
        $moduleIncludes += "project(':$moduleName').projectDir = new File('$sourceDir')`ninclude ':$moduleName'`n"
    }
}

# Avec React Native 0.78, le plugin devrait automatiquement linker les modules
# Mais on s'assure que settings.gradle est correctement configure
$settingsGradle = $includes + $moduleIncludes

Set-Content -Path "android\settings.gradle" -Value $settingsGradle -Encoding utf8
Write-Host "✓ Fichier settings.gradle genere avec tous les modules" -ForegroundColor Green

