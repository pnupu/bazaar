import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { prisma } from './prisma';
import { Category } from '@prisma/client';

const t = initTRPC.create();

export const router = t.router;
export const publicProcedure = t.procedure;

export const appRouter = router({
  getUser: publicProcedure
    .input(z.object({ address: z.string() }))
    .query(async ({ input }) => {
      const user = await prisma.user.findUnique({
        where: { address: input.address },
      });
      return user;
    }),
  createUser: publicProcedure
    .input(z.object({ address: z.string() }))
    .mutation(async ({ input }) => {
      const user = await prisma.user.create({
        data: { address: input.address },
      });
      return user;
    }),
  getCategories: publicProcedure.query(async () => {
    const categories = await prisma.category.findMany();
    return categories;
  }),
    
  getItems: publicProcedure.query(async () => {
    const items = await prisma.item.findMany({
      include: { category: true },
    });
    return items;
  }),

  getItem: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const item = await prisma.item.findUnique({
        where: { id: input.id },
        include: { category: true },
      });
      return item;
    }),


  getItemsWithCategory: publicProcedure
    .input(
      z.object({
        categoryName: z.string()
      })
    )
    .query(async ({input}) => {
      return await prisma.item.findMany({
        where: {
          category: {
            name: input.categoryName
          }
        },
        include: {
          category: true
        }
      })
    }),

  createItem: publicProcedure
    .input(z.object({
      title: z.string(),
      description: z.string(),
      price: z.number(),
      categoryId: z.string(),
      imageUrl: z.string().optional(),
      address: z.string()
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
});

export type AppRouter = typeof appRouter;