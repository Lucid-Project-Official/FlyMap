# 👋 Bienvenue sur FlyMap !

Ce fichier vous guide dans la documentation du projet.

---

## 🎯 Vous êtes...

### ... Un Nouveau Développeur ? 
👉 **Commencez ici** : [QUICKSTART.md](QUICKSTART.md) (5 minutes)

### ... En Train de Configurer l'Application ?
👉 **Lisez** : [SETUP.md](SETUP.md) (Configuration complète)

### ... Prêt à Publier sur les Stores ?
👉 **Suivez** : [DEPLOYMENT.md](DEPLOYMENT.md) (Guide détaillé)

### ... Vous Voulez Comprendre l'Architecture ?
👉 **Consultez** : [IMPORTANT.md](IMPORTANT.md) (Documentation technique)

---

## 📚 Vue d'Ensemble de la Documentation

| Fichier | Durée | Description |
|---------|-------|-------------|
| **README.md** | 2 min | Présentation du projet |
| **QUICKSTART.md** | 5 min | Démarrage ultra-rapide |
| **SETUP.md** | 15 min | Configuration détaillée |
| **DEPLOYMENT.md** | 45 min | Publication sur stores |
| **IMPORTANT.md** | 10 min | Architecture et détails |

---

## ⚡ Par Où Commencer ?

### Premier Jour (Set Up)
1. Lisez [QUICKSTART.md](QUICKSTART.md) 
2. Suivez [SETUP.md](SETUP.md)
3. Lancez l'application localement

### Semaine 1 (Développement)
1. Explorez le code dans `src/`
2. Lisez [IMPORTANT.md](IMPORTANT.md)
3. Testez toutes les fonctionnalités
4. Corrigez les bugs éventuels

### Semaine 2 (Production)
1. Suivez [DEPLOYMENT.md](DEPLOYMENT.md)
2. Configurez Firebase en production
3. Générez les builds
4. Soumettez aux stores

---

## 🗺️ Carte du Projet

```
FlyMap/
│
├── 📖 Documentation
│   ├── README.md           ← Présentation
│   ├── START_HERE.md       ← Vous êtes ici !
│   ├── QUICKSTART.md       ← 5 min setup
│   ├── SETUP.md            ← Config détaillée
│   ├── DEPLOYMENT.md       ← Publication stores
│   └── IMPORTANT.md        ← Architecture
│
├── 💻 Code Source
│   ├── App.tsx             ← Point d'entrée
│   ├── src/
│   │   ├── screens/        ← Écrans
│   │   ├── components/     ← Composants UI
│   │   ├── services/       ← Logique métier
│   │   └── types/          ← TypeScript
│   └── assets/             ← Images
│
├── ⚙️ Configuration
│   ├── package.json        ← Dépendances
│   ├── tsconfig.json       ← TypeScript
│   ├── babel.config.js     ← Babel
│   └── metro.config.js     ← Metro bundler
│
├── 📱 Builds
│   ├── ios/                ← iOS native
│   └── android/            ← Android native
│
└── 📄 Autres
    ├── .gitignore          ← Git ignore
    ├── jest.config.js      ← Tests
    └── index.js            ← Entry point
```

---

## ✅ Checklist de Configuration

Avant de lancer l'app, vous devez :

- [ ] Lire `QUICKSTART.md`
- [ ] Installer Node.js 16+
- [ ] Créer un compte Firebase
- [ ] Obtenir une clé API Géoportail
- [ ] Configurer `App.tsx` avec vos clés Firebase
- [ ] Configurer `src/services/auth.ts` avec Web Client ID
- [ ] Configurer `src/services/geoportail.ts` avec clé API
- [ ] Ajouter les icônes dans `assets/`
- [ ] Exécuter `npm install`
- [ ] Exécuter `npm run android` ou `npm run ios`

---

## 🆘 Besoin d'Aide ?

### Problème de Configuration ?
→ Consultez [SETUP.md](SETUP.md) section "Résolution de Problèmes"

### Problème de Publication ?
→ Consultez [DEPLOYMENT.md](DEPLOYMENT.md) section "Checklist Finale"

### Problème de Code ?
→ Consultez [IMPORTANT.md](IMPORTANT.md) section "Architecture"

---

## 🎉 C'est Parti !

**La prochaine étape** :

👉 **Ouvrez [QUICKSTART.md](QUICKSTART.md) et lancez-vous !**

---

*Application développée avec ❤️ en React Native*

