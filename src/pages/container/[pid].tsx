import Head from "next/head";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import type { Container } from "~/server/api/routers/item";
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
import { Button, Select, SelectItem } from "@nextui-org/react";
import { api } from "~/utils/api";
import { LoadingPage } from "~/components/Loading";
import Image from "next/image";
import { type Item } from "~/server/api/routers/item";
import CharacterCard from "~/components/CharacterCard";

export default function Container() {
  const router = useRouter();
  const { data: sessionData, status: sessionStatus } = useSession();
  const [containerId, setContainerId] = useState("");
  const [container, setContainer] = useState<Container>();
  const [selectedCharacter, setSelectedCharacter] = useState<number>();

  useEffect(() => {
    if (router.query.pid) setContainerId(router.query.pid.toString());
  }, [router.query.pid]);

  const {
    data: containerData,
    isLoading: isContainerLoading,
    refetch: refetchContainer,
  } = api.item.getContainerById.useQuery(
    { id: containerId },
    { enabled: !!sessionData && !!containerId },
  );
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

  useEffect(() => {
    if (containerData) setContainer(containerData);
  }, [containerData]);

  useEffect(() => {
    if (!!defaultCharacter) setSelectedCharacter(defaultCharacter);
    else if (!!myCharacterData) {
      if (myCharacterData?.length === 1)
        setSelectedCharacter(myCharacterData[0]!.id);
    }
  }, [defaultCharacter, myCharacterData]);

  if (
    sessionStatus === "loading" ||
    isContainerLoading ||
    isMyCharactersLoading ||
    isDefaultCharacterLoading
  )
    return <LoadingPage />;
  if (!sessionData)
    return (
      <div className="flex h-[100vh] w-[100vw] items-center justify-center">
        Войдите, чтобы увидеть эту страницу
      </div>
    );

  return (
    <>
      <Head>
        <title>{container?.name}</title>
        <meta name="description" content="Маскарад Вампиров" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className=" flex min-h-[calc(100vh-1.5rem)] flex-col pt-24">
        <div className="container flex flex-col gap-2 px-4">
          {!!myCharacterData && (
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
          )}
          {container?.content}
          {!!container && !!selectedCharacter && (
            <Inventory
              container={container}
              characterId={selectedCharacter}
              refetchContainer={refetchContainer}
            />
          )}
        </div>
      </main>
    </>
  );
}

function Inventory({
  container,
  characterId,
  refetchContainer,
}: {
  container: Container;
  characterId: number;
  refetchContainer: () => void;
}) {
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
        delay: 150,
        tolerance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const { mutate: takeItemsFromContainer, isPending: isTakeItemsPending } =
    api.item.takeItemsFromContainer.useMutation();

  const handleTakeItemsFromContainer = () => {
    takeItemsFromContainer(
      {
        containerId: container.id,
        itemOwnerId: characterId,
        itemIds: items.filter((item) => item.box === -1).map((item) => item.id),
      },
      {
        onSuccess() {
          void refetchContainer();
        },
      },
    );
  };

  useEffect(() => {
    if (!!container.Item)
      setItems(
        container.Item.map((item) => ({
          id: item.id!,
          name: item.name,
          description: item.content ?? "",
          box: 0,
          data: item,
        })),
      );
  }, [container.Item]);

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

  return (
    <div className="flex flex-col gap-4 pb-4">
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
      <div className="flex flex-col">
        <Button
          variant="ghost"
          color="warning"
          onClick={handleTakeItemsFromContainer}
          isDisabled={
            !items.filter((i) => i.box === -1).length || isTakeItemsPending
          }
        >
          Забрать
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
        className="relative flex w-full cursor-move flex-col rounded border border-primary p-2 opacity-50"
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
      className={`relative flex w-full cursor-move flex-col rounded border p-2 transition hover:shadow-md hover:brightness-[1.2]`}
    >
      <Content item={item.data} />
    </div>
  );
};

const Content = ({ item }: { item: Item }) => {
  return (
    <div className="flex h-full w-full flex-row gap-2">
      <Image
        src={item.image ?? ""}
        alt=""
        width="128"
        height="128"
        objectFit="contain"
      />
      <div className="flex h-full w-full flex-col gap-1">
        <p className="text-sm">{item.name}</p>
        <p
          className="text-xs"
          dangerouslySetInnerHTML={{ __html: item.content ?? "" }}
        />
      </div>
    </div>
  );
};
