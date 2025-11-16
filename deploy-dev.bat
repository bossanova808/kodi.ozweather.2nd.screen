@echo off
call deploy-common.bat
if errorlevel 1 exit /b 1

echo Deploying to: dashdev.bossanova808.net
robocopy /MIR "dist" "C:\mnt\bossanova808-public-hs14\home\appdata\nginx-dev\www" /xd ".git"
if errorlevel 8 (
    echo Robocopy to dashdev.bossanova808.net failed!
    exit /b 1
)
