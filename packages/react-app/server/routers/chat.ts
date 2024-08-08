import { router, protectedProcedure } from '../trpc';
import { z } from 'zod';
import { prisma } from '../prisma';

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
        }
      });


      return message;
    })
});