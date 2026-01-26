import { config } from 'dotenv';
import { resolve } from 'path';
import express from 'express';
import cors from 'cors';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { initDb } from '../../common/src/db.js';
import { appRouter } from './trpcRouters/index.js';
import type { Context } from './trpc.js';

config({ path: resolve(import.meta.dirname, '../../.env') });

const app = express();

app.use(cors());
app.use(express.json());

// Initialize database
initDb({
  host: process.env.DB_HOST ?? 'localhost',
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  database: process.env.DB_NAME ?? 'mjbuddy',
  user: process.env.DB_USER ?? 'postgres',
  password: process.env.DB_PASSWORD ?? '',
});

// tRPC middleware
app.use(
  '/trpc',
  createExpressMiddleware({
    router: appRouter,
    createContext: ({ req, res }): Context => ({ req, res }),
  })
);

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT ?? 3001;

app.listen(PORT, () => {
  console.log(`Data service running on port ${PORT}`);
});

export type { AppRouter } from './trpcRouters/index.js';
