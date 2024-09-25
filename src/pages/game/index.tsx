import Head from "next/head";
import { useSession } from "next-auth/react";
import { LoadingPage } from "~/components/Loading";
import { api } from "~/utils/api";
import { Select, SelectItem, Tabs, Tab, Link } from "@nextui-org/react";
import { useState, useEffect } from "react";
import { GiLightBackpack, GiMoneyStack } from "react-icons/gi";
import { CgShapeRhombus, CgInfinity } from "react-icons/cg";
import { FaQrcode, FaMap, FaShoppingBasket } from "react-icons/fa";
import { IoMdChatboxes } from "react-icons/io";
import Money from "~/components/game/Money";
import AbilityPage from "~/components/game/AbilityPage";
import EffectsPage from "~/components/game/EffectsPage";
import Inventory from "~/components/game/Inventory";
import Tickets from "~/components/game/Tickets";
import CharQRCode from "~/components/game/CharQRCode";
import CharacterCard from "~/components/CharacterCard";
import BloodMeter from "~/components/game/BloodMeter";
import HealthMeter from "~/components/game/HealthMeter";
import { useRouter } from "next/router";

export default function Game() {
  const router = useRouter();
  const { data: sessionData } = useSession();
  const { data: myCharacterData, isLoading: isMyCharactersLoading } =
    api.char.getMine.useQuery(undefined, {
      enabled: !!sessionData,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    });
  const [selectedCharacter, setSelectedCharacter] = useState<number>();
  const { data: char, refetch } = api.char.getById.useQuery(
    {
      id: selectedCharacter!,
    },
    {
      enabled: !!selectedCharacter,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    },
  );

  const { data: appData } = api.util.getAppData.useQuery();
  useEffect(() => {
    if (appData) {
      if (!appData.gameAllowed) void router.push("/characters");
    }
  }, [appData, router]);

  useEffect(() => {
    if (!!myCharacterData) setSelectedCharacter(myCharacterData[0]?.id);
  }, [myCharacterData]);

  if (!sessionData)
    return (
      <div className="flex h-[100vh] w-[100vw] items-center justify-center">
        Войдите, чтобы увидеть эту страницу
      </div>
    );
  if (!myCharacterData?.filter((c) => c.verified).length)
    return (
      <div className="flex h-[100vh] w-[100vw] flex-col items-center justify-center">
        <Link href="/characters/new">Сначала&nbsp;создайте&nbsp;персонажа</Link>
        и дождитесь верификации
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
        <div className="container flex h-screen flex-col gap-1 overflow-auto rounded-none bg-white/75 p-2 dark:bg-red-950/50 sm:h-full sm:rounded-b-lg">
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
                  <CharacterCard character={c} isSelect={true} />
                </SelectItem>
              ))}
          </Select>
          {!!char && (
            <>
              <BloodMeter char={char} />
              <HealthMeter char={char} refetch={refetch} />
              <Tabs
                aria-label="Игровое меню"
                placement="bottom"
                classNames={{
                  panel:
                    "py-0 mb-auto overflow-y-auto h-full max-h-[calc(100vh-176px)]",
                  tab: "p-1 w-min",
                  tabList: "w-full",
                  wrapper: "flex-grow",
                }}
              >
                <Tab
                  key="disc"
                  title={
                    <div className="flex flex-row items-center gap-1 text-red-900 dark:text-red-700">
                      <CgShapeRhombus size={28} />
                      <span className="hidden text-lg font-bold lg:flex">
                        Дисциплины
                      </span>
                    </div>
                  }
                  className="flex flex-col gap-2"
                >
                  <AbilityPage char={char} refetch={refetch} />
                </Tab>
                <Tab
                  key="effects"
                  title={
                    <div className="flex min-w-7 flex-row items-center justify-center gap-1 text-red-900 dark:text-red-700">
                      <div className="rounded-full border-2 border-red-900 p-0.5 dark:border-red-700">
                        <CgInfinity size={16} />
                      </div>
                      <span className="hidden text-lg font-bold lg:flex">
                        Эффекты
                      </span>
                    </div>
                  }
                  className="flex flex-col gap-2"
                >
                  <EffectsPage char={char} />
                </Tab>
                <Tab
                  key="hunt"
                  title={
                    <div className="flex flex-row items-center gap-1 text-red-900 dark:text-red-700">
                      <FaMap size={28} />
                      <span className="hidden text-lg font-bold lg:flex">
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
                      <span className="hidden text-lg font-bold lg:flex">
                        Вещи
                      </span>
                    </div>
                  }
                  className="flex flex-col gap-2 overflow-y-auto "
                >
                  <Inventory char={char} />
                </Tab>
                <Tab
                  key="shop"
                  title={
                    <div className="flex flex-row items-center gap-1 text-red-900 dark:text-red-700">
                      <FaShoppingBasket size={28} />
                      <span className="hidden text-lg font-bold lg:flex">
                        Магазин
                      </span>
                    </div>
                  }
                  className="flex flex-col gap-2 overflow-y-auto "
                >
                  Магазин
                </Tab>
                <Tab
                  key="money"
                  title={
                    <div className="flex flex-row items-center gap-1 text-red-900 dark:text-red-700">
                      <GiMoneyStack size={28} />
                      <span className="hidden text-lg font-bold lg:flex">
                        Экономика
                      </span>
                    </div>
                  }
                  className="flex flex-col gap-2"
                >
                  <Money characterId={char.id} />
                </Tab>
                <Tab
                  key="chat"
                  title={
                    <div className="flex flex-row items-center gap-1 text-red-900 dark:text-red-700">
                      <IoMdChatboxes size={28} />
                      <span className="hidden text-lg font-bold lg:flex">
                        Заявки
                      </span>
                    </div>
                  }
                  className="flex flex-col gap-2"
                >
                  <Tickets char={char} />
                </Tab>
                <Tab
                  key="qrcode"
                  title={
                    <div className="flex flex-row items-center gap-1 text-red-900 dark:text-red-700">
                      <FaQrcode size={28} />
                      <span className="hidden text-lg font-bold lg:flex">
                        QR-код
                      </span>
                    </div>
                  }
                  className="flex flex-col gap-2"
                >
                  <p className="text-justify text-sm">
                    Это код вашего персонажа. Он может быть использован для
                    передачи предметов, предприятий, очков влияния, скана ауры
                    или применения эффектов. В случае гибели персонажа он
                    используется для лута и диаблери. При каждом открытии этой
                    страницы генерируется новый QR-код - сохранять старые не
                    нужно, так как они вскоре потеряют действие.
                  </p>
                  <CharQRCode characterId={char.id} />
                </Tab>
              </Tabs>
            </>
          )}
        </div>
      </main>
    </>
  );
}
