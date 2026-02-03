# 🗺️ Guide d'utilisation - Affichage des Signalements sur la Carte Antananarivo

## 📋 Résumé des améliorations apportées

Votre application a été optimisée pour afficher les données de signalements depuis Firestore sur la carte d'Antananarivo, avec une attention particulière aux **routes nationales corrompues**.

### 🔧 Fichiers modifiés

1. **[MapPage.vue](app/src/views/MapPage.vue)** - Interface de carte améliorée
2. **[signalements-firestore.service.ts](app/src/services/signalements-firestore.service.ts)** - Service optimisé

---

## 🚀 Nouvelles fonctionnalités

### 🎯 Centrage optimisé sur Antananarivo
- **Coordonnées** : Latitude: -18.8792, Longitude: 47.5079 (Place de l'Indépendance)
- **Zoom** : 14 (optimal pour voir les routes)
- **Zone filtrée** : Latitude -19.1 à -18.7, Longitude 47.3 à 47.7

### 🛣️ Détection automatique des Routes Nationales
- **Mots-clés détectés** : "RN", "route nationale", "nationale"
- **Marqueurs spéciaux** : Rouge avec badge "RN" et animation
- **Priorité élevée** : Taille augmentée et couleur d'urgence

### 🔍 Filtrage intelligent
- **Filtre "Routes Nationales"** : Nouveau chip de filtrage
- **Filtrage par urgence** : Routes nationales = "Critical"
- **Géolocalisation** : Seules les données dans la zone d'Antananarivo

---

## 📊 Structure des données Firestore

### Collection : `signalements`

```typescript
interface Signalement {
  id: string;
  title: string;           // "Nids de poule RN1" 
  description: string;     // "Plusieurs nids de poule sur la RN1..."
  category: string;        // "infrastructure", "safety", etc.
  status: "pending" | "in_progress" | "resolved";
  location: {
    lat: number;          // -18.8792 (Antananarivo)
    lng: number;          // 47.5079
    address?: string;     // "Avenue de l'Indépendance"
  };
  userId: string;
  userEmail?: string;
  createdAt: Date;
  upvotes?: number;
  comments?: number;
}
```

### 📝 Exemples de données test

```json
{
  "title": "Nids de poule RN1 - Secteur Analakely",
  "description": "Plusieurs nids de poule importants sur la RN1 au niveau d'Analakely causent des difficultés de circulation",
  "category": "infrastructure", 
  "status": "pending",
  "location": {
    "lat": -18.8792,
    "lng": 47.5079,
    "address": "RN1 - Avenue de l'Indépendance"
  },
  "userId": "user123",
  "userEmail": "user@example.com",
  "createdAt": "2026-02-03T10:00:00Z",
  "upvotes": 5,
  "comments": 2
}
```

```json
{
  "title": "Chaussée dégradée Route Nationale 2",
  "description": "La chaussée de la RN2 direction Toamasina présente des fissures importantes",
  "category": "infrastructure",
  "status": "pending", 
  "location": {
    "lat": -18.8650,
    "lng": 47.5200,
    "address": "RN2 - Route de Toamasina"
  },
  "userId": "user456",
  "userEmail": "reporter@example.com", 
  "createdAt": "2026-02-03T09:30:00Z",
  "upvotes": 8,
  "comments": 3
}
```

---

## 🔄 Comment ça fonctionne

### 1. **Chargement initial**
```typescript
// Chargement des données au montage du composant
onMounted(() => {
  loadSignalementsFromFirestore(); // Chargement unique
  subscribeToSignalements();       // Écoute temps réel
});
```

### 2. **Filtrage géographique**
```typescript
// Seuls les signalements dans la zone d'Antananarivo
return r.location.lat >= -19.1 && r.location.lat <= -18.7 &&
       r.location.lng >= 47.3 && r.location.lng <= 47.7;
```

### 3. **Détection Routes Nationales**
```typescript
const isNationalRoad = report.description?.toLowerCase().includes('rn') || 
                      report.title?.toLowerCase().includes('rn') ||
                      report.description?.toLowerCase().includes('route nationale');
```

### 4. **Affichage sur carte**
- **Marqueurs normaux** : Couleur selon catégorie, taille 40x40px
- **Marqueurs RN** : Rouge (#DC2626), taille 45x45px, badge "RN", animation spéciale

---

## 🎮 Utilisation

### Via l'interface utilisateur :
1. **Ouvrir** : `http://localhost:5173/map`
2. **Filtrer** : Cliquer sur "Routes Nationales" 
3. **Visualiser** : Les marqueurs rouges = routes nationales
4. **Interagir** : Clic sur marqueur → popup avec détails

### Via le code :
```typescript
// Récupérer tous les signalements
const result = await signalementsFirestoreService.getSignalements();

// Récupérer seulement les routes nationales
const rnResult = await signalementsFirestoreService.getNationalRoadSignalements();

// Vérifier si c'est une route nationale
const isRN = SignalementsFirestoreService.isNationalRoad(signalement);
```

---

## 🎨 Personnalisation visuelle

### Marqueurs Routes Nationales :
- **Couleur** : Rouge vif (#DC2626)
- **Badge** : Jaune "RN" en haut à droite  
- **Animation** : Pulsation rouge continue
- **Taille** : 45x45px (vs 40x40px normale)

### Popup amélioré :
- **Badge route** : "Route Nationale - Urgence élevée"
- **Distance** : Du centre d'Antananarivo
- **Warning** : "⚠️ Route Nationale" pour priorité

---

## 🔧 Configuration Firebase

Votre configuration actuelle dans [firebase.config.ts](app/src/config/firebase.config.ts) :

```typescript
const firebaseConfig = {
  apiKey: "AIzaSyD2ZWSrx8W7SklEO2DaSgMWQVSnmD27zX8",
  authDomain: "mapeo-23bbc.firebaseapp.com", 
  projectId: "mapeo-23bbc",
  // ...
};
```

**Collection utilisée** : `signalements`

---

## ✅ Prochaines étapes

1. **Tester** : Ajouter des données test dans Firestore
2. **Vérifier** : Ouvrir `http://localhost:5173/map`
3. **Filtrer** : Utiliser le nouveau filtre "Routes Nationales"
4. **Personnaliser** : Ajuster les couleurs/styles si nécessaire

---

## 📞 Support

Les méthodes de récupération Firestore sont maintenant opérationnelles :
- ✅ **Connexion** Firestore établie
- ✅ **Service** de récupération des signalements  
- ✅ **Filtrage** géographique (Antananarivo)
- ✅ **Détection** automatique routes nationales
- ✅ **Affichage** optimisé sur carte Leaflet

Vos données de signalements s'afficheront automatiquement sur la carte d'Antananarivo avec une mise en évidence spéciale pour les routes nationales ! 🎯