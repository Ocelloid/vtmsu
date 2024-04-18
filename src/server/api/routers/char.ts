import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

import type { User } from "~/server/api/routers/user";

export type Character = {
  id: number;
  name: string;
  factionId: number;
  clanId: number;
  visible: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdById: string;
  age?: number | null;
  sire?: string | null;
  childer?: string | null;
  ambition?: string | null;
  publicInfo?: string | null;
  content?: string | null;
  abilities?: Ability[];
  features?: Feature[];
  clan?: Clan;
  faction?: Faction;
  createdBy?: User;
};

export type Faction = {
  id: number;
  name: string;
  content: string;
  visibleToPlayer: boolean;
};

export type Clan = {
  id: number;
  name: string;
  content: string;
  visibleToPlayer: boolean;
  ClanInFaction: ClanInFaction[];
  AbilityAvailable?: AbilityAvailable[];
  FeatureAvailable?: FeatureAvailable[];
};

export type ClanInFaction = {
  id: number;
  clanId: number;
  factionId: number;
  clan?: Clan;
  faction?: Faction;
};

export type Ability = {
  id: number;
  name: string;
  content: string;
  expertise: boolean;
  visibleToPlayer: boolean;
  AbilityAvailable?: AbilityAvailable[];
};

export type Feature = {
  id: number;
  name: string;
  content: string;
  cost: number;
  visibleToPlayer: boolean;
  FeatureAvailable?: FeatureAvailable[];
};

export type AbilityAvailable = {
  id: number;
  clanId: number;
  abilityId: number;
  clan?: Clan;
  ability?: Ability;
};

export type FeatureAvailable = {
  id: number;
  clanId: number;
  featureId: number;
  clan?: Clan;
  feature?: Feature;
};

