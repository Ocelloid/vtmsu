import { Input, Button, Select, SelectItem } from "@nextui-org/react";
import { FaPlus } from "react-icons/fa";
import { useRouter } from "next/router";
import type { Character, Faction, Clan } from "~/server/api/routers/char";
import { LoadingPage } from "~/components/Loading";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { api } from "~/utils/api";
import CharacterCard from "../CharacterCard";

export default function Characters() {
  const router = useRouter();
  const { data: sessionData } = useSession();
  const [chars, setChars] = useState<Character[]>([]);
  const [factionIds, setFactionIds] = useState<number[]>([]);
  const [factions, setFactions] = useState<Faction[]>([]);
  const [clanIds, setClanIds] = useState<number[]>([]);
  const [clans, setClans] = useState<Clan[]>([]);
  const [name, setName] = useState("");

  const { data: traitsData, isLoading: isTraitsLoading } =
    api.char.getCharTraits.useQuery();
  const { data: isPersonnel, isLoading: isUserPersonnelLoading } =
    api.user.userIsPersonnel.useQuery(undefined, { enabled: !!sessionData });
  const { data: charList, isLoading: isCharListLoading } =
    api.char.getAll.useQuery(undefined, { enabled: isPersonnel });

  useEffect(() => {
    if (!!traitsData) {
      setFactions(traitsData.factions);
      setClans(traitsData.clans);
    }
  }, [traitsData]);

  useEffect(() => {
    setChars(charList ?? []);
  }, [charList]);

  if (isCharListLoading || isUserPersonnelLoading || isTraitsLoading)
    return <LoadingPage />;

  return (
    <>
      <div className="grid grid-cols-4 justify-between gap-2 py-2 sm:grid-cols-10">
        <Button
          variant="ghost"
          className="col-span-4 h-8 w-full rounded-lg border-white hover:!bg-red-950/50 hover:text-white dark:border-warning dark:text-white sm:col-span-3 xl:col-span-2"
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
          Добавить персонажа
        </Button>
        <p className="hidden justify-end py-1 sm:flex xl:col-span-2">Поиск:</p>
        <Input
          size="sm"
          variant="bordered"
          className="col-span-4 sm:col-span-2"
          aria-label="Имя"
          placeholder="Имя"
          value={name}
          onValueChange={setName}
        />
        <Select
          size="sm"
          variant="bordered"
          aria-label="Фракция"
          placeholder="Фракция"
          className="col-span-2"
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
          className="col-span-2"
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
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {chars
          .filter((c) =>
            !!factionIds.length ? factionIds.includes(c.factionId) : true,
          )
          .filter((c) => (!!clanIds.length ? clanIds.includes(c.clanId) : true))
          .filter((c) =>
            !!name ? c.name.toLowerCase().includes(name.toLowerCase()) : true,
          )
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
