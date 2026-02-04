@echo off
echo ================================
echo    Setup du projet mobile
echo ================================
echo.

:: Fix JAVA_HOME pour utiliser le JDK d'Android Studio (evite les erreurs Gradle)
set "JAVA_HOME=C:\Program Files\Android\Android Studio\jbr"
set "PATH=%JAVA_HOME%\bin;%PATH%"
echo Utilisation de JAVA_HOME : %JAVA_HOME%
echo.

cd app

echo [1/9] Installation de Ionic CLI...
call npm install -g @ionic/cli
if %errorlevel% neq 0 (
    echo ATTENTION: Installation Ionic CLI echouee, on continue...
)

echo.
echo [2/9] Installation des dependances npm...
call npm install
if %errorlevel% neq 0 (
    echo ERREUR: npm install a echoue.
    pause
    exit /b 1
)

echo.
echo [3/9] Installation des dependances essentielles...
call npm install leaflet vue-leaflet axios
call npm install @capacitor/core @capacitor/cli
call npm install @capacitor/android @capacitor/geolocation
if %errorlevel% neq 0 (
    echo ERREUR: Installation des dependances echouee.
    pause
    exit /b 1
)

echo.
echo [4/9] Build du projet...
call npm run build
if %errorlevel% neq 0 (
    echo ERREUR: npm run build a echoue.
    pause
    exit /b 1
)

echo.
echo [5/9] Generation du dossier android...
call npx cap add android
if %errorlevel% neq 0 (
    echo Le dossier android existe deja, synchronisation...
)

echo.
echo [6/9] Synchronisation avec Android...
call npx cap sync android
if %errorlevel% neq 0 (
    echo ERREUR: cap sync a echoue.
    pause
    exit /b 1
)

echo.
echo [7/9] Nettoyage du build Android...
cd android
call gradlew clean
cd ..
if %errorlevel% neq 0 (
    echo ATTENTION: Nettoyage Gradle a echoue, on continue...
)

echo.
echo [8/9] Correction de l'horloge de l'emulateur...
for /f %%a in ('powershell -command "Get-Date -Format 'MMddHHmmyyyy.ss'"') do set DATETIME=%%a
adb shell su -c "date %DATETIME%"
if %errorlevel% neq 0 (
    echo ATTENTION: Correction horloge echouee (emulateur non demarre?), on continue...
)

echo.
echo [9/9] Generation des icones...
call npm install @capacitor/assets --save-dev
call npx @capacitor/assets generate --android
if %errorlevel% neq 0 (
    echo ATTENTION: Generation des icones echouee, on continue...
)

echo.
echo ================================
echo    Setup termine avec succes!
echo ================================
echo.
echo NOTE - Si vous avez un probleme DNS sur l'emulateur :
echo   1. Ouvrez Extended Controls (les 3 points ...)
echo   2. Allez dans Settings, puis Proxy
echo   3. Desactivez le proxy si active
echo.


cd ..

