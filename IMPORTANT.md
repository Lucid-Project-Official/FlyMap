# ⚠️ INFORMATIONS IMPORTANTES - FlyMap

## 📋 Récapitulatif du Projet

FlyMap est une application mobile complète pour découvrir, partager et évaluer les meilleurs spots de vol de drones en France. L'application intègre les restrictions officielles du Géoportail français.

---

## ✅ Fonctionnalités Implémentées

### 🔐 Authentification
- ✅ Connexion avec compte Google
- ✅ Connexion avec compte Apple (iOS uniquement)
- ✅ Gestion sécurisée des sessions Firebase
- ✅ Déconnexion

### 🗺️ Carte Interactive
- ✅ Affichage des spots sur une carte Google Maps
- ✅ Markers personnalisés avec catégories et notes
- ✅ Localisation GPS de l'utilisateur
- ✅ Navigation vers les détails d'un spot
- ⚠️ Intégration Géoportail (nécessite clé API)

### 🔍 Recherche et Filtres
- ✅ Recherche par mot-clé
- ✅ Filtres par catégorie (Freestyle, Bando, Race, Cinématique, Autre)
- ✅ Filtre par rayon géographique (5km, 10km, 20km, 50km, 100km)
- ✅ Affichage des résultats sous forme de cartes

### 📍 Gestion des Spots
- ✅ Création de spots (nom, description, catégorie, position GPS)
- ✅ Notation /5 étoiles
- ✅ Upload de photos
- ✅ Upload de vidéos (interface prête)
- ✅ Affichage des spots sur la carte
- ✅ Détails d'un spot

### ⭐ Système de Reviews
- ✅ Notation des spots
- ✅ Commentaires avec photos
- ✅ Calcul automatique de la note moyenne
- ✅ Affichage de tous les avis

### 👤 Profil Utilisateur
- ✅ Affichage des statistiques (spots créés, activités)
- ✅ Liste des spots créés par l'utilisateur
- ✅ Historique complet des activités
- ✅ Gestion du profil

---

## 🚧 Configuration Nécessaire AVANT le Première Utilisation

### 1. Firebase (OBLIGATOIRE)
Vous DEVEZ créer un compte Firebase et configurer :
- Authentication (Google + Apple)
- Firestore Database
- Storage
- Télécharger les fichiers de configuration

**Guide complet** : Voir `DEPLOYMENT.md` Section 1

### 2. Géoportail (OBLIGATOIRE pour les restrictions)
Obtenez une clé API gratuite sur :
https://www.geoportail.gouv.fr/api/remonter/utiliser/cle

### 3. Icônes et Ressources (OPTIONNEL pour tester)
Ajoutez dans `assets/` :
- `logo.png`
- `google-logo.png`
- `apple-logo.png`

Ou commentez les lignes correspondantes dans `LoginScreen.tsx`

---

## 📁 Fichiers à Configurer

### Avant de lancer l'application :

1. **App.tsx** (lignes 22-28)
   ```typescript
   const firebaseConfig = {
     apiKey: 'YOUR_API_KEY',
     // ... remplacez par vos valeurs Firebase
   };
   ```

2. **src/services/auth.ts** (ligne 10)
   ```typescript
   GoogleSignin.configure({
     webClientId: 'YOUR_WEB_CLIENT_ID',
   });
   ```

3. **src/services/geoportail.ts** (lignes 12, 49)
   ```typescript
   const apiKey = 'YOUR_API_KEY'; // Clé API Géoportail
   ```

---

## 🗂️ Structure du Code

