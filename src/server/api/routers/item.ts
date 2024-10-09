/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { z } from "zod";
import type { Ability, Effect, Character } from "~/server/api/routers/char";
import type { User } from "~/server/api/routers/user";
import type { Ticket } from "~/server/api/routers/util";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export type Container = {
  id: string;
  name: string;
  content?: string | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
  Item?: Item[];
};

export type Item = {
  id?: number;
  name: string;
  typeId: number;
  usage: number;
  image?: string | null;
  content?: string | null;
  animalismData?: string | null;
  auspexData?: string | null;
  hackerData?: string | null;
  createdById: string;
  createdAt?: Date | null;
  updatedAt?: Date | null;
  createdBy?: User | null;
  type?: ItemType | null;
  coordX?: number | null;
  coordY?: number | null;
  isTrash?: boolean | null;
  isTradable?: boolean | null;
  ownedById?: number | null;
  lastOwnedById?: number | null;
  lastUsedById?: number | null;
  ownedBy?: Character | null;
  containerId?: string | null;
  container?: Container | null;
  Ticket?: Ticket[];
};

export type ItemType = {
  id?: number;
  name: string;
  image?: string | null;
  cost: number;
  usage: number;
  content: string;
  createdAt?: Date;
  updatedAt?: Date;
  costIncrease?: number | null;
  isPurchasable?: boolean | null;
  animalismData?: string | null;
  auspexData?: string | null;
  hackerData?: string | null;
  bloodAmount: number;
  bloodPool: number;
  violation?: string | null;
  status?: string | null;
  boon?: string | null;
  companyLevels: number;
  Item?: Item[] | null;
  isTrash?: boolean | null;
  isTradable?: boolean | null;
  AddingAbility?: AddingAbility[] | null;
  RemovingAbility?: RemovingAbility[] | null;
  UsingAbility?: UsingAbility[] | null;
  ItemEffects?: ItemEffects[] | null;
};

export type ItemEffects = {
  id?: number;
  typeId: number;
  effectId: number;
  expires?: Date | null;
  effect?: Effect;
  ItemType?: ItemType;
};

export type AddingAbility = {
  id?: number;
  itemTypeId: number;
  abilityId: number;
  ability?: Ability;
  ItemType?: ItemType;
};

export type RemovingAbility = {
  id?: number;
  itemTypeId: number;
  abilityId: number;
  ability?: Ability;
  ItemType?: ItemType;
};

export type UsingAbility = {
  id?: number;
  itemTypeId: number;
  abilityId: number;
  ability?: Ability;
  ItemType?: ItemType;
};

