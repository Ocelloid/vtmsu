import { useEffect, useState } from "react";
import {
  Modal,
  ModalContent,
  ModalBody,
  Button,
  useDisclosure,
  ModalHeader,
  ModalFooter,
  Input,
  Checkbox,
} from "@nextui-org/react";
import { api } from "~/utils/api";
import { type Character } from "~/server/api/routers/char";
import { LoadingPage } from "~/components/Loading";
import { useGeolocation, type Location } from "~/utils/hooks";
import Image from "next/image";
import type { Item, Container } from "~/server/api/routers/item";
import QRScanner from "~/components/QRScanner";
import { degreesToCoordinate } from "~/utils/text";

export default function Inventory({
  char,
  refetchChar,
}: {
  char: Character;
  refetchChar: () => void;
}) {
  const { location, error, isLoading } = useGeolocation();
  const {
    isOpen: isDropOpen,
    onOpen: onDropOpen,
    onClose: onDropClose,
  } = useDisclosure();
  const {
    isOpen: isTradeOpen,
    onOpen: onTradeOpen,
    onClose: onTradeClose,
  } = useDisclosure();
  const {
    isOpen: isBleedOpen,
    onOpen: onBleedOpen,
    onClose: onBleedClose,
  } = useDisclosure();
  const { data: chars, isLoading: charsLoading } = api.char.getAll.useQuery();
  const { data: containers, isLoading: containersLoading } =
    api.item.getAllContainers.useQuery();
  const {
    data: itemsData,
    isLoading: itemsLoading,
    refetch: refetchItems,
  } = api.item.getByOwnerId.useQuery({ ownerId: char.id });

  const { mutate: giveItems, isPending: isGiveItemPending } =
    api.item.giveItems.useMutation();
  const { mutate: dropItems, isPending: isDropItemPending } =
    api.item.dropItems.useMutation();
  const { mutate: bleed, isPending: isCreateItemPending } =
    api.item.bleed.useMutation();
  const { mutate: storeItems, isPending: isStoreItemPending } =
    api.item.putItemsInContainer.useMutation();

  const [scannedChar, setScannedChar] = useState<Character>();
  const [scannedContainer, setScannedContainer] = useState<Container>();
  const [items, setItems] = useState<
    Array<{
      id: number;
      name: string;
      description: string;
      data: Item;
    }>
  >([]);
  const [inHand, setInHand] = useState<number[]>([]);

  useEffect(() => {
    if (!!itemsData)
      setItems(
        itemsData.map((item) => ({
          id: item.id,
          name: item.name,
          description: item.content ?? "",
          data: item,
        })),
      );
  }, [itemsData]);

  const handleTrade = () => {
    const itemsToGive = items.filter((item) => inHand.includes(item.id));
    if (!itemsToGive.length) return;
    if (!!scannedChar)
      giveItems(
        {
          ids: itemsToGive.map((item) => item.id),
          ownerId: scannedChar.id,
          previousOwnerId: char.id,
        },
        {
          onSuccess() {
            void refetchItems();
            setScannedChar(undefined);
            onTradeClose();
          },
        },
      );
    if (!!scannedContainer)
      storeItems(
        {
          itemIds: itemsToGive.map((item) => item.id),
          containerId: scannedContainer.id,
        },
        {
          onSuccess() {
            void refetchItems();
            setScannedContainer(undefined);
            onTradeClose();
          },
        },
      );
  };

  const handleDrop = () => {
    if (!location) return;
    const itemsToDrop = items.filter((item) => inHand.includes(item.id));
    if (!itemsToDrop.length) return;
    dropItems(
      {
        ids: itemsToDrop.map((item) => item.id),
        coordX: location.longitude,
        coordY: location.latitude,
      },
      {
        onSuccess() {
          void refetchItems();
          onDropClose();
        },
      },
    );
  };

  const handleBleed = () => {
    bleed(
      { charId: char.id },
      {
        onSuccess(e) {
          if (e?.message) alert(e.message);
          void refetchItems();
          void refetchChar();
          onBleedClose();
        },
      },
    );
  };

  const handleScanSuccess = (decodedText: string) => {
    if (!chars) {
      alert("Отсутствует список персонажей");
      return;
    }
    if (!decodedText) {
      alert("QR-код пуст");
      return;
    }
    const charId = decodedText.split("-")[0];
    const timecode = decodedText.split("-")[1];
    const containerId = decodedText.split("/")[4];
    if (!charId && !containerId) {
      alert("Отсутствует ID персонажа или контейнера");
      return;
    }
    if (!!containerId) {
      const container = containers?.find((c) => c.id === containerId);
      if (!container) {
        alert("Контейнер не найден");
        return;
      }
      setScannedContainer(container);
    } else if (!!charId) {
      if (!timecode) {
        alert("Отсутствует таймкод");
        return;
      }
      const diffMs = Date.now() - Number(timecode);
      if (diffMs > 1000 * 60 * 60) {
        alert("QR-код устарел");
        return;
      }
      const scanned = chars.find((c) => c.id === Number(charId));
      if (!scanned) {
        alert("Персонаж не найден");
        return;
      }
      setScannedChar(scanned);
    }
  };

  const refetch = () => {
    void refetchItems();
    void refetchChar();
  };

  if (
    charsLoading ||
    isLoading ||
    itemsLoading ||
    isGiveItemPending ||
    isDropItemPending ||
    isCreateItemPending ||
    isStoreItemPending ||
    containersLoading
  )
    return <LoadingPage />;

  return (
    <div className="flex flex-col gap-4 pb-4">
      <Modal
        isOpen={isTradeOpen}
        onClose={onTradeClose}
        placement="top-center"
        backdrop="blur"
        classNames={{
          body: "py-6 z-[1001]",
          wrapper: "z-[1001]",
          backdrop: "z-[1000]",
          base: "bg-red-200 dark:bg-red-950 bg-opacity-95 text-black dark:text-neutral-100",
          closeButton: "hover:bg-white/5 active:bg-white/10 w-12 h-12 p-4",
        }}
      >
        <ModalContent>
          <ModalHeader>Передача предметов</ModalHeader>
          <ModalBody>
            <QRScanner
              onScanSuccess={handleScanSuccess}
              onScanError={(e) => console.error(e)}
            />
            <p>
              {scannedChar
                ? `Вы отправите персонажу ${scannedChar.name} следующие предметы:`
                : scannedContainer
                  ? `Вы положите в контейнер ${scannedContainer?.name} следующие предметы:`
                  : ""}
            </p>
            <ul className="list-inside list-disc">
              {items
                .filter((item) => inHand.includes(item.id))
                .map((item) => (
                  <li key={item.id}>{item.name}</li>
                ))}
            </ul>
          </ModalBody>
          <ModalFooter className="flex flex-row justify-between gap-2">
            <Button color="danger" onClick={onTradeClose}>
              Отменить
            </Button>
            <Button
              color="success"
              onClick={handleTrade}
              isDisabled={!scannedChar && !scannedContainer}
            >
              Отправить
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Modal
        isOpen={isDropOpen}
        onClose={onDropClose}
        placement="top-center"
        backdrop="blur"
        classNames={{
          body: "py-6 z-[1001]",
          wrapper: "z-[1001]",
          backdrop: "z-[1000]",
          base: "bg-red-200 dark:bg-red-950 bg-opacity-95 text-black dark:text-neutral-100",
          closeButton: "hover:bg-white/5 active:bg-white/10 w-12 h-12 p-4",
        }}
      >
        <ModalContent>
          <ModalHeader>Сброс предметов</ModalHeader>
          <ModalBody>
            <p>Вы сбросите следующие предметы:</p>
            <ul className="list-inside list-disc">
              {items
                .filter((item) => inHand.includes(item.id))
                .map((item) => (
                  <li key={item.id}>{item.name}</li>
                ))}
            </ul>
            <p>
              по координатам:{" "}
              {location
                ? `(${degreesToCoordinate(location.latitude)}, ${degreesToCoordinate(location.longitude)})`
                : error}
            </p>
          </ModalBody>
          <ModalFooter className="flex flex-row justify-between gap-2">
            <Button color="danger" onClick={onDropClose}>
              Отменить
            </Button>
            <Button color="success" onClick={handleDrop} isDisabled={!location}>
              Сбросить
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Modal
        isOpen={isBleedOpen}
        onClose={onDropClose}
        placement="top-center"
        backdrop="blur"
        classNames={{
          body: "py-6 z-[1001]",
          wrapper: "z-[1001]",
          backdrop: "z-[1000]",
          base: "bg-red-200 dark:bg-red-950 bg-opacity-95 text-black dark:text-neutral-100",
          closeButton: "hover:bg-white/5 active:bg-white/10 w-12 h-12 p-4",
        }}
      >
        <ModalContent>
          <ModalHeader>Кровотечение</ModalHeader>
          <ModalBody>
            Хотите ли вы слить с себя витэ? Вы потеряете 1 пункт крови и
            нанесёте себе 1 очко урона. После этого в вашем инвентаре появится 1
            порция витэ вашего персонажа.
          </ModalBody>
          <ModalFooter className="flex flex-row justify-between gap-2">
            <Button color="danger" onClick={onBleedClose}>
              Отменить
            </Button>
            <Button color="success" onClick={handleBleed}>
              Слить
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((item) => (
          <div
            key={item.id}
            className={`flex w-full flex-col rounded border p-2 transition hover:shadow-md hover:brightness-[1.2]`}
          >
            <Checkbox
              className="w-full"
              isSelected={inHand.includes(item.id)}
              onValueChange={() => {
                if (inHand.includes(item.id)) {
                  setInHand(inHand.filter((i) => i !== item.id));
                } else {
                  setInHand([...inHand, item.id]);
                }
              }}
            >
              {inHand.includes(item.id) ? "В руке" : "Взять в руку"}
            </Checkbox>
            <Content
              item={item.data}
              refetch={refetch}
              currentChar={char.id}
              location={location}
            />
          </div>
        ))}
        <div className="flex flex-row justify-between gap-2">
          <Button
            variant="faded"
            color="primary"
            className="w-full sm:w-auto"
            onClick={onDropOpen}
            isDisabled={!inHand.length}
          >
            Сбросить
          </Button>
          <Button
            variant="faded"
            color="danger"
            className="w-full sm:w-auto"
            onClick={onBleedOpen}
            isDisabled={(char.bloodAmount ?? 0) < 2}
          >
            Слить
          </Button>
          <Button
            variant="faded"
            color="warning"
            className="w-full sm:w-auto"
            onClick={onTradeOpen}
            isDisabled={!inHand.length}
          >
            Передать
          </Button>
        </div>
      </div>
    </div>
  );
}

