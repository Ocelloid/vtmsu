import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { calculateDistance } from "~/utils/text";

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

  getLookAround: protectedProcedure
    .input(z.object({ x: z.number(), y: z.number(), charId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const { x, y } = input;
      const radius = 200;

      const char = await ctx.db.char.findUnique({
        where: { id: input.charId },
        include: { effects: { include: { effect: true } } },
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
        availableItems,
      };
    }),
});
