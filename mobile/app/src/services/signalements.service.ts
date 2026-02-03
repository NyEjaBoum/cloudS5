// src/services/signalements.service.ts
import api from './api';
import { db } from '../config/firebase.config';
import {
  collection,
  getDocs,
  query,
  orderBy,
  onSnapshot,
  Timestamp,
  type Unsubscribe
} from 'firebase/firestore';

// Types pour les données PostgreSQL
export interface SignalementPostgres {
  id: number;
  titre: string;
  description: string;
  statut: number;
  latitude: number;
  longitude: number;
  surface_m2: number;
  budget: number;
  id_entreprise: number;
  id_utilisateur: number;
  date_creation: string;
  // Champs des vues jointes
  entreprise?: string;
  utilisateur_nom?: string;
  utilisateur_prenom?: string;
  utilisateur_email?: string;
}

// Type pour l'affichage dans l'application
export interface Signalement {
  id: string | number;
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

const API_URL = '/signalements';
const FIRESTORE_COLLECTION = 'signalements';

class SignalementsService {
  /**
   * Récupérer tous les signalements depuis PostgreSQL
   */
  async getAllSignalements(): Promise<{ success: boolean; signalements: SignalementPostgres[]; error?: string }> {
    try {
      const response = await api.get(`${API_URL}`);
      return {
        success: true,
        signalements: response.data
      };
    } catch (error: any) {
      console.error('Erreur récupération signalements PostgreSQL:', error);
      return {
        success: false,
        signalements: [],
        error: error.message || 'Erreur lors de la récupération des signalements'
      };
    }
  }

  /**
   * Récupérer un signalement par ID
   */
  async getSignalementById(id: number): Promise<{ success: boolean; signalement?: SignalementPostgres; error?: string }> {
    try {
      const response = await api.get(`${API_URL}/${id}`);
      return {
        success: true,
        signalement: response.data
      };
    } catch (error: any) {
      console.error('Erreur récupération signalement par ID:', error);
      return {
        success: false,
        error: error.message || 'Signalement non trouvé'
      };
    }
  }

  /**
   * Mapper les données PostgreSQL vers le format d'affichage
   */
  mapToSignalement(postgresData: SignalementPostgres): Signalement {
    // Mapper le statut numérique vers string
    let status: 'pending' | 'in_progress' | 'resolved';
    switch (postgresData.statut) {
      case 1:
        status = 'pending';
        break;
      case 11:
        status = 'in_progress';
        break;
      case 99:
        status = 'resolved';
        break;
      default:
        status = 'pending';
    }

    return {
      id: postgresData.id.toString(),
      title: postgresData.titre,
      description: postgresData.description,
      category: 'infrastructure', // Valeur par défaut car PostgreSQL n'a pas de category
      status: status,
      location: {
        lat: Number(postgresData.latitude),
        lng: Number(postgresData.longitude)
      },
      userId: postgresData.id_utilisateur.toString(),
      userEmail: postgresData.utilisateur_email,
      createdAt: new Date(postgresData.date_creation),
      upvotes: 0,
      comments: 0
    };
  }

  /**
   * Récupérer et mapper tous les signalements
   */
  async getMappedSignalements(): Promise<{ success: boolean; signalements: Signalement[]; error?: string }> {
    const result = await this.getAllSignalements();
    
    if (result.success) {
      const mappedSignalements = result.signalements.map(s => this.mapToSignalement(s));
      return {
        success: true,
        signalements: mappedSignalements
      };
    }
    
    return {
      success: false,
      signalements: [],
      error: result.error
    };
  }

  /**
   * Récupérer tous les signalements depuis Firestore
   */
  async getSignalementsFromFirestore(): Promise<{ success: boolean; signalements: Signalement[]; error?: string }> {
    try {
      const signalementsCollection = collection(db, FIRESTORE_COLLECTION);
      const q = query(signalementsCollection, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);

      const signalements: Signalement[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title || data.titre || 'Sans titre',
          description: data.description || '',
          category: data.category || 'infrastructure',
          status: data.status || 'pending',
          location: {
            lat: data.location?.lat || data.latitude || 0,
            lng: data.location?.lng || data.longitude || 0,
            address: data.location?.address || data.address
          },
          userId: data.userId || data.id_utilisateur || '',
          userEmail: data.userEmail || data.utilisateur_email,
          createdAt: data.createdAt?.toDate() || new Date(data.date_creation) || new Date(),
          upvotes: data.upvotes || 0,
          comments: data.comments || 0
        };
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
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title || data.titre || 'Sans titre',
          description: data.description || '',
          category: data.category || 'infrastructure',
          status: data.status || 'pending',
          location: {
            lat: data.location?.lat || data.latitude || 0,
            lng: data.location?.lng || data.longitude || 0,
            address: data.location?.address || data.address
          },
          userId: data.userId || data.id_utilisateur || '',
          userEmail: data.userEmail || data.utilisateur_email,
          createdAt: data.createdAt?.toDate() || new Date(data.date_creation) || new Date(),
          upvotes: data.upvotes || 0,
          comments: data.comments || 0
        };
      });

      callback(signalements);
    }, (error) => {
      console.error('Erreur écoute signalements Firestore:', error);
      callback([]);
    });
  }
}

const signalementsService = new SignalementsService();
export default signalementsService;
