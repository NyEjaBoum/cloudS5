# Mapéo - Système de Gestion des Signalements Routiers

## Table des Matières

- [Fonctionnalités](#fonctionnalités)
- [Installation et Démarrage](#installation-et-démarrage)
- [Système d'Authentification](#système-dauthentification)
- [API et Endpoints](#api-et-endpoints)
- [Application Mobile](#application-mobile)
- [Déploiement](#déploiement)

## Fonctionnalités

### Module Authentification

- Authentification hybride : Email/mot de passe avec base PostgreSQL locale et Firebase
- Inscription/Connexion avec gestion de sessions configurable
- Limite de tentatives (3 par défaut, paramétrable) avec système de blocage
- API de déblocage pour les administrateurs
- Documentation API complète via Swagger UI

### Module Cartes

- Serveur de cartes offline conteneurisé (Docker) avec tuiles d'Antananarivo
- Visualisation interactive via Leaflet.js
- Géolocalisation des signalements

### Application Web (React)

#### Visiteur (sans compte)

- Visualisation de la carte avec tous les points de signalement
- Survol interactif pour afficher les détails (date, statut, surface, budget, entreprise)
- Tableau de récapitulation global (nombre de points, surface totale, % d'avancement, budget total)

#### Manager (compte administrateur)

- Gestion des utilisateurs : Création de comptes, déblocage, historique
- Synchronisation intelligente : Récupération/envoi des données vers Firebase
- Gestion complète des signalements :
  - Ajout/modification des informations (surface, budget, entreprise)
  - Mise à jour des statuts (Nouveau → En cours → Terminé)
  - Catégorisation des réparations (niveaux 1 à 10)
  - Calcul automatique du budget : `prix_par_m² × niveau × surface_m²`
  - Suivi d'avancement automatisé : 0% (Nouveau), 50% (En cours), 100% (Terminé)
- Tableau de bord analytique :
  - Statistiques de délai moyen de traitement
  - Indicateurs de performance clés (KPIs)
  - Visualisation des coûts et avancements

### Application Mobile (Vue.js)

- Formulaire : Photos, géolocalisation, catégorisation
- Consultation des signalements

## Installation et Démarrage

### Prérequis

- Docker & Docker Compose
- Node.js 18+ et npm
- Java JDK 17+
- Android Studio (pour build mobile)
- Un compte Firebase (optionnel pour le mode cloud)

### 1. Installation via Docker (Backend, BD, Carte)

```bash
# Lancez les services conteneurisés
docker-compose up -d --build

# Vérifiez que les services sont en ligne
docker-compose ps
```

**Services démarrés :**

- Backend API : <http://localhost:8080>
- PostgreSQL : localhost:5432
- Serveur de cartes : <http://localhost:8081>
- Frontend : <http://localhost:5173/login>

### Installation de l'Application Mobile

```bash
cd mobile
# Configuration (modifiez les chemins dans les fichiers .bat selon votre environnement)
# - setup.bat : setup de base
# - run.bat : lancement sur émulateur
# - apk.bat : génération de l'APK
```

## API et Endpoints

L'API REST est documentée via Swagger UI : [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)

### Authentification (local)

| Méthode | Endpoint                | Description                                   |
|---------|-------------------------|-----------------------------------------------|
| POST    | /api/auth/register      | Inscription d’un nouvel utilisateur (MANAGER) |
| POST    | /api/auth/login         | Connexion email/mot de passe                  |

### Authentification (Firebase)

| Méthode | Endpoint                          | Description                                 |
|---------|-----------------------------------|---------------------------------------------|
| POST    | /api/auth/firebase/login          | Connexion via Firebase                      |
| POST    | /api/auth/firebase/check-status   | Vérification de l’état d’un utilisateur     |
| POST    | /api/auth/firebase/failed-attempt | Enregistrement d’un échec d’inscription     |

### Utilisateurs

| Méthode | Endpoint                                         | Description                                 |
|---------|--------------------------------------------------|---------------------------------------------|
| GET     | /api/utilisateurs                                | Liste des utilisateurs                      |
| GET     | /api/utilisateurs/{id}                           | Détail d’un utilisateur                     |
| PUT     | /api/utilisateurs/{id}                           | Modifier un utilisateur (soi-même/MANAGER)  |
| POST    | /api/utilisateurs/unblock/{userId}               | Débloquer un utilisateur                    |
| GET     | /api/utilisateurs/historique-blocage             | Historique des blocages                     |
| GET     | /api/utilisateurs/{id}/historique-blocage        | Historique de blocage d’un utilisateur      |
| POST    | /api/utilisateurs/firebase/import                | Importer depuis Firebase (MANAGER)          |
| POST    | /api/utilisateurs/firebase/export                | Exporter vers Firebase (MANAGER)            |
| POST    | /api/utilisateurs/firebase/sync                  | Synchroniser avec Firebase (MANAGER)        |

### Signalements

| Méthode | Endpoint                                         | Description                                 |
|---------|--------------------------------------------------|---------------------------------------------|
| GET     | /api/signalements                                | Liste des signalements                      |
| GET     | /api/signalements/{id}                           | Détail d’un signalement (SignalementCpl)    |
| PUT     | /api/signalements/{id}                           | Modifier un signalement (MANAGER)           |
| POST    | /api/signalements                                | Créer un signalement                        |
| GET     | /api/signalements/duree                          | Délai de traitement (MANAGER)               |
| GET     | /api/signalements/stats-delai-moyen              | Statistiques de délai moyen (MANAGER)       |
| GET     | /api/signalements/{id}/historique                | Historique d’un signalement (MANAGER)       |
| GET     | /api/signalements/complet                        | Liste complète (SignalementCpl)             |
| GET     | /api/signalements/recapitulatif                  | Récapitulatif global                        |
| GET     | /api/signalements/infos                          | Infos signalements (MANAGER)                |
| POST    | /api/signalements/firebase/import                | Importer depuis Firebase (MANAGER)          |
| POST    | /api/signalements/firebase/export                | Exporter vers Firebase (MANAGER)            |
| POST    | /api/signalements/sync                           | Synchroniser avec Firebase (MANAGER)        |

### Entreprises

| Méthode | Endpoint                | Description                                 |
|---------|-------------------------|---------------------------------------------|
| GET     | /api/entreprises        | Liste des entreprises                       |
| GET     | /api/entreprises/{id}   | Détail d’une entreprise                     |

### Prix

| Méthode | Endpoint                | Description                                    |
|---------|-------------------------|------------------------------------------------|
| GET     | /api/prix               | Obtenir le prix global                         |
| PUT     | /api/prix               | Modifier le prix (MANAGER)                     |
| GET     | /api/prix/historique    | Historique des prix                            |
| GET     | /api/prix/calculer      | Calculer un budget (params: surfaceM2, niveau) |
