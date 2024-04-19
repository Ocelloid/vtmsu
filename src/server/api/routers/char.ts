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
  title?: string | null;
  status?: string | null;
  image?: string | null;
  age?: string | null;
  sire?: string | null;
  childer?: string | null;
  ambition?: string | null;
  publicInfo?: string | null;
  content?: string | null;
  abilities?: CharacterAbility[];
  features?: CharacterFeature[];
  clan?: Clan;
  faction?: Faction;
  createdBy?: User;
};

export type CharacterAbility = {
  id: number;
  characterId: number;
  abilityId: number;
  ability?: Ability;
  Char?: Character;
};

export type CharacterFeature = {
  id: number;
  characterId: number;
  featureId: number;
  description?: string | null;
  feature?: Feature;
  Char?: Character;
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
  ClanInFaction?: ClanInFaction[];
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
  requirementId?: number | null;
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
      orderBy: { cost: "asc" },
      include: { FeatureAvailable: { include: { clan: true } } },
    });
    const abilities = await ctx.db.ability.findMany({
      orderBy: { name: "asc" },
      include: { AbilityAvailable: { include: { clan: true } } },
    });
    const factions = await ctx.db.faction.findMany({
      orderBy: { name: "desc" },
    });
    const clans = await ctx.db.clan.findMany({
      orderBy: { name: "asc" },
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
      orderBy: { cost: "asc" },
      include: { FeatureAvailable: { include: { clan: true } } },
    });
  }),

  getAbilities: protectedProcedure.query(({ ctx }) => {
    return ctx.db.ability.findMany({
      orderBy: { name: "asc" },
      include: { AbilityAvailable: { include: { clan: true } } },
    });
  }),

  getFactions: protectedProcedure.query(({ ctx }) => {
    return ctx.db.faction.findMany({
      orderBy: { name: "desc" },
    });
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
        requirementId: z.number().optional(),
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
          requirementId: input.requirementId,
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
        requirementId: z.number().optional(),
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
          requirementId: input.requirementId,
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
        title: z.string().nullish(),
        status: z.string().nullish(),
        content: z.string().nullish(),
        ambition: z.string().nullish(),
        publicInfo: z.string().nullish(),
        clanId: z.number(),
        factionId: z.number(),
        image: z.string(),
        age: z.string(),
        sire: z.string(),
        childer: z.string(),
        abilities: z.array(z.number()),
        features: z.array(
          z.object({
            id: z.number(),
            comment: z.string(),
            checked: z.boolean(),
          }),
        ),
        visible: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.char.create({
        data: {
          clanId: input.clanId,
          factionId: input.factionId,
          name: input.name,
          title: input.title,
          status: input.status,
          content: input.content,
          ambition: input.ambition,
          publicInfo: input.publicInfo,
          image: input.image,
          age: input.age,
          sire: input.sire,
          childer: input.childer,
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
                return { featureId: a.id, description: a.comment };
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

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1),
        title: z.string().nullish(),
        status: z.string().nullish(),
        content: z.string().nullish(),
        ambition: z.string().nullish(),
        publicInfo: z.string().nullish(),
        clanId: z.number(),
        factionId: z.number(),
        image: z.string(),
        age: z.string(),
        sire: z.string(),
        childer: z.string(),
        abilities: z.array(z.number()),
        features: z.array(
          z.object({
            id: z.number(),
            comment: z.string(),
            checked: z.boolean(),
          }),
        ),
        visible: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.char.update({
        where: { id: input.id },
        data: {
          clanId: input.clanId,
          factionId: input.factionId,
          name: input.name,
          title: input.title,
          status: input.status,
          content: input.content,
          ambition: input.ambition,
          publicInfo: input.publicInfo,
          image: input.image,
          age: input.age,
          sire: input.sire,
          childer: input.childer,
          visible: input.visible,
          createdById: ctx.session.user.id,
          abilities: {
            deleteMany: {},
            createMany: {
              data: input.abilities.map((a) => {
                return { abilityId: a };
              }),
            },
          },
          features: {
            deleteMany: {},
            createMany: {
              data: input.features.map((a) => {
                return { featureId: a.id, description: a.comment };
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

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(({ ctx, input }) => {
      return ctx.db.char.delete({ where: { id: input.id } });
    }),

  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(({ ctx, input }) => {
      return ctx.db.char.findUnique({
        where: { id: input.id },
        include: {
          faction: true,
          clan: true,
          abilities: { include: { abilitiy: true } },
          features: { include: { feature: true } },
        },
      });
    }),

  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.db.char.findMany({ include: { faction: true, clan: true } });
  }),

  getMine: protectedProcedure.query(({ ctx }) => {
    return ctx.db.char.findMany({
      include: {
        faction: true,
        clan: true,
        abilities: { include: { abilitiy: true } },
        features: { include: { feature: true } },
      },
      orderBy: { createdAt: "desc" },
      where: { createdBy: { id: ctx.session.user.id } },
    });
  }),
});
