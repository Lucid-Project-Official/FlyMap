# Plan d'Ajout Progressif des Fonctionnalités

## ✅ ÉTAPE 0 : Hello World (Actuel)
- ✅ `App.simple.js` - Version ultra-minimale
- ✅ `index.js` - Import simple sans dépendances
- **TEST : L'application doit afficher "Hello World"**

---

## ÉTAPE 1 : Ajout des bases React Native
Une fois que ÉTAPE 0 fonctionne, modifiez `App.simple.js` :

```javascript
import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';

export default function App() {
  const [count, setCount] = useState(0);
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hello World</Text>
      <Text style={styles.info}>Compteur: {count}</Text>
      <Button title="Incrémenter" onPress={() => setCount(count + 1)} />
    </View>
  );
}
```
**TEST : L'application doit avoir un compteur fonctionnel**

---

## ÉTAPE 2 : Ajout de react-native-gesture-handler
Modifiez `index.js` :

```javascript
// Au tout début
import 'react-native-gesture-handler';

import { AppRegistry } from 'react-native';
import { name as appName } from './app.json';
import App from './App.simple';

AppRegistry.registerComponent(appName, () => App);
```
**TEST : Vérifiez que l'app démarre toujours**

---

## ÉTAPE 3 : Ajout de React Navigation (sans screens)
Modifiez `App.simple.js` :

```javascript
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, StyleSheet } from 'react-native';

const Stack = createNativeStackNavigator();

function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hello World</Text>
      <Text style={styles.info}>Navigation fonctionne !</Text>
    </View>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```
**TEST : L'application doit avoir une navigation fonctionnelle**

---

## ÉTAPE 4 : Ajout d'un screen simple
Créez `src/screens/SimpleScreen.js` :

```javascript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function SimpleScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Simple Screen</Text>
    </View>
  );
}
```

Ajoutez-le dans `App.simple.js` :
```javascript
import SimpleScreen from './src/screens/SimpleScreen';
// ... dans Stack.Navigator
<Stack.Screen name="Simple" component={SimpleScreen} />
```
**TEST : Navigation vers SimpleScreen doit fonctionner**

---

## ÉTAPE 5 : Ajout d'icônes
Ajoutez dans `App.simple.js` :

```javascript
import Icon from 'react-native-vector-icons/MaterialIcons';

// Dans le composant
<Icon name="home" size={32} color="#007AFF" />
```
**TEST : L'icône doit s'afficher**

---

## ÉTAPE 6 : Ajout de LoginScreen (sans Firebase)
Créez `src/screens/LoginScreen.simple.js` :

```javascript
import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

export default function LoginScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login Screen</Text>
      <Button title="Se connecter (simulé)" onPress={() => console.log('Login')} />
    </View>
  );
}
```
**TEST : LoginScreen doit s'afficher**

---

## ÉTAPE 7 : Ajout de Firebase Auth (avec try-catch)
Créez `src/services/auth.simple.js` :

```javascript
let auth;

try {
  auth = require('@react-native-firebase/auth').default;
  console.log('[AuthService] Firebase Auth chargé');
} catch (e) {
  console.warn('[AuthService] Firebase Auth non disponible:', e);
  auth = null;
}

export class AuthService {
  static async initialize() {
    if (auth) {
      console.log('[AuthService] Initialisé');
    } else {
      console.warn('[AuthService] Firebase non disponible');
    }
    return true;
  }

  static getCurrentUser() {
    return auth ? auth().currentUser : null;
  }

  static onAuthStateChanged(callback) {
    if (auth) {
      return auth().onAuthStateChanged(callback);
    }
    callback(null);
    return () => {};
  }
}
```
**TEST : L'app doit démarrer même si Firebase n'est pas configuré**

---

## ÉTAPE 8 : Intégration complète
Remplacer progressivement `App.simple.js` par `App.tsx` en vérifiant à chaque étape :
1. Imports de tous les screens
2. Navigation complète
3. AuthService avec Firebase
4. Toutes les fonctionnalités

---

## Comment procéder :

1. **Testez ÉTAPE 0** - Si ça ne fonctionne pas, le problème est dans la configuration Android/Metro
2. **Si ÉTAPE 0 fonctionne**, passez à ÉTAPE 1
3. **Arrêtez-vous à l'étape où ça casse** - C'est là que se trouve le problème
4. **Corrigez le problème** avant de continuer

