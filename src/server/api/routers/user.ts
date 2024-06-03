import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { z } from "zod";
import type { Character } from "~/server/api/routers/char";

export type User = {
  id: string;
  name: string | null;
  email: string | null;
  isAdmin: boolean;
  isPersonnel: boolean;
  emailVerified: Date | null;
  image: string | null;
  characters?: Character[] | null;
};

export const userRouter = createTRPCRouter({
  changePP: protectedProcedure
    .input(z.object({ pp: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const user = ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: { image: input.pp },
      });
      return user;
    }),

  updateBG: protectedProcedure
    .input(z.object({ bg: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: {
          background: input.bg,
        },
      });
    }),

  delete: protectedProcedure.mutation(async ({ ctx }) => {
    return ctx.db.user.delete({
      where: { id: ctx.session.user.id },
    });
  }),

  update: protectedProcedure
    .input(
      z.object({
        name: z.string().optional(),
        email: z.string().optional(),
        phone: z.string().optional(),
        vk: z.string().optional(),
        tg: z.string().optional(),
        discord: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: {
          name: input.name,
          email: input.email,
          phone: input.phone,
          vk: input.vk,
          tg: input.tg,
          discord: input.discord,
        },
      });
      return user;
    }),

  getCurrent: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.session.user.id },
    });
    return user;
  }),

  getUserList: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.session.user.id },
    });
    const users = await ctx.db.user.findMany({ include: { characters: true } });
    return user?.isAdmin ? users : [];
  }),

  getUserById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const currentUser = await ctx.db.user.findUnique({
        where: { id: ctx.session.user.id },
      });
      const user = await ctx.db.user.findUnique({
        where: { id: input.id },
        include: { characters: { include: { faction: true, clan: true } } },
      });
      return currentUser?.isAdmin ? user : null;
    }),

  userIsAdmin: publicProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.session ? ctx.session.user.id : "" },
    });
    return user ? user.isAdmin : false;
  }),

  userIsPersonnel: publicProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.session ? ctx.session.user.id : "" },
    });
    return user ? user.isPersonnel : false;
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
