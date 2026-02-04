@echo off
echo ================================
echo    Generation de l'APK
echo ================================
echo.

:: Fix JAVA_HOME pour utiliser le JDK d'Android Studio
set "JAVA_HOME=C:\Program Files\Android\Android Studio\jbr"
set "PATH=%JAVA_HOME%\bin;%PATH%"

cd app\android

echo Build de l'APK en cours...
call gradlew assembleDebug
if %errorlevel% neq 0 (
    echo ERREUR: La generation de l'APK a echoue.
    pause
    exit /b 1
)

echo.
echo ================================
echo    APK genere avec succes!
echo    Emplacement : app\android\app\build\outputs\apk\debug\
echo ================================
pause
