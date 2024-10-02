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
  isVisible: boolean;
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
      if (!instance) return { message: "Цель не найдена" };

      const character = await ctx.db.char.findUnique({
        where: { id: input.characterId },
        include: {
          features: { include: { feature: true } },
          effects: { include: { effect: true } },
        },
      });
      if (!character) return { message: "Персонаж не найден" };

      let status = "success";

      const hasConcentratedBlood = character.features.some(
        (f) => f.feature.name === "Концентрированнная кровь",
      );
      const hasThaudron = character.effects.some((e) =>
        e.effect.name.includes("Таудрон"),
      );
      const hasHangover = character.effects.some((e) =>
        e.effect.name.includes("Похмелье"),
      );

      const lastHunt = await ctx.db.hunt.findFirst({
        where: {
          characterId: input.characterId,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
      if (
        (lastHunt?.createdAt ?? new Date()) >
        new Date(new Date().getTime() - 30 * 60 * 1000)
      )
        return {
          message:
            "Вашему персонажу нужно отдохнуть хотя бы 30 минут между охотами",
        };

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

      if (status === "success" || status === "masq_failure")
        await ctx.db.char.update({
          where: { id: input.characterId },
          data: {
            bloodAmount:
              10 +
              (hasConcentratedBlood ? 2 : 0) +
              (hasThaudron ? 5 : 0) +
              (hasHangover ? -5 : 0),
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

  investigate: protectedProcedure
    .input(z.object({ id: z.number(), charId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const lastHunt = await ctx.db.hunt.findFirst({
        where: {
          instanceId: input.id,
        },
        orderBy: {
          createdAt: "desc",
        },
        include: {
          instance: { include: { target: { include: { descs: true } } } },
          character: {
            select: {
              auspexData: true,
              animalismData: true,
              hackerData: true,
              image: true,
            },
          },
        },
      });
      if (!lastHunt || !lastHunt.instance?.isVisible)
        return { message: "Нарушение не найдено" };

      const investigator = await ctx.db.char.findUnique({
        where: { id: input.charId },
        include: {
          features: { include: { feature: true } },
          effects: { include: { effect: true } },
          bankAccount: true,
        },
      });

      if (!investigator) return { message: "Персонаж не найден" };

      const accountToUse = investigator.bankAccount.sort(
        (a, b) => b.balance - a.balance,
      )[0];
      if (!accountToUse) return { message: "Не найден счёт" };
      if (
        accountToUse.balance <
        (lastHunt.instance.target?.descs?.length ?? 0) * 10
      )
        return {
          message: `Недостаточно средств на счёте ${accountToUse.address}`,
          item: undefined,
        };

      const hasAuspexActive = investigator.effects.some(
        (e) =>
          e.effect.name.includes("Прорицание") &&
          (e.expires ?? new Date()) > new Date(),
      );
      const hasAnimalismActive = investigator.effects.some(
        (e) =>
          e.effect.name.includes("Анимализм") &&
          (e.expires ?? new Date()) > new Date(),
      );
      const isHacker = investigator.features.some((f) =>
        f.feature.name.includes("Хакер"),
      );

      return {
        message: "Вы проводите расследование и узнаёте:",
        hackerData: isHacker ? lastHunt.character.hackerData : null,
        hackerImage: isHacker ? lastHunt.character.image : null,
        animalismData: hasAnimalismActive
          ? lastHunt.character.animalismData
          : null,
        auspexData: hasAuspexActive ? lastHunt.character.auspexData : null,
      };
    }),

  coverUp: protectedProcedure
    .input(z.object({ id: z.number(), charId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const instance = await ctx.db.huntingInstance.findUnique({
        where: { id: input.id },
        include: { target: { include: { descs: true } } },
      });
      if (!instance?.isVisible || !instance)
        return { message: "Нарушение не найдено" };

      const character = await ctx.db.char.findUnique({
        where: { id: input.charId },
        include: {
          bankAccount: true,
        },
      });

      if (!character) return { message: "Персонаж не найден" };

      const accountToUse = character.bankAccount.sort(
        (a, b) => b.balance - a.balance,
      )[0];
      if (!accountToUse) return { message: "Не найден счёт" };
      if (accountToUse.balance < (instance.target?.descs?.length ?? 0) * 50)
        return {
          message: `Недостаточно средств на счёте ${accountToUse.address}`,
          item: undefined,
        };

      await ctx.db.huntingInstance.update({
        where: { id: input.id },
        data: {
          isVisible: false,
        },
      });

      return { message: "Нарушение маскарада успешно прикрыто" };
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
