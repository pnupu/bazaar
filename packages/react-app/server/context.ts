import { inferAsyncReturnType } from '@trpc/server';
import { CreateNextContextOptions } from '@trpc/server/adapters/next';
import { prisma } from './prisma';

export async function createContext({ req, res }: CreateNextContextOptions) {
  const address = req.headers['x-user-address'] as string | undefined;
  let user = undefined;
  if (address) {
    user = await prisma.user.findUnique({ where: { address } });
    if (!user) {
      user = await prisma.user.create({ data: { address } });
    }
  }

  return {
    prisma,
    user,
  };
}

export type Context = inferAsyncReturnType<typeof createContext>;