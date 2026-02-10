@echo off
echo ================================
echo   Lancement mobile dans le WEB
echo ================================
echo.

cd app

echo [INFO] Demarrage du serveur de developpement...
echo [INFO] L'application sera accessible dans votre navigateur
echo [INFO] URL: http://localhost:5173
echo.
echo Appuyez sur Ctrl+C pour arreter le serveur
echo.

call npm run dev

cd ..
