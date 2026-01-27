// src/services/api.js
import axios from 'axios';
import router from '@/router';

// URL de base de l'API - À ADAPTER avec l'URL de ton équipe backend
// Probablement : http://localhost:8080/api (Spring Boot)
// ou : http://localhost:3000/api (Node.js)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// Créer une instance axios configurée
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 secondes timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// ===== INTERCEPTEUR REQUEST =====
// Ajoute automatiquement le token JWT dans les headers
api.interceptors.request.use(
  (config) => {
    // Récupérer le token du localStorage
    const token = localStorage.getItem('auth_token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ===== INTERCEPTEUR RESPONSE =====
// Gère les erreurs globalement (401, 403, 500...)
api.interceptors.response.use(
  (response) => {
    // Si la réponse est OK, la retourner directement
    return response;
  },
  (error) => {
    if (!error.response) {
      // Erreur réseau ou serveur inaccessible
      console.error('Erreur réseau:', error.message);
      return Promise.reject({
        message: 'Serveur inaccessible. Vérifiez votre connexion.',
        isNetworkError: true
      });
    }
    
    const { status, data } = error.response;
    
    switch (status) {
      case 401: // Non authentifié
        console.warn('Token expiré ou invalide');
        // Nettoyer le localStorage
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        // Rediriger vers login
        if (router.currentRoute.value.path !== '/login') {
          router.push('/login');
        }
        break;
        
      case 403: // Non autorisé
        console.warn('Accès refusé');
        break;
        
      case 404: // Ressource non trouvée
        console.warn('Ressource non trouvée');
        break;
        
      case 422: // Erreur de validation
        console.warn('Erreur de validation:', data.errors);
        break;
        
      case 500: // Erreur serveur
        console.error('Erreur serveur interne');
        break;
    }
    
    // Retourner une erreur structurée
    return Promise.reject({
      status,
      message: data?.message || `Erreur ${status}`,
      errors: data?.errors || null,
      data: data || null
    });
  }
);

// Fonctions utilitaires
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('auth_token', token);
  } else {
    localStorage.removeItem('auth_token');
  }
};

export const getAuthToken = () => {
  return localStorage.getItem('auth_token');
};

export const clearAuth = () => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user');
};

// Exporter l'instance configurée
export default api;