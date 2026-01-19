-- Rôles
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

-- Utilisateurs
INSERT INTO utilisateurs (email, mot_de_passe, nom_complet, role_id, tentatives_echouees, compte_bloque, date_creation)
VALUES
  ('visiteur@example.com', '$2a$10$hash1', 'Visiteur Test', 1, 0, FALSE, NOW()),
  ('user1@example.com', '$2a$10$hash2', 'Utilisateur Un', 2, 0, FALSE, NOW()),
  ('user2@example.com', '$2a$10$hash3', 'Utilisateur Deux', 2, 2, TRUE, NOW()),
  ('manager@example.com', '$2a$10$hash4', 'Manager Test', 3, 0, FALSE, NOW());

-- Signalements
INSERT INTO signalements (titre, description, statut, latitude, longitude, surface_m2, budget, entreprise, id_utilisateur, date_creation)
VALUES
  ('Nid de poule', 'Trou sur la route principale', 'NOUVEAU', -18.8792, 47.5079, 10, 50000, 'Entreprise A', 2, NOW()),
  ('Route inondée', 'Inondation après pluie', 'EN_COURS', -18.9100, 47.5200, 50, 200000, 'Entreprise B', 2, NOW()),
  ('Signalisation manquante', 'Panneau absent', 'TERMINE', -18.9000, 47.5300, 5, 10000, 'Entreprise C', 4, NOW());

-- Historique des statuts de signalement
INSERT INTO signalement_historique (id_signalement, ancien_statut, nouveau_statut, date_changement, id_utilisateur)
VALUES
  (1, 'NOUVEAU', 'EN_COURS', NOW() - INTERVAL '2 days', 4),
  (2, 'EN_COURS', 'TERMINE', NOW() - INTERVAL '1 day', 4),
  (3, 'NOUVEAU', 'TERMINE', NOW(), 4);

-- Sessions
INSERT INTO sessions (id_utilisateur, token_jwt, expiration, date_creation)
VALUES
  (2, 'jwt_token_user1', NOW() + INTERVAL '1 day', NOW()),
  (4, 'jwt_token_manager', NOW() + INTERVAL '1 day', NOW());