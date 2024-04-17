import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export type Character = {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  content: string | null;
  createdById: string;
};

export const charRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({ name: z.string().min(1), content: z.string().nullish() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.char.create({
        data: {
          name: input.name,
          content: input.content,
          createdBy: { connect: { id: ctx.session.user.id } },
        },
      });
    }),

  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.db.char.findMany();
  }),

  getMine: protectedProcedure.query(({ ctx }) => {
    return ctx.db.char.findMany({
      orderBy: { createdAt: "desc" },
      where: { createdBy: { id: ctx.session.user.id } },
    });
  }),
});
