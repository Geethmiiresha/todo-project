# Taskboard frontend

React + TypeScript frontend for the Taskboard API. See the repository [README](../README.md) for complete setup, backend/database configuration, API documentation, and test-level descriptions.

## Setup and run

```powershell
npm install
npm run dev
```

The frontend defaults to `http://localhost:3000/api/v1` for its API. Set `VITE_API_URL` to override the base URL.

## Validate

```powershell
npm test
npm run build
```

Tests cover todo creation and validation, edit/delete/filter/loading/error behavior, and login validation and submission.
