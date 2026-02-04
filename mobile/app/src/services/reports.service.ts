// src/services/reports.service.ts
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
  orderBy,
  onSnapshot,
  Timestamp,
  type Unsubscribe
} from 'firebase/firestore';

// Types
export interface Report {
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
  updatedAt?: Date;
  upvotes?: number;
  comments?: number;
  photos?: string[];
}

export interface ReportInput {
  title: string;
  description: string;
  category: string;
  location: {
    lat: number;
    lng: number;
    address?: string;
  };
  photos?: string[];
}

const COLLECTION_NAME = 'signalements'; // Changé de 'reports' à 'signalements'

class ReportsService {
  private reportsCollection = collection(db, COLLECTION_NAME);

  async getAllSignalements(): Promise<{ success: boolean; signalements: any[]; error?: string }> {
    try {
      const q = query(this.reportsCollection, orderBy('dateCreation', 'desc'));
      const snapshot = await getDocs(q);

      const signalements = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Convertir les timestamps si nécessaire
        dateCreation: doc.data().dateCreation || null
      }));

      return { success: true, signalements };
    } catch (error) {
      console.error('Erreur récupération signalements:', error);
      return { success: false, signalements: [], error: 'Erreur lors de la récupération' };
    }
  }

  // Créer un signalement
  async createReport(reportData: ReportInput, userId: string, userEmail?: string): Promise<{ success: boolean; report?: Report; error?: string }> {
    try {
      const newReport = {
        ...reportData,
        userId,
        userEmail: userEmail || '',
        status: 'pending' as const,
        upvotes: 0,
        comments: 0,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      const docRef = await addDoc(this.reportsCollection, newReport);

      return {
        success: true,
        report: {
          id: docRef.id,
          ...reportData,
          userId,
          userEmail,
          status: 'pending',
          upvotes: 0,
          comments: 0,
          createdAt: new Date(),
          updatedAt: new Date()
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
      const q = query(this.reportsCollection, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);

      const reports: Report[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate()
      })) as Report[];

      return { success: true, reports };
    } catch (error) {
      console.error('Erreur récupération signalements:', error);
      return { success: false, reports: [], error: 'Erreur lors de la récupération' };
    }
  }

  // Écouter les signalements en temps réel
  subscribeToReports(callback: (reports: Report[]) => void): Unsubscribe {
    const q = query(this.reportsCollection, orderBy('createdAt', 'desc'));

    return onSnapshot(q, (snapshot) => {
      const reports: Report[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate()
      })) as Report[];

      callback(reports);
    }, (error) => {
      console.error('Erreur écoute signalements:', error);
      callback([]);
    });
  }

  // Récupérer les signalements d'un utilisateur
  async getMyReports(userId: string): Promise<{ success: boolean; reports: Report[]; error?: string }> {
    try {
      const q = query(
        this.reportsCollection,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);

      const reports: Report[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate()
      })) as Report[];

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
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate()
        } as Report
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
      await updateDoc(docRef, {
        ...updates,
        updatedAt: Timestamp.now()
      });
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

  // Statistiques utilisateur
  async getUserStats(userId: string): Promise<{ total: number; resolved: number }> {
    try {
      const q = query(this.reportsCollection, where('userId', '==', userId));
      const snapshot = await getDocs(q);

      let total = 0;
      let resolved = 0;

      snapshot.docs.forEach(doc => {
        total++;
        if (doc.data().status === 'resolved') {
          resolved++;
        }
      });

      return { total, resolved };
    } catch (error) {
      console.error('Erreur stats:', error);
      return { total: 0, resolved: 0 };
    }
  }
}

const reportsService = new ReportsService();
export default reportsService;
