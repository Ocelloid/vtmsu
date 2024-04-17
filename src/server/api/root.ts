import { postRouter } from "~/server/api/routers/post";
import { shopRouter } from "~/server/api/routers/shop";
import { userRouter } from "~/server/api/routers/user";
import { ruleRouter } from "~/server/api/routers/rule";
import { charRouter } from "~/server/api/routers/char";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

export const appRouter = createTRPCRouter({
  post: postRouter,
  shop: shopRouter,
  user: userRouter,
  rule: ruleRouter,
  char: charRouter,
});
export type AppRouter = typeof appRouter;
export const createCaller = createCallerFactory(appRouter);
