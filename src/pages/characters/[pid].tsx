import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { LoadingPage } from "~/components/Loading";
import type { Character } from "~/server/api/routers/char";
import default_char from "~/../public/default_char.png";
import { Input, Tooltip, Textarea, Button, Divider } from "@nextui-org/react";
import { FaPencilAlt, FaEye, FaEyeSlash } from "react-icons/fa";
import { VscUnverified, VscVerified } from "react-icons/vsc";
import { api } from "~/utils/api";
import Image from "next/image";
import Head from "next/head";

const CharacterSheet = ({ charId }: { charId?: number }) => {
  const router = useRouter();
  const { data: sessionData } = useSession();
  const [comment, setComment] = useState<string>("");
  const [publicChar, setPublicChar] = useState<Character>();
  const [privateChar, setPrivateChar] = useState<Character>();
  const [privateVer, setPrivateVer] = useState<boolean>();
  const [factionIsOpen, setFactionIsOpen] = useState(false);
  const [clanIsOpen, setClanIsOpen] = useState(false);
  const characterId = charId ? charId : router.query.pid;

  const { data: publicData, isLoading: isPublicLoading } =
    api.char.getPublicDataById.useQuery(
      {
        id: Number(characterId),
      },
      {
        enabled: !!characterId,
      },
    );

  const { data: privateData, isLoading: isPrivateLoading } =
    api.char.getPrivateDataById.useQuery(
      {
        id: Number(characterId),
      },
      {
        enabled: privateVer,
      },
    );

  useEffect(() => {
    if (!!publicData) setPublicChar(publicData);
  }, [publicData, setPublicChar]);

  useEffect(() => {
    if (!!privateData) setPrivateChar(privateData);
  }, [privateData, setPrivateChar]);

  useEffect(() => {
    if (!!publicData && !!sessionData) {
      setPrivateVer(publicData.createdById === sessionData.user.id);
    }
  }, [publicData, sessionData, setPrivateVer]);

  if (
    isPublicLoading ||
    isPrivateLoading ||
    !publicChar ||
    (privateVer && !privateChar)
  )
    return <LoadingPage />;

  return (
    <>
      <Head>
        <title>{publicChar.name}</title>
        <meta name="description" content="Маскарад Вампиров" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main
        className={`${!!charId ? "rounded-lg bg-red-950/50 p-2" : " pt-24"} mx-auto flex min-h-screen max-w-5xl flex-1 flex-col gap-2`}
      >
        <div className="flex flex-row gap-2">
          <Button color="danger" className="my-auto py-12">
            Отказать
          </Button>
          <Textarea
            variant="underlined"
            label="Комменатрий к персонажу"
            placeholder="Введите комментарий к персонажу"
            value={comment}
            onValueChange={setComment}
          />
          <Button color="success" className="my-auto py-12">
            Принять
          </Button>
        </div>
        <div className="container flex flex-1 flex-col gap-2">
          <div className="grid grid-cols-1 flex-row gap-2 sm:grid-cols-2">
            <Image
              src={!!publicChar.image ? publicChar.image : default_char}
              alt="char_img"
              className="flex max-h-[21rem] min-w-0 flex-shrink object-contain"
              height={1024}
            />
            <div className="flex w-full flex-1 flex-grow flex-col [&>*]:flex [&>*]:w-full">
              <Input
                size="sm"
                label="Имя персонажа"
                variant="underlined"
                isReadOnly
                value={publicChar.name}
              />
              <Input
                size="sm"
                label="Статус"
                variant="underlined"
                isReadOnly
                value={publicChar.status ?? ""}
              />
              <Input
                size="sm"
                label="Титул"
                variant="underlined"
                isReadOnly
                value={publicChar.title ?? ""}
              />
              <Tooltip
                className="w-80 rounded-md text-justify text-tiny text-black dark:text-white"
                content={publicChar.faction?.content}
                placement="bottom"
                closeDelay={2000}
                isOpen={factionIsOpen}
                onOpenChange={(open) => setFactionIsOpen(open)}
              >
                <Input
                  size="sm"
                  label="Фракция"
                  variant="underlined"
                  onMouseOver={() => {
                    setClanIsOpen(false);
                    setFactionIsOpen(true);
                  }}
                  onClick={() => {
                    setClanIsOpen(false);
                    setFactionIsOpen(true);
                  }}
                  isReadOnly
                  value={publicChar.faction?.name}
                />
              </Tooltip>
              <Tooltip
                className="w-80 rounded-md text-justify text-tiny text-black dark:text-white"
                content={publicChar.clan?.content}
                placement="bottom"
                closeDelay={2000}
                isOpen={clanIsOpen}
                onOpenChange={(open) => setClanIsOpen(open)}
              >
                <Input
                  size="sm"
                  label="Клан"
                  variant="underlined"
                  onMouseOver={() => {
                    setClanIsOpen(true);
                    setFactionIsOpen(false);
                  }}
                  onClick={() => {
                    setClanIsOpen(true);
                    setFactionIsOpen(false);
                  }}
                  isReadOnly
                  value={publicChar.clan?.name}
                />
              </Tooltip>
              <Input
                size="sm"
                label="Имя игрока"
                variant="underlined"
                isReadOnly
                value={publicChar.playerName ?? ""}
              />
              <Input
                size="sm"
                label="Предпочитаемый способ связи"
                variant="underlined"
                isReadOnly
                value={publicChar.playerContact ?? ""}
              />
            </div>
          </div>
          {!!privateChar && (
            <div className="flex flex-1 flex-col gap-2">
              <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                <Input
                  size="sm"
                  label="Возраст"
                  variant="underlined"
                  isReadOnly
                  value={privateChar.age ?? ""}
                />
                <Input
                  size="sm"
                  label="Сир"
                  variant="underlined"
                  isReadOnly
                  value={privateChar.sire ?? ""}
                />
                <Input
                  size="sm"
                  label="Чайлды"
                  variant="underlined"
                  isReadOnly
                  value={privateChar.childer ?? ""}
                />
              </div>
              <Textarea
                size="sm"
                label="Амбиции и желения"
                variant="underlined"
                isReadOnly
                value={privateChar.ambition ?? ""}
              />
            </div>
          )}
          <span className="text-sm text-default-600">
            Публичная информация:
          </span>
          <div
            className="tiptap-display text-justify"
            dangerouslySetInnerHTML={{
              __html: publicChar.publicInfo!,
            }}
          />
        </div>
        {!!privateChar && (
          <div className="container flex flex-1 flex-col gap-2">
            <span className="text-sm text-default-600">Квента:</span>
            <div
              className="tiptap-display text-justify"
              dangerouslySetInnerHTML={{
                __html: privateChar.content!,
              }}
            />
            <Divider className="mt-2 bg-danger" />
            <div className="container grid grid-cols-1 justify-evenly gap-4 pb-4 sm:grid-cols-3">
              <div className="flex flex-row items-center justify-center gap-2">
                {privateChar.visible ? (
                  <FaEye size={32} />
                ) : (
                  <FaEyeSlash size={32} />
                )}
                <span>
                  {privateChar.visible
                    ? "Виден другим игрокам"
                    : "Не виден другим игрокам"}
                </span>
              </div>
              <div className="flex flex-row items-center justify-center gap-2">
                {privateChar.verified ? (
                  <VscVerified size={32} />
                ) : (
                  <VscUnverified size={32} />
                )}
                <span>
                  {privateChar.verified ? "Верифицирован" : "Не верифицирован"}
                </span>
              </div>
              <Button
                variant="light"
                color="warning"
                className="text-md text-default dark:text-warning"
              >
                <FaPencilAlt size={24} /> Редактировать
              </Button>
            </div>
          </div>
        )}
      </main>
    </>
  );
};

export default CharacterSheet;
