@echo off
call deploy-common.bat
if errorlevel 1 exit /b 1

echo Deploying to: adelaide-services
robocopy /MIR "dist" "C:\mnt\adelaide-services\home\appdata\nginx\www" /xd ".git"
if errorlevel 8 (
    echo Robocopy to dash.bossanova808.net failed!
    exit /b 1
)
