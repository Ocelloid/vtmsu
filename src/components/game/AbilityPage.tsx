import Image from "next/image";
import { api } from "~/utils/api";
import { LoadingPage } from "~/components/Loading";
import { disciplines } from "~/assets";
import { Button } from "@nextui-org/react";

export default function AbilityPage({ characterId }: { characterId: number }) {
  const discKeys = Object.keys(disciplines);
  const discIcons = Object.values(disciplines).map((disc, i) => {
    return { value: disc, key: discKeys[i] };
  });
  const { data: char, refetch: refetchChar } = api.char.getById.useQuery({
    id: characterId,
  });
  const { mutate: applyAbility } = api.char.applyAbility.useMutation();

  const handleUseAbility = (id: number) => {
    if (!char) return;
    applyAbility(
      { id, charId: characterId },
      { onSuccess: () => void refetchChar() },
    );
  };

  if (!char) return <LoadingPage />;

  return (
    <div className="flex flex-col gap-4 py-2">
      <div className="flex flex-row flex-wrap gap-0">
        {char.abilities.map((a) => (
          <Button
            key={a.id + "_ability"}
            isDisabled={char.bloodAmount < a.abilitiy.cost + 1}
            onClick={() => handleUseAbility(a.abilitiy.id)}
            className="flex h-14 w-full min-w-80 flex-col items-start text-start sm:w-auto"
            variant="light"
            color="warning"
          >
            <div className="flex flex-row items-center gap-2 text-xl">
              <Image
                alt="disc"
                className="max-h-12 max-w-12"
                src={
                  !!a.abilitiy.icon
                    ? discIcons.find((di) => di.key === a.abilitiy.icon)
                        ?.value ?? ""
                    : ""
                }
                height={128}
                width={128}
              />{" "}
              <div className="flex flex-col">
                <p className="text-sm">{a.abilitiy.name}</p>
                <p className="text-xs">Стоимость: {a.abilitiy.cost}</p>
              </div>
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
}
