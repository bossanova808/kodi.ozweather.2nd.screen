@echo off

call npm install
call npm run build

echo "Deploying to: dashdev.bossanova808.net"
robocopy /MIR "dist" "C:\mnt\bossanova808-public-hs14\home\appdata\nginx-dev\www" /xd ".git"


