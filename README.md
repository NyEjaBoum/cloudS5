# cloudS5
cloudS5 project

## Tâches réalisées

- Création du schéma de base de données PostgreSQL (tables, vues, relations)
- Insertion de données d’exemple pour les rôles, utilisateurs, entreprises, signalements, etc.
- Création des entités JPA pour chaque table (Utilisateur, Signalement, Entreprise, etc.)
- Création des repositories Spring Data JPA pour accéder aux données
- Création de DTOs pour exposer les données via l’API (récapitulatif, infos signalement…)
- Création de services pour la logique métier (SignalementService, FirebaseSignalementService…)
- Création de contrôleurs REST pour exposer les endpoints :
  - `/api/signalements` : liste des signalements
  - `/api/signalements/recapitulatif` : tableau de récapitulatif global
  - `/api/signalements/infos` : infos détaillées sur chaque signalement
  - `/api/signalements/sync/{id}` et `/api/signalements/syncAll` : synchronisation Firebase
- Gestion des utilisateurs bloqués (champ `compte_bloque` dans la table `utilisateurs`)
- Mise en place de la configuration Firebase pour la synchronisation

## Fonctionnement

- **Backend Spring Boot** connecté à une base PostgreSQL.
- Les données sont accessibles via des endpoints REST.
- Les vues SQL (`vue_recapitulatif_signalement`, `vue_infos_signalement`) permettent de simplifier les requêtes pour le tableau de bord et les infos signalement.
- Les DTOs servent à formater les réponses de l’API.
- Les endpoints REST renvoient toujours une réponse structurée :
  ```json
  {
    "status": "success",
    "data": { ... },
    "error": null
  }
  ```
- La synchronisation Firebase permet d’envoyer les signalements en ligne pour affichage mobile.
- Les utilisateurs bloqués peuvent être listés via une requête sur le champ `compte_bloque`.

---

Pour lancer le backend :
1. Crée la base de données avec les scripts `base.sql` et `base_donnees.sql`.
2. Configure la connexion dans `src/main/resources/application.properties`.
3. Lance l’application avec Maven :
   ```sh
   ./mvnw spring-boot:run
   ```
4. Les endpoints sont accessibles sur `http://localhost:8080/api/signalements`.