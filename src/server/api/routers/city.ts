import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { calculateDistance } from "~/utils/text";
import type { Container } from "~/server/api/routers/item";
import type { Effect } from "~/server/api/routers/char";

export type GeoPoint = {
  id: string;
  lat: number;
  lng: number;
  name: string;
  icon?: string | null;
  isVisible?: boolean | null;
  content?: string | null;
  auspexData?: string | null;
  animalismData?: string | null;
  hackerData?: string | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
  GeoPointEffects?: GeoPointEffects[] | null;
  GeoPointContainers?: GeoPointContainers[] | null;
};

export type GeoPointEffects = {
  id: number;
  effectId: number;
  geoPointId: string;
  geoPoint?: GeoPoint | null;
  effect?: Effect | null;
};

export type GeoPointContainers = {
  id: number;
  containerId: string;
  container?: Container | null;
  geoPointId: string;
  geoPoint?: GeoPoint | null;
};

export const cityRouter = createTRPCRouter({
  getActiveViolations: protectedProcedure.query(async ({ ctx }) => {
    const violations = await ctx.db.huntingInstance.findMany({
      where: { remains: { lt: 2 }, isVisible: true },
      include: {
        target: { include: { instances: true, descs: true } },
        ground: true,
        hunts: { include: { createdBy: true } },
      },
    });
    return violations;
  }),

  getVisibleCompanies: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.company.findMany({
      where: { isVisible: true },
      include: { character: true },
    });
  }),

  getVisibleGeoPoints: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.geoPoint.findMany({
      where: { isVisible: true },
    });
  }),

  applyGeoPoint: protectedProcedure
    .input(z.object({ id: z.string(), charId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const geoPoint = await ctx.db.geoPoint.findFirst({
        where: { id: input.id },
        include: {
          GeoPointEffects: { include: { effect: true } },
        },
      });
      if (!geoPoint) return { message: "Геоточка не найдена" };
      if (!geoPoint.GeoPointEffects?.length)
        return { message: "Геоточка не имеет эффектов" };

      const char = await ctx.db.char.findUnique({
        where: { id: input.charId },
        include: {
          features: { include: { feature: true } },
          effects: { include: { effect: true } },
        },
      });
      if (!char) return { message: "Персонаж не найден" };

      await ctx.db.characterEffects.createMany({
        data: geoPoint.GeoPointEffects.map((a) => ({
          effectId: a.effectId,
          expires: new Date(
            new Date().getTime() + (a.effect?.expiration ?? 0) * 60 * 1000,
          ),
          characterId: input.charId,
        })),
      });

      return { message: "" };
    }),

  lookUpGeoPoint: protectedProcedure
    .input(z.object({ id: z.string(), charId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const geoPoint = await ctx.db.geoPoint.findFirst({
        where: { id: input.id },
        include: {
          GeoPointEffects: true,
          GeoPointContainers: { include: { container: true } },
        },
      });
      if (!geoPoint) return { message: "Геоточка не найдена" };

      const char = await ctx.db.char.findUnique({
        where: { id: input.charId },
        include: {
          features: {
            include: { feature: true },
          },
          effects: { include: { effect: true } },
        },
      });
      if (!char) return { message: "Персонаж не найден" };

      const hasAuspexActive = char.effects.some(
        (e) =>
          e.effect.name.includes("Прорицание") &&
          (e.expires ?? new Date()) > new Date(),
      );
      const hasAnimalismActive = char.effects.some(
        (e) =>
          e.effect.name.includes("Анимализм") &&
          (e.expires ?? new Date()) > new Date(),
      );
      const isHacker = char.features.some((f) =>
        f.feature.name.includes("Хакер"),
      );

      return {
        message: "",
        content: geoPoint.content,
        effects: geoPoint.GeoPointEffects,
        containers: geoPoint.GeoPointContainers,
        hackerData: isHacker ? geoPoint.hackerData : null,
        animalismData: hasAnimalismActive ? geoPoint.animalismData : null,
        auspexData: hasAuspexActive ? geoPoint.auspexData : null,
      };
    }),

  createGeoPoint: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        lat: z.number(),
        lng: z.number(),
        isVisible: z.boolean().optional(),
        icon: z.string().optional(),
        content: z.string().optional(),
        auspexData: z.string().optional(),
        animalismData: z.string().optional(),
        hackerData: z.string().optional(),
        effectIds: z.array(z.number()).optional(),
        containerIds: z.array(z.string()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const geoPoint = await ctx.db.geoPoint.create({
        data: {
          name: input.name,
          lat: input.lat,
          lng: input.lng,
          icon: input.icon,
          isVisible: input.isVisible,
          content: input.content,
          auspexData: input.auspexData,
          animalismData: input.animalismData,
          hackerData: input.hackerData,
        },
      });

      if (!!input.effectIds?.length)
        await ctx.db.geoPointEffects.createMany({
          data: input.effectIds.map((a) => {
            return { effectId: a, geoPointId: geoPoint.id };
          }),
        });

      if (!!input.containerIds?.length)
        await ctx.db.geoPointContainers.createMany({
          data: input.containerIds.map((a) => {
            return { containerId: a, geoPointId: geoPoint.id };
          }),
        });

      return geoPoint;
    }),

  updateGeoPoint: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
        lat: z.number(),
        lng: z.number(),
        isVisible: z.boolean().optional(),
        icon: z.string().optional(),
        content: z.string().optional(),
        auspexData: z.string().optional(),
        animalismData: z.string().optional(),
        hackerData: z.string().optional(),
        effectIds: z.array(z.number()).optional(),
        containerIds: z.array(z.string()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.geoPoint.update({
        where: { id: input.id },
        data: {
          name: input.name,
          lat: input.lat,
          lng: input.lng,
          icon: input.icon,
          isVisible: input.isVisible,
          content: input.content,
          auspexData: input.auspexData,
          animalismData: input.animalismData,
          hackerData: input.hackerData,
        },
      });

      if (!!input.effectIds?.length) {
        await ctx.db.geoPointEffects.deleteMany({
          where: {
            geoPointId: input.id,
          },
        });
        await ctx.db.geoPointEffects.createMany({
          data: input.effectIds.map((a) => {
            return { effectId: a, geoPointId: input.id };
          }),
        });
      }

      if (!!input.containerIds?.length) {
        await ctx.db.geoPointContainers.deleteMany({
          where: {
            geoPointId: input.id,
          },
        });
        await ctx.db.geoPointContainers.createMany({
          data: input.containerIds.map((a) => {
            return { containerId: a, geoPointId: input.id };
          }),
        });
      }
    }),

  deleteGeoPoint: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.geoPoint.delete({
        where: { id: input.id },
      });
    }),

  getGeoPointById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.geoPoint.findFirst({
        where: { id: input.id },
        include: {
          GeoPointEffects: { include: { effect: true } },
          GeoPointContainers: true,
        },
      });
    }),

  getAllGeoPoints: protectedProcedure.query(({ ctx }) => {
    return ctx.db.geoPoint.findMany({
      include: { GeoPointEffects: true, GeoPointContainers: true },
    });
  }),

  getLookAround: protectedProcedure
    .input(z.object({ x: z.number(), y: z.number(), charId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const { x, y } = input;
      const appData = await ctx.db.appData.findFirst({
        orderBy: { id: "desc" },
      });
      const radius = appData?.radius ?? 200;

      const char = await ctx.db.char.findUnique({
        where: { id: input.charId },
        include: {
          effects: { include: { effect: true } },
          knowledges: { include: { knowledge: true } },
        },
      });

      if (!char)
        return {
          message: "Не удалось найти персонажа",
          availableHuntingInstances: [],
          availableViolations: [],
          availableCompanies: [],
        };

      const isWarrens = char.effects.some(
        (e) =>
          e.effect.name.includes("Канализация") &&
          (e.expires ?? new Date()) > new Date(),
      );

      const huntingInstances = await ctx.db.huntingInstance.findMany({
        where: { remains: { gt: 1 }, isVisible: true },
        include: {
          target: { include: { instances: true, descs: true } },
          ground: true,
          hunts: { include: { createdBy: true } },
        },
      });

      const violations = await ctx.db.huntingInstance.findMany({
        where: { remains: { lt: 2 }, isVisible: true },
        include: {
          target: { include: { instances: true, descs: true } },
          ground: true,
          hunts: { include: { createdBy: true } },
        },
      });

      const companies = await ctx.db.company.findMany({
        where: { isWarrens: isWarrens },
        include: { character: true },
      });

      const items = await ctx.db.item.findMany({
        where: {
          ownedById: null,
          coordX: { not: null },
          coordY: { not: null },
        },
      });

      const geoPoints = await ctx.db.geoPoint.findMany();

      const availableGeoPoints = geoPoints.filter(
        (g) =>
          calculateDistance(g.lat, g.lng, y, x) <= radius &&
          (g.icon !== "sewer" ||
            char.knowledges.some((k) =>
              k.knowledge.name.includes("Канализация"),
            )),
      );

      const availableHuntingInstances = huntingInstances.filter(
        (i) => calculateDistance(i.coordY, i.coordX, y, x) <= radius,
      );

      const availableViolations = violations.filter(
        (i) => calculateDistance(i.coordY, i.coordX, y, x) <= radius,
      );

      const availableCompanies = companies.filter(
        (c) => calculateDistance(c.coordY, c.coordX, y, x) <= radius,
      );

      const availableItems = items.filter(
        (i) => calculateDistance(i.coordY ?? 0, i.coordX ?? 0, y, x) <= radius,
      );

      return {
        message: "",
        availableHuntingInstances,
        availableViolations,
        availableCompanies,
        availableGeoPoints,
        availableItems,
      };
    }),
});
