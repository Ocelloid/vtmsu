import { useState } from "react";
import { api } from "~/utils/api";

export default function Tickets() {
  const [selectedTicket, setSelectedTicket] = useState<number>();
  const [newMessage, setNewMessage] = useState<string>();

  const { data: tickets } = api.util.getAllTickets.useQuery();
  const { data: messages } = api.util.getMessagesByTicketId.useQuery(
    { ticketId: selectedTicket! },
    { enabled: !!selectedTicket },
  );

  return (
    <div className="flex h-full max-h-[calc(100vh-192px)] flex-row gap-2 py-2">
      <div className="hidden w-80 flex-col gap-2 md:flex">
        {tickets?.map((t) => (
          <div
            key={t.id}
            className={`flex flex-row items-center gap-2 p-2 hover:bg-red-950/50 dark:hover:bg-danger/50 ${
              t.id === selectedTicket ? "bg-red-950/50 dark:bg-danger/50" : ""
            }`}
            onClick={() => setSelectedTicket(t.id)}
          >
            <div className="flex flex-row items-center gap-2">
              <div className="flex flex-col">
                <div className="flex flex-row items-center gap-2">
                  <p className="w-full max-w-[80%] text-sm font-semibold">
                    {t.name}
                  </p>
                  <p className="w-full max-w-[20%] text-sm text-default-500">
                    {t.updatedAt?.toLocaleString()}
                  </p>
                </div>
                <p className="text-xs text-default-500">{t.character.name}</p>
                <p className="text-xs text-default-500">{t.player?.name}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex w-full flex-col gap-2"></div>
    </div>
  );
}
