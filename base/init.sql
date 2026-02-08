docker cp base/base.sql postgres_local:/tmp/base.sql
docker cp base/base_donnees.sql postgres_local:/tmp/base_donnees.sql
docker exec -it postgres_local psql -U postgres -f /tmp/base.sql
docker exec -it postgres_local psql -U postgres -d projetcloud -f /tmp/base_donnees.sql
