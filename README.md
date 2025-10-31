# 🚁 FlyMap - Application Mobile

Application mobile React Native pour découvrir, partager et évaluer les meilleurs spots de vol de drones en France.

---

## 🎯 Fonctionnalités

- 📍 **Carte interactive** avec restrictions de vol officielles du Géoportail français
- 🔐 **Authentification** avec compte Google et Apple
- ⭐ **Notation et commentaires** des spots (5 étoiles)
- 📂 **Catégorisation** des spots (Freestyle, Bando, Race, Cinématique)
- 📸 **Partage de photos et vidéos**
- 🔍 **Recherche avancée** avec filtres (mot-clé, catégorie, rayon)
- 👤 **Profil utilisateur** avec historique complet

---

## 🛠️ Technologies

| Technologie | Version | Usage |
|------------|---------|-------|
| React Native | 0.73 | Framework mobile |
| TypeScript | 5.3 | Typage statique |
| Firebase | Latest | Backend & Auth |
| React Navigation | 6.x | Navigation |
| React Native Maps | Latest | Cartes |
| Géoportail | API | Restrictions vol |

---

## ⚡ Démarrage Rapide

### Prérequis

- **Node.js** 16+
- **Compte Firebase** (gratuit)
- **Clé API Géoportail** (gratuite)
- **Xcode** (iOS, Mac uniquement) ou **Android Studio** (Android)

### Installation

```bash
# 1. Clonez le projet
git clone <votre-repo>

# 2. Installez les dépendances
npm install --legacy-peer-deps

# 3. Suivez le guide d'intégration complet
# 4. Lancez l'application

npm run android  # Pour Android
npm run ios      # Pour iOS (Mac uniquement)
```

---

## 📚 Documentation

### Guide d'Intégration

👉 **[GUIDE_INTEGRATION.md](GUIDE_INTEGRATION.md)** - **Guide complet de A à Z**

Ce guide unique vous explique étape par étape :
- ✅ Installation des outils
- ✅ Configuration Firebase complète (Auth, Firestore, Storage)
- ✅ Génération des dossiers natifs (iOS/Android)
- ✅ Configuration du projet
- ✅ Lancement de l'application
- ✅ Résolution de problèmes courants

**Commencez par là !** 🚀

---

## 🏗️ Architecture

```
src/
├── components/     # UI réutilisables (Marker, Card, etc.)
├── screens/        # Écrans principaux (Map, Search, Profile)
├── services/       # Logique métier (Firebase, Géoportail)
└── types/          # Types TypeScript
```

---

## 🔐 Configuration Requise

Avant de lancer l'application, vous DEVEZ configurer :

- ✅ Firebase (Authentication, Firestore, Storage)
- ✅ Google Sign-In (Client ID Web)
- ✅ Clé API Géoportail
- ✅ Fichiers de configuration Firebase (GoogleService-Info.plist, google-services.json)

👉 **Suivez [GUIDE_INTEGRATION.md](GUIDE_INTEGRATION.md) pour toutes les étapes détaillées**

---

## 📱 Screenshots

*À venir*

---

## 🤝 Contribution

Ce projet est privé. Pour toute question :
- Consultez [GUIDE_INTEGRATION.md](GUIDE_INTEGRATION.md)
- Vérifiez les commentaires dans le code
- Contactez l'équipe de développement

---

## 📄 Licence

Private - Tous droits réservés

**Données Géoportail** : © IGN France - Restrictions UAS Catégorie Ouverte et Aéromodélisme

---

## 🎉 Prochaine Étape

👉 **Commencez par lire [GUIDE_INTEGRATION.md](GUIDE_INTEGRATION.md)** - Guide complet de A à Z

---

*Application développée avec ❤️ en React Native*
