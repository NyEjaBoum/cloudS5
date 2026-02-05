## Exporter et importer une image Docker

### 1. Exporter l’image Docker

Sur la machine source, exécute :

```sh
docker save -o backend_app.tar backend_app
docker save -o frontend_app.tar frontend_app
docker save -o postgres15.tar postgres:15
docker save -o nginxalpine.tar nginx:alpine