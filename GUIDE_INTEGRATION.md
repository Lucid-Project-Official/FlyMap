# 🚀 Guide d'Intégration Complète - FlyMap

Guide unique et à jour pour configurer et déployer FlyMap avec Firebase et GitHub.

---

## 📋 Table des Matières

1. [Prérequis](#prérequis)
2. [Intégration Firebase avec GitHub](#intégration-firebase-avec-github)
3. [Configuration Firebase](#configuration-firebase)
4. [Configuration Locale](#configuration-locale)
5. [Lancement de l'Application](#lancement-de-lapplication)
6. [Déploiement](#déploiement)
7. [Résolution de Problèmes](#résolution-de-problèmes)

---

## 📋 Prérequis

### Outils Requis

- **Node.js** 16+ installé
- **npm** ou **yarn**
- **Git** installé
- **Compte Firebase** (gratuit)
- **Compte GitHub**
- **Clé API Géoportail** (gratuite) - [Obtenir ici](https://www.geoportail.gouv.fr/api/remonter/utiliser/cle)

### Pour le Développement

- **Xcode** (pour iOS, Mac uniquement)
- **Android Studio** (pour Android)

---

## 🔥 Intégration Firebase avec GitHub

### Étape 1 : Connecter le Repository GitHub à Firebase

Firebase permet d'intégrer automatiquement votre repository GitHub pour le déploiement automatique.

1. Allez sur [Firebase Console](https://console.firebase.google.com/)
2. Créez un nouveau projet ou sélectionnez un projet existant
3. Dans le menu latéral, cliquez sur **"Hosting"** (App Hosting si disponible)
4. Cliquez sur **"Get started"** ou **"Add GitHub"**
5. Autorisez Firebase à accéder à votre compte GitHub
6. Sélectionnez votre repository : `Lucid-Project-Official/FlyMap`
7. Configurez la branche (généralement `main`)
8. Firebase détectera automatiquement la configuration

**⚠️ Important** : Firebase Hosting est conçu pour les applications web. Pour une application React Native, vous n'avez pas besoin de Firebase Hosting. Utilisez plutôt Firebase App Distribution ou configurez CI/CD séparément.

### Étape 2 : Vérifier la Configuration du Projet

Assurez-vous que votre `package.json` est correctement configuré :

```json
{
  "name": "flymap",
  "version": "1.0.0",
  "engines": {
    "node": ">=16"
  }
}
```

---

## 🔥 Configuration Firebase

### Étape 1 : Créer un Projet Firebase

1. Allez sur [Firebase Console](https://console.firebase.google.com/)
2. Cliquez sur **"Ajouter un projet"** (ou "Add project")
3. **Nom du projet** : `FlyMap` (ou votre choix)
4. Cliquez sur **"Continuer"**
5. **Optionnel** : Désactivez Google Analytics pour commencer
6. Cliquez sur **"Créer le projet"**
7. Attendez la création (quelques secondes)

### Étape 2 : Activer Authentication

1. Dans le menu de gauche, cliquez sur **"Authentication"**
2. Cliquez sur **"Commencer"** (Get started)
3. Sous l'onglet **"Méthodes de connexion"** (Sign-in method)

#### Configurer Google Sign-In

1. Cliquez sur **"Google"** dans la liste
2. **Activez** le provider en cliquant sur le toggle
3. Choisissez un **email de support** (votre email)
4. Cliquez sur **"Enregistrer"** (Save)
5. **📝 IMPORTANT** : Notez le **"Client ID Web"** (Web client ID) affiché

Exemple : `123456789-abcdefghijklmnop.apps.googleusercontent.com`

#### Configurer Apple Sign-In (iOS uniquement)

1. Cliquez sur **"Apple"** dans la liste
2. **Activez** le provider
3. Renseignez un **nom de service** : `FlyMap`
4. Cliquez sur **"Enregistrer"**

### Étape 3 : Configurer Firestore Database

1. Dans le menu de gauche, cliquez sur **"Firestore Database"**
2. Cliquez sur **"Créer une base de données"** (Create database)
3. Choisissez **"Démarrer en mode test"** (Start in test mode)
   - ⚠️ **Important** : Nous configurerons les règles de sécurité plus tard
4. Cliquez sur **"Suivant"** (Next)
5. Choisissez une **localisation** :
   - Pour la France : `europe-west1` (Belgium)
   - Ou `europe-west3` (Frankfurt)
6. Cliquez sur **"Activer"** (Enable)

**⏳ Attendez quelques secondes** pendant la création de la base de données

#### Configurer les Règles de Sécurité Firestore

1. Une fois la base créée, allez dans l'onglet **"Règles"** (Rules)
2. Remplacez complètement le contenu par :

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helpers
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    // Spots - Lecture publique, écriture authentifiée
    match /spots/{spotId} {
      allow read: if true;  // Tout le monde peut lire les spots
      allow create: if isAuthenticated();  // Seulement authentifié pour créer
      allow update: if isAuthenticated();  // Seulement authentifié pour modifier
      allow delete: if isAuthenticated() && request.resource.data.userId == request.auth.uid;  // Seulement le propriétaire peut supprimer
    }
    
    // Reviews - Lecture publique, écriture authentifiée
    match /reviews/{reviewId} {
      allow read: if true;  // Tout le monde peut lire les avis
      allow create: if isAuthenticated() && request.resource.data.userId == request.auth.uid;  // Créer seulement votre propre avis
      allow update: if isOwner(resource.data.userId);  // Modifier seulement votre propre avis
      allow delete: if isOwner(resource.data.userId);  // Supprimer seulement votre propre avis
    }
    
    // Users - Données utilisateur
    match /users/{userId} {
      allow read: if isAuthenticated();  // Seulement les utilisateurs authentifiés peuvent lire
      allow write: if isOwner(userId);  // Seulement le propriétaire peut modifier
      
      // Activités utilisateur - Seulement le propriétaire
      match /activities/{activityId} {
        allow read, write: if isOwner(userId);
      }
    }
  }
}
```

3. Cliquez sur **"Publier"** (Publish)

### Étape 4 : Configurer Storage

1. Dans le menu de gauche, cliquez sur **"Storage"**
2. Cliquez sur **"Commencer"** (Get started)
3. Choisissez **"Démarrer en mode test"** (Start in test mode)
4. Choisissez la même **localisation** que Firestore
5. Cliquez sur **"Terminé"** (Done)

#### Configurer les Règles de Storage

1. Dans Storage, allez dans l'onglet **"Règles"** (Rules)
2. Remplacez complètement le contenu par :

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Photos de spots - Lecture publique, écriture authentifiée
    match /spots/{spotId}/photos/{photoId} {
      allow read: if true;  // Tout le monde peut lire les photos
      allow write: if request.auth != null && request.resource.size < 10 * 1024 * 1024 && request.resource.contentType.matches('image/.*');  // Upload maximum 10MB, format image
    }
    
    // Vidéos de spots - Lecture publique, écriture authentifiée
    match /spots/{spotId}/videos/{videoId} {
      allow read: if true;  // Tout le monde peut lire les vidéos
      allow write: if request.auth != null && request.resource.size < 100 * 1024 * 1024 && request.resource.contentType.matches('video/.*');  // Upload maximum 100MB, format vidéo
    }
  }
}
```

3. Cliquez sur **"Publier"** (Publish)

### Étape 5 : Ajouter l'Application iOS

#### 5.1 Enregistrer l'App iOS

1. Dans le dashboard Firebase, cliquez sur l'icône **iOS** (ou "Add app" > iOS)
2. **Bundle ID iOS** : `com.flymap.app`
   - ⚠️ **Important** : Ce Bundle ID doit correspondre exactement à celui dans Xcode
3. **Nom de l'app** : `FlyMap`
4. **App Store ID** : Laissez vide pour l'instant
5. Cliquez sur **"Enregistrer l'application"** (Register app)

#### 5.2 Télécharger GoogleService-Info.plist

1. **IMPORTANT** : Cliquez sur le bouton **"Télécharger GoogleService-Info.plist"**
2. Sauvegardez ce fichier
3. **Ne fermez pas** cette page ! Vous aurez besoin des instructions plus tard

#### 5.3 Placer le Fichier iOS

**Si vous avez déjà les dossiers `ios/`** :

Le fichier doit aller dans :
```
ios/FlyMap/GoogleService-Info.plist
```

**Sur Windows** :
- Clic droit sur le fichier téléchargé → Copier
- Allez dans `C:\Users\VotreNom\Documents\FlyMap\ios\FlyMap\`
- Clic droit → Coller

**Sur Mac** :
```bash
cp GoogleService-Info.plist /chemin/vers/FlyMap/ios/FlyMap/
```

#### 5.4 Intégrer le Fichier dans Xcode

1. Ouvrez Xcode
2. Ouvrez le fichier `ios/FlyMap.xcworkspace` (pas .xcodeproj !)
3. Dans le navigateur de fichiers à gauche, faites un clic droit sur le dossier `FlyMap`
4. Choisissez **"Add Files to FlyMap..."**
5. Sélectionnez `GoogleService-Info.plist`
6. **IMPORTANT** : Vérifiez que ces options sont cochées :
   - ✅ "Copy items if needed"
   - ✅ "Create groups"
   - ✅ Sélectionnez la bonne Target (FlyMap)
7. Cliquez sur **"Add"**
8. Vérifiez que le fichier apparaît dans le projet

### Étape 6 : Ajouter l'Application Android

#### 6.1 Enregistrer l'App Android

1. Revenez dans Firebase Console
2. Cliquez sur l'icône **Android** (ou "Add app" > Android)
3. **Package Name Android** : `com.flymap`
   - ⚠️ **Important** : Ce nom doit correspondre à celui dans `android/app/build.gradle`
4. **Nom de l'app** : `FlyMap`
5. **Certificat de signature SHA-1** : Laissez vide pour l'instant
6. Cliquez sur **"Enregistrer l'application"** (Register app)

#### 6.2 Télécharger google-services.json

1. **IMPORTANT** : Cliquez sur le bouton **"Télécharger google-services.json"**
2. Sauvegardez ce fichier
3. **Ne fermez pas** cette page !

#### 6.3 Placer le Fichier Android

**Si vous avez déjà les dossiers `android/`** :

Le fichier doit aller dans :
```
android/app/google-services.json
```

**Sur Windows** :
- Clic droit sur le fichier téléchargé → Copier
- Allez dans `C:\Users\VotreNom\Documents\FlyMap\android\app\`
- Clic droit → Coller

**Sur Mac/Linux** :
```bash
cp google-services.json /chemin/vers/FlyMap/android/app/
```

#### 6.4 Configurer Android Build

1. Ouvrez le fichier `android/build.gradle`
2. Dans le bloc `buildscript` > `dependencies`, ajoutez :
```gradle
classpath 'com.google.gms:google-services:4.4.0'
```

Exemple complet :
```gradle
buildscript {
    dependencies {
        classpath "com.android.tools.build:gradle:7.3.0"
        classpath "com.facebook.react:react-native-gradle-plugin"
        classpath 'com.google.gms:google-services:4.4.0'  // <-- AJOUTEZ CETTE LIGNE
    }
}
```

3. Ouvrez le fichier `android/app/build.gradle`
4. Tout en haut du fichier, ajoutez :
```gradle
apply plugin: 'com.google.gms.google-services'
```

Exemple :
```gradle
apply plugin: "com.android.application"
apply plugin: "com.facebook.react"
apply plugin: 'com.google.gms.google-services'  // <-- AJOUTEZ CETTE LIGNE

// Le reste du fichier...
```

5. **Synchronisez Gradle** :
   - Dans Android Studio : File > Sync Project with Gradle Files
   - Ou en ligne de commande : `cd android && ./gradlew clean`

---

## 💻 Configuration Locale

### Étape 1 : Générer les Dossiers Natifs (si nécessaire)

**Si vous n'avez pas encore les dossiers `android/` et `ios/`** :

#### Option A : React Native CLI (Recommandé)

```bash
# 1. Installer CLI globalement
npm install -g react-native-cli

# 2. Créer projet temporaire
npx react-native init FlyMapTemp --template react-native@0.73.0

# 3. Copier les dossiers (Windows PowerShell)
Copy-Item -Path "FlyMapTemp\android" -Destination "android" -Recurse
Copy-Item -Path "FlyMapTemp\ios" -Destination "ios" -Recurse

# Sur Mac/Linux :
cp -r FlyMapTemp/android .
cp -r FlyMapTemp/ios .

# 4. Supprimer le dossier temporaire
Remove-Item -Path "FlyMapTemp" -Recurse -Force  # Windows
rm -rf FlyMapTemp  # Mac/Linux
```

#### Option B : Expo (Plus simple)

```bash
npm install -g expo-cli
npx expo install
npx expo prebuild
```

**⚠️ Note** : Expo nécessitera quelques ajustements dans le code. L'option A est recommandée.

### Étape 2 : Installer les Dépendances

```bash
# Depuis la racine du projet FlyMap
npm install
```

### Étape 3 : Configurer les Pods iOS (Mac uniquement)

```bash
cd ios
pod install
cd ..
```

### Étape 4 : Configurer App.tsx

Ouvrez le fichier `App.tsx` et trouvez ces lignes (vers la ligne 22) :

```typescript
const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_AUTH_DOMAIN',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_STORAGE_BUCKET',
  messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
  appId: 'YOUR_APP_ID',
};
```

**Remplacez ces valeurs** par celles trouvées dans Firebase :

**Où trouver ces valeurs ?**

1. Allez dans Firebase Console
2. Cliquez sur l'**icône ⚙️** (Settings/Paramètres)
3. Choisissez **"Paramètres du projet"** (Project settings)
4. Descendez jusqu'à **"Vos applications"** (Your apps)
5. Vous verrez vos apps iOS et Android listées

**Option A : Prendre depuis iOS**
- Cliquez sur votre app iOS
- Dans "Configuration", vous verrez toutes les valeurs nécessaires

**Option B : Prendre depuis Android**
- Cliquez sur votre app Android
- Dans "Configuration", vous verrez toutes les valeurs nécessaires

**Ces valeurs sont identiques** pour iOS et Android d'un même projet Firebase.

Exemple de configuration complète :
```typescript
const firebaseConfig = {
  apiKey: 'AIzaSyABC123XYZ',
  authDomain: 'flymap-12345.firebaseapp.com',
  projectId: 'flymap-12345',
  storageBucket: 'flymap-12345.appspot.com',
  messagingSenderId: '123456789012',
  appId: '1:123456789012:ios:abcdef123456789',
};
```

### Étape 5 : Configurer auth.ts

Ouvrez le fichier `src/services/auth.ts` et trouvez cette ligne (ligne 10) :

```typescript
GoogleSignin.configure({
  webClientId: 'YOUR_WEB_CLIENT_ID',
});
```

**Remplacez** `YOUR_WEB_CLIENT_ID` par le **Client ID Web** que vous avez noté à l'Étape 2 (Configuration Firebase > Google Sign-In).

**Où trouver le Client ID Web ?**

1. Firebase Console > Authentication
2. Onglet **"Méthodes de connexion"** (Sign-in method)
3. Cliquez sur **"Google"**
4. Le **"Client ID Web"** est affiché dans la section config
5. Copiez-le (sans les espaces)

Exemple :
```typescript
GoogleSignin.configure({
  webClientId: '123456789-abcdefghijklmnop.apps.googleusercontent.com',
});
```

### Étape 6 : Configurer Géoportail

Dans `src/services/geoportail.ts`, lignes 12 et 49, remplacez :

```typescript
const apiKey = 'YOUR_API_KEY'; // Remplacez par votre clé API Géoportail
```

Obtenez votre clé gratuite sur : https://www.geoportail.gouv.fr/api/remonter/utiliser/cle

### Étape 7 : Ajouter les Ressources Visuelles (Optionnel)

Créez le dossier `assets` à la racine du projet et ajoutez :

```
assets/
├── logo.png           (512x512px recommandé)
├── google-logo.png    (24x24px transparent)
└── apple-logo.png     (24x24px, fond transparent)
```

**Note** : Vous pouvez temporairement commenter les lignes avec `require('../../assets/...')` dans `src/screens/LoginScreen.tsx` pour tester sans images.

---

## 🚀 Lancement de l'Application

### Android

```bash
npm run android
```

**Première fois** :
1. Ouvrez Android Studio
2. Attendez que les dépendances se téléchargent
3. Lancez un émulateur ou connectez un appareil

### iOS (Mac uniquement)

```bash
npm run ios
```

**Première fois** :
1. Ouvrez `ios/FlyMap.xcworkspace` dans Xcode
2. Configurez votre compte développeur
3. Sélectionnez un simulateur ou appareil iOS
4. Cliquez sur Run

### Vérifier que ça fonctionne

L'application devrait se lancer sans erreur Firebase.

Si vous voyez des erreurs comme :
- "Firebase not initialized" → Vérifiez App.tsx
- "Google Sign-In error" → Vérifiez auth.ts et webClientId
- "google-services.json not found" → Vérifiez l'emplacement du fichier Android
- "GoogleService-Info.plist not found" → Vérifiez l'emplacement du fichier iOS

---

## 📦 Déploiement

### Configuration pour le Déploiement

Pour publier sur les stores, consultez le guide détaillé dans `DEPLOYMENT.md`.

**Résumé rapide** :

#### iOS (App Store)
1. Configurez le signing dans Xcode
2. Créez une archive (Product > Archive)
3. Soumettez via Xcode Organizer ou App Store Connect

#### Android (Google Play)
1. Créez une clé de signature
2. Configurez `gradle.properties`
3. Générez un AAB : `cd android && ./gradlew bundleRelease`
4. Téléversez sur Google Play Console

---

## ✅ Checklist de Vérification

Vérifiez que tous ces points sont OK :

### Firebase Console
- [ ] Projet Firebase créé
- [ ] Authentication activé (Google + Apple)
- [ ] Firestore Database créée avec les bonnes règles
- [ ] Storage créé avec les bonnes règles
- [ ] App iOS enregistrée
- [ ] App Android enregistrée

### Fichiers Téléchargés
- [ ] `GoogleService-Info.plist` téléchargé
- [ ] `google-services.json` téléchargé

### Fichiers dans le Projet
- [ ] `ios/FlyMap/GoogleService-Info.plist` présent
- [ ] `android/app/google-services.json` présent

### Configuration Code
- [ ] `App.tsx` configuré avec les bonnes valeurs Firebase
- [ ] `src/services/auth.ts` configuré avec le webClientId
- [ ] `src/services/geoportail.ts` configuré avec la clé API
- [ ] `android/build.gradle` avec google-services classpath
- [ ] `android/app/build.gradle` avec apply plugin google-services

### Build
- [ ] `npm install` exécuté
- [ ] `cd ios && pod install && cd ..` exécuté (Mac)
- [ ] Gradle synchronisé (Android)
- [ ] Application compile sans erreur Firebase
- [ ] Application se lance sans erreur

---

## 🆘 Résolution de Problèmes

### Erreur : Conflit de Dépendances React

**Cause** : Versions incompatibles de React

**Solution** :
```bash
# Vérifiez que package.json a React >= 18.3.1
npm install react@18.3.1
npm install
```

### Erreur : "GoogleService-Info.plist not found"

**Cause** : Le fichier n'est pas au bon endroit ou pas inclus dans Xcode

**Solution** :
1. Vérifiez que le fichier est dans `ios/FlyMap/`
2. Ouvrez Xcode > FlyMap.xcworkspace
3. Vérifiez que le fichier est listé dans le projet
4. Si absent : Add Files to FlyMap... → Sélectionnez le fichier → Add

### Erreur : "google-services.json not found"

**Cause** : Le fichier n'est pas au bon endroit

**Solution** :
1. Vérifiez que le fichier est dans `android/app/`
2. Vérifiez l'orthographe exacte : `google-services.json` (avec tiret et minuscules)

### Erreur : "Google Sign-In not configured"

**Cause** : webClientId incorrect ou mal configuré

**Solution** :
1. Vérifiez Firebase > Authentication > Google
2. Copiez le Client ID Web complet (avec le domaine `.apps.googleusercontent.com`)
3. Vérifiez qu'il n'y a pas d'espaces
4. Vérifiez que c'est bien le CLIENT WEB, pas CLIENT OAuth

### Erreur : "Firebase not initialized"

**Cause** : Configuration Firebase incorrecte dans App.tsx

**Solution** :
1. Vérifiez que toutes les valeurs dans firebaseConfig sont remplies
2. Vérifiez qu'il n'y a pas de guillemets supplémentaires
3. Relancez l'application après modification

### Erreur : Build iOS échoue

**Cause** : Pods non installés ou Xcode mal configuré

**Solution** :
```bash
cd ios
rm -rf Pods
pod deintegrate
pod install
cd ..
```

Puis relancez l'application.

### Erreur : Build Android échoue

**Cause** : Gradle non synchronisé ou configuration incorrecte

**Solution** :
1. Vérifiez `android/build.gradle` (classpath google-services)
2. Vérifiez `android/app/build.gradle` (apply plugin google-services)
3. Dans Android Studio : File > Invalidate Caches / Restart
4. Relancez la synchronisation Gradle

### Erreur : Firebase Hosting essaie de builder React Native

**Cause** : Firebase Hosting est configuré mais ne fonctionne pas avec React Native

**Solution** :
- **Pour une app React Native, n'utilisez PAS Firebase Hosting**
- Utilisez plutôt Firebase App Distribution ou configurez un CI/CD séparé
- Si vous avez besoin d'une version web, utilisez React Native Web

---

## 📞 Besoin d'Aide ?

Si vous êtes bloqué :
1. Vérifiez cette checklist complète
2. Consultez la section "Résolution de Problèmes"
3. Consultez [la documentation Firebase](https://firebase.google.com/docs)
4. Vérifiez les commentaires dans le code

---

**✅ Une fois cette configuration terminée, votre application FlyMap sera connectée à Firebase et prête à être utilisée !**

---

**Dernière mise à jour** : 2025-10-31
