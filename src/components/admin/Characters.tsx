import { Input, Button, Select, SelectItem, Checkbox } from "@nextui-org/react";
import { FaPlus } from "react-icons/fa";
import { useRouter } from "next/router";
import type {
  Character,
  Faction,
  Clan,
  Feature,
  Knowledge,
} from "~/server/api/routers/char";
import { LoadingPage } from "~/components/Loading";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { api } from "~/utils/api";
import CharacterCard from "~/components/CharacterCard";

export default function Characters() {
  const router = useRouter();
  const { data: sessionData } = useSession();
  const [chars, setChars] = useState<Character[]>([]);
  const [knowledgeIds, setKnowledgeIds] = useState<number[]>([]);
  const [knowledges, setKnowledges] = useState<Knowledge[]>([]);
  const [featureIds, setFeatureIds] = useState<number[]>([]);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [factionIds, setFactionIds] = useState<number[]>([]);
  const [factions, setFactions] = useState<Faction[]>([]);
  const [clanIds, setClanIds] = useState<number[]>([]);
  const [clans, setClans] = useState<Clan[]>([]);
  const [name, setName] = useState("");
  const [hasNightmares, setHasNightmares] = useState(false);

  const { data: traitsData, isLoading: isTraitsLoading } =
    api.char.getCharTraits.useQuery();
  const { data: isPersonnel, isLoading: isUserPersonnelLoading } =
    api.user.userIsPersonnel.useQuery(undefined, { enabled: !!sessionData });
  const { data: charList, isLoading: isCharListLoading } =
    api.char.getAll.useQuery(undefined, { enabled: isPersonnel });

  useEffect(() => {
    if (!!traitsData) {
      setKnowledges(traitsData.knowledges);
      setFeatures(traitsData.features);
      setFactions(traitsData.factions);
      setClans(traitsData.clans);
    }
  }, [traitsData]);

  useEffect(() => {
    setChars(charList ?? []);
  }, [charList]);

  if (isCharListLoading || isUserPersonnelLoading || isTraitsLoading)
    return <LoadingPage />;

  const filteredSorted = chars
    .sort((a, b) => a.id - b.id)
    .filter((c) =>
      !!factionIds.length ? factionIds.includes(c.factionId) : true,
    )
    .filter((c) =>
      !!featureIds.length
        ? featureIds.every((fId) =>
            c.features?.map((f) => f.featureId).includes(fId),
          )
        : true,
    )
    .filter((c) =>
      !!knowledgeIds.length
        ? knowledgeIds.every((fId) =>
            c.knowledges?.map((f) => f.knowledgeId).includes(fId),
          )
        : true,
    )
    .filter((c) => (!!clanIds.length ? clanIds.includes(c.clanId) : true))
    .filter((c) =>
      !!name ? c.name.toLowerCase().includes(name.toLowerCase()) : true,
    )
    .filter((c) =>
      !!hasNightmares
        ? c.features?.find((f) => f.feature?.name === "Кошмары")
        : true,
    );

  return (
    <>
      <div className="flex flex-col justify-between gap-2 py-2 sm:flex-row">
        <Button
          variant="ghost"
          className="h-8 w-full max-w-96 rounded-lg border-white hover:!bg-red-950/50 hover:text-white dark:border-warning dark:text-white"
          onClick={async () => {
            await router.push(
              {
                pathname: `/characters/new`,
              },
              undefined,
              { shallow: false },
            );
          }}
        >
          <FaPlus />
          Добавить
        </Button>
        {/* <p className="hidden justify-end py-1 sm:flex xl:col-span-1">Поиск:</p> */}
        <Checkbox
          isSelected={hasNightmares}
          onValueChange={setHasNightmares}
          color="warning"
        >
          Кошмары
        </Checkbox>
        <Input
          size="sm"
          variant="bordered"
          className="min-w-24 max-w-80"
          aria-label="Имя"
          placeholder="Имя"
          value={name}
          onValueChange={setName}
        />
        <div className="flex w-full min-w-64 flex-row gap-2">
          <Select
            size="sm"
            variant="bordered"
            aria-label="Фракция"
            placeholder="Фракция"
            selectionMode="multiple"
            selectedKeys={factionIds.map((f) => f.toString())}
            onChange={(e) => {
              setFactionIds(
                !!e.target.value
                  ? e.target.value.split(",").map((s) => Number(s))
                  : [],
              );
            }}
          >
            {factions.map((faction) => (
              <SelectItem
                key={faction.id}
                value={faction.id}
                textValue={faction.name}
              >
                {faction.name}
              </SelectItem>
            ))}
          </Select>
          <Select
            size="sm"
            variant="bordered"
            placeholder="Клан"
            aria-label="Клан"
            selectionMode="multiple"
            selectedKeys={clanIds.map((f) => f.toString())}
            onChange={(e) => {
              setClanIds(
                !!e.target.value
                  ? e.target.value.split(",").map((s) => Number(s))
                  : [],
              );
            }}
          >
            {clans.map((clan) => (
              <SelectItem key={clan.id} value={clan.id} textValue={clan.name}>
                {clan.name}
              </SelectItem>
            ))}
          </Select>
        </div>
        <Select
          size="sm"
          variant="bordered"
          placeholder="Дополнения"
          aria-label="Дополнения"
          selectionMode="multiple"
          selectedKeys={featureIds.map((f) => f.toString())}
          onChange={(e) => {
            setFeatureIds(
              !!e.target.value
                ? e.target.value.split(",").map((s) => Number(s))
                : [],
            );
          }}
        >
          {features.map((feature) => (
            <SelectItem
              key={feature.id}
              value={feature.id}
              textValue={feature.name}
            >
              {feature.name}
            </SelectItem>
          ))}
        </Select>
        <Select
          size="sm"
          variant="bordered"
          placeholder="Знания"
          aria-label="Знания"
          selectionMode="multiple"
          selectedKeys={knowledgeIds.map((f) => f.toString())}
          onChange={(e) => {
            setKnowledgeIds(
              !!e.target.value
                ? e.target.value.split(",").map((s) => Number(s))
                : [],
            );
          }}
        >
          {knowledges.map((knowledge) => (
            <SelectItem
              key={knowledge.id}
              value={knowledge.id}
              textValue={knowledge.name}
            >
              {knowledge.name}
            </SelectItem>
          ))}
        </Select>
      </div>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {filteredSorted
          .filter((c) => !c.verified && c.pending)
          .map((char) => (
            <CharacterCard
              key={char.id}
              character={char}
              handleEditCharacter={(cid: number) => {
                void router.push(
                  {
                    pathname: `/characters/${cid}/edit`,
                  },
                  undefined,
                  { shallow: false },
                );
              }}
            />
          ))}
        {filteredSorted
          .filter((c) => !c.verified && !c.pending)
          .map((char) => (
            <CharacterCard
              key={char.id}
              character={char}
              handleEditCharacter={(cid: number) => {
                void router.push(
                  {
                    pathname: `/characters/${cid}/edit`,
                  },
                  undefined,
                  { shallow: false },
                );
              }}
            />
          ))}
        {filteredSorted
          .filter((c) => c.verified)
          .map((char) => (
            <CharacterCard
              key={char.id}
              character={char}
              handleEditCharacter={(cid: number) => {
                void router.push(
                  {
                    pathname: `/characters/${cid}/edit`,
                  },
                  undefined,
                  { shallow: false },
                );
              }}
            />
          ))}
      </div>
    </>
  );
}
