// Imports avec gestion d'erreur pour éviter les crashes au chargement
let auth: any;
let GoogleSignin: any;
let appleAuth: any;
let firestore: any;
let FirebaseAuthTypes: any;

try {
  auth = require('@react-native-firebase/auth').default;
  FirebaseAuthTypes = require('@react-native-firebase/auth').FirebaseAuthTypes;
} catch (e) {
  console.warn('[AuthService] Firebase Auth non disponible');
}

try {
  GoogleSignin = require('@react-native-google-signin/google-signin').GoogleSignin;
} catch (e) {
  console.warn('[AuthService] Google Sign-In non disponible');
}

try {
  appleAuth = require('@invertase/react-native-apple-authentication').appleAuth;
} catch (e) {
  console.warn('[AuthService] Apple Auth non disponible');
}

try {
  firestore = require('@react-native-firebase/firestore').default;
} catch (e) {
  console.warn('[AuthService] Firestore non disponible');
}

import { User } from '../types';

// Configuration Google Sign-In - sera configuré dynamiquement dans initialize()

export class AuthService {
  /**
   * Initialise le service d'authentification
   */
  static async initialize() {
    try {
      console.log('[AuthService] Début de l\'initialisation...');
      
      // Vérifie si Firebase Auth est disponible
      if (auth) {
        try {
          const authInstance = auth();
          console.log('[AuthService] Firebase Auth disponible');
        } catch (firebaseError) {
          console.warn('[AuthService] Firebase Auth non disponible:', firebaseError);
          // Continue même si Firebase n'est pas configuré
        }
      } else {
        console.warn('[AuthService] Firebase Auth non installé ou non disponible');
      }

      // Configure Google Sign-In avec le Web Client ID
      if (GoogleSignin) {
        try {
          GoogleSignin.configure({
            webClientId: '297962435689-41rb56dp4d07cdlhj6if0dha21jn79ld.apps.googleusercontent.com',
          });
          console.log('[AuthService] Google Sign-In configuré');
        } catch (googleError) {
          console.warn('[AuthService] Erreur lors de la configuration de Google Sign-In:', googleError);
        }
      } else {
        console.warn('[AuthService] Google Sign-In non disponible');
      }
      
      console.log('[AuthService] Initialisation terminée avec succès');
      return true;
    } catch (error) {
      console.error('[AuthService] Erreur lors de l\'initialisation:', error);
      // Retourne true quand même pour ne pas bloquer l'app
      return true;
    }
  }

  /**
   * Connexion avec Google
   */
  static async signInWithGoogle(): Promise<User> {
    if (!auth || !GoogleSignin) {
      throw new Error('Firebase Auth ou Google Sign-In non disponible. Vérifiez votre configuration.');
    }
    
    try {
      // Vérifie si Google Play Services est disponible
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      
      // Obtient l'ID token de l'utilisateur
      // Note: GoogleSignin signe automatiquement si SHA-1 est configuré dans Firebase
      // Pour utiliser webClientId, vous devez le configurer dans Firebase Console
      const { idToken } = await GoogleSignin.signIn();
      
      // Crée une credential Google avec l'ID token
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      
      // Se connecte avec Firebase
      const userCredential = await auth().signInWithCredential(googleCredential);
      
      // Crée ou met à jour l'utilisateur dans Firestore
      return await this.createOrUpdateUser(userCredential.user);
    } catch (error: any) {
      console.error('Google Sign-In Error:', error);
      
      // Message d'erreur plus explicite
      let errorMessage = error.message || 'Erreur lors de la connexion Google';
      
      if (error.code === 'DEVELOPER_ERROR' || error.message?.includes('configure')) {
        errorMessage = 'Google Sign-In n\'est pas configuré. Veuillez ajouter votre SHA-1 dans Firebase Console ou configurer le webClientId.';
      }
      
      throw new Error(errorMessage);
    }
  }

  /**
   * Connexion avec Apple
   */
  static async signInWithApple(): Promise<User> {
    if (!auth || !appleAuth) {
      throw new Error('Firebase Auth ou Apple Auth non disponible. Vérifiez votre configuration.');
    }
    
    try {
      // Lance le flux Apple
      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
      });

      // Vérifie que la requête a réussi
      if (!appleAuthRequestResponse.identityToken) {
        throw new Error('Apple Sign-In a échoué - Pas de token reçu');
      }

      // Crée une credential Apple avec le token
      const { identityToken, nonce } = appleAuthRequestResponse;
      const appleCredential = auth.AppleAuthProvider.credential(
        identityToken,
        nonce
      );

      // Se connecte avec Firebase
      const userCredential = await auth().signInWithCredential(appleCredential);
      
      // Crée ou met à jour l'utilisateur dans Firestore
      return await this.createOrUpdateUser(userCredential.user, appleAuthRequestResponse);
    } catch (error: any) {
      console.error('Apple Sign-In Error:', error);
      throw new Error(error.message || 'Erreur lors de la connexion Apple');
    }
  }

  /**
   * Crée ou met à jour un utilisateur dans Firestore
   */
  private static async createOrUpdateUser(
    firebaseUser: any,
    appleData?: any
  ): Promise<User> {
    if (!firestore) {
      console.warn('[AuthService] Firestore non disponible, skip création utilisateur');
      return {
        id: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName: firebaseUser.displayName || 'Utilisateur',
        photoURL: firebaseUser.photoURL || undefined,
        provider: appleData ? 'apple' : 'google',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as User;
    }
    
    const userRef = firestore().collection('users').doc(firebaseUser.uid);
    const doc = await userRef.get();

    const userData: Partial<User> = {
      id: firebaseUser.uid,
      email: firebaseUser.email || '',
      displayName:
        firebaseUser.displayName ||
        appleData?.fullName?.givenName + ' ' + appleData?.fullName?.familyName ||
        'Utilisateur',
      photoURL: firebaseUser.photoURL || undefined,
      provider: appleData ? 'apple' : 'google',
      updatedAt: new Date(),
    };

    if (!doc.exists) {
      userData.createdAt = new Date();
      await userRef.set(userData);
    } else {
      await userRef.update(userData);
    }

    return userData as User;
  }

  /**
   * Déconnexion
   */
  static async signOut(): Promise<void> {
    try {
      if (auth) {
        await auth().signOut();
      }
      if (GoogleSignin) {
        await GoogleSignin.signOut();
      }
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }

  /**
   * Obtient l'utilisateur actuellement connecté
   */
  static getCurrentUser(): any | null {
    try {
      if (!auth) {
        return null;
      }
      return auth().currentUser;
    } catch (error) {
      console.warn('[AuthService] Erreur lors de la récupération de l\'utilisateur actuel:', error);
      return null;
    }
  }

  /**
   * Écoute les changements d'état d'authentification
   */
  static onAuthStateChanged(
    callback: (user: any | null) => void
  ): () => void {
    try {
      if (!auth) {
        console.warn('[AuthService] Firebase Auth non disponible, callback immédiat avec null');
        callback(null);
        return () => {};
      }
      return auth().onAuthStateChanged(callback);
    } catch (error) {
      console.error('[AuthService] Erreur lors de l\'abonnement à onAuthStateChanged:', error);
      // Retourne une fonction de désabonnement vide en cas d'erreur
      callback(null);
      return () => {};
    }
  }
}

