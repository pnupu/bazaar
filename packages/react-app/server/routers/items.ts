import { router, publicProcedure } from '../trpc';
import { z } from 'zod';
import { prisma } from '../prisma';
import { TRPCError } from '@trpc/server';


export const itemsRouter = router({
      
    getItems: publicProcedure.query(async () => {
      const items = await prisma.item.findMany({
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
  });