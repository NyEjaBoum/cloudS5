// src/services/signalements.service.ts
// Service pour les signalements PostgreSQL (legacy)
// Pour Firestore, utiliser signalements-firestore.service.ts

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

// Note: Les méthodes Firestore ont été déplacées vers signalements-firestore.service.ts
// pour éviter les problèmes d'import avec api.js

const signalementsService = {};
export default signalementsService;
