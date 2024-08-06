import { router } from '../trpc';
import { userRouter } from './user';
import { itemsRouter } from './items';

export const appRouter = router({
    user: userRouter,
    items: itemsRouter,
});

export type AppRouter = typeof appRouter;