```
FlyMap/
├── App.tsx                    # Point d'entrée, navigation
├── src/
│   ├── components/            # Composants UI réutilisables
│   │   ├── SpotMarker.tsx     # Marker de spot sur carte
│   │   ├── SpotCard.tsx       # Carte d'un spot dans la liste
│   │   └── ReviewCard.tsx     # Carte d'un avis
│   ├── screens/               # Écrans principaux
│   │   ├── LoginScreen.tsx    # Authentification
│   │   ├── MapScreen.tsx      # Carte principale
│   │   ├── SearchScreen.tsx   # Recherche et filtres
│   │   ├── AddSpotScreen.tsx  # Création de spot
│   │   ├── SpotDetailScreen.tsx # Détails et avis
│   │   └── ProfileScreen.tsx  # Profil utilisateur
│   ├── services/              # Logique métier
│   │   ├── auth.ts            # Authentification Firebase
│   │   ├── firestore.ts       # Base de données
│   │   ├── storage.ts         # Upload images/vidéos
│   │   └── geoportail.ts      # API Géoportail
│   └── types/                 # Types TypeScript
│       └── index.ts           # Interfaces
├── DEPLOYMENT.md              # Guide de publication stores
├── SETUP.md                   # Configuration détaillée
└── QUICKSTART.md              # Démarrage rapide
```

---

## 🚀 Étapes Suivantes

### Pour Développer Localement :
1. Lisez `QUICKSTART.md`
2. Suivez `SETUP.md`
3. Lancez `npm run android` ou `npm run ios`

### Pour Publier sur les Stores :
1. Lisez `DEPLOYMENT.md` (guide complet)
2. Configurez Firebase en production
3. Générez les icônes et screenshots
4. Créez les builds de production
5. Soumettez aux stores

---

## 📊 Technologies Utilisées

| Technologie | Usage |
|------------|-------|
| React Native 0.73 | Framework mobile cross-platform |
| TypeScript | Typage statique |
| React Navigation 6 | Navigation entre écrans |
| Firebase Auth | Authentification |
| Firestore | Base de données NoSQL |
| Firebase Storage | Stockage images/vidéos |
| React Native Maps | Cartes Google Maps |
| Google Sign-In | Connexion Google |
| Apple Sign-In | Connexion Apple (iOS) |
| React Native Geolocation | Localisation GPS |
| React Native Image Picker | Sélection photos/vidéos |

---

## ⚠️ Points d'Attention

### Sécurité
- Les règles Firestore sont configurées pour empêcher les abus
- L'authentification est obligatoire pour créer du contenu
- Les règles Storage empêchent l'upload par des utilisateurs non authentifiés
- **RÉVISEZ LES RÈGLES** avant la mise en production

### Performance
- Les images sont uploadées en 80% qualité pour économiser l'espace
- Les spots sont paginés dans Firestore (à implémenter si > 100 spots)
- Le cache local n'est pas encore implémenté

### Géoportail
- L'intégration complète nécessite une clé API
- La vérification point-in-polygon fonctionne mais doit être testée
- Considérez utiliser une WebView intégrée comme alternative

---

## 🐛 Bugs Connus / Améliorations Futures

### À Implémenter :
- [ ] Pagination des résultats de recherche
- [ ] Cache local avec AsyncStorage
- [ ] Notifications push
- [ ] Partager un spot sur réseaux sociaux
- [ ] Mode offline
- [ ] Modération des contenus
- [ ] Signalement d'un spot
- [ ] Géolocalisation offline

### Bugs Potentiels :
- La recherche par rayon peut être imprécise avec beaucoup de spots
- Les vidéos ne sont pas encore téléversées correctement
- L'intégration Géoportail nécessite des tests approfondis

---

## 📝 Licence et Crédits

Cette application utilise :
- [React Native](https://reactnative.dev/) - Facebook
- [Firebase](https://firebase.google.com/) - Google
- [Géoportail](https://www.geoportail.gouv.fr/) - IGN France

**Données Géoportail** : © [Institut national de l'information géographique et forestière](https://www.ign.fr/) - Restrictions UAS Catégorie Ouverte et Aéromodélisme

---

## 📞 Support

Pour toute question technique :
1. Consultez les fichiers de documentation
2. Vérifiez les commentaires dans le code
3. Consultez la documentation officielle des bibliothèques

---

**Dernière mise à jour** : Application fonctionnelle et prête pour configuration

**Prochaine étape** : Configuration Firebase → Voir `SETUP.md`

