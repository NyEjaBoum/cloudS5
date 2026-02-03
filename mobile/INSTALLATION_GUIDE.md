# Guide d'installation Ionic avec Android Studio

## Installation de l'Ionic CLI

```bash
npm install -g @ionic/cli
```

## Vérifications préalables

```bash
node --version           # Doit afficher v18+
npm --version            # Doit afficher 9+
ionic --version          # Doit afficher 7+
java --version           # Doit afficher Java 17+
```

## Installation des dépendances essentielles

```bash
npm install leaflet vue-leaflet axios
npm install @capacitor/core @capacitor/cli
npm install @capacitor/android @capacitor/geolocation
```

## Configuration Android

```bash
ionic build
npx cap add android
npx cap sync
npx cap open android
```

## Dans Android Studio

- Créer un AVD : Tools → AVD Manager → Create Virtual Device
- Device : Pixel 6

## Vérification de la configuration

```bash
npx cap doctor
```

## Configuration Android Studio & SDK

### Étape 1 : Installation d'Android Studio

- Installer avec les options par défaut
- Important : Cocher "Android Virtual Device (AVD)" pendant l'installation

### Étape 2 : Configuration du SDK

- Lancer Android Studio pour la première fois
- Suivre le setup wizard :
  - Choisir "Standard" installation
  - Sélectionner le thème (Dark/Light)
  - Laisser télécharger les composants SDK
- Vérifier l'installation du SDK :

```bash
echo %ANDROID_HOME%
# Devrait afficher : C:\Users\<ton_user>\AppData\Local\Android\Sdk
```

- Si ANDROID_HOME n'est pas défini :

#### Pour Windows (CMD)

```cmd
setx ANDROID_HOME "C:\Users\<ton_user>\AppData\Local\Android\Sdk"
setx PATH "%PATH%;%ANDROID_HOME%\tools;%ANDROID_HOME%\platform-tools"
```

#### Pour Windows (PowerShell)

```powershell
[Environment]::SetEnvironmentVariable("ANDROID_HOME", "C:\Users\<ton_user>\AppData\Local\Android\Sdk", "User")
[Environment]::SetEnvironmentVariable("Path", "$env:Path;$env:ANDROID_HOME\tools;$env:ANDROID_HOME\platform-tools", "User")
```

### Étape 3 : Installation des SDK requis

Dans Android Studio :

- Ouvrir SDK Manager :
  - File → Settings → Appearance & Behavior → System Settings → Android SDK
  - Ou : Tools → SDK Manager
- Installer les SDK Platform :
  - Android 14 (API 34)
- Cliquer sur "Show Package Details" et cocher :
  - Android SDK Platform 33/34
  - Sources for Android 33/34
- Installer les SDK Tools :
  - Android SDK Build-Tools 34.0.0
  - Android SDK Command-line Tools
  - Android Emulator
  - Android SDK Platform-Tools
  - Intel x86 Emulator Accelerator (HAXM installer) - Pour Windows
  - Google Play services
- Cliquer sur "Apply" et attendre le téléchargement

### Étape 4 : Création de l'AVD (Android Virtual Device)

- Ouvrir AVD Manager :
  - Tools → AVD Manager
  - Ou : bouton "AVD Manager" dans la barre d'outils
- Créer un nouveau device :
  - Cliquer sur "+ Create Virtual Device"
  - Category : Phone
  - Device : Pixel 6
  - Cliquer "Next"
- Choisir une System Image :
  - Release Name : Android 14.0 (API 34)
  - ABI : x86_64 (pour performance) ou arm64-v8a (compatibilité)
  - Target : Android API 33/34
  - Si l'image n'est pas installée, cliquer sur "Download"
  - Cliquer "Next"
  - Cliquer "Finish"

## Vérifications finales

### Vérifier que tout est configuré

```bash
npx cap doctor
```

### Résultat attendu

- Latest Dependencies
- Android Studio installed
- Android SDK installed
- Java installed
- Connected device (si émulateur démarré)
