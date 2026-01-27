# Importer les données dans PostgreSQL (Docker)

Ce guide explique comment démarrer Postgres via Docker Compose et importer les fichiers SQL situés dans le dossier `base`.

Prérequis
- Docker et Docker Compose installés
- Terminal (Bash/WSL/Git Bash ou PowerShell)

Emplacement du fichier `docker-compose` utilisé : [backend/docker-compose.yml](backend/docker-compose.yml)

1) Démarrer les services (depuis la racine du projet)

```bash
cd backend
docker-compose up -d --build
```

2) Vérifier que Postgres est prêt

Suivre les logs :

```bash
docker logs -f postgres_local
```

Tester la disponibilité (depuis `backend`)

```bash
docker exec -it postgres_local pg_isready -U postgres
# ou
docker exec -it postgres_local psql -U postgres -d projetcloud -c "\l"
```

3) Importer `base_donnees.sql`

Remarque : les fichiers `../base/*.sql` sont déjà montés dans `docker-entrypoint-initdb.d` (voir `backend/docker-compose.yml`) et seront exécutés automatiquement lors de la première initialisation du volume Postgres. Si la base existe déjà, ré-exécution peut provoquer des erreurs de doublons.

- Sous WSL / Git Bash / Linux :

```bash
# depuis backend/
docker exec -i postgres_local psql -U postgres -d projetcloud < ../base/base_donnees.sql
```

- Sous PowerShell (Windows) :

```powershell
# depuis backend/
Get-Content ..\base\base_donnees.sql -Raw | docker exec -i postgres_local psql -U postgres -d projetcloud
```

Si vous souhaitez importer `base/base.sql` aussi, remplacez le chemin par `../base/base.sql`.

4) Vérifier l'import

```bash
docker exec -it postgres_local psql -U postgres -d projetcloud -c "SELECT COUNT(*) FROM signalements;"
docker exec -it postgres_local psql -U postgres -d projetcloud -c "\dt"
```

5) Gestion des erreurs courantes

- Erreurs de doublons / contraintes :
  - Option 1 (réinitialiser proprement la DB) :

```bash
cd backend
docker-compose down -v
docker-compose up -d --build
```

  - Option 2 (import incrémental) : modifier le script SQL pour utiliser `INSERT ... ON CONFLICT` ou ajouter `TRUNCATE table;` au début.

- Si `docker exec` échoue, vérifier que le conteneur `postgres_local` existe :

```bash
docker ps --filter "name=postgres_local"
```

6) Commandes utiles

- Voir les volumes Docker :

```bash
docker volume ls
```

- Supprimer un volume spécifique (attention perte de données) :

```bash
docker volume rm <VOLUME_NAME>
```

- Voir les logs complets du conteneur :

```bash
docker logs postgres_local
```

7) Remarques finales

- Si le `docker-compose` monte déjà `../base/*.sql`, vous n'avez peut-être rien à faire après une première `docker-compose up` (les scripts sont exécutés lors de la création du volume). Si vous retentez l'import manuellement, vérifiez d'abord si les données ne sont pas déjà présentes.
- Les chemins dans ce document sont relatifs au dossier `backend` (où se trouve le `docker-compose.yml`).

Si vous voulez, je peux lancer les commandes d'ici (démarrage + import) et vous retourner les logs/erreurs — dites-moi si vous autorisez l'exécution dans cet environnement.
