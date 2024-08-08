import { router } from '../trpc';
import { userRouter } from './user';
import { itemsRouter } from './items';
import { chatRouter } from './chat'

export const appRouter = router({
    user: userRouter,
    items: itemsRouter,
    chat: chatRouter,
});

export type AppRouter = typeof appRouter;