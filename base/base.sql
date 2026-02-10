-- Connexion à la base postgres (base par défaut)
\c postgres

-- Création ou recréation de la base de données
DROP DATABASE IF EXISTS projetcloud;
CREATE DATABASE projetcloud;

-- Connexion à la nouvelle base
\c projetcloud

CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(50) UNIQUE NOT NULL
);

-- =========================
-- Table des actions par rôle (permissions)
-- =========================
CREATE TABLE action_role (
    id SERIAL PRIMARY KEY,
    role_id INT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL
);

-- =========================
-- Table des entreprises
-- =========================
CREATE TABLE entreprises (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(255) UNIQUE NOT NULL,
    adresse VARCHAR(255),
    contact VARCHAR(100)
);

-- =========================
-- Table des utilisateurs
-- =========================
CREATE TABLE utilisateurs (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    mot_de_passe VARCHAR(255),
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    role_id INT REFERENCES roles(id) ON DELETE SET NULL,
    tentatives_echouees INT DEFAULT 0,
    compte_bloque BOOLEAN DEFAULT FALSE,
    date_blocage TIMESTAMP,
    date_creation TIMESTAMP DEFAULT NOW()
);

-- =========================
-- Table des signalements (travaux routiers)
-- =========================
CREATE TABLE signalements (
    id SERIAL PRIMARY KEY,
    titre VARCHAR(255) NOT NULL,
    description TEXT,
    statut INTEGER DEFAULT 1, 
    latitude NUMERIC(9,6) NOT NULL,
    longitude NUMERIC(9,6) NOT NULL,
    surface_m2 NUMERIC(10,2),
    budget NUMERIC(15,2),
    niveau INTEGER CHECK (niveau BETWEEN 1 AND 10), -- ✅ NULL par défaut
    id_entreprise INT REFERENCES entreprises(id) ON DELETE SET NULL,
    id_utilisateur INT NOT NULL REFERENCES utilisateurs(id) ON DELETE CASCADE,
    date_creation TIMESTAMP DEFAULT NOW()
);

CREATE TABLE signalement_photo (
    id SERIAL PRIMARY KEY,
    id_signalement INTEGER REFERENCES signalements(id) ON DELETE CASCADE,
    url TEXT NOT NULL
);

-- =========================
-- Historique des statuts
-- =========================
CREATE TABLE signalement_historique (
    id SERIAL PRIMARY KEY,
    id_signalement INT NOT NULL REFERENCES signalements(id) ON DELETE CASCADE,
    ancien_statut INTEGER NOT NULL,
    nouveau_statut INTEGER NOT NULL,
    date_changement TIMESTAMP DEFAULT NOW(),
    id_utilisateur INT REFERENCES utilisateurs(id)
);

-- =========================
-- Table des sessions (JWT / offline)
-- =========================
CREATE TABLE sessions (
    id SERIAL PRIMARY KEY,
    id_utilisateur INT NOT NULL REFERENCES utilisateurs(id) ON DELETE CASCADE,
    token_jwt VARCHAR(512) NOT NULL,
    expiration TIMESTAMP NOT NULL,
    date_creation TIMESTAMP DEFAULT NOW()
);


CREATE TABLE historique_blocage (
    id SERIAL PRIMARY KEY,
    id_utilisateur INTEGER NOT NULL REFERENCES utilisateurs(id),
    type_action VARCHAR(50) NOT NULL,
    date_action TIMESTAMP NOT NULL,
    raison VARCHAR(255)
);


-- ...existing code...

-- =========================
-- Table du prix forfaitaire global par m²
-- =========================
CREATE TABLE prix_global (
    id SERIAL PRIMARY KEY,
    prix_m2 NUMERIC(10,2) NOT NULL DEFAULT 5000,
    date_modification TIMESTAMP DEFAULT NOW()
);

-- Valeur initiale
INSERT INTO prix_global (prix_m2) VALUES (5000);

-- =========================
-- Historique des modifications du prix par m²
-- =========================
CREATE TABLE historique_prix (
    id SERIAL PRIMARY KEY,
    ancien_prix NUMERIC(10,2) NOT NULL,
    nouveau_prix NUMERIC(10,2) NOT NULL,
    date_modification TIMESTAMP DEFAULT NOW(),
    id_utilisateur INT REFERENCES utilisateurs(id)
);



-- Modifier la table signalements pour ajouter le niveau
-- ALTER TABLE signalements ADD COLUMN niveau INTEGER CHECK (niveau BETWEEN 1 AND 10) DEFAULT 1;
-- ALTER TABLE signalements ALTER COLUMN niveau DROP DEFAULT;
-- ALTER TABLE signalements ALTER COLUMN niveau DROP NOT NULL;
