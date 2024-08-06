import { router, protectedProcedure, publicProcedure } from '../trpc';
import { z } from 'zod';
import { prisma } from '../prisma';

export const userRouter = router({
  getUser: protectedProcedure.query(({ ctx }) => {
    return ctx.user;
  }),
  
  getUserWithAddress: publicProcedure
  .input(z.object({ address: z.string() }))
  .query(async ({ input }) => {
    const user = await prisma.user.findUnique({
      where: { address: input.address },
    });
    return user;
  }),

  updateUser: protectedProcedure
    .input(z.object({
      address: z.string(),
      username: z.string().optional(),
      bio: z.string().optional(),
      avatarUrl: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const { address, ...userData } = input;
      const updatedUser = await prisma.user.update({
        where: { address },
        data: userData,
      });
      return updatedUser;
    }),
});