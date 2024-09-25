import { z } from "zod";
import type { Ability, Effect, Character } from "~/server/api/routers/char";
import type { User } from "~/server/api/routers/user";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export type Item = {
  id?: number;
  name: string;
  typeId: number;
  usage: number;
  image?: string | null;
  content?: string | null;
  auspexData?: string | null;
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
      });
      if (!char) return { message: "Персонаж не найден" };

      await ctx.db.item.update({
        where: { id: input.id },
        data: {
          usage: item.usage > 0 ? item.usage - 1 : -1,
          isTrash: item.usage - 1 === 0,
          lastUsedById: input.charId,
        },
      });

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
          a.ability.AbilityEffects.map((ae) => ae.effectId),
        );
        const effects = abilityEffects.flat();
        await ctx.db.characterEffects.createMany({
          data: effects.map((effectId) => ({
            effectId,
            characterId: input.charId,
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
        const newBloodAmount = char.bloodAmount + item.type.bloodAmount;
        await ctx.db.char.update({
          where: { id: input.charId },
          data: {
            bloodAmount:
              newBloodAmount > char.bloodPool ? char.bloodPool : newBloodAmount,
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

      return { message: "Предмет использован" };
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        content: z.string().nullish(),
        typeId: z.number().optional(),
        image: z.string().optional(),
        usage: z.number().optional(),
        ownedById: z.number().optional(),
        auspexData: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      ctx.db.item
        .create({
          data: {
            name: input.name,
            content: input.content,
            image: input.image,
            usage: input.usage,
            ownedById: input.ownedById,
            lastOwnedById: input.ownedById,
            createdById: ctx.session.user.id,
            auspexData: input.auspexData,
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
        typeId: z.number().optional(),
        image: z.string().optional(),
        content: z.string().nullish(),
        usage: z.number().optional(),
        ownedById: z.number().optional(),
        auspexData: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const item = await ctx.db.item.findUnique({
        where: { id: input.id },
      });
      if (!item) return { message: "Предмет не найден" };
      return ctx.db.item.update({
        where: { id: input.id },
        data: {
          name: input.name,
          typeId: input.typeId,
          image: input.image,
          content: input.content,
          usage: input.usage,
          ownedById: input.ownedById,
          auspexData: input.auspexData,
          lastOwnedById:
            input.ownedById === item.ownedById
              ? item.lastOwnedById
              : item.ownedById,
        },
      });
    }),

  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.item.findFirst({
        where: { id: input.id },
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
        bloodAmount: z.number().optional(),
        bloodPool: z.number().optional(),
        violation: z.string().optional(),
        status: z.string().optional(),
        boon: z.string().optional(),
        auspexData: z.string().optional(),
        companyLevels: z.number().optional(),
        addingAbilities: z.array(z.number()).optional(),
        removingAbilities: z.array(z.number()).optional(),
        usingAbilities: z.array(z.number()).optional(),
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
          bloodAmount: input.bloodAmount,
          auspexData: input.auspexData,
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
      return ctx.db.itemType.findFirst({
        where: { id: itemType.id },
        include: {
          AddingAbility: true,
          RemovingAbility: true,
          UsingAbility: true,
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
        auspexData: z.string().optional(),
        bloodAmount: z.number().optional(),
        bloodPool: z.number().optional(),
        violation: z.string().optional(),
        status: z.string().optional(),
        boon: z.string().optional(),
        companyLevels: z.number().optional(),
        addingAbilities: z.array(z.number()).optional(),
        removingAbilities: z.array(z.number()).optional(),
        usingAbilities: z.array(z.number()).optional(),
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
          bloodAmount: input.bloodAmount,
          auspexData: input.auspexData,
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
