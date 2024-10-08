import { api } from "~/utils/api";
import { FaMinus, FaPlus } from "react-icons/fa";
import { GiHeartOrgan, GiDeathSkull } from "react-icons/gi";
import type { Character } from "~/server/api/routers/char";

export default function BloodMeter({
  char,
  refetch,
}: {
  char: Character;
  refetch: () => void;
}) {
  const { mutate: heal } = api.char.heal.useMutation();
  const { mutate: damage } = api.char.damage.useMutation();
  const { mutate: finalDeath } = api.char.finalDeath.useMutation();

  return (
    <div className="flex w-full flex-col gap-0 text-red-900 dark:text-red-700">
      <div className="flex w-full flex-row justify-between rounded-lg bg-red-200/50 p-2 transition-all dark:bg-red-950/50">
        {(char.health ?? 0) > 0 ? (
          <FaMinus
            size={20}
            className={"cursor-pointer"}
            onClick={() => {
              damage(
                { id: char.id, amount: 1 },
                { onSuccess: () => refetch() },
              );
            }}
          />
        ) : (
          <GiDeathSkull
            size={20}
            className={char.alive ? "cursor-pointer" : "opacity-10"}
            onClick={() => {
              if (!char.alive) return;
              const confirmed = confirm(
                "Вы уверены, что персонаж принял финальную смерть?",
              );
              if (!confirmed) return;
              finalDeath({ id: char.id }, { onSuccess: () => refetch() });
            }}
          />
        )}
        {Array.from({ length: 10 }).map((_, i) =>
          i < (char.health ?? 0) ? (
            <GiHeartOrgan size={20} key={i} />
          ) : (
            <GiHeartOrgan size={20} key={i} opacity={0.2} />
          ),
        )}
        <FaPlus
          size={20}
          className={
            char.health === 10 || (char.bloodAmount ?? 0) < 2
              ? "opacity-10"
              : "cursor-pointer"
          }
          onClick={() =>
            heal({ id: char.id, amount: 1 }, { onSuccess: () => refetch() })
          }
        />
      </div>
    </div>
  );
}
