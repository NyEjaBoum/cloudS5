// src/services/auth.service.js
import api from './api';

class AuthService {
  constructor() {
    this.user = this.getStoredUser();
  }
  
  // ===== LOGIN =====
  async login(email, password) {
    try {
      console.log('Tentative de connexion avec:', email);
      
      const response = await api.post('/auth/login', {
        email,
        password,
        returnSecureToken: true
      });
      
      const { token, user } = response.data;
      
      // Stocker les données
      this.setStoredUser(user);
      this.setStoredToken(token);
      
      console.log('✅ Connexion réussie');
      return {
        success: true,
        user,
        token
      };
    } catch (error) {
      console.error('❌ Erreur de connexion:', error.message);
      
      let errorMessage = 'Erreur de connexion';
      
      // Messages d'erreur en français selon le code d'erreur
      if (error.message.includes('401')) {
        errorMessage = 'Email ou mot de passe incorrect';
      } else if (error.message.includes('network')) {
        errorMessage = 'Serveur inaccessible. Vérifiez votre connexion.';
      }
      
      return {
        success: false,
        error: errorMessage,
        details: error
      };
    }
  }
  
  // ===== REGISTER =====
  async register(userData) {
    try {
      const response = await api.post('/auth/register', userData);
      const { token, user } = response.data;
      
      // Stocker les données
      this.setStoredUser(user);
      this.setStoredToken(token);
      
      return {
        success: true,
        user,
        token
      };
    } catch (error) {
      let errorMessage = "Erreur lors de l'inscription";
      
      if (error.message.includes('409')) {
        errorMessage = 'Un compte avec cet email existe déjà';
      } else if (error.message.includes('422')) {
        errorMessage = 'Données invalides';
      }
      
      return {
        success: false,
        error: errorMessage,
        details: error
      };
    }
  }
  
  // ===== LOGOUT =====
  logout() {
    this.clearStoredData();
    console.log('✅ Déconnexion réussie');
  }
  
  // ===== VÉRIFICATION =====
  isAuthenticated() {
    const token = this.getStoredToken();
    return !!token;
  }
  
  getCurrentUser() {
    return this.user;
  }
  
  // ===== GESTION LOCALSTORAGE =====
  setStoredUser(user) {
    this.user = user;
    localStorage.setItem('user', JSON.stringify(user));
  }
  
  getStoredUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
  
  setStoredToken(token) {
    localStorage.setItem('auth_token', token);
    // Mettre aussi dans axios pour les prochaines requêtes
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
  
  getStoredToken() {
    return localStorage.getItem('auth_token');
  }
  
  clearStoredData() {
    this.user = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
  }
  
  // ===== RÉINITIALISATION MOT DE PASSE =====
  async resetPassword(email) {
    try {
      await api.post('/auth/reset-password', { email });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: 'Erreur lors de la réinitialisation'
      };
    }
  }
}

// Exporter une instance unique (singleton)
const authService = new AuthService();
export default authService;