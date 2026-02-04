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

-- =========================
-- Rôles
-- =========================
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
  ('admin@gmail.com', 'NUKUms5zgbOo4lX1wqZ9eQ==', 'admin', 'test', 1, 0, FALSE, NOW()),
  ('user1@example.com', 'kr3At1G6G9lKnxnpZFVVkA==', 'Un', 'Utilisateur', 2, 0, FALSE, NOW()),
  ('user2@example.com', 'kr3At1G6G9lKnxnpZFVVkA==', 'Deux', 'Utilisateur', 2, 2, TRUE, NOW()),
  ('user3@example.com', 'kr3At1G6G9lKnxnpZFVVkA==', 'Trois', 'Utilisateur', 2, 0, FALSE, NOW());

-- =========================
-- Signalements (tous statut = 1)
-- =========================
INSERT INTO signalements (titre, description, statut, latitude, longitude, surface_m2, budget, id_entreprise, id_utilisateur, date_creation)
VALUES
  ('Nid de poule', 'Trou sur la route principale', 1, -18.8792, 47.5079, 10, 50000, 1, 2, '2026-02-01'),
  ('Route inondée', 'Inondation après pluie', 1, -18.9100, 47.5200, 50, 200000, 2, 2, '2026-02-02'),
  ('Signalisation manquante', 'Panneau absent', 1, -18.9000, 47.5300, 5, 10000, 3, 1, '2026-02-03'),
  ('Dégradation chaussée', 'Fissures importantes', 1, -18.8950, 47.5150, 20, 80000, 1, 3, '2026-02-04'),
  ('Travaux récents', 'Nouveau chantier', 1, -18.8850, 47.5250, 100, 500000, 2, 1, '2026-02-05'),
  ('Route barrée', 'Travaux en cours, accès interdit', 1, -18.8800, 47.5100, 30, 120000, 3, 3, '2026-02-06'),
  ('lalitra be tsisy jiro', 'Nisotominy fofon kaly matsiro', 1, -96.8792, 27.5079, 10, 1400, 1, 2, '2026-02-07');

-- =========================
-- Historique des statuts de signalement (tous statut 1)
-- =========================
INSERT INTO signalement_historique (id_signalement, ancien_statut, nouveau_statut, date_changement, id_utilisateur)
VALUES
  (1, 1, 1, '2026-02-01 08:00:00', 2),
  (2, 1, 1, '2026-02-02 09:00:00', 2),
  (3, 1, 1, '2026-02-03 10:00:00', 1),
  (4, 1, 1, '2026-02-04 11:00:00', 3),
  (5, 1, 1, '2026-02-05 12:00:00', 1),
  (6, 1, 1, '2026-02-06 13:00:00', 3),
  (7, 1, 1, '2026-02-07 14:00:00', 2);

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

DROP VIEW IF EXISTS vue_stats_delai_moyen;
DROP VIEW IF EXISTS vue_duree_signalement;
DROP VIEW IF EXISTS vue_recapitulatif_signalement;
DROP VIEW IF EXISTS vue_infos_signalement;


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
  s.date_creation,
  CASE
    WHEN s.statut = 1 THEN 0
    WHEN s.statut = 11 THEN 50
    WHEN s.statut = 99 THEN 100
    ELSE 0
  END AS avancement_pourcent
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

-- =========================
-- Vue durée par signalement terminé (aucun résultat)
-- =========================
DROP VIEW IF EXISTS vue_duree_signalement;
CREATE OR REPLACE VIEW vue_duree_signalement AS
SELECT
  s.id,
  s.titre,
  s.date_creation,
  h.date_changement AS date_cloture,
  EXTRACT(EPOCH FROM (h.date_changement - s.date_creation))/86400 AS duree_jours
FROM signalements s
JOIN signalement_historique h
  ON h.id_signalement = s.id
WHERE h.nouveau_statut = 99;

-- =========================
-- Vue statistiques délai moyen (aucun résultat)
-- =========================
DROP VIEW IF EXISTS vue_stats_delai_moyen;
CREATE OR REPLACE VIEW vue_stats_delai_moyen AS
SELECT
  COUNT(*) AS nb_travaux_termines,
  ROUND(AVG(duree_jours), 2) AS delai_moyen_jours
FROM vue_duree_signalement;