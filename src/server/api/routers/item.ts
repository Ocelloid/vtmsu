import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const itemRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({ name: z.string().min(1), content: z.string().nullish() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.item.create({
        data: {
          name: input.name,
          content: input.content,
          createdBy: { connect: { id: ctx.session.user.id } },
        },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.item.delete({
        where: { id: input.id },
      });
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.item.findFirst({
        where: { id: input.id },
      });
    }),

  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.db.item.findMany();
  }),

  getLatest: protectedProcedure.query(({ ctx }) => {
    return ctx.db.item.findFirst({
      orderBy: { createdAt: "desc" },
      where: { createdBy: { id: ctx.session.user.id } },
    });
  }),
});
