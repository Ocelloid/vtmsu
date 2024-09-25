import { useState, useEffect } from "react";
import { api } from "~/utils/api";
import { FaCheck, FaStopwatch, FaBan } from "react-icons/fa";
import { MdSend } from "react-icons/md";
import type { Ticket } from "~/server/api/routers/util";
import type { Character } from "~/server/api/routers/char";
import {
  Button,
  Input,
  Textarea,
  Modal,
  ModalHeader,
  ModalContent,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Autocomplete,
  AutocompleteItem,
} from "@nextui-org/react";
import { LoadingSpinner, LoadingPage } from "../Loading";
import CharacterCard from "../CharacterCard";

export default function Tickets() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isBanOpen,
    onOpen: onBanOpen,
    onClose: onBanClose,
  } = useDisclosure();
  const {
    isOpen: isTimeoutOpen,
    onOpen: onTimeoutOpen,
    onClose: onTimeoutClose,
  } = useDisclosure();
  const [reason, setReason] = useState<string>("");
  const [duration, setDuration] = useState<number>(1);
  const [selectedTicket, setSelectedTicket] = useState<Ticket>();
  const [newMessage, setNewMessage] = useState<string>("");
  const [newName, setNewName] = useState<string>("");
  const [char, setChar] = useState<Character>();
  const [characters, setCharacters] = useState<Character[]>([]);

  const { data: appData } = api.util.getAppData.useQuery();
  const { data: tickets, refetch: refetchTickets } =
    api.util.getAllTickets.useQuery();
  const { data: messages, refetch: refetchMessages } =
    api.util.getMessagesByTicketId.useQuery(
      { ticketId: selectedTicket?.id ?? 0 },
      { enabled: !!selectedTicket },
    );
  const { data: charactersData, isLoading: isCharactersLoading } =
    api.char.getAll.useQuery();

  useEffect(() => {
    if (!!charactersData) setCharacters(charactersData);
  }, [charactersData]);

  const { mutate: newTicket, isPending: isNewTicketPending } =
    api.util.newTicket.useMutation();
  const { mutate: sendMessage, isPending } = api.util.sendMessage.useMutation();
  const { mutate: closeTicket, isPending: isCloseTicketPending } =
    api.util.closeTicket.useMutation();
  const { mutate: banCharacter, isPending: isBanPending } =
    api.util.banCharacter.useMutation();
  const { mutate: timeoutCharacter, isPending: isTimeoutPending } =
    api.util.timeoutCharacter.useMutation();

  const handleAddTicket = () => {
    newTicket(
      {
        characterId: char?.id ?? 0,
        content: newMessage,
        name: newName,
        isAdmin: true,
      },
      {
        onSuccess: (t) => {
          setNewMessage("");
          setNewName("");
          onClose();
          setSelectedTicket(t);
          setChar(t?.character);
          void refetchTickets();
        },
      },
    );
  };

  const handleSendMessage = () => {
    if (!selectedTicket) return;
    sendMessage(
      {
        ticketId: selectedTicket.id,
        content: newMessage,
        isAdmin: true,
      },
      {
        onSuccess: () => {
          onClose();
          setNewMessage("");
          void refetchMessages();
        },
      },
    );
  };

  const handleCloseTicket = () => {
    const confirmed = confirm("Вы уверены, что хотите закрыть заявку?");
    if (!confirmed) return;
    closeTicket(
      {
        ticketId: selectedTicket?.id ?? 0,
      },
      {
        onSuccess: (t) => {
          onClose();
          void refetchTickets();
          setSelectedTicket(t);
          setChar(t?.character);
        },
      },
    );
  };

  const handleBanCharacter = () => {
    if (!char) return;
    banCharacter(
      {
        id: char.id,
        reason: reason,
      },
      {
        onSuccess: () => {
          onBanClose();
          setReason("");
          void refetchTickets();
        },
      },
    );
  };

  const handleTimeoutCharacter = () => {
    if (!char) return;
    timeoutCharacter(
      {
        id: char.id,
        duration: duration,
        reason: reason,
        timeoutAt: new Date(),
      },
      {
        onSuccess: () => {
          onTimeoutClose();
          setDuration(1);
          setReason("");
          void refetchTickets();
        },
      },
    );
  };

  const formatDate = (date: Date) => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${day}/${month} ${hours}:${minutes}`;
  };

  const tooManyTickets =
    (tickets?.filter((t) => !t.isResolved).length ?? 0) >=
    (appData?.ticketsLimit ?? 0);

  if (isCharactersLoading) return <LoadingPage />;

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        isDismissable={false}
        isKeyboardDismissDisabled={true}
        size="full"
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
          <ModalHeader>
            {!selectedTicket ? "Новая заявка" : selectedTicket.name}
          </ModalHeader>
          <ModalBody>
            <div className="flex h-full w-full flex-col gap-2">
              <div
                className={`${
                  selectedTicket?.isResolved
                    ? "max-h-[calc(100vh-140px)]"
                    : "max-h-[calc(100vh-240px)]"
                } flex h-full w-full flex-col-reverse gap-2 overflow-y-auto`}
              >
                {messages?.map((m) => (
                  <div
                    key={m.id}
                    className="flex flex-col rounded-lg border-2 border-red-700/50 p-2"
                  >
                    <div className="flex w-full flex-row">
                      <div className="flex w-full flex-col text-sm">
                        <p className="flex w-full flex-col text-lg">
                          {m.isAdmin ? "Расссказчик:" : char?.name + ":"}
                        </p>
                        {m.content}
                      </div>
                      <div className="flex w-8 flex-col text-xs opacity-50">
                        {formatDate(m.createdAt)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {!selectedTicket && (
                <>
                  <Input
                    value={newName}
                    color="warning"
                    onChange={(e) => setNewName(e.target.value)}
                    variant="underlined"
                    label="Название заявки"
                    placeholder="Введите название заявки"
                  />
                </>
              )}
              {selectedTicket?.isResolved && (
                <p className="text-sm text-warning">Заявка закрыта</p>
              )}
            </div>
          </ModalBody>
          {!selectedTicket?.isResolved && (
            <ModalFooter className="flex flex-row items-center gap-2">
              <Textarea
                maxRows={3}
                color="warning"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(event) => {
                  if (event.ctrlKey && event.key === "Enter") {
                    event.preventDefault(); // Prevent default newline behavior
                    if (
                      !(
                        (tooManyTickets && !selectedTicket) ||
                        isNewTicketPending ||
                        isPending ||
                        !newMessage ||
                        (!newName && !selectedTicket)
                      )
                    ) {
                      if (!selectedTicket) handleAddTicket();
                      else handleSendMessage();
                    }
                  }
                }}
                variant="underlined"
                label="Сообщение"
                placeholder="Введите сообщение"
              />
              <div className="flex h-full flex-col gap-2">
                {!!selectedTicket && (
                  <Button
                    variant="light"
                    color="warning"
                    className="text-md h-full min-w-10 text-black dark:text-warning"
                    onClick={() => handleCloseTicket()}
                  >
                    {isCloseTicketPending ? (
                      <LoadingSpinner width={24} height={24} />
                    ) : (
                      <FaCheck size={24} />
                    )}
                  </Button>
                )}
                <Button
                  variant="light"
                  color="warning"
                  className="text-md h-full min-w-10 text-black dark:text-warning"
                  isDisabled={
                    isNewTicketPending ||
                    isPending ||
                    !newMessage ||
                    (!newName && !selectedTicket)
                  }
                  onClick={() =>
                    !!selectedTicket ? handleSendMessage() : handleAddTicket()
                  }
                >
                  {isNewTicketPending || isPending ? (
                    <LoadingSpinner width={24} height={24} />
                  ) : (
                    <MdSend size={24} />
                  )}
                </Button>
              </div>
            </ModalFooter>
          )}
        </ModalContent>
      </Modal>
      <Modal isOpen={isBanOpen} onClose={onBanClose}>
        <ModalContent>
          <ModalHeader>
            {char?.banned ? "Разблокировать" : "Заблокировать"} персонажа?
          </ModalHeader>
          <ModalBody>
            <p className="text-sm">
              Вы уверены, что хотите{" "}
              {char?.banned ? "разблокировать" : "заблокировать"} персонажа{" "}
              {char?.name}?
            </p>
            <Input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              label="Причина блокировки"
            />
          </ModalBody>
          <ModalFooter className="flex flex-row justify-between gap-2">
            <Button
              color="danger"
              onClick={() => {
                onBanClose();
                void refetchTickets();
              }}
            >
              Отменить
            </Button>
            <Button
              color="success"
              isDisabled={!reason || isBanPending}
              onClick={() => {
                handleBanCharacter();
              }}
            >
              Подтвердить
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Modal isOpen={isTimeoutOpen} onClose={onTimeoutClose}>
        <ModalContent>
          <ModalHeader>
            {char?.timeout ? "Отменить" : "Поставить на"} таймаут персонажа?
          </ModalHeader>
          <ModalBody>
            <p className="text-sm">
              Вы уверены, что хотите{" "}
              {char?.timeout ? "отменить" : "поставить на"} таймаут персонажа{" "}
              {char?.name}?
            </p>
            <Input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              label="Причина таймаута"
            />
            <Input
              type="number"
              value={duration.toString()}
              onChange={(e) =>
                setDuration(
                  Number(e.target.value) > 0 ? Number(e.target.value) : 0,
                )
              }
              label="Длительность таймаута в часах"
            />
          </ModalBody>
          <ModalFooter className="flex flex-row justify-between gap-2">
            <Button
              color="danger"
              onClick={() => {
                onTimeoutClose();
                void refetchTickets();
              }}
            >
              Отменить
            </Button>
            <Button
              color="success"
              isDisabled={!reason || isTimeoutPending}
              onClick={() => {
                handleTimeoutCharacter();
              }}
            >
              Подтвердить
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <div className="container flex flex-col gap-1 rounded-b-lg bg-white/75 p-2 dark:bg-red-950/50 sm:h-full">
        <div className="flex flex-row items-center justify-between gap-1 py-2">
          <Autocomplete
            size="md"
            variant="bordered"
            placeholder="Выберите персонажа"
            aria-label="characters"
            className="w-full rounded-sm"
            selectedKey={char ? char.id.toString() : undefined}
            onSelectionChange={(e) => {
              const charId = Number(e);
              const newChar = characters.find((c) => c.id === charId);
              setChar(newChar);
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
          <Button
            className="w-10 min-w-10 p-1"
            variant="solid"
            color="warning"
            onClick={() => {
              onTimeoutOpen();
              setReason(char?.timeoutReason ?? "");
              setDuration(char?.timeoutDuration ?? 0);
            }}
            isDisabled={!char || isTimeoutPending}
          >
            <FaStopwatch size={24} />
          </Button>
          <Button
            className="w-10 min-w-10 p-1"
            variant="solid"
            color="danger"
            isDisabled={!char || isBanPending}
            onClick={() => {
              onBanOpen();
              setReason(char?.bannedReason ?? "");
              setDuration(0);
            }}
          >
            <FaBan size={24} />
          </Button>
        </div>
        <Button
          variant="bordered"
          color="warning"
          isDisabled={!char}
          className={`h-10 min-h-10 w-full items-center gap-2 rounded-lg bg-red-950 p-2 md:hidden`}
          onClick={() => {
            setSelectedTicket(undefined);
            onOpen();
          }}
        >
          <p className="text-sm font-semibold">Новая заявка</p>
        </Button>
        <div className="flex h-full max-h-[calc(100vh-372px)] flex-row gap-2 pt-2 md:max-h-[calc(100vh-300px)]">
          <div className="flex w-full flex-col gap-2 overflow-y-auto md:hidden">
            {tickets
              ?.filter((t) => (!!char ? t.characterId === char?.id : true))
              .map((t) => (
                <Button
                  key={t.id}
                  variant="faded"
                  color="warning"
                  className={`h-10 min-h-10 justify-between gap-2 rounded-lg bg-red-950 p-2 transition hover:bg-red-900/75 hover:brightness-125 ${
                    t.id === selectedTicket?.id ? "bg-red-900/75" : ""
                  }`}
                  onClick={() => {
                    setSelectedTicket(t);
                    setChar(t?.character);
                    onOpen();
                  }}
                >
                  <p className="w-full truncate text-start text-sm">{t.name}</p>
                  {t.isResolved && <FaCheck size={16} />}
                  <p className="h-8 w-8 text-wrap text-xs opacity-50">
                    {formatDate(t.createdAt)}
                  </p>
                </Button>
              ))}
          </div>
          <div className="hidden max-h-[calc(100vh-206px)] w-80 flex-col gap-2 overflow-y-auto md:flex">
            <Button
              variant="bordered"
              color="warning"
              isDisabled={!char}
              className={`flex h-10 min-h-10 cursor-pointer flex-row items-center gap-2 rounded-lg bg-red-950 p-2 transition hover:bg-red-900/75 hover:brightness-125 ${
                !selectedTicket ? "bg-red-900/75" : ""
              }`}
              onClick={() => setSelectedTicket(undefined)}
            >
              <p className="text-sm font-semibold">Новая заявка</p>
            </Button>
            {tickets
              ?.filter((t) => (!!char ? t.characterId === char?.id : true))
              .map((t) => (
                <Button
                  key={t.id}
                  variant="faded"
                  color="warning"
                  className={`h-10 min-h-10 justify-between gap-2 rounded-lg bg-red-950 p-2 transition hover:bg-red-900/75 hover:brightness-125 ${
                    t.id === selectedTicket?.id ? "bg-red-900/75" : ""
                  }`}
                  onClick={() => {
                    setSelectedTicket(t);
                    setChar(t?.character);
                  }}
                >
                  <p className="w-full truncate text-start text-sm">{t.name}</p>
                  {t.isResolved && <FaCheck size={16} />}
                  <p className="h-8 w-8 text-wrap text-xs opacity-50">
                    {formatDate(t.createdAt)}
                  </p>
                </Button>
              ))}
          </div>
          <div className="hidden h-full w-full flex-col gap-2 md:flex">
            <div
              className={`${
                selectedTicket?.isResolved
                  ? "max-h-[calc(100vh-112px) sm:max-h-[calc(100vh-320px)]"
                  : "max-h-[calc(100vh-176px)] sm:max-h-[calc(100vh-400px)]"
              } flex h-full w-full flex-col-reverse gap-2 overflow-y-auto`}
            >
              {messages?.map((m) => (
                <div
                  key={m.id}
                  className="flex flex-col rounded-lg border-2 border-red-700/50 p-2"
                >
                  <div className="flex w-full flex-row">
                    <div className="flex w-full flex-col text-sm">
                      <p className="flex w-full flex-col text-lg">
                        {m.isAdmin ? "Расссказчик:" : char?.name + ":"}
                      </p>
                      {m.content}
                    </div>
                    <div className="flex w-8 flex-col text-xs opacity-50">
                      {formatDate(m.createdAt)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {!selectedTicket && (
              <>
                <Input
                  value={newName}
                  color="warning"
                  onChange={(e) => setNewName(e.target.value)}
                  variant="underlined"
                  label="Название заявки"
                  placeholder="Введите название заявки"
                />
              </>
            )}
            {selectedTicket?.isResolved && (
              <p className="text-sm text-danger dark:text-warning">
                Заявка закрыта
              </p>
            )}
            {!selectedTicket?.isResolved && (
              <div className="flex flex-row items-center gap-2">
                <Textarea
                  maxRows={3}
                  color="warning"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(event) => {
                    if (event.ctrlKey && event.key === "Enter") {
                      event.preventDefault(); // Prevent default newline behavior
                      if (
                        !(
                          (tooManyTickets && !selectedTicket) ||
                          isNewTicketPending ||
                          isPending ||
                          !newMessage ||
                          (!newName && !selectedTicket)
                        )
                      ) {
                        if (!selectedTicket) handleAddTicket();
                        else handleSendMessage();
                      }
                    }
                  }}
                  variant="underlined"
                  label="Сообщение"
                  placeholder="Введите сообщение"
                />
                <div className="flex h-full flex-col gap-2">
                  {!!selectedTicket && (
                    <Button
                      variant="light"
                      color="warning"
                      className="text-md h-full min-w-10 text-black dark:text-warning"
                      onClick={() => handleCloseTicket()}
                    >
                      {isCloseTicketPending ? (
                        <LoadingSpinner width={24} height={24} />
                      ) : (
                        <FaCheck size={24} />
                      )}
                    </Button>
                  )}
                  <Button
                    variant="light"
                    color="warning"
                    className="text-md h-full min-w-10 text-black dark:text-warning"
                    isDisabled={
                      isNewTicketPending ||
                      isPending ||
                      !newMessage ||
                      (!newName && !selectedTicket)
                    }
                    onClick={() =>
                      !!selectedTicket ? handleSendMessage() : handleAddTicket()
                    }
                  >
                    {isNewTicketPending || isPending ? (
                      <LoadingSpinner width={24} height={24} />
                    ) : (
                      <MdSend size={24} />
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}