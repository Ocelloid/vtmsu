import Head from "next/head";
import { useSession } from "next-auth/react";
import { LoadingPage } from "~/components/Loading";
import { api } from "~/utils/api";
import { Select, SelectItem, Tabs, Tab } from "@nextui-org/react";
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

export default function Game() {
  const { data: sessionData } = useSession();
  const { data: myCharacterData, isLoading: isMyCharactersLoading } =
    api.char.getMine.useQuery(undefined, { enabled: !!sessionData });

  const [selectedCharacter, setSelectedCharacter] = useState<number>();

  useEffect(() => {
    if (!!myCharacterData) setSelectedCharacter(myCharacterData[0]?.id);
  }, [myCharacterData]);

  if (!sessionData)
    return (
      <div className="flex h-[100vh] w-[100vw] items-center justify-center">
        Войдите, чтобы увидеть эту страницу
      </div>
    );
  if (!myCharacterData?.length)
    return (
      <div className="flex h-[100vh] w-[100vw] items-center justify-center">
        Сначала создайте персонажа
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
      <main className="flex flex-col">
        <div className="container mt-24 flex min-h-[calc(100vh-8rem)] flex-col gap-2 rounded-none bg-white/75 p-2 dark:bg-red-950/50 sm:rounded-b-lg">
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
              setSelectedCharacter(Number(e.target.value));
            }}
          >
            {myCharacterData.map((c) => (
              <SelectItem key={c.id} value={c.id.toString()} textValue={c.name}>
                <div className="flex flex-col gap-1">
                  <div className="text-small dark:text-red-100">{c.name}</div>
                  <div className="flex flex-row gap-1">
                    <Image
                      alt="icon"
                      className="mr-2 max-h-12 min-w-12 max-w-12 object-contain"
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
                panel:
                  "min-h-[calc(100vh-13.5rem)] sm:min-h-[calc(100vh-14rem)] py-0",
                tab: "p-1 w-min",
                tabList: "w-full",
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
                Экономика
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
