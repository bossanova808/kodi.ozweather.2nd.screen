@echo off
call npm install
if errorlevel 1 (
    echo npm install failed!
    exit /b 1
)

call npm run build
if errorlevel 1 (
    echo npm build failed!
    exit /b 1
)
