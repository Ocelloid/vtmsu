import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export type Rule = {
  id: number;
  name: string;
  link: string;
  categoryId: number;
  content: string;
};

export const ruleRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        content: z.string(),
        link: z.string(),
        categoryId: z.number().int(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.rule.create({
        data: {
          name: input.name,
          content: input.content,
          link: input.link,
          categoryId: input.categoryId,
          createdById: ctx.session.user.id,
        },
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        content: z.string(),
        link: z.string(),
        id: z.number().int(),
        categoryId: z.number().int(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.rule.update({
        where: { id: input.id },
        data: {
          link: input.link,
          name: input.name,
          content: input.content,
          categoryId: input.categoryId,
        },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.rule.delete({
        where: { id: input.id },
      });
    }),

  findById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(({ ctx, input }) => {
      const rule = ctx.db.rule.findFirst({
        where: { id: input.id },
        orderBy: { updatedAt: "desc" },
      });
      return rule;
    }),

  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.db.rule.findMany();
  }),
});
