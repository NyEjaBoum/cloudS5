import React, { useState } from 'react';
import CarteOffline from './components/CarteOffline';

const TestCarte = () => {
  // Données de test
  const [signalements, setSignalements] = useState([
    {
      id: 1,
      titre: "Nid de poule - Avenue de l'Indépendance",
      description: "Grand trou sur la chaussée, dangereux pour les véhicules",
      statut: 1,
      latitude: -18.8792,
      longitude: 47.5079,
      surface_m2: 15,
      budget: 75000,
      entreprise: "Entreprise A",
      date_creation: "2026-01-15T10:30:00Z"
    },
    {
      id: 2,
      titre: "Route inondée - Ambohijatovo",
      description: "Inondation après fortes pluies, circulation impossible",
      statut: 11,
      latitude: -18.9100,
      longitude: 47.5200,
      surface_m2: 50,
      budget: 200000,
      entreprise: "Entreprise B",
      date_creation: "2026-01-10T14:20:00Z"
    },
    {
      id: 3,
      titre: "Travaux terminés - Analakely",
      description: "Réfection de la chaussée terminée",
      statut: 99,
      latitude: -18.9000,
      longitude: 47.5300,
      surface_m2: 100,
      budget: 500000,
      entreprise: "Entreprise C",
      date_creation: "2026-01-05T09:15:00Z"
    }
  ]);

  const [stats, setStats] = useState({
    total: 0,
    surface: 0,
    budget: 0,
    enCours: 0
  });

  // Calculer les statistiques
  React.useEffect(() => {
    const total = signalements.length;
    const surface = signalements.reduce((sum, s) => sum + (s.surface_m2 || 0), 0);
    const budget = signalements.reduce((sum, s) => sum + (s.budget || 0), 0);
    const enCours = signalements.filter(s => s.statut === 11).length;
    
    setStats({ total, surface, budget, enCours });
  }, [signalements]);

  const handleMarkerClick = (marker) => {
    alert(`Signalement: ${marker.titre}\nStatut: ${
      marker.statut === 1 ? 'Nouveau' : 
      marker.statut === 11 ? 'En cours' : 
      marker.statut === 99 ? 'Terminé' : 'Annulé'
    }`);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <header style={{ marginBottom: '20px' }}>
        <h1 style={{ color: '#2c3e50' }}>📍 Carte des Travaux Routiers - Antananarivo</h1>
        <p style={{ color: '#7f8c8d' }}>Suivi des signalements en temps réel (Mode Offline)</p>
      </header>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 300px', 
        gap: '20px',
        marginBottom: '20px'
      }}>
        {/* Carte */}
        <div>
          <CarteOffline 
            markers={signalements}
            onMarkerClick={handleMarkerClick}
          />
        </div>

        {/* Panneau de statistiques */}
        <div style={{
          backgroundColor: '#f8f9fa',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #dee2e6'
        }}>
          <h3 style={{ marginTop: '0', color: '#2c3e50' }}>📊 Statistiques</h3>
          
          <div style={{ marginBottom: '15px' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              marginBottom: '8px',
              paddingBottom: '8px',
              borderBottom: '1px solid #e9ecef'
            }}>
              <span>Signalements totaux:</span>
              <strong>{stats.total}</strong>
            </div>
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              marginBottom: '8px',
              paddingBottom: '8px',
              borderBottom: '1px solid #e9ecef'
            }}>
              <span>Surface totale:</span>
              <strong>{stats.surface} m²</strong>
            </div>
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              marginBottom: '8px',
              paddingBottom: '8px',
              borderBottom: '1px solid #e9ecef'
            }}>
              <span>Budget total:</span>
              <strong>{stats.budget.toLocaleString()} Ar</strong>
            </div>
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              marginBottom: '8px'
            }}>
              <span>Travaux en cours:</span>
              <strong style={{ color: '#e67e22' }}>{stats.enCours}</strong>
            </div>
          </div>

          {/* Légende */}
          <div>
            <h4 style={{ marginBottom: '10px', color: '#2c3e50' }}>Légende</h4>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
              <div style={{ width: '12px', height: '12px', backgroundColor: 'red', marginRight: '8px', borderRadius: '50%' }}></div>
              <span>Nouveau</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
              <div style={{ width: '12px', height: '12px', backgroundColor: 'orange', marginRight: '8px', borderRadius: '50%' }}></div>
              <span>En cours</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
              <div style={{ width: '12px', height: '12px', backgroundColor: 'green', marginRight: '8px', borderRadius: '50%' }}></div>
              <span>Terminé</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ width: '12px', height: '12px', backgroundColor: 'gray', marginRight: '8px', borderRadius: '50%' }}></div>
              <span>Annulé</span>
            </div>
          </div>

          {/* Boutons d'action */}
          <div style={{ marginTop: '20px' }}>
            <button 
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: '#3498db',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                marginBottom: '10px'
              }}
              onClick={() => alert('Fonctionnalité à implémenter')}
            >
              📍 Ajouter un signalement
            </button>
            
            <button 
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: '#2ecc71',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
              onClick={() => window.location.reload()}
            >
              🔄 Actualiser la carte
            </button>
          </div>
        </div>
      </div>

      {/* Liste des signalements */}
      <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '15px', border: '1px solid #dee2e6' }}>
        <h3 style={{ marginTop: '0', color: '#2c3e50' }}>📋 Liste des signalements</h3>
        <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f1f2f6' }}>
                <th style={{ padding: '10px', textAlign: 'left' }}>Titre</th>
                <th style={{ padding: '10px', textAlign: 'left' }}>Statut</th>
                <th style={{ padding: '10px', textAlign: 'left' }}>Surface</th>
                <th style={{ padding: '10px', textAlign: 'left' }}>Budget</th>
              </tr>
            </thead>
            <tbody>
              {signalements.map((s) => (
                <tr key={s.id} style={{ borderBottom: '1px solid #e9ecef' }}>
                  <td style={{ padding: '10px' }}>{s.titre}</td>
                  <td style={{ padding: '10px' }}>
                    <span style={{
                      padding: '3px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      backgroundColor: 
                        s.statut === 1 ? '#ffebee' :
                        s.statut === 11 ? '#fff3e0' :
                        s.statut === 99 ? '#e8f5e9' : '#f5f5f5',
                      color: 
                        s.statut === 1 ? '#c62828' :
                        s.statut === 11 ? '#ef6c00' :
                        s.statut === 99 ? '#2e7d32' : '#616161'
                    }}>
                      {s.statut === 1 ? 'NOUVEAU' : s.statut === 11 ? 'EN COURS' : s.statut === 99 ? 'TERMINÉ' : 'ANNULÉ'}
                    </span>
                  </td>
                  <td style={{ padding: '10px' }}>{s.surface_m2} m²</td>
                  <td style={{ padding: '10px' }}>{s.budget.toLocaleString()} Ar</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <footer style={{ marginTop: '20px', textAlign: 'center', color: '#7f8c8d', fontSize: '12px' }}>
        <p>Projet Cloud S5 - Carte Offline Antananarivo | Données servies depuis localhost:8080</p>
      </footer>
    </div>
  );
};

export default TestCarte;