# Application mobile — Résumé et instructions

Ce document résume le fonctionnement de l'application mobile située dans `mobile/app` et fournit les étapes pour la développer, la compiler et l'exécuter sur Android.

**Résumé**
- **Frameworks**: Ionic + Vue 3 (composition API) pour l'UI.
- **Capacitor**: utilisé pour produire l'application native Android (dossier `android/`).
- **Fonctionnalités principales**: navigation via `vue-router`, pages: login, map, report, profil, etc.; utilisation de **Leaflet** pour la cartographie; **Firebase** pour l'authentification; **axios** pour appels API.
- **Build web**: Vite (webDir configuré dans `capacitor.config.ts` = `dist`).

**Fichiers clés**
- `package.json` — scripts et dépendances (Ionic, Capacitor, Vue, Firebase, Leaflet).
- `capacitor.config.ts` — `webDir: 'dist'` (résultat de `npm run build`).
- `src/main.ts`, `src/router/` — point d'entrée et routes.
- `src/services/` — services réseau et auth (utilise Firebase).
- `android/` — projet Android natif (Gradle) généré par Capacitor.

**Pré-requis (environnement)**
- Node.js + npm (ou pnpm/yarn).
- Java JDK (le projet Android référence Java 21 dans `android/gradle.properties`).
- Android SDK (platforms et build-tools adaptés à `compileSdkVersion` 36).
- Android Studio (recommandé) ou `gradle` en ligne de commande.
- Variables d'environnement utiles: `ANDROID_SDK_ROOT` (ou `ANDROID_HOME`) et `PATH` incl. `platform-tools` (adb).

**Développement (hot-reload)**
1. Installer les dépendances (depuis `mobile/app`):

```bash
cd mobile/app
npm install
```

2. Lancer le serveur de développement Vite (web):

```bash
npm run dev
```

3. Pour tester sur appareil/émulateur natif pendant le développement, utiliser Capacitor (optionnelle live reload via `ionic cap run` ou méthodes similaires):

```bash
# synchroniser les assets web vers le projet natif
npx cap sync android

# ouvrir Android Studio
npx cap open android

# ou lancer directement (si configuré)
npx cap run android
```

Remarque: `npx cap run android` dépend de l'installation et configuration d'Android SDK/émulateur. L'ouverture via Android Studio permet de gérer les AVD et le débogage plus facilement.

**Production — construire l'APK/AAB**
1. Construire les assets web:

```bash
cd mobile/app
npm run build
```

2. Synchroniser le dossier `dist` avec le projet Android:

```bash
npx cap sync android
```

3. Ouvrir le projet Android et construire depuis Android Studio (recommandé):

- `Open an existing Android Studio project` → ouvrir `mobile/app/android` → Build > Build Bundle(s) / APK(s) > Build APK(s) ou Generate Signed Bundle / APK...

ou en ligne de commande (Windows) depuis `mobile/app/android`:

```bash
# assemble debug
./gradlew.bat assembleDebug

# assemble release (prérequis: config signingConfigs dans gradle)
./gradlew.bat assembleRelease
```

4. Le binaire (APK/AAB) généré se trouve dans `mobile/app/android/app/build/outputs/`.

**Notifications Firebase / google-services.json**
- Le build Android applique le plugin `com.google.gms.google-services` uniquement si un fichier `google-services.json` est présent dans `mobile/app/android/app/`.
- Si vous utilisez Firebase (auth déjà présent côté web), placez `google-services.json` dans `mobile/app/android/app/` pour activer les services natifs (ex: push).

**Notes et conseils**
- Le projet utilise `@capacitor/android` v8.x et `@capacitor/cli` v8.x; vérifiez la compatibilité si vous mettez à jour Capacitor.
- `capacitor.config.ts` définit `webDir: 'dist'` — ne pas oublier `npm run build` avant `npx cap sync`.
- Java 21 est référencé dans `android/gradle.properties` (clé `org.gradle.java.home`). Assurez-vous que le JDK spécifié est installé, ou adaptez la configuration Gradle.
- Pour déboguer: utilisez Android Studio, connectez un appareil via USB (adb) ou lancez un AVD.

**Commandes utiles récapitulées**

```bash
# depuis mobile/app
npm install
npm run dev            # development web
npm run build          # build web (dist)
npx cap sync android   # synchroniser vers Android
npx cap open android   # ouvrir Android Studio
npx cap run android    # (essayer) lancer sur appareil/emulateur

# depuis mobile/app/android
./gradlew.bat assembleDebug   # build debug (Windows)
./gradlew.bat assembleRelease # build release (Windows)
```

**Prochaines étapes possibles**
- Si vous voulez, je peux lancer une compilation debug locale (j'ai besoin que vous confirmiez l'installation du SDK/JDK et si vous souhaitez que j'exécute les commandes). 
- Je peux aussi générer une checklist pour la release (signing, versionCode, versionName, ProGuard).

---
Fichier source explorés: `capacitor.config.ts`, `package.json`, `src/` (Ionic + Vue), `android/` (Gradle). Pour détails supplémentaires, demandez une explication d'une section spécifique ou que j'exécute les étapes de build.
