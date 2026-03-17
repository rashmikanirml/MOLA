# MOLA Smart Campus Operations Software

MOLA is a full-stack campus operations software platform with:
- JWT-secured Spring Boot backend
- React frontend with role-aware dashboards
- Booking, resource, and users operations modules
- Live location satellite tracker and calendar view in Overview

## Project Structure

- mola-backend: Spring Boot REST API
- mola-frontend: React web application

## Core Modules

- Overview Dashboard: KPIs, recent bookings, calendar, live satellite tracker
- Booking Management: create, list, approve/reject/cancel, delete
- Resource Management: full CRUD for room/lab/equipment inventory
- User Access View: admin visibility for configured accounts

## Prerequisites

- Java 17+ (project currently configured with Java 17)
- Node.js 18+
- npm 9+
- Internet connection for map tiles and geolocation usage in browser

## One-Command Development Startup (Windows)

From repository root:

1. Run .\start-dev.ps1
2. Backend starts on http://localhost:8080
3. Frontend starts on http://localhost:3000 (or 3001 fallback)

## Stop Running Services (Windows)

From repository root:

1. Run .\stop-dev.ps1

This script attempts to stop listeners on ports 8080, 3000, and 3001.

## Build Full Software

From repository root:

1. Run .\build-all.ps1

Output:
- Backend JAR artifacts in mola-backend/target
- Frontend production bundle in mola-frontend/build

## Run with Docker Compose

From repository root:

1. Run docker compose up --build
2. Frontend is available at http://localhost:3000
3. Backend is available at http://localhost:8080

To stop containers:

1. Run docker compose down

## Generate Versioned Release ZIP

From repository root:

1. Run .\release.ps1

Output:

- dist/mola-release-<timestamp>-<commit>.zip

The ZIP includes:

- Backend JAR
- Frontend production build
- Docker artifacts (Dockerfiles, nginx config, docker-compose)

## Continuous Integration

GitHub Actions workflow:

- .github/workflows/ci.yml

CI runs on push and pull requests and performs:

- Backend Maven build
- Frontend npm build

## Manual Run

Backend:

1. cd mola-backend
2. .\mvnw.cmd spring-boot:run

Frontend:

1. cd mola-frontend
2. npm install
3. npm start

## Default Demo Credentials

- admin / 1234
- user / 1234

## API Base URL

Frontend is configured to call:
- http://localhost:8080/api

## Notes

- Browser geolocation permission must be granted for live location tracking.
- Satellite map tiles are sourced from Esri World Imagery.
