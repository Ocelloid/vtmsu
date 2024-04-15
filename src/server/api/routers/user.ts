import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { z } from "zod";

export type User = {
  id: string;
  name: string | null;
  email: string | null;
  isAdmin: boolean;
  isPersonnel: boolean;
  emailVerified: Date | null;
  image: string | null;
};

export const userRouter = createTRPCRouter({
  getUserList: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.session.user.id },
    });
    const users = await ctx.db.user.findMany();
    return user?.isAdmin ? users : [];
  }),

  userIsAdmin: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.session.user.id },
    });
    return user!.isAdmin;
  }),

  userIsPersonnel: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.session.user.id },
    });
    return user!.isPersonnel;
  }),

  userRoleChange: protectedProcedure
    .input(z.object({ id: z.string(), role: z.string(), change: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const newData =
        input.role === "admin"
          ? { isAdmin: input.change }
          : { isPersonnel: input.change };
      const user = ctx.db.user.update({
        where: { id: input.id },
        data: newData,
      });
      return user;
    }),
});
