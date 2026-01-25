import { z } from 'zod';
import { router, authedProcedure } from '../trpc.js';
import { CreateItemSchema, UpdateItemSchema } from 'common';
import {
  getAllItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
} from '../models/item.js';

export const itemRouter = router({
  list: authedProcedure.query(async () => {
    return getAllItems();
  }),

  getById: authedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return getItemById(input.id);
    }),

  create: authedProcedure
    .input(CreateItemSchema)
    .mutation(async ({ input }) => {
      return createItem(input);
    }),

  update: authedProcedure
    .input(UpdateItemSchema)
    .mutation(async ({ input }) => {
      return updateItem(input);
    }),

  delete: authedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      return deleteItem(input.id);
    }),
});
