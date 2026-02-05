import { db } from '../config/firebase.config';
import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  setDoc,
  Timestamp,
  type Unsubscribe
} from 'firebase/firestore';

// Types
export interface Report {
  id: string;
  titre: string;
  description: string;
  statut: number; // 1, 11, 99...
  latitude: string;
  longitude: string;
  dateCreation: string; // format ISO ou "YYYY-MM-DDTHH:mm"
  surfaceM2?: string;
  budget?: string;
  entreprise?: {
    id: number;
    nom: string;
    adresse: string;
    contact: string;
  };
  userId: string;
  userEmail?: string;
  photos?: string[];
}

export interface ReportInput {
  titre: string;
  description: string;
  statut: number;
  latitude: string;
  longitude: string;
  dateCreation: string;
}

const COLLECTION_NAME = 'signalements';

class ReportsService {
  private reportsCollection = collection(db, COLLECTION_NAME);

  // Générer le prochain ID numérique
  private async getNextId(): Promise<number> {
    try {
      const snapshot = await getDocs(this.reportsCollection);
      if (snapshot.empty) return 1;
      
      const ids = snapshot.docs
        .map(doc => parseInt(doc.id))
        .filter(id => !isNaN(id));
      
      return ids.length > 0 ? Math.max(...ids) + 1 : 1;
    } catch (error) {
      console.error('Erreur génération ID:', error);
      return Date.now(); // Fallback sur timestamp
    }
  }

