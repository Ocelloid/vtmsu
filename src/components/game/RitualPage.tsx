import { api } from "~/utils/api";
import { LoadingPage } from "~/components/Loading";
import type { Character, Ritual } from "~/server/api/routers/char";
import { Button, Input } from "@nextui-org/react";
import { useState } from "react";

export default function RitualPage({
  char,
  refetch,
}: {
  char: Character;
  refetch: () => void;
}) {
  const [blood, setBlood] = useState<number>(1);
  const { mutate: spendBlood } = api.char.spendBlood.useMutation();

  const handleSpendBlood = () => {
    const confirmed = confirm(`Вы уверены, что хотите портатить ${blood} ПК?`);
    if (!confirmed) return;
    if (!char) return;
    spendBlood(
      { id: char.id, amount: blood },
      {
        onSuccess: (e) => {
          if (!!e.message) alert(e.message);
          void refetch();
        },
      },
    );
  };

  if (!char) return <LoadingPage />;
  return (
    <div className="flex flex-col gap-4 py-2">
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          size="sm"
          variant="underlined"
          label="Кровь"
          color="warning"
          value={blood.toString()}
          onChange={(e) =>
            setBlood(Number(e.target.value) > 1 ? Number(e.target.value) : 1)
          }
        />
        <Button
          onClick={handleSpendBlood}
          size="sm"
          variant="ghost"
          color="warning"
          className="sm:h-full"
        >
          Портатить кровь
        </Button>
      </div>
      {char.rituals?.map((a) => (
        <RitualSlot key={a.id + "_rituals"} ritual={a.ritual} />
      ))}
    </div>
  );
}

const RitualSlot = ({ ritual }: { ritual: Ritual | undefined }) => {
  return (
    <div className="flex w-full min-w-80 flex-col justify-center text-justify sm:w-auto">
      <p className="text-xl font-bold">{ritual?.name}</p>
      <p className="text-xs italic text-gray-500">
        {ritual?.ritualKnowledges?.map((a) => a.knowledge?.name).join(", ")}
      </p>
      <p className="pt-2 font-semibold">Рецепт:</p>
      <p className="text-justify">{ritual?.recipe}</p>
      <p className="pt-2 font-semibold">Результат:</p>
      <p className="text-justify">{ritual?.content}</p>
    </div>
  );
};
