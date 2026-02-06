import { db } from '../config/firebase.config';
import {
  collection,
  doc,
  query,
  where,
  onSnapshot,
  updateDoc,
  getDocs,
  type Unsubscribe
} from 'firebase/firestore';

export interface Notification {
  id: string;
  signalementId: string;
  signalementTitre: string;
  ancienStatut: number;
  nouveauStatut: number;
  userEmail: string;
  dateCreation: string;
  lu: boolean;
}

const COLLECTION_NAME = 'notifications';

class NotificationsService {
  private notificationsCollection = collection(db, COLLECTION_NAME);

  // Écouter les notifications en temps réel pour un utilisateur
  subscribeToNotifications(
    userEmail: string,
    callback: (notifications: Notification[]) => void
  ): Unsubscribe {
    const q = query(
      this.notificationsCollection,
      where('userEmail', '==', userEmail)
    );
    return onSnapshot(q, (snapshot) => {
      const notifications: Notification[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          signalementId: data.signalementId,
          signalementTitre: data.signalementTitre,
          ancienStatut: data.ancienStatut,
          nouveauStatut: data.nouveauStatut,
          userEmail: data.userEmail,
          dateCreation: data.dateCreation,
          lu: data.lu ?? false
        };
      });
      // Tri par date décroissante (plus récent en premier)
      notifications.sort((a, b) =>
        (b.dateCreation || '').localeCompare(a.dateCreation || '')
      );
      callback(notifications);
    }, (error) => {
      console.error('Erreur écoute notifications:', error);
      callback([]);
    });
  }

  // Marquer une notification comme lue
  async markAsRead(notificationId: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, notificationId);
      await updateDoc(docRef, { lu: true });
    } catch (error) {
      console.error('Erreur marquage notification:', error);
    }
  }

  // Marquer toutes les notifications comme lues
  async markAllAsRead(userEmail: string): Promise<void> {
    try {
      const q = query(
        this.notificationsCollection,
        where('userEmail', '==', userEmail),
        where('lu', '==', false)
      );
      const snapshot = await getDocs(q);
      const promises = snapshot.docs.map(d =>
        updateDoc(doc(db, COLLECTION_NAME, d.id), { lu: true })
      );
      await Promise.all(promises);
    } catch (error) {
      console.error('Erreur marquage toutes notifications:', error);
    }
  }
}

const notificationsService = new NotificationsService();
export default notificationsService;
