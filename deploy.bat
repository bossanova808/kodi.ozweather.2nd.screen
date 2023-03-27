@echo off

call npm install
call npm run build
robocopy "C:\Git\Kodi\dash.vite.alpine.tailwind\dist" "\\homeserver3\Docker\config\swag\vhosts\deploy.kodidash" /MIR /XD "C:\Git\Kodi\dash.vite.alpine.tailwind\dist\.git"
