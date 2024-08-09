import { router, publicProcedure, protectedProcedure } from '../trpc';
import { z } from 'zod';
import { prisma } from '../prisma';
import { TRPCError } from '@trpc/server';
import { ItemStatus } from '@prisma/client';


export const itemsRouter = router({
      
    getItems: publicProcedure.query(async () => {
      const items = await prisma.item.findMany({
        where: {
          status: 'AVAILABLE'
        },
        take: 20,
        orderBy: {
          updatedAt: "desc"
        }
      });
      return items;
    }),
  
    getItem: publicProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input }) => {
        const item = await prisma.item.findUnique({
          where: { id: input.id },
          include: {
            seller: true
          }
        });
        return item;
      }),
    createItem: publicProcedure
      .input(z.object({
        title: z.string(),
        description: z.string(),
        price: z.number(),
        imageUrl: z.string().optional(),
        address: z.string(),
        latitude: z.number().optional(),
        longitude: z.number().optional(),
        placeName: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { address, ...itemData } = input;
  
  
        const user = await prisma.user.findUnique({
          where: {
            address: address
          }
        })
  
        if(!user){
          console.error("User not found ")
          return;
        }
  
        const item = await prisma.item.create({
          data: {
            ...itemData,
            status: 'AVAILABLE', 
            sellerId: user.id
          },
        });
        return item;
      }),
      getUserItems: publicProcedure
      .input(z.object({ address: z.string() }))
      .query(async ({ input, ctx }) => {
        const user = await ctx.prisma.user.findUnique({
          where: { address: input.address },
        });

        if (!user) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });
        }

        const items = await ctx.prisma.item.findMany({
          where: { sellerId: user.id },
          orderBy: { createdAt: 'desc' },
        });

        return items;
      }),
    searchItems: publicProcedure
    .input(z.object({ query: z.string() }))
    .query(async ({ input }) => {
      const items = await prisma.item.findMany({
        where: {
          OR: [
            { title: { contains: input.query, mode: 'insensitive' } },
            { description: { contains: input.query, mode: 'insensitive' } },
          ],
        },
      });
      return items;
    }),
    updateItem: protectedProcedure
    .input(z.object({
      id: z.string(),
      title: z.string().optional(),
      description: z.string().optional(),
      price: z.number().optional(),
      imageUrl: z.string().optional(),
      latitude: z.number().optional(),
      longitude: z.number().optional(),
      placeName: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const item = await prisma.item.findUnique({
        where: { id: input.id },
        include: { seller: true },
      });

      if (!item) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Item not found' });
      }

      if (item.seller.address !== ctx.user.address) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'You can only edit your own items' });
      }

      const updatedItem = await prisma.item.update({
        where: { id: input.id },
        data: {
          title: input.title,
          description: input.description,
          price: input.price,
          imageUrl: input.imageUrl,
          latitude: input.latitude,
          longitude: input.longitude,
          placeName: input.placeName,
        },
      });

      return updatedItem;
    }),
    updateItemStatus: protectedProcedure
    .input(z.object({
      id: z.string(),
      status: z.nativeEnum(ItemStatus),
      txHash: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const updatedItem = await ctx.prisma.item.update({
        where: { id: input.id },
        data: { 
          status: input.status,
          txHash: input.txHash,
        },
      });
      return updatedItem;
    }),


  getUserBoughtItems: publicProcedure
    .input(z.object({ address: z.string() }))
    .query(async ({ input, ctx }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { address: input.address },
      });

      if (!user) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });
      }

      const boughtItems = await ctx.prisma.item.findMany({
        where: {
          offers: {
            some: {
              buyerId: user.id,
              status: 'ACCEPTED',
            },
          },
        },
        include: {
          seller: true,
        },
        orderBy: { updatedAt: 'desc' },
      });

      return boughtItems;
    }),
    
    addFeedback: protectedProcedure
    .input(z.object({
      itemId: z.string(),
      rating: z.number().min(1).max(5),
      comment: z.string(),
      signature: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { itemId, rating, comment, signature } = input;

      const item = await ctx.prisma.item.findUnique({
        where: { id: itemId },
        include: { feedback: true },
      });

      if (!item) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Item not found' });
      }

      if (item.status !== 'SOLD') {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Feedback can only be added to sold items' });
      }

      if (item.feedback) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Feedback has already been given for this item' });
      }

      const feedback = await ctx.prisma.feedback.create({
        data: {
          rating,
          comment,
          signature,
          item: { connect: { id: itemId } },
          buyer: { connect: { id: ctx.user.id } },
        },
      });

      return feedback;
    }),

    getFeedback: protectedProcedure
      .input(z.object({ itemId: z.string() }))
      .query(async ({ input, ctx }) => {
        const feedback = await ctx.prisma.feedback.findUnique({
          where: { itemId: input.itemId },
          include: { buyer: true },
        });

        return feedback;
      }),
  });