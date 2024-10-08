import { api } from "~/utils/api";
import { FaMinus, FaPlus } from "react-icons/fa";
import { GiHeartOrgan, GiRestingVampire, GiDeathSkull } from "react-icons/gi";
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
        <FaMinus
          size={20}
          className={char.health === 0 ? "opacity-10" : "cursor-pointer"}
          onClick={() => {
            if (char.health === 0) {
              const confirmed = confirm(
                "Вы уверены, что персонаж принял финальную смерть?",
              );
              if (!confirmed) return;
              finalDeath({ id: char.id }, { onSuccess: () => refetch() });
            }
            damage({ id: char.id, amount: 1 }, { onSuccess: () => refetch() });
          }}
        />
        {Array.from({ length: 10 }).map((_, i) =>
          i < (char.health ?? 0) ? (
            <GiHeartOrgan size={20} key={i} />
          ) : (
            <GiDeathSkull size={20} key={i} />
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
      {char.health === 0 && (
        <div className="mx-auto -mt-8 mb-1 flex flex-row items-center gap-2 text-lg brightness-125">
          {char.alive ? (
            <>
              <GiRestingVampire size={20} />
              Торпор
              <GiRestingVampire size={20} />
            </>
          ) : (
            <>
              <GiDeathSkull size={20} />
              Погиб
              <GiDeathSkull size={20} />
            </>
          )}
        </div>
      )}
    </div>
  );
}
