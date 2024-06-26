import { z } from "zod";
import type { Character } from "~/server/api/routers/char";
import type { User } from "~/server/api/routers/user";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export type HuntingData = {
  id?: number;
  name: string;
  image?: string | null;
  hunt_req?: string | null;
  descs?: HuntingDescription[];
  instances?: HuntingInstance[];
};

export type HuntingDescription = {
  id?: number;
  targetId?: number;
  remains?: number;
  content?: string | null;
  target?: HuntingData;
};

export type HuntingInstance = {
  id?: number;
  remains?: number;
  coordY: number;
  coordX: number;
  temporary: boolean;
  expires?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
  targetId?: number;
  target?: HuntingData;
  groundId?: number | null;
  ground?: HuntingGround | null;
  hunts?: Hunt[];
};

export type HuntingGround = {
  id?: number;
  name: string;
  radius: number;
  max_inst: number;
  min_inst?: number;
  delay: number;
  coordY: number;
  coordX: number;
  createdAt?: Date;
  updatedAt?: Date;
  content?: string | null;
  instances?: HuntingInstance[];
};

export type Hunt = {
  id?: number;
  instanceId?: number | null;
  characterId: number;
  createdById: string;
  status: string;
  createdAt?: Date;
  updatedAt?: Date;
  character?: Character;
  createdBy?: User;
  instance?: HuntingInstance | null;
};

