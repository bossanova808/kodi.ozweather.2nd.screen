@echo off

call npm install
call npm run build

echo Deploying to: kodidash
robocopy /MIR "dist" "C:\mnt\kodidash\home\appdata\nginx\www" /xd ".git"

echo Deploying to: dash.bossanova808.net
robocopy /MIR "dist" "C:\mnt\bossanova808-public-hs14\home\appdata\nginx\www" /xd ".git"


