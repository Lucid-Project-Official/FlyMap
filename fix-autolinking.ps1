# Script pour corriger l'autolinking React Native 0.78
Write-Host "Correction de l'autolinking React Native..." -ForegroundColor Cyan

# Le problème : React Native génère PackageList.java avec tous les imports
# mais les modules ne sont pas compilés comme dépendances Gradle.
# 
# Solution : Pour l'instant, créer un autolinking.json minimal
# qui ne contient que les informations du projet, pas les dépendances tierces.
# Le plugin React Native 0.78 devrait automatiquement linker les modules,
# mais cela ne fonctionne pas correctement.

$autolinkingDir = "android\build\generated\autolinking"
$autolinkingFile = "$autolinkingDir\autolinking.json"

Write-Host "Création d'un autolinking.json minimal..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path $autolinkingDir | Out-Null

# Créer un autolinking.json minimal avec seulement les infos du projet
$minimalConfig = @{
    project = @{
        android = @{
            sourceDir = (Resolve-Path "android").Path
            appName = "app"
            packageName = "com.flymap"
            applicationId = "com.flymap"
            mainActivity = ".MainActivity"
            assets = @()
        }
    }
    dependencies = @{}
} | ConvertTo-Json -Depth 10

Set-Content -Path $autolinkingFile -Value $minimalConfig -Encoding utf8
Write-Host "✓ Fichier autolinking.json minimal créé" -ForegroundColor Green

Write-Host ""
Write-Host "NOTE: Pour une app Hello World, cela devrait suffire." -ForegroundColor Yellow
Write-Host "Pour reintroduire les dependances, il faudra corriger l'autolinking React Native." -ForegroundColor Yellow

