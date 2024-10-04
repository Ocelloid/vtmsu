import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

import type { Character } from "~/server/api/routers/char";

export type Company = {
  id: string;
  name: string;
  image: string;
  level: number;
  isActive: boolean;
  isVisible: boolean;
  isWarrens: boolean;
  coordX: number;
  coordY: number;
  content: string;
  characterId: number;
  createdAt: Date;
  updatedAt: Date;
  character?: Character;
  BankAccount?: BankAccount[];
};

export type BankAccount = {
  id: number;
  address: string;
  balance: number;
  characterId: number;
  createdAt: Date;
  updatedAt: Date;
  character?: Character;
  companyId?: string | null;
  company?: Company | null;
};

export const econRouter = createTRPCRouter({
  getAll: protectedProcedure.query(({ ctx }) => {
    return ctx.db.company.findMany({
      include: { character: true, BankAccount: true },
    });
  }),
  getPublic: publicProcedure.query(({ ctx }) => {
    return ctx.db.company.findMany({ where: { isVisible: true } });
  }),
  getMine: protectedProcedure.query(({ ctx }) => {
    return ctx.db.company.findMany({
      where: { character: { playerId: ctx.session.user.id } },
    });
  }),
  getByCharacterId: protectedProcedure
    .input(z.object({ characterId: z.number() }))
    .query(({ ctx, input }) => {
      return ctx.db.company.findMany({
        where: { characterId: input.characterId },
        include: { BankAccount: true },
      });
    }),
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.company.findUnique({
        where: { id: input.id },
        include: { BankAccount: true },
      });
    }),

  getBalance: protectedProcedure
    .input(z.object({ characterId: z.number() }))
    .query(async ({ ctx, input }) => {
      const account = await ctx.db.bankAccount.findFirst({
        where: { characterId: input.characterId },
        select: { balance: true },
      });
      return account?.balance ?? 0;
    }),
  createBankAccount: protectedProcedure
    .input(
      z.object({
        characterId: z.number(),
        companyId: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.bankAccount.create({
        data: {
          characterId: input.characterId,
          companyId: input.companyId,
          address: (
            (Date.now() % 1000000) * 100 +
            Math.floor(Math.random() * 100)
          ).toString(),
          balance: 0,
        },
      });
    }),
  getBankAccounts: protectedProcedure.query(async ({ ctx }) => {
    const balances = await ctx.db.bankAccount.findMany({
      include: { character: true, company: true },
    });
    return balances;
  }),
  getAcconutsByCharId: protectedProcedure
    .input(z.object({ characterId: z.number() }))
    .query(async ({ ctx, input }) => {
      const balances = await ctx.db.bankAccount.findMany({
        where: {
          OR: [
            { characterId: input.characterId, companyId: null },
            { company: { characterId: input.characterId } },
          ],
        },
        include: { company: true, character: true },
      });
      return balances;
    }),

  setOwner: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        characterId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const company = await ctx.db.company.findFirst({
        where: { id: input.id },
        select: { BankAccount: true, id: true },
      });
      if (!company) return { message: "Не найдено предприятие" };
      await ctx.db.company.update({
        where: { id: company.id },
        data: { characterId: input.characterId },
      });
      await ctx.db.bankAccount.updateMany({
        where: { companyId: company.id },
        data: { characterId: input.characterId },
      });
    }),

  transferByCharId: protectedProcedure
    .input(
      z.object({
        fromAddress: z.string(),
        toId: z.number(),
        amount: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const fromAccount = await ctx.db.bankAccount.findFirst({
        where: { address: input.fromAddress },
        select: { balance: true, id: true },
      });
      if (!fromAccount) return { message: "Не найден счёт отправителя" };
      if (fromAccount.balance < input.amount)
        return { message: "Недостаточно средств на счёте отправителя" };

      const toAccount = await ctx.db.bankAccount.findFirst({
        where: { characterId: input.toId },
        select: { balance: true, id: true },
      });
      if (!toAccount) return { message: "Не найден счёт получателя" };

      await ctx.db.bankAccount.update({
        where: { id: fromAccount.id },
        data: { balance: fromAccount.balance - input.amount },
      });
      await ctx.db.bankAccount.update({
        where: { id: toAccount.id },
        data: { balance: toAccount.balance + input.amount },
      });
      await ctx.db.ticket.create({
        data: {
          name: "Перевод ОВ",
          isResolved: true,
          characterId: input.toId,
          Message: {
            create: {
              content: `Вы получили ${input.amount} ОВ на счёт ${toAccount.address} со счёта ${input.fromAddress}`,
              isAdmin: true,
            },
          },
        },
      });
    }),

  transferByAddress: protectedProcedure
    .input(
      z.object({
        fromAddress: z.string(),
        toAddress: z.string(),
        amount: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const fromAccount = await ctx.db.bankAccount.findFirst({
        where: { address: input.fromAddress },
        select: { balance: true, id: true },
      });
      if (!fromAccount) return { message: "Не найден счёт отправителя" };
      if (fromAccount.balance < input.amount)
        return { message: "Недостаточно средств на счёте отправителя" };

      const toAccount = await ctx.db.bankAccount.findFirst({
        where: { address: input.toAddress },
        select: { balance: true, id: true, characterId: true },
      });
      if (!toAccount) return { message: "Не найден счёт получателя" };

      await ctx.db.bankAccount.update({
        where: { id: fromAccount.id },
        data: { balance: fromAccount.balance - input.amount },
      });
      await ctx.db.bankAccount.update({
        where: { id: toAccount.id },
        data: { balance: toAccount.balance + input.amount },
      });
      await ctx.db.ticket.create({
        data: {
          name: "Перевод ОВ",
          isResolved: true,
          characterId: toAccount.characterId,
          Message: {
            create: {
              content: `Вы получили ${input.amount} ОВ на счёт #${input.toAddress} со счёта ${input.fromAddress}`,
              isAdmin: true,
            },
          },
        },
      });
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        image: z.string(),
        content: z.string(),
        isVisible: z.boolean().optional(),
        isWarrens: z.boolean().optional(),
        coordX: z.number(),
        coordY: z.number(),
        characterId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const character = await ctx.db.char.findUnique({
        where: { id: input.characterId },
        include: { effects: { include: { effect: true } }, bankAccount: true },
      });
      if (!character) return { message: "Не найден персонаж" };
      const accountToUse = character.bankAccount.sort(
        (a, b) => b.balance - a.balance,
      )[0];
      if (!accountToUse)
        return { message: "Не найден счет для покупки", item: undefined };
      if (accountToUse.balance < 960)
        return { message: "Недостаточно средств для создания предприятия" };
      await ctx.db.bankAccount.update({
        where: { id: accountToUse.id },
        data: {
          balance: accountToUse.balance - 960,
        },
      });
      const characterIsWarrens = !!character.effects?.find((e) =>
        e.effect.name.includes("Канализация"),
      );
      const company = await ctx.db.company.create({
        data: {
          name: input.name,
          image: input.image,
          content: input.content,
          isVisible: input.isVisible ?? false,
          isWarrens: input.isWarrens ?? characterIsWarrens,
          coordX: input.coordX,
          coordY: input.coordY,
          characterId: input.characterId,
        },
      });
      await ctx.db.bankAccount.create({
        data: {
          characterId: input.characterId,
          companyId: company.id,
          address: (
            (Date.now() % 1000000) * 100 +
            Math.floor(Math.random() * 100)
          ).toString(),
          balance: 0,
        },
      });
    }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        image: z.string().optional(),
        isVisible: z.boolean().optional(),
        isWarrens: z.boolean().optional(),
        content: z.string().optional(),
      }),
    )
    .mutation(({ ctx, input }) => {
      return ctx.db.company.update({
        where: { id: input.id },
        data: {
          name: input.name,
          image: input.image,
          isVisible: input.isVisible,
          isWarrens: input.isWarrens,
          content: input.content,
        },
      });
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.company.delete({
        where: { id: input.id },
      });
      await ctx.db.bankAccount.deleteMany({
        where: { companyId: input.id },
      });
    }),
  upgrade: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const company = await ctx.db.company.findFirst({
        where: { id: input.id },
      });
      if (!company) return { message: "Не найдено предприятие" };
      const upgradeCost = company.level * 960 - 480;
      console.log(upgradeCost);
      if (company.level >= 10)
        return { message: "Предприятие уже вышло на 10 уровень" };
      const bankAccount = await ctx.db.bankAccount.findFirst({
        where: { companyId: input.id },
      });
      if (!bankAccount) return { message: "Отсутствует счёт предприятия" };
      if (bankAccount.balance < upgradeCost)
        return { message: "Недостаточно средств для повышения уровня" };
      await ctx.db.bankAccount.update({
        where: { id: bankAccount.id },
        data: {
          balance: bankAccount.balance - upgradeCost,
        },
      });
      await ctx.db.company.update({
        where: { id: input.id },
        data: { level: company.level + 1 },
      });
      return { message: "Уровень предприятия успешно повышен" };
    }),
  setLevel: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        level: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const company = await ctx.db.company.findFirst({
        where: { id: input.id },
        select: { level: true, id: true },
      });
      if (!company) return { message: "Не найдено предприятие" };
      await ctx.db.company.update({
        where: { id: company.id },
        data: { level: input.level },
      });
    }),
  toggleActive: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        charId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const company = await ctx.db.company.findFirst({
        where: { id: input.id },
      });
      if (!company) return { message: "Не найдено предприятие" };

      const character = await ctx.db.char.findUnique({
        where: { id: input.charId },
        include: {
          features: { include: { feature: true } },
          bankAccount: true,
        },
      });
      if (!character) return { message: "Не найден персонаж" };
      if (!character.bankAccount.length)
        return { message: "Не найден счет для персонажа" };

      if (
        (character.bankAccount.sort((a, b) => a.id - b.id)[0]?.balance ?? 0) <
        company.level * 960 - 480
      )
        return {
          message: `Недостаточно средств на счёте ${character.bankAccount.sort((a, b) => a.id - b.id)[0]?.address}`,
        };

      await ctx.db.company.update({
        where: { id: company.id },
        data: { isActive: !company.isActive },
      });

      if (company.isActive)
        await ctx.db.ticket.create({
          data: {
            name: "Саботаж предприятия",
            characterId: company.characterId,
            Message: {
              create: {
                content: `Ваше предприятие ${company.name} подверглось саботажу`,
                isAdmin: true,
              },
            },
          },
        });

      return {
        message: company.isActive
          ? "Успешный саботаж"
          : "Успешное восстановление",
      };
    }),
  racket: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        charId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const company = await ctx.db.company.findFirst({
        where: { id: input.id },
      });
      if (!company) return { message: "Не найдено предприятие" };

      const character = await ctx.db.char.findUnique({
        where: { id: input.charId },
        include: {
          features: { include: { feature: true } },
          bankAccount: true,
        },
      });
      if (!character) return { message: "Не найден персонаж" };
      if (!character.bankAccount.length)
        return { message: "Не найден счет для персонажа" };

      if (
        (character.bankAccount.sort((a, b) => a.id - b.id)[0]?.balance ?? 0) <
        (company.level - 1) * 3840 + 1920
      )
        return {
          message: `Недостаточно средств на счёте ${character.bankAccount.sort((a, b) => a.id - b.id)[0]?.address}`,
        };

      await ctx.db.ticket.create({
        data: {
          name: "Рэкет предприятия",
          characterId: company.characterId,
          Message: {
            create: {
              content: `${character.name} захватывает ваше предприятие ${company.name}`,
              isAdmin: true,
            },
          },
        },
      });

      await ctx.db.company.update({
        where: { id: company.id },
        data: { characterId: input.charId },
      });
      return { message: "Успешный рэкет" };
    }),
});
