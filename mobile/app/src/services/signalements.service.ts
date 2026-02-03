// src/services/signalements.service.ts
import api from './api';

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
}

const signalementsService = new SignalementsService();
export default signalementsService;