export const charRouter = createTRPCRouter({
  getCharTraits: protectedProcedure.query(async ({ ctx }) => {
    const features = await ctx.db.feature.findMany({
      include: { FeatureAvailable: { include: { clan: true } } },
    });
    const abilities = await ctx.db.ability.findMany({
      include: { AbilityAvailable: { include: { clan: true } } },
    });
    const factions = await ctx.db.faction.findMany();
    const clans = await ctx.db.clan.findMany({
      include: {
        ClanInFaction: { include: { faction: true } },
        AbilityAvailable: { include: { ability: true } },
        FeatureAvailable: { include: { feature: true } },
      },
    });
    return {
      features: features,
      abilities: abilities,
      factions: factions,
      clans: clans,
    };
  }),

  getFeatures: protectedProcedure.query(({ ctx }) => {
    return ctx.db.feature.findMany({
      include: { FeatureAvailable: { include: { clan: true } } },
    });
  }),

  getAbilities: protectedProcedure.query(({ ctx }) => {
    return ctx.db.ability.findMany({
      include: { AbilityAvailable: { include: { clan: true } } },
    });
  }),

  getFactions: protectedProcedure.query(({ ctx }) => {
    return ctx.db.faction.findMany();
  }),

  getClans: protectedProcedure.query(({ ctx }) => {
    return ctx.db.clan.findMany({
      include: {
        ClanInFaction: { include: { faction: true } },
        AbilityAvailable: { include: { ability: true } },
        FeatureAvailable: { include: { feature: true } },
      },
    });
  }),

  createFeature: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        content: z.string(),
        cost: z.number(),
        visibleToPlayer: z.boolean(),
        clanIds: z.array(z.number()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.feature.create({
        data: {
          name: input.name,
          content: input.content,
          cost: input.cost,
          visibleToPlayer: input.visibleToPlayer,
          FeatureAvailable: {
            createMany: {
              data: input.clanIds.map((a) => {
                return { clanId: a };
              }),
            },
          },
        },
      });
    }),

  updateFeature: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string(),
        content: z.string(),
        cost: z.number(),
        visibleToPlayer: z.boolean(),
        clanIds: z.array(z.number()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.feature.update({
        where: { id: input.id },
        data: {
          name: input.name,
          content: input.content,
          cost: input.cost,
          visibleToPlayer: input.visibleToPlayer,
          FeatureAvailable: {
            deleteMany: {},
            createMany: {
              data: input.clanIds.map((a) => {
                return { clanId: a };
              }),
            },
          },
        },
      });
    }),

  deleteFeature: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.feature.delete({ where: { id: input.id } });
    }),

  createAbility: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        content: z.string(),
        expertise: z.boolean(),
        visibleToPlayer: z.boolean(),
        clanIds: z.array(z.number()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.ability.create({
        data: {
          name: input.name,
          content: input.content,
          expertise: input.expertise,
          visibleToPlayer: input.visibleToPlayer,
          AbilityAvailable: {
            createMany: {
              data: input.clanIds.map((a) => {
                return { clanId: a };
              }),
            },
          },
        },
      });
    }),

  updateAbility: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string(),
        content: z.string(),
        expertise: z.boolean(),
        visibleToPlayer: z.boolean(),
        clanIds: z.array(z.number()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.ability.update({
        where: { id: input.id },
        data: {
          name: input.name,
          content: input.content,
          expertise: input.expertise,
          visibleToPlayer: input.visibleToPlayer,
          AbilityAvailable: {
            deleteMany: {},
            createMany: {
              data: input.clanIds.map((a) => {
                return { clanId: a };
              }),
            },
          },
        },
      });
    }),

  deleteAbility: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.ability.delete({ where: { id: input.id } });
    }),

  createFaction: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        content: z.string(),
        visibleToPlayer: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.faction.create({
        data: {
          name: input.name,
          content: input.content,
          visibleToPlayer: input.visibleToPlayer,
        },
      });
    }),

  updateFaction: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string(),
        content: z.string(),
        visibleToPlayer: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.faction.update({
        where: { id: input.id },
        data: {
          name: input.name,
          content: input.content,
          visibleToPlayer: input.visibleToPlayer,
        },
      });
    }),

  deleteFaction: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.faction.delete({ where: { id: input.id } });
    }),

  createClan: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        content: z.string(),
        factionIds: z.array(z.number().nullish()),
        visibleToPlayer: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.clan.create({
        data: {
          name: input.name,
          content: input.content,
          visibleToPlayer: input.visibleToPlayer,
          ClanInFaction: {
            createMany: {
              data: input.factionIds.map((a) => {
                return { factionId: a! };
              }),
            },
          },
        },
      });
    }),

  updateClan: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string(),
        content: z.string(),
        factionIds: z.array(z.number().nullish()),
        visibleToPlayer: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.clan.update({
        where: { id: input.id },
        data: {
          name: input.name,
          content: input.content,
          visibleToPlayer: input.visibleToPlayer,
          ClanInFaction: {
            deleteMany: {},
            createMany: {
              data: input.factionIds.map((a) => {
                return { factionId: a! };
              }),
            },
          },
        },
      });
    }),

  deleteClan: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.clan.delete({ where: { id: input.id } });
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        content: z.string().nullish(),
        clanId: z.number(),
        factionId: z.number(),
        abilities: z.array(z.number()),
        features: z.array(z.number()),
        visible: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.char.create({
        data: {
          clanId: input.clanId,
          factionId: input.factionId,
          name: input.name,
          content: input.content,
          visible: input.visible,
          createdById: ctx.session.user.id,
          abilities: {
            createMany: {
              data: input.abilities.map((a) => {
                return { abilityId: a };
              }),
            },
          },
          features: {
            createMany: {
              data: input.features.map((a) => {
                return { featureId: a };
              }),
            },
          },
        },
        include: {
          abilities: true,
          features: true,
          faction: true,
          clan: true,
        },
      });
    }),

  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.db.char.findMany();
  }),

  getMine: protectedProcedure.query(({ ctx }) => {
    return ctx.db.char.findMany({
      orderBy: { createdAt: "desc" },
      where: { createdBy: { id: ctx.session.user.id } },
    });
  }),
});
