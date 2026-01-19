-- Rôles

---- statut: 1 nouveau, 11 en cours , 21 annule(ou effacer), 99 terminer

INSERT INTO roles (nom) VALUES
  ('VISITEUR'),
  ('UTILISATEUR'),
  ('MANAGER');

-- Actions par rôle
INSERT INTO action_role (role_id, action) VALUES
  (1, 'VOIR_SIGNALEMENTS'),
  (2, 'CREER_SIGNALEMENT'),
  (2, 'MODIFIER_SIGNALEMENT'),
  (3, 'MODIFIER_STATUT'),
  (3, 'DEBLOQUER_UTILISATEUR');

-- Entreprises
INSERT INTO entreprises (nom, adresse, contact) VALUES
  ('Entreprise A', 'Adresse A', 'Contact A'),
  ('Entreprise B', 'Adresse B', 'Contact B'),
  ('Entreprise C', 'Adresse C', 'Contact C');

-- Utilisateurs (seulement UTILISATEUR et MANAGER)
INSERT INTO utilisateurs (email, mot_de_passe, nom, prenom, role_id, tentatives_echouees, compte_bloque, date_creation)
VALUES
  ('user1@example.com', '$2a$10$hash2', 'Un', 'Utilisateur', 2, 0, FALSE, NOW()),
  ('user2@example.com', '$2a$10$hash3', 'Deux', 'Utilisateur', 2, 2, TRUE, NOW()),
  ('manager@example.com', '$2a$10$hash4', 'Test', 'Manager', 3, 0, FALSE, NOW());

-- Signalements
-- Statut : 1 = Nouveau, 11/21 = En cours, 99 = Terminé, 0 = Effacé
INSERT INTO signalements (titre, description, statut, latitude, longitude, surface_m2, budget, id_entreprise, id_utilisateur, date_creation)
VALUES
  ('Nid de poule', 'Trou sur la route principale', 1, -18.8792, 47.5079, 10, 50000, 1, 1, NOW()),
  ('Route inondée', 'Inondation après pluie', 11, -18.9100, 47.5200, 50, 200000, 2, 1, NOW()),
  ('Signalisation manquante', 'Panneau absent', 99, -18.9000, 47.5300, 5, 10000, 3, 3, NOW());

-- Historique des statuts de signalement
INSERT INTO signalement_historique (id_signalement, ancien_statut, nouveau_statut, date_changement, id_utilisateur)
VALUES
  (1, 1, 11, NOW() - INTERVAL '2 days', 3),
  (2, 11, 99, NOW() - INTERVAL '1 day', 3),
  (3, 1, 99, NOW(), 3);

-- Sessions
INSERT INTO sessions (id_utilisateur, token_jwt, expiration, date_creation)
VALUES
  (1, 'jwt_token_user1', NOW() + INTERVAL '1 day', NOW()),
  (3, 'jwt_token_manager', NOW() + INTERVAL '1 day', NOW());

-- Ajoute ceci dans base.sql ou via un script SQL
CREATE OR REPLACE VIEW vue_infos_signalement AS
SELECT
  s.id,
  s.titre,
  s.description,
  s.statut,
  s.surface_m2,
  s.budget,
  e.nom AS entreprise,
  s.date_creation
FROM signalements s
LEFT JOIN entreprises e ON s.id_entreprise = e.id;

CREATE OR REPLACE VIEW vue_recapitulatif_signalement AS
SELECT
  COUNT(*) AS nombre_points,
  COALESCE(SUM(surface_m2), 0) AS total_surface,
  COALESCE(SUM(budget), 0) AS total_budget,
  CASE
    WHEN COUNT(*) = 0 THEN 0
    ELSE ROUND(100.0 * SUM(CASE WHEN statut = 99 THEN 1 ELSE 0 END) / COUNT(*), 2)
  END AS avancement_pourcent
FROM signalements
WHERE statut <> 21;