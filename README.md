# Product Management — Project Report

Project report and runbook for the Product Management multi-container application used in IT460.

## Table of Contents
- Abstract
- Architecture & Components
- Quick Start (Run locally)
- Verification & Testing
- API Reference
- Database Schema & Seed Data
- Deployment (Docker Compose / OpenShift)
- File Inventory
- Development & Debugging notes
- Security & Production considerations
- Change log

## Abstract
This repository demonstrates a microservices-style Product Management application composed of three containers: a React frontend served by Nginx, a Node.js/Express backend API, and a PostgreSQL database. The goal is to provide a reproducible, documented example for containerization, orchestration, health checks, and OpenShift readiness.

## Architecture & Components

High level:

Frontend (Nginx) → Backend API (Express) → Database (PostgreSQL)

- Frontend: React application compiled into static assets, served by Nginx. Routes under `/api/*` are proxied to the backend.
- Backend: Express server exposing REST endpoints under `/api`, connects to PostgreSQL using environment variables.
- Database: PostgreSQL 15 (Alpine) with an initialization SQL script that seeds sample products.

Design goals:
- Clear separation of concerns, container-per-process, small images (alpine variants), health checks and data persistence via named volumes.

## Quick Start (Run locally)

1. From the project root:

```powershell
cd "c:\Users\user\Desktop\senior\cloud\project cloud"
docker-compose up -d --build
```

2. View services:

```powershell
docker-compose ps
```

3. Open the app: http://localhost

4. API health: http://localhost:5000/health

## Verification & Testing

- Check containers and health: `docker-compose ps` and `docker-compose logs -f`.
- Test API endpoints from host:

```powershell
Invoke-WebRequest -Uri "http://localhost:5000/api/products" -UseBasicParsing
Invoke-WebRequest -Uri "http://localhost:5000/api/products/1" -UseBasicParsing
```

- Browser testing: open http://localhost, inspect DevTools Console for network or JavaScript errors.

## API Reference

GET /api/products — returns all products (JSON array)

GET /api/products/:id — returns a single product object

GET /health — returns { "status": "Backend API is running" }

Responses include `id`, `name`, `description`, `price` (numeric), `image_url`, `created_at`, `updated_at`.

## Database Schema & Seed Data

The schema is defined in `database/init.sql` and includes the `products` table with columns:
- `id` SERIAL PRIMARY KEY
- `name` VARCHAR
- `description` TEXT
- `price` DECIMAL(10,2)
- `image_url` VARCHAR(512)
- `created_at`, `updated_at` TIMESTAMP

The initialization script seeds 8 example products with `image_url` fields pointing to sample images.

To inspect the data from the host:

```powershell
docker exec -it product-database psql -U postgres -d productdb -c "SELECT * FROM products;"
```

## Deployment

Docker Compose (local): `docker-compose up -d --build`

OpenShift: manifests and instructions are provided in `openshift-deployment.yaml` and `OPENSHIFT_DEPLOYMENT.md` for converting the deployment to OpenShift resources (DeploymentConfigs, Services, Routes, PVCs).

## File Inventory

- `frontend/` — React app, build and `nginx.conf` for proxying `/api` to backend.
- `backend/` — Express server `server.js`, `.env.example`, `package.json`.
- `database/init.sql` — schema and seed data.
- `docker-compose.yaml` — orchestration for local development.
- `openshift-deployment.yaml`, `OPENSHIFT_DEPLOYMENT.md` — OpenShift resources and guide.

## Development & Debugging notes

- Common checks:
  - `docker-compose logs -f backend` — view backend logs
  - `docker-compose logs -f frontend` — view Nginx access and static asset errors
  - Browser DevTools Console for JS/runtime errors

- Known fixes applied in this repo:
  - convert `price` from string to numeric in backend before sending JSON to frontend
  - use relative `/api` paths in frontend and let Nginx proxy to backend inside containers

## Security & Production considerations

- Do not use default DB credentials in production; inject secrets via environment variables or a secrets manager.
- Enable TLS on the frontend (reverse proxy) in production; terminate TLS at ingress.
- Implement authentication for API endpoints before exposing to untrusted networks.

## Change Log

- 2026-01-08 — Initial project scaffolding and containers
- 2026-01-08 — Fixed backend price type conversion and frontend API URL handling
- 2026-01-09 — Added product images and improved README project report

---

If you'd like, I can also:
- Generate a concise PDF project report based on this README
- Add per-section links and anchors for faster navigation
- Create a `VERIFICATION.md` with step-by-step acceptance tests

Please review and tell me any sections you'd like expanded or modified.
