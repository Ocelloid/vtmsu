import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

import type { User } from "~/server/api/routers/user";
import type { ItemEffects } from "~/server/api/routers/item";

export type Character = {
  id: number;
  name: string;
  factionId: number;
  clanId: number;
  visible: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdById: string;
  bloodAmount?: number;
  bloodPool?: number;
  health?: number;
  additionalAbilities?: number | null;
  playerId?: string | null;
  comment?: string | null;
  pending?: boolean | null;
  verified?: boolean | null;
  playerName?: string | null;
  playerContact?: string | null;
  timeout: boolean;
  timeoutReason?: string | null;
  timeoutAt?: Date | null;
  timeoutDuration?: number | null;
  banned: boolean;
  bannedReason?: string | null;
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
  rituals?: CharacterRituals[];
  knowledges?: CharacterKnowledges[];
  clan?: Clan;
  faction?: Faction;
  createdBy?: User;
  active?: boolean | null;
  effects?: CharacterEffects[];
};

export type CharacterKnowledges = {
  id: number;
  characterId: number;
  knowledgeId: number;
  knowledge?: Knowledge;
  Char?: Character;
};

export type Knowledge = {
  id: number;
  name: string;
  content: string;
  visibleToPlayer: boolean;
};

export type CharacterRituals = {
  id: number;
  characterId: number;
  ritualId: number;
  ritual?: Ritual;
  Char?: Character;
};

export type CharacterAbility = {
  id: number;
  characterId: number;
  abilityId: number;
  abilitiy?: Ability;
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
  icon?: string | null;
  visibleToPlayer: boolean;
};

export type Clan = {
  id: number;
  name: string;
  content: string;
  icon?: string | null;
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
  cost: number;
  icon?: string | null;
  content: string;
  expertise: boolean;
  requirementId?: number | null;
  visibleToPlayer: boolean;
  AbilityAvailable?: AbilityAvailable[];
  AbilityEffects?: AbilityEffects[];
};

export type Effect = {
  id: number;
  name: string;
  content?: string | null;
  expiration: number;
  color?: string | null;
  visibleToPlayer: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  CharacterEffects?: CharacterEffects[];
  ItemEffects?: ItemEffects[];
  RitualEffects?: RitualEffects[];
  FeatureEffects?: FeatureEffects[];
};

export type FeatureEffects = {
  id: number;
  featureId: number;
  effectId: number;
  expires?: Date | null;
  effect?: Effect;
  Feature?: Feature;
};

export type AbilityEffects = {
  id: number;
  abilityId: number;
  effectId: number;
  expires?: Date | null;
  effect?: Effect;
  Ability?: Ability;
};

export type CharacterEffects = {
  id?: number;
  characterId: number;
  effectId: number;
  expires?: Date | null;
  effect?: Effect;
  Char?: Character;
};

export type RitualEffects = {
  id?: number;
  ritualId: number;
  effectId: number;
  expires?: Date | null;
  effect?: Effect;
  Ritual?: Ritual;
};

export type Feature = {
  id: number;
  name: string;
  content: string;
  cost: number;
  visibleToPlayer: boolean;
  FeatureAvailable?: FeatureAvailable[];
  FeatureEffects?: FeatureEffects[];
};

export type Ritual = {
  id: number;
  name: string;
  image: string;
  recipe: string;
  content: string;
  visibleToPlayer: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  ritualKnowledges?: RitualKnowledges[];
  RitualEffects?: RitualEffects[];
};

