// Version ultra-simple - POINT D'ENTRÉE MINIMAL
import { AppRegistry } from 'react-native';
import { name as appName } from './app.json';

console.log('[index.js] Démarrage - Enregistrement du composant:', appName);

// IMPORT SIMPLE - PAS DE DEPENDANCES EXTERNES
import App from './App.simple';

// VERSION COMPLÈTE (décommentez quand App.simple fonctionne) :
// import App from './App';

AppRegistry.registerComponent(appName, () => App);

console.log('[index.js] Composant enregistré avec succès');

