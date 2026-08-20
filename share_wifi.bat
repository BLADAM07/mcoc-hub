@echo off
title MCOC Master Hub Local WiFi Server
echo Starting Server...
powershell -ExecutionPolicy Bypass -File "%~dp0server.ps1"
pause