export type RitualKnowledges = {
  id: number;
  ritualId: number;
  knowledgeId: number;
  ritual?: Ritual;
  knowledge?: Knowledge;
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
  heal: protectedProcedure
    .input(z.object({ id: z.number(), amount: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const char = await ctx.db.char.findUnique({
        where: { id: input.id },
      });
      if (!char) return;
      if (char.health + input.amount > 10) return;
      if (char.bloodAmount <= input.amount) return;
      await ctx.db.char.update({
        where: { id: input.id },
        data: {
          health: char.health + input.amount,
          bloodAmount: char.bloodAmount - input.amount,
        },
      });
    }),

  damage: protectedProcedure
    .input(z.object({ id: z.number(), amount: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const char = await ctx.db.char.findUnique({
        where: { id: input.id },
      });
      if (!char) return;
      if (char.health - input.amount < 0) return;
      await ctx.db.char.update({
        where: { id: input.id },
        data: {
          health: char.health - input.amount,
        },
      });
    }),

  applyAbility: protectedProcedure
    .input(z.object({ id: z.number(), charId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const char = await ctx.db.char.findUnique({
        where: { id: input.charId },
        include: {
          abilities: {
            include: {
              abilitiy: {
                include: { AbilityEffects: { include: { effect: true } } },
              },
            },
          },
        },
      });
      if (!char) return;

      const ability = char.abilities.find((a) => a.abilityId === input.id);
      if (!ability) return;
      if (ability.abilitiy.cost > char.bloodAmount) return;

      await ctx.db.char.update({
        where: { id: input.charId },
        data: {
          bloodAmount: char.bloodAmount - ability.abilitiy.cost,
        },
      });

      await ctx.db.characterEffects.createMany({
        data: ability.abilitiy.AbilityEffects.map((e) => ({
          characterId: input.charId,
          effectId: e.effect.id,
          expires: new Date(
            new Date().getTime() + e.effect.expiration * 60 * 1000,
          ),
        })),
      });
    }),

  getCharTraits: protectedProcedure.query(async ({ ctx }) => {
    const features = await ctx.db.feature.findMany({
      orderBy: { cost: "asc" },
      include: {
        FeatureAvailable: { include: { clan: true } },
        FeatureEffects: { include: { effect: true } },
      },
    });
    const abilities = await ctx.db.ability.findMany({
      orderBy: { name: "asc" },
      include: {
        AbilityAvailable: { include: { clan: true } },
        AbilityEffects: { include: { effect: true } },
      },
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
    const rituals = await ctx.db.ritual.findMany({
      orderBy: { name: "asc" },
      include: {
        ritualKnowledges: { include: { knowledge: true } },
        RitualEffects: { include: { effect: true } },
      },
    });
    const knowledges = await ctx.db.knowledge.findMany({
      orderBy: { name: "asc" },
    });
    const effects = await ctx.db.effect.findMany({
      orderBy: { name: "asc" },
    });
    return {
      knowledges: knowledges,
      rituals: rituals,
      features: features,
      abilities: abilities,
      factions: factions,
      clans: clans,
      effects: effects,
    };
  }),

  getFeatures: publicProcedure.query(({ ctx }) => {
    return ctx.db.feature.findMany({
      orderBy: { cost: "asc" },
      include: { FeatureAvailable: { include: { clan: true } } },
    });
  }),

  getAbilities: publicProcedure.query(({ ctx }) => {
    return ctx.db.ability.findMany({
      orderBy: { name: "asc" },
      include: { AbilityAvailable: { include: { clan: true } } },
    });
  }),

  getFactions: publicProcedure.query(({ ctx }) => {
    return ctx.db.faction.findMany({
      orderBy: { name: "desc" },
    });
  }),

  getClans: publicProcedure.query(({ ctx }) => {
    return ctx.db.clan.findMany({
      include: {
        ClanInFaction: { include: { faction: true } },
        AbilityAvailable: { include: { ability: true } },
        FeatureAvailable: { include: { feature: true } },
      },
    });
  }),

  getKnowledges: publicProcedure.query(({ ctx }) => {
    return ctx.db.knowledge.findMany({
      orderBy: { name: "asc" },
    });
  }),

  getRituals: publicProcedure.query(({ ctx }) => {
    return ctx.db.ritual.findMany({
      orderBy: { name: "asc" },
      include: {
        ritualKnowledges: { include: { knowledge: true } },
      },
    });
  }),

  getEffects: publicProcedure.query(({ ctx }) => {
    return ctx.db.effect.findMany({
      orderBy: { name: "asc" },
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
        effectIds: z.array(z.number()),
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
          FeatureEffects: {
            createMany: {
              data: input.effectIds.map((a) => {
                return { effectId: a };
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
        effectIds: z.array(z.number()),
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
          FeatureEffects: {
            deleteMany: {},
            createMany: {
              data: input.effectIds.map((a) => {
                return { effectId: a };
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

  createEffect: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        content: z.string(),
        color: z.string().optional(),
        visibleToPlayer: z.boolean(),
        expiration: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.effect.create({
        data: {
          name: input.name,
          content: input.content,
          color: input.color,
          visibleToPlayer: input.visibleToPlayer,
          expiration: input.expiration,
        },
      });
    }),

  updateEffect: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string(),
        content: z.string(),
        color: z.string().optional(),
        visibleToPlayer: z.boolean(),
        expiration: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.effect.update({
        where: { id: input.id },
        data: {
          name: input.name,
          content: input.content,
          color: input.color,
          visibleToPlayer: input.visibleToPlayer,
          expiration: input.expiration,
        },
      });
    }),

  deleteEffect: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.effect.delete({ where: { id: input.id } });
    }),

  createRitual: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        image: z.string(),
        recipe: z.string(),
        content: z.string(),
        visibleToPlayer: z.boolean(),
        ritualKnowledges: z.array(z.number()),
        effectIds: z.array(z.number()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.ritual.create({
        data: {
          name: input.name,
          image: input.image,
          recipe: input.recipe,
          content: input.content,
          visibleToPlayer: input.visibleToPlayer,
          ritualKnowledges: {
            createMany: {
              data: input.ritualKnowledges.map((a) => {
                return { knowledgeId: a };
              }),
            },
          },
          RitualEffects: {
            createMany: {
              data: input.effectIds.map((a) => {
                return { effectId: a };
              }),
            },
          },
        },
      });
    }),

  updateRitual: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string(),
        image: z.string(),
        recipe: z.string(),
        content: z.string(),
        visibleToPlayer: z.boolean(),
        ritualKnowledges: z.array(z.number()),
        effectIds: z.array(z.number()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.ritual.update({
        where: { id: input.id },
        data: {
          name: input.name,
          image: input.image,
          recipe: input.recipe,
          content: input.content,
          visibleToPlayer: input.visibleToPlayer,
          ritualKnowledges: {
            deleteMany: {},
            createMany: {
              data: input.ritualKnowledges.map((a) => {
                return { knowledgeId: a };
              }),
            },
          },
          RitualEffects: {
            deleteMany: {},
            createMany: {
              data: input.effectIds.map((a) => {
                return { effectId: a };
              }),
            },
          },
        },
      });
    }),

  deleteRitual: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.ritual.delete({ where: { id: input.id } });
    }),

  createKnowledge: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        content: z.string(),
        visibleToPlayer: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.knowledge.create({
        data: {
          name: input.name,
          content: input.content,
          visibleToPlayer: input.visibleToPlayer,
        },
      });
    }),

  updateKnowledge: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string(),
        content: z.string(),
        visibleToPlayer: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.knowledge.update({
        where: { id: input.id },
        data: {
          name: input.name,
          content: input.content,
          visibleToPlayer: input.visibleToPlayer,
        },
      });
    }),

  deleteKnowledge: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.knowledge.delete({ where: { id: input.id } });
    }),

  createAbility: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        cost: z.number(),
        content: z.string(),
        expertise: z.boolean(),
        icon: z.string().optional(),
        requirementId: z.number().optional(),
        visibleToPlayer: z.boolean(),
        clanIds: z.array(z.number()),
        effectIds: z.array(z.number()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.ability.create({
        data: {
          name: input.name,
          cost: input.cost,
          icon: input.icon,
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
          AbilityEffects: {
            createMany: {
              data: input.effectIds.map((a) => {
                return { effectId: a };
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
        cost: z.number(),
        content: z.string(),
        expertise: z.boolean(),
        icon: z.string().optional(),
        requirementId: z.number().optional(),
        visibleToPlayer: z.boolean(),
        clanIds: z.array(z.number()),
        effectIds: z.array(z.number()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.ability.update({
        where: { id: input.id },
        data: {
          name: input.name,
          cost: input.cost,
          icon: input.icon,
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
          AbilityEffects: {
            deleteMany: {},
            createMany: {
              data: input.effectIds.map((a) => {
                return { effectId: a };
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
        icon: z.string().optional(),
        visibleToPlayer: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.faction.create({
        data: {
          name: input.name,
          icon: input.icon,
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
        icon: z.string().optional(),
        visibleToPlayer: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.faction.update({
        where: { id: input.id },
        data: {
          name: input.name,
          icon: input.icon,
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
        icon: z.string().optional(),
        factionIds: z.array(z.number().nullish()),
        visibleToPlayer: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.clan.create({
        data: {
          name: input.name,
          icon: input.icon,
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
        icon: z.string().optional(),
        factionIds: z.array(z.number().nullish()),
        visibleToPlayer: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.clan.update({
        where: { id: input.id },
        data: {
          name: input.name,
          icon: input.icon,
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
        name: z.string(),
        title: z.string().nullish(),
        status: z.string().nullish(),
        content: z.string().nullish(),
        ambition: z.string().nullish(),
        publicInfo: z.string().nullish(),
        playerName: z.string().nullish(),
        playerContact: z.string().nullish(),
        additionalAbilities: z.number(),
        playerId: z.string().nullish(),
        clanId: z.number().optional(),
        factionId: z.number().optional(),
        image: z.string(),
        age: z.string(),
        sire: z.string(),
        childer: z.string(),
        abilities: z.array(z.number()),
        knowledges: z.array(z.number()),
        rituals: z.array(z.number()),
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
          clanId: input.clanId ?? 0,
          factionId: input.factionId ?? 0,
          name: input.name,
          title: input.title,
          status: input.status,
          content: input.content,
          ambition: input.ambition,
          publicInfo: input.publicInfo,
          playerName: input.playerName,
          playerContact: input.playerContact,
          additionalAbilities: input.additionalAbilities,
          playerId: input.playerId ? input.playerId : ctx.session.user.id,
          pending: true,
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
          knowledges: {
            createMany: {
              data: input.knowledges.map((a) => {
                return { knowledgeId: a };
              }),
            },
          },
          rituals: {
            createMany: {
              data: input.rituals.map((a) => {
                return { ritualId: a };
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

  switchPlayer: protectedProcedure
    .input(z.object({ id: z.number(), playerId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.char.update({
        where: { id: input.id },
        data: {
          playerId: input.playerId,
        },
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string(),
        title: z.string().nullish(),
        playerName: z.string().nullish(),
        playerContact: z.string().nullish(),
        status: z.string().nullish(),
        content: z.string().nullish(),
        ambition: z.string().nullish(),
        publicInfo: z.string().nullish(),
        playerId: z.string().nullish(),
        clanId: z.number().optional(),
        additionalAbilities: z.number(),
        factionId: z.number().optional(),
        image: z.string(),
        age: z.string(),
        sire: z.string(),
        childer: z.string(),
        abilities: z.array(z.number()),
        knowledges: z.array(z.number()),
        rituals: z.array(z.number()),
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
      const char = await ctx.db.char.findUnique({
        where: { id: input.id },
        include: {
          abilities: { include: { abilitiy: true } },
          features: { include: { feature: true } },
          knowledges: { include: { knowledge: true } },
          rituals: { include: { ritual: true } },
        },
      });
      const newAbilities = await ctx.db.ability.findMany({
        where: { id: { in: input.abilities } },
      });
      const newFeatures = await ctx.db.feature.findMany({
        where: { id: { in: input.features.map((f) => f.id) } },
      });
      const newKnowledges = await ctx.db.knowledge.findMany({
        where: { id: { in: input.knowledges } },
      });
      const newRituals = await ctx.db.ritual.findMany({
        where: { id: { in: input.rituals } },
      });
      const abilitiesChanged =
        !char?.abilities
          .map((a) => a.abilityId)
          .every((v) => input.abilities.includes(v)) ||
        !input.abilities.every((v) =>
          char?.abilities.map((a) => a.abilityId).includes(v),
        );
      const featuresChanged =
        !char?.features
          .map((a) => a.featureId)
          .every((v) => input.features.map((f) => f.id).includes(v)) ||
        !input.features
          .map((f) => f.id)
          .every((v) => char?.features.map((a) => a.featureId).includes(v));
      const knowledgesChanged =
        !char?.knowledges
          .map((a) => a.knowledgeId)
          .every((v) => input.knowledges.includes(v)) ||
        !input.knowledges.every((v) =>
          char?.knowledges.map((a) => a.knowledgeId).includes(v),
        );
      const ritualsChanged =
        !char?.rituals
          .map((a) => a.ritualId)
          .every((v) => input.rituals.includes(v)) ||
        !input.rituals.every((v) =>
          char?.rituals.map((a) => a.ritualId).includes(v),
        );
      const changedFields = [];
      if (char?.name !== input.name)
        changedFields.push({
          name: "Имя",
          from: char?.name,
          to: input.name,
        });
      if (char?.clanId !== input.clanId)
        changedFields.push({
          name: "Клан",
          from: char?.clanId,
          to: input.clanId,
        });
      if (char?.factionId !== input.factionId)
        changedFields.push({
          name: "Фракция",
          from: char?.factionId,
          to: input.factionId,
        });
      if (char?.title !== input.title)
        changedFields.push({
          name: "Титул",
          from: char?.title,
          to: input.title,
        });
      if (char?.status !== input.status)
        changedFields.push({
          name: "Статус",
          from: char?.status,
          to: input.status,
        });
      if (char?.content !== input.content)
        changedFields.push({
          name: "Квента",
          from: char?.content,
          to: input.content,
        });
      if (char?.ambition !== input.ambition)
        changedFields.push({
          name: "Амбиции",
          from: char?.ambition,
          to: input.ambition,
        });
      if (char?.age !== input.age)
        changedFields.push({
          name: "Возраст",
          from: char?.age,
          to: input.age,
        });
      if (char?.sire !== input.sire)
        changedFields.push({
          name: "Сир",
          from: char?.sire,
          to: input.sire,
        });
      if (char?.childer !== input.childer)
        changedFields.push({
          name: "Чайлды",
          from: char?.childer,
          to: input.childer,
        });
      if (char?.additionalAbilities !== input.additionalAbilities)
        changedFields.push({
          name: "Дополнительные очки дисциплин",
          from: char?.additionalAbilities,
          to: input.additionalAbilities,
        });
      if (abilitiesChanged)
        changedFields.push({
          name: "Дисциплины",
          from: char?.abilities.map((a) => a.abilitiy.name).join(", "),
          to: newAbilities.map((a) => a.name).join(", "),
        });
      if (featuresChanged)
        changedFields.push({
          name: "Дополнения",
          from: char?.features
            .map((a) => [a.feature.name, a.description].join(": "))
            .join(", "),
          to: newFeatures
            .map((a) =>
              [a.name, input.features.find((f) => f.id === a.id)?.comment].join(
                ": ",
              ),
            )
            .join(", "),
        });
      if (knowledgesChanged)
        changedFields.push({
          name: "Знания",
          from: char?.knowledges.map((a) => a.knowledge.name).join(", "),
          to: newKnowledges.map((a) => a.name).join(", "),
        });
      if (ritualsChanged)
        changedFields.push({
          name: "Ритуалы",
          from: char?.rituals.map((a) => a.ritual.name).join(", "),
          to: newRituals.map((a) => a.name).join(", "),
        });
      const shouldVerify =
        char?.clanId !== input.clanId ||
        char?.factionId !== input.factionId ||
        char?.title !== input.title ||
        char?.status !== input.status ||
        char?.content !== input.content ||
        char?.ambition !== input.ambition ||
        char?.age !== input.age ||
        char?.sire !== input.sire ||
        char?.childer !== input.childer ||
        char?.name !== input.name ||
        abilitiesChanged ||
        featuresChanged ||
        knowledgesChanged ||
        ritualsChanged ||
        char?.pending;
      return ctx.db.char.update({
        where: { id: input.id },
        data: {
          clanId: input.clanId,
          factionId: input.factionId,
          playerName: input.playerName,
          playerContact: input.playerContact,
          playerId: input.playerId ? input.playerId : char?.playerId,
          additionalAbilities: input.additionalAbilities,
          name: input.name,
          title: input.title,
          status: input.status,
          content: input.content,
          ambition: input.ambition,
          publicInfo: input.publicInfo,
          pending: shouldVerify,
          verified: !shouldVerify,
          image: input.image,
          age: input.age,
          sire: input.sire,
          childer: input.childer,
          visible: input.visible,
          p_comment:
            "<div>" +
            changedFields
              .map((cF) =>
                [
                  "<p>",
                  cF.name,
                  ' было "',
                  cF.from?.toString(),
                  '" стало "',
                  cF.to,
                  '"<p/>',
                ].join(""),
              )
              .join("") +
            "</div>",
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
          knowledges: {
            deleteMany: {},
            createMany: {
              data: input.knowledges.map((a) => {
                return { knowledgeId: a };
              }),
            },
          },
          rituals: {
            deleteMany: {},
            createMany: {
              data: input.rituals.map((a) => {
                return { ritualId: a };
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

  deny: protectedProcedure
    .input(z.object({ id: z.number(), comment: z.string() }))
    .mutation(({ ctx, input }) => {
      return ctx.db.char.update({
        where: { id: input.id },
        data: { comment: input.comment, verified: false, pending: false },
      });
    }),

  allow: protectedProcedure
    .input(z.object({ id: z.number(), comment: z.string() }))
    .mutation(({ ctx, input }) => {
      return ctx.db.char.update({
        where: { id: input.id },
        data: { comment: input.comment, verified: true, pending: false },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(({ ctx, input }) => {
      return ctx.db.char.delete({ where: { id: input.id } });
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { id: ctx.session.user.id },
      });
      const whereData = user?.isAdmin
        ? { id: input.id }
        : { id: input.id, playerId: ctx.session.user.id };
      const char = await ctx.db.char.findFirst({
        where: { ...whereData },
        include: {
          faction: true,
          clan: true,
          abilities: { include: { abilitiy: true } },
          features: {
            include: {
              feature: {
                include: { FeatureEffects: { include: { effect: true } } },
              },
            },
          },
          knowledges: { include: { knowledge: true } },
          rituals: { include: { ritual: true } },
          effects: { include: { effect: true } },
        },
      });
      return char;
    }),

  getPrivateDataById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { id: ctx.session.user.id },
      });
      const whereData = user?.isAdmin
        ? { id: input.id }
        : { id: input.id, playerId: ctx.session.user.id };
      return ctx.db.char.findFirst({
        where: whereData,
        select: {
          active: true,
          createdAt: true,
          updatedAt: true,
          id: true,
          factionId: true,
          clanId: true,
          visible: true,
          createdById: true,
          name: true,
          age: true,
          sire: true,
          childer: true,
          ambition: true,
          content: true,
          comment: true,
          p_comment: true,
          abilities: { include: { abilitiy: true } },
          features: { include: { feature: true } },
          knowledges: { include: { knowledge: true } },
          rituals: { include: { ritual: true } },
        },
      });
    }),

  getPublicDataById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(({ ctx, input }) => {
      return ctx.db.char.findUnique({
        where: { id: input.id },
        select: {
          createdAt: true,
          updatedAt: true,
          id: true,
          factionId: true,
          clanId: true,
          visible: true,
          createdById: true,
          name: true,
          playerId: true,
          playerName: true,
          playerContact: true,
          image: true,
          title: true,
          status: true,
          publicInfo: true,
          faction: true,
          verified: true,
          pending: true,
          clan: true,
        },
      });
    }),

  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.db.char.findMany({
      orderBy: { pending: "desc" },
      include: {
        faction: true,
        clan: true,
        features: { include: { feature: true } },
      },
    });
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
      where: { playerId: ctx.session.user.id },
    });
  }),
});
