@echo off

call npm install
call npm run build

echo "Deploying to: adelaide-services"
robocopy /MIR "dist" "C:\mnt\adelaide-services\home\appdata\nginx\www" /xd ".git"

