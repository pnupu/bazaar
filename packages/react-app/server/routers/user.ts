import { router, protectedProcedure, publicProcedure } from '../trpc';
import { z } from 'zod';
import { prisma } from '../prisma';
import { verifyCloudProof, ISuccessResult, VerificationLevel } from '@worldcoin/idkit';
import { TRPCError } from '@trpc/server';

function formatAppId(appId: string): `app_${string}` {
  return appId.startsWith('app_') ? (appId as `app_${string}`) : `app_${appId}`;
}

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
    getUserFeedback: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input, ctx }) => {
      return ctx.prisma.feedback.findMany({
        where: { sellerId: input.userId },
        select: { rating: true },
      });
    }),
    verifyWorldcoin: protectedProcedure
    .input(z.object({
      proof: z.object({
        merkle_root: z.string(),
        nullifier_hash: z.string(),
        proof: z.string(),
        verification_level: z.enum(['orb', 'device']),
      }),
      address: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { proof, address } = input;

      const successResult: ISuccessResult = {
        merkle_root: proof.merkle_root,
        nullifier_hash: proof.nullifier_hash,
        proof: proof.proof,
        verification_level: proof.verification_level as VerificationLevel,
      };

      // Verify the proof using Worldcoin's API
      const verifyRes = await verifyCloudProof(
        successResult,
        formatAppId(process.env.WORLDCOIN_APP_ID || ''),
        'identity-verificatoin'
      );

      if (!verifyRes.success) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Invalid Worldcoin proof',
        });
      }

      // Find the user by address
      const user = await prisma.user.findUnique({
        where: { address },
      });

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        });
      }

      // Store the proof in the database
      await prisma.worldcoinProof.create({
        data: {
          nullifierHash: proof.nullifier_hash,
          merkleRoot: proof.merkle_root,
          proof: proof.proof,
          verificationLevel: proof.verification_level,
          userId: user.id,
        },
      });

      return { success: true };
    }),
    getWorldcoinProof: protectedProcedure
    .input(z.object({ address: z.string() }))
    .query(async ({ input, ctx }) => {
      const user = await prisma.user.findUnique({
        where: { address: input.address },
        include: { worldcoinProof: true },
      });

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        });
      }

      return user.worldcoinProof;
    }),
    getUserWithWorldcoinStatus: publicProcedure
    .input(z.object({ address: z.string() }))
    .query(async ({ input }) => {
      const user = await prisma.user.findUnique({
        where: { address: input.address },
        include: {
          worldcoinProof: {
            select: {
              verificationLevel: true,
            },
          },
        },
      });

      return user;
    }),
});