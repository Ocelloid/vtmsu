import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { z } from "zod";

export type AppData = {
  id: number;
  createAllowed: boolean;
  editAllowed: boolean;
  gameAllowed: boolean;
  ticketsLimit: number;
  changedById: string;
};

export const utilRouter = createTRPCRouter({
  getAppData: protectedProcedure.query(async ({ ctx }) => {
    const appData = await ctx.db.appData.findFirst({
      orderBy: { id: "desc" },
    });
    return appData;
  }),
  setAppData: protectedProcedure
    .input(
      z.object({
        createAllowed: z.boolean().optional(),
        editAllowed: z.boolean().optional(),
        gameAllowed: z.boolean().optional(),
        ticketsLimit: z.number().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const oldData = await ctx.db.appData.findFirst({
        orderBy: { id: "desc" },
      });
      await ctx.db.appData.create({
        data: {
          createAllowed: input.createAllowed ?? oldData?.createAllowed,
          editAllowed: input.editAllowed ?? oldData?.editAllowed,
          gameAllowed: input.gameAllowed ?? oldData?.gameAllowed,
          ticketsLimit: input.ticketsLimit ?? oldData?.ticketsLimit,
          changedById: ctx.session.user.id,
        },
      });
    }),
});