  // Récupérer les signalements pour l'user connecteé par email
  async getSignalementsByEmail(email: string): Promise<{ success: boolean; signalements: Report[]; error?: string }> {
  try {
    const q = query(this.reportsCollection, where('userEmail', '==', email));
    const snapshot = await getDocs(q);
    const signalements: Report[] = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        titre: data.titre,
        description: data.description,
        statut: data.statut,
        latitude: data.latitude,
        longitude: data.longitude,
        dateCreation: data.dateCreation,
        surfaceM2: data.surfaceM2,
        budget: data.budget,
        entreprise: data.entreprise,
        userId: data.userId,
        userEmail: data.userEmail,
        photos: data.photos || []
      };
    });
    return { success: true, signalements };
  } catch (error) {
    console.error('Erreur récupération signalements par email:', error);
    return { success: false, signalements: [], error: 'Erreur lors de la récupération' };
  }
}

  async getAllSignalements(): Promise<{ success: boolean; signalements: Report[]; error?: string }> {
    try {
      const snapshot = await getDocs(this.reportsCollection);
      const signalements: Report[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          titre: data.titre,
          description: data.description,
          statut: data.statut,
          latitude: data.latitude,
          longitude: data.longitude,
          dateCreation: data.dateCreation,
          surfaceM2: data.surfaceM2,
          budget: data.budget,
          entreprise: data.entreprise,
          userId: data.userId,
          userEmail: data.userEmail,
          photos: data.photos || []
        };
      });
      return { success: true, signalements };
    } catch (error) {
      console.error('Erreur récupération signalements:', error);
      return { success: false, signalements: [], error: 'Erreur lors de la récupération' };
    }
  }

  // Créer un signalement avec ID numérique
  async createReport(reportData: ReportInput, userId: string, userEmail?: string): Promise<{ success: boolean; report?: Report; error?: string }> {
    try {
      // Générer l'ID numérique
      const nextId = await this.getNextId();
      
      const newReport = {
        ...reportData,
        userId,
        userEmail: userEmail || '',
        photos: []
      };
      
      // Utiliser setDoc avec un ID numérique au lieu d'addDoc
      const docRef = doc(db, COLLECTION_NAME, nextId.toString());
      await setDoc(docRef, newReport);
      
      return {
        success: true,
        report: {
          id: nextId.toString(),
          ...newReport
        }
      };
    } catch (error) {
      console.error('Erreur création signalement:', error);
      return {
        success: false,
        error: 'Erreur lors de la création du signalement'
      };
    }
  }

  // Récupérer tous les signalements (une seule fois)
  async getAllReports(): Promise<{ success: boolean; reports: Report[]; error?: string }> {
    try {
      const snapshot = await getDocs(this.reportsCollection);
      const reports: Report[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          titre: data.titre,
          description: data.description,
          statut: data.statut,
          latitude: data.latitude,
          longitude: data.longitude,
          dateCreation: data.dateCreation,
          surfaceM2: data.surfaceM2,
          budget: data.budget,
          entreprise: data.entreprise,
          userId: data.userId,
          userEmail: data.userEmail,
          photos: data.photos || []
        };
      });
      return { success: true, reports };
    } catch (error) {
      console.error('Erreur récupération signalements:', error);
      return { success: false, reports: [], error: 'Erreur lors de la récupération' };
    }
  }

  // Écouter les signalements en temps réel
  subscribeToReports(callback: (reports: Report[]) => void): Unsubscribe {
    const q = query(this.reportsCollection);
    return onSnapshot(q, (snapshot) => {
      const reports: Report[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          titre: data.titre,
          description: data.description,
          statut: data.statut,
          latitude: data.latitude,
          longitude: data.longitude,
          dateCreation: data.dateCreation,
          surfaceM2: data.surfaceM2,
          budget: data.budget,
          entreprise: data.entreprise,
          userId: data.userId,
          userEmail: data.userEmail,
          photos: data.photos || []
        };
      });
      // Tri par dateCreation (string ISO)
      reports.sort((a, b) => (b.dateCreation || '').localeCompare(a.dateCreation || ''));
      callback(reports);
    }, (error) => {
      console.error('Erreur écoute signalements:', error);
      callback([]);
    });
  }

  // Récupérer les signalements d'un utilisateur
  async getMyReports(userId: string): Promise<{ success: boolean; reports: Report[]; error?: string }> {
    try {
      const q = query(this.reportsCollection, where('userId', '==', userId));
      const snapshot = await getDocs(q);
      const reports: Report[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          titre: data.titre,
          description: data.description,
          statut: data.statut,
          latitude: data.latitude,
          longitude: data.longitude,
          dateCreation: data.dateCreation,
          surfaceM2: data.surfaceM2,
          budget: data.budget,
          entreprise: data.entreprise,
          userId: data.userId,
          userEmail: data.userEmail,
          photos: data.photos || []
        };
      });
      return { success: true, reports };
    } catch (error) {
      console.error('Erreur récupération mes signalements:', error);
      return { success: false, reports: [], error: 'Erreur lors de la récupération' };
    }
  }

  // Récupérer un signalement par ID
  async getReportById(id: string): Promise<{ success: boolean; report?: Report; error?: string }> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        return { success: false, error: 'Signalement non trouvé' };
      }
      const data = docSnap.data();
      return {
        success: true,
        report: {
          id: docSnap.id,
          titre: data.titre,
          description: data.description,
          statut: data.statut,
          latitude: data.latitude,
          longitude: data.longitude,
          dateCreation: data.dateCreation,
          surfaceM2: data.surfaceM2,
          budget: data.budget,
          entreprise: data.entreprise,
          userId: data.userId,
          userEmail: data.userEmail,
          photos: data.photos || []
        }
      };
    } catch (error) {
      console.error('Erreur récupération signalement:', error);
      return { success: false, error: 'Erreur lors de la récupération' };
    }
  }

  // Mettre à jour un signalement
  async updateReport(id: string, updates: Partial<Report>): Promise<{ success: boolean; error?: string }> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, updates);
      return { success: true };
    } catch (error) {
      console.error('Erreur mise à jour signalement:', error);
      return { success: false, error: 'Erreur lors de la mise à jour' };
    }
  }

  // Supprimer un signalement
  async deleteReport(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);
      return { success: true };
    } catch (error) {
      console.error('Erreur suppression signalement:', error);
      return { success: false, error: 'Erreur lors de la suppression' };
    }
  }
}

const reportsService = new ReportsService();
export default reportsService;