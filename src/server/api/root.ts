import { postRouter } from "~/server/api/routers/post";
import { shopRouter } from "~/server/api/routers/shop";
import { userRouter } from "~/server/api/routers/user";
import { ruleRouter } from "~/server/api/routers/rule";
import { charRouter } from "~/server/api/routers/char";
import { huntRouter } from "~/server/api/routers/hunt";
import { itemRouter } from "~/server/api/routers/item";
import { econRouter } from "~/server/api/routers/econ";
import { utilRouter } from "~/server/api/routers/util";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

export const appRouter = createTRPCRouter({
  econ: econRouter,
  post: postRouter,
  shop: shopRouter,
  user: userRouter,
  rule: ruleRouter,
  char: charRouter,
  hunt: huntRouter,
  item: itemRouter,
  util: utilRouter,
});
export type AppRouter = typeof appRouter;
export const createCaller = createCallerFactory(appRouter);
