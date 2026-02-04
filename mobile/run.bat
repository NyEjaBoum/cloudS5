@echo off
echo ================================
echo    Build et lancement mobile
echo ================================
echo.

:: Fix JAVA_HOME pour utiliser le JDK d'Android Studio
set "JAVA_HOME=C:\Program Files\Android\Android Studio\jbr"
set "PATH=%JAVA_HOME%\bin;%PATH%"

cd app

echo [1/3] Build du projet...
call npm run build
if %errorlevel% neq 0 (
    echo ERREUR: npm run build a echoue.
    pause
    exit /b 1
)

echo.
echo [2/3] Synchronisation avec Android...
call npx cap sync android
if %errorlevel% neq 0 (
    echo ERREUR: cap sync a echoue.
    pause
    exit /b 1
)

echo.
echo [3/3] Lancement sur l'appareil Android...
call npx cap run android
if %errorlevel% neq 0 (
    echo ERREUR: cap run a echoue.
    pause
    exit /b 1
)

echo.
echo ================================
echo    Lancement termine!
echo ================================

cd ..

