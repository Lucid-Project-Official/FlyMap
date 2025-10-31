# FlyMap - Application Mobile de Spots de Vol de Drones 🚁

Application mobile complète pour découvrir, partager et évaluer les meilleurs spots de vol de drones en France.

[![React Native](https://img.shields.io/badge/React%20Native-0.73-blue.svg)](https://reactnative.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-Latest-orange.svg)](https://firebase.google.com/)

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
- Node.js 16+
- Compte Firebase
- Clé API Géoportail (gratuite)

### Installation

```bash
# 1. Clonez le projet
git clone <votre-repo>

# 2. Installez les dépendances
npm install

# 3. Suivez le guide d'intégration complet
# 4. Lancez l'application

npm run android  # Pour Android
npm run ios      # Pour iOS (Mac uniquement)
```

**📖 Documentation complète** :
- **[GUIDE_INTEGRATION.md](GUIDE_INTEGRATION.md)** 🚀 - **Guide unique et complet** pour configurer Firebase et lancer l'application
- [DEPLOYMENT.md](DEPLOYMENT.md) - Publication sur les stores AppStore/Google Play
- [IMPORTANT.md](IMPORTANT.md) - Informations techniques et architecture

---

## 📚 Documentation

### Guides Disponibles

1. **[GUIDE_INTEGRATION.md](GUIDE_INTEGRATION.md)** 🚀 **← COMMENCEZ ICI**
   Guide unique et complet pour :
   - Intégration Firebase avec GitHub
   - Configuration Firebase complète (Auth, Firestore, Storage)
   - Configuration locale (iOS/Android)
   - Lancement de l'application
   - Résolution de problèmes

2. **[DEPLOYMENT.md](DEPLOYMENT.md)** 🚀
   Guide complet de publication AppStore/Google Play

3. **[IMPORTANT.md](IMPORTANT.md)** ⚠️
   Informations techniques et architecture du projet

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
- ✅ Icônes et ressources visuelles

Consultez :
- **[GUIDE_INTEGRATION.md](GUIDE_INTEGRATION.md)** pour la configuration complète (Firebase, local, lancement)

---

## 📱 Screenshots

*À venir après génération des screenshots*

---

## 🤝 Contribution

Ce projet est privé. Pour toute question :
- Consultez la documentation
- Vérifiez les commentaires dans le code
- Contactez l'équipe de développement

---

## 📄 Licence

Private - Tous droits réservés

**Données Géoportail** : © IGN France - Restrictions UAS Catégorie Ouverte et Aéromodélisme

---

## 🎉 Prochaine Étape

👉 **Commencez par lire [GUIDE_INTEGRATION.md](GUIDE_INTEGRATION.md)** - Guide unique et complet pour tout configurer


