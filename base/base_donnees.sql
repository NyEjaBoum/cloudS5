-- =========================
-- Rôles
-- =========================
-- =========================
-- RESET DES DONNÉES
-- =========================

TRUNCATE TABLE
  signalement_historique,
  signalements,
  sessions,
  action_role,
  utilisateurs,
  entreprises,
  roles
RESTART IDENTITY
CASCADE;


INSERT INTO roles (nom) VALUES ('MANAGER'), ('UTILISATEUR'), ('VISITEUR');

-- =========================
-- Actions par rôle (permissions)
-- =========================
INSERT INTO action_role (role_id, action) VALUES
  (1, 'CREER_UTILISATEUR'),
  (1, 'SYNC'),
  (1, 'VOIR_SIGNALEMENTS'),
  (2, 'VOIR_SIGNALEMENTS');

-- =========================
-- Entreprises
-- =========================
INSERT INTO entreprises (nom, adresse, contact) VALUES
  ('Entreprise A', 'Adresse A', 'Contact A'),
  ('Entreprise B', 'Adresse B', 'Contact B'),
  ('Entreprise C', 'Adresse C', 'Contact C');

-- =========================
-- Utilisateurs (MANAGER et UTILISATEUR)
-- =========================
INSERT INTO utilisateurs (email, mot_de_passe, nom, prenom, role_id, tentatives_echouees, compte_bloque, date_creation)
VALUES
  -- Manager par défaut
  ('razanatsimbanyeja@gmail.com', '$2a$12$vDSIoLizS0srhb/COQm1tubo58o63cLcQpe5FIBUcCcgacpE/yPfW', 'Ny Eja', 'Razanatsimba', 1, 0, FALSE, NOW()),
  -- Autres utilisateurs
  ('user1@example.com', '$2a$12$qvw9.HuDHb2vwcYVUr10HexA0.uUYQCtd7W.eZSAL/XyzI5wZsFVC', 'Un', 'Utilisateur', 2, 0, FALSE, NOW()),
  ('user2@example.com', '$2a$12$qvw9.HuDHb2vwcYVUr10HexA0.uUYQCtd7W.eZSAL/XyzI5wZsFVC', 'Deux', 'Utilisateur', 2, 2, TRUE, NOW()),
  ('user3@example.com', '$2a$12$qvw9.HuDHb2vwcYVUr10HexA0.uUYQCtd7W.eZSAL/XyzI5wZsFVC', 'Trois', 'Utilisateur', 2, 0, FALSE, NOW());

-- =========================
-- Signalements
-- Statut : 1 = Nouveau, 11 = En cours, 21 = Annulé, 99 = Terminé
-- =========================
INSERT INTO signalements (titre, description, statut, latitude, longitude, surface_m2, budget, id_entreprise, id_utilisateur, date_creation)
VALUES
  ('Nid de poule', 'Trou sur la route principale', 1, -18.8792, 47.5079, 10, 50000, 1, 2, NOW()),
  ('Route inondée', 'Inondation après pluie', 11, -18.9100, 47.5200, 50, 200000, 2, 2, NOW()),
  ('Signalisation manquante', 'Panneau absent', 99, -18.9000, 47.5300, 5, 10000, 3, 1, NOW()),
  ('Dégradation chaussée', 'Fissures importantes', 1, -18.8950, 47.5150, 20, 80000, 1, 3, NOW()),
  ('Travaux terminés', 'Réfection complète', 99, -18.8850, 47.5250, 100, 500000, 2, 1, NOW()),
  ('Route barrée', 'Travaux en cours, accès interdit', 11, -18.8800, 47.5100, 30, 120000, 3, 3, NOW());

-- =========================
-- Historique des statuts de signalement
-- =========================
INSERT INTO signalement_historique (id_signalement, ancien_statut, nouveau_statut, date_changement, id_utilisateur)
VALUES
  (1, 1, 11, NOW() - INTERVAL '2 days', 1),
  (2, 11, 99, NOW() - INTERVAL '1 day', 1),
  (3, 1, 99, NOW(), 1);

-- =========================
-- Sessions
-- =========================
INSERT INTO sessions (id_utilisateur, token_jwt, expiration, date_creation)
VALUES
  (1, 'jwt_token_manager', NOW() + INTERVAL '1 day', NOW()),
  (2, 'jwt_token_user1', NOW() + INTERVAL '1 day', NOW());

-- =========================
-- Vues pour les signalements
-- =========================

DROP VIEW IF EXISTS vue_infos_signalement;
CREATE OR REPLACE VIEW vue_infos_signalement AS
SELECT
  s.id,
  s.titre,
  s.description,
  s.statut,
  s.latitude,
  s.longitude,
  s.surface_m2,
  s.budget,
  e.id AS id_entreprise,
  e.nom AS entreprise,
  e.adresse AS entreprise_adresse,
  e.contact AS entreprise_contact,
  u.id AS id_utilisateur,
  u.nom AS utilisateur_nom,
  u.prenom AS utilisateur_prenom,
  u.email AS utilisateur_email,
  s.date_creation
FROM signalements s
LEFT JOIN entreprises e ON s.id_entreprise = e.id
LEFT JOIN utilisateurs u ON s.id_utilisateur = u.id;

DROP VIEW IF EXISTS vue_recapitulatif_signalement;
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




INSERT INTO signalements (titre, description, statut, latitude, longitude, surface_m2, budget, id_entreprise, id_utilisateur, date_creation)
VALUES
  ('Lavaka', 'Trou be Manakambs', 1, -18.8792, 47.5079, 10, 50000, 1, 2, NOW());