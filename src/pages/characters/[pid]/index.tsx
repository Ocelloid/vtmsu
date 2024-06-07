import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { LoadingPage } from "~/components/Loading";
import type { Character } from "~/server/api/routers/char";
import default_char from "~/../public/default_char.png";
import {
  Input,
  Tooltip,
  Textarea,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Button,
  useDisclosure,
  Divider,
} from "@nextui-org/react";
import { FaPencilAlt, FaEye, FaEyeSlash } from "react-icons/fa";
import { VscUnverified, VscVerified, VscWarning } from "react-icons/vsc";
import { disciplines } from "~/assets";
import { api } from "~/utils/api";
import Image from "next/image";
import Head from "next/head";

const CharacterSheet = ({
  charId,
  onChange,
}: {
  charId?: number;
  onChange?: () => void;
}) => {
  const discKeys = Object.keys(disciplines);
  const discIcons = Object.values(disciplines).map((disc, i) => {
    return { value: disc, key: discKeys[i] };
  });
  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { data: sessionData } = useSession();
  const [comment, setComment] = useState<string>("");
  const [receivedComment, setReceivedComment] = useState<string>("");
  const [characterId, setCharacterId] = useState<number>();
  const [publicChar, setPublicChar] = useState<Character>();
  const [privateChar, setPrivateChar] = useState<Character>();
  const [privateVer, setPrivateVer] = useState<boolean>();
  const [factionIsOpen, setFactionIsOpen] = useState(false);
  const [clanIsOpen, setClanIsOpen] = useState(false);

  const { data: isAdmin } = api.user.userIsAdmin.useQuery();

  const {
    data: publicData,
    isLoading: isPublicLoading,
    refetch: publicRefetch,
  } = api.char.getPublicDataById.useQuery(
    {
      id: characterId!,
    },
    {
      enabled: !!characterId,
    },
  );

  const {
    data: privateData,
    isLoading: isPrivateLoading,
    refetch: privateRefetch,
  } = api.char.getPrivateDataById.useQuery(
    {
      id: characterId!,
    },
    {
      enabled: privateVer && !!characterId,
    },
  );

  const { mutate: allowMutation, isPending: isAllowPending } =
    api.char.allow.useMutation();

  const { mutate: denyMutation, isPending: isDenyPending } =
    api.char.deny.useMutation();

  useEffect(() => {
    if (!!router.query.pid) {
      setCharacterId(Number(router.query.pid));
    } else if (!!charId) setCharacterId(Number(charId));
  }, [router.query.pid, charId]);

  useEffect(() => {
    if (!!publicData && !!sessionData) {
      if (
        !(
          !!(publicData.visible && publicData.verified) ||
          !!isAdmin ||
          publicData.playerId === sessionData.user.id
        )
      ) {
        void router.push("/characters");
      } else setPublicChar(publicData);
    }
  }, [isAdmin, publicData, sessionData, router, setPublicChar]);

  useEffect(() => {
    if (!!privateData) {
      setPrivateChar(privateData);
      setComment(privateData.comment ?? "");
      setReceivedComment(privateData.p_comment ?? "");
    }
  }, [privateData, setPrivateChar]);

  useEffect(() => {
    if (!!publicData && !!sessionData) {
      setPrivateVer(publicData.playerId === sessionData.user.id || isAdmin);
    }
  }, [publicData, sessionData, isAdmin, setPrivateVer]);

  const handleDeny = () => {
    const deny = confirm("Вернуть персонажа на доработку?");
    if (deny)
      void denyMutation(
        { id: Number(characterId), comment: comment },
        {
          onSuccess: () => {
            if (!!onChange) onChange();
            void privateRefetch();
            void publicRefetch();
          },
        },
      );
  };

  const handleAllow = () => {
    const allow = confirm("Допустить персонажа в игру?");
    if (allow)
      void allowMutation(
        { id: Number(characterId), comment: comment },
        {
          onSuccess: () => {
            if (!!onChange) onChange();
            void privateRefetch();
            void publicRefetch();
          },
        },
      );
  };

  if (
    !publicChar ||
    isDenyPending ||
    isAllowPending ||
    isPublicLoading ||
    isPrivateLoading ||
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
      <Modal size={"full"} isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader>Фото персонажа</ModalHeader>
          <ModalBody>
            <Image
              src={!!publicChar.image ? publicChar.image : default_char}
              className="max-h-[90vh] object-contain"
              alt="char_img"
              height={2048}
              width={2048}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
      <main className={`mx-auto flex max-w-5xl flex-1 flex-col gap-2 sm:pb-2`}>
        <div
          className={`container flex flex-col gap-2 rounded-none bg-white/75 p-2 pb-4 dark:bg-red-950/50 sm:rounded-lg ${!!charId ? "" : "mt-24"}`}
        >
          {isAdmin && (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-5">
              <Button
                onClick={handleDeny}
                isDisabled={!comment}
                color="danger"
                className="my-auto py-0 text-xl sm:py-12"
              >
                Отказать
              </Button>
              <Textarea
                className="sm:col-span-3"
                variant="underlined"
                label="Комменатрий к персонажу"
                placeholder="Введите комментарий к персонажу"
                value={comment}
                onValueChange={setComment}
              />
              <Button
                onClick={handleAllow}
                color="success"
                className="my-auto py-0 text-xl sm:py-12"
              >
                Принять
              </Button>
            </div>
          )}
          {!!isAdmin && receivedComment && (
            <div>
              <p className="text-2xl">Последнее изменение:</p>
              <div
                className="tiptap-display text-justify"
                dangerouslySetInnerHTML={{
                  __html: receivedComment,
                }}
              />
            </div>
          )}
          {(!!privateChar || isAdmin) && (
            <div className="flex flex-1 flex-col gap-2">
              <div
                className={`container grid grid-cols-1 justify-evenly gap-4 rounded-lg bg-white/50 py-2 dark:bg-black/50 ${publicChar.verified ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}
              >
                {publicChar.verified && (
                  <div className="flex flex-row items-center justify-center gap-2 text-black dark:text-white">
                    {publicChar.visible ? (
                      <FaEye size={32} />
                    ) : (
                      <FaEyeSlash size={32} />
                    )}
                    <span>
                      {publicChar.visible
                        ? "Виден игрокам"
                        : "Не виден игрокам"}
                    </span>
                  </div>
                )}
                <div
                  className={`flex flex-row items-center justify-center gap-2 ${publicChar.verified ? "text-success" : publicChar.pending ? "text-secondary" : "text-danger"}`}
                >
                  {publicChar.verified ? (
                    <VscVerified size={32} className="text-success" />
                  ) : publicChar.pending ? (
                    <VscUnverified size={32} className="text-secondary" />
                  ) : (
                    <VscWarning size={32} className="text-danger" />
                  )}
                  <span>
                    {publicChar.verified
                      ? "Верифицирован"
                      : publicChar.pending
                        ? "В ожидании"
                        : "Отказан"}
                  </span>
                </div>
                <Button
                  variant="light"
                  color="warning"
                  className="text-md text-black dark:text-warning"
                  onClick={() => {
                    void router.push(
                      {
                        pathname: `/characters/${characterId?.toString()}/edit`,
                      },
                      undefined,
                      { shallow: false },
                    );
                  }}
                >
                  <FaPencilAlt size={24} /> Редактировать
                </Button>
              </div>
            </div>
          )}
          <div className="flex flex-1 flex-col gap-2">
            {!isAdmin && !!privateChar?.comment && (
              <Textarea
                size="sm"
                label="Комментарий МГ"
                variant="underlined"
                isReadOnly
                value={privateChar.comment ?? ""}
              />
            )}
            <span className="text-2xl text-default-600">
              Публичная информация
            </span>
            <div className="grid grid-cols-1 flex-row gap-2 sm:grid-cols-2">
              <Image
                onClick={onOpen}
                src={!!publicChar.image ? publicChar.image : default_char}
                alt="char_img"
                className="flex min-w-0 max-w-full flex-shrink cursor-pointer rounded-lg object-contain sm:max-h-[21rem]"
                height={1024}
                width={1024}
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
                  placement="top"
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
            <div
              className="tiptap-display text-justify"
              dangerouslySetInnerHTML={{
                __html: publicChar.publicInfo!,
              }}
            />
            {!!privateChar && (
              <div className="flex flex-1 flex-col gap-2">
                <Divider className="mb-2 mt-3 bg-red-950 dark:bg-danger" />
                <span className="-mt-3 text-2xl text-red-950 dark:text-danger">
                  Приватная информация
                </span>
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
            {!!privateChar && (
              <div className="flex flex-col">
                <span className="text-2xl text-default-600">Квента</span>
                <div
                  className="tiptap-display text-justify"
                  dangerouslySetInnerHTML={{
                    __html: privateChar.content!,
                  }}
                />
                <div className="flex flex-col gap-2 pt-4">
                  <span className="text-2xl text-default-600">Дисциплины</span>
                  {privateChar.abilities?.map((a) => (
                    <div key={a.abilityId} className="flex flex-col">
                      <div className="flex flex-row items-center gap-2 text-xl">
                        <Image
                          alt="disc"
                          className="max-h-12 max-w-12"
                          src={
                            !!a.abilitiy?.icon
                              ? discIcons.find(
                                  (di) => di.key === a.abilitiy?.icon,
                                )?.value ?? ""
                              : ""
                          }
                          height={128}
                          width={128}
                        />{" "}
                        {a.abilitiy?.name}
                      </div>
                      <p className="whitespace-break-spaces pt-2 text-justify text-xs">
                        {a.abilitiy?.content}
                      </p>
                    </div>
                  ))}
                  <span className="text-2xl text-default-600">Дополнения</span>
                  {privateChar.features?.map((f) => (
                    <div className="flex flex-col" key={f.featureId}>
                      {(f.feature?.cost ?? 0) > 0
                        ? `+${f.feature?.cost}`
                        : f.feature?.cost}
                      &nbsp;{f.feature?.name}
                      <p className="whitespace-break-spaces pt-1 text-justify text-xs">
                        {f.feature?.content}
                      </p>
                      <p className="whitespace-break-spaces pt-1 text-justify text-xs italic">
                        Комменатрий:&nbsp;{f.description ?? ""}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
};

export default CharacterSheet;
