# Currency Rate Service

A production-ready NestJS backend service for fetching, storing, and serving currency exchange rates.

## Features

- **Fetch Rates**: Integrates with Frankfurter API to fetch latest currency rates.
- **Scheduled Updates**: Background Cron job fetches rates every 3 hours.
- **Historic Data**: specific endpoints to retrieve latest rates and average rates over a period.
- **Resanable Architecture**: Modular design with dedicated modules for external providers, rates logic, and health checks.
- **Dockerized**: Fully dockerized application with Postgres database.
- **Health Checks**: `/health` endpoint for readiness and liveness probes.

## Prerequisites

- Docker & Docker Compose
- Node.js (v18+) & NPM (for local development)

## Setup & Running

### Using Docker (Recommended)

1.  **Clone the repository**
2.  **Create `.env` file**:
    ```bash
    cp .env.example .env
    ```
3.  **Run with Docker Compose**:
    ```bash
    docker-compose up --build
    ```
    The API will be available at `http://localhost:3000`.

### Local Development

1.  **Install Dependencies**:
    ```bash
    npm install
    ```
2.  **Set up Database**:
    Ensure you have a PostgreSQL instance running and update `.env` with credentials.
3.  **Run Application**:
    ```bash
    npm run start:dev
    ```

## API Endpoints

### Health Check
- `GET /health`: Checks database connectivity.

### Rates
- `POST /rates/fetch`: Manually trigger a rate fetch from the provider.
  - Body: `{ "base": "USD" }` (optional, default USD)
- `GET /rates/latest`: Get the latest exchange rates.
  - Query: `?base=USD` (optional, default USD)
- `GET /rates/average`: Get average exchange rate for a specific target and period.
  - Query: `?base=USD&target=EUR&period=24h`
  - `period` format: `Nh` (e.g., `24h`, `48h`)

## Architecture Decisions

- **NestJS**: Scalable and maintainable framework with built-in dependency injection.
- **TypeORM**: specific ORM for database interactions.
- **PostgreSQL**: Reliable relational database. `ExchangeRate` table is optimized with composite indexes for frequent queries.
- **Cron Jobs**: NestJS Schedule module for periodic tasks.
- **Validation**: Global `ValidationPipe` with `class-validator` for DTOs.
- **Config**: `ConfigModule` with `Joi` validation ensures type-safe environment variables.

## Deployment (AWS App Runner)

This service is optimized for deployment on AWS App Runner.

1.  **Push to Container Registry (ECR)**:
    - Build the Docker image: `docker build -t currency-rate-service .`
    - Tag and push to ECR: `aws ecr push ...`

2.  **Create App Runner Service**:
    - Source: Amazon ECR
    - Image: Select the pushed image.
    - **Configuration**:
        - Port: `3000`
        - Environment Variables: Add `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASS`, `DB_NAME` (Point to an RDS instance or compatible DB).

3.  **Database**:
    - Ensure the App Runner service has network access to your PostgreSQL database (e.g., RDS in the same VPC).

4.  **Health Check**:
    - Configure Health Check Path: `/health`

## Testing

```bash
# unit tests
npm run test

# e2e tests
npm run test:e2e
```
