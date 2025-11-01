# Guide de Lancement - Application FlyMap

## 🚀 Une Seule Commande: `npm run android`

**Tout est maintenant automatique !** ✅

```powershell
npm run android
```

Cette commande unique fait **TOUT** automatiquement :

1. ✅ **Vérifie/crée autolinking.json** - Configuration automatique
2. ✅ **Vérifie un appareil Android** - Connecté ou émulateur
3. ✅ **Lance automatiquement l'émulateur** - Si aucun appareil n'est connecté
4. ✅ **Ouvre une fenêtre de logs ADB** - Pour surveiller les erreurs
5. ✅ **Lance Metro bundler** - Automatiquement via `react-native run-android`
6. ✅ **Compile l'application** - Automatiquement
7. ✅ **Installe l'APK** - Automatiquement
8. ✅ **Ouvre l'application** - Automatiquement

---

## 📋 Ce Que Fait `npm run android`

### Étape 1: Vérification de autolinking.json
Le script vérifie que le fichier `android/build/generated/autolinking/autolinking.json` existe.
Si ce n'est pas le cas, il le génère automatiquement avec toutes les dépendances.

### Étape 2: Vérification d'un appareil Android
Le script vérifie si un appareil Android ou un émulateur est connecté :

**Si un appareil est connecté** ✅
- Passe directement à l'étape 3

**Si aucun appareil n'est connecté** 🔄
- Recherche l'émulateur dans le PATH ou ANDROID_HOME
- Liste les AVD disponibles
- Lance automatiquement le premier AVD disponible
- Attend que l'émulateur soit prêt (jusqu'à 120 secondes)
- Continue automatiquement une fois prêt

### Étape 3: Fenêtre de logs ADB
Le script ouvre automatiquement une nouvelle fenêtre PowerShell avec `adb logcat` filtré pour `com.flymap`.

Cette fenêtre permet de :
- Surveiller les logs en temps réel
- Détecter les erreurs rapidement
- Voir le démarrage de l'application

### Étape 4: Lancement de l'application
Le script lance `react-native run-android` qui :

1. **Démarre Metro bundler automatiquement** 📦
   - Compile le JavaScript
   - Sert les assets
   - Se connecte à l'application

2. **Compile l'application Android** 🔨
   - Gradle build automatique
   - Génère l'APK
   - Optimise les ressources

3. **Installe l'APK sur l'appareil** 📱
   - Installation automatique via ADB
   - Vérification de la compatibilité

4. **Ouvre l'application** 🚀
   - Lance l'activité principale
   - Affiche l'application

---

## 🔧 Commandes Disponibles

### Commande Principale
```powershell
npm run android
```
**Fait tout automatiquement** - Émulateur + Metro + Installation + Lancement

### Nettoyage Complet
```powershell
npm run android:clean
```
**Fait tout avec nettoyage complet** - Nettoie le build avant de lancer

### Lancement Direct (sans logs ADB)
```powershell
npm run android:direct
```
**Lance directement react-native run-android** - Sans script PowerShell

---

## 📝 Dépendances Automatiques

Le script vérifie et configure automatiquement :

- ✅ **ADB** - Android Debug Bridge
- ✅ **Émulateur** - Android Emulator
- ✅ **AVD** - Android Virtual Device
- ✅ **Metro bundler** - Via react-native run-android
- ✅ **Gradle** - Build automatique
- ✅ **Autolinking** - Configuration automatique

---

## ⚠️ Si l'Émulateur Ne Se Lance Pas

Si l'émulateur ne se lance pas automatiquement, vous pouvez :

1. **Lancer manuellement l'émulateur**
   ```powershell
   # Trouver le chemin de l'émulateur
   $emulator = Get-Command emulator
   
   # Lister les AVD disponibles
   & $emulator -list-avds
   
   # Lancer un AVD
   & $emulator -avd "NOM_DE_L_AVD"
   ```

2. **Vérifier ANDROID_HOME**
   ```powershell
   echo $env:ANDROID_HOME
   # Devrait pointer vers le SDK Android
   ```

3. **Créer un AVD avec Android Studio**
   - Ouvrir Android Studio
   - Tools > Device Manager
   - Créer un nouvel appareil virtuel

---

## ✅ Validation

Une fois lancé, vous devriez voir :

1. ✅ **Fenêtre de logs ADB** - Avec logs filtrés pour com.flymap
2. ✅ **Metro bundler** - Dans le terminal principal
3. ✅ **Application ouverte** - Sur l'émulateur/appareil
4. ✅ **"Hello World"** - Affiché à l'écran

---

## 🎯 Résumé

**Une seule commande fait tout :**

```powershell
npm run android
```

**Résultat :**
- ✅ Émulateur lancé automatiquement
- ✅ Metro bundler démarré automatiquement
- ✅ Application compilée et installée automatiquement
- ✅ Application ouverte automatiquement
- ✅ Logs ADB disponibles automatiquement

**Plus besoin de lancer plusieurs commandes séparément !** 🎉

