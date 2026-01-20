import React, { useState } from 'react';
import CarteOffline from './components/CarteOffline';
import './App.css';

function App() {
  const [signalements, setSignalements] = useState([
    {
      id: 1,
      titre: "Nid de poule important",
      description: "Grand trou sur la chaussée, dangereux pour la circulation",
      statut: 1,
      latitude: -18.8792,
      longitude: 47.5079,
      surface_m2: 12.5,
      budget: 65000,
      entreprise: "Entreprise A",
      date_creation: "2026-01-15"
    },
    {
      id: 2,
      titre: "Route inondée",
      description: "Inondation suite aux fortes pluies",
      statut: 11,
      latitude: -18.9100,
      longitude: 47.5200,
      surface_m2: 45,
      budget: 180000,
      entreprise: "Entreprise B",
      date_creation: "2026-01-10"
    },
    {
      id: 3,
      titre: "Réparation chaussée",
      description: "Travaux de réfection terminés",
      statut: 99,
      latitude: -18.9000,
      longitude: 47.5300,
      surface_m2: 120,
      budget: 550000,
      entreprise: "Entreprise C",
      date_creation: "2026-01-05"
    }
  ]);

  const handleMarkerClick = (marker) => {
    console.log('Marker clicked:', marker);
    alert(`Signalement: ${marker.titre}\nStatut: ${marker.statut === 1 ? 'Nouveau' : marker.statut === 11 ? 'En cours' : 'Terminé'}`);
  };

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <header style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: '#2c3e50', marginBottom: '10px' }}>
          🗺️ Carte des Travaux Routiers - Antananarivo
        </h1>
        <p style={{ color: '#7f8c8d' }}>
          Suivi des signalements en temps réel | Mode Offline
        </p>
        <div style={{
          display: 'inline-flex',
          gap: '10px',
          marginTop: '10px',
          fontSize: '14px'
        }}>
          <span style={{ padding: '4px 8px', background: '#e8f4fd', borderRadius: '4px' }}>
            🟢 Serveur tuiles: localhost:8080
          </span>
          <span style={{ padding: '4px 8px', background: '#f0f9ff', borderRadius: '4px' }}>
            📍 Signalements: {signalements.length}
          </span>
        </div>
      </header>

      <main>
        <div style={{ marginBottom: '20px' }}>
          <CarteOffline 
            markers={signalements}
            onMarkerClick={handleMarkerClick}
          />
        </div>

        <div style={{
          background: '#f8f9fa',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #dee2e6'
        }}>
          <h3 style={{ marginTop: 0 }}>📊 Résumé</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#3498db' }}>
                {signalements.length}
              </div>
              <div style={{ fontSize: '14px', color: '#7f8c8d' }}>Total</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#e74c3c' }}>
                {signalements.filter(s => s.statut === 1).length}
              </div>
              <div style={{ fontSize: '14px', color: '#7f8c8d' }}>Nouveaux</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f39c12' }}>
                {signalements.filter(s => s.statut === 11).length}
              </div>
              <div style={{ fontSize: '14px', color: '#7f8c8d' }}>En cours</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2ecc71' }}>
                {signalements.filter(s => s.statut === 99).length}
              </div>
              <div style={{ fontSize: '14px', color: '#7f8c8d' }}>Terminés</div>
            </div>
          </div>
        </div>
      </main>

      <footer style={{
        marginTop: '30px',
        textAlign: 'center',
        color: '#95a5a6',
        fontSize: '14px',
        paddingTop: '20px',
        borderTop: '1px solid #ecf0f1'
      }}>
        <p>Projet Cloud S5 - Système de suivi des travaux routiers</p>
        <p style={{ fontSize: '12px' }}>
          Carte offline d'Antananarivo | Données servies depuis Docker
        </p>
      </footer>
    </div>
  );
}

export default App;