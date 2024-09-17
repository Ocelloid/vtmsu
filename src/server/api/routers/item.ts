import { z } from "zod";
import type { User } from "~/server/api/routers/user";
import type { Ability } from "~/server/api/routers/char";

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
  createdById: string;
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: User;
  type?: ItemType;
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
  Item?: Item[];
  AddingAbility?: AddingAbility[];
  RemovingAbility?: RemovingAbility[];
  UsingAbility?: UsingAbility[];
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
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        content: z.string().nullish(),
        typeId: z.number().optional(),
        image: z.string().optional(),
        usage: z.number().optional(),
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
            createdBy: { connect: { id: ctx.session.user.id } },
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
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.item.update({
        where: { id: input.id },
        data: {
          name: input.name,
          typeId: input.typeId,
          image: input.image,
          content: input.content,
          usage: input.usage,
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
