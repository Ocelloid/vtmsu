import Head from "next/head";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import type { Container } from "~/server/api/routers/item";
import { useEffect, useState } from "react";
import { Button, Select, SelectItem, Checkbox } from "@nextui-org/react";
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
      <div className="flex h-[100svh] w-[100vw] items-center justify-center">
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
      <main className=" flex min-h-[calc(100svh-1.5rem)] flex-col pt-24">
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
  const [inHand, setInHand] = useState<number[]>([]);

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

  return (
    <div className="flex flex-col gap-4 pb-4">
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
          <Content item={item.data} />
        </div>
      ))}
      <div className="flex flex-col">
        <Button
          variant="ghost"
          color="warning"
          onClick={handleTakeItemsFromContainer}
          isDisabled={!inHand.length || isTakeItemsPending}
        >
          Забрать
        </Button>
      </div>
    </div>
  );
}

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
