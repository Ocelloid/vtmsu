import Head from "next/head";
import { useSession } from "next-auth/react";
import { LoadingPage } from "~/components/Loading";
import { api } from "~/utils/api";
import {
  Select,
  SelectItem,
  Tabs,
  Tab,
  Link,
  Badge,
  Modal,
  Button,
  ModalContent,
  ModalBody,
  ModalHeader,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/react";
import { useState, useEffect } from "react";
import { GiLightBackpack, GiMoneyStack } from "react-icons/gi";
import { CgShapeRhombus, CgInfinity } from "react-icons/cg";
import { FaQrcode, FaMap, FaShoppingBasket, FaArrowLeft } from "react-icons/fa";
import { IoMdChatboxes } from "react-icons/io";
import BankAccounts from "~/components/game/BankAccounts";
import Companies from "~/components/game/Companies";
import AbilityPage from "~/components/game/AbilityPage";
import EffectsPage from "~/components/game/EffectsPage";
import Inventory from "~/components/game/Inventory";
import Tickets from "~/components/game/Tickets";
import CharQRCode from "~/components/game/CharQRCode";
import CharacterCard from "~/components/CharacterCard";
import BloodMeter from "~/components/game/BloodMeter";
import HealthMeter from "~/components/game/HealthMeter";
import GameStore from "~/components/game/GameStore";
import RitualPage from "~/components/game/RitualPage";
import OghamPage from "~/components/game/OghamPage";
import City from "~/components/game/City";
import { useRouter } from "next/router";

export default function Game() {
  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { data: sessionData } = useSession();
  const { data: isAdmin, isLoading: isUserAdminLoading } =
    api.user.userIsAdmin.useQuery(undefined, { enabled: !!sessionData });
  const { data: myCharacterData, isLoading: isMyCharactersLoading } =
    api.char.getMine.useQuery(undefined, {
      enabled: !!sessionData,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    });
  const { data: defaultCharacter, isLoading: isDefaultCharacterLoading } =
    api.char.getDefault.useQuery(undefined, {
      enabled: !!sessionData,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    });
  const {
    mutate: setDefaultCharacter,
    isPending: isSetDefaultCharacterPending,
  } = api.char.setDefault.useMutation();
  const [selectedCharacter, setSelectedCharacter] = useState<number>();
  const { data: char, refetch } = api.char.getById.useQuery(
    {
      id: selectedCharacter!,
    },
    {
      refetchInterval: 60000,
      enabled: !!selectedCharacter,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    },
  );
  const { mutate: updateBloodPool } = api.char.updateBloodPool.useMutation();

  const { data: appData } = api.util.getAppData.useQuery();
  useEffect(() => {
    if (appData) {
      if (!appData.gameAllowed && !isAdmin && !isUserAdminLoading)
        void router.push("/characters");
    }
  }, [appData, isAdmin, isUserAdminLoading, router]);

  useEffect(() => {
    if (!!char && !!selectedCharacter) {
      const activeEffects = char.effects.filter(
        (e) => (e.expires ?? new Date()) > new Date(),
      );
      if (
        activeEffects.some((e) => e.effect.name === "Таудроновое похмелье") &&
        !activeEffects.some((e) => e.effect.name === "Таудрон") &&
        char.bloodPool !== 5
      ) {
        updateBloodPool(
          { id: selectedCharacter, bloodPool: 5 },
          {
            onSuccess() {
              void refetch();
            },
          },
        );
      }
      if (
        !activeEffects.some((e) => e.effect.name === "Таудроновое похмелье") &&
        !activeEffects.some((e) => e.effect.name === "Таудрон") &&
        char.bloodPool !== 10
      )
        updateBloodPool(
          { id: selectedCharacter, bloodPool: 10 },
          {
            onSuccess() {
              void refetch();
            },
          },
        );
    }
  }, [char, selectedCharacter, updateBloodPool, refetch]);

  useEffect(() => {
    if (!!myCharacterData) {
      setSelectedCharacter(myCharacterData.filter((c) => c.verified)[0]?.id);
    }
  }, [myCharacterData]);

  useEffect(() => {
    if (!!defaultCharacter) setSelectedCharacter(defaultCharacter);
    else if (!!myCharacterData) {
      if (myCharacterData?.length === 1)
        setSelectedCharacter(myCharacterData[0]!.id);
      else if ((myCharacterData?.length ?? 0) > 1) onOpen();
    }
  }, [defaultCharacter, myCharacterData, onOpen]);

  if (!sessionData)
    return (
      <div className="flex h-[100svh] w-[100vw] items-center justify-center">
        Войдите, чтобы увидеть эту страницу
      </div>
    );
  if (!myCharacterData?.filter((c) => c.verified).length)
    return (
      <div className="flex h-[100svh] w-[100vw] flex-col items-center justify-center">
        <Link href="/characters/new">Сначала&nbsp;создайте&nbsp;персонажа</Link>
        и дождитесь верификации
      </div>
    );

  if (isMyCharactersLoading || isDefaultCharacterLoading)
    return <LoadingPage />;

  return (
    <>
      <Head>
        <title>Игра</title>
        <meta name="description" content="Маскарад Вампиров" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader>Выбор персонажа</ModalHeader>
          <ModalBody>
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
                .sort((a, b) => a.id - b.id)
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
          </ModalBody>
          <ModalFooter className="flex flex-col">
            <Button
              variant="faded"
              color="success"
              isDisabled={!selectedCharacter || isSetDefaultCharacterPending}
              onClick={() =>
                setDefaultCharacter(
                  { id: selectedCharacter! },
                  { onSuccess: () => onClose() },
                )
              }
            >
              Выбрать
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
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
              .sort((a, b) => a.id - b.id)
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
                defaultSelectedKey={"vamp"}
                classNames={{
                  panel:
                    "py-0 mb-auto overflow-y-auto h-full max-h-[calc(100svh-176px)]",
                  tab: "h-8 p-0 w-full overflow-hidden overflow-y-hidden",
                  tabList: "w-full justify-between",
                  wrapper: "flex-grow",
                  tabContent:
                    "overflow-hidden overflow-y-hidden w-full h-8 items-center justify-center flex flex-col",
                }}
              >
                <Tab
                  key="back"
                  title={
                    <Link
                      className="flex flex-row items-center gap-1 text-red-900 dark:text-red-700"
                      href="/characters"
                    >
                      <FaArrowLeft size={24} />
                      <span className="text-md hidden font-bold lg:flex">
                        Назад
                      </span>
                    </Link>
                  }
                  className="flex flex-col gap-2"
                />
                <Tab
                  key="vamp"
                  title={
                    <div className="flex flex-row items-center gap-1 text-red-900 dark:text-red-700">
                      <CgShapeRhombus size={24} />
                      <span className="text-md hidden font-bold lg:flex">
                        Вампиризм
                      </span>
                    </div>
                  }
                  className="flex flex-col gap-2"
                >
                  <Tabs
                    aria-label="Вампиризм"
                    placement="bottom"
                    classNames={{
                      panel:
                        "py-0 mb-auto overflow-y-auto h-full max-h-[calc(100svh-216px)] sm:max-h-[calc(100svh-316px)]",
                      tab: "p-1 w-min",
                      tabList:
                        "w-full justify-between rounded-none rounded-t-lg mx-2 ",
                      wrapper: "flex-grow",
                    }}
                  >
                    <Tab
                      key="disciplines"
                      title={
                        <div className="flex flex-row items-center gap-1 text-red-900 dark:text-red-700">
                          <span className="text-md font-semibold">
                            Дисциплины
                          </span>
                        </div>
                      }
                      className="flex flex-col gap-2"
                    >
                      <AbilityPage char={char} refetch={refetch} />
                    </Tab>
                    {char.knowledges?.some((k) => k.knowledge?.id === 4) && (
                      <Tab
                        key="ogham"
                        title={
                          <div className="flex flex-row items-center gap-1 text-red-900 dark:text-red-700">
                            <span className="text-md font-semibold">Охам</span>
                          </div>
                        }
                        className="flex flex-col gap-2"
                      >
                        <OghamPage />
                      </Tab>
                    )}
                    <Tab
                      key="rituals"
                      title={
                        <div className="flex flex-row items-center gap-1 text-red-900 dark:text-red-700">
                          <span className="text-md font-semibold">Ритуалы</span>
                        </div>
                      }
                      className="flex flex-col gap-2"
                    >
                      <RitualPage char={char} refetch={refetch} />
                    </Tab>
                  </Tabs>
                </Tab>
                <Tab
                  key="effects"
                  title={
                    <div className="flex min-w-7 flex-row items-center justify-center gap-1 text-red-900 dark:text-red-700">
                      <div className="rounded-full border-2 border-red-900 p-0.5 dark:border-red-700">
                        <CgInfinity size={14} />
                      </div>
                      <span className="text-md hidden font-bold lg:flex">
                        Эффекты
                      </span>
                    </div>
                  }
                  className="flex flex-col gap-2"
                >
                  <EffectsPage char={char} auspex={false} />
                </Tab>
                <Tab
                  key="hunt"
                  title={
                    <div className="flex flex-row items-center gap-1 text-red-900 dark:text-red-700">
                      <FaMap size={24} />
                      <span className="text-md hidden font-bold lg:flex">
                        Город
                      </span>
                    </div>
                  }
                  className="flex flex-col gap-2"
                >
                  <City char={char} refetch={refetch} />
                </Tab>
                <Tab
                  key="items"
                  title={
                    <div className="flex flex-row items-center gap-1 text-red-900 dark:text-red-700">
                      <GiLightBackpack size={24} />
                      <span className="text-md hidden font-bold lg:flex">
                        Предметы
                      </span>
                    </div>
                  }
                  className="flex flex-col gap-2 overflow-y-auto "
                >
                  <Inventory char={char} refetchChar={refetch} />
                </Tab>
                <Tab
                  key="shop"
                  title={
                    <div className="flex flex-row items-center gap-1 text-red-900 dark:text-red-700">
                      <FaShoppingBasket size={24} />
                      <span className="text-md hidden font-bold lg:flex">
                        Магазин
                      </span>
                    </div>
                  }
                  className="flex flex-col gap-2 overflow-y-auto "
                >
                  <GameStore char={char} />
                </Tab>
                <Tab
                  key="money"
                  title={
                    <div className="flex flex-row items-center gap-1 text-red-900 dark:text-red-700">
                      <GiMoneyStack size={24} />
                      <span className="text-md hidden font-bold lg:flex">
                        Бизнес
                      </span>
                    </div>
                  }
                  className="flex flex-col gap-2"
                >
                  <Tabs
                    aria-label="Меню предприятий"
                    placement="bottom"
                    classNames={{
                      panel:
                        "py-0 mb-auto overflow-y-auto h-full max-h-[calc(100svh-216px)]",
                      tab: "p-1 w-min",
                      tabList:
                        "w-full justify-between rounded-none rounded-t-lg mx-2 ",
                      wrapper: "flex-grow",
                    }}
                  >
                    <Tab
                      key="companies"
                      title={
                        <div className="flex flex-row items-center gap-1 text-red-900 dark:text-red-700">
                          <span className="text-md font-semibold">
                            Предприятия
                          </span>
                        </div>
                      }
                      className="flex flex-col gap-2"
                    >
                      <Companies characterId={char.id} />
                    </Tab>
                    <Tab
                      key="accounts"
                      title={
                        <div className="flex flex-row items-center gap-1 text-red-900 dark:text-red-700">
                          <span className="text-md font-semibold">Счета</span>
                        </div>
                      }
                      className="flex flex-col gap-2"
                    >
                      <BankAccounts characterId={char.id} />
                    </Tab>
                  </Tabs>
                </Tab>
                <Tab
                  key="chat"
                  title={
                    <div className="flex flex-row items-center gap-1 text-red-900 dark:text-red-700">
                      <Badge
                        content={
                          char.Ticket?.filter((t) => !t.isResolved).length
                        }
                        aria-label="Заявки"
                        color="warning"
                        size="sm"
                        placement="bottom-left"
                        isInvisible={
                          !char.Ticket?.filter((t) => !t.isResolved).length
                        }
                        showOutline={false}
                        classNames={{
                          badge: "mb-1 sm:mb-2 text-xs rounded-lg",
                        }}
                      >
                        <IoMdChatboxes size={24} />
                        <span className="text-md hidden font-bold lg:flex">
                          Заявки
                        </span>
                      </Badge>
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
                      <FaQrcode size={24} />
                      <span className="text-md hidden font-bold lg:flex">
                        QR-код
                      </span>
                    </div>
                  }
                  className="flex flex-col gap-2"
                >
                  <CharQRCode char={char} />
                </Tab>
              </Tabs>
            </>
          )}
        </div>
      </main>
    </>
  );
}
