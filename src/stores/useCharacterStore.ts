import { create } from "zustand";
import { type Character } from "~/server/api/routers/char";

type CharacterFields = {
  name?: string;
  age?: number;
  image?: string;
  playerName?: string;
  playerContact?: string;
  factionId?: number;
  clanId?: number;
  status?: string;
  title?: string;
  visible?: boolean;
  publicInfo?: string;
  sire?: string;
  childer?: string;
  ambition?: string;
  content?: string;
  abilityIds?: [];
  featuresWithComments?: FeatureWithComment[];
};

type FeatureWithComment = {
  id: number;
  comment: string;
  checked: boolean;
};

interface State {
  character: Character;
  abilityIds: number[];
  featuresWithComments: FeatureWithComment[];
  clear: () => void;
  update: (fields: CharacterFields) => void;
  setFeatures: (features: FeatureWithComment[]) => void;
  setAbilities: (abilities: number[]) => void;
}

const INITIAL_STATE: State = {
  character: {
    id: 0,
    age: "",
    playerName: "",
    playerContact: "",
    factionId: 0,
    clanId: 0,
    name: "",
    status: "",
    title: "",
    visible: false,
    publicInfo: "",
    sire: "",
    childer: "",
    ambition: "",
    content: "",
    createdAt: new Date(),
    updatedAt: new Date(),
    createdById: "",
  },
  abilityIds: [],
  featuresWithComments: [],
  clear: () => {
    return;
  },
  update: () => {
    return;
  },
  setFeatures: () => {
    return;
  },
  setAbilities: () => {
    return;
  },
};

export const useCharacterStore = create<State>((set, get) => ({
  character: Object.assign({}, INITIAL_STATE.character),
  featuresWithComments: [...INITIAL_STATE.featuresWithComments],
  abilityIds: [...INITIAL_STATE.abilityIds],
  update: (fields: CharacterFields) => {
    const updatedCharacter = get().character;
    if (fields.name) updatedCharacter.name = fields.name;
    if (fields.image) updatedCharacter.image = fields.image;
    if (fields.age) updatedCharacter.age = fields.age.toString();
    if (fields.playerName) updatedCharacter.playerName = fields.playerName;
    if (fields.playerContact)
      updatedCharacter.playerContact = fields.playerContact;
    if (fields.factionId) updatedCharacter.factionId = fields.factionId;
    if (fields.clanId) updatedCharacter.clanId = fields.clanId;
    if (fields.status) updatedCharacter.status = fields.status;
    if (fields.title) updatedCharacter.title = fields.title;
    if (fields.visible) updatedCharacter.visible = fields.visible;
    if (fields.publicInfo) updatedCharacter.publicInfo = fields.publicInfo;
    if (fields.sire) updatedCharacter.sire = fields.sire;
    if (fields.childer) updatedCharacter.childer = fields.childer;
    if (fields.ambition) updatedCharacter.ambition = fields.ambition;
    if (fields.content) updatedCharacter.content = fields.content;
    set((state: State) => ({
      ...state,
      character: updatedCharacter,
    }));
    return;
  },
  setFeatures: (features: FeatureWithComment[]) => {
    set((state: State) => ({
      ...state,
      featuresWithComments: features,
    }));
  },
  setAbilities: (abilityIds: number[]) => {
    set((state: State) => ({
      ...state,
      abilityIds: abilityIds,
    }));
  },
  clear: () => {
    set((state: State) => ({
      ...state,
      character: Object.assign({}, INITIAL_STATE.character),
      featuresWithComments: [
        ...state.featuresWithComments.map((fwc) => {
          return { id: fwc.id, comment: "", checked: false };
        }),
      ],
      abilityIds: [...INITIAL_STATE.abilityIds],
    }));
  },
}));
