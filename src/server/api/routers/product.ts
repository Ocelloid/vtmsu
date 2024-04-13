import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export type Product = {
  id: number;
  title: string;
  subtitle?: string;
  description?: string;
  size?: string;
  color?: string;
  stock: number;
  price: number;
  quantity?: number;
  thumbnail?: string;
};

export const productRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({ name: z.string().min(1), content: z.string().nullish() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.post.create({
        data: {
          name: input.name,
          content: input.content,
          createdBy: { connect: { id: ctx.session.user.id } },
        },
      });
    }),

  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.db.post.findMany();
  }),

  getLatest: protectedProcedure.query(({ ctx }) => {
    return ctx.db.post.findFirst({
      orderBy: { createdAt: "desc" },
      where: { createdBy: { id: ctx.session.user.id } },
    });
  }),
});
