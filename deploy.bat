@echo off

call npm install
call npm run build
robocopy "E:\Git\Kodi\dash.vite.alpine.tailwind\dist" "\\homeserver3\Docker\config\swag\vhosts\deploy.kodidash" /MIR /XD "E:\Git\Kodi\dash.vite.alpine.tailwind\dist\.git"
