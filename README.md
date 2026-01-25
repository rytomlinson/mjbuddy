# MJBuddy

A TypeScript monorepo with React, Redux Toolkit, tRPC, and PostgreSQL.

## Prerequisites

- Node.js 18+
- PostgreSQL 14+

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create database:
   ```bash
   createdb mjbuddy
   ```

3. Copy environment file and configure:
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

4. Run migrations:
   ```bash
   npm run migrate
   ```

## Development

Start both frontend and backend in development mode:
```bash
npm run dev
```

Or run them separately:
```bash
npm run dev:data-service  # Backend on port 3001
npm run dev:ui            # Frontend on port 3000
```

## Build

```bash
npm run build
```

## Project Structure

```
/common/src/
  /schemas/        - Zod schemas and TypeScript types
  /utils/          - Shared utility functions
  db.ts            - Database connection utilities

/data-service/src/
  /models/         - Database models (CRUD operations)
  /trpcRouters/    - tRPC API endpoints
  index.ts         - Express server with tRPC

/ui/src/
  /components/     - React components
  /slices/         - Redux slices
  /hooks/          - Custom React hooks
  /utils/          - Frontend utilities
  store.ts         - Redux store configuration
  trpc.ts          - tRPC client setup
  App.tsx          - Root component
  main.tsx         - Entry point

/db/migrations/    - node-pg-migrate migrations
```

## Tech Stack

- **Language**: TypeScript (strict mode)
- **Frontend**: React 18, Vite
- **State Management**: Redux Toolkit
- **Styling**: react-jss
- **API**: tRPC
- **Validation**: Zod
- **Database**: PostgreSQL with node-pg-migrate
