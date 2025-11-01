import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import {
  appleAuth,
  AppleButton,
} from '@invertase/react-native-apple-authentication';
import firestore from '@react-native-firebase/firestore';
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
      try {
        const authInstance = auth();
        console.log('[AuthService] Firebase Auth disponible');
      } catch (firebaseError) {
        console.warn('[AuthService] Firebase Auth non disponible:', firebaseError);
        // Continue même si Firebase n'est pas configuré
      }

      // Google Sign-In sera configuré dynamiquement lors de la connexion
      console.log('[AuthService] Google Sign-In sera configuré à la première utilisation');
      
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
    firebaseUser: FirebaseAuthTypes.User,
    appleData?: any
  ): Promise<User> {
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
      await auth().signOut();
      await GoogleSignin.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }

  /**
   * Obtient l'utilisateur actuellement connecté
   */
  static getCurrentUser(): FirebaseAuthTypes.User | null {
    return auth().currentUser;
  }

  /**
   * Écoute les changements d'état d'authentification
   */
  static onAuthStateChanged(
    callback: (user: FirebaseAuthTypes.User | null) => void
  ) {
    return auth().onAuthStateChanged(callback);
  }
}

