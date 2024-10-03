import { useState, useEffect } from "react";
import { api } from "~/utils/api";
import { FaCheck } from "react-icons/fa";
import { MdSend, MdCancelScheduleSend, MdScheduleSend } from "react-icons/md";
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
} from "@nextui-org/react";
import { LoadingSpinner } from "../Loading";

export default function Tickets({ char }: { char: Character }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedTicket, setSelectedTicket] = useState<Ticket>();
  const [newMessage, setNewMessage] = useState<string>("");
  const [newName, setNewName] = useState<string>("");
  const [timeoutUntil, setTimeoutUntil] = useState<Date>();

  useEffect(() => {
    if (char.timeout && char.timeoutAt && char.timeoutDuration) {
      const until = new Date(
        char.timeoutAt.getTime() + char.timeoutDuration * 60 * 60 * 1000,
      );
      setTimeoutUntil(until > new Date() ? until : undefined);
    }
  }, [char]);

  const { data: appData } = api.util.getAppData.useQuery();
  const { data: tickets, refetch: refetchTickets } =
    api.util.getMyTickets.useQuery({
      characterId: char.id,
    });
  const { data: messages, refetch: refetchMessages } =
    api.util.getMessagesByTicketId.useQuery(
      { ticketId: selectedTicket?.id ?? 0 },
      { enabled: !!selectedTicket },
    );
  const { mutate: newTicket, isPending: isNewTicketPending } =
    api.util.newTicket.useMutation();
  const { mutate: sendMessage, isPending } = api.util.sendMessage.useMutation();
  const { mutate: closeTicket, isPending: isCloseTicketPending } =
    api.util.closeTicket.useMutation();

  const handleAddTicket = () => {
    newTicket(
      { characterId: char.id, content: newMessage, name: newName },
      {
        onSuccess: () => {
          setNewMessage("");
          setNewName("");
          onClose();
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
                  {tooManyTickets && (
                    <p className="text-sm text-danger dark:text-warning">
                      У вас не может быть больше {appData?.ticketsLimit ?? 0}{" "}
                      открытых заявок
                    </p>
                  )}
                </>
              )}
              {timeoutUntil && (
                <p className="text-sm text-danger dark:text-warning">
                  Вы не можете отправлять сообщения и создавать новые заявки до{" "}
                  {formatDate(timeoutUntil)} по следующей причине:
                  <br />
                  {char.timeoutReason ?? ""}
                </p>
              )}
              {char.banned && (
                <p className="text-sm text-danger dark:text-warning">
                  Вы не можете отправлять сообщения и создавать новые заявки по
                  следующей причине:
                  <br />
                  {char.bannedReason ?? ""}
                </p>
              )}
              {selectedTicket?.isResolved && (
                <p className="text-sm text-danger dark:text-warning">
                  Заявка закрыта
                </p>
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
                        (!newName && !selectedTicket) ||
                        !!timeoutUntil ||
                        char.banned
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
                    className="text-md h-full min-w-10 text-danger dark:text-warning"
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
                  className="text-md h-full min-w-10 text-danger dark:text-warning"
                  isDisabled={
                    (tooManyTickets && !selectedTicket) ||
                    isNewTicketPending ||
                    isPending ||
                    !newMessage ||
                    (!newName && !selectedTicket) ||
                    !!timeoutUntil ||
                    char.banned
                  }
                  onClick={() =>
                    !!selectedTicket ? handleSendMessage() : handleAddTicket()
                  }
                >
                  {isNewTicketPending || isPending ? (
                    <LoadingSpinner width={24} height={24} />
                  ) : !!timeoutUntil ? (
                    <MdScheduleSend size={24} />
                  ) : char.banned ? (
                    <MdCancelScheduleSend size={24} />
                  ) : (
                    <MdSend size={24} />
                  )}
                </Button>
              </div>
            </ModalFooter>
          )}
        </ModalContent>
      </Modal>
      <div className="flex h-full max-h-[calc(100vh-176px)] flex-row gap-2 py-2">
        <div className="flex w-full flex-col-reverse gap-2 overflow-y-auto md:hidden">
          <Button
            variant="bordered"
            color="warning"
            className={`h-10 min-h-10 w-full items-center gap-2 rounded-lg bg-red-950 p-2`}
            onClick={() => {
              setSelectedTicket(undefined);
              onOpen();
            }}
          >
            <p className="text-sm font-semibold">Новая заявка</p>
          </Button>
          {tickets
            ?.filter((t) => !t.isResolved)
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
          {tickets
            ?.filter((t) => t.isResolved)
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
        <div className="hidden max-h-[calc(100vh-296px)] w-80 flex-col gap-2 overflow-y-auto md:flex">
          <Button
            variant="bordered"
            color="warning"
            className={`flex h-10 min-h-10 cursor-pointer flex-row items-center gap-2 rounded-lg bg-red-950 p-2 transition hover:bg-red-900/75 hover:brightness-125 ${
              !selectedTicket ? "bg-red-900/75" : ""
            }`}
            onClick={() => setSelectedTicket(undefined)}
          >
            <p className="text-sm font-semibold">Новая заявка</p>
          </Button>
          {tickets
            ?.filter((t) => !t.isResolved)
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
                }}
              >
                <p className="w-full truncate text-start text-sm">{t.name}</p>
                {t.isResolved && <FaCheck size={16} />}
                <p className="h-8 w-8 text-wrap text-xs opacity-50">
                  {formatDate(t.createdAt)}
                </p>
              </Button>
            ))}
          {tickets
            ?.filter((t) => t.isResolved)
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
              {tooManyTickets && (
                <p className="text-sm text-danger dark:text-warning">
                  У вас не может быть больше {appData?.ticketsLimit ?? 0}{" "}
                  открытых заявок
                </p>
              )}
            </>
          )}
          {timeoutUntil && (
            <p className="text-sm text-danger dark:text-warning">
              Вы не можете отправлять сообщения и создавать новые заявки до{" "}
              {formatDate(timeoutUntil)} по следующей причине:
              <br />
              {char.timeoutReason ?? ""}
            </p>
          )}
          {char.banned && (
            <p className="text-sm text-danger dark:text-warning">
              Вы не можете отправлять сообщения и создавать новые заявки по
              следующей причине:
              <br />
              {char.bannedReason ?? ""}
            </p>
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
                        (!newName && !selectedTicket) ||
                        !!timeoutUntil ||
                        char.banned
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
                    className="text-md h-full min-w-10 text-danger dark:text-warning"
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
                  className="text-md h-full min-w-10 text-danger dark:text-warning"
                  isDisabled={
                    (tooManyTickets && !selectedTicket) ||
                    isNewTicketPending ||
                    isPending ||
                    !newMessage ||
                    (!newName && !selectedTicket) ||
                    !!timeoutUntil ||
                    char.banned
                  }
                  onClick={() =>
                    !!selectedTicket ? handleSendMessage() : handleAddTicket()
                  }
                >
                  {isNewTicketPending || isPending ? (
                    <LoadingSpinner width={24} height={24} />
                  ) : !!timeoutUntil ? (
                    <MdScheduleSend size={24} />
                  ) : char.banned ? (
                    <MdCancelScheduleSend size={24} />
                  ) : (
                    <MdSend size={24} />
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
