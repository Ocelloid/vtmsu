import { create } from "zustand";

type FeatureWithComment = {
  id: number;
  cost: number;
  comment: string;
  checked: boolean;
};

type OptionalFields = {
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
  isEditing?: boolean;
  additionalAbilities?: number;
};

type RequiredFields = {
  abilityIds: number[];
  featuresWithComments: FeatureWithComment[];
};

interface Actions {
  clear: () => void;
  update: (fields: OptionalFields) => void;
  storeFeatures: (features: FeatureWithComment[]) => void;
  storeAbilities: (abilities: number[]) => void;
}

const INITIAL_STATE: OptionalFields & RequiredFields = {
  age: 0,
  playerName: "",
  playerContact: "",
  image: "",
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
  abilityIds: [],
  additionalAbilities: 0,
  featuresWithComments: [],
  isEditing: false,
};

type StateFields = OptionalFields & RequiredFields;

export const useCharacterStore = create<StateFields & Actions>((set) => ({
  ...Object.assign({}, INITIAL_STATE),
  update: (fields: OptionalFields) => {
    set((state: StateFields) => ({
      ...state,
      isEditing: "isEditing" in fields ? fields.isEditing : state.isEditing,
      age: "age" in fields ? fields.age : state.age,
      image: "image" in fields ? fields.image : state.image,
      playerName: "playerName" in fields ? fields.playerName : state.playerName,
      playerContact:
        "playerContact" in fields ? fields.playerContact : state.playerContact,
      factionId: "factionId" in fields ? fields.factionId : state.factionId,
      clanId: "clanId" in fields ? fields.clanId : state.clanId,
      name: "name" in fields ? fields.name : state.name,
      status: "status" in fields ? fields.status : state.status,
      title: "title" in fields ? fields.title : state.title,
      visible: "visible" in fields ? fields.visible : state.visible,
      publicInfo: "publicInfo" in fields ? fields.publicInfo : state.publicInfo,
      sire: "sire" in fields ? fields.sire : state.sire,
      childer: "childer" in fields ? fields.childer : state.childer,
      ambition: "ambition" in fields ? fields.ambition : state.ambition,
      content: "content" in fields ? fields.content : state.content,
      additionalAbilities:
        "additionalAbilities" in fields
          ? fields.additionalAbilities
          : state.additionalAbilities,
    }));
    return;
  },
  storeFeatures: (features: FeatureWithComment[]) => {
    set((state: StateFields) => ({
      ...state,
      featuresWithComments: features,
    }));
  },
  storeAbilities: (abilityIds: number[]) => {
    set((state: StateFields) => ({
      ...state,
      abilityIds: abilityIds,
    }));
  },
  clear: () => {
    set((state: StateFields) => ({
      ...Object.assign({}, INITIAL_STATE),
      featuresWithComments: [
        ...state.featuresWithComments.map((fwc) => {
          return { ...fwc, checked: false };
        }),
      ],
      abilityIds: [...INITIAL_STATE.abilityIds],
    }));
  },
}));
