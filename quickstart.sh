#!/bin/bash

# Product Management App - Quick Start Script for Linux/Mac

print_header() {
    echo ""
    echo "========================================"
    echo "Product Management - Multi-Container App"
    echo "========================================"
    echo ""
}

print_help() {
    echo "Usage: ./quickstart.sh [command]"
    echo ""
    echo "Available commands:"
    echo "  up           - Start all services"
    echo "  down         - Stop all services"
    echo "  logs         - View logs from all services"
    echo "  restart      - Restart all services"
    echo "  build        - Build all images"
    echo "  clean        - Remove all containers and volumes"
    echo "  status       - Show status of all services"
    echo "  help         - Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./quickstart.sh up"
    echo "  ./quickstart.sh logs"
    echo "  ./quickstart.sh down"
    echo ""
}

print_header

COMMAND="${1:-help}"

case "$COMMAND" in
    up)
        echo "Starting all services..."
        docker-compose up -d
        echo ""
        echo "✓ Services started successfully!"
        echo ""
        echo "Frontend:  http://localhost"
        echo "Backend:   http://localhost:5000"
        echo "API Docs:  GET http://localhost:5000/api/products"
        echo "Health:    GET http://localhost:5000/health"
        echo ""
        echo "View logs with: ./quickstart.sh logs"
        ;;
    down)
        echo "Stopping all services..."
        docker-compose down
        echo "✓ Services stopped"
        ;;
    logs)
        echo "Showing logs from all services..."
        docker-compose logs -f
        ;;
    restart)
        echo "Restarting all services..."
        docker-compose restart
        echo "✓ Services restarted"
        ;;
    build)
        echo "Building all Docker images..."
        docker-compose build
        echo "✓ Build complete"
        ;;
    clean)
        echo "Removing all containers, volumes, and networks..."
        docker-compose down -v
        echo "✓ Cleanup complete"
        ;;
    status)
        echo "Container status:"
        docker-compose ps
        ;;
    help)
        print_help
        ;;
    *)
        echo "Unknown command: $COMMAND"
        print_help
        exit 1
        ;;
esac

exit 0
