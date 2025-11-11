@echo off

call npm install
call npm run build

echo "Deploying to: adelaide-services"
robocopy /MIR "dist" "C:\mnt\adelaide-services\home\docker\config\nginx\www" /xd ".git"

