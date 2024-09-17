import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  rectSwappingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { createPortal } from "react-dom";
import { CSS } from "@dnd-kit/utilities";
import { useEffect, useState, useMemo, type ReactNode } from "react";
import {
  Modal,
  ModalContent,
  ModalBody,
  Button,
  useDisclosure,
  Select,
  SelectItem,
  ModalHeader,
  ModalFooter,
} from "@nextui-org/react";
import { api } from "~/utils/api";
import { type Character } from "~/server/api/routers/char";
import { LoadingPage } from "~/components/Loading";
import { useGeolocation } from "~/utils/hooks";
import Image from "next/image";
import { type Item } from "~/server/api/routers/item";

function degreesToCoordinate(degrees: number): string {
  const wholeDegrees = Math.floor(degrees);
  const decimalPart = degrees - wholeDegrees;
  const minutes = Math.floor(decimalPart * 60);
  const seconds = Math.round((decimalPart * 60 - minutes) * 60);

  return `${wholeDegrees}° ${minutes}' ${seconds}"`;
}

export default function Inventory({ currentChar }: { currentChar: number }) {
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
  const { data: chars, isLoading: charsLoading } = api.char.getAll.useQuery();
  const {
    data: itemsData,
    isLoading: itemsLoading,
    refetch: refetchItems,
  } = api.item.getByOwnerId.useQuery({ ownerId: currentChar });

  const { mutate: giveItems, isPending: isGiveItemPending } =
    api.item.giveItems.useMutation();
  const { mutate: dropItems, isPending: isDropItemPending } =
    api.item.dropItems.useMutation();

  const [char, setChar] = useState<Character>();
  const [items, setItems] = useState<
    Array<{
      id: number;
      name: string;
      description: string;
      box: number;
      data: Item;
    }>
  >([]);
  const itemsIds = useMemo(() => items.map((item) => item.id), [items]);
  const [activeItem, setActiveItem] = useState<{
    id: number;
    name: string;
    description: string;
    box: number;
    data: Item;
  } | null>(null);
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 300,
        tolerance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  useEffect(() => {
    if (!!itemsData)
      setItems(
        itemsData.map((item) => ({
          id: item.id,
          name: item.name,
          description: item.content ?? "",
          box: 0,
          data: item,
        })),
      );
  }, [itemsData]);

  const handleDragStart = (e: DragStartEvent) => {
    if (e.active.data.current?.type === "item") {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      setActiveItem(e.active.data.current.item);
      return;
    }
  };

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over) return;
    if (active.id === over.id) return;
    setItems((items) => {
      const activeItemIndex = items.findIndex((item) => item.id === active.id);
      const overItemIndex = items.findIndex((item) => item.id === over.id);
      return arrayMove(items, activeItemIndex, overItemIndex);
    });
    setActiveItem(null);
  };

  const handleDragOver = (e: DragOverEvent) => {
    const { active, over } = e;
    if (!over) return;
    if (active.id === over.id) return;
    const isActiveCard = active.data.current?.type === "item";
    const isOverItem = over.data.current?.type === "item";
    const isOverBox = over.data.current?.type === "box";
    if (!isActiveCard) return;

    if (isActiveCard && isOverItem) {
      setItems((items) => {
        const activeItemIndex = items.findIndex(
          (item) => item.id === active.id,
        );
        const overItemIndex = items.findIndex((item) => item.id === over.id);
        items[activeItemIndex]!.box = items[overItemIndex]!.box;
        return arrayMove(items, activeItemIndex, overItemIndex);
      });
    }

    if (isActiveCard && isOverBox) {
      setItems((items) => {
        const activeItemIndex = items.findIndex(
          (item) => item.id === active.id,
        );
        items[activeItemIndex]!.box = Number(over.id);
        return arrayMove(items, activeItemIndex, activeItemIndex);
      });
    }
  };

  const handleTrade = () => {
    if (!char) return;
    const itemsToGive = items.filter((item) => item.box === -1);
    if (!itemsToGive.length) return;
    giveItems(
      {
        ids: itemsToGive.map((item) => item.id),
        ownerId: char.id,
      },
      {
        onSuccess() {
          void refetchItems();
          onTradeClose();
        },
      },
    );
  };

  const handleDrop = () => {
    if (!location) return;
    const itemsToDrop = items.filter((item) => item.box === 0);
    if (!itemsToDrop.length) return;
    dropItems(
      {
        ids: itemsToDrop.map((item) => item.id),
        coordX: location.latitude,
        coordY: location.longitude,
      },
      {
        onSuccess() {
          void refetchItems();
          onDropClose();
        },
      },
    );
  };

  if (
    charsLoading ||
    isLoading ||
    itemsLoading ||
    isGiveItemPending ||
    isDropItemPending
  )
    return <LoadingPage />;

  return (
    <div className="flex h-full flex-col gap-4 pb-4">
      <Modal isOpen={isTradeOpen} onClose={onTradeClose}>
        <ModalContent>
          <ModalHeader>Передача предметов</ModalHeader>
          <ModalBody>
            <Select
              label="Выберите персонажа"
              value={char?.id.toString()}
              onChange={(e) =>
                setChar(chars?.find((c) => c.id === Number(e.target.value)))
              }
            >
              {!!chars?.length
                ? chars.map((c) => (
                    <SelectItem key={c.id} value={c.id.toString()}>
                      {c.name}
                    </SelectItem>
                  ))
                : []}
            </Select>
            <p>Вы отправите персонажу {char?.name} следующие предметы:</p>
            <ul className="list-inside list-disc">
              {items
                .filter((item) => item.box === -1)
                .map((item) => (
                  <li key={item.id}>{item.name}</li>
                ))}
            </ul>
          </ModalBody>
          <ModalFooter className="flex flex-row justify-between gap-2">
            <Button color="danger" onClick={onTradeClose}>
              Отменить
            </Button>
            <Button color="success" onClick={handleTrade} isDisabled={!char}>
              Отправить
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Modal isOpen={isDropOpen} onClose={onDropClose}>
        <ModalContent>
          <ModalHeader>Сброс предметов</ModalHeader>
          <ModalBody>
            <p>Вы сбросите следующие предметы:</p>
            <ul className="list-inside list-disc">
              {items
                .filter((item) => item.box === -1)
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
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
      >
        <SortableContext items={itemsIds} strategy={rectSwappingStrategy}>
          <ItemBox id={0}>
            {items
              .filter((item) => item.box === 0)
              .map((item) => (
                <Item key={item.id} item={item} />
              ))}
          </ItemBox>
          <ItemBox id={-1}>
            {items
              .filter((item) => item.box === -1)
              .map((item) => (
                <Item key={item.id} item={item} />
              ))}
          </ItemBox>
        </SortableContext>
        {createPortal(
          <DragOverlay>{activeItem && <Item item={activeItem} />}</DragOverlay>,
          document.body,
        )}
      </DndContext>
      <div className="flex flex-row justify-between gap-2">
        <Button variant="ghost" color="danger" onClick={onDropOpen}>
          Сбросить
        </Button>
        <Button variant="ghost" color="warning" onClick={onTradeOpen}>
          Передать
        </Button>
      </div>
    </div>
  );
}