export const huntRouter = createTRPCRouter({
  getAllHunts: protectedProcedure.query(async ({ ctx }) => {
    const hunts = await ctx.db.hunt.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        createdBy: true,
        character: true,
        instance: {
          include: {
            target: { include: { descs: true } },
            ground: true,
          },
        },
      },
    });
    return hunts;
  }),

  createHunt: protectedProcedure
    .input(
      z.object({
        instanceId: z.number().int(),
        characterId: z.number().int(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const instance = await ctx.db.huntingInstance.findUnique({
        where: { id: input.instanceId },
        include: { target: true },
      });
      const character = await ctx.db.char.findUnique({
        where: { id: input.characterId },
      });

      let status = "success";
      if (
        !!character &&
        !!instance &&
        !!character.hunt_req &&
        !!instance.target.hunt_req &&
        character.hunt_req !== instance.target.hunt_req
      )
        status = "req_failure";

      if (!!instance && !!instance.expires && instance.expires < new Date())
        status = "exp_failure";

      if (!!instance && instance.remains === 2) status = "masq_failure";

      let newInstance = undefined;

      if (status !== "exp_failure" && !!instance)
        newInstance = await ctx.db.huntingInstance.update({
          where: { id: input.instanceId },
          data: { remains: instance.remains - 1 },
        });

      const newHunt = await ctx.db.hunt.create({
        data: {
          instanceId: input.instanceId,
          characterId: input.characterId,
          createdById: ctx.session.user.id,
          status: status,
        },
      });

      return { hunt: newHunt, instance: newInstance };
    }),

  getAllHuntingInstances: protectedProcedure.query(async ({ ctx }) => {
    const huntingInstances = await ctx.db.huntingInstance.findMany({
      include: {
        target: { include: { instances: true, descs: true } },
        ground: true,
        hunts: { include: { createdBy: true } },
      },
    });
    return huntingInstances;
  }),

  deleteHuntingInstance: protectedProcedure
    .input(
      z.object({
        id: z.number(),
      }),
    )
    .mutation(({ ctx, input }) => {
      return ctx.db.huntingInstance.delete({
        where: { id: input.id },
      });
    }),

  createHuntingInstance: protectedProcedure
    .input(
      z.object({
        coordX: z.number(),
        coordY: z.number(),
        targetId: z.number().int(),
        groundId: z.number().int().optional(),
        expires: z.date().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const target = await ctx.db.huntingData.findUnique({
        where: { id: input.targetId },
        include: { descs: true },
      });
      const newInstance = ctx.db.huntingInstance.create({
        data: {
          coordX: input.coordX,
          coordY: input.coordY,
          targetId: input.targetId,
          groundId: input.groundId,
          remains: target?.descs.length,
          expires: input.expires,
          temporary: !!input.expires,
        },
      });
      return newInstance;
    }),

  updateHuntingInstance: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        coordX: z.number().optional(),
        coordY: z.number().optional(),
        targetId: z.number().int().optional(),
        groundId: z.number().int().optional(),
        expires: z.date().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const target = await ctx.db.huntingData.findUnique({
        where: { id: input.targetId },
        include: { descs: true },
      });
      const newInstance = ctx.db.huntingInstance.update({
        where: { id: input.id },
        data: {
          coordX: input.coordX,
          coordY: input.coordY,
          targetId: input.targetId,
          groundId: input.groundId,
          remains: target?.descs.length,
          expires: input.expires,
          temporary: !!input.expires,
        },
      });
      return newInstance;
    }),

  getAllHuntingTargets: protectedProcedure.query(async ({ ctx }) => {
    const huntingTargets = await ctx.db.huntingData.findMany({
      include: { instances: true, descs: true },
    });
    return huntingTargets;
  }),

  deleteHuntingTarget: protectedProcedure
    .input(
      z.object({
        id: z.number(),
      }),
    )
    .mutation(({ ctx, input }) => {
      return ctx.db.huntingData.delete({
        where: { id: input.id },
      });
    }),

  createHuntingTarget: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        req: z.string().optional(),
        image: z.string().optional(),
        descs: z.array(z.string()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const newTarget = ctx.db.huntingData.create({
        data: {
          name: input.name,
          image: input.image,
          hunt_req: input.req,
          descs: {
            createMany: {
              data: input.descs.map((a, i) => {
                return { content: a, remains: input.descs.length - i };
              }),
            },
          },
        },
      });
      return newTarget;
    }),

  updateHuntingTarget: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1),
        req: z.string().optional(),
        image: z.string().optional(),
        descs: z.array(z.string()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const newTarget = ctx.db.huntingData.update({
        where: { id: input.id },
        data: {
          name: input.name,
          image: input.image,
          hunt_req: input.req,
          descs: {
            deleteMany: {},
            createMany: {
              data: input.descs.map((a, i) => {
                return { content: a, remains: input.descs.length - i };
              }),
            },
          },
        },
      });
      return newTarget;
    }),

  getAllHuntingGrounds: protectedProcedure.query(async ({ ctx }) => {
    const huntingGrounds = await ctx.db.huntingGround.findMany({
      include: { instances: true },
    });
    return huntingGrounds;
  }),

  deleteHuntingGround: protectedProcedure
    .input(
      z.object({
        id: z.number(),
      }),
    )
    .mutation(({ ctx, input }) => {
      return ctx.db.huntingGround.delete({
        where: { id: input.id },
      });
    }),

  createHuntingGround: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        radius: z.number().int(),
        max_inst: z.number().int(),
        min_inst: z.number().int().optional(),
        delay: z.number().int().optional(),
        coordY: z.number(),
        coordX: z.number(),
        content: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.huntingGround.create({
        data: {
          name: input.name,
          radius: input.radius,
          max_inst: input.max_inst,
          min_inst: input.min_inst,
          delay: input.delay,
          coordY: input.coordY,
          coordX: input.coordX,
          content: input.content,
        },
      });
    }),

  updateHuntingGround: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1),
        radius: z.number().int(),
        max_inst: z.number().int(),
        min_inst: z.number().int().optional(),
        delay: z.number().int().optional(),
        coordY: z.number(),
        coordX: z.number(),
        content: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.huntingGround.update({
        where: { id: input.id },
        data: {
          name: input.name,
          radius: input.radius,
          max_inst: input.max_inst,
          min_inst: input.min_inst,
          delay: input.delay,
          coordY: input.coordY,
          coordX: input.coordX,
          content: input.content,
        },
      });
    }),
});
