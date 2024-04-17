import Head from "next/head";
import { Tabs, Tab } from "@nextui-org/react";
import { LoadingPage } from "~/components/Loading";
import { useState, useEffect } from "react";
import { api } from "~/utils/api";
import { type Character } from "~/server/api/routers/char";

export default function Characters() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [myCharacters, setMyCharacters] = useState<Character[]>([]);
  const { data: characterData, isLoading } = api.char.getAll.useQuery();
  useEffect(() => {
    setCharacters(characterData ?? []);
    setMyCharacters(characterData ?? []);
  }, [characterData]);

  if (isLoading) return <LoadingPage />;
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
            classNames={{
              tabList:
                "gap-6 w-full relative rounded-none p-0 border-b border-divider",
              cursor: "w-full bg-[#dc2626]",
              tab: "first:ml-auto max-w-fit px-0 h-12 last:mr-auto md:last:mr-0",
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
              {characters.map((character) => (
                <p key={character.id}>{character.content}</p>
              ))}
            </Tab>
            <Tab
              key={"mine"}
              title={
                <div className="flex items-center space-x-2">
                  <span>Мои персонажи</span>
                </div>
              }
            >
              {myCharacters.map((character) => (
                <p key={character.id}>{character.content}</p>
              ))}
            </Tab>
            <Tab
              key={"edit"}
              title={
                <div className="flex items-center space-x-2">
                  <span>Редактор</span>
                </div>
              }
            >
              Редактор персонажа
            </Tab>
          </Tabs>
        </div>
      </main>
    </>
  );
}
