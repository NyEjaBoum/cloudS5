// src/services/signalements-firestore.service.ts
// Service dédié pour Firestore - évite les problèmes d'import avec api.js

import { db } from '../config/firebase.config';
import {
  collection,
  getDocs,
  query,
  orderBy,
  onSnapshot,
  type Unsubscribe
} from 'firebase/firestore';

// Type pour l'affichage dans l'application
export interface Signalement {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'pending' | 'in_progress' | 'resolved';
  location: {
    lat: number;
    lng: number;
    address?: string;
  };
  userId: string;
  userEmail?: string;
  createdAt: Date;
  upvotes?: number;
  comments?: number;
  distance?: number;
  timeAgo?: string;
}

const FIRESTORE_COLLECTION = 'signalements';

class SignalementsFirestoreService {
  /**
   * Récupérer tous les signalements depuis Firestore (une seule fois)
   */
  async getSignalements(): Promise<{ success: boolean; signalements: Signalement[]; error?: string }> {
    try {
      const signalementsCollection = collection(db, FIRESTORE_COLLECTION);
      const q = query(signalementsCollection, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);

      const signalements: Signalement[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return this.docToSignalement(doc.id, data);
      });

      return { success: true, signalements };
    } catch (error: any) {
      console.error('Erreur récupération signalements Firestore:', error);
      return { success: false, signalements: [], error: error.message || 'Erreur Firestore' };
    }
  }

  /**
   * Écouter les signalements en temps réel depuis Firestore
   */
  subscribeToSignalements(callback: (signalements: Signalement[]) => void): Unsubscribe {
    const signalementsCollection = collection(db, FIRESTORE_COLLECTION);
    const q = query(signalementsCollection, orderBy('createdAt', 'desc'));

    return onSnapshot(q, (snapshot) => {
      const signalements: Signalement[] = snapshot.docs.map(doc => {
        return this.docToSignalement(doc.id, doc.data());
      });

      callback(signalements);
    }, (error) => {
      console.error('Erreur écoute signalements Firestore:', error);
      callback([]);
    });
  }

  /**
   * Récupérer les signalements des routes nationales spécifiquement
   */
  async getNationalRoadSignalements(): Promise<{ success: boolean; signalements: Signalement[]; error?: string }> {
    try {
      const result = await this.getSignalements();
      
      if (result.success) {
        // Filtrer pour les routes nationales uniquement
        const nationalRoadSignalements = result.signalements.filter(signalement => {
          const description = signalement.description?.toLowerCase() || '';
          const title = signalement.title?.toLowerCase() || '';
          
          return description.includes('rn') || 
                 description.includes('route nationale') ||
                 title.includes('rn') || 
                 title.includes('route nationale') ||
                 description.includes('nationale') ||
                 title.includes('nationale');
        });

        return { success: true, signalements: nationalRoadSignalements };
      }
      
      return result;
    } catch (error: any) {
      console.error('Erreur récupération routes nationales:', error);
      return { success: false, signalements: [], error: error.message };
    }
  }
  /**
   * Convertir un document Firestore en objet Signalement
   */
  private docToSignalement(docId: string, data: any): Signalement {
    const signalement = {
      id: docId,
      title: data.title || data.titre || 'Sans titre',
      description: data.description || '',
      category: data.category || this.detectCategoryFromContent(data),
      status: this.normalizeStatus(data.status),
      location: {
        lat: data.location?.lat || data.latitude || 0,
        lng: data.location?.lng || data.longitude || 0,
        address: data.location?.address || data.address
      },
      userId: data.userId || data.id_utilisateur || '',
      userEmail: data.userEmail || data.utilisateur_email,
      createdAt: this.parseDate(data.createdAt, data.date_creation),
      upvotes: data.upvotes || 0,
      comments: data.comments || 0
    };

    return signalement;
  }

  /**
   * Détecter la catégorie depuis le contenu si non spécifiée
   */
  private detectCategoryFromContent(data: any): string {
    const description = data.description?.toLowerCase() || '';
    const title = data.title?.toLowerCase() || data.titre?.toLowerCase() || '';
    const content = `${title} ${description}`;

    // Routes nationales -> infrastructure
    if (content.includes('rn') || content.includes('route nationale') || content.includes('nationale')) {
      return 'infrastructure';
    }
    
    // Autres détections
    if (content.includes('route') || content.includes('chaussée') || content.includes('bitume')) {
      return 'infrastructure';
    }
    
    if (content.includes('sécurité') || content.includes('danger') || content.includes('accident')) {
      return 'safety';
    }
    
    if (content.includes('environnement') || content.includes('pollution') || content.includes('nature')) {
      return 'environment';
    }
    
    return 'infrastructure'; // Par défaut
  }

  /**
   * Vérifier si un signalement concerne une route nationale
   */
  static isNationalRoad(signalement: Signalement): boolean {
    const description = signalement.description?.toLowerCase() || '';
    const title = signalement.title?.toLowerCase() || '';
    
    return description.includes('rn') || 
           description.includes('route nationale') ||
           title.includes('rn') || 
           title.includes('route nationale') ||
           description.includes('nationale') ||
           title.includes('nationale');
  }

  /**
   * Normaliser le statut en format string
   */
  private normalizeStatus(status: any): 'pending' | 'in_progress' | 'resolved' {
    if (!status) return 'pending';
    
    // Si c'est déjà un string
    if (typeof status === 'string') {
      if (status === 'pending' || status === 'in_progress' || status === 'resolved') {
        return status;
      }
    }
    
    // Si c'est un nombre (PostgreSQL)
    if (typeof status === 'number') {
      switch (status) {
        case 1:
        case 11:
          return 'pending';
        case 21:
          return 'in_progress';
        case 99:
          return 'resolved';
        default:
          return 'pending';
      }
    }
    
    return 'pending';
  }

  /**
   * Parser la date depuis différents formats
   */
  private parseDate(createdAt: any, dateCreation: string | undefined): Date {
    if (!createdAt) {
      if (dateCreation) {
        const parsed = new Date(dateCreation);
        return isNaN(parsed.getTime()) ? new Date() : parsed;
      }
      return new Date();
    }
    
    // Si c'est un Timestamp Firestore
    if (typeof createdAt.toDate === 'function') {
      return createdAt.toDate();
    }
    
    // Si c'est une date string ou objet Date
    const parsed = new Date(createdAt);
    return isNaN(parsed.getTime()) ? new Date() : parsed;
  }
}

const signalementsFirestoreService = new SignalementsFirestoreService();
export default signalementsFirestoreService;
