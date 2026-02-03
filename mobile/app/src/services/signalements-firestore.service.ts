// src/services/signalements-firestore.service.ts
// Service dédié pour Firestore - évite les problèmes d'import avec api.js

import { db } from '../config/firebase.config';
import {
  collection,
  getDocs,
  query,
  orderBy,
  onSnapshot,
  addDoc,
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
      console.log('🔍 [DEBUG] Tentative de connexion à Firestore...');
      console.log('🔍 [DEBUG] Collection:', FIRESTORE_COLLECTION);
      
      const signalementsCollection = collection(db, FIRESTORE_COLLECTION);
      const q = query(signalementsCollection, orderBy('createdAt', 'desc'));
      
      console.log('🔍 [DEBUG] Exécution de la requête Firestore...');
      const snapshot = await getDocs(q);
      
      console.log('🔍 [DEBUG] Snapshot reçu. Nombre de documents:', snapshot.size);
      console.log('🔍 [DEBUG] Documents vides?', snapshot.empty);

      if (snapshot.empty) {
        console.warn('⚠️ [WARNING] Aucun document trouvé dans la collection signalements');
        return { success: true, signalements: [], error: 'Collection vide' };
      }

      const signalements: Signalement[] = snapshot.docs.map((doc, index) => {
        const data = doc.data();
        console.log(`🔍 [DEBUG] Document ${index + 1}:`, {
          id: doc.id,
          data: data,
          hasLocation: !!data.location,
          hasLatLng: data.location?.lat && data.location?.lng
        });
        return this.docToSignalement(doc.id, data);
      });

      console.log('✅ [SUCCESS] Signalements traités:', signalements.length);
      return { success: true, signalements };
    } catch (error: any) {
      console.error('❌ [ERROR] Erreur récupération signalements Firestore:', error);
      console.error('❌ [ERROR] Stack:', error.stack);
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
   * Ajouter des données de test pour démonstration
   */
  async createTestData(): Promise<{ success: boolean; message: string }> {
    try {
      console.log('🧪 [TEST] Création de données de test...');
      
      const testSignalements = [
        {
          title: "Nids de poule RN1 - Secteur Analakely",
          description: "Plusieurs nids de poule importants sur la RN1 au niveau d'Analakely causent des difficultés de circulation pour les véhicules.",
          category: "infrastructure",
          status: "pending",
          location: {
            lat: -18.8792,
            lng: 47.5079,
            address: "RN1 - Avenue de l'Indépendance"
          },
          userId: "test_user_1",
          userEmail: "test@mapeo.mg",
          createdAt: new Date(),
          upvotes: 5,
          comments: 2
        },
        {
          title: "Chaussée dégradée Route Nationale 2",
          description: "La chaussée de la RN2 direction Toamasina présente des fissures importantes et des affaissements dangereux.",
          category: "infrastructure", 
          status: "pending",
          location: {
            lat: -18.8650,
            lng: 47.5200,
            address: "RN2 - Route de Toamasina"
          },
          userId: "test_user_2",
          userEmail: "reporter@mapeo.mg",
          createdAt: new Date(Date.now() - 3600000), // 1h plus tôt
          upvotes: 8,
          comments: 3
        },
        {
          title: "Signalisation défaillante RN4",
          description: "Panneaux de signalisation endommagés sur la route nationale 4, secteur Mahajanga, visibilité réduite.",
          category: "safety",
          status: "in_progress", 
          location: {
            lat: -18.8900,
            lng: 47.4800,
            address: "RN4 - Route de Mahajanga"
          },
          userId: "test_user_3", 
          userEmail: "security@mapeo.mg",
          createdAt: new Date(Date.now() - 7200000), // 2h plus tôt
          upvotes: 12,
          comments: 5
        },
        {
          title: "Route locale endommagée - Quartier 67ha",
          description: "Route locale dans le quartier 67ha avec plusieurs trous et problèmes de drainage après les pluies.",
          category: "infrastructure",
          status: "pending",
          location: {
            lat: -18.8950,
            lng: 47.5300,
            address: "Quartier 67ha"
          },
          userId: "test_user_4",
          userEmail: "local@mapeo.mg", 
          createdAt: new Date(Date.now() - 1800000), // 30min plus tôt
          upvotes: 3,
          comments: 1
        },
        {
          title: "Pont endommagé RN1 - Antsirabe", 
          description: "Le pont sur la RN1 direction Antsirabe présente des fissures structurelles nécessitant une intervention urgente.",
          category: "infrastructure",
          status: "pending",
          location: {
            lat: -18.8400,
            lng: 47.4700,
            address: "RN1 - Route d'Antsirabe"
          },
          userId: "test_user_5",
          userEmail: "bridge@mapeo.mg",
          createdAt: new Date(Date.now() - 5400000), // 1h30 plus tôt
          upvotes: 15,
          comments: 7
        }
      ];

      const signalementsCollection = collection(db, FIRESTORE_COLLECTION);
      
      for (const signalement of testSignalements) {
        await addDoc(signalementsCollection, signalement);
        console.log('✅ [TEST] Signalement créé:', signalement.title);
      }
      
      console.log('🎉 [TEST] Toutes les données de test ont été créées');
      return { success: true, message: `${testSignalements.length} signalements de test créés` };
      
    } catch (error: any) {
      console.error('❌ [TEST] Erreur création données de test:', error);
      return { success: false, message: error.message };
    }
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
