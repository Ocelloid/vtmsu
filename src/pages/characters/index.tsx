import Head from "next/head";
import { Tabs, Tab, Button } from "@nextui-org/react";
import { useRouter } from "next/router";
import { LoadingPage } from "~/components/Loading";
import { useState, useEffect } from "react";
import { api } from "~/utils/api";
import { type Character } from "~/server/api/routers/char";
import { FaPlus } from "react-icons/fa";
import { useSession } from "next-auth/react";
import CharacterCard from "~/components/CharacterCard";

export default function Characters() {
  const { data: sessionData } = useSession();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [myCharacters, setMyCharacters] = useState<Character[]>([]);
  const [selectedTab, setSelectedTab] = useState("all");
  const router = useRouter();

  const { data: characterData, isLoading: isCharactersLoading } =
    api.char.getAll.useQuery(undefined, { enabled: !!sessionData });
  const { data: myCharacterData, isLoading: isMyCharactersLoading } =
    api.char.getMine.useQuery(undefined, { enabled: !!sessionData });

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

  if (isCharactersLoading || isMyCharactersLoading) return <LoadingPage />;
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
                <Button
                  variant="ghost"
                  className="w-90 mx-auto h-8 border-warning hover:!bg-warning/25 dark:text-white dark:hover:text-white"
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
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                  {characters.map((character) => (
                    <CharacterCard key={character.id} character={character} />
                  ))}
                </div>
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
                  className="w-90 mx-auto h-8 border-warning hover:!bg-warning/25 dark:text-white dark:hover:text-white"
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
