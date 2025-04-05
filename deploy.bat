@echo off

call npm install
call npm run build

echo "Deploying to: homeserver3"
robocopy /MIR "dist" "C:\mnt\homeserver3\home\docker\config\nginx\www" /xd ".git"

echo "Deploying to: bossanova808.net"
robocopy /MIR "dist" "C:\mnt\bossanova808\home\docker\config\swag\www\dash.bossanova808.net" /xd ".git"

rem echo "Deploying to: adelaideserver"
rem robocopy /MIR "dist" "C:\mnt\adelaideserver\home\docker\config\nginx\www" /xd ".git"

