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
  messages?: Message[];
};

export type Message = {
  id: number;
  ticketId: number;
  content: string;
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

export const utilRouter = createTRPCRouter({
  getTopDonate: publicProcedure.query(async ({ ctx }) => {
    const topDonate = await ctx.db.char.findFirst({
      orderBy: { bloodAmount: "desc" },
      include: { bankAccount: true },
    });
    return topDonate;
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

  getAllTickets: protectedProcedure.query(async ({ ctx }) => {
    const tickets = await ctx.db.ticket.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        character: { include: { faction: true, clan: true } },
        Message: true,
      },
    });
    const players = await ctx.db.user.findMany();
    return tickets.map((t) => ({
      ...t,
      player: players.find((p) => p.id === t.character.playerId),
      isAnswered: t.Message[t.Message.length - 1]?.isAdmin ?? false,
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
