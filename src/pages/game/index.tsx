import Head from "next/head";
import { useSession } from "next-auth/react";
import { LoadingPage } from "~/components/Loading";
import { api } from "~/utils/api";
import { Select, SelectItem, Tabs, Tab, Link } from "@nextui-org/react";
import default_char from "~/../public/default_char.png";
import Image from "next/image";
import { useState, useEffect } from "react";
import {
  GiRestingVampire,
  GiLightBackpack,
  GiMoneyStack,
} from "react-icons/gi";
import { FaQrcode, FaMap } from "react-icons/fa";
import { IoMdChatboxes } from "react-icons/io";
import Money from "~/components/game/Money";

export default function Game() {
  const { data: sessionData } = useSession();
  const { data: myCharacterData, isLoading: isMyCharactersLoading } =
    api.char.getMine.useQuery(undefined, { enabled: !!sessionData });

  const [selectedCharacter, setSelectedCharacter] = useState<number>();

  useEffect(() => {
    if (!!myCharacterData) setSelectedCharacter(myCharacterData[0]?.id);
    console.log(myCharacterData);
  }, [myCharacterData]);

  if (!sessionData)
    return (
      <div className="flex h-[100vh] w-[100vw] items-center justify-center">
        Войдите, чтобы увидеть эту страницу
      </div>
    );
  if (!myCharacterData?.filter((c) => c.verified).length)
    return (
      <div className="flex h-[100vh] w-[100vw] items-center justify-center">
        Сначала&nbsp;<Link href="/characters/new">создайте&nbsp;персонажа</Link>
        &nbsp;и дождитесь верификации
      </div>
    );

  if (isMyCharactersLoading) return <LoadingPage />;

  return (
    <>
      <Head>
        <title>Игра</title>
        <meta name="description" content="Маскарад Вампиров" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="fixed flex h-full w-full flex-grow basis-full flex-col sm:static sm:mt-24 sm:pb-2">
        <div className="container flex h-full flex-col gap-2 rounded-none bg-white/75 p-2 dark:bg-red-950/50 sm:rounded-b-lg">
          <Select
            size="sm"
            variant="bordered"
            placeholder="Выберите персонажа"
            aria-label="characters"
            className="w-full"
            selectedKeys={
              selectedCharacter ? [selectedCharacter.toString()] : []
            }
            onChange={(e) => {
              setSelectedCharacter(
                !!e.target.value ? Number(e.target.value) : selectedCharacter,
              );
            }}
          >
            {myCharacterData
              .filter((c) => c.verified)
              .map((c) => (
                <SelectItem
                  key={c.id.toString()}
                  value={c.id.toString()}
                  textValue={c.name}
                >
                  <div className="flex flex-col gap-1">
                    <div className="text-small dark:text-red-100">{c.name}</div>
                    <div className="flex flex-row gap-1">
                      <Image
                        alt="icon"
                        className="mr-2 max-h-36 min-w-36 max-w-36 object-contain"
                        src={!!c.image ? c.image : default_char}
                        height={128}
                        width={128}
                      />
                      <div
                        className="tiptap-display whitespace-normal text-tiny dark:text-red-100"
                        dangerouslySetInnerHTML={{
                          __html: c.publicInfo ?? "",
                        }}
                      />
                    </div>
                  </div>
                </SelectItem>
              ))}
          </Select>
          {!!selectedCharacter && (
            <Tabs
              aria-label="Игровое меню"
              placement="bottom"
              classNames={{
                panel: "py-0 h-full",
                tab: "p-1 w-min",
                tabList: "w-full",
                wrapper: "flex-grow",
              }}
            >
              <Tab
                key="main"
                title={
                  <GiRestingVampire
                    size={28}
                    className="text-red-900 dark:text-red-700"
                  />
                }
                className="flex flex-col gap-2"
              >
                Главная страница
              </Tab>
              <Tab
                key="hunt"
                title={
                  <div className="flex flex-row items-center gap-1 text-red-900 dark:text-red-700">
                    <FaMap size={28} />
                    <span className="hidden text-lg font-bold md:flex">
                      Карта
                    </span>
                  </div>
                }
                className="flex flex-col gap-2"
              >
                Карта
              </Tab>
              <Tab
                key="items"
                title={
                  <div className="flex flex-row items-center gap-1 text-red-900 dark:text-red-700">
                    <GiLightBackpack size={28} />
                    <span className="hidden text-lg font-bold md:flex">
                      Инвентарь
                    </span>
                  </div>
                }
                className="flex flex-col gap-2"
              >
                Инвентарь
              </Tab>
              <Tab
                key="money"
                title={
                  <div className="flex flex-row items-center gap-1 text-red-900 dark:text-red-700">
                    <GiMoneyStack size={28} />
                    <span className="hidden text-lg font-bold md:flex">
                      Экономика
                    </span>
                  </div>
                }
                className="flex flex-col gap-2"
              >
                <Money />
              </Tab>
              <Tab
                key="chat"
                title={
                  <div className="flex flex-row items-center gap-1 text-red-900 dark:text-red-700">
                    <IoMdChatboxes size={28} />
                    <span className="hidden text-lg font-bold md:flex">
                      Заявки
                    </span>
                  </div>
                }
                className="flex flex-col gap-2"
              >
                Заявки
              </Tab>
              <Tab
                key="qrcode"
                title={
                  <div className="flex flex-row items-center gap-1 text-red-900 dark:text-red-700">
                    <FaQrcode size={28} />
                    <span className="hidden text-lg font-bold md:flex">
                      QR-коды
                    </span>
                  </div>
                }
                className="flex flex-col gap-2"
              >
                QR-коды
              </Tab>
            </Tabs>
          )}
        </div>
      </main>
    </>
  );
}
