import { Select, SelectItem } from "@nextui-org/react";
import CharacterCard from "~/components/CharacterCard";
import { LoadingPage } from "~/components/Loading";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { api } from "~/utils/api";
import Head from "next/head";

export default function QRPage() {
  const router = useRouter();
  const [address, setAddress] = useState("");
  const { data: sessionData, status: sessionStatus } = useSession();
  const [selectedCharacter, setSelectedCharacter] = useState<number>();

  const { data: item, isLoading: isItemLoading } =
    api.item.getByAddress.useQuery(
      { address: address },
      { enabled: !!address },
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
  const { data: char, isLoading: isCharLoading } = api.char.getById.useQuery(
    {
      id: selectedCharacter!,
    },
    {
      enabled: !!selectedCharacter,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    },
  );

  useEffect(() => {
    if (router.query.pid) setAddress(router.query.pid.toString());
  }, [router.query.pid]);

  useEffect(() => {
    if (!!defaultCharacter) setSelectedCharacter(defaultCharacter);
    else if (!!myCharacterData) {
      if (myCharacterData?.length === 1)
        setSelectedCharacter(myCharacterData[0]!.id);
    }
  }, [defaultCharacter, myCharacterData]);

  if (
    sessionStatus === "loading" ||
    isItemLoading ||
    isCharLoading ||
    isMyCharactersLoading ||
    isDefaultCharacterLoading
  )
    return <LoadingPage />;

  const now = new Date();
  const hasAuspex = char?.effects
    ?.filter((e) => (e.expires?.getTime() ?? now.getTime()) - now.getTime() > 0)
    .find((e) => e.effect?.name.includes("Прорицание"));
  const hasAnimalism = char?.effects
    ?.filter((e) => (e.expires?.getTime() ?? now.getTime()) - now.getTime() > 0)
    .find((e) => e.effect?.name.includes("Анимализм"));
  const isHacker = char?.features.some((e) =>
    e.feature?.name.includes("Хакер"),
  );

  return (
    <>
      <Head>
        <title>{item?.name}</title>
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
          <div
            className="tiptap-display w-full text-justify"
            dangerouslySetInnerHTML={{
              __html: item?.content ?? "",
            }}
          />
          {hasAuspex && item?.auspexData && (
            <div className="w-full text-justify">{item?.auspexData}</div>
          )}
          {hasAnimalism && item?.animalismData && (
            <div className="w-full text-justify">{item?.animalismData}</div>
          )}
          {isHacker && item?.hackerData && (
            <div className="w-full text-justify">{item?.hackerData}</div>
          )}
        </div>
      </main>
    </>
  );
}
