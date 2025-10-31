import storage from '@react-native-firebase/storage';
import { launchImageLibrary, MediaType, ImagePickerResponse } from 'react-native-image-picker';
import { Platform } from 'react-native';

export class StorageService {
  /**
   * Télécharge une image vers Firebase Storage
   */
  static async uploadImage(
    uri: string,
    userId: string,
    spotId: string,
    filename: string
  ): Promise<string> {
    try {
      const storageRef = storage().ref(`spots/${spotId}/photos/${filename}`);
      const task = await storageRef.putFile(uri);
      const downloadURL = await task.ref.getDownloadURL();
      return downloadURL;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  }

  /**
   * Télécharge une vidéo vers Firebase Storage
   */
  static async uploadVideo(
    uri: string,
    userId: string,
    spotId: string,
    filename: string
  ): Promise<string> {
    try {
      const storageRef = storage().ref(`spots/${spotId}/videos/${filename}`);
      const task = await storageRef.putFile(uri);
      const downloadURL = await task.ref.getDownloadURL();
      return downloadURL;
    } catch (error) {
      console.error('Error uploading video:', error);
      throw error;
    }
  }

  /**
   * Supprime un fichier de Firebase Storage
   */
  static async deleteFile(path: string): Promise<void> {
    try {
      await storage().ref(path).delete();
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }
}

/**
 * Service de sélection d'images/vidéos depuis la galerie
 */
export class MediaService {
  /**
   * Ouvre la galerie pour sélectionner des photos
   */
  static async pickImage(): Promise<string | null> {
    return new Promise((resolve) => {
      launchImageLibrary(
        {
          mediaType: 'photo',
          quality: 0.8,
          maxWidth: 1920,
          maxHeight: 1080,
        },
        (response: ImagePickerResponse) => {
          if (response.didCancel) {
            resolve(null);
          } else if (response.errorMessage) {
            console.error('Image picker error:', response.errorMessage);
            resolve(null);
          } else if (response.assets && response.assets.length > 0) {
            const uri = response.assets[0].uri;
            resolve(uri || null);
          } else {
            resolve(null);
          }
        }
      );
    });
  }

  /**
   * Ouvre la galerie pour sélectionner une vidéo
   */
  static async pickVideo(): Promise<string | null> {
    return new Promise((resolve) => {
      launchImageLibrary(
        {
          mediaType: 'video',
          quality: 0.8,
          videoQuality: 'high',
        },
        (response: ImagePickerResponse) => {
          if (response.didCancel) {
            resolve(null);
          } else if (response.errorMessage) {
            console.error('Video picker error:', response.errorMessage);
            resolve(null);
          } else if (response.assets && response.assets.length > 0) {
            const uri = response.assets[0].uri;
            resolve(uri || null);
          } else {
            resolve(null);
          }
        }
      );
    });
  }

  /**
   * Ouvre la galerie pour sélectionner plusieurs photos
   */
  static async pickMultipleImages(): Promise<string[]> {
    return new Promise((resolve) => {
      launchImageLibrary(
        {
          mediaType: 'photo',
          quality: 0.8,
          selectionLimit: 10,
          maxWidth: 1920,
          maxHeight: 1080,
        },
        (response: ImagePickerResponse) => {
          if (response.didCancel || response.assets === undefined) {
            resolve([]);
          } else {
            const uris = response.assets.map(asset => asset.uri).filter(Boolean) as string[];
            resolve(uris);
          }
        }
      );
    });
  }
}