const Content = ({
  item,
  refetch,
  currentChar,
  location,
}: {
  item: Item;
  refetch: () => void;
  currentChar: number;
  location: Location | null;
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [companyId, setCompanyId] = useState<string>("");
  const { mutate: applyItem, isPending } = api.item.applyItem.useMutation();
  const handleUseItem = () => {
    if (item.usage === 0) return;
    if (!item.id) return;
    applyItem(
      {
        id: item.id,
        charId: currentChar,
        coordX: location?.longitude ?? 0,
        coordY: location?.latitude ?? 0,
        companyId,
      },
      {
        onSuccess: (e) => {
          if (e?.message) alert(e.message);
          void refetch();
          onClose();
        },
      },
    );
  };
  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        className="relative"
        size="sm"
        placement="top-center"
        backdrop="blur"
        classNames={{
          body: "py-6 z-[1001]",
          wrapper: "z-[1001]",
          backdrop: "z-[1000]",
          base: "bg-red-200 dark:bg-red-950 bg-opacity-95 text-black dark:text-neutral-100",
          closeButton: "hover:bg-white/5 active:bg-white/10 w-12 h-12 p-4",
        }}
      >
        <ModalContent>
          <ModalHeader>Использование предмета</ModalHeader>
          <ModalBody>
            <div className="flex w-full flex-row gap-2">
              <Image
                src={item.image ?? ""}
                alt=""
                width="128"
                height="128"
                objectFit="contain"
              />
              <div className="flex w-full flex-col">
                <p className="text-sm">{item.name}</p>
                <p
                  className="text-xs"
                  dangerouslySetInnerHTML={{ __html: item.content ?? "" }}
                />
              </div>
            </div>
            {!!item.type?.companyLevels && (
              <Input
                placeholder="Введите ID предприятия"
                label="ID предприятия"
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value)}
              />
            )}
          </ModalBody>
          <ModalFooter className="flex flex-row justify-between gap-2">
            <Button color="danger" onClick={onClose}>
              Отменить
            </Button>
            <Button
              color="success"
              onClick={handleUseItem}
              isDisabled={
                (!!item.type?.companyLevels && !companyId) || isPending
              }
            >
              Использовать
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <div className="flex h-full w-full flex-row gap-2">
        <Image
          src={item.image ?? ""}
          alt=""
          width="128"
          height="128"
          className="aspect-square touch-none object-contain"
        />
        <div className="flex h-full w-full flex-col gap-1">
          <p className="text-sm">{item.name}</p>
          <p
            className="text-xs"
            dangerouslySetInnerHTML={{ __html: item.content ?? "" }}
          />
          <div className="mt-auto flex w-full flex-col">
            {item.usage > 0 && (
              <p className="text-xs">Использований:&nbsp;{item.usage}</p>
            )}
            {!!item.usage && (
              <Button
                variant="light"
                color="warning"
                size="sm"
                onClick={onOpen}
              >
                Использовать
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
