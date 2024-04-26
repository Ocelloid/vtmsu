import {
  Accordion,
  AccordionItem,
  Input,
  Button,
  Select,
  SelectItem,
} from "@nextui-org/react";
import Link from "next/link";
import { FaPlus, FaLink } from "react-icons/fa";
import { useRouter } from "next/router";
import { VscUnverified, VscVerified, VscWarning } from "react-icons/vsc";
import type { Character, Faction, Clan } from "~/server/api/routers/char";
import { LoadingPage } from "~/components/Loading";
import CharacterSheet from "~/pages/characters/[pid]";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { api } from "~/utils/api";

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
  const {
    data: charList,
    isLoading: isCharListLoading,
    refetch: refetchCharList,
  } = api.char.getAll.useQuery(undefined, { enabled: isPersonnel });

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
      <Accordion
        isCompact
        variant="shadow"
        className="bg-white/75 dark:bg-red-950/50"
      >
        {chars
          .filter((c) =>
            !!factionIds.length ? factionIds.includes(c.factionId) : true,
          )
          .filter((c) => (!!clanIds.length ? clanIds.includes(c.clanId) : true))
          .filter((c) =>
            !!name ? c.name.toLowerCase().includes(name.toLowerCase()) : true,
          )
          .map((char) => (
            <AccordionItem
              key={char.id}
              aria-label={char.name}
              title={
                <div className="flex flex-row gap-1">
                  {char.verified ? (
                    <VscVerified size={24} className="text-success" />
                  ) : char.pending ? (
                    <VscUnverified size={24} className="text-secondary" />
                  ) : (
                    <VscWarning size={24} className="text-danger" />
                  )}
                  {char.name}
                </div>
              }
            >
              <Link
                href={`/characters/${char.id}`}
                target="_blank"
                className="mb-2 ml-1 flex flex-row items-center gap-2"
              >
                <FaLink size={16} />
                Перейти к персонажу
              </Link>
              <CharacterSheet charId={char.id} onChange={refetchCharList} />
            </AccordionItem>
          ))}
      </Accordion>
    </>
  );
}
