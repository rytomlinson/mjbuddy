import { initTRPC } from '@trpc/server';
import type { Request, Response } from 'express';

export interface Context {
  req: Request;
  res: Response;
}

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;

export const authedProcedure = t.procedure.use(async ({ ctx, next }) => {
  // Add authentication logic here
  // For now, we'll pass through but you can add token validation
  const authHeader = ctx.req.headers.authorization;

  if (!authHeader) {
    // For development, allow unauthenticated requests
    // In production, throw an error:
    // throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Missing authorization header' });
  }

  return next({
    ctx: {
      ...ctx,
      // Add user info to context after authentication
      // user: decodedToken,
    },
  });
});