export const itemRouter = createTRPCRouter({
  createContainer: protectedProcedure
    .input(
      z.object({ name: z.string().min(1), content: z.string().optional() }),
    )
    .mutation(async ({ ctx, input }) => {
      const container = await ctx.db.container.create({
        data: {
          name: input.name,
          content: input.content,
        },
      });
      return container;
    }),

  deleteContainer: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.container.delete({
        where: { id: input.id },
      });
    }),

  updateContainer: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1),
        content: z.string().nullish(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.container.update({
        where: { id: input.id },
        data: {
          name: input.name,
          content: input.content,
        },
      });
    }),

  getAllContainers: protectedProcedure.query(({ ctx }) => {
    return ctx.db.container.findMany({ include: { Item: true } });
  }),

  getContainerById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.container.findFirst({
        where: { id: input.id },
        include: { Item: true },
      });
    }),

  putItemInContainer: protectedProcedure
    .input(
      z.object({
        containerId: z.string(),
        itemId: z.number(),
        itemOwnerId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.item.update({
        where: { id: input.itemId },
        data: {
          containerId: input.containerId,
          lastOwnedById: input.itemOwnerId,
          ownedById: null,
        },
      });
    }),

  putItemsInContainer: protectedProcedure
    .input(
      z.object({
        containerId: z.string(),
        itemIds: z.array(z.number()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.item.updateMany({
        where: { id: { in: input.itemIds } },
        data: {
          containerId: input.containerId,
          lastOwnedById: null,
          ownedById: null,
        },
      });
      const newItems = await ctx.db.item.findMany({
        where: { id: { in: input.itemIds } },
      });
      return newItems;
    }),

  takeItemFromContainer: protectedProcedure
    .input(
      z.object({
        containerId: z.string(),
        itemId: z.number(),
        itemOwnerId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.item.update({
        where: { id: input.itemId },
        data: {
          containerId: null,
          ownedById: input.itemOwnerId,
        },
      });
    }),

  takeItemsFromContainer: protectedProcedure
    .input(
      z.object({
        containerId: z.string(),
        itemOwnerId: z.number(),
        itemIds: z.array(z.number()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.item.updateMany({
        where: { id: { in: input.itemIds } },
        data: {
          containerId: null,
          ownedById: input.itemOwnerId,
        },
      });
    }),

  purchase: protectedProcedure
    .input(z.object({ id: z.number(), charId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const char = await ctx.db.char.findFirst({
        where: { id: input.charId },
        include: {
          bankAccount: true,
        },
      });
      if (!char) return { message: "Персонаж не найден", item: undefined };

      const itemType = await ctx.db.itemType.findFirst({
        where: { id: input.id },
      });
      if (!itemType) return { message: "Товар не найден", item: undefined };
      if (!itemType.isPurchasable)
        return { message: "Товар не доступен", item: undefined };

      const accountToUse = char.bankAccount.sort(
        (a, b) => b.balance - a.balance,
      )[0];
      if (!accountToUse)
        return { message: "Не найден счет для покупки", item: undefined };
      if (itemType.cost > accountToUse.balance)
        return {
          message: `Недостаточно средств на счёте ${accountToUse.address}`,
          item: undefined,
        };
      await ctx.db.bankAccount.update({
        where: { id: accountToUse.id },
        data: {
          balance: accountToUse.balance - itemType.cost,
        },
      });
      await ctx.db.itemType.update({
        where: { id: itemType.id },
        data: {
          cost: Math.floor(itemType.cost * (1 + itemType.costIncrease / 100)),
        },
      });
      const item = await ctx.db.item.create({
        data: {
          name:
            itemType.name +
            (itemType.id === 6
              ? ` ${
                  (Date.now() % 1000000) * 100 + Math.floor(Math.random() * 100)
                }`
              : ""),
          content: itemType.content,
          auspexData: itemType.auspexData,
          animalismData: itemType.animalismData,
          hackerData: itemType.hackerData,
          image: itemType.image,
          usage: itemType.usage,
          typeId: itemType.id,
          ownedById: input.charId,
          lastOwnedById: input.charId,
          createdById: ctx.session.user.id,
        },
      });
      return { message: "", item: item };
    }),
  getPurchasables: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.itemType.findMany({
      where: { isPurchasable: true },
    });
  }),
  applyItem: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        charId: z.number(),
        coordX: z.number(),
        coordY: z.number(),
        companyId: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const item = await ctx.db.item.findUnique({
        where: { id: input.id },
        include: {
          type: {
            include: {
              AddingAbility: true,
              RemovingAbility: true,
              UsingAbility: {
                include: {
                  ability: {
                    include: { AbilityEffects: { include: { effect: true } } },
                  },
                },
              },
              ItemEffects: { include: { effect: true } },
            },
          },
        },
      });
      if (!item) return { message: "Предмет не найден" };

      if (item.usage === 0) return { message: "Предмет нельзя использовать" };

      const char = await ctx.db.char.findUnique({
        where: { id: input.charId },
        include: {
          features: { include: { feature: true } },
          effects: { include: { effect: true } },
        },
      });
      if (!char) return { message: "Персонаж не найден" };

      if (!!item.type.ItemEffects?.length) {
        const effects = item.type.ItemEffects.map((a) => ({
          id: a.effectId,
          expiration: a.effect.expiration,
        }));
        await ctx.db.characterEffects.createMany({
          data: effects.map((effect) => ({
            effectId: effect.id,
            expires: new Date(
              new Date().getTime() + effect.expiration * 60 * 1000,
            ),
            characterId: input.charId,
          })),
        });
      }

      if (!!item.type.UsingAbility?.length) {
        const abilityEffects = item.type.UsingAbility.map((a) =>
          a.ability.AbilityEffects.map((ae) => ae),
        );
        const effects = abilityEffects.flat();
        await ctx.db.characterEffects.createMany({
          data: effects.map((e) => ({
            effectId: e.effectId,
            characterId: input.charId,
            expires: new Date(
              new Date().getTime() + e.effect.expiration * 60 * 1000,
            ),
          })),
        });
      }

      if (!!item.type.RemovingAbility?.length) {
        await ctx.db.characterAbilities.deleteMany({
          where: {
            characterId: input.charId,
            abilityId: {
              in: item.type.RemovingAbility.map((a) => {
                return a.abilityId;
              }),
            },
          },
        });
      }

      if (!!item.type.AddingAbility?.length) {
        await ctx.db.char.update({
          where: { id: input.charId },
          data: {
            additionalAbilities: char.additionalAbilities + 1,
            abilities: {
              createMany: {
                data: item.type.AddingAbility.map((a) => {
                  return { abilityId: a.abilityId };
                }),
              },
            },
          },
        });
      }

      if (!!item.type.companyLevels && !!input.companyId) {
        const company = await ctx.db.company.findUnique({
          where: { id: input.companyId },
        });
        if (!company) return { message: "Компания не найдена" };
        await ctx.db.company.update({
          where: { id: input.companyId },
          data: {
            level: company.level + item.type.companyLevels,
          },
        });
      }

      if (!!item.type.status) {
        await ctx.db.char.update({
          where: { id: input.charId },
          data: {
            status: char.status + ", " + item.type.status,
          },
        });
      }

      if (!!item.type.bloodAmount) {
        if (
          !!char.features.find((f) => f.featureId === 36) &&
          (item.type.id === 2 || item.type.id === 3 || item.type.id === 4)
        )
          return { message: "Вас насыщает только кровь вампиров" };
        if (
          !!char.features.find((f) => f.featureId === 31) &&
          (item.type.id === 2 || item.type.id === 3 || item.type.id === 4)
        )
          return { message: "Вас не насыщает кровь из пакетов" };
        const newBloodAmount = char.bloodAmount + item.type.bloodAmount;
        const hasConcentratedBlood = char.features.some((f) =>
          f.feature.name.includes("Концентрированная кровь"),
        );
        const maxPool = char.bloodPool + (hasConcentratedBlood ? 2 : 0);
        await ctx.db.char.update({
          where: { id: input.charId },
          data: {
            bloodAmount: newBloodAmount > maxPool ? maxPool : newBloodAmount,
          },
        });
      }

      if (!!item.type.bloodPool) {
        await ctx.db.char.update({
          where: { id: input.charId },
          data: {
            bloodPool: char.bloodPool + item.type.bloodPool,
          },
        });
      }

      if (!!item.type.violation) {
        const huntData = await ctx.db.huntingData.create({
          data: {
            name: "Нарушение маскарада",
            descs: {
              createMany: {
                data: [
                  {
                    content: item.type.violation,
                  },
                ],
              },
            },
          },
        });
        const newInstance = await ctx.db.huntingInstance.create({
          data: {
            coordX: input.coordX,
            coordY: input.coordY,
            targetId: huntData.id,
          },
        });
        await ctx.db.hunt.create({
          data: {
            instanceId: newInstance.id,
            characterId: input.charId,
            createdById: ctx.session.user.id,
            status: "masq_failure",
          },
        });
      }

      await ctx.db.item.update({
        where: { id: input.id },
        data: {
          usage: item.usage > 0 ? item.usage - 1 : -1,
          isTrash: item.usage - 1 === 0,
          lastUsedById: input.charId,
        },
      });

      return { message: "" };
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        address: z.string().optional(),
        content: z.string().nullish(),
        typeId: z.number().optional(),
        image: z.string().optional(),
        usage: z.number().optional(),
        coordX: z.number().optional(),
        coordY: z.number().optional(),
        ownedById: z.number().optional(),
        containerId: z.string().optional(),
        auspexData: z.string().optional(),
        animalismData: z.string().optional(),
        hackerData: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      ctx.db.item
        .create({
          data: {
            name: input.name,
            address: input.address,
            content: input.content,
            image: input.image,
            usage: input.usage,
            coordX: input.coordX,
            coordY: input.coordY,
            ownedById: input.ownedById ?? 89,
            lastOwnedById: input.ownedById,
            createdById: ctx.session.user.id,
            containerId: input.containerId,
            auspexData: input.auspexData,
            animalismData: input.animalismData,
            hackerData: input.hackerData,
          },
        })
        .then((item) => {
          return ctx.db.item.update({
            where: { id: item.id },
            data: {
              typeId: input.typeId,
            },
          });
        })
        .catch((err) => {
          console.error(err);
        });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.item.delete({
        where: { id: input.id },
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1),
        address: z.string().optional(),
        typeId: z.number().optional(),
        image: z.string().optional(),
        content: z.string().nullish(),
        usage: z.number().optional(),
        coordX: z.number().optional(),
        coordY: z.number().optional(),
        ownedById: z.number().optional(),
        containerId: z.string().optional(),
        auspexData: z.string().optional(),
        animalismData: z.string().optional(),
        hackerData: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const item = await ctx.db.item.findUnique({
        where: { id: input.id },
      });
      if (!item) return { message: "Предмет не найден" };
      const newItem = await ctx.db.item.update({
        where: { id: input.id },
        data: {
          name: input.name,
          address: input.address,
          typeId: input.typeId,
          image: input.image,
          content: input.content,
          usage: input.usage,
          coordX: input.coordX,
          coordY: input.coordY,
          ownedById: input.ownedById,
          auspexData: input.auspexData,
          containerId: input.containerId,
          animalismData: input.animalismData,
          hackerData: input.hackerData,
          lastOwnedById:
            input.ownedById === item.ownedById
              ? item.lastOwnedById
              : item.ownedById,
        },
      });
      return { message: "Предмет изменён", item: newItem };
    }),

  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.item.findFirst({
        where: { id: input.id },
      });
    }),

  getByAddress: publicProcedure
    .input(z.object({ address: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.item.findFirst({
        where: { address: input.address },
      });
    }),

  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.db.item.findMany({ include: { type: true } });
  }),

  getLatest: protectedProcedure.query(({ ctx }) => {
    return ctx.db.item.findFirst({
      orderBy: { createdAt: "desc" },
      where: { createdBy: { id: ctx.session.user.id } },
    });
  }),

  getByOwnerId: protectedProcedure
    .input(z.object({ ownerId: z.number(), getTrash: z.boolean().optional() }))
    .query(({ ctx, input }) => {
      return ctx.db.item.findMany({
        where: { ownedById: input.ownerId, isTrash: input.getTrash ?? false },
      });
    }),

  giveItems: protectedProcedure
    .input(
      z.object({
        ids: z.array(z.number()),
        ownerId: z.number(),
        previousOwnerId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.item.updateMany({
        where: { id: { in: input.ids } },
        data: {
          ownedById: input.ownerId,
          lastOwnedById: input.previousOwnerId,
        },
      });
    }),

  collectItem: protectedProcedure
    .input(z.object({ id: z.number(), charId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const item = await ctx.db.item.findFirst({
        where: { id: input.id },
      });
      if (!item) return { message: "Предмет не найден" };

      await ctx.db.item.update({
        where: { id: input.id },
        data: {
          ownedById: input.charId,
          coordX: null,
          coordY: null,
        },
      });

      return { message: "" };
    }),

  bleed: protectedProcedure
    .input(z.object({ charId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const char = await ctx.db.char.findFirst({
        where: { id: input.charId },
      });
      if (!char) return { message: "Персонаж не найден" };
      if (char.bloodAmount < 2) return { message: "Недостаточно крови" };
      if (char.health < 2) return { message: "Недостаточно здоровья" };
      await ctx.db.char.update({
        where: { id: input.charId },
        data: {
          bloodAmount: char.bloodAmount - 1,
          health: char.health - 1,
        },
      });
      await ctx.db.item.create({
        data: {
          name: `Витэ персонажа ${char.name}`,
          content: `Витэ персонажа ${char.name}`,
          image:
            "https://utfs.io/f/49b78d7d-4bd0-4ebe-b8f4-4be4eb593fe3-1ut81x.png",
          usage: 1,
          typeId: 5,
          ownedById: input.charId,
          lastOwnedById: input.charId,
          createdById: ctx.session.user.id,
        },
      });
    }),

  dropItems: protectedProcedure
    .input(
      z.object({
        ids: z.array(z.number()),
        coordX: z.number(),
        coordY: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.item.updateMany({
        where: { id: { in: input.ids } },
        data: {
          ownedById: null,
          coordX: input.coordX,
          coordY: input.coordY,
        },
      });
    }),

  getByTypeId: protectedProcedure
    .input(z.object({ typeId: z.number() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.item.findMany({
        where: { typeId: input.typeId },
      });
    }),

  getTypeById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.itemType.findFirst({
        where: { id: input.id },
        include: {
          AddingAbility: true,
          RemovingAbility: true,
          UsingAbility: true,
          ItemEffects: true,
        },
      });
    }),

  getAllTypes: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.itemType.findMany();
  }),

  createType: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        image: z.string().optional(),
        cost: z.number(),
        usage: z.number().optional(),
        content: z.string(),
        isPurchasable: z.boolean().optional(),
        costIncrease: z.number().optional(),
        bloodAmount: z.number().optional(),
        bloodPool: z.number().optional(),
        violation: z.string().optional(),
        status: z.string().optional(),
        boon: z.string().optional(),
        auspexData: z.string().optional(),
        animalismData: z.string().optional(),
        hackerData: z.string().optional(),
        companyLevels: z.number().optional(),
        addingAbilities: z.array(z.number()).optional(),
        removingAbilities: z.array(z.number()).optional(),
        usingAbilities: z.array(z.number()).optional(),
        addingEffects: z.array(z.number()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const itemType = await ctx.db.itemType.create({
        data: {
          name: input.name,
          image: input.image,
          cost: input.cost,
          usage: input.usage,
          content: input.content,
          isPurchasable: input.isPurchasable,
          costIncrease: input.costIncrease,
          bloodAmount: input.bloodAmount,
          auspexData: input.auspexData,
          animalismData: input.animalismData,
          hackerData: input.hackerData,
          bloodPool: input.bloodPool,
          violation: input.violation,
          status: input.status,
          boon: input.boon,
          companyLevels: input.companyLevels,
        },
      });
      if (!!input.addingAbilities?.length) {
        await ctx.db.itemType.update({
          where: { id: itemType.id },
          data: {
            AddingAbility: {
              create: input.addingAbilities.map((abilityId) => ({
                abilityId,
              })),
            },
          },
          include: {
            AddingAbility: true,
          },
        });
      }
      if (!!input.removingAbilities?.length) {
        await ctx.db.itemType.update({
          where: { id: itemType.id },
          data: {
            RemovingAbility: {
              create: input.removingAbilities.map((abilityId) => ({
                abilityId,
              })),
            },
          },
          include: {
            RemovingAbility: true,
          },
        });
      }
      if (!!input.usingAbilities?.length) {
        await ctx.db.itemType.update({
          where: { id: itemType.id },
          data: {
            UsingAbility: {
              create: input.usingAbilities.map((abilityId) => ({
                abilityId,
              })),
            },
          },
          include: {
            UsingAbility: true,
          },
        });
      }
      if (!!input.addingEffects?.length) {
        await ctx.db.itemType.update({
          where: { id: itemType.id },
          data: {
            ItemEffects: {
              create: input.addingEffects.map((effectId) => ({
                effectId,
              })),
            },
          },
          include: {
            ItemEffects: true,
          },
        });
      }
      return ctx.db.itemType.findFirst({
        where: { id: itemType.id },
        include: {
          AddingAbility: true,
          RemovingAbility: true,
          UsingAbility: true,
          ItemEffects: true,
        },
      });
    }),

  updateType: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1),
        image: z.string().optional(),
        cost: z.number(),
        usage: z.number().optional(),
        content: z.string(),
        isPurchasable: z.boolean().optional(),
        auspexData: z.string().optional(),
        animalismData: z.string().optional(),
        hackerData: z.string().optional(),
        costIncrease: z.number().optional(),
        bloodAmount: z.number().optional(),
        bloodPool: z.number().optional(),
        violation: z.string().optional(),
        status: z.string().optional(),
        boon: z.string().optional(),
        companyLevels: z.number().optional(),
        addingAbilities: z.array(z.number()).optional(),
        removingAbilities: z.array(z.number()).optional(),
        usingAbilities: z.array(z.number()).optional(),
        addingEffects: z.array(z.number()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.itemType.update({
        where: { id: input.id },
        data: {
          name: input.name,
          image: input.image,
          cost: input.cost,
          usage: input.usage,
          content: input.content,
          isPurchasable: input.isPurchasable,
          costIncrease: input.costIncrease,
          bloodAmount: input.bloodAmount,
          auspexData: input.auspexData,
          animalismData: input.animalismData,
          hackerData: input.hackerData,
          bloodPool: input.bloodPool,
          violation: input.violation,
          status: input.status,
          boon: input.boon,
          companyLevels: input.companyLevels,
        },
      });
      await ctx.db.addingAbility.deleteMany({
        where: {
          itemTypeId: input.id,
        },
      });
      await ctx.db.removingAbility.deleteMany({
        where: {
          itemTypeId: input.id,
        },
      });
      await ctx.db.usingAbility.deleteMany({
        where: {
          itemTypeId: input.id,
        },
      });
      if (!!input.addingAbilities?.length) {
        await ctx.db.addingAbility.createMany({
          data: input.addingAbilities.map((abilityId) => ({
            abilityId,
            itemTypeId: input.id,
          })),
        });
      }
      if (!!input.removingAbilities?.length) {
        await ctx.db.removingAbility.createMany({
          data: input.removingAbilities.map((abilityId) => ({
            abilityId,
            itemTypeId: input.id,
          })),
        });
      }
      if (!!input.usingAbilities?.length) {
        await ctx.db.usingAbility.createMany({
          data: input.usingAbilities.map((abilityId) => ({
            abilityId,
            itemTypeId: input.id,
          })),
        });
      }
      if (!!input.addingEffects?.length) {
        await ctx.db.itemEffects.createMany({
          data: input.addingEffects.map((effectId) => ({
            effectId,
            typeId: input.id,
          })),
        });
      }
      return ctx.db.itemType.findFirst({
        where: { id: input.id },
        include: {
          AddingAbility: true,
          RemovingAbility: true,
          UsingAbility: true,
        },
      });
    }),

  deleteType: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.itemType.delete({
        where: { id: input.id },
      });
    }),
});