const ItemBox = ({ id, children }: { id: number; children: ReactNode }) => {
  const { setNodeRef, attributes, listeners } = useSortable({
    id: id,
    disabled: true,
    data: { type: "box" },
  });
  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`grid min-h-8 cursor-default grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-4 ${
        !!id ? "h-auto border-2 border-dashed border-warning p-2" : "h-auto"
      }`}
    >
      {!!id && (
        <p className="text-center text-warning md:col-span-2 xl:col-span-4">
          В руке
        </p>
      )}
      {children}
    </div>
  );
};

const Item = ({
  item,
}: {
  item: {
    id: number;
    name: string;
    description: string;
    box: number;
    data: Item;
  };
}) => {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: item.id,
    data: { type: "item", item },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className="relative flex w-full cursor-move flex-col justify-between rounded border border-primary p-2 opacity-50"
      >
        <Content item={item.data} />
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`relative flex w-full cursor-move flex-col justify-between rounded border p-2 transition hover:shadow-md hover:brightness-110`}
    >
      <Content item={item.data} />
    </div>
  );
};

const Content = ({ item }: { item: Item }) => {
  return (
    <div className="flex flex-row gap-2">
      <Image
        src={item.image ?? ""}
        alt=""
        width="128"
        height="128"
        objectFit="contain"
      />
      <div className="flex flex-col gap-1">
        <p className="text-sm">{item.name}</p>
        <p
          className="text-xs"
          dangerouslySetInnerHTML={{ __html: item.content ?? "" }}
        />
      </div>
    </div>
  );
};
