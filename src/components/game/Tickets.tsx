import { useState } from "react";
import { api } from "~/utils/api";
import { FaCheck } from "react-icons/fa";
import { MdSend, MdCancelScheduleSend, MdScheduleSend } from "react-icons/md";
import type { Ticket } from "~/server/api/routers/util";
import type { Character } from "~/server/api/routers/char";
import { Button, Input, Textarea } from "@nextui-org/react";
import CartDrawer from "~/components/products/CartDrawer";
import { LoadingSpinner } from "../Loading";

export default function Tickets({ char }: { char: Character }) {
  const [selectedTicket, setSelectedTicket] = useState<Ticket>();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [newMessage, setNewMessage] = useState<string>("");
  const [newName, setNewName] = useState<string>("");

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

  const handleCartIconClick = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  return (
    <div className="flex h-full max-h-[calc(100vh-176px)] flex-row gap-2 py-2">
      <CartDrawer isOpen={isDrawerOpen} onCartIconClick={handleCartIconClick} />
      <div className="hidden w-80 flex-col gap-2 md:flex">
        <div
          className={`flex cursor-pointer flex-row items-center gap-2 rounded-lg p-2 transition hover:bg-red-900/25 hover:brightness-125 ${
            !selectedTicket ? "bg-red-900/75" : ""
          }`}
          onClick={() => setSelectedTicket(undefined)}
        >
          <p className="text-sm font-semibold">Новая заявка</p>
        </div>
        {tickets?.map((t) => (
          <div
            key={t.id}
            className={`flex cursor-pointer flex-row items-center gap-2 rounded-lg p-2 transition hover:bg-red-900/25 hover:brightness-125 ${
              t.id === selectedTicket?.id ? "bg-red-900/75" : ""
            }`}
            onClick={() => setSelectedTicket(t)}
          >
            <div className="flex flex-row items-center gap-2">
              <div className="flex flex-col">
                <p className="text-sm font-semibold">{t.name}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex h-full w-full flex-col gap-2">
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
              className="flex flex-row rounded-lg border-2 border-red-700/50 p-2"
            >
              <div className="flex w-full flex-col text-sm">{m.content}</div>
              <div className="flex w-8 flex-col text-xs opacity-50">
                {formatDate(m.createdAt)}
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
              <p className="text-sm text-warning">
                У вас не может быть больше {appData?.ticketsLimit ?? 0} открытых
                заявок
              </p>
            )}
          </>
        )}
        {char.timeout && (
          <p className="text-sm text-warning">
            Вы не можете отправлять сообщения и создавать новые заявки в течение{" "}
            {char.timeoutDuration ?? 0} часов по следующей причине:
            <br />
            {char.timeoutReason ?? ""}
          </p>
        )}
        {char.banned && (
          <p className="text-sm text-warning">
            Вы не можете отправлять сообщения и создавать новые заявки по
            следующей причине:
            <br />
            {char.bannedReason ?? ""}
          </p>
        )}
        {selectedTicket?.isResolved && (
          <p className="text-sm text-warning">Заявка разрешена</p>
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
                      char.timeout ||
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
                  (tooManyTickets && !selectedTicket) ||
                  isNewTicketPending ||
                  isPending ||
                  !newMessage ||
                  (!newName && !selectedTicket) ||
                  char.timeout ||
                  char.banned
                }
                onClick={() =>
                  !!selectedTicket ? handleSendMessage() : handleAddTicket()
                }
              >
                {isNewTicketPending || isPending ? (
                  <LoadingSpinner width={24} height={24} />
                ) : char.timeout ? (
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
  );
}
