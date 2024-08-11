import { router, protectedProcedure, publicProcedure } from '../trpc';
import { z } from 'zod';
import { prisma } from '../prisma';
import Pusher from 'pusher';
import { TRPCError } from '@trpc/server';

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true,
});

export const chatRouter = router({
  getConversations: protectedProcedure.query(async ({ ctx }) => {
    return prisma.conversation.findMany({
      where: {
        OR: [
          { buyerId: ctx.user.id },
          { sellerId: ctx.user.id }
        ]
      },
      include: {
        seller: true,
        buyer: true,
        item: true,
        messages: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      }
    });
  }),

  getConversation: protectedProcedure
    .input(z.object({ conversationId: z.string() }))
    .query(async ({ input, ctx }) => {
      const conversation = await prisma.conversation.findUnique({
        where: { id: input.conversationId },
        include: {
          seller: {
            include: {
              worldcoinProof: {
                select: {
                  verificationLevel: true,
                },
              },
            },
          },
          buyer: {
            include: {
              worldcoinProof: {
                select: {
                  verificationLevel: true,
                },
              },
            },
          },
          item: true,
          offers: true,
          messages: {
            orderBy: { createdAt: 'asc' },
            include: { 
              sender: {
                include: {
                  worldcoinProof: {
                    select: {
                      verificationLevel: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!conversation || (conversation.buyerId !== ctx.user.id && conversation.sellerId !== ctx.user.id)) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Conversation not found' });
      }

      return conversation;
    }),

  getOrCreateConversation: protectedProcedure
    .input(z.object({ itemId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const item = await prisma.item.findUnique({
        where: { id: input.itemId },
        include: { seller: true },
      });

      if (!item) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Item not found' });
      }

      if (item.sellerId === ctx.user.id) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'You cannot start a conversation with yourself' });
      }

      let conversation = await prisma.conversation.findFirst({
        where: {
          itemId: input.itemId,
          buyerId: ctx.user.id,
          sellerId: item.sellerId,
        },
        include: {
          seller: true,
          buyer: true,
          item: true,
          messages: {
            orderBy: { createdAt: 'asc' },
            include: { sender: true },
          },
        },
      });

      if (!conversation) {
        conversation = await prisma.conversation.create({
          data: {
            buyerId: ctx.user.id,
            sellerId: item.sellerId,
            itemId: input.itemId,
          },
          include: {
            seller: true,
            buyer: true,
            item: true,
            messages: {
              orderBy: { createdAt: 'asc' },
              include: { sender: true },
            },
          },
        });
      }

      return conversation;
    }),

  sendMessage: protectedProcedure
    .input(z.object({
      conversationId: z.string(),
      content: z.string()
    }))
    .mutation(async ({ input, ctx }) => {
      const conversation = await prisma.conversation.findUnique({
        where: { id: input.conversationId },
      });

      if (!conversation || (conversation.buyerId !== ctx.user.id && conversation.sellerId !== ctx.user.id)) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Conversation not found' });
      }

      const message = await prisma.message.create({
        data: {
          content: input.content,
          senderId: ctx.user.id,
          conversationId: input.conversationId
        },
        include: { sender: true }
      });

      await pusher.trigger(`private-conversation-${input.conversationId}`, 'new-message', message);

      return message;
    }),
    makeOffer: protectedProcedure
    .input(z.object({
      conversationId: z.string(),
      amount: z.number(),
      chainId: z.number(),
    }))
    .mutation(async ({ input, ctx }) => {
      const conversation = await prisma.conversation.findUnique({
        where: { id: input.conversationId },
        include: { item: true },
      });

      if (!conversation) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Conversation not found' });
      }

      if (conversation.buyerId !== ctx.user.id) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Only the buyer can make an offer' });
      }

      const offer = await prisma.offer.create({
        data: {
          amount: input.amount,
          status: 'PENDING',
          buyerId: ctx.user.id,
          sellerId: conversation.sellerId,
          conversationId: conversation.id,
          itemId: conversation.item.id,
          chainId: input.chainId,
        },
      });

      await prisma.offer.deleteMany({
        where: {
          NOT: {
            id: offer.id
          }
        }
      })

      return offer;
    }),

  acceptOffer: protectedProcedure
    .input(z.object({
      offerId: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const offer = await prisma.offer.findUnique({
        where: { id: input.offerId },
        include: { item: true },
      });

      if (!offer) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Offer not found' });
      }

      if (offer.sellerId !== ctx.user.id) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Only the seller can accept the offer' });
      }

      const updatedOffer = await prisma.offer.update({
        where: { id: input.offerId },
        data: { status: 'ACCEPTED' },
      });

      // Update item status to SOLD
      await prisma.item.update({
        where: { id: offer.itemId },
        data: { status: 'SOLD' },
      });

      // Trigger Pusher event for accepted offer
      // ... (implement Pusher trigger here)

      return updatedOffer;
    }),
    getOfferStatus: publicProcedure
    .input(z.object({ itemId: z.string() }))
    .query(async ({ input, ctx }) => {
      const offer = await ctx.prisma.offer.findFirst({
        where: {
          itemId: input.itemId,
          status: 'ACCEPTED',
        },
        select: {
          buyerId: true,
          status: true,
          amount: true,
        },
      });
  
      return offer;
    }),
});

