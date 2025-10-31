# 🚀 Guide de Déploiement FlyMap - AppStore et Google Play

Ce guide détaillé vous accompagne étape par étape pour publier FlyMap sur les stores Apple et Google.

---

## 📋 Prérequis

### Outils Requis
- **Mac** avec Xcode 14+ (pour iOS)
- **PC/Mac** avec Android Studio (pour Android)
- Comptes développeur :
  - Apple Developer Account (99$/an)
  - Google Play Console Account (25$ unique)
- Node.js 16+ et npm/yarn installés

---

## 🔥 Étape 1 : Configuration Firebase

### 1.1 Créer un Projet Firebase
1. Allez sur [Firebase Console](https://console.firebase.google.com/)
2. Cliquez sur "Ajouter un projet"
3. Nommez votre projet "FlyMap"
4. Désactivez Google Analytics (optionnel)
5. Créez le projet

### 1.2 Activer les Services Firebase

#### Authentication
1. Dans le menu gauche, allez sur "Authentication"
2. Cliquez sur "Commencer"
3. Activez les providers :
   - **Google Sign-In** : Activez et notez le "Client ID Web"
   - **Apple Sign-In** : Activez (iOS uniquement)

#### Firestore Database
1. Allez sur "Firestore Database"
2. Cliquez sur "Créer une base de données"
3. Choisissez "Démarrer en mode test" (pour commencer)
4. Sélectionnez une région (Europe-West1 pour la France)
5. Créez la base de données

#### Storage
1. Allez sur "Storage"
2. Cliquez sur "Commencer"
3. Acceptez les règles par défaut pour commencer

### 1.3 Ajouter les Applications

#### iOS
1. Cliquez sur l'icône iOS
2. Le Bundle ID : `com.flymap.app` (à définir dans Xcode)
3. Téléchargez `GoogleService-Info.plist`
4. Placez-le dans `/ios/FlyMap/`

#### Android
1. Cliquez sur l'icône Android
2. Le nom du package : `com.flymap`
3. Téléchargez `google-services.json`
4. Placez-le dans `/android/app/`

### 1.4 Configurer les Règles Firestore

Dans Firestore > Règles, remplacez le contenu par :

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Spots - lecture publique, écriture authentifiée
    match /spots/{spotId} {
      allow read: if true;
      allow create, update: if request.auth != null;
      allow delete: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    // Reviews - lecture publique, écriture authentifiée
    match /reviews/{reviewId} {
      allow read: if true;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    // Users - lecture/écriture limitées
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
      
      // Activités utilisateur
      match /activities/{activityId} {
        allow read, write: if request.auth.uid == userId;
      }
    }
  }
}
```

### 1.5 Configurer les Règles Storage

Dans Storage > Règles, remplacez le contenu par :

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /spots/{spotId}/photos/{photoId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /spots/{spotId}/videos/{videoId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

---

## 📱 Étape 2 : Configuration iOS (AppStore)

### 2.1 Configuration Xcode

```bash
cd ios
pod install
cd ..
```

1. Ouvrez `ios/FlyMap.xcworkspace` dans Xcode
2. Sélectionnez le projet "FlyMap" dans le navigateur
3. Sous "Signing & Capabilities" :
   - Sélectionnez votre équipe de développement
   - Bundle Identifier : `com.flymap.app`
   - Version : `1.0.0`
   - Build : `1`

### 2.2 Configurer Google Sign-In

1. Dans Xcode, allez dans "Info.plist"
2. Ajoutez la clé suivante :
```xml
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleTypeRole</key>
    <string>Editor</string>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>com.googleusercontent.apps.YOUR_REVERSED_CLIENT_ID</string>
    </array>
  </dict>
