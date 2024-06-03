import Head from "next/head";
import {
  Tabs,
  Tab,
  Button,
  Input,
  Select,
  SelectItem,
} from "@nextui-org/react";
import { useRouter } from "next/router";
import { LoadingPage } from "~/components/Loading";
import { useState, useEffect } from "react";
import { api } from "~/utils/api";
import { type Character } from "~/server/api/routers/char";
import { FaPlus } from "react-icons/fa";
import { useSession } from "next-auth/react";
import CharacterCard from "~/components/CharacterCard";
import type { Faction, Clan } from "~/server/api/routers/char";

export default function Characters() {
  const router = useRouter();
  const { data: sessionData } = useSession();
  const [selectedTab, setSelectedTab] = useState("mine");
  const [characters, setCharacters] = useState<Character[]>([]);
  const [myCharacters, setMyCharacters] = useState<Character[]>([]);
  const [factionIds, setFactionIds] = useState<number[]>([]);
  const [factions, setFactions] = useState<Faction[]>([]);
  const [clanIds, setClanIds] = useState<number[]>([]);
  const [clans, setClans] = useState<Clan[]>([]);
  const [name, setName] = useState("");

  const { data: characterData, isLoading: isCharactersLoading } =
    api.char.getAll.useQuery(undefined, { enabled: !!sessionData });
  const { data: myCharacterData, isLoading: isMyCharactersLoading } =
    api.char.getMine.useQuery(undefined, { enabled: !!sessionData });
  const { data: traitsData, isLoading: isTraitsLoading } =
    api.char.getCharTraits.useQuery();

  useEffect(() => {
    if (!!traitsData) {
      setFactions(traitsData.factions);
      setClans(traitsData.clans);
    }
  }, [traitsData]);

  useEffect(() => {
    setCharacters(
      !!characterData
        ? characterData.filter((c) => c.visible && c.verified)
        : [],
    );
    setMyCharacters(myCharacterData ?? []);

    const character = Array.isArray(router.query.character)
      ? router.query.character[0] ?? ""
      : router.query.character ?? "";
    if (character) setSelectedTab("edit");
  }, [characterData, myCharacterData, sessionData, router.query]);

  if (isCharactersLoading || isMyCharactersLoading || isTraitsLoading)
    return <LoadingPage />;
  if (!sessionData)
    return (
      <div className="flex h-[100vh] w-[100vw] items-center justify-center">
        Войдите, чтобы увидеть эту страницу
      </div>
    );
  if (!characterData) return <div>Something went wrong</div>;

  return (
    <>
      <Head>
        <title>Персонажи</title>
        <meta name="description" content="Маскарад Вампиров" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className=" flex min-h-screen flex-col pt-20">
        <div className="container flex flex-col px-4">
          <Tabs
            aria-label="tabs"
            variant="underlined"
            selectedKey={selectedTab}
            onSelectionChange={(e) => {
              setSelectedTab(e.toString());
            }}
            classNames={{
              tabList:
                "gap-6 w-full relative rounded-none p-0 border-b border-divider",
              cursor: "w-full bg-[#dc2626]",
              tab: "first:ml-auto max-w-fit px-0 h-12 last:mr-auto md:last:mr-0",
              panel: " py-0 pt-3 pb-0",
            }}
          >
            <Tab
              key={"all"}
              title={
                <div className="flex items-center space-x-2">
                  <span>Все персонажи</span>
                </div>
              }
            >
              <div className="flex flex-col gap-2">
                <div className="grid grid-cols-4 justify-between gap-2 sm:grid-cols-10">
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
                  <p className="hidden justify-end py-1 sm:flex xl:col-span-2">
                    Поиск:
                  </p>
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
                      <SelectItem
                        key={clan.id}
                        value={clan.id}
                        textValue={clan.name}
                      >
                        {clan.name}
                      </SelectItem>
                    ))}
                  </Select>
                </div>
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                  {characters
                    .filter((c) =>
                      !!factionIds.length
                        ? factionIds.includes(c.factionId)
                        : true,
                    )
                    .filter((c) =>
                      !!clanIds.length ? clanIds.includes(c.clanId) : true,
                    )
                    .filter((c) =>
                      !!name
                        ? c.name.toLowerCase().includes(name.toLowerCase())
                        : true,
                    )
                    .map((character) => (
                      <CharacterCard key={character.id} character={character} />
                    ))}
                </div>
                {!characters
                  .filter((c) =>
                    !!factionIds.length
                      ? factionIds.includes(c.factionId)
                      : true,
                  )
                  .filter((c) =>
                    !!clanIds.length ? clanIds.includes(c.clanId) : true,
                  )
                  .filter((c) =>
                    !!name
                      ? c.name.toLowerCase().includes(name.toLowerCase())
                      : true,
                  ).length && (
                  <p className="mx-auto text-2xl">
                    Не найдено ни одного персонажа
                  </p>
                )}
              </div>
            </Tab>
            <Tab
              key={"mine"}
              title={
                <div className="flex items-center space-x-2">
                  <span>Мои персонажи</span>
                </div>
              }
            >
              <div className="flex flex-col gap-2">
                <Button
                  variant="ghost"
                  className="mx-auto h-8 w-full rounded-lg border-white hover:!bg-red-950/50 hover:text-white dark:border-warning dark:text-white sm:w-64"
                  onClick={() => {
                    void router.push(
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

                <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                  {myCharacters.map((character) => (
                    <CharacterCard
                      key={character.id}
                      character={character}
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
              </div>
            </Tab>
          </Tabs>
        </div>
      </main>
    </>
  );
}
