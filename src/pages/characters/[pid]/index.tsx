import { useRouter } from "next/router";
import { useState, useEffect, type ReactNode } from "react";
import { useSession } from "next-auth/react";
import { LoadingPage } from "~/components/Loading";
import type { Character } from "~/server/api/routers/char";
import default_char from "~/../public/default_char.png";
import {
  Textarea,
  Modal,
  ModalContent,
  ModalBody,
  Button,
  useDisclosure,
  Divider,
  Autocomplete,
  AutocompleteItem,
  Checkbox,
} from "@nextui-org/react";
import {
  FaPencilAlt,
  FaEye,
  FaEyeSlash,
  FaTrashAlt,
  FaCopy,
} from "react-icons/fa";
import { VscUnverified, VscVerified, VscWarning } from "react-icons/vsc";
import { disciplines } from "~/assets";
import { api } from "~/utils/api";
import Image from "next/image";
import Head from "next/head";
import type { BankAccount } from "~/server/api/routers/econ";

const Display = ({
  label,
  children,
  dangerouslySetInnerHTML,
}: {
  label?: string;
  children?: ReactNode;
  dangerouslySetInnerHTML?: string;
}) => {
  return (
    <div className="flex flex-col gap-0">
      {!!label && <p className="text-sm text-default-500">{label}</p>}
      {dangerouslySetInnerHTML ? (
        <div
          className="tiptap-display"
          dangerouslySetInnerHTML={{
            __html: dangerouslySetInnerHTML,
          }}
        />
      ) : (
        <div className="text-wrap break-all">{children}</div>
      )}
    </div>
  );
};

