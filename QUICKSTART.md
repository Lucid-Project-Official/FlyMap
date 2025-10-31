# ⚡ Quickstart - FlyMap en 5 Minutes

Guide ultra-rapide pour lancer FlyMap localement.

## 🎯 Checklist Rapide

### Ce que vous DEVEZ avoir :
- [ ] Node.js 16+ installé
- [ ] Compte Firebase (gratuit) créé
- [ ] Clé API Géoportail (gratuite)

### Ce que vous devez faire :

#### 1️⃣ Cloner et installer (2 min)
```bash
npm install
```

#### 2️⃣ Configurer Firebase (1 min)
1. Créez un projet Firebase
2. Activez Authentication (Google + Apple)
3. Créez Firestore Database
4. Créez Storage Bucket
5. Téléchargez `google-services.json` et `GoogleService-Info.plist`
6. Placez-les dans `android/app/` et `ios/FlyMap/`

#### 3️⃣ Remplacer les clés (30 sec)
Dans ces fichiers, remplacez `YOUR_...` par vos vraies valeurs :
- `App.tsx` → Configuration Firebase
- `src/services/auth.ts` → Web Client ID
- `src/services/geoportail.ts` → Clé API Géoportail

#### 4️⃣ Créer les icônes (1 min)
Créez le dossier `assets/` et ajoutez :
- `logo.png` (512x512px) - ou commentez cette ligne dans LoginScreen
- `google-logo.png` (24x24px) - ou commentez
- `apple-logo.png` (24x24px) - ou commentez

#### 5️⃣ Lancer ! (30 sec)
```bash
# Pour Android
npm run android

# Pour iOS (Mac uniquement)
npm run ios
```

## ⚠️ Problèmes Courants

**"Metro bundler error"**
→ `npm start` dans un terminal séparé

**"Firebase not configured"**
→ Vérifiez que vous avez bien copié les fichiers Firebase

**"Images not found"**
→ Commentez les lignes `Image source={require(...)}` dans LoginScreen

**"Pod install error" (iOS)**
→ `cd ios && pod deintegrate && pod install && cd ..`

## 🎉 Prêt !

L'application devrait maintenant s'ouvrir sur votre émulateur/appareil.

Consultez `SETUP.md` pour plus de détails et `DEPLOYMENT.md` pour publier sur les stores.

---

**Besoin d'aide ?** Lisez les fichiers dans cet ordre :
1. `QUICKSTART.md` ← Vous êtes ici
2. `SETUP.md` → Configuration détaillée
3. `DEPLOYMENT.md` → Publication sur les stores

