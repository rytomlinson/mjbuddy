import { router } from '../trpc.js';
import { itemRouter } from './item.js';

export const appRouter = router({
  item: itemRouter,
});

export type AppRouter = typeof appRouter;
