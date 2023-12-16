@echo off

call npm install
call npm run build
robocopy "E:\Git\Dashboard\kodi.ozweather.2nd.screen\dist" "\\homeserver3\Docker\config\swag\vhosts" /MIR /XD "E:\Git\Kodi\dash.vite.alpine.tailwind\dist\.git"