## Tâches pour permettre l'upload de photos de signalement (Cloudinary)

1. Créer un compte Cloudinary et récupérer :
   - cloud_name
   - upload_preset (unsigned)

2. Dans l'app mobile (Ionic + Vue) :
   - Ajouter un bouton "Ajouter photo" dans le formulaire de signalement.
   - Permettre la sélection de plusieurs fichiers (max 5, taille < 5MB).
   - Pour chaque photo sélectionnée :
     - Uploader le fichier sur Cloudinary via l'API REST :
       - Utiliser FormData avec "file" et "upload_preset"
       - POST vers https://api.cloudinary.com/v1_1/{cloud_name}/image/upload
     - Récupérer l'URL publique (secure_url) retournée par Cloudinary.
   - Ajouter les URLs des photos dans le champ `photos` du signalement (Firestore ou lors de l'envoi au backend).

3. Adapter le service de création de signalement (`reportsService.createReport`) pour inclure les URLs des photos dans le champ `photos`.

4. Côté backend :
   - Vérifier que la table `signalement_photo` existe (id, id_signalement, url).
   - Lors de l'import Firebase → PostgreSQL :
     - Pour chaque signalement, lire le champ `photos` (tableau d'URLs).
     - Insérer chaque URL dans la table `signalement_photo` liée au signalement.

5. Côté frontend manager :
   - Afficher les photos dans la page de détails du signalement (`SignalementDetails.jsx`) :
     - Récupérer les URLs via l'API backend.
     - Afficher les images avec `<img src={url} />`.

6. Tester le flux complet :
   - Prendre une photo sur mobile, créer un signalement, vérifier l'upload sur Cloudinary.
   - Vérifier la synchronisation backend et l'affichage des photos dans le dashboard manager.

7. Bonus :
   - Gérer la suppression de photo (optionnel).
   - Afficher un message d'erreur si l'upload échoue ou si le fichier est trop volumineux.