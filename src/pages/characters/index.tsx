import Head from "next/head";
import { Tabs, Tab, Button } from "@nextui-org/react";
import { useRouter } from "next/router";
import { LoadingPage } from "~/components/Loading";
import { useState, useEffect } from "react";
import { api } from "~/utils/api";
import { type Character } from "~/server/api/routers/char";
import CharacterEditor from "~/components/editors/CharacterEditor";
import { FaPencilAlt } from "react-icons/fa";
import default_char from "~/../public/default_char.png";
import Image from "next/image";

export default function Characters() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [myCharacters, setMyCharacters] = useState<Character[]>([]);
  const [selectedTab, setSelectedTab] = useState("all");
  const router = useRouter();

  const {
    data: characterData,
    isLoading: isCharactersLoading,
    refetch: refetchAll,
  } = api.char.getAll.useQuery();
  const {
    data: myCharacterData,
    isLoading: isMyCharactersLoading,
    refetch: refetchMine,
  } = api.char.getMine.useQuery();
  useEffect(() => {
    setCharacters(
      !!characterData ? characterData.filter((c) => c.visible) : [],
    );
    setMyCharacters(myCharacterData ?? []);
  }, [characterData, myCharacterData]);

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
                {characters.map((character) => (
                  <div
                    key={character.id}
                    className="flex flex-1 flex-row gap-8"
                  >
                    <div className="flex flex-col">
                      <Image
                        className="mt-1 aspect-square h-[160px] w-[160px] rounded-md object-cover"
                        alt="char_photo"
                        src={!!character.image ? character.image : default_char}
                        height="320"
                        width="320"
                      />
                    </div>
                    <div className="flex flex-1 flex-col">
                      <p className="text-2xl">{character.name}</p>
                      <p className="text-sm italic">
                        {character.faction?.name}
                        {" - "}
                        {character.clan?.name}
                      </p>
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
                {myCharacters.map((character) => (
                  <div
                    key={character.id}
                    className="flex flex-1 flex-row gap-8"
                  >
                    <div className="flex flex-col">
                      <Image
                        className="mt-1 aspect-square h-[160px] w-[160px] rounded-md object-cover"
                        alt="char_photo"
                        src={!!character.image ? character.image : default_char}
                        height="320"
                        width="320"
                      />
                    </div>
                    <div className="flex flex-1 flex-col">
                      <div className="flex flex-row">
                        <p className="text-2xl">{character.name}</p>
                        <Button
                          variant="bordered"
                          color="warning"
                          className="ml-auto h-8 w-8 min-w-0 rounded-full p-0"
                          onClick={() => handleEditCharacter(character.id)}
                        >
                          <FaPencilAlt size={16} />
                        </Button>
                      </div>
                      <p className="text-sm italic">
                        {character.faction?.name}
                        {" - "}
                        {character.clan?.name}
                      </p>
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
