@echo off

call npm install
call npm run build

echo "Deploying to: kodidash"
robocopy /MIR "dist" "C:\mnt\kodidash\home\appdata\nginx\www" /xd ".git"

echo "Deploying to: bossanova808.net"
robocopy /MIR "dist" "C:\mnt\bossanova808-public-hs14\home\appdata\nginx\www" /xd ".git"

rem echo "Deploying to: adelaide-services"
rem robocopy /MIR "dist" "C:\mnt\adelaide-services\home\docker\config\nginx\www" /xd ".git"

