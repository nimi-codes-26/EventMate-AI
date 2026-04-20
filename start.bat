@echo off
echo Initializing EventMate AI Development Server...
echo Make sure you don't close this window!
set PATH=%~dp0.node\node-v20.11.1-win-x64;%PATH%
.\.node\node-v20.11.1-win-x64\npm.cmd run dev
pause
