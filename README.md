# Currency Rate Service

A production-ready NestJS backend service for fetching, storing, and analyzing currency exchange rates using the Frankfurter API.

## Features

- **Fetch Rates**: Retrieves latest exchange rates from Frankfurter API.
- **Store Rates**: Persists rates in PostgreSQL with a unique timestamp-based schema.
- **Get Latest**: Efficiently retrieves the most recent rates per currency.
- **Get Average**: Calculates average exchange rate over an arbitrary period (e.g., 24h, 7d).
- **Background Jobs**: Scheduled fetching every 3 hours via Cron.
- **Health Check**: Database connectivity monitoring.

## Architecture

- **Framework**: NestJS (Modular, Dependency Injection)
- **Database**: PostgreSQL (Relational Data, Timescaled Aggregation)
- **ORM**: TypeORM (Entity Management, Repository Pattern)
- **Containerization**: Docker & Docker Compose (Multi-stage builds)

## Setup & Running

### Prerequisites
- Docker & Docker Compose installed.

### Run with Docker
```bash
docker-compose up --build -d
```

### API Endpoints

1.  **Health Check**
    - `GET /health`
    - Response: `{"status":"ok","database":"connected"}`

2.  **Fetch Rates (Manual Trigger)**
    - `POST /rates/fetch`
    - Body: `{ "base": "USD" }` (optional)

3.  **Get Latest Rates**
    - `GET /rates/latest?base=USD`

4.  **Get Average Rate**
    - `GET /rates/average?base=USD&target=EUR&period=24h`

## Deployment (AWS App Runner)

Since this application is containerized, it is ready for AWS App Runner.

1.  **Push to Registry**:
    - Push your Docker image to Amazon ECR or Docker Hub.
    - Example: `docker push your-repo/currency-service:latest`

2.  **Create Service in App Runner**:
    - Go to AWS Console > App Runner > Create Service.
    - **Source**: Container Registry.
    - **URI**: Select your image URL.

3.  **Configuration**:
    - **Environment Variables**: Add the following overrides in the console:
        - `DB_HOST`: Endpoint of your AWS RDS PostgreSQL instance.
        - `DB_USER`: RDS Username.
        - `DB_PASS`: RDS Password.
        - `DB_NAME`: `currency_db`
        - `API_URL`: `https://api.frankfurter.app` (or keep default).
    - **Port**: `3000`.

4.  **Database Note**:
    - App Runner cannot connect to the `postgres` container defined in `docker-compose.yml` because processes run in isolation.
    - **Requirement**: You MUST provision a separate PostgreSQL database (e.g., AWS RDS or Aurora) and provide its connection details via environment variables.

## Troubleshooting

### "Relation does not exist" Error
If you see 500 errors on `GET /rates/latest` related to missing tables:
1.  Check `Dockerfile` to ensure `NODE_ENV` is NOT set to `production` locally.
2.  Production mode sets `synchronize: false` in TypeORM, skipping table creation.
3.  Fix: Remove `ENV NODE_ENV=production`, then `docker-compose down -v` and rebuild.
