import Head from "next/head";
import { Tabs, Tab, Button } from "@nextui-org/react";
import { useRouter } from "next/router";
import { LoadingPage } from "~/components/Loading";
import { useState, useEffect } from "react";
import { api } from "~/utils/api";
import { type Character } from "~/server/api/routers/char";
import CharacterEditor from "~/components/editors/CharacterEditor";
import { FaPencilAlt, FaEye, FaEyeSlash, FaPlus } from "react-icons/fa";
import default_char from "~/../public/default_char.png";
import { useSession } from "next-auth/react";
import Image from "next/image";

export default function Characters() {
  const { data: sessionData } = useSession();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [myCharacters, setMyCharacters] = useState<Character[]>([]);
  const [selectedTab, setSelectedTab] = useState("all");
  const router = useRouter();

  const {
    data: characterData,
    isLoading: isCharactersLoading,
    refetch: refetchAll,
  } = api.char.getAll.useQuery(undefined, { enabled: !!sessionData });
  const {
    data: myCharacterData,
    isLoading: isMyCharactersLoading,
    refetch: refetchMine,
  } = api.char.getMine.useQuery(undefined, { enabled: !!sessionData });

  useEffect(() => {
    setCharacters(
      !!characterData ? characterData.filter((c) => c.visible) : [],
    );
    setMyCharacters(myCharacterData ?? []);
  }, [characterData, myCharacterData, sessionData]);

  const handleEditCharacter = (cid: number) => {
    setSelectedTab("edit");
    void router.push(
      {
        pathname: "/characters",
        query: { character: cid },
      },
      undefined,
      { shallow: true },
    );
  };

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
              void router.push(
                {
                  pathname: "/characters",
                },
                undefined,
                { shallow: true },
              );
              setSelectedTab(e.toString());
            }}
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
              <div className="flex flex-col gap-2">
                <Button
                  variant="ghost"
                  className="w-90 mx-auto h-8 border-warning text-white hover:!bg-warning/25 hover:text-white"
                  onClick={() => setSelectedTab("edit")}
                >
                  <FaPlus />
                  Добавить персонажа
                </Button>
                <div className="grid grid-cols-1 gap-2 xl:grid-cols-2 2xl:grid-cols-3">
                  {characters.map((character) => (
                    <div
                      key={character.id}
                      className="grid grid-cols-1 sm:grid-cols-3 sm:gap-4"
                    >
                      <div className="mb-2 flex flex-col sm:mb-0">
                        <Image
                          className="mx-auto mt-1 aspect-square h-full w-full rounded-md object-cover"
                          alt="char_photo"
                          src={
                            !!character.image ? character.image : default_char
                          }
                          height="640"
                          width="640"
                        />
                      </div>
                      <div className="col-span-2 flex flex-1 flex-col">
                        <div className="flex flex-row">
                          <p className="mr-auto break-all text-2xl">
                            {character.name}
                          </p>
                        </div>
                        {character.playerName && character.playerContact && (
                          <p className="text-xs font-bold">
                            {character.playerName}
                            {" - "}
                            {character.playerContact}
                          </p>
                        )}
                        <p className="text-xs italic">
                          {character.faction?.name}
                          {" - "}
                          {character.clan?.name}
                        </p>
                        <p className="text-xs italic">{character.status}</p>
                        <p className="text-xs italic">{character.title}</p>
                        <div
                          className="tiptap-display pb-8 text-justify"
                          dangerouslySetInnerHTML={{
                            __html: character.publicInfo!,
                          }}
                        />
                      </div>
                    </div>
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
                  className="w-90 mx-auto h-8 border-warning text-white hover:!bg-warning/25 hover:text-white"
                  onClick={() => setSelectedTab("edit")}
                >
                  <FaPlus />
                  Добавить персонажа
                </Button>
                <div className="grid grid-cols-1 gap-2 xl:grid-cols-2 2xl:grid-cols-3">
                  {myCharacters.map((character) => (
                    <div
                      key={character.id}
                      className="grid grid-cols-1 sm:grid-cols-3 sm:gap-4"
                    >
                      <div className="mb-2 flex flex-col sm:mb-0">
                        <Image
                          className="mx-auto mt-1 aspect-square h-full w-full rounded-md object-cover"
                          alt="char_photo"
                          src={
                            !!character.image ? character.image : default_char
                          }
                          height="640"
                          width="640"
                        />
                      </div>
                      <div className="col-span-2 flex flex-1 flex-col">
                        <div className="flex flex-row">
                          <p className="mr-auto break-all text-2xl">
                            {character.name}
                          </p>
                          {character.visible ? (
                            <FaEye size={24} className="mr-2 mt-1 min-w-8" />
                          ) : (
                            <FaEyeSlash size={24} className="mr-1 min-w-8" />
                          )}
                          <Button
                            variant="light"
                            color="warning"
                            className="h-8 w-8 min-w-8 rounded-full p-0"
                            onClick={() => handleEditCharacter(character.id)}
                          >
                            <FaPencilAlt size={16} />
                          </Button>
                        </div>
                        <p className="text-xs italic">
                          {character.faction?.name}
                          {" - "}
                          {character.clan?.name}
                        </p>
                        <p className="text-xs italic">{character.status}</p>
                        <p className="text-xs italic">{character.title}</p>
                        <div
                          className="tiptap-display pb-8 text-justify"
                          dangerouslySetInnerHTML={{
                            __html: character.publicInfo!,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Tab>
            <Tab
              key={"edit"}
              title={
                <div className="flex items-center space-x-2">
                  <span>Редактор</span>
                </div>
              }
            >
              <CharacterEditor
                onSuccess={() => {
                  void refetchAll();
                  void refetchMine();
                  void router.push(
                    {
                      pathname: "/characters",
                    },
                    undefined,
                    { shallow: true },
                  );
                  setSelectedTab("mine");
                }}
              />
            </Tab>
          </Tabs>
        </div>
      </main>
    </>
  );
}