type CompanyList = {
  id: string;
  name: string;
  image: string;
  content: string;
  BankAccount: BankAccount[];
}[];

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
  const [selectedPlayer, setSelectedPlayer] = useState<string>();
  const [isFixed, setIsFixed] = useState<boolean>();
  const [companies, setCompanies] = useState<CompanyList>([]);

  const { data: isAdmin } = api.user.userIsAdmin.useQuery();

  const { data: appData } = api.util.getAppData.useQuery();

  const { data: playersData, isLoading: isPlayersLoading } =
    api.user.getUserList.useQuery(undefined, { enabled: isAdmin });

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

  const { mutate: deleteMutation, isPending: isDeletePending } =
    api.char.delete.useMutation();

  const { mutate: playerMutation, isPending: isPlayerPending } =
    api.char.switchPlayer.useMutation();

  const { mutate: fixMutation, isPending: isFixPending } =
    api.char.fix.useMutation();

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
      } else {
        setPublicChar(publicData);
        setSelectedPlayer(publicData.playerId);
        setCompanies(publicData.Company.filter((c) => !c.isWarrens) ?? []);
      }
    }
  }, [isAdmin, publicData, sessionData, router, setPublicChar]);

  useEffect(() => {
    if (!!privateData) {
      setPrivateChar(privateData);
      setComment(privateData.comment ?? "");
      setReceivedComment(privateData.p_comment ?? "");
      setIsFixed(privateData.isFixed);
    }
  }, [privateData, setPrivateChar]);

  useEffect(() => {
    if (!!publicData && !!sessionData) {
      setPrivateVer(publicData.playerId === sessionData.user.id || isAdmin);
    }
  }, [publicData, sessionData, isAdmin, setPrivateVer]);

  const handleFix = () => {
    const fix = confirm(
      `${isFixed ? "Разрешить" : "Запретить"} редактирование персонажа?`,
    );
    if (!fix) return;
    void fixMutation(
      { id: Number(characterId), isFixed: !isFixed },
      {
        onSuccess: () => {
          if (!!onChange) onChange();
          void privateRefetch();
          void publicRefetch();
          setIsFixed(!isFixed);
        },
      },
    );
  };

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

  const handleDeleteCharacter = () => {
    const confirmDelete = confirm(
      "Вы уверены, что хотите удалить персонажа? Это действие необратимо!",
    );
    if (!confirmDelete) return;
    void deleteMutation(
      { id: Number(characterId) },
      {
        onSuccess: () => {
          void router.push(
            {
              pathname: `/characters/`,
            },
            undefined,
            { shallow: false },
          );
        },
      },
    );
  };

  const handlePlayerChange = (id: string) => {
    setSelectedPlayer(id);
    playerMutation({ id: characterId!, playerId: id });
  };

  if (
    !publicChar ||
    isDenyPending ||
    isAllowPending ||
    isPublicLoading ||
    isPrivateLoading ||
    isDeletePending ||
    isPlayerPending ||
    isPlayersLoading ||
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
      <Modal
        size={"full"}
        isOpen={isOpen}
        onClose={onClose}
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
          <ModalBody className="mt-24">
            <Image
              src={!!publicChar.image ? publicChar.image : default_char}
              className="max-h-[90vh] object-contain"
              alt="char_img"
              height={2048}
              width={2048}
              onClick={onClose}
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
          {!!isAdmin && !!playersData && (
            <div className="flex flex-1 flex-col gap-2">
              <Checkbox
                isSelected={isFixed}
                onValueChange={handleFix}
                isDisabled={isFixPending}
                className="w-full"
              >
                {isFixed ? "Запрещено" : "Разрешено"} редактирование персонажа
              </Checkbox>
              <Autocomplete
                label="Игрок"
                variant="underlined"
                placeholder="Выберите игрока"
                className="w-full"
                selectedKey={selectedPlayer}
                onSelectionChange={(e) => {
                  if (!!e) handlePlayerChange(e.toString());
                }}
              >
                {playersData.map((p) => (
                  <AutocompleteItem
                    key={p.id}
                    value={p.id}
                    textValue={p.name ?? ""}
                  >
                    <div className="flex flex-col gap-1">
                      <div className="text-small dark:text-red-100">
                        {p.name}
                      </div>
                      <div className="flex flex-row gap-1">
                        <Image
                          alt="icon"
                          className="mr-2 max-h-12 min-w-12 max-w-12 object-contain"
                          src={!!p.image ? p.image : default_char}
                          height={128}
                          width={128}
                        />
                        <span className="whitespace-normal text-tiny dark:text-red-100">
                          {p.email}
                        </span>
                      </div>
                    </div>
                  </AutocompleteItem>
                ))}
              </Autocomplete>
            </div>
          )}
          {!!isAdmin && receivedComment && (
            <Display
              label="Последнее изменение"
              dangerouslySetInnerHTML={receivedComment}
            />
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
                  className={`flex flex-row items-center justify-center gap-2 ${publicChar.verified ? "text-success" : publicChar.pending ? "text-primary" : "text-danger"}`}
                >
                  {publicChar.verified ? (
                    <VscVerified size={32} className="text-success" />
                  ) : publicChar.pending ? (
                    <VscUnverified size={32} className="text-primary" />
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
                {!!(!!isAdmin || !!appData?.editAllowed) && (
                  <Button
                    variant="light"
                    color="warning"
                    className="text-md text-black dark:text-warning"
                    isDisabled={isFixed && !isAdmin}
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
                )}
              </div>
            </div>
          )}
          <div className="flex flex-1 flex-col gap-2">
            {!isAdmin && !!privateChar?.comment && (
              <Display label="Комментарий МГ">
                {privateChar.comment ?? ""}
              </Display>
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
              <div className="flex w-full flex-1 flex-grow flex-col gap-2 [&>*]:flex [&>*]:w-full">
                <Display label="Имя персонажа">{publicChar.name}</Display>
                {publicChar.status && (
                  <Display label="Статус">{publicChar.status}</Display>
                )}
                {publicChar.title && (
                  <Display label="Титул">{publicChar.title}</Display>
                )}
                <Display label="Фракция">{publicChar.faction?.name}</Display>
                <Display label="Клан">{publicChar.clan?.name}</Display>
                <Display label="Имя игрока">{publicChar.playerName}</Display>
                <Display label="Предпочитаемый способ связи">
                  {publicChar.playerContact}
                </Display>
              </div>
            </div>
            <Display dangerouslySetInnerHTML={publicChar.publicInfo!} />
            {!!companies.length && (
              <>
                <Divider className="mb-2 mt-3 bg-red-950 dark:bg-danger" />
                <span className="text-2xl text-default-600">Предприятия</span>
              </>
            )}
            {companies.map((c) => (
              <div className="flex flex-col" key={c.id + "_company"}>
                <div className="flex flex-row items-center gap-2 text-xl">
                  {c.name}
                </div>
                <div
                  className="whitespace-break-spaces pt-2 text-justify text-xs"
                  dangerouslySetInnerHTML={{ __html: c.content }}
                />
                <div className="text-muted text-sm">
                  <div className="flex flex-col gap-2">
                    {c.BankAccount?.map((bankAccount) => (
                      <div key={bankAccount.id} className="flex flex-col gap-0">
                        <Button
                          size="sm"
                          variant="light"
                          className="flex w-min flex-row items-center gap-1 text-sm text-gray-500"
                          onClick={() =>
                            navigator.clipboard.writeText(bankAccount.address)
                          }
                        >
                          Адрес счёта: {bankAccount.address}{" "}
                          <FaCopy size={12} />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
            {!!privateChar && (
              <div className="flex flex-1 flex-col gap-2">
                <Divider className="mb-2 mt-3 bg-red-950 dark:bg-danger" />
                <span className="-mt-3 text-2xl text-red-950 dark:text-danger">
                  Приватная информация
                </span>
                <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                  <Display label="Возраст">{privateChar.age ?? ""}</Display>
                  <Display label="Сир">{privateChar.sire ?? ""}</Display>
                  <Display label="Чайлды">{privateChar.childer ?? ""}</Display>
                </div>
                {privateChar.ambition && (
                  <Display label="Амбиции и желения">
                    {privateChar.ambition ?? ""}
                  </Display>
                )}
                <Display
                  label="Квента"
                  dangerouslySetInnerHTML={privateChar.content!}
                />
                <div className="flex flex-col gap-2 pt-4">
                  {!!privateChar.abilities?.length && (
                    <>
                      <Divider className="mb-2 mt-3 bg-red-950 dark:bg-danger" />
                      <span className="text-2xl text-default-600">
                        Дисциплины
                      </span>
                    </>
                  )}
                  {privateChar.abilities?.map((a) => (
                    <div
                      key={a.abilityId + "_ability"}
                      className="flex flex-col"
                    >
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
                  {!!privateChar.features?.length && (
                    <>
                      <Divider className="mb-2 mt-3 bg-red-950 dark:bg-danger" />
                      <span className="text-2xl text-default-600">
                        Дополнения
                      </span>
                    </>
                  )}
                  {privateChar.features?.map((f) => (
                    <div
                      className="flex flex-col"
                      key={f.featureId + "_feature"}
                    >
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
                  {!!privateChar.knowledges?.length && (
                    <>
                      <Divider className="mb-2 mt-3 bg-red-950 dark:bg-danger" />
                      <span className="text-2xl text-default-600">Знания</span>
                    </>
                  )}
                  {privateChar.knowledges?.map((k) => (
                    <div
                      className="flex flex-col"
                      key={k.knowledgeId + "_knowledge"}
                    >
                      <div className="flex flex-row items-center gap-2 text-xl">
                        {k.knowledge?.name}
                      </div>
                      <p className="whitespace-break-spaces pt-2 text-justify text-xs">
                        {k.knowledge?.content}
                      </p>
                    </div>
                  ))}
                  {!!privateChar.rituals?.length && (
                    <>
                      <Divider className="mb-2 mt-3 bg-red-950 dark:bg-danger" />
                      <span className="text-2xl text-default-600">Ритуалы</span>
                    </>
                  )}
                  {privateChar.rituals?.map((r) => (
                    <div className="flex flex-col" key={r.ritualId + "_ritual"}>
                      <div className="flex flex-row items-center gap-2 text-xl">
                        {r.ritual?.name}
                      </div>
                      <p className="whitespace-break-spaces pt-2 text-justify text-xs">
                        {r.ritual?.content}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        {(!!privateChar || isAdmin) && (
          <Button
            variant="light"
            color="danger"
            className="text-md text-danger"
            onClick={handleDeleteCharacter}
          >
            <FaTrashAlt size={24} /> Удалить персонажа
          </Button>
        )}
      </main>
    </>
  );
};

export default CharacterSheet;
