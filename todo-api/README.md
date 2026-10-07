# Todo API

NestJS REST API for Taskboard. See the repository [README](../README.md) for full setup, environment variables, frontend instructions, API documentation, and test-level descriptions.

## Setup

```powershell
npm install
Copy-Item .env.example .env
```

Configure PostgreSQL connection values and a `JWT_SECRET` of at least 32 characters in `.env`. Apply database migrations with `npm run migration:run`.

## Run

```powershell
npm run start:dev
```

The API defaults to `http://localhost:3000/api/v1`; Swagger UI is at `http://localhost:3000/api/docs`. `PORT` and `CORS_ORIGINS` are configurable through the environment.

## Test and build

```powershell
npm test -- --runInBand
npm run test:e2e -- --runInBand
npm run build
```

Unit tests cover todo/authentication services and configuration validation. HTTP/API tests use a test Nest application with mocked persistence and exercise versioned routes, DTO validation, authorization, and consistent errors without requiring PostgreSQL.
