import { z } from 'zod';
import { router, authedProcedure } from '../trpc.js';
import { CreateCardYearSchema, UpdateCardYearSchema } from 'common';
import {
  getAllCardYears,
  getCardYearById,
  getActiveCardYear,
  createCardYear,
  updateCardYear,
  setActiveCardYear,
  deleteCardYear,
} from '../models/cardYear.js';

export const cardYearRouter = router({
  list: authedProcedure.query(async () => {
    return getAllCardYears();
  }),

  getById: authedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return getCardYearById(input.id);
    }),

  getActive: authedProcedure.query(async () => {
    return getActiveCardYear();
  }),

  create: authedProcedure
    .input(CreateCardYearSchema)
    .mutation(async ({ input }) => {
      return createCardYear(input);
    }),

  update: authedProcedure
    .input(UpdateCardYearSchema)
    .mutation(async ({ input }) => {
      return updateCardYear(input);
    }),

  setActive: authedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      return setActiveCardYear(input.id);
    }),

  delete: authedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      return deleteCardYear(input.id);
    }),
});
