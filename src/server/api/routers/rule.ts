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
  orderedAs: number;
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
      const categoryOrder = await ctx.db.rule.findFirst({
        where: { categoryId: input.categoryId },
        orderBy: { orderedAs: "desc" },
        select: { orderedAs: true },
      });
      const orderedAs = categoryOrder ? categoryOrder.orderedAs + 1 : 1;
      return ctx.db.rule.create({
        data: {
          name: input.name,
          content: input.content,
          link: input.link,
          orderedAs: orderedAs,
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

  changeOrder: protectedProcedure
    .input(z.object({ id: z.number(), order: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const thisRule = await ctx.db.rule.findUnique({
        where: { id: input.id },
      });
      let newRule = thisRule;
      if (input.order === "up") {
        const prevRule = await ctx.db.rule.findMany({
          where: { orderedAs: { lt: thisRule!.orderedAs } },
          take: -1,
        });
        if (prevRule[0]) {
          await ctx.db.rule.update({
            where: { id: prevRule[0].id },
            data: { orderedAs: thisRule!.orderedAs },
          });
          newRule = await ctx.db.rule.update({
            where: { id: input.id },
            data: { orderedAs: prevRule[0].orderedAs },
          });
        }
      } else {
        const nextRule = await ctx.db.rule.findFirst({
          where: { orderedAs: { gt: thisRule!.orderedAs } },
        });
        if (nextRule) {
          await ctx.db.rule.update({
            where: { id: nextRule.id },
            data: { orderedAs: thisRule!.orderedAs },
          });
          newRule = await ctx.db.rule.update({
            where: { id: input.id },
            data: { orderedAs: nextRule.orderedAs },
          });
        }
      }
      return newRule;
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