</array>
```

**Note** : Récupérez `REVERSED_CLIENT_ID` depuis `GoogleService-Info.plist`

### 2.3 Configurer Apple Sign-In

1. Dans Xcode, ouvrez le fichier projet
2. Sélectionnez la cible "FlyMap"
3. Allez dans "Signing & Capabilities"
4. Cliquez sur "+ Capability"
5. Ajoutez "Sign in with Apple"

### 2.4 Mettre à jour le Code

Dans `src/services/auth.ts`, ligne 10, remplacez :
```typescript
webClientId: 'YOUR_WEB_CLIENT_ID', // Remplacez par votre Client ID Web de Firebase
```

### 2.5 Tester l'Application

```bash
npm run ios
```

### 2.6 Préparer la Build pour Production

1. Dans Xcode, allez dans Product > Scheme > Edit Scheme
2. Changez "Run" en "Release"
3. Product > Destination > "Any iOS Device"
4. Product > Archive
5. Attendez la fin de l'archive

### 2.7 Soumettre à l'AppStore

1. Dans Xcode Organizer, sélectionnez votre archive
2. Cliquez sur "Distribute App"
3. Choisissez "App Store Connect"
4. Suivez l'assistant :
   - Upload automatique
   - Include bitcode (si demandé)
   - Upload symbols (si demandé)
5. Allez sur [App Store Connect](https://appstoreconnect.apple.com/)
6. Créez une nouvelle app :
   - Nom : "FlyMap"
   - Bundle ID : `com.flymap.app`
   - SKU : `FLYMAP001`
7. Remplissez les informations de l'app :
   - Screenshots (obligatoires)
   - Description
   - Mots-clés
   - Politique de confidentialité
8. Soumettez pour review

---

## 🤖 Étape 3 : Configuration Android (Google Play)

### 3.1 Configuration Android Studio

1. Ouvrez `android/` dans Android Studio
2. Ouvrez `android/app/build.gradle` :

```gradle
android {
    compileSdkVersion 33
    
    defaultConfig {
        applicationId "com.flymap"
        minSdkVersion 21
        targetSdkVersion 33
        versionCode 1
        versionName "1.0.0"
        // ...
    }
    
    signingConfigs {
        release {
            if (project.hasProperty('MYAPP_RELEASE_STORE_FILE')) {
                storeFile file(MYAPP_RELEASE_STORE_FILE)
                storePassword MYAPP_RELEASE_STORE_PASSWORD
                keyAlias MYAPP_RELEASE_KEY_ALIAS
                keyPassword MYAPP_RELEASE_KEY_PASSWORD
            }
        }
    }
    
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

### 3.2 Créer une Clé de Signature

```bash
cd android/app
keytool -genkeypair -v -storetype PKCS12 -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

**Note** : Notez tous les mots de passe !!!

### 3.3 Configurer le Fichier de Signing

Créez `android/gradle.properties` et ajoutez :

```properties
MYAPP_RELEASE_STORE_FILE=my-release-key.keystore
MYAPP_RELEASE_KEY_ALIAS=my-key-alias
MYAPP_RELEASE_STORE_PASSWORD=YOUR_STORE_PASSWORD
MYAPP_RELEASE_KEY_PASSWORD=YOUR_KEY_PASSWORD
```

### 3.4 Configurer Google Sign-In

Dans `android/app/src/main/res/values/strings.xml` :

```xml
<resources>
    <string name="app_name">FlyMap</string>
</resources>
```

Dans `android/app/build.gradle`, ajoutez :

```gradle
dependencies {
    // ...
    implementation platform('com.google.firebase:firebase-bom:32.2.0')
    implementation 'com.google.firebase:firebase-auth'
}
```

### 3.5 Mettre à jour le Code

Dans `src/services/auth.ts`, ligne 10, remplacez le `webClientId`.

### 3.6 Générer la Build Release

```bash
cd android
./gradlew bundleRelease
```

Le fichier AAB sera dans : `android/app/build/outputs/bundle/release/app-release.aab`

### 3.7 Soumettre à Google Play

1. Allez sur [Google Play Console](https://play.google.com/console/)
2. Créez une nouvelle application :
   - Nom : "FlyMap"
   - Langue : Français
   - Type : Application
3. Remplissez le dossier d'application :
   - Screenshots (obligatoires)
   - Icône (512x512)
   - Fonctionnalités élevées (carte, localisation)
   - Politique de confidentialité
4. Créez une version de production
5. Téléversez le fichier AAB
6. Soumettez pour review

---

## 🗺️ Étape 4 : Configuration Géoportail

### 4.1 Obtenir une Clé API Géoportail

1. Allez sur [Géoportail API](https://www.geoportail.gouv.fr/api/remonter/utiliser/cle)
2. Créez un compte
3. Demandez une clé API gratuite
4. Notez votre clé API

### 4.2 Mettre à jour le Code

Dans `src/services/geoportail.ts`, lignes 12 et 49, remplacez :
```typescript
const apiKey = 'YOUR_API_KEY'; // Remplacez par votre clé API Géoportail
```

---

## 🎨 Étape 5 : Ressources Visuelles

### Icônes Requises

#### iOS
- **App Icon** : 1024x1024px PNG
- Emplacements :
  - `ios/FlyMap/Images.xcassets/AppIcon.appiconset/`

#### Android
- **App Icon** : 512x512px PNG
- Emplacements multiples (ldpi à xxxhdpi)

### Générer les Icônes

Utilisez un outil comme [AppIcon Generator](https://appicon.co/) pour générer tous les formats nécessaires.

### Screenshots Obligatoires

Vous devez fournir des screenshots pour :

**iOS** :
- iPhone 6.7" : 1290x2796px
- iPhone 6.5" : 1284x2778px
- iPhone 5.5" : 1242x2208px
- iPad Pro 12.9" : 2048x2732px

**Android** :
- Téléphone : 1080x1920px minimum
- Tablette 7" : 1200x1920px
- Tablette 10" : 1600x2560px

---

## 📝 Étape 6 : Politique de Confidentialité

Créez un fichier HTML de politique de confidentialité et hébergez-le sur votre site web.

Exemple minimal :

```html
<!DOCTYPE html>
<html>
<head>
    <title>Politique de Confidentialité - FlyMap</title>
</head>
<body>
    <h1>Politique de Confidentialité FlyMap</h1>
    <p><strong>Dernière mise à jour : [DATE]</strong></p>
    
    <h2>1. Données Collectées</h2>
    <p>FlyMap collecte les informations suivantes :</p>
    <ul>
        <li>Données de compte (email, nom, photo de profil)</li>
        <li>Localisation GPS</li>
        <li>Photos et vidéos uploadées</li>
        <li>Commentaires et notes de spots</li>
    </ul>
    
    <h2>2. Utilisation des Données</h2>
    <p>Vos données sont utilisées pour :</p>
    <ul>
        <li>Authentification via Google/Apple</li>
        <li>Affichage des spots sur la carte</li>
        <li>Historique de vos activités</li>
    </ul>
    
    <h2>3. Stockage</h2>
    <p>Vos données sont stockées de manière sécurisée sur Firebase (Google Cloud).</p>
    
    <h2>4. Vos Droits</h2>
    <p>Vous pouvez supprimer vos données depuis l'application ou en nous contactant à [EMAIL].</p>
    
    <h2>5. Contact</h2>
    <p>Pour toute question : [EMAIL]</p>
</body>
</html>
```

---

## ✅ Checklist Finale

Avant de soumettre aux stores :

### iOS
- [ ] Firebase configuré avec `GoogleService-Info.plist`
- [ ] Google Sign-In configuré
- [ ] Apple Sign-In activé
- [ ] Icônes et screenshots générés
- [ ] Politique de confidentialité en ligne
- [ ] Build Release créée et testée
- [ ] Soumission App Store Connect complétée

### Android
- [ ] Firebase configuré avec `google-services.json`
- [ ] Google Sign-In configuré
- [ ] Clé de signature créée
- [ ] Fichier gradle.properties configuré
- [ ] Icônes et screenshots générés
- [ ] Politique de confidentialité en ligne
- [ ] Build AAB générée et testée
- [ ] Soumission Google Play Console complétée

### Commun
- [ ] Clé API Géoportail configurée
- [ ] Application testée en conditions réelles
- [ ] Tous les liens hardcodés remplacés
- [ ] Règles Firestore et Storage configurées
- [ ] Version et build number configurés

---

## 🎉 Félicitations !

Votre application FlyMap est maintenant prête à être publiée. Les reviews prennent généralement :
- **App Store** : 1-3 jours
- **Google Play** : Quelques heures à 1 jour

En cas de rejet, les stores vous fourniront des explications détaillées pour corriger.

---

## 📞 Support

Pour toute question sur ce guide, consultez :
- [Documentation React Native](https://reactnative.dev/docs/signed-apk-android)
- [Documentation Firebase](https://firebase.google.com/docs)
- [Documentation Apple](https://developer.apple.com/documentation/)
- [Documentation Google Play](https://developer.android.com/distribute)

