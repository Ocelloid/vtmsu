import { api } from "~/utils/api";
import Head from "next/head";
import { LoadingPage } from "~/components/Loading";
import type { Container } from "~/server/api/routers/item";
import CharacterCard from "~/components/CharacterCard";
import { useEffect, useState } from "react";
import { Button, Autocomplete, AutocompleteItem } from "@nextui-org/react";
import { calculateDistance } from "~/utils/text";
import { useRouter } from "next/router";

export default function Heart() {
  const latitude = 57.99733;
  const longitude = 56.2001;
  const router = useRouter();
  const [heartMode, setHeartMode] = useState<string>("");
  const [characterId, setCharacterId] = useState<number>(0);
  const [ashesContainer, setAshesContainer] = useState<Container>();
  const [focusContainer, setFocusContainer] = useState<Container>();
  const { data: heartData, isLoading } = api.util.getHeart.useQuery(undefined, {
    refetchInterval: 5000,
  });
  const { data: characters, isLoading: isCharactersLoading } =
    api.char.getAll.useQuery();
  const { mutate: mutateHeart } = api.util.setHeart.useMutation();

  useEffect(() => {
    if (router.query.pid) setHeartMode(router.query.pid.toString());
  }, [router.query.pid]);

  useEffect(() => {
    if (!!heartData) {
      if (!!heartData.ashesContainer)
        setAshesContainer(heartData.ashesContainer);
      if (!!heartData.focusContainer)
        setFocusContainer(heartData.focusContainer);
    }
  }, [heartData]);

  const handleMutateHeart = () => {
    if (!!window && !!window.navigator && !!window.navigator.geolocation)
      window.navigator.geolocation.getCurrentPosition((pos) => {
        const distance = calculateDistance(
          pos.coords.latitude,
          pos.coords.longitude,
          latitude,
          longitude,
        );
        if (distance > 50) {
          alert(
            "Вы находитесь слишком далеко от сердца города, чтобы взаимодействовать с ним",
          );
          return;
        }
        mutateHeart(
          {
            mode: heartMode,
            focusId: focusContainer?.Item?.[0]?.id ?? 0,
            ashesId: ashesContainer?.Item?.[0]?.id ?? 0,
            characterId,
          },
          {
            onSuccess(e) {
              if (e?.message) alert(e.message);
            },
          },
        );
      });
    else alert("Геолокация не активна в вашем браузере");
  };

  if (isLoading || isCharactersLoading) return <LoadingPage />;

  return (
    <>
      <Head>
        <title>᚛ᚌ ᚑ ᚂ ᚑ ᚄ   ᚌ ᚑ ᚏ ᚑ ᚇ ᚐ ᚜</title>
        <meta name="description" content="Маскарад Вампиров" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="mx-auto flex h-full w-full max-w-3xl flex-col items-center justify-center">
        <div className="container flex h-full flex-col gap-8 pt-24">
          {!!characters && (
            <Autocomplete
              size="md"
              variant="bordered"
              placeholder="Выберите персонажа"
              aria-label="characters"
              className="w-full rounded-sm"
              selectedKey={characterId ? characterId.toString() : undefined}
              onSelectionChange={(e) => {
                setCharacterId(Number(e));
              }}
            >
              {characters.map((c) => (
                <AutocompleteItem
                  key={c.id.toString()}
                  value={c.id.toString()}
                  textValue={c.name}
                >
                  <CharacterCard character={c} isSelect={true} />
                </AutocompleteItem>
              ))}
            </Autocomplete>
          )}
          <h1 className="flex flex-col items-center text-5xl font-extrabold tracking-tight sm:text-[5rem]">
            <span className="text-red-600">᚛ᚌ ᚑ ᚂ ᚑ ᚄ ᚜</span>
            ᚛ᚌ ᚑ ᚏ ᚑ ᚇ ᚐ ᚜
          </h1>
          <div className="flex w-full flex-col gap-2">
            {ashesContainer && (
              <div className="flex w-full flex-col gap-2">
                <p className="text-center font-semibold">
                  Прах:{" "}
                  {!!ashesContainer.Item?.length
                    ? `Прах: ${ashesContainer.Item[0]?.name}`
                    : "Отсутствует прах"}
                </p>
              </div>
            )}
            {focusContainer && (
              <div className="flex w-full flex-col gap-2">
                <p className="text-center font-semibold">
                  Фокус:{" "}
                  {!!focusContainer.Item?.length
                    ? `Фокус: ${focusContainer.Item[0]?.name}`
                    : "Отсутствует фокус"}
                </p>
              </div>
            )}
            <Button
              variant="solid"
              color="danger"
              className="mx-auto flex h-32 w-32 items-center justify-center text-[128px] font-bold"
              onClick={handleMutateHeart}
              isDisabled={!characterId || !heartMode}
            >
              {heartMode === "ascend"
                ? "🜂"
                : heartMode === "descend"
                  ? "🜁"
                  : heartMode === "bless"
                    ? "🜄"
                    : "🜃"}
            </Button>
          </div>
        </div>
      </main>
    </>
  );
}
