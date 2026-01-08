@echo off
REM Product Management App - Quick Start Script for Windows

echo.
echo ========================================
echo Product Management - Multi-Container App
echo ========================================
echo.

set COMMAND=%1

if "%COMMAND%"=="" (
    echo Usage: quickstart.bat [command]
    echo.
    echo Available commands:
    echo   up           - Start all services
    echo   down         - Stop all services
    echo   logs         - View logs from all services
    echo   restart      - Restart all services
    echo   build        - Build all images
    echo   clean        - Remove all containers and volumes
    echo   status       - Show status of all services
    echo   help         - Show this help message
    echo.
    echo Examples:
    echo   quickstart.bat up
    echo   quickstart.bat logs
    echo   quickstart.bat down
    goto :eof
)

if "%COMMAND%"=="up" (
    echo Starting all services...
    docker-compose up -d
    echo.
    echo ✓ Services started successfully!
    echo.
    echo Frontend:  http://localhost
    echo Backend:   http://localhost:5000
    echo API Docs:  GET http://localhost:5000/api/products
    echo Health:    GET http://localhost:5000/health
    echo.
    echo View logs with: quickstart.bat logs
    goto :eof
)

if "%COMMAND%"=="down" (
    echo Stopping all services...
    docker-compose down
    echo ✓ Services stopped
    goto :eof
)

if "%COMMAND%"=="logs" (
    echo Showing logs from all services...
    docker-compose logs -f
    goto :eof
)

if "%COMMAND%"=="restart" (
    echo Restarting all services...
    docker-compose restart
    echo ✓ Services restarted
    goto :eof
)

if "%COMMAND%"=="build" (
    echo Building all Docker images...
    docker-compose build
    echo ✓ Build complete
    goto :eof
)

if "%COMMAND%"=="clean" (
    echo Removing all containers, volumes, and networks...
    docker-compose down -v
    echo ✓ Cleanup complete
    goto :eof
)

if "%COMMAND%"=="status" (
    echo Container status:
    docker-compose ps
    goto :eof
)

if "%COMMAND%"=="help" (
    call :PrintHelp
    goto :eof
)

echo Unknown command: %COMMAND%
call :PrintHelp
goto :eof

:PrintHelp
echo Usage: quickstart.bat [command]
echo.
echo Available commands:
echo   up           - Start all services
echo   down         - Stop all services
echo   logs         - View logs from all services
echo   restart      - Restart all services
echo   build        - Build all images
echo   clean        - Remove all containers and volumes
echo   status       - Show status of all services
echo   help         - Show this help message
exit /b 0
