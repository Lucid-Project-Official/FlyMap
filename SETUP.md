# 🔧 Guide de Configuration et Démarrage Rapide

Ce guide vous accompagne pour installer et lancer FlyMap localement.

---

## 📋 Prérequis

- **Node.js** 16+ installé
- **npm** ou **yarn**
- **Xcode** (pour iOS, Mac uniquement)
- **Android Studio** (pour Android)
- Compte **Firebase** (gratuit)
- Clé API **Géoportail** (gratuite)

---

## 🚀 Installation

### 1. Installer les Dépendances

```bash
npm install
```

ou

```bash
yarn install
```

### 2. Configuration iOS (Mac uniquement)

```bash
cd ios
pod install
cd ..
```

### 3. Ajouter les Ressources Visuelles

Créez le dossier `assets` à la racine du projet et ajoutez les images suivantes :

```
assets/
├── logo.png           (512x512px recommandé)
├── google-logo.png    (24x24px transparent)
└── apple-logo.png     (24x24px, fond transparent)
```

**Note** : Vous pouvez temporairement commenter les lignes avec `require('../../assets/...')` dans `src/screens/LoginScreen.tsx` pour tester sans images.

### 4. Configuration Firebase

Créez un fichier `firebase-config.json` à la racine (ne commitez pas ce fichier) :

```json
{
  "apiKey": "YOUR_API_KEY",
  "authDomain": "YOUR_AUTH_DOMAIN",
  "projectId": "YOUR_PROJECT_ID",
  "storageBucket": "YOUR_STORAGE_BUCKET",
  "messagingSenderId": "YOUR_MESSAGING_SENDER_ID",
  "appId": "YOUR_APP_ID"
}
```

Remplacez les valeurs dans `App.tsx` lignes 22-28.

### 5. Configuration Google Sign-In

Dans `src/services/auth.ts`, ligne 10, remplacez :
```typescript
webClientId: 'YOUR_WEB_CLIENT_ID', // Client ID Web de Firebase
```

### 6. Configuration Géoportail

Dans `src/services/geoportail.ts`, lignes 12 et 49, remplacez :
```typescript
const apiKey = 'YOUR_API_KEY'; // Clé API Géoportail
```

---

## 🏃 Lancer l'Application

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

---

## 🐛 Résolution de Problèmes Courants

### Erreur "Metro bundler not found"

```bash
npm start
```

Dans un autre terminal :
```bash
npm run android
# ou
npm run ios
```

### Erreur avec les icônes vectorielles

```bash
cd ios && pod install && cd ..
# ou
npm install react-native-vector-icons
```

### Firebase n'est pas configuré

1. Vérifiez que vous avez bien ajouté `google-services.json` (Android) et `GoogleService-Info.plist` (iOS)
2. Vérifiez les configurations dans `App.tsx`
3. Relancez l'application

### Erreur Google Sign-In

1. Vérifiez que le `webClientId` est correct
2. Vérifiez que Google Sign-In est activé dans Firebase Console
3. Vérifiez la configuration dans `Info.plist` (iOS)

---

## 📱 Tester l'Application

### Scénarios de Test Recommandés

1. **Connexion**
   - Testez avec Google
   - Testez avec Apple (iOS uniquement)

2. **Carte**
   - Vérifiez l'affichage des spots
   - Testez la localisation GPS
   - Testez le clic sur un marker

3. **Recherche**
   - Testez la recherche par mot-clé
   - Testez les filtres par catégorie
   - Testez le filtre par rayon

4. **Ajouter un Spot**
   - Créez un nouveau spot
   - Ajoutez des photos
   - Vérifiez la géolocalisation

5. **Profil**
   - Vérifiez les statistiques
   - Vérifiez l'historique
   - Testez la déconnexion

---

## 📝 Structure du Projet

```
FlyMap/
├── src/
│   ├── components/       # Composants réutilisables
│   ├── screens/          # Écrans de l'application
│   ├── services/         # Logique métier (Firebase, API)
│   └── types/            # Types TypeScript
├── assets/               # Images et ressources
├── ios/                  # Configuration iOS
├── android/              # Configuration Android
├── App.tsx              # Point d'entrée
└── package.json         # Dépendances
```

---

## 🔐 Sécurité

⚠️ **Important** : Ne commitez jamais :
- `firebase-config.json`
- `google-services.json`
- `GoogleService-Info.plist`
- Clés API
- Identifiants de production

Ces fichiers sont déjà dans `.gitignore`.

---

## 📚 Ressources Utiles

- [Documentation React Native](https://reactnative.dev/)
- [Documentation Firebase](https://firebase.google.com/docs)
- [React Navigation](https://reactnavigation.org/)
- [React Native Maps](https://github.com/react-native-maps/react-native-maps)
- [Géoportail API](https://www.geoportail.gouv.fr/api/)

---

## 🆘 Besoin d'Aide ?

Consultez :
1. Le fichier `DEPLOYMENT.md` pour le déploiement
2. Les commentaires dans le code
3. La documentation des bibliothèques

---

**Bon développement ! 🚁**

