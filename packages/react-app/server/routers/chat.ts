import { router, protectedProcedure } from '../trpc';
import { z } from 'zod';
import { prisma } from '../prisma';
import Pusher from 'pusher';

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
        participants: {
          some: {
            id: ctx.user.id
          }
        }
      },
      include: {
        participants: true,
        messages: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      }
    });
  }),

  getMessages: protectedProcedure
    .input(z.object({ conversationId: z.string() }))
    .query(async ({ input, ctx }) => {
      return prisma.message.findMany({
        where: {
          conversationId: input.conversationId,
          conversation: {
            participants: {
              some: {
                id: ctx.user.id
              }
            }
          }
        },
        orderBy: {
          createdAt: 'asc'
        },
        include: {
          sender: true
        }
      });
    }),

    sendMessage: protectedProcedure
    .input(z.object({
      conversationId: z.string(),
      content: z.string()
    }))
    .mutation(async ({ input, ctx }) => {
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
    getOrCreateConversation: protectedProcedure
  .input(z.object({ sellerId: z.string() }))
  .mutation(async ({ input, ctx }) => {
    let conversation = await prisma.conversation.findFirst({
      where: {
        AND: [
          { participants: { some: { id: ctx.user.id } } },
          { participants: { some: { id: input.sellerId } } },
        ],
      },
      include: {
        participants: true,
        messages: {
          orderBy: { createdAt: 'asc' },
          include: { sender: true },
        },
      },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          participants: {
            connect: [{ id: ctx.user.id }, { id: input.sellerId }],
          },
        },
        include: {
          participants: true,
          messages: {
            orderBy: { createdAt: 'asc' },
            include: { sender: true },
          },
        },
      });
    }

    return conversation;
  }),

});