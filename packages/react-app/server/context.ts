// server/context.ts
import { inferAsyncReturnType } from '@trpc/server';
import { CreateNextContextOptions } from '@trpc/server/adapters/next';
import { prisma } from './prisma';
import { authenticateUser } from '../lib/auth';

export async function createContext({ req, res }: CreateNextContextOptions) {
  const user = await authenticateUser(req);

  return {
    prisma,
    user,
    req,
    res,
  };
}

export type Context = inferAsyncReturnType<typeof createContext>;