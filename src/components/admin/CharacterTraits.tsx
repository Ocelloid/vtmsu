import { Tabs, Tab } from "@nextui-org/react";
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
} from "~/server/api/routers/char";
import { useState, useEffect } from "react";
import { api } from "~/utils/api";
import { LoadingPage } from "~/components/Loading";

type characterTraitsType = {
  label: string;
  type: string;
  list: Faction[] | Clan[] | Ability[] | Feature[] | Ritual[] | Knowledge[];
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
        list:
          charTraitsData?.factions.sort((a, b) =>
            a.name > b.name ? 1 : b.name > a.name ? -1 : 0,
          ) ?? [],
      },
      {
        label: "Кланы",
        type: "Clan",
        list:
          charTraitsData?.clans.sort((a, b) =>
            a.name > b.name ? 1 : b.name > a.name ? -1 : 0,
          ) ?? [],
      },
      {
        label: "Способности",
        type: "Ability",
        list:
          charTraitsData?.abilities.sort((a, b) =>
            a.name > b.name ? 1 : b.name > a.name ? -1 : 0,
          ) ?? [],
      },
      {
        label: "Дополнения",
        type: "Feature",
        list: charTraitsData?.features.sort((a, b) => a.cost - b.cost) ?? [],
      },
      {
        label: "Знания",
        type: "Knowledge",
        list:
          charTraitsData?.knowledges.sort((a, b) =>
            a.name > b.name ? 1 : b.name > a.name ? -1 : 0,
          ) ?? [],
      },
      {
        label: "Ритуалы",
        type: "Ritual",
        list:
          charTraitsData?.rituals.sort((a, b) =>
            a.name > b.name ? 1 : b.name > a.name ? -1 : 0,
          ) ?? [],
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
              <div key={trait.id} className="flex flex-col">
                <div className="flex flex-row">
                  {cs.type !== "Feature" &&
                    cs.type !== "Ritual" &&
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
                    className="-mt-2 h-10 w-10 min-w-10 rounded-full p-0 text-black dark:text-white"
                  >
                    <FaPencilAlt size={16} />
                  </EditCharacterTrait>
                </div>
                <p className="whitespace-break-spaces text-sm">
                  {trait.content}
                </p>
              </div>
            ))}
          </div>
        </Tab>
      ))}
    </Tabs>
  );
};

export default CharacterTraits;
