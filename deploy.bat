@echo off

call npm install
if errorlevel 1 (
    echo npm install failed!
    exit /b 1
)

call npm run build
if errorlevel 1 (
    echo npm build failed!
    exit /b 1
)

echo Deploying to: kodidash
robocopy /MIR "dist" "C:\mnt\kodidash\home\appdata\nginx\www" /xd ".git"

echo Deploying to: dash.bossanova808.net
robocopy /MIR "dist" "C:\mnt\bossanova808-public-hs14\home\appdata\nginx\www" /xd ".git"


