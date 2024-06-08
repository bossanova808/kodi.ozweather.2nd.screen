@echo off

call npm install
call npm run build

echo "Deploying to: homeserver3"
robocopy /MIR "E:\Git\Dashboard\kodi.ozweather.2nd.screen\dist" "C:\mnt\homeserver3\home\docker\config\nginx\www"

echo "Deploying to: bossanova808.net"
robocopy /MIR "E:\Git\Dashboard\kodi.ozweather.2nd.screen\dist" "C:\mnt\bossanova808\home\docker\config\swag\www\dash.bossanova808.net"

echo "Deploying to: adelaideserver"
robocopy /MIR "E:\Git\Dashboard\kodi.ozweather.2nd.screen\dist" "C:\mnt\adelaideserver\home\docker\config\nginx\www"
