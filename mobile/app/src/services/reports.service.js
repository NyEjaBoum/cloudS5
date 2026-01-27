// src/services/reports.service.js
import api from './api';

class ReportsService {
  // ===== CRÉER UN SIGNALEMENT =====
  async createReport(reportData) {
    try {
      // Ajouter la localisation si disponible
      const completeReport = {
        ...reportData,
        location: {
          lat: reportData.latitude || reportData.lat,
          lng: reportData.longitude || reportData.lng,
          address: reportData.address || ''
        },
        reportedAt: new Date().toISOString(),
        status: 'new' // Par défaut
      };
      
      const response = await api.post('/reports', completeReport);
      return {
        success: true,
        report: response.data,
        message: 'Signalement créé avec succès'
      };
    } catch (error) {
      return {
        success: false,
        error: 'Erreur lors de la création du signalement',
        details: error
      };
    }
  }
  
  // ===== RÉCUPÉRER TOUS LES SIGNALEMENTS =====
  async getAllReports(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      // Ajouter les filtres s'ils existent
      if (filters.status) params.append('status', filters.status);
      if (filters.userId) params.append('userId', filters.userId);
      
      const url = `/reports${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await api.get(url);
      
      return {
        success: true,
        reports: response.data,
        total: response.data.length
      };
    } catch (error) {
      return {
        success: false,
        error: 'Erreur lors de la récupération des signalements',
        details: error
      };
    }
  }
  
  // ===== RÉCUPÉRER MES SIGNALEMENTS =====
  async getMyReports() {
    try {
      const response = await api.get('/reports/my');
      return {
        success: true,
        reports: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: 'Erreur lors de la récupération de vos signalements',
        details: error
      };
    }
  }
  
  // ===== RÉCUPÉRER UN SIGNALEMENT PAR ID =====
  async getReportById(id) {
    try {
      const response = await api.get(`/reports/${id}`);
      return {
        success: true,
        report: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: 'Signalement non trouvé',
        details: error
      };
    }
  }
  
  // ===== METTRE À JOUR UN SIGNALEMENT =====
  async updateReport(id, updates) {
    try {
      const response = await api.put(`/reports/${id}`, updates);
      return {
        success: true,
        report: response.data,
        message: 'Signalement mis à jour'
      };
    } catch (error) {
      return {
        success: false,
        error: 'Erreur lors de la mise à jour',
        details: error
      };
    }
  }
  
  // ===== SUPPRIMER UN SIGNALEMENT =====
  async deleteReport(id) {
    try {
      await api.delete(`/reports/${id}`);
      return {
        success: true,
        message: 'Signalement supprimé'
      };
    } catch (error) {
      return {
        success: false,
        error: 'Erreur lors de la suppression',
        details: error
      };
    }
  }
  
  // ===== STATISTIQUES =====
  async getStats() {
    try {
      const response = await api.get('/reports/stats');
      return {
        success: true,
        stats: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: 'Erreur lors de la récupération des statistiques',
        details: error
      };
    }
  }
}

// Exporter une instance unique
const reportsService = new ReportsService();
export default reportsService;