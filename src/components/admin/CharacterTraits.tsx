import { Tabs, Tab, CircularProgress } from "@nextui-org/react";
import EditCharacterTrait from "~/components/modals/editCharacterTrait";
import { FaPencilAlt, FaPlusCircle, FaEye, FaEyeSlash } from "react-icons/fa";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { disciplines, factions, clans } from "~/assets";
import { useTheme } from "next-themes";
import type {
  Faction,
  Clan,
  Ability,
  Feature,
  Ritual,
  Knowledge,
  Effect,
} from "~/server/api/routers/char";
import { useState, useEffect } from "react";
import { api } from "~/utils/api";
import { LoadingPage } from "~/components/Loading";
import { formatTime } from "~/utils/text";

type characterTraitsType = {
  label: string;
  type: string;
  list:
    | Faction[]
    | Clan[]
    | Ability[]
    | Feature[]
    | Ritual[]
    | Knowledge[]
    | Effect[];
}[];

const CharacterTraits = () => {
  const { theme } = useTheme();
  const { data: sessionData } = useSession();
  const [characterTraits, setCharacterTraits] = useState<characterTraitsType>([
    { label: "Фракции", type: "Faction", list: [] },
    { label: "Кланы", type: "Clan", list: [] },
    { label: "Способности", type: "Ability", list: [] },
    { label: "Дополнения", type: "Feature", list: [] },
    { label: "Знания", type: "Knowledge", list: [] },
    { label: "Ритуалы", type: "Ritual", list: [] },
    { label: "Эффекты", type: "Effect", list: [] },
  ]);

  const discKeys = Object.keys(disciplines);
  const discIcons = Object.values(disciplines).map((disc, i) => {
    return { value: disc, key: discKeys[i] };
  });
  const clanKeys = Object.keys(clans);
  const clanSelection = Object.values(clans)
    .map((clan, i) => {
      if (theme === "light" && !clanKeys[i]?.includes("_white"))
        return { key: clanKeys[i] ?? "", value: clan };
      if (theme === "dark" && clanKeys[i]?.includes("_white"))
        return { key: clanKeys[i]?.replace("_white", "") ?? "", value: clan };
      else return undefined;
    })
    .filter((x) => !!x);
  const factionKeys = Object.keys(factions);
  const factionSelection = Object.values(factions)
    .map((faction, i) => {
      if (theme === "light" && !factionKeys[i]?.includes("_white"))
        return { key: factionKeys[i] ?? "", value: faction };
      if (theme === "dark" && factionKeys[i]?.includes("_white"))
        return {
          key: factionKeys[i]?.replace("_white", "") ?? "",
          value: faction,
        };
      else return undefined;
    })
    .filter((x) => !!x);

  const icons = [...discIcons, ...clanSelection, ...factionSelection].filter(
    (i) => !!i,
  );
  const defaultIcon = theme === "light" ? factions._ankh : factions._ankh_white;
  const {
    data: charTraitsData,
    isLoading: isCharTraitsLoading,
    refetch: refetchTraits,
  } = api.char.getCharTraits.useQuery(undefined, { enabled: !!sessionData });

  useEffect(() => {
    setCharacterTraits([
      {
        label: "Фракции",
        type: "Faction",
        list: charTraitsData?.factions ?? [],
      },
      {
        label: "Кланы",
        type: "Clan",
        list: charTraitsData?.clans ?? [],
      },
      {
        label: "Способности",
        type: "Ability",
        list: charTraitsData?.abilities ?? [],
      },
      {
        label: "Дополнения",
        type: "Feature",
        list: charTraitsData?.features ?? [],
      },
      {
        label: "Знания",
        type: "Knowledge",
        list: charTraitsData?.knowledges ?? [],
      },
      {
        label: "Ритуалы",
        type: "Ritual",
        list: charTraitsData?.rituals ?? [],
      },
      {
        label: "Эффекты",
        type: "Effect",
        list: charTraitsData?.effects ?? [],
      },
    ]);
  }, [charTraitsData]);

  if (isCharTraitsLoading) return <LoadingPage />;

  return (
    <Tabs
      aria-label="tabs"
      variant="underlined"
      classNames={{
        tabList:
          "gap-0 grid grid-cols-4 md:grid-cols-8 w-full relative rounded-none p-0 border-b border-divider",
        cursor: "w-full bg-[#dc2626]",
        tab: "max-w-full px-0 h-8",
        base: "bg-danger/5 w-full",
        panel: "px-0 py-0",
      }}
    >
      {characterTraits.map((cs) => (
        <Tab
          key={cs.type}
          className="flex flex-col gap-8 md:gap-2"
          title={
            <div className="flex items-center space-x-2">
              <span>{cs.label}</span>
            </div>
          }
        >
          <div className="flex flex-col gap-4 pb-4 pt-2">
            <EditCharacterTrait
              traitType={cs.type}
              onClose={refetchTraits}
              className="w-full text-black dark:text-white"
            >
              <FaPlusCircle size={12} />
              Добавить
            </EditCharacterTrait>
            {cs.list.map((trait) => (
              <div key={trait.id} className="flex flex-col ">
                <div className="flex flex-row items-center">
                  {cs.type !== "Feature" &&
                    cs.type !== "Ritual" &&
                    cs.type !== "Effect" &&
                    cs.type !== "Knowledge" && (
                      <Image
                        alt="icon"
                        className="mr-2 max-h-12 max-w-12 object-contain"
                        src={
                          !!(trait as Ability).icon
                            ? icons.find(
                                (di) => di!.key === (trait as Ability).icon,
                              )?.value ?? ""
                            : defaultIcon
                        }
                        height={128}
                        width={128}
                      />
                    )}
                  {cs.type === "Effect" && (
                    <CircularProgress
                      size="md"
                      strokeWidth={2}
                      showValueLabel={true}
                      value={(trait as Effect).expiration ?? 1}
                      maxValue={(trait as Effect).expiration ?? 1}
                      valueLabel={`${!!(trait as Effect).expiration ? formatTime((trait as Effect).expiration * 60) : "∞"}`}
                      color={
                        (trait as Effect).color as
                          | "default"
                          | "success"
                          | "warning"
                          | "primary"
                          | "secondary"
                          | "danger"
                      }
                      className={`mr-2`}
                    />
                  )}
                  <div className="mr-auto flex flex-col">
                    <p className="text-2xl">{trait.name}</p>
                    <p className="text-sm italic">
                      {cs.type === "Clan" &&
                        `${(trait as Clan).ClanInFaction!.map((f) => f.faction?.name).join(", ")}`}
                      {cs.type === "Feature" && `${(trait as Feature).cost} `}
                      {cs.type === "Feature" &&
                        `${(trait as Feature).FeatureAvailable?.map((a) => a.clan?.name).join(", ")}`}
                      {cs.type === "Ability" &&
                        `${(trait as Ability).AbilityAvailable?.map((a) => a.clan?.name).join(", ")}`}
                      {cs.type === "Ability" &&
                        `${(trait as Ability).expertise ? " - Экспертная" : ""}`}
                      {cs.type === "Ritual" &&
                        `${(trait as Ritual).ritualKnowledges?.map((k) => k.knowledge?.name).join(", ")}`}
                    </p>
                    <p className="text-tiny">
                      {cs.type === "Ability" &&
                        `${(trait as Ability).AbilityEffects?.map((a) => a.effect?.name).join(", ")}`}
                      {cs.type === "Feature" &&
                        `${(trait as Feature).FeatureEffects?.map((a) => a.effect?.name).join(", ")}`}
                      {cs.type === "Ritual" &&
                        `${(trait as Ritual).RitualEffects?.map((a) => a.effect?.name).join(", ")}`}
                      {cs.type === "Ability" &&
                        `${(trait as Ability).cost ? ` - ${(trait as Ability).cost} ПК` : ""}`}
                    </p>
                  </div>
                  {trait.visibleToPlayer ? (
                    <FaEye size={24} className="mr-2" />
                  ) : (
                    <FaEyeSlash size={24} className="mr-2" />
                  )}
                  <EditCharacterTrait
                    trait={trait}
                    traitType={cs.type}
                    onClose={refetchTraits}
                    className="h-10 w-10 min-w-10 rounded-full p-0 text-black dark:text-white"
                  >
                    <FaPencilAlt size={16} />
                  </EditCharacterTrait>
                </div>
                <p className="whitespace-break-spaces text-sm">
                  {trait.content}
                </p>
                {cs.type === "Ritual" && (
                  <p className="whitespace-break-spaces pt-2 text-sm">
                    Рецепт: {(trait as Ritual).recipe}
                  </p>
                )}
              </div>
            ))}
          </div>
        </Tab>
      ))}
    </Tabs>
  );
};

export default CharacterTraits;
