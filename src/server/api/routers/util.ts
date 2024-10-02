import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import type { Character } from "~/server/api/routers/char";
import type { User } from "~/server/api/routers/user";
import { z } from "zod";

export type AppData = {
  id: number;
  createAllowed: boolean;
  editAllowed: boolean;
  gameAllowed: boolean;
  ticketsLimit: number;
  changedById: string;
};

export type Ticket = {
  id: number;
  name: string;
  characterId: number;
  character?: Character;
  isResolved: boolean;
  player?: User;
  createdAt: Date;
  updatedAt: Date;
  messages?: Message[];
};

export type Message = {
  id: number;
  ticketId: number;
  content: string;
  createdAt: Date;
  updatedAt: Date;
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

  getAllTickets: protectedProcedure.query(async ({ ctx }) => {
    const tickets = await ctx.db.ticket.findMany({
      orderBy: { createdAt: "desc" },
      include: { character: { include: { faction: true, clan: true } } },
    });
    const players = await ctx.db.user.findMany();
    return tickets.map((t) => ({
      ...t,
      player: players.find((p) => p.id === t.character.playerId),
    }));
  }),
  getMessagesByTicketId: protectedProcedure
    .input(z.object({ ticketId: z.number() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.message.findMany({
        where: { ticketId: input.ticketId },
        orderBy: { createdAt: "desc" },
      });
    }),
  getMyTickets: protectedProcedure
    .input(z.object({ characterId: z.number() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.ticket.findMany({
        where: { characterId: input.characterId },
        orderBy: { createdAt: "desc" },
      });
    }),
  sendMessage: protectedProcedure
    .input(
      z.object({
        ticketId: z.number(),
        content: z.string(),
        isAdmin: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const ticket = await ctx.db.ticket.findUnique({
        where: { id: input.ticketId },
      });
      if (!ticket) return;
      await ctx.db.message.create({
        data: {
          ticketId: input.ticketId,
          content: input.content,
          isAdmin: input.isAdmin ?? false,
        },
      });
    }),
  newTicket: protectedProcedure
    .input(
      z.object({
        characterId: z.number(),
        content: z.string(),
        name: z.string(),
        isAdmin: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const character = await ctx.db.char.findUnique({
        where: { id: input.characterId },
      });
      if (!character) return;
      const ticket = await ctx.db.ticket.create({
        data: {
          name: input.name,
          characterId: input.characterId,
          Message: {
            create: {
              content: input.content,
              isAdmin: input.isAdmin ?? false,
            },
          },
        },
      });
      return { ...ticket, character: character };
    }),
  closeTicket: protectedProcedure
    .input(z.object({ ticketId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const ticket = await ctx.db.ticket.findUnique({
        where: { id: input.ticketId },
      });
      if (!ticket) return;
      return ctx.db.ticket.update({
        where: { id: input.ticketId },
        data: { isResolved: true },
        include: { character: { include: { faction: true, clan: true } } },
      });
    }),
  banCharacter: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        reason: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const character = await ctx.db.char.findUnique({
        where: { id: input.id },
      });
      if (!character) return;
      return ctx.db.char.update({
        where: { id: input.id },
        data: {
          banned: character.banned ? false : true,
          bannedReason: input.reason ?? "",
        },
      });
    }),
  timeoutCharacter: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        duration: z.number(),
        reason: z.string().optional(),
        timeoutAt: z.date().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const character = await ctx.db.char.findUnique({
        where: { id: input.id },
      });
      if (!character) return;
      return ctx.db.char.update({
        where: { id: input.id },
        data: {
          timeout: character.timeout ? false : true,
          timeoutDuration: input.duration,
          timeoutReason: input.reason ?? "",
          timeoutAt: input.timeoutAt ?? new Date(),
        },
      });
    }),

  sunrise: protectedProcedure.mutation(async ({ ctx }) => {
    await ctx.db.char.updateMany({
      data: { bloodAmount: { decrement: 1 } },
    });
  }),
});
