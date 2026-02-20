@echo off
echo Building React Application off Google Drive...
echo 1. Clearing old build...
if exist "g:\Mi unidad\analisis examenes 2026\dashboard\dist" rmdir /s /q "g:\Mi unidad\analisis examenes 2026\dashboard\dist"

echo 2. Syncing source files to local temp folder...
if not exist "C:\Users\ricar\.gemini\tmp\tmpapp" (
    echo Error: local tmpapp does not exist. Run initial setup first.
    exit /b 1
)
xcopy /E /Y /I "g:\Mi unidad\analisis examenes 2026\dashboard\src" "C:\Users\ricar\.gemini\tmp\tmpapp\src"
xcopy /E /Y /I "g:\Mi unidad\analisis examenes 2026\dashboard\public" "C:\Users\ricar\.gemini\tmp\tmpapp\public"
copy /Y "g:\Mi unidad\analisis examenes 2026\dashboard\index.html" "C:\Users\ricar\.gemini\tmp\tmpapp\index.html"

echo 3. Building project via NPM...
cd /d "C:\Users\ricar\.gemini\tmp\tmpapp"
call npm run build

echo 4. Copying distribution bundle to Dashboard...
xcopy /E /Y /I "dist" "g:\Mi unidad\analisis examenes 2026\dashboard\dist"

echo Build Complete.
cd /d "g:\Mi unidad\analisis examenes 2026\dashboard"
