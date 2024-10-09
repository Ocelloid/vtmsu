/* eslint-disable @typescript-eslint/prefer-for-of */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import type { User } from "~/server/api/routers/user";
import type {
  Character,
  Effect,
  Feature,
  Knowledge,
  Ability,
  Ritual,
} from "~/server/api/routers/char";
import type { BankAccount, Company } from "~/server/api/routers/econ";
import type { Item, ItemType } from "~/server/api/routers/item";
import { z } from "zod";

export type AppData = {
  id: number;
  createAllowed: boolean;
  editAllowed: boolean;
  gameAllowed: boolean;
  ticketsLimit: number;
  radius: number;
  frequency: number;
  changedById: string;
  wip: boolean;
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
  Message?: Message[];
};

export type Message = {
  id: number;
  ticketId: number;
  content: string | null;
  createdBy?: User | null;
  createdById?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type Coupon = {
  id: string;
  name: string;
  content: string;
  address: string;
  usage: number;
  createdAt?: Date | null;
  updatedAt?: Date | null;
  couponFeature?: CouponFeature[];
  couponAbility?: CouponAbility[];
  couponRitual?: CouponRitual[];
  couponKnowledge?: CouponKnowledge[];
  couponEffect?: CouponEffect[];
  couponBankAccount?: CouponBankAccount[];
  couponCompany?: CouponCompany[];
  couponItemType?: CouponItemType[];
  couponItem?: CouponItem[];
};

export type CouponFeature = {
  id: number;
  couponId: string;
  featureId: number;
  coupon?: Coupon;
  feature?: Feature;
};

export type CouponAbility = {
  id: number;
  couponId: string;
  abilityId: number;
  coupon?: Coupon;
  ability?: Ability;
};

export type CouponRitual = {
  id: number;
  couponId: string;
  ritualId: number;
  coupon?: Coupon;
  ritual?: Ritual;
};

export type CouponKnowledge = {
  id: number;
  couponId: string;
  knowledgeId: number;
  coupon?: Coupon;
  knowledge?: Knowledge;
};

export type CouponEffect = {
  id: number;
  couponId: string;
  effectId: number;
  coupon?: Coupon;
  effect?: Effect;
};

export type CouponBankAccount = {
  id: number;
  couponId: string;
  bankAccountId: number;
  coupon?: Coupon;
  bankAccount?: BankAccount;
};

export type CouponCompany = {
  id: number;
  couponId: string;
  companyId: string;
  coupon?: Coupon;
  company?: Company;
};

export type CouponItemType = {
  id: number;
  couponId: string;
  itemTypeId: number;
  coupon?: Coupon;
  itemType?: ItemType;
};

export type CouponItem = {
  id: number;
  couponId: string;
  itemId: number;
  coupon?: Coupon;
  item?: Item;
};

export type Donator = {
  address: string;
  name: string;
  amount: number;
};

export type HeartEffects = {
  id: number;
  content: string;
  focusId: number;
  focusName: string;
  ashesId: number;
  ashesName: string;
  charId: number;
  char: Character;
};

export const utilRouter = createTRPCRouter({
  // updateLocation: protectedProcedure
  //   .input(
  //     z.object({
  //       x: z.number(),
  //       y: z.number(),
  //       charId: z.number(),
  //     }),
  //   )
  //   .mutation(async ({ ctx, input }) => {
  //     const char = await ctx.db.char.findUnique({
  //       where: { id: input.charId },
  //       include: { features: { include: { feature: true } } },
  //     });
  //     if (!char) return { message: "Персонаж не найден" };
  //     await ctx.db.char.update({
  //       where: { charId: input.charId },
  //       data: {
  //         coordX: input.x,
  //         coordY: input.y,
  //       },
  //     });
  //   }),

  getHeart: publicProcedure.query(async ({ ctx }) => {
    const ashesContainer = await ctx.db.container.findFirst({
      where: { id: "cm20bsyip00057ajhnmubnnc3" },
      include: { Item: true },
    });
    const focusContainer = await ctx.db.container.findFirst({
      where: { id: "cm20btcot00067ajhrz2quog4" },
      include: { Item: true },
    });
    return { ashesContainer, focusContainer };
  }),

  getHeartUsage: protectedProcedure.query(async ({ ctx }) => {
    const heart = await ctx.db.heartEffects.findMany({
      include: { char: true },
      orderBy: { createdAt: "desc" },
    });
    const items = await ctx.db.item.findMany({
      include: {
        type: true,
        createdBy: true,
      },
    });
    return heart.map((h) => ({
      ...h,
      ashes: items.find((i) => i.id === h.ashesId),
      focus: items.find((i) => i.id === h.focusId),
    }));
  }),

  removeExpertAbilities: protectedProcedure
    .input(
      z.object({
        selectedClans: z.array(z.number()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const clans = await ctx.db.clan.findMany({
        where: { id: { in: input.selectedClans } },
      });
      await ctx.db.characterAbilities.deleteMany({
        where: {
          abilitiy: { expertise: true },
          Char: { clanId: { in: input.selectedClans } },
        },
      });
      return {
        message: `Убраны экспертные дисциплины у кланов: ${clans.map((c) => c.name).join(", ")}`,
      };
    }),

  giveExpertAbilities: protectedProcedure
    .input(
      z.object({
        selectedClans: z.array(z.number()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const characters = await ctx.db.char.findMany({
        where: { clanId: { in: input.selectedClans } },
      });
      const expertAbilities = await ctx.db.ability.findMany({
        where: { expertise: true },
        include: {
          AbilityAvailable: { include: { clan: true, ability: true } },
        },
      });
      const charactersWithAvailableAbilities = characters.map((c) => {
        const availableAbilities = expertAbilities.filter((a) =>
          a.AbilityAvailable.some((aa) => aa.clanId === c.clanId),
        );
        return {
          name: c.name,
          charId: c.id,
          clanId: c.clanId,
          abilitiesToGive: availableAbilities.map((aa) => ({
            id: aa.AbilityAvailable[0]?.abilityId ?? 0,
            name: aa.AbilityAvailable[0]?.ability.name,
          })),
        };
      });
      for (let i = 0; i < charactersWithAvailableAbilities.length; i++) {
        const char = charactersWithAvailableAbilities[i];
        if (!!char)
          await ctx.db.characterAbilities.createMany({
            data: char.abilitiesToGive.map((a) => {
              return { characterId: char.charId, abilityId: a.id };
            }),
          });
      }
      return {
        message: `Выданы экспертные дисциплины персонажам ${charactersWithAvailableAbilities
          .map(
            (c) =>
              `\n${
                c.name
              }: (${c.abilitiesToGive.map((a) => a.name).join(", ")})`,
          )
          .join("\n")}`,
      };
    }),

  removeClanCurse: protectedProcedure
    .input(
      z.object({
        selectedClans: z.array(z.number()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const characters = await ctx.db.char.findMany({
        where: { clanId: { in: input.selectedClans } },
      });
      await ctx.db.characterEffects.createMany({
        data: characters.map((c) => ({
          characterId: c.id,
          effectId: 74,
        })),
      });
      return {
        message: `Убрано клановое проклятье у персонажей ${characters.map((c) => `${c.name}`).join(", ")}`,
      };
    }),

  giveClanCurse: protectedProcedure
    .input(
      z.object({
        selectedClans: z.array(z.number()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const characters = await ctx.db.char.findMany({
        where: { clanId: { in: input.selectedClans } },
      });
      const availableEffects: Record<number, number> = {
        9: 75,
        6: 76,
        4: 77,
        5: 78,
        10: 79,
        8: 80,
        7: 81,
        3: 82,
        13: 83,
      };
      const effectsToGive = characters.map((c) => ({
        characterId: c.id,
        effectId: availableEffects[c.clanId] ?? 74,
      }));
      await ctx.db.characterEffects.createMany({
        data: effectsToGive,
      });
      return {
        message: `Выданы клановые проклятья персонажам ${characters
          .map(
            (c) =>
              `\n${c.name}: ${effectsToGive.map((e) => e.effectId).join(", ")}`,
          )
          .join(", ")}`,
      };
    }),

  setHeart: protectedProcedure
    .input(
      z.object({
        mode: z.string(),
        focusId: z.number(),
        ashesId: z.number(),
        characterId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      let message = "";

      const ashes = await ctx.db.item.findUnique({
        where: { id: input.ashesId },
      });
      if (!ashes || (ashes.typeId !== 10 && ashes.typeId !== 19)) {
        message =
          "Отсутствует прах. Сердце голодно и поглощает вас. Ваш персонаж встречает финальную смерть и обращается в прах.";
        await ctx.db.char.update({
          where: { id: input.characterId },
          data: { alive: false, bloodAmount: 0, health: 0 },
        });
      }

      const focus = await ctx.db.item.findUnique({
        where: { id: input.focusId },
      });
      if (!focus) {
        message =
          "Отсутствует фокус. Биение сердца обращается назад. Последний эффект отменён.";
        await ctx.db.heartEffects.create({
          data: {
            charId: input.characterId,
            content: "Последний эффект отменён.",
            focusId: 0,
            focusName: "Нет фокуса",
            ashesId: ashes?.id ?? 0,
            ashesName: ashes?.name ?? "Нет праха",
          },
        });
        return { message };
      }

      switch (input.mode) {
        case "ascend":
          message = message + "\nПерсонажи получают экспертные дисциплины";
          await ctx.db.heartEffects.create({
            data: {
              charId: input.characterId,
              content: "Персонажи получают экспертные дисциплины",
              focusId: focus?.id ?? 0,
              focusName: focus?.name ?? "Нет фокуса",
              ashesId: ashes?.id ?? 0,
              ashesName: ashes?.name ?? "Нет праха",
            },
          });
          break;
        case "descend":
          message = message + "\nПерсонажи теряют экспертные дисциплины";
          await ctx.db.heartEffects.create({
            data: {
              charId: input.characterId,
              content: "Персонажи теряют экспертные дисциплины",
              focusId: focus?.id ?? 0,
              focusName: focus?.name ?? "Нет фокуса",
              ashesId: ashes?.id ?? 0,
              ashesName: ashes?.name ?? "Нет праха",
            },
          });
          break;
        case "bless":
          message = message + "\nПерсонажи теряют клановое проклятье";
          await ctx.db.heartEffects.create({
            data: {
              charId: input.characterId,
              content: "Персонажи теряют клановое проклятье",
              focusId: focus?.id ?? 0,
              focusName: focus?.name ?? "Нет фокуса",
              ashesId: ashes?.id ?? 0,
              ashesName: ashes?.name ?? "Нет праха",
            },
          });
          break;
        case "curse":
          message = message + "\nПерсонажи получают клановое проклятье";
          await ctx.db.heartEffects.create({
            data: {
              charId: input.characterId,
              content: "Персонажи получают клановое проклятье",
              focusId: focus?.id ?? 0,
              focusName: focus?.name ?? "Нет фокуса",
              ashesId: ashes?.id ?? 0,
              ashesName: ashes?.name ?? "Нет праха",
            },
          });
          break;
        default:
          break;
      }
      if (!!focus)
        await ctx.db.item.update({
          where: { id: focus.id },
          data: { containerId: null },
        });
      if (!!ashes)
        await ctx.db.item.update({
          where: { id: ashes.id },
          data: { containerId: null },
        });
      return { message };
    }),

  getTopDonate: publicProcedure.query(async ({ ctx }) => {
    const transactions = await ctx.db.transaction.findMany({
      where: { accountToAddress: "58400810" },
    });
    const bankAccounts = await ctx.db.bankAccount.findMany({
      where: {
        address: {
          in: transactions.map((t) => t.accountFromAddress),
        },
      },
      include: { character: true },
    });
    const accounts = transactions.map((t) => ({
      address: t.accountFromAddress,
      name: "",
      amount: 0,
    }));
    return accounts
      .map((a) => {
        const bankAccount = bankAccounts.find((b) => b.address === a.address);
        const total = transactions
          .filter((t) => t.accountFromAddress === a.address)
          .reduce((acc, t) => acc + t.amount, 0);
        return {
          address: a.address,
          name: bankAccount?.character?.name ?? "",
          amount: total,
        };
      })
      .sort((a, b) => b.amount - a.amount)
      .reduce((acc, curr) => {
        if (!acc.find((a) => a.address === curr.address)) {
          acc.push(curr);
        }
        return acc;
      }, [] as Donator[]);
  }),
  createCharacterBalances: protectedProcedure.mutation(async ({ ctx }) => {
    const characters = await ctx.db.char.findMany({
      include: { bankAccount: true },
    });
    const charactersWithoutBankAccounts = characters.filter(
      (c) => !c.bankAccount.length,
    );
    await ctx.db.bankAccount.createMany({
      data: charactersWithoutBankAccounts.map((c) => ({
        characterId: c.id,
        companyId: null,
        address: (
          (Date.now() % 1000000) * 100 +
          c.id.toString() +
          Math.floor(Math.random() * 100)
        ).toString(),
        balance: 240,
      })),
    });
  }),

  pushCompanyBalances: protectedProcedure.query(async ({ ctx }) => {
    await ctx.db.bankAccount.updateMany({
      where: { company: { level: 1 } },
      data: { balance: { increment: 1 } },
    });
    await ctx.db.bankAccount.updateMany({
      where: { company: { level: 2 } },
      data: { balance: { increment: 3 } },
    });
    await ctx.db.bankAccount.updateMany({
      where: { company: { level: 3 } },
      data: { balance: { increment: 5 } },
    });
    await ctx.db.bankAccount.updateMany({
      where: { company: { level: 4 } },
      data: { balance: { increment: 7 } },
    });
    await ctx.db.bankAccount.updateMany({
      where: { company: { level: 5 } },
      data: { balance: { increment: 9 } },
    });
    await ctx.db.bankAccount.updateMany({
      where: { company: { level: 6 } },
      data: { balance: { increment: 11 } },
    });
    await ctx.db.bankAccount.updateMany({
      where: { company: { level: 7 } },
      data: { balance: { increment: 13 } },
    });
    await ctx.db.bankAccount.updateMany({
      where: { company: { level: 8 } },
      data: { balance: { increment: 15 } },
    });
    await ctx.db.bankAccount.updateMany({
      where: { company: { level: 9 } },
      data: { balance: { increment: 17 } },
    });
    await ctx.db.bankAccount.updateMany({
      where: { company: { level: 10 } },
      data: { balance: { increment: 19 } },
    });
    return await ctx.db.bankAccount.findMany({ include: { company: true } });
  }),
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
        frequency: z.number().optional(),
        wip: z.boolean().optional(),
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
          frequency: input.frequency ?? oldData?.frequency,
          changedById: ctx.session.user.id,
          wip: input.wip ?? oldData?.wip,
        },
      });
    }),

  getAllTickets: protectedProcedure
    .input(z.object({ search: z.string() }))
    .query(async ({ ctx, input }) => {
      const tickets = await ctx.db.ticket.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          character: { include: { faction: true, clan: true } },
          Message: true,
        },
      });
      const filteredTickets = tickets?.filter(
        (t) =>
          t.name.toLowerCase().includes(input.search.toLowerCase()) ||
          t.Message?.some((m) =>
            m.content?.toLowerCase().includes(input.search.toLowerCase()),
          ),
      );
      const players = await ctx.db.user.findMany();
      return filteredTickets.map((t) => ({
        id: t.id,
        name: t.name,
        characterId: t.characterId,
        isResolved: t.isResolved,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
        character: t.character,
        player: players.find((p) => p.id === t.character.playerId),
        isAnswered: t.Message[t.Message.length - 1]?.isAdmin ?? false,
      }));
    }),
  getMessagesByTicketId: protectedProcedure
    .input(z.object({ ticketId: z.number() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.message.findMany({
        where: { ticketId: input.ticketId },
        include: { createdBy: true },
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
          createdById: ctx.session.user.id,
        },
      });
    }),
  editMessage: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        content: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const message = await ctx.db.message.findUnique({
        where: { id: input.id },
      });
      if (!message) return;
      return ctx.db.message.update({
        where: { id: input.id },
        data: {
          content: input.content,
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
        data: { isResolved: !ticket.isResolved },
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

  getAllCoupons: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.coupon.findMany({
      include: {
        CouponFeature: { include: { feature: true } },
        CouponAbility: { include: { ability: true } },
        CouponRitual: { include: { ritual: true } },
        CouponKnowledge: { include: { knowledge: true } },
        CouponEffect: { include: { effect: true } },
        CouponBankAccount: { include: { bankAccount: true } },
        CouponCompany: { include: { company: true } },
        CouponItemType: { include: { itemType: true } },
        CouponItem: { include: { item: true } },
      },
    });
  }),

  getCouponById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.coupon.findUnique({
        where: { id: input.id },
        include: {
          CouponFeature: { include: { feature: true } },
          CouponAbility: { include: { ability: true } },
          CouponRitual: { include: { ritual: true } },
          CouponKnowledge: { include: { knowledge: true } },
          CouponEffect: { include: { effect: true } },
          CouponBankAccount: { include: { bankAccount: true } },
          CouponCompany: { include: { company: true } },
          CouponItemType: { include: { itemType: true } },
          CouponItem: { include: { item: true } },
        },
      });
    }),

  getCouponByAddress: protectedProcedure
    .input(z.object({ address: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.coupon.findFirst({
        where: { address: input.address },
        include: {
          CouponFeature: { include: { feature: true } },
          CouponAbility: { include: { ability: true } },
          CouponRitual: { include: { ritual: true } },
          CouponKnowledge: { include: { knowledge: true } },
          CouponEffect: { include: { effect: true } },
          CouponBankAccount: { include: { bankAccount: true } },
          CouponCompany: { include: { company: true } },
          CouponItemType: { include: { itemType: true } },
          CouponItem: { include: { item: true } },
        },
      });
    }),

  createCoupon: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        content: z.string().min(1),
        address: z.string().min(1),
        usage: z.number().int(),
        featureIds: z.array(z.number()),
        abilityIds: z.array(z.number()),
        ritualIds: z.array(z.number()),
        knowledgeIds: z.array(z.number()),
        effectIds: z.array(z.number()),
        bankAccountIds: z.array(z.number()),
        companyIds: z.array(z.string()),
        itemTypeIds: z.array(z.number()),
        itemIds: z.array(z.number()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.coupon.create({
        data: {
          name: input.name,
          content: input.content,
          address: input.address,
          usage: input.usage,
          CouponFeature: {
            createMany: {
              data: input.featureIds.map((a) => {
                return { featureId: a };
              }),
            },
          },
          CouponAbility: {
            createMany: {
              data: input.abilityIds.map((a) => {
                return { abilityId: a };
              }),
            },
          },
          CouponRitual: {
            createMany: {
              data: input.ritualIds.map((a) => {
                return { ritualId: a };
              }),
            },
          },
          CouponKnowledge: {
            createMany: {
              data: input.knowledgeIds.map((a) => {
                return { knowledgeId: a };
              }),
            },
          },
          CouponEffect: {
            createMany: {
              data: input.effectIds.map((a) => {
                return { effectId: a };
              }),
            },
          },
          CouponBankAccount: {
            createMany: {
              data: input.bankAccountIds.map((a) => {
                return { bankAccountId: a };
              }),
            },
          },
          CouponCompany: {
            createMany: {
              data: input.companyIds.map((a) => {
                return { companyId: a };
              }),
            },
          },
          CouponItemType: {
            createMany: {
              data: input.itemTypeIds.map((a) => {
                return { itemTypeId: a };
              }),
            },
          },
          CouponItem: {
            createMany: {
              data: input.itemIds.map((a) => {
                return { itemId: a };
              }),
            },
          },
        },
      });
    }),

  deleteCoupon: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const coupon = await ctx.db.coupon.findUnique({
        where: { id: input.id },
      });
      if (!coupon) return;
      await ctx.db.coupon.delete({
        where: { id: input.id },
      });
    }),

  applyCoupon: protectedProcedure
    .input(z.object({ address: z.string(), charId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const coupon = await ctx.db.coupon.findFirst({
        where: { address: input.address },
        include: {
          CouponFeature: { include: { feature: true } },
          CouponAbility: { include: { ability: true } },
          CouponRitual: { include: { ritual: true } },
          CouponKnowledge: { include: { knowledge: true } },
          CouponEffect: { include: { effect: true } },
          CouponBankAccount: { include: { bankAccount: true } },
          CouponCompany: { include: { company: true } },
          CouponItemType: { include: { itemType: true } },
          CouponItem: { include: { item: true } },
        },
      });
      if (!coupon) return { message: "Купон не найден" };
      if (coupon.usage === 0) return { message: "Купон истёк" };
      if (coupon.usage > 0)
        await ctx.db.coupon.update({
          where: { id: coupon.id },
          data: { usage: { decrement: 1 } },
        });
      const features = coupon.CouponFeature.map((a) => a.feature);
      const abilities = coupon.CouponAbility.map((a) => a.ability);
      const rituals = coupon.CouponRitual.map((a) => a.ritual);
      const knowledges = coupon.CouponKnowledge.map((a) => a.knowledge);
      const effects = coupon.CouponEffect.map((a) => a.effect);
      const bankAccounts = coupon.CouponBankAccount.map((a) => a.bankAccount);
      const companies = coupon.CouponCompany.map((a) => a.company);
      const itemTypes = coupon.CouponItemType.map((a) => a.itemType);
      const items = coupon.CouponItem.map((a) => a.item);
      if (features.length > 0) {
        await ctx.db.characterFeatures.createMany({
          data: features.map((a) => {
            return {
              characterId: input.charId,
              featureId: a.id,
            };
          }),
        });
      }
      if (abilities.length > 0) {
        await ctx.db.characterAbilities.createMany({
          data: abilities.map((a) => {
            return {
              characterId: input.charId,
              abilityId: a.id,
            };
          }),
        });
      }
      if (rituals.length > 0) {
        await ctx.db.characterRituals.createMany({
          data: rituals.map((a) => {
            return {
              characterId: input.charId,
              ritualId: a.id,
            };
          }),
        });
      }
      if (knowledges.length > 0) {
        await ctx.db.characterKnowledges.createMany({
          data: knowledges.map((a) => {
            return {
              characterId: input.charId,
              knowledgeId: a.id,
            };
          }),
        });
      }
      if (effects.length > 0) {
        await ctx.db.characterEffects.createMany({
          data: effects.map((a) => {
            return {
              characterId: input.charId,
              effectId: a.id,
              expires: new Date(
                new Date().getTime() + a.expiration * 60 * 1000,
              ),
            };
          }),
        });
      }
      if (bankAccounts.length > 0) {
        await ctx.db.bankAccount.createMany({
          data: bankAccounts.map((a) => {
            return {
              characterId: input.charId,
              bankAccountId: a.id,
              address: (
                (Date.now() % 1000000) * 100 +
                Math.floor(Math.random() * 100)
              ).toString(),
              balance: 0,
            };
          }),
        });
      }
      if (companies.length > 0) {
        await ctx.db.company.updateMany({
          where: { id: { in: companies.map((a) => a.id) } },
          data: { characterId: input.charId },
        });
      }
      if (items.length > 0) {
        await ctx.db.item.updateMany({
          where: { id: { in: items.map((a) => a.id) } },
          data: { ownedById: input.charId },
        });
      }
      if (itemTypes.length > 0) {
        await ctx.db.item.createMany({
          data: itemTypes.map((a) => {
            return {
              name: a.name,
              content: a.content,
              image: a.image,
              typeId: a.id,
              ownedById: input.charId,
              createdById: ctx.session.user.id,
            };
          }),
        });
      }
      return {
        message: `Купон успешно применён. Ваш персонаж получает: ${
          !!features.length
            ? `\n- Дополнения ${features.map((f) => f.name).join(", ")}`
            : ""
        }${
          !!abilities.length
            ? `\n- Дисциплины ${abilities.map((a) => a.name).join(", ")}`
            : ""
        }${
          !!rituals.length
            ? `\n- Ритуалы ${rituals.map((r) => r.name).join(", ")}`
            : ""
        }${
          !!knowledges.length
            ? `\n- Знания ${knowledges.map((k) => k.name).join(", ")}`
            : ""
        }${
          !!effects.length
            ? `\n- Эффекты ${effects.map((e) => e.name).join(", ")}`
            : ""
        }${
          !!bankAccounts.length
            ? `\n- Счета ${bankAccounts.map((b) => b.address).join(", ")}`
            : ""
        }${
          !!companies.length
            ? `\n- Предприятия ${companies.map((c) => c.name).join(", ")}`
            : ""
        }${
          !!itemTypes.length
            ? `\n- Предметы ${itemTypes.map((i) => i.name).join(", ")}`
            : ""
        }${
          !!items.length
            ? `\n- Предметы ${items.map((i) => i.name).join(", ")}`
            : ""
        }`,
      };
    }),

  updateCoupon: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1),
        content: z.string().min(1),
        address: z.string().min(1),
        usage: z.number().int(),
        featureIds: z.array(z.number()).optional(),
        abilityIds: z.array(z.number()).optional(),
        ritualIds: z.array(z.number()).optional(),
        knowledgeIds: z.array(z.number()).optional(),
        effectIds: z.array(z.number()).optional(),
        bankAccountIds: z.array(z.number()).optional(),
        companyIds: z.array(z.string()).optional(),
        itemTypeIds: z.array(z.number()).optional(),
        itemIds: z.array(z.number()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const coupon = await ctx.db.coupon.findUnique({
        where: { id: input.id },
      });
      if (!coupon) return;
      await ctx.db.coupon.update({
        where: { id: input.id },
        data: {
          name: input.name,
          content: input.content,
          address: input.address,
          usage: input.usage,
        },
      });
      if (input.featureIds) {
        await ctx.db.couponFeature.deleteMany({
          where: { couponId: input.id },
        });
        await ctx.db.couponFeature.createMany({
          data: input.featureIds.map((a) => {
            return { couponId: input.id, featureId: a };
          }),
        });
      }
      if (input.abilityIds) {
        await ctx.db.couponAbility.deleteMany({
          where: { couponId: input.id },
        });
        await ctx.db.couponAbility.createMany({
          data: input.abilityIds.map((a) => {
            return { couponId: input.id, abilityId: a };
          }),
        });
      }
      if (input.ritualIds) {
        await ctx.db.couponRitual.deleteMany({
          where: { couponId: input.id },
        });
        await ctx.db.couponRitual.createMany({
          data: input.ritualIds.map((a) => {
            return { couponId: input.id, ritualId: a };
          }),
        });
      }
      if (input.knowledgeIds) {
        await ctx.db.couponKnowledge.deleteMany({
          where: { couponId: input.id },
        });
        await ctx.db.couponKnowledge.createMany({
          data: input.knowledgeIds.map((a) => {
            return { couponId: input.id, knowledgeId: a };
          }),
        });
      }
      if (input.effectIds) {
        await ctx.db.couponEffect.deleteMany({
          where: { couponId: input.id },
        });
        await ctx.db.couponEffect.createMany({
          data: input.effectIds.map((a) => {
            return { couponId: input.id, effectId: a };
          }),
        });
      }
      if (input.bankAccountIds) {
        await ctx.db.couponBankAccount.deleteMany({
          where: { couponId: input.id },
        });
        await ctx.db.couponBankAccount.createMany({
          data: input.bankAccountIds.map((a) => {
            return { couponId: input.id, bankAccountId: a };
          }),
        });
      }
      if (input.companyIds) {
        await ctx.db.couponCompany.deleteMany({
          where: { couponId: input.id },
        });
        await ctx.db.couponCompany.createMany({
          data: input.companyIds.map((a) => {
            return { couponId: input.id, companyId: a };
          }),
        });
      }
      if (input.itemTypeIds) {
        await ctx.db.couponItemType.deleteMany({
          where: { couponId: input.id },
        });
        await ctx.db.couponItemType.createMany({
          data: input.itemTypeIds.map((a) => {
            return { couponId: input.id, itemTypeId: a };
          }),
        });
      }
      if (input.itemIds) {
        await ctx.db.couponItem.deleteMany({
          where: { couponId: input.id },
        });
        await ctx.db.couponItem.createMany({
          data: input.itemIds.map((a) => {
            return { couponId: input.id, itemId: a };
          }),
        });
      }
    }),
});
