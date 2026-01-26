import { router } from '../trpc.js';
import { itemRouter } from './item.js';
import { cardYearRouter } from './cardYear.js';
import { cardHandRouter } from './cardHand.js';
import { analysisRouter } from './analysis.js';

export const appRouter = router({
  item: itemRouter,
  cardYear: cardYearRouter,
  cardHand: cardHandRouter,
  analysis: analysisRouter,
});

export type AppRouter = typeof appRouter;
