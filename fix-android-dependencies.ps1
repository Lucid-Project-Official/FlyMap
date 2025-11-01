# Script pour ajouter automatiquement TOUTES les dependances dans app/build.gradle
# Ce script garantit que TOUS les modules sont compiles automatiquement

$ErrorActionPreference = "Continue"

Write-Host "Ajout de TOUTES les dependances dans app/build.gradle..." -ForegroundColor Cyan

# Lire le fichier autolinking.json
$autolinkingFile = "android\build\generated\autolinking\autolinking.json"
if (-not (Test-Path $autolinkingFile)) {
    Write-Host "Generation du fichier autolinking.json..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Force -Path "android\build\generated\autolinking" | Out-Null
    npx react-native config --platform android | Out-File -FilePath $autolinkingFile -Encoding utf8
}

$autolinkingContent = Get-Content $autolinkingFile -Raw | ConvertFrom-Json

# Lire app/build.gradle
$buildGradleFile = "android\app\build.gradle"
$buildGradleContent = Get-Content $buildGradleFile -Raw

# Generer les dependances pour chaque module
$dependenciesToAdd = "`n    // Modules natifs autolinkes automatiquement`n"
foreach ($depName in $autolinkingContent.dependencies.PSObject.Properties.Name) {
    $dep = $autolinkingContent.dependencies.$depName
    if ($dep.platforms.android -and $dep.platforms.android.sourceDir) {
        $sourceDir = $dep.platforms.android.sourceDir.Replace('\', '/')
        $moduleName = $depName -replace '[^a-zA-Z0-9]', '_'
        $dependenciesToAdd += "    implementation project(path: `":$moduleName`")`n"
    }
}

# Ajouter les dependances avant la fin du bloc dependencies
if ($buildGradleContent -match "(dependencies \{[^}]+)(\s*\})") {
    $beforeDeps = $matches[1]
    $depsClosing = $matches[2]
    
    # Verifier si les dependances sont deja ajoutees
    if ($beforeDeps -notmatch "Modules natifs autolinkes automatiquement") {
        $newDepsBlock = $beforeDeps + $dependenciesToAdd + $depsClosing
        $buildGradleContent = $buildGradleContent -replace "(dependencies \{[^}]+\s*\})", $newDepsBlock
        Set-Content -Path $buildGradleFile -Value $buildGradleContent -Encoding utf8
        Write-Host "✓ Dependances ajoutees dans app/build.gradle" -ForegroundColor Green
    } else {
        Write-Host "✓ Dependances deja presentes dans app/build.gradle" -ForegroundColor Green
    }
}

Write-Host "Configuration terminee!" -ForegroundColor Green

