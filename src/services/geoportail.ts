/**
 * Service d'intégration des données Géoportail
 * Source: https://www.geoportail.gouv.fr/donnees/restrictions-uas-categorie-ouverte-et-aeromodelisme
 */

export interface GeoportailRestriction {
  type: 'interdiction' | 'autorisation_conditionnelle' | 'notification_requise';
  description: string;
  zone: {
    type: 'polygon' | 'circle' | 'rectangle';
    coordinates: number[][];
  };
  altitudeMax?: number;
  conditions?: string[];
}

export class GeoportailService {
  private static readonly API_ENDPOINT = 'https://wxs.ign.fr/YOUR_API_KEY/geoportail/ols';
  
  /**
   * Récupère les restrictions de vol pour une zone donnée
   * Utilise l'API Géoportail WMS/TMS
   */
  static async getRestrictions(
    boundingBox: {
      north: number;
      south: number;
      east: number;
      west: number;
    }
  ): Promise<GeoportailRestriction[]> {
    try {
      // Configuration WMS pour les restrictions UAS
      const wmsUrl = `${this.API_ENDPOINT}?service=WMS&version=1.3.0&request=GetMap&layers=RESTREINT_UAS_CATEGORIE_OUVERTE&bbox=${boundingBox.west},${boundingBox.south},${boundingBox.east},${boundingBox.north}&width=256&height=256&format=image/png&crs=EPSG:4326`;
      
      // Note: Cette URL nécessite une clé API Géoportail
      // Récupération depuis: https://www.geoportail.gouv.fr/api/remonter/utiliser/cle
      
      const response = await fetch(wmsUrl);
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des restrictions');
      }

      // Traitement des données retournées
      // Dans une implémentation complète, cela nécessiterait le parsing des tuiles WMS
      return [];
    } catch (error) {
      console.error('Error fetching Geoportail restrictions:', error);
      return [];
    }
  }

  /**
   * Configuration des tuiles pour afficher la carte Géoportail
   */
  static getGeoportailTileUrl(x: number, y: number, z: number): string {
    // Utilise les tuiles Géoportail pour afficher les restrictions UAS
    const apiKey = 'YOUR_API_KEY'; // À remplacer par votre clé API
    return `https://wxs.ign.fr/${apiKey}/geoportail/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2&STYLE=normal&FORMAT=image/png&TILEMATRIXSET=PM&TILEMATRIX=${z}&TILEROW=${y}&TILECOL=${x}`;
  }

  /**
   * Récupère les informations détaillées sur une restriction
   */
  static async getRestrictionDetails(restrictionId: string): Promise<GeoportailRestriction | null> {
    try {
      // Implémentation à développer selon les besoins
      return null;
    } catch (error) {
      console.error('Error getting restriction details:', error);
      return null;
    }
  }

  /**
   * Vérifie si un point GPS est dans une zone de restriction
   */
  static isInRestrictedZone(
    latitude: number,
    longitude: number,
    restrictions: GeoportailRestriction[]
  ): boolean {
    // Implémentation du point-in-polygon
    for (const restriction of restrictions) {
      if (restriction.zone.type === 'polygon') {
        // Algorithme point-in-polygon (Ray Casting)
        const { coordinates } = restriction.zone;
        let inside = false;
        
        for (let i = 0, j = coordinates.length - 1; i < coordinates.length; j = i++) {
          const [xi, yi] = coordinates[i];
          const [xj, yj] = coordinates[j];
          
          const intersect = ((yi > latitude) !== (yj > latitude)) &&
            (longitude < ((xj - xi) * (latitude - yi) / (yj - yi) + xi));
          
          if (intersect) inside = !inside;
        }
        
        if (inside) return true;
      } else if (restriction.zone.type === 'circle') {
        // Calcul de distance pour cercle
        const { coordinates } = restriction.zone;
        const center = coordinates[0];
        const radius = coordinates[1][0]; // Le rayon est dans la première coordonnée
        const distance = this.calculateDistance(latitude, longitude, center[1], center[0]);
        
        if (distance <= radius) return true;
      }
    }
    
    return false;
  }

  /**
   * Calcule la distance en kilomètres entre deux points GPS
   */
  private static calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Rayon de la Terre en km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private static deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}

/**
 * Configuration alternative: WebView intégrée
 * Si l'API est trop complexe, on peut intégrer directement le viewer Géoportail
 */
export const GeoportailConfig = {
  // URL de la carte interactive Géoportail
  embeddedMapUrl: 'https://www.geoportail.gouv.fr/donnees/restrictions-uas-categorie-ouverte-et-aeromodelisme',
  
  // Configuration pour WebView
  webViewConfig: {
    source: { uri: 'https://www.geoportail.gouv.fr/donnees/restrictions-uas-categorie-ouverte-et-aeromodelisme' },
    javaScriptEnabled: true,
    domStorageEnabled: true,
    scalesPageToFit: true,
  },
};

