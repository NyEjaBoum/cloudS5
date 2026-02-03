# 🔍 Diagnostic : Données Firestore non affichées

## 📋 Étapes de diagnostic ajoutées

J'ai ajouté des logs de debug détaillés pour identifier pourquoi les données ne s'affichent pas.

### 🛠️ Fonctionnalités de debug ajoutées :

#### 1. **Logs détaillés dans le service Firestore**
- ✅ Connexion à Firestore
- ✅ Nombre de documents récupérés
- ✅ Contenu de chaque document
- ✅ Vérification des coordonnées

#### 2. **Logs dans MapPage**
- ✅ Processus de chargement complet
- ✅ Filtrage géographique
- ✅ Validation des coordonnées
- ✅ Ajout des marqueurs

#### 3. **Bouton de debug** 🟡
Un bouton jaune (⚠️) a été ajouté en haut à droite pour :
- Tester manuellement la connexion Firestore
- Créer automatiquement des données de test
- Recharger les signalements

#### 4. **Création automatique de données de test**
Si la base est vide, 5 signalements de test sont créés automatiquement :
- 3 sur des routes nationales (RN1, RN2, RN4)  
- 2 sur des routes locales
- Tous situés dans Antananarivo

---

## 🚀 Comment diagnostiquer :

### Étape 1 : Ouvrir la console du navigateur
1. **Ouvrir** : `http://localhost:5173/map`
2. **F12** → Onglet **Console**
3. **Regarder** les logs qui commencent par :
   - `🔍 [DEBUG]` - Service Firestore
   - `🚀 [MAP]` - MapPage
   - `🗺️ [MARKERS]` - Marqueurs

### Étape 2 : Analyser les logs
Chercher ces messages dans l'ordre :

```
🔍 [DEBUG] Tentative de connexion à Firestore...
🔍 [DEBUG] Collection: signalements
🔍 [DEBUG] Exécution de la requête Firestore...
🔍 [DEBUG] Snapshot reçu. Nombre de documents: X
```

**Si vous voyez :**
- `Nombre de documents: 0` → Base vide ✅ Données de test seront créées
- `Erreur récupération signalements` → Problème de connexion ❌
- `Coordonnées manquantes` → Données mal formatées ❌

### Étape 3 : Utiliser le bouton de debug
1. **Cliquer** sur le bouton jaune ⚠️ (haut droite)
2. **Regarder** la console pour les logs `🔧 [DEBUG]`
3. **Attendre** la création automatique des données

---

## 📊 Résultats attendus

### ✅ Si tout fonctionne :
```
🔍 [DEBUG] Snapshot reçu. Nombre de documents: 5
📊 [MAP] 5 signalements reçus  
✅ [MAP] 5 signalements valides pour Antananarivo
📍 [MARKERS] 5 marqueurs ajoutés sur la carte
```

### ❌ Si problème de connexion :
```
❌ [ERROR] Erreur récupération signalements Firestore: [détail erreur]
```

### ⚠️ Si base vide :
```
⚠️ [WARNING] Aucun document trouvé dans la collection signalements
📝 [MAP] Aucun signalement trouvé, création de données de test...
🧪 [TEST] Création de données de test...
```

---

## 🔧 Solutions selon le problème

### **Problème 1 : Base de données vide**
- ✅ **Automatique** : Les données de test se créent seules
- 🔄 **Manuel** : Cliquer sur le bouton debug ⚠️

### **Problème 2 : Erreur de connexion Firebase** 
Vérifier dans [firebase.config.ts](app/src/config/firebase.config.ts) :
```typescript
const firebaseConfig = {
  apiKey: "AIzaSyD2ZWSrx8W7SklEO2DaSgMWQVSnmD27zX8",
  projectId: "mapeo-23bbc", // ← Vérifier que c'est correct
  // ...
};
```

### **Problème 3 : Données mal formatées**
Les données doivent avoir cette structure :
```json
{
  "title": "Titre du signalement",
  "description": "Description...", 
  "location": {
    "lat": -18.8792,
    "lng": 47.5079
  },
  "category": "infrastructure",
  "status": "pending",
  "createdAt": "2026-02-03T10:00:00Z"
}
```

### **Problème 4 : Coordonnées hors zone**
Les signalements doivent être dans Antananarivo :
- **Latitude** : entre -19.1 et -18.7
- **Longitude** : entre 47.3 et 47.7

---

## 📱 Après le diagnostic

Une fois le problème identifié :

1. **Si données de test créées** → Vous devriez voir 5 marqueurs sur la carte
2. **Tester le filtre** "Routes Nationales" → 3 marqueurs rouges visibles
3. **Vérifier les popups** → Cliquer sur un marqueur pour voir les détails

Les marqueurs des routes nationales (RN1, RN2, RN4) apparaîtront en **rouge** avec un badge **"RN"** et une animation de pulsation.

---

## 🆘 Si le problème persiste

Partager ces informations :
1. **Logs de la console** (copies des messages d'erreur)
2. **Configuration Firebase** (sans les clés secrètes)
3. **Structure des données** dans Firestore Console

Le système est maintenant équipé pour diagnostiquer automatiquement le problème ! 🔧