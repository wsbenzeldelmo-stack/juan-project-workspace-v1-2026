@echo off
cd /d "%~dp0\.."
echo JUAN PROJECT Workspace
echo Open http://localhost:8080 in your browser.
where py >nul 2>nul
if %errorlevel%==0 (
  py -m http.server 8080 --bind 127.0.0.1
) else (
  python -m http.server 8080 --bind 127.0.0.1
)
