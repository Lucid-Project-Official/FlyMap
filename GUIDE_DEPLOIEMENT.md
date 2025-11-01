# 🚀 Guide de Déploiement Complet - FlyMap

Ce guide vous explique **étape par étape** comment faire fonctionner l'application FlyMap depuis le début jusqu'à ce qu'elle fonctionne correctement.

---

## ✅ CORRECTIONS DÉJÀ APPLIQUÉES

Les problèmes suivants ont été corrigés :

1. ✅ **Images manquantes** : Remplacées par des emojis et icônes vectorielles
2. ✅ **Permissions manquantes** : Permissions Android ajoutées
3. ✅ **Configuration manquante** : react-native-vector-icons configuré (auto-linking)
4. ✅ **Google Sign-In** : Géré gracieusement sans crash
5. ✅ **TypeScript** : Configuration corrigée

## ⚠️ ENCORE À FAIRE (OBLIGATOIRE)

6. ⚠️ **Google Maps API Key** : **OBLIGATOIRE** - À configurer pour afficher la carte
7. ⚠️ **Google Sign-In SHA-1** : Optionnel mais recommandé pour l'authentification
8. ⚠️ **Géoportail API Key** : Optionnel mais recommandé pour les restrictions de vol

---

## 📋 CHECKLIST DE DÉMARRAGE

Avant de commencer, vérifiez que vous avez :

- [ ] **Node.js** 16+ installé
- [ ] **npm** ou **yarn** installé
- [ ] **Java JDK** 11+ installé
- [ ] **Android Studio** avec SDK Android installé
- [ ] **Compte Google** pour Firebase
- [ ] **Terminal** avec accès à votre projet

---

## 🔧 ÉTAPE 1 : CORRIGER LES IMAGES MANQUANTES

✅ **DÉJÀ CORRIGÉ** : Les images ont été remplacées par des emojis et icônes vectorielles.

Si vous voulez utiliser vos propres images :

### Option A : Créer les images (Recommandé pour production)

1. Créez les fichiers suivants dans le dossier `assets/` :
   - `logo.png` (512x512px) - Logo de l'application
   - `google-logo.png` (24x24px, fond transparent)
   - `apple-logo.png` (24x24px, fond transparent)

2. Utilisez un outil comme GIMP, Photoshop, ou un générateur en ligne

3. Modifiez `src/screens/LoginScreen.tsx` pour restaurer les images :

```typescript
// Remplacer les lignes 52-56 par :
<View style={styles.logoPlaceholder}>
  <Text style={styles.logoText}>🚁</Text>
</View>

// Et remplacer les lignes 66-69 et 78-81 par :
<Icon name="language" size={24} color="#007AFF" />

// Dans les styles, ajouter :
logoPlaceholder: {
  width: 120,
  height: 120,
  backgroundColor: '#007AFF',
  borderRadius: 60,
  justifyContent: 'center',
  alignItems: 'center',
  marginBottom: 20,
},
logoText: {
  fontSize: 60,
},
```

---

## 🔧 ÉTAPE 2 : AJOUTER LES PERMISSIONS ANDROID

✅ **DÉJÀ CORRIGÉ** : Les permissions ont été ajoutées dans AndroidManifest.xml.

Pour référence, voici ce qui a été ajouté :

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />

    <application
        android:name=".MainApplication"
        android:label="@string/app_name"
        android:icon="@mipmap/ic_launcher"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:allowBackup="false"
        android:theme="@style/AppTheme"
        android:usesCleartextTraffic="true">
      <activity
        android:name=".MainActivity"
        android:label="@string/app_name"
        android:configChanges="keyboard|keyboardHidden|orientation|screenLayout|screenSize|smallestScreenSize|uiMode"
        android:launchMode="singleTask"
        android:windowSoftInputMode="adjustResize"
        android:exported="true">
        <intent-filter>
            <action android:name="android.intent.action.MAIN" />
            <category android:name="android.intent.category.LAUNCHER" />
        </intent-filter>
      </activity>
    </application>
</manifest>
```

**Modifications apportées** :
- Ajout de `ACCESS_FINE_LOCATION` pour la localisation précise
- Ajout de `ACCESS_COARSE_LOCATION` pour la localisation approximative

---

## 🔧 ÉTAPE 3 : CONFIGURER react-native-vector-icons

✅ **DÉJÀ CONFIGURÉ** : react-native-vector-icons utilise l'auto-linking de React Native 0.73+.

Aucune configuration manuelle nécessaire !

---

## 🔧 ÉTAPE 4 : CONFIGURER GOOGLE MAPS (CRITIQUE)

**Problème** : La carte ne s'affichera pas sans API Key.

**Solution** : Ajouter la clé API Google Maps.

### Obtenir votre clé API Google Maps

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créez un projet ou sélectionnez le projet Firebase existant
3. Activez l'API **Maps SDK for Android**
4. Créez une clé API
5. Restreignez la clé à l'application Android (package name: `com.flymap`)

### Ajouter la clé dans AndroidManifest.xml

Modifier `android/app/src/main/AndroidManifest.xml` dans la balise `<application>` :

```xml
<application
    android:name=".MainApplication"
    android:label="@string/app_name"
    android:icon="@mipmap/ic_launcher"
    android:roundIcon="@mipmap/ic_launcher_round"
    android:allowBackup="false"
    android:theme="@style/AppTheme"
    android:usesCleartextTraffic="true">
    
    <!-- Ajouter cette ligne -->
    <meta-data
        android:name="com.google.android.geo.API_KEY"
        android:value="VOTRE_CLE_API_GOOGLE_MAPS"/>
    
    <activity
        android:name=".MainActivity"
        ...>
    </activity>
</application>
```

---

## 🔧 ÉTAPE 5 : CONFIGURER GOOGLE SIGN-IN (Optionnel mais recommandé)

**Problème** : La connexion Google ne fonctionnera pas sans configuration.

**Solution** : Deux options possibles.

### Option A : Ajouter SHA-1 (Recommandé pour développement)

1. Générez votre SHA-1 de debug :
```bash
cd android
keytool -list -v -keystore app/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

2. Copiez le SHA-1 (ligne "SHA1: XX:XX:XX...")

3. Dans [Firebase Console](https://console.firebase.google.com/) :
   - Project Settings > Your Apps
   - Cliquez sur l'application Android
   - Cliquez sur "Ajouter une empreinte digitale"
   - Collez votre SHA-1
   - Téléchargez le nouveau `google-services.json`

### Option B : Ajouter Web Client ID (Recommandé pour production)

1. Dans Firebase Console > Authentication > Google
2. Copiez le **Web Client ID**
3. Modifiez `src/services/auth.ts` ligne 11 :

```typescript
// Configuration Google Sign-In
GoogleSignin.configure({
  webClientId: 'VOTRE_WEB_CLIENT_ID.apps.googleusercontent.com',
});
```

---

## 🔧 ÉTAPE 6 : CONFIGURER GÉOPORTAIL (Optionnel)

**Problème** : Les restrictions de vol ne se chargeront pas.

**Solution** : Ajouter votre clé API Géoportail.

1. Allez sur https://www.geoportail.gouv.fr/api/remonter/utiliser/cle
2. Créez un compte et obtenez votre clé
3. Modifiez `src/services/geoportail.ts` :

```typescript
// Ligne 18
private static readonly API_ENDPOINT = 'https://wxs.ign.fr/VOTRE_CLE/geoportail/ols';

// Ligne 59
const apiKey = 'VOTRE_CLE'; // Remplacez par votre clé API
```

---

## 🏃 ÉTAPE 7 : LANCER L'APPLICATION

### Nettoyer le projet

```bash
# Nettoyer le cache
cd android
./gradlew clean
cd ..
```

### Installer les dépendances

```bash
npm install
```

### Lancer l'application

```bash
# Terminal 1 : Lancer Metro
npm start --reset-cache

# Terminal 2 : Lancer Android
npm run android
```

---

## 🐛 RÉSOLUTION DE PROBLÈMES

### Erreur : "Unable to resolve module"

**Solution** :
```bash
rm -rf node_modules
npm install
cd android
./gradlew clean
cd ..
npm start --reset-cache
```

### Erreur : "Google Maps not loading"

**Solution** :
- Vérifiez que votre clé API Google Maps est correcte
- Vérifiez que l'API "Maps SDK for Android" est activée
- Vérifiez que l'application n'utilise pas de cache :
```bash
cd android
./gradlew clean
cd ..
npm start --reset-cache
```

### Erreur : "Icons not displaying"

**Solution** :
- Vérifiez que les modifications de `android/app/build.gradle` et `android/settings.gradle` sont appliquées
- Réinstallez l'application :
```bash
npm run android
```

### Erreur : "Firestore not configured"

**Solution** :
- Vérifiez que `google-services.json` est dans `android/app/`
- Vérifiez qu'il n'y a pas d'erreurs dans les logs :
```bash
adb logcat | grep Firebase
```

---

## ✅ CHECKLIST FINALE

Avant de considérer que l'application fonctionne :

- [ ] L'application se lance sans crash
- [ ] L'écran de login s'affiche correctement
- [ ] Les icônes s'affichent correctement
- [ ] La carte Google Maps s'affiche
- [ ] La localisation fonctionne (après autorisation)
- [ ] La connexion Google fonctionne (si configurée)
- [ ] Les spots peuvent être chargés (même vide)
- [ ] La navigation entre écrans fonctionne

---

## 📚 RESSOURCES

- [Documentation React Native](https://reactnative.dev/docs/getting-started)
- [Documentation Firebase](https://firebase.google.com/docs)
- [Documentation Google Maps](https://developers.google.com/maps/documentation/android-sdk)
- [Documentation Géoportail](https://www.geoportail.gouv.fr/api)

---

## 🎯 RÉSUMÉ DES FICHIERS À MODIFIER

1. `android/app/src/main/AndroidManifest.xml` - Permissions et Google Maps API Key
2. `android/app/build.gradle` - react-native-vector-icons
3. `android/settings.gradle` - react-native-vector-icons
4. `src/screens/LoginScreen.tsx` - Images manquantes (Option B)
5. `assets/` - Ajouter les images (Option A)
6. `src/services/auth.ts` - Google Sign-In webClientId (Option B)
7. `src/services/geoportail.ts` - Clé API Géoportail

---

**Bon courage ! 🚀**

Si vous rencontrez des problèmes, consultez les logs avec `adb logcat` ou dans la console Metro